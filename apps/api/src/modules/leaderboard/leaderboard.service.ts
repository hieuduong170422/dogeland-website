import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma/prisma.service';

export const GAME_MODES = ['survival', 'skyblock', 'bedwars', 'minigames', 'global'] as const;
export type GameMode = typeof GAME_MODES[number];

export const PERIODS = ['weekly', 'monthly', 'alltime'] as const;
export type Period = typeof PERIODS[number];

const PAGE_SIZE = 50;

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(gameMode: GameMode = 'global', period: Period = 'alltime', page = 1) {
    const skip = (page - 1) * PAGE_SIZE;

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.leaderboardEntry.findMany({
        where: { gameMode, period },
        orderBy: { rank: 'asc' },
        skip,
        take: PAGE_SIZE,
        select: {
          username: true,
          gameMode: true,
          statKey: true,
          value: true,
          rank: true,
          updatedAt: true,
        },
      }),
      this.prisma.leaderboardEntry.count({ where: { gameMode, period } }),
    ]);

    return {
      entries: entries.map((e) => ({
        ...e,
        value: Number(e.value),
        rank: (page - 1) * PAGE_SIZE + entries.indexOf(e) + 1,
      })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      gameMode,
      period,
    };
  }

  async getPlayerRank(username: string, gameMode: GameMode = 'global', period: Period = 'alltime') {
    const entry = await this.prisma.leaderboardEntry.findFirst({
      where: { username, gameMode, period },
      select: { rank: true, statKey: true, value: true, gameMode: true, period: true },
    });
    if (!entry) return null;
    return { ...entry, value: Number(entry.value) };
  }

  // Upsert entry — called by sync job hoặc admin
  async upsertEntry(data: {
    username: string;
    gameMode: string;
    statKey: string;
    value: number;
    period: string;
  }) {
    // Tính rank sau khi upsert
    await this.prisma.leaderboardEntry.upsert({
      where: {
        username_gameMode_statKey_period: {
          username: data.username,
          gameMode: data.gameMode,
          statKey: data.statKey,
          period: data.period,
        },
      },
      create: { ...data, rank: 0 },
      update: { value: data.value },
    });

    // Recalculate ranks for this leaderboard
    await this.recalculateRanks(data.gameMode, data.statKey, data.period);
  }

  private async recalculateRanks(gameMode: string, statKey: string, period: string) {
    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { gameMode, statKey, period },
      orderBy: { value: 'desc' },
      select: { id: true },
    });

    await this.prisma.$transaction(
      entries.map((e, i) =>
        this.prisma.leaderboardEntry.update({ where: { id: e.id }, data: { rank: i + 1 } }),
      ),
    );
  }

  async seedDemoData() {
    const players = ['testplayer', 'SteveBuilder', 'CreeperKiller', 'DiamondMiner', 'NetherRunner'];
    const gameModes: GameMode[] = ['survival', 'skyblock', 'bedwars', 'global'];
    const periods: Period[] = ['weekly', 'monthly', 'alltime'];

    for (const gm of gameModes) {
      for (const period of periods) {
        const statKey = gm === 'bedwars' ? 'wins' : gm === 'skyblock' ? 'island_level' : 'playtime';
        for (let i = 0; i < players.length; i++) {
          const baseVal = (players.length - i) * 1000 + Math.floor(Math.random() * 500);
          await this.upsertEntry({ username: players[i], gameMode: gm, statKey, value: baseVal, period });
        }
      }
    }
    return { message: 'Demo data seeded' };
  }
}
