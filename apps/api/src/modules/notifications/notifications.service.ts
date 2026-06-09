import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma/prisma.service';

const PAGE_SIZE = 20;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: bigint, type: NotificationType, title: string, message: string, data?: Record<string, any>) {
    const notif = await this.prisma.notification.create({
      data: { userId, type, title, message, data: data ?? {} },
    });
    return { ...notif, id: notif.id.toString(), userId: notif.userId.toString() };
  }

  async getForUser(userId: bigint, page = 1) {
    const skip = (page - 1) * PAGE_SIZE;

    const [items, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: PAGE_SIZE,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items: items.map((n) => ({ ...n, id: n.id.toString(), userId: n.userId.toString() })),
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getUnreadCount(userId: bigint) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markRead(id: bigint, userId: bigint) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(userId: bigint) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: count };
  }
}
