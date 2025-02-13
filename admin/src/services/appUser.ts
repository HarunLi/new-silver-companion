import { request } from './request';

const BASE_URL = '/api/v2/app-users';

export interface AppUser {
  id: number;
  phone: string;
  nickname?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AppUserListResponse {
  items: AppUser[];
  total: number;
  page: number;
  size: number;
}

export interface AppUserQueryParams {
  page?: number;
  size?: number;
  phone?: string;
  is_active?: boolean;
}

export const appUserService = {
  getAppUsers: async (params: AppUserQueryParams = {}) => {
    const response = await request.get<AppUserListResponse>(BASE_URL, { params });
    return response.data;
  },

  getAppUser: async (id: number) => {
    const response = await request.get<AppUser>(`${BASE_URL}/${id}`);
    return response.data;
  },

  updateAppUser: async (id: number, data: Partial<AppUser>) => {
    const response = await request.put<AppUser>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteAppUser: async (id: number) => {
    await request.delete(`${BASE_URL}/${id}`);
  },
};
