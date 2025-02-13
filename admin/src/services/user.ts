import { request } from './request';

// 配置 API_URL
const API_URL = 'http://localhost:8001/api/v1';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export const userService = {
  getUsers: async () => {
    const response = await request.get<User[]>(`${API_URL}/users/`);
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await request.get<User>(`${API_URL}/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await request.post<User>(`${API_URL}/users/`, data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await request.put<User>(`${API_URL}/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await request.delete(`${API_URL}/users/${id}`);
  },
};
