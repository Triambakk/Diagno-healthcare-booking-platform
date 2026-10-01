import { apiClient } from './client';
import { AuthTokens, User } from '../types';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<{ id: number; username: string; email: string; message: string }> => {
    const res = await apiClient.post('/auth/register/', payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const res = await apiClient.post('/auth/login/', payload);
    return res.data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh });
    return res.data;
  },
};
