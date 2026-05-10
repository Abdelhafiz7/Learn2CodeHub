import axiosInstance from './axiosInstance';
import type { User } from '@/types';

export const usersApi = {
  // ─── Profile ───────────────────────────────────────────────────────────────

  updateProfile: async (data: Partial<User>) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await axiosInstance.post('/users/change-password', data);
    return response.data;
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  adminGetAllUsers: async (params?: { page?: number; pageSize?: number; search?: string; role?: string }) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  adminGetUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  adminUpdateUser: async (id: string, data: Partial<User>) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },

  adminDeleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },

  adminGetStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },
};
