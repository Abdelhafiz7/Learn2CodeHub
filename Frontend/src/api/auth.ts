import axiosInstance from "./axiosInstance";
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from "@/types";


export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const token = localStorage.getItem('token');

    const response = await axiosInstance.post(
      '/auth/refresh',
      JSON.stringify(token),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  },

  updateProfile: async (data: {
    firstName: string;
    lastName: string;
    bio?: string;
    profileImageUrl?: string;
  }) => {
    const res = await axiosInstance.put("/auth/update-profile", data);
    return res.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await axiosInstance.put("/auth/change-password", data);
    return res.data;
  },

  requestEmailChange: async (email: string) => {
    const res = await axiosInstance.post("/auth/request-email-change", email);
    return res.data;
  },
};