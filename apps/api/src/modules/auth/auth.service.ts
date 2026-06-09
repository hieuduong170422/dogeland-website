import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { EmailService } from './email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateTotpDto, VerifyTotpDto } from './dto/totp.dto';
import { Response } from 'express';

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

const REFRESH_COOKIE_OPTIONS = (rememberMe: boolean, isProd: boolean) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
});

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly isProd: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {
    this.isProd = config.get('app.nodeEnv') === 'production';
  }

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing?.email === dto.email) throw new ConflictException('Email đã được sử dụng');
    if (existing?.username === dto.username) throw new ConflictException('Username đã tồn tại');

    const passwordHash = await argon2.hash(dto.password, ARGON2_OPTIONS);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        isVerified: !this.isProd,
      },
    });

    if (this.isProd) {
      await this.sendVerificationEmail(user.id, user.email, user.username);
    }

    this.logger.log(`Registered: ${user.username}`);
    return {
      message: this.isProd
        ? 'Đăng ký thành công. Kiểm tra email để xác minh tài khoản.'
        : 'Đăng ký thành công. Bạn có thể đăng nhập ngay.',
    };
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response, ip: string, userAgent: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.login }, { username: dto.login }],
        deletedAt: null,
      },
      include: { twoFactor: true },
    });

    if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

    if (user.status === 'BANNED') {
      const reason = user.banReason ? ` Lý do: ${user.banReason}` : '';
      throw new UnauthorizedException(`Tài khoản bị khóa.${reason}`);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Vui lòng xác minh email trước khi đăng nhập');
    }

    // 2FA check
    if (user.twoFactor?.enabled) {
      if (!dto.totpCode) {
        return { requires2FA: true };
      }
      const ok = await this.validateTotp(user.id, { code: dto.totpCode });
      if (!ok) throw new UnauthorizedException('Mã 2FA không đúng');
    }

    return this.issueTokens(user, res, !!dto.rememberMe, ip, userAgent);
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  async refresh(refreshToken: string, userId: string, res: Response) {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken, userId: BigInt(userId), expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

    // Rotate: xóa session cũ, tạo session mới
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.user, res, session.rememberMe, null, null);
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(refreshToken: string, res: Response) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Đăng xuất thành công' };
  }

  // ─── Email Verification ───────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { token, type: 'verify_email', usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new BadRequestException('Link xác minh không hợp lệ hoặc đã hết hạn');

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
    ]);

    return { message: 'Xác minh email thành công. Bạn có thể đăng nhập.' };
  }

  // ─── Forgot / Reset Password ──────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.login }, { username: dto.login }], deletedAt: null },
    });

    // Luôn trả về success để tránh user enumeration
    if (!user) return { message: 'Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi.' };

    // Rate limit: chỉ gửi 1 email mỗi 1 giờ
    const recent = await this.prisma.emailVerification.findFirst({
      where: { userId: user.id, type: 'reset_password', createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent) return { message: 'Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi.' };

    const token = uuidv4();
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        type: 'reset_password',
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 giờ
      },
    });

    await this.email.sendPasswordReset(user.email, user.username, token);
    this.logger.log(`Password reset requested: ${user.username}`);
    return { message: 'Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { token: dto.token, type: 'reset_password', usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new BadRequestException('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');

    const passwordHash = await argon2.hash(dto.newPassword, ARGON2_OPTIONS);
    await this.prisma.$transaction([
      this.prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      // Revoke all sessions
      this.prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  // ─── 2FA TOTP ─────────────────────────────────────────────────────────────────

  async setupTotp(userId: bigint, username: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(username, 'Dogeland', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    return { secret, qrCode, backupCodes };
  }

  async enableTotp(userId: bigint, dto: VerifyTotpDto) {
    const valid = authenticator.verify({ token: dto.code, secret: dto.secret });
    if (!valid) throw new BadRequestException('Mã xác minh không đúng');

    const hashedCodes = await Promise.all(
      (dto as any).backupCodes?.map((c: string) => argon2.hash(c, ARGON2_OPTIONS)) ?? [],
    );

    await this.prisma.twoFactor.upsert({
      where: { userId },
      create: { userId, secret: dto.secret, enabled: true, backupCodes: hashedCodes },
      update: { secret: dto.secret, enabled: true, backupCodes: hashedCodes },
    });

    return { message: '2FA đã được bật thành công' };
  }

  async disableTotp(userId: bigint) {
    await this.prisma.twoFactor.update({ where: { userId }, data: { enabled: false } });
    return { message: '2FA đã được tắt' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async validateTotp(userId: bigint, dto: ValidateTotpDto): Promise<boolean> {
    const tf = await this.prisma.twoFactor.findUnique({ where: { userId } });
    if (!tf?.enabled) return true;

    // Thử TOTP code trước
    if (dto.code.length === 6) {
      return authenticator.verify({ token: dto.code, secret: tf.secret });
    }

    // Thử backup codes
    for (let i = 0; i < tf.backupCodes.length; i++) {
      const match = await argon2.verify(tf.backupCodes[i], dto.code);
      if (match) {
        const updated = tf.backupCodes.filter((_, idx) => idx !== i);
        await this.prisma.twoFactor.update({ where: { userId }, data: { backupCodes: updated } });
        return true;
      }
    }
    return false;
  }

  private async issueTokens(
    user: { id: bigint; username: string; role: UserRole },
    res: Response,
    rememberMe: boolean,
    ip: string | null,
    userAgent: string | null,
  ) {
    const payload = { sub: user.id.toString(), username: user.username, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('auth.jwtSecret'),
      expiresIn: this.config.get('auth.jwtExpiresIn'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('auth.refreshSecret'),
      expiresIn: rememberMe ? '10d' : this.config.get('auth.refreshExpiresIn'),
    });

    const expiresAt = new Date(
      Date.now() + (rememberMe ? 10 : 7) * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.create({
      data: { userId: user.id, refreshToken, rememberMe, expiresAt, ipAddress: ip, userAgent },
    });

    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS(rememberMe, this.isProd));

    return {
      accessToken,
      user: { id: user.id.toString(), username: user.username, role: user.role },
    };
  }

  private async sendVerificationEmail(userId: bigint, userEmail: string, username: string) {
    const token = uuidv4();
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        type: 'verify_email',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await this.email.sendVerification(userEmail, username, token);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
      select: {
        id: true, username: true, email: true, role: true,
        status: true, balance: true, avatarUrl: true,
        isVerified: true, createdAt: true,
        twoFactor: { select: { enabled: true } },
      },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return { ...user, id: user.id.toString(), twoFactorEnabled: user.twoFactor?.enabled ?? false };
  }
}
