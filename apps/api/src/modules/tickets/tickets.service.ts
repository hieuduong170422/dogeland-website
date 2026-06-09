import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  CreateMessageDto,
  CreateTicketDto,
  ListTicketsDto,
  UpdateTicketStatusDto,
} from './dto/ticket.dto';

const PAGE_SIZE = 20;

const AUTHOR_SELECT = {
  id: true,
  username: true,
  role: true,
  avatarUrl: true,
};

function serializeTicket(t: any) {
  return {
    ...t,
    id: t.id.toString(),
    userId: t.userId.toString(),
    user: t.user ? { ...t.user, id: t.user.id.toString() } : undefined,
    _count: t._count,
  };
}

function serializeMessage(m: any) {
  return {
    ...m,
    id: m.id.toString(),
    ticketId: m.ticketId.toString(),
    authorId: m.authorId.toString(),
    author: m.author ? { ...m.author, id: m.author.id.toString() } : undefined,
  };
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ─── User ─────────────────────────────────────────────────────────────────

  async createTicket(userId: bigint, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        title: dto.title,
        type: dto.type,
        messages: {
          create: { authorId: userId, content: dto.content },
        },
      },
      include: {
        user: { select: AUTHOR_SELECT },
        _count: { select: { messages: true } },
      },
    });
    return serializeTicket(ticket);
  }

  async getMyTickets(userId: bigint, query: ListTicketsDto) {
    const { page = 1, status, type } = query;
    const where = {
      userId,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      tickets: tickets.map(serializeTicket),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async getTicket(ticketId: bigint, userId: bigint, role: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: AUTHOR_SELECT },
        _count: { select: { messages: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket không tồn tại');

    const isOwner = ticket.userId === userId;
    const isStaff = role === 'ADMIN' || role === 'MODERATOR';
    if (!isOwner && !isStaff) throw new ForbiddenException('Không có quyền xem ticket này');

    return serializeTicket(ticket);
  }

  async getMessages(ticketId: bigint, userId: bigint, role: string) {
    await this.getTicket(ticketId, userId, role); // access check

    const messages = await this.prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: AUTHOR_SELECT } },
    });
    return messages.map(serializeMessage);
  }

  async sendMessage(ticketId: bigint, userId: bigint, role: string, dto: CreateMessageDto) {
    const ticket = await this.getTicket(ticketId, userId, role); // access check

    if (ticket.status === 'CLOSED' && role !== 'ADMIN' && role !== 'MODERATOR') {
      throw new ForbiddenException('Ticket đã đóng — chỉ BTC có thể trả lời');
    }

    // Reopen if staff replies to closed ticket
    if (ticket.status === 'CLOSED' && (role === 'ADMIN' || role === 'MODERATOR')) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'OPEN', closedAt: null },
      });
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    const message = await this.prisma.ticketMessage.create({
      data: { ticketId, authorId: userId, content: dto.content },
      include: { author: { select: AUTHOR_SELECT } },
    });

    // Notify ticket owner when staff replies
    const isStaffReply = role === 'ADMIN' || role === 'MODERATOR';
    const rawTicket = await this.prisma.ticket.findUnique({ where: { id: ticketId }, select: { userId: true, title: true } });
    if (isStaffReply && rawTicket && rawTicket.userId !== userId) {
      const notif = await this.notificationsService.create(
        rawTicket.userId,
        'SYSTEM',
        'BTC đã phản hồi ticket của bạn',
        `Ticket "${rawTicket.title}" có phản hồi mới`,
        { ticketId: ticketId.toString() },
      );
      this.notificationsGateway.emitToUser(rawTicket.userId.toString(), 'notification', notif);
    }

    return serializeMessage(message);
  }

  async updateStatus(ticketId: bigint, userId: bigint, role: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket không tồn tại');

    const isOwner = ticket.userId === userId;
    const isStaff = role === 'ADMIN' || role === 'MODERATOR';

    // Owners can only close their own tickets; staff can open/close any
    if (!isOwner && !isStaff) throw new ForbiddenException('Không có quyền');
    if (isOwner && !isStaff && dto.status === 'OPEN') {
      throw new ForbiddenException('Chỉ BTC mới có thể mở lại ticket');
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        closedAt: dto.status === 'CLOSED' ? new Date() : null,
      },
    });
    return serializeTicket(updated);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminListTickets(query: ListTicketsDto) {
    const { page = 1, status, type } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          user: { select: AUTHOR_SELECT },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      tickets: tickets.map(serializeTicket),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }
}
