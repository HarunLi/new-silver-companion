import { api } from './config';
import { CacheService } from './cache';
import { withRetry } from '../utils/retry';

const cache = CacheService.getInstance();
const CACHE_KEYS = {
  RECOMMENDED: 'activities_recommended',
  LIST: 'activities_list',
  DETAIL: 'activity_detail',
  MY_ACTIVITIES: 'activities_my',
};

export interface Activity {
  id: number;
  title: string;
  description: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  category: string;
  organizer: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface ActivityParticipation {
  activityId: number;
  userId: number;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
}

const retryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: any) => {
    return !error.response || error.response.status >= 500;
  },
};

export const activityService = {
  // 获取推荐活动
  getRecommendedActivities: withRetry(async (forceRefresh = false): Promise<Activity[]> => {
    if (!forceRefresh) {
      const cached = await cache.get<Activity[]>(CACHE_KEYS.RECOMMENDED, {
        ttl: 5 * 60 * 1000, // 5 minutes
      });
      if (cached) return cached;
    }

    const response = await api.get('/activities/recommended');
    const data = response.data;
    await cache.set(CACHE_KEYS.RECOMMENDED, data);
    return data;
  }, retryConfig),

  // 获取活动列表
  getActivities: withRetry(async (params: {
    category?: string;
    status?: Activity['status'];
    page?: number;
    limit?: number;
  }): Promise<{
    activities: Activity[];
    total: number;
  }> => {
    const cacheKey = `${CACHE_KEYS.LIST}_${JSON.stringify(params)}`;
    
    // 只缓存第一页的数据
    if (params.page === 1) {
      const cached = await cache.get<{ activities: Activity[]; total: number }>(
        cacheKey,
        { ttl: 5 * 60 * 1000 }
      );
      if (cached) return cached;
    }

    const response = await api.get('/activities', { params });
    const data = response.data;

    if (params.page === 1) {
      await cache.set(cacheKey, data);
    }
    return data;
  }, retryConfig),

  // 获取活动详情
  getActivity: withRetry(async (id: number, forceRefresh = false): Promise<Activity> => {
    const cacheKey = `${CACHE_KEYS.DETAIL}_${id}`;
    
    if (!forceRefresh) {
      const cached = await cache.get<Activity>(cacheKey, {
        ttl: 5 * 60 * 1000,
      });
      if (cached) return cached;
    }

    const response = await api.get(`/activities/${id}`);
    const data = response.data;
    await cache.set(cacheKey, data);
    return data;
  }, retryConfig),

  // 报名活动
  joinActivity: withRetry(async (id: number): Promise<ActivityParticipation> => {
    const response = await api.post(`/activities/${id}/join`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
      cache.remove(CACHE_KEYS.RECOMMENDED),
      cache.remove(CACHE_KEYS.MY_ACTIVITIES),
    ]);
    return response.data;
  }, retryConfig),

  // 取消报名
  cancelActivity: withRetry(async (id: number): Promise<void> => {
    await api.post(`/activities/${id}/cancel`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
      cache.remove(CACHE_KEYS.RECOMMENDED),
      cache.remove(CACHE_KEYS.MY_ACTIVITIES),
    ]);
  }, retryConfig),

  // 获取我的活动
  getMyActivities: withRetry(async (
    status?: ActivityParticipation['status'],
    forceRefresh = false
  ): Promise<Activity[]> => {
    const cacheKey = `${CACHE_KEYS.MY_ACTIVITIES}_${status || 'all'}`;
    
    if (!forceRefresh) {
      const cached = await cache.get<Activity[]>(cacheKey, {
        ttl: 5 * 60 * 1000,
      });
      if (cached) return cached;
    }

    const response = await api.get('/activities/my', {
      params: { status },
    });
    const data = response.data;
    await cache.set(cacheKey, data);
    return data;
  }, retryConfig),

  // 清除活动相关的所有缓存
  clearCache: async (): Promise<void> => {
    const keys = await cache.getAllKeys();
    const activityKeys = keys.filter(key => 
      key.startsWith('activities_') || key.startsWith('activity_')
    );
    await cache.multiRemove(activityKeys);
  },
};
