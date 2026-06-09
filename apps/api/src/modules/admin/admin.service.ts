import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import {
  AdminUsersQueryDto,
  BanUserDto,
  ChangeRoleDto,
  CreateGiftCodeDto,
  AdminAuditLogsQueryDto,
  AdjustBalanceDto,
} from './dto/admin.dto';

const PAGE_SIZE = 20;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Stats ──────────────────────────────────────────────────────────────────

  async getStats() {
    const [totalUsers, activeUsers, openTickets, totalTransactions, newUsersThisWeek] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null, status: UserStatus.ACTIVE } }),
        this.prisma.ticket.count({ where: { status: 'OPEN' } }),
        this.prisma.transaction.count(),
        this.prisma.user.count({
          where: {
            deletedAt: null,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    return { totalUsers, activeUsers, openTickets, totalTransactions, newUsersThisWeek };
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async getUsers(query: AdminUsersQueryDto) {
    const { search, page = 1, status, role } = query;
    const skip = (page - 1) * PAGE_SIZE;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (role) where.role = role;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          balance: true,
          banReason: true,
          banExpiresAt: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({ ...u, id: u.id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async banUser(targetId: string, dto: BanUserDto, adminId: bigint, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(targetId) } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    if (user.role === UserRole.ADMIN) throw new BadRequestException('Không thể ban Admin');

    const updated = await this.prisma.user.update({
      where: { id: BigInt(targetId) },
      data: {
        status: dto.ban ? UserStatus.BANNED : UserStatus.ACTIVE,
        banReason: dto.ban ? (dto.reason ?? null) : null,
        banExpiresAt: null,
      },
      select: { id: true, username: true, status: true, banReason: true },
    });

    await this.audit(adminId, dto.ban ? 'user.ban' : 'user.unban', 'User', targetId, {
      username: user.username,
      reason: dto.reason,
    }, ip);

    return { ...updated, id: updated.id.toString() };
  }

  async changeRole(targetId: string, dto: ChangeRoleDto, adminId: bigint, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(targetId) } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const updated = await this.prisma.user.update({
      where: { id: BigInt(targetId) },
      data: { role: dto.role },
      select: { id: true, username: true, role: true },
    });

    await this.audit(adminId, 'user.role_change', 'User', targetId, {
      username: user.username,
      from: user.role,
      to: dto.role,
    }, ip);

    return { ...updated, id: updated.id.toString() };
  }

  async adjustBalance(targetId: string, dto: AdjustBalanceDto, adminId: bigint, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(targetId) } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const newBalance = user.balance + dto.amount;
    if (newBalance < 0) throw new BadRequestException('Số dư không đủ');

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: BigInt(targetId) },
        data: { balance: newBalance },
        select: { id: true, username: true, balance: true },
      }),
      this.prisma.transaction.create({
        data: {
          userId: BigInt(targetId),
          type: dto.amount > 0 ? 'REWARD' : 'WITHDRAWAL',
          amount: Math.abs(dto.amount),
          reason: dto.reason,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
        },
      }),
    ]);

    await this.audit(adminId, 'economy.adjust', 'User', targetId, {
      username: user.username,
      amount: dto.amount,
      reason: dto.reason,
    }, ip);

    return { ...updated, id: updated.id.toString() };
  }

  // ─── Gift Codes ──────────────────────────────────────────────────────────────

  async getGiftCodes(page = 1) {
    const skip = (page - 1) * PAGE_SIZE;

    const [codes, total] = await this.prisma.$transaction([
      this.prisma.giftCode.findMany({
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { redemptions: true } } },
      }),
      this.prisma.giftCode.count(),
    ]);

    return {
      codes: codes.map((c) => ({ ...c, id: c.id.toString(), createdById: c.createdById?.toString() ?? null })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async createGiftCode(dto: CreateGiftCodeDto, adminId: bigint, ip: string) {
    const exists = await this.prisma.giftCode.findUnique({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('Mã đã tồn tại');

    const code = await this.prisma.giftCode.create({
      data: {
        code: dto.code.toUpperCase(),
        amount: dto.amount,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById: adminId,
      },
    });

    await this.audit(adminId, 'giftcode.create', 'GiftCode', code.id.toString(), {
      code: dto.code,
      amount: dto.amount,
      maxUses: dto.maxUses,
    }, ip);

    return { ...code, id: code.id.toString(), createdById: code.createdById?.toString() ?? null };
  }

  async deleteGiftCode(codeId: string, adminId: bigint, ip: string) {
    const code = await this.prisma.giftCode.findUnique({ where: { id: BigInt(codeId) } });
    if (!code) throw new NotFoundException('Mã không tồn tại');
    if (code.usedCount > 0) throw new BadRequestException('Không thể xóa mã đã được sử dụng');

    await this.prisma.giftCode.delete({ where: { id: BigInt(codeId) } });
    await this.audit(adminId, 'giftcode.delete', 'GiftCode', codeId, { code: code.code }, ip);

    return { success: true };
  }

  // ─── Audit Logs ──────────────────────────────────────────────────────────────

  async getAuditLogs(query: AdminAuditLogsQueryDto) {
    const { page = 1, action, userId } = query;
    const skip = (page - 1) * PAGE_SIZE;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (userId) where.userId = BigInt(userId);

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((l) => ({
        ...l,
        id: l.id.toString(),
        userId: l.userId?.toString() ?? null,
        user: l.user ? { ...l.user, id: l.user.id.toString() } : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  private async audit(
    adminId: bigint,
    action: string,
    resourceType: string,
    resourceId: string,
    data: Record<string, any>,
    ip: string,
  ) {
    await this.prisma.auditLog.create({
      data: { userId: adminId, action, resourceType, resourceId, data, ipAddress: ip },
    });
  }
}
