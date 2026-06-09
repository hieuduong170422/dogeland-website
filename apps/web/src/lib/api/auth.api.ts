import { apiClient } from './client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<UserProfile, 'id' | 'username' | 'role'>;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  login: string;
  password: string;
  rememberMe?: boolean;
  totpCode?: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<{ message: string }>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse | { requires2FA: true }>('/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post<{ message: string }>('/auth/logout').then((r) => r.data),

  refresh: () =>
    apiClient.post<AuthResponse>('/auth/refresh').then((r) => r.data),

  me: () =>
    apiClient.get<UserProfile>('/auth/me').then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>('/auth/verify-email', { token }).then((r) => r.data),

  forgotPassword: (login: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { login }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword }).then((r) => r.data),
};
