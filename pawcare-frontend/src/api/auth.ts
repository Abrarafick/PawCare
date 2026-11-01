import { apiClient } from './client';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export const authApi = {
  async register(data: { email: string; password: string; password_confirm: string; first_name?: string; last_name?: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register/', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login/', data);
    return res.data;
  },

  async logout(refresh?: string): Promise<void> {
    try {
      await apiClient.post('/auth/logout/', { refresh });
    } catch {
      // ignore logout errors
    }
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me/');
    return res.data;
  },
};
