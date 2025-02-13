import { create } from 'zustand';
import { authService } from '../services/auth';

interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  login: (phone: string, code: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (token: string, user: User) => {
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  login: async (phone: string, code: string, nickname?: string) => {
    try {
      set({ isLoading: true });
      const response = await authService.login(phone, code, nickname);
      get().setAuth(response.token, response.user);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
    } finally {
      get().clearAuth();
    }
  },

  loadAuth: async () => {
    try {
      set({ isLoading: true });
      const isAuthenticated = await authService.checkAuth();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        const token = await authService.getToken();
        if (user && token) {
          get().setAuth(token, user);
          return;
        }
      }
      get().clearAuth();
    } finally {
      set({ isLoading: false });
    }
  },
}));
