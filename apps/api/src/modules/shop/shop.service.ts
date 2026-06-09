import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { ShopItemType } from '@prisma/client';
import type { CreateShopItemDto, UpdateShopItemDto, GetShopItemsDto, PurchaseDto } from './dto/shop.dto';

const PAGE_SIZE = 12;

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public ─────────────────────────────────────────────────────────────────

  async getItems(dto: GetShopItemsDto) {
    const page = dto.page ?? 1;
    const where = {
      isActive: true,
      ...(dto.type ? { type: dto.type } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.shopItem.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          type: true,
          serverId: true,
          imageUrl: true,
          sortOrder: true,
          _count: { select: { purchases: true } },
        },
      }),
      this.prisma.shopItem.count({ where }),
    ]);

    return {
      items: items.map((i) => ({ ...i, id: i.id.toString(), soldCount: i._count.purchases })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getItemById(itemId: bigint) {
    const item = await this.prisma.shopItem.findFirst({
      where: { id: itemId, isActive: true },
      include: { _count: { select: { purchases: true } } },
    });
    if (!item) throw new NotFoundException('Item không tồn tại');
    return { ...item, id: item.id.toString(), soldCount: item._count.purchases };
  }

  // ─── Purchase ────────────────────────────────────────────────────────────────

  async purchase(userId: bigint, dto: PurchaseDto) {
    const itemId = BigInt(dto.itemId);
    const quantity = dto.quantity ?? 1;

    const item = await this.prisma.shopItem.findFirst({
      where: { id: itemId, isActive: true },
    });
    if (!item) throw new NotFoundException('Item không tồn tại hoặc đã bị gỡ');

    const totalPrice = item.price * quantity;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, balance: true, status: true },
      });
      if (!user) throw new NotFoundException('User not found');
      if (user.status !== 'ACTIVE') throw new ForbiddenException('Tài khoản của bạn bị khóa');
      if (user.balance < totalPrice) {
        throw new BadRequestException(
          `Số dư không đủ. Cần ${totalPrice.toLocaleString()} xu, hiện có ${user.balance.toLocaleString()} xu`,
        );
      }

      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore - totalPrice;

      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          amount: -totalPrice,
          type: 'PURCHASE',
          reason: `Mua "${item.name}" x${quantity}`,
          balanceBefore,
          balanceAfter,
        },
      });

      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId,
          shopItemId: itemId,
          quantity,
          totalPrice,
          serverId: dto.serverId ?? item.serverId,
        },
        include: { shopItem: true },
      });

      return {
        message: `Mua thành công "${item.name}"`,
        purchase: {
          id: purchase.id.toString(),
          itemName: item.name,
          quantity,
          totalPrice,
          balanceAfter,
        },
      };
    });
  }

  // ─── Purchase history ─────────────────────────────────────────────────────

  async getMyPurchases(userId: bigint, page = 1) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          shopItem: {
            select: { id: true, name: true, type: true, imageUrl: true },
          },
        },
      }),
      this.prisma.purchase.count({ where: { userId } }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id.toString(),
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        serverId: p.serverId,
        deliveredAt: p.deliveredAt,
        createdAt: p.createdAt,
        item: p.shopItem
          ? { ...p.shopItem, id: p.shopItem.id.toString() }
          : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async adminGetAllItems(page = 1) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.shopItem.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { _count: { select: { purchases: true } } },
      }),
      this.prisma.shopItem.count(),
    ]);

    return {
      items: items.map((i) => ({
        ...i,
        id: i.id.toString(),
        soldCount: i._count.purchases,
      })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async adminCreateItem(dto: CreateShopItemDto) {
    const item = await this.prisma.shopItem.create({ data: dto });
    return { ...item, id: item.id.toString() };
  }

  async adminUpdateItem(itemId: bigint, dto: UpdateShopItemDto) {
    const existing = await this.prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!existing) throw new NotFoundException('Item không tồn tại');
    const updated = await this.prisma.shopItem.update({
      where: { id: itemId },
      data: dto,
    });
    return { ...updated, id: updated.id.toString() };
  }

  async adminDeleteItem(itemId: bigint) {
    const existing = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
      include: { _count: { select: { purchases: true } } },
    });
    if (!existing) throw new NotFoundException('Item không tồn tại');
    if (existing._count.purchases > 0) {
      // Soft-delete: just deactivate
      await this.prisma.shopItem.update({ where: { id: itemId }, data: { isActive: false } });
      return { message: 'Item đã được ẩn (có lịch sử mua)' };
    }
    await this.prisma.shopItem.delete({ where: { id: itemId } });
    return { message: 'Đã xóa item' };
  }
}
