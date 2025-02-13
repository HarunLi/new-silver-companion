import { api } from '../config';
import { CacheService } from '../cache';
import { tipService } from '../tip';

jest.mock('../config', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('tipService', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const cache = CacheService.getInstance();
  
  beforeEach(async () => {
    jest.clearAllMocks();
    await cache.clear();
  });

  describe('getRecommendedTips', () => {
    const mockTips = [
      {
        id: 1,
        title: 'Healthy Eating',
        description: 'Tips for a balanced diet',
        content: 'Detailed content about healthy eating',
        image: 'healthy-eating.jpg',
        category: 'nutrition',
        tags: ['diet', 'health'],
        publishedAt: '2025-02-09T10:00:00Z',
        author: {
          id: 1,
          name: 'Dr. Smith',
          title: 'Nutritionist',
        },
        likes: 10,
        views: 100,
      },
    ];

    it('should return cached data when available', async () => {
      await cache.set('tips_recommended', mockTips);
      
      const result = await tipService.getRecommendedTips();
      
      expect(result).toEqual(mockTips);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTips });
      
      const result = await tipService.getRecommendedTips();
      
      expect(result).toEqual(mockTips);
      expect(mockApi.get).toHaveBeenCalledWith('/tips/recommended');
    });

    it('should fetch from API when forceRefresh is true', async () => {
      await cache.set('tips_recommended', mockTips);
      mockApi.get.mockResolvedValueOnce({ data: mockTips });
      
      const result = await tipService.getRecommendedTips(true);
      
      expect(result).toEqual(mockTips);
      expect(mockApi.get).toHaveBeenCalledWith('/tips/recommended');
    });
  });

  describe('getTips', () => {
    const mockResponse = {
      tips: [
        {
          id: 1,
          title: 'Healthy Eating',
          category: 'nutrition',
        },
      ],
      total: 1,
    };

    it('should cache first page results', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await tipService.getTips({ page: 1, limit: 10 });
      
      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const cachedResult = await tipService.getTips({ page: 1, limit: 10 });
      expect(cachedResult).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should not cache non-first page results', async () => {
      mockApi.get.mockResolvedValue({ data: mockResponse });
      
      await tipService.getTips({ page: 2, limit: 10 });
      await tipService.getTips({ page: 2, limit: 10 });
      
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should handle category and tag filters', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockResponse });
      
      await tipService.getTips({
        category: 'nutrition',
        tag: 'diet',
        page: 1,
        limit: 10,
      });
      
      expect(mockApi.get).toHaveBeenCalledWith('/tips', {
        params: {
          category: 'nutrition',
          tag: 'diet',
          page: 1,
          limit: 10,
        },
      });
    });
  });

  describe('likeTip', () => {
    it('should clear related caches after liking', async () => {
      const tipId = 1;
      mockApi.post.mockResolvedValueOnce({ data: {} });
      
      await tipService.likeTip(tipId);
      
      // Verify cache is cleared
      const recommendedCache = await cache.get('tips_recommended');
      const detailCache = await cache.get(`tip_detail_${tipId}`);
      
      expect(recommendedCache).toBeNull();
      expect(detailCache).toBeNull();
    });
  });

  describe('favoriteTip', () => {
    it('should clear related caches after favoriting', async () => {
      const tipId = 1;
      mockApi.post.mockResolvedValueOnce({ data: {} });
      
      await tipService.favoriteTip(tipId);
      
      // Verify cache is cleared
      const favoritesCache = await cache.get('tips_favorites');
      const detailCache = await cache.get(`tip_detail_${tipId}`);
      
      expect(favoritesCache).toBeNull();
      expect(detailCache).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should retry on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))
              .mockResolvedValueOnce({ data: [] });
      
      const result = await tipService.getRecommendedTips();
      
      expect(result).toEqual([]);
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };
      mockApi.get.mockRejectedValueOnce(error);
      
      await expect(tipService.getRecommendedTips())
        .rejects.toThrow('Not found');
      
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });
  });
});
