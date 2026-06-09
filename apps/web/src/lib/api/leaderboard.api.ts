import { apiClient } from './client';

export type GameMode = 'survival' | 'skyblock' | 'bedwars' | 'minigames' | 'global';
export type Period = 'weekly' | 'monthly' | 'alltime';

export interface LeaderboardEntry {
  username: string;
  gameMode: string;
  statKey: string;
  value: number;
  rank: number;
  updatedAt: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
  gameMode: GameMode;
  period: Period;
}

export const leaderboardApi = {
  getLeaderboard: (gameMode: GameMode = 'global', period: Period = 'alltime', page = 1) =>
    apiClient.get<LeaderboardResponse>('/leaderboard', { params: { gameMode, period, page } }).then((r) => r.data),

  getPlayerRank: (username: string, gameMode?: GameMode, period?: Period) =>
    apiClient.get(`/leaderboard/player/${username}`, { params: { gameMode, period } }).then((r) => r.data),
};
