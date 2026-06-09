import { apiClient } from './client';

export interface PlayerProfile {
  id: string;
  username: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
  lastSeen: string | null;
  twoFactorEnabled: boolean;
}

export const playersApi = {
  getProfile: (username: string) =>
    apiClient.get<PlayerProfile>(`/players/${username}`).then((r) => r.data),

  search: (query: string) =>
    apiClient
      .get<Pick<PlayerProfile, 'id' | 'username' | 'role' | 'avatarUrl'>[]>('/players/search', { params: { q: query } })
      .then((r) => r.data),
};
