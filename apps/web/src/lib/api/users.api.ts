import { apiClient } from './client';

export interface UpdateProfilePayload {
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserSettings {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  discordId: string | null;
  isVerified: boolean;
  createdAt: string;
}

export const usersApi = {
  getMe: () =>
    apiClient.get<UserSettings>('/users/me').then((r) => r.data),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.patch<UserSettings>('/users/me/profile', data).then((r) => r.data),

  changePassword: (data: ChangePasswordPayload) =>
    apiClient.patch<{ message: string }>('/users/me/password', data).then((r) => r.data),
};
