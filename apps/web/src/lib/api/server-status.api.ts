import { apiClient } from './client';

export interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
    sample: { name: string; uuid: string }[];
  };
  motd: string;
  version: string;
  tps: number;
  uptime: number;
  ping: number;
  updatedAt: string;
}

export interface PlayerHistoryPoint {
  time: string;
  players: number;
}

export const serverStatusApi = {
  getStatus: () =>
    apiClient.get<ServerStatusData>('/server-status').then((r) => r.data),

  getHistory: () =>
    apiClient.get<PlayerHistoryPoint[]>('/server-status/history').then((r) => r.data),
};
