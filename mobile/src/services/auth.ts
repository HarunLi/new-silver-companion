import { api } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    phone: string;
    nickname: string;
    avatar?: string;
    gender?: 'male' | 'female' | 'other';
    birth_date?: string;
  };
}

export const authService = {
  // 发送验证码
  sendVerificationCode: async (phone: string) => {
    const response = await api.post('/auth/send-code', { phone });
    return response.data;
  },

  // 登录（如果是新用户则自动注册）
  login: async (phone: string, code: string, nickname?: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { phone, code, nickname });
    const { token, user } = response.data;
    
    // 保存 token 和用户信息
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // 退出登录
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // 无论请求是否成功，都清除本地存储
      await AsyncStorage.multiRemove(['token', 'user']);
    }
  },

  // 检查是否已登录
  checkAuth: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 获取存储的token
  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },
};
