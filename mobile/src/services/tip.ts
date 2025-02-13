import { api } from './config';
import { CacheService } from './cache';
import { withRetry } from '../utils/retry';

const cache = CacheService.getInstance();
const CACHE_KEYS = {
  RECOMMENDED: 'tips_recommended',
  LIST: 'tips_list',
  DETAIL: 'tip_detail',
  FAVORITES: 'tips_favorites',
};

export interface Tip {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  publishedAt: string;
  author: {
    id: number;
    name: string;
    title: string;
    avatar?: string;
  };
  likes: number;
  views: number;
}

const retryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: any) => {
    return !error.response || error.response.status >= 500;
  },
};

export const tipService = {
  // 获取推荐的健康小贴士
  getRecommendedTips: withRetry(async (forceRefresh = false): Promise<Tip[]> => {
    if (!forceRefresh) {
      const cached = await cache.get<Tip[]>(CACHE_KEYS.RECOMMENDED, {
        ttl: 15 * 60 * 1000, // 15 minutes
      });
      if (cached) return cached;
    }

    const response = await api.get('/tips/recommended');
    const data = response.data;
    await cache.set(CACHE_KEYS.RECOMMENDED, data);
    return data;
  }, retryConfig),

  // 获取小贴士列表
  getTips: withRetry(async (params: {
    category?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    tips: Tip[];
    total: number;
  }> => {
    const cacheKey = `${CACHE_KEYS.LIST}_${JSON.stringify(params)}`;
    
    // 只缓存第一页的数据
    if (params.page === 1) {
      const cached = await cache.get<{ tips: Tip[]; total: number }>(
        cacheKey,
        { ttl: 10 * 60 * 1000 } // 10 minutes
      );
      if (cached) return cached;
    }

    const response = await api.get('/tips', { params });
    const data = response.data;

    if (params.page === 1) {
      await cache.set(cacheKey, data);
    }
    return data;
  }, retryConfig),

  // 获取小贴士详情
  getTip: withRetry(async (id: number, forceRefresh = false): Promise<Tip> => {
    const cacheKey = `${CACHE_KEYS.DETAIL}_${id}`;
    
    if (!forceRefresh) {
      const cached = await cache.get<Tip>(cacheKey, {
        ttl: 30 * 60 * 1000, // 30 minutes
      });
      if (cached) return cached;
    }

    const response = await api.get(`/tips/${id}`);
    const data = response.data;
    await cache.set(cacheKey, data);
    return data;
  }, retryConfig),

  // 点赞小贴士
  likeTip: withRetry(async (id: number): Promise<void> => {
    await api.post(`/tips/${id}/like`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
      cache.remove(CACHE_KEYS.RECOMMENDED),
    ]);
  }, retryConfig),

  // 取消点赞
  unlikeTip: withRetry(async (id: number): Promise<void> => {
    await api.post(`/tips/${id}/unlike`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
      cache.remove(CACHE_KEYS.RECOMMENDED),
    ]);
  }, retryConfig),

  // 获取我收藏的小贴士
  getFavoriteTips: withRetry(async (forceRefresh = false): Promise<Tip[]> => {
    if (!forceRefresh) {
      const cached = await cache.get<Tip[]>(CACHE_KEYS.FAVORITES, {
        ttl: 5 * 60 * 1000, // 5 minutes
      });
      if (cached) return cached;
    }

    const response = await api.get('/tips/favorites');
    const data = response.data;
    await cache.set(CACHE_KEYS.FAVORITES, data);
    return data;
  }, retryConfig),

  // 收藏小贴士
  favoriteTip: withRetry(async (id: number): Promise<void> => {
    await api.post(`/tips/${id}/favorite`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(CACHE_KEYS.FAVORITES),
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
    ]);
  }, retryConfig),

  // 取消收藏
  unfavoriteTip: withRetry(async (id: number): Promise<void> => {
    await api.post(`/tips/${id}/unfavorite`);
    // 清除相关缓存
    await Promise.all([
      cache.remove(CACHE_KEYS.FAVORITES),
      cache.remove(`${CACHE_KEYS.DETAIL}_${id}`),
    ]);
  }, retryConfig),

  // 清除小贴士相关的所有缓存
  clearCache: async (): Promise<void> => {
    const keys = await cache.getAllKeys();
    const tipKeys = keys.filter(key => 
      key.startsWith('tips_') || key.startsWith('tip_')
    );
    await cache.multiRemove(tipKeys);
  },
};
