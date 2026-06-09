import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import {
  AdminUsersQueryDto,
  BanUserDto,
  ChangeRoleDto,
  CreateGiftCodeDto,
  AdminAuditLogsQueryDto,
  AdminGiftCodesQueryDto,
  AdjustBalanceDto,
} from './dto/admin.dto';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/ban')
  banUser(
    @Param('id') id: string,
    @Body() dto: BanUserDto,
    @CurrentUser() user: { id: bigint },
    @Ip() ip: string,
  ) {
    return this.adminService.banUser(id, dto, user.id, ip);
  }

  @Patch('users/:id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() user: { id: bigint },
    @Ip() ip: string,
  ) {
    return this.adminService.changeRole(id, dto, user.id, ip);
  }

  @Patch('users/:id/balance')
  adjustBalance(
    @Param('id') id: string,
    @Body() dto: AdjustBalanceDto,
    @CurrentUser() user: { id: bigint },
    @Ip() ip: string,
  ) {
    return this.adminService.adjustBalance(id, dto, user.id, ip);
  }

  // ─── Gift Codes ──────────────────────────────────────────────────────────────

  @Get('giftcodes')
  getGiftCodes(@Query() query: AdminGiftCodesQueryDto) {
    return this.adminService.getGiftCodes(query.page);
  }

  @Post('giftcodes')
  createGiftCode(
    @Body() dto: CreateGiftCodeDto,
    @CurrentUser() user: { id: bigint },
    @Ip() ip: string,
  ) {
    return this.adminService.createGiftCode(dto, user.id, ip);
  }

  @Delete('giftcodes/:id')
  deleteGiftCode(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint },
    @Ip() ip: string,
  ) {
    return this.adminService.deleteGiftCode(id, user.id, ip);
  }

  // ─── Audit Logs ──────────────────────────────────────────────────────────────

  @Get('audit-logs')
  getAuditLogs(@Query() query: AdminAuditLogsQueryDto) {
    return this.adminService.getAuditLogs(query);
  }
}
