import { api } from './config';
import { CacheService } from './cache';
import { withRetry } from '../utils/retry';

const cache = CacheService.getInstance();
const CACHE_KEYS = {
  DAILY: 'todos_daily',
  LIST: 'todos_list',
};

export interface Todo {
  id: number;
  title: string;
  time?: string;
  completed: boolean;
  type: 'medicine' | 'exercise' | 'appointment' | 'other';
  date: string;
  reminder?: boolean;
}

const retryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: any) => {
    return !error.response || error.response.status >= 500;
  },
};

export const todoService = {
  // 获取今日待办
  getDailyTodos: withRetry(async (forceRefresh = false): Promise<Todo[]> => {
    if (!forceRefresh) {
      const cached = await cache.get<Todo[]>(CACHE_KEYS.DAILY, {
        ttl: 5 * 60 * 1000, // 5 minutes
      });
      if (cached) return cached;
    }

    const response = await api.get('/todos/daily');
    const data = response.data;
    await cache.set(CACHE_KEYS.DAILY, data);
    return data;
  }, retryConfig),

  // 获取指定日期范围的待办
  getTodos: withRetry(async (startDate: string, endDate: string): Promise<Todo[]> => {
    const cacheKey = `${CACHE_KEYS.LIST}_${startDate}_${endDate}`;
    
    const cached = await cache.get<Todo[]>(cacheKey, {
      ttl: 5 * 60 * 1000, // 5 minutes
    });
    if (cached) return cached;

    const response = await api.get('/todos', {
      params: { startDate, endDate },
    });
    const data = response.data;
    await cache.set(cacheKey, data);
    return data;
  }, retryConfig),

  // 创建待办
  createTodo: withRetry(async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
    const response = await api.post('/todos', todo);
    // 清除相关缓存
    await Promise.all([
      cache.remove(CACHE_KEYS.DAILY),
      cache.remove(`${CACHE_KEYS.LIST}_${todo.date}_${todo.date}`),
    ]);
    return response.data;
  }, retryConfig),

  // 更新待办
  updateTodo: withRetry(async (id: number, todo: Partial<Todo>): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);
    // 清除相关缓存
    await Promise.all([
      cache.remove(CACHE_KEYS.DAILY),
      // 如果有日期变更，需要清除两个日期的缓存
      cache.remove(`${CACHE_KEYS.LIST}_${todo.date}_${todo.date}`),
    ]);
    return response.data;
  }, retryConfig),

  // 删除待办
  deleteTodo: withRetry(async (id: number, date: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(CACHE_KEYS.DAILY),
      cache.remove(`${CACHE_KEYS.LIST}_${date}_${date}`),
    ]);
  }, retryConfig),

  // 标记完成/未完成
  toggleTodo: withRetry(async (id: number): Promise<Todo> => {
    const response = await api.put(`/todos/${id}/toggle`);
    // 清除今日待办缓存
    await cache.remove(CACHE_KEYS.DAILY);
    return response.data;
  }, retryConfig),

  // 清除待办相关的所有缓存
  clearCache: async (): Promise<void> => {
    const keys = await cache.getAllKeys();
    const todoKeys = keys.filter(key => key.startsWith('todos_'));
    await cache.multiRemove(todoKeys);
  },
};
