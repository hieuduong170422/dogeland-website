import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        balance: true,
        twoFactor: { select: { enabled: true } },
      },
    });
    if (!user) throw new NotFoundException('Người chơi không tồn tại');

    // Lấy AuthMe sync để biết last seen
    const authMeRecord = await this.prisma.authMeSync.findFirst({
      where: { username },
      select: { lastLogin: true, lastSynced: true },
    });

    return {
      id: user.id.toString(),
      username: user.username,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      lastSeen: authMeRecord?.lastLogin ?? null,
      twoFactorEnabled: user.twoFactor?.enabled ?? false,
    };
  }

  async getLeaderboardRank(username: string, gameMode?: string) {
    const entry = await this.prisma.leaderboardEntry.findFirst({
      where: { username, ...(gameMode ? { gameMode } : {}), period: 'alltime' },
      orderBy: { rank: 'asc' },
      select: { rank: true, statKey: true, value: true, gameMode: true },
    });
    return entry ?? null;
  }

  async searchPlayers(query: string, limit = 10) {
    if (query.length < 2) return [];
    const results = await this.prisma.user.findMany({
      where: {
        username: { contains: query, mode: 'insensitive' },
        deletedAt: null,
        status: { not: 'BANNED' },
      },
      select: { id: true, username: true, role: true, avatarUrl: true },
      take: limit,
    });
    return results.map((r) => ({ ...r, id: r.id.toString() }));
  }
}
