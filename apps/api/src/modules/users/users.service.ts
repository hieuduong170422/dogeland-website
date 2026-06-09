import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import * as argon2 from '@node-rs/argon2';

export interface UpdateProfileDto {
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: dto.avatarUrl },
      select: {
        id: true, username: true, email: true, role: true,
        status: true, balance: true, avatarUrl: true,
        isVerified: true, discordId: true, createdAt: true,
      },
    });
    return { ...user, id: user.id.toString() };
  }

  async changePassword(userId: bigint, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, email: true, role: true,
        status: true, balance: true, avatarUrl: true,
        isVerified: true, discordId: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, id: user.id.toString() };
  }
}
