import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTotpDto } from './dto/totp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ─── Public endpoints ─────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';
    return this.auth.login(dto, res, ip, userAgent);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  // ─── Refresh (cookie-based) ────────────────────────────────────────────────

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @CurrentUser() user: { sub: string; username: string; role: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.refresh(user.refreshToken, user.sub, res);
  }

  // ─── Authenticated endpoints ───────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['refresh_token'] ?? '';
    return this.auth.logout(token, res);
  }

  @Get('me')
  getMe(@CurrentUser() user: { id: bigint }) {
    return this.auth.getMe(user.id.toString());
  }

  // ─── 2FA TOTP ─────────────────────────────────────────────────────────────────

  @Post('2fa/setup')
  setup2FA(@CurrentUser() user: { id: bigint; username: string }) {
    return this.auth.setupTotp(user.id, user.username);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  enable2FA(@CurrentUser() user: { id: bigint }, @Body() dto: VerifyTotpDto) {
    return this.auth.enableTotp(user.id, dto);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  disable2FA(@CurrentUser() user: { id: bigint }) {
    return this.auth.disableTotp(user.id);
  }
}
