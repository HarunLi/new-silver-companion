import { api } from './config';
import { CacheService } from './cache';
import { withRetry } from '../utils/retry';

const cache = CacheService.getInstance();
const CACHE_KEYS = {
  DAILY_HEALTH: 'health_daily',
  HEALTH_HISTORY: 'health_history',
};

export interface HealthData {
  steps: number;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  sleep: number;
  date: string;
}

const retryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: any) => {
    // 只重试网络错误和 5xx 错误
    return !error.response || error.response.status >= 500;
  },
};

export const healthService = {
  // 获取今日健康数据
  getDailyHealth: withRetry(async (forceRefresh = false): Promise<HealthData> => {
    // 尝试从缓存获取
    if (!forceRefresh) {
      const cached = await cache.get<HealthData>(CACHE_KEYS.DAILY_HEALTH, {
        ttl: 5 * 60 * 1000, // 5 minutes
      });
      if (cached) return cached;
    }

    // 从服务器获取
    const response = await api.get('/health/daily');
    const data = response.data;

    // 更新缓存
    await cache.set(CACHE_KEYS.DAILY_HEALTH, data);
    return data;
  }, retryConfig),

  // 更新步数
  updateSteps: withRetry(async (steps: number): Promise<void> => {
    await api.put('/health/steps', { steps });
    // 清除缓存以便下次获取最新数据
    await cache.remove(CACHE_KEYS.DAILY_HEALTH);
  }, retryConfig),

  // 记录心率
  recordHeartRate: withRetry(async (heartRate: number): Promise<void> => {
    await api.post('/health/heart-rate', { heartRate });
    await cache.remove(CACHE_KEYS.DAILY_HEALTH);
  }, retryConfig),

  // 记录血压
  recordBloodPressure: withRetry(async (systolic: number, diastolic: number): Promise<void> => {
    await api.post('/health/blood-pressure', { systolic, diastolic });
    await cache.remove(CACHE_KEYS.DAILY_HEALTH);
  }, retryConfig),

  // 记录睡眠
  recordSleep: withRetry(async (hours: number): Promise<void> => {
    await api.post('/health/sleep', { hours });
    await cache.remove(CACHE_KEYS.DAILY_HEALTH);
  }, retryConfig),

  // 获取健康数据历史
  getHealthHistory: withRetry(async (startDate: string, endDate: string): Promise<HealthData[]> => {
    const cacheKey = `${CACHE_KEYS.HEALTH_HISTORY}_${startDate}_${endDate}`;
    
    // 尝试从缓存获取
    const cached = await cache.get<HealthData[]>(cacheKey, {
      ttl: 30 * 60 * 1000, // 30 minutes
    });
    if (cached) return cached;

    // 从服务器获取
    const response = await api.get('/health/history', {
      params: { startDate, endDate },
    });
    const data = response.data;

    // 更新缓存
    await cache.set(cacheKey, data);
    return data;
  }, retryConfig),

  // 清除健康数据缓存
  clearCache: async (): Promise<void> => {
    await Promise.all([
      cache.remove(CACHE_KEYS.DAILY_HEALTH),
      // 清除所有历史数据缓存
      cache.clear(),
    ]);
  },
};
