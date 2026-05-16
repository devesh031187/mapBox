import api from '@/config/api';
import type { ApiResponse, LoginResponseData, User } from '@/types/models';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponseData> {
    const { data } = await api.post<ApiResponse<LoginResponseData>>(
      '/auth/login',
      { email, password },
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async refresh(): Promise<string> {
    const { data } = await api.post<ApiResponse<{ access_token: string }>>(
      '/auth/refresh',
    );
    return data.data.access_token;
  },
};
