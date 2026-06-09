import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService, UpdateProfileDto, ChangePasswordDto } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.getProfile(BigInt(user.sub));
  }

  @Patch('me/profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(BigInt(user.sub), dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(BigInt(user.sub), dto);
  }
}
