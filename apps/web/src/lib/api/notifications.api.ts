import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, any> | null;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export const notificationsApi = {
  getNotifications: (page = 1) =>
    apiClient.get<NotificationsResponse>('/notifications', { params: { page } }).then((r) => r.data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data),
};
