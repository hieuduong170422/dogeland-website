import { apiClient } from './client';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  openTickets: number;
  totalTransactions: number;
  newUsersThisWeek: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'PLAYER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'MUTED';
  balance: number;
  banReason: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  _count: { redemptions: number };
}

export interface GiftCodesResponse {
  codes: GiftCode[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user: { id: string; username: string; role: string } | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  data: any;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminStats>('/admin/stats').then((r) => r.data),

  // Users
  getUsers: (params?: { search?: string; page?: number; status?: string; role?: string }) =>
    apiClient.get<AdminUsersResponse>('/admin/users', { params }).then((r) => r.data),

  banUser: (id: string, ban: boolean, reason?: string) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/ban`, { ban, reason }).then((r) => r.data),

  changeRole: (id: string, role: string) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  adjustBalance: (id: string, amount: number, reason: string) =>
    apiClient.patch(`/admin/users/${id}/balance`, { amount, reason }).then((r) => r.data),

  // Gift codes
  getGiftCodes: (page = 1) =>
    apiClient.get<GiftCodesResponse>('/admin/giftcodes', { params: { page } }).then((r) => r.data),

  createGiftCode: (data: { code: string; amount: number; maxUses: number; expiresAt?: string }) =>
    apiClient.post<GiftCode>('/admin/giftcodes', data).then((r) => r.data),

  deleteGiftCode: (id: string) =>
    apiClient.delete(`/admin/giftcodes/${id}`).then((r) => r.data),

  // Audit logs
  getAuditLogs: (params?: { page?: number; action?: string; userId?: string }) =>
    apiClient.get<AuditLogsResponse>('/admin/audit-logs', { params }).then((r) => r.data),
};
