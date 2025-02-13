import { api } from '../config';
import { CacheService } from '../cache';
import { activityService } from '../activity';

jest.mock('../config', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('activityService', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const cache = CacheService.getInstance();
  
  beforeEach(async () => {
    jest.clearAllMocks();
    await cache.clear();
  });

  describe('getRecommendedActivities', () => {
    const mockActivities = [
      {
        id: 1,
        title: 'Morning Yoga',
        description: 'Start your day with yoga',
        time: '2025-02-09T08:00:00Z',
        location: 'Community Center',
        participants: 5,
        maxParticipants: 10,
        image: 'yoga.jpg',
        status: 'upcoming',
        category: 'exercise',
        organizer: { id: 1, name: 'John' },
      },
    ];

    it('should return cached data when available', async () => {
      await cache.set('activities_recommended', mockActivities);
      
      const result = await activityService.getRecommendedActivities();
      
      expect(result).toEqual(mockActivities);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockActivities });
      
      const result = await activityService.getRecommendedActivities();
      
      expect(result).toEqual(mockActivities);
      expect(mockApi.get).toHaveBeenCalledWith('/activities/recommended');
    });

    it('should fetch from API when forceRefresh is true', async () => {
      await cache.set('activities_recommended', mockActivities);
      mockApi.get.mockResolvedValueOnce({ data: mockActivities });
      
      const result = await activityService.getRecommendedActivities(true);
      
      expect(result).toEqual(mockActivities);
      expect(mockApi.get).toHaveBeenCalledWith('/activities/recommended');
    });
  });

  describe('getActivities', () => {
    const mockResponse = {
      activities: [
        {
          id: 1,
          title: 'Morning Yoga',
          status: 'upcoming',
        },
      ],
      total: 1,
    };

    it('should cache first page results', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await activityService.getActivities({ page: 1, limit: 10 });
      
      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const cachedResult = await activityService.getActivities({ page: 1, limit: 10 });
      expect(cachedResult).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should not cache non-first page results', async () => {
      mockApi.get.mockResolvedValue({ data: mockResponse });
      
      await activityService.getActivities({ page: 2, limit: 10 });
      await activityService.getActivities({ page: 2, limit: 10 });
      
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('joinActivity', () => {
    it('should clear related caches after joining', async () => {
      const activityId = 1;
      mockApi.post.mockResolvedValueOnce({ data: { activityId, status: 'registered' } });
      
      await activityService.joinActivity(activityId);
      
      // Verify cache is cleared
      const recommendedCache = await cache.get('activities_recommended');
      const detailCache = await cache.get(`activity_detail_${activityId}`);
      const myActivitiesCache = await cache.get('activities_my');
      
      expect(recommendedCache).toBeNull();
      expect(detailCache).toBeNull();
      expect(myActivitiesCache).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should retry on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))
              .mockResolvedValueOnce({ data: [] });
      
      const result = await activityService.getRecommendedActivities();
      
      expect(result).toEqual([]);
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };
      mockApi.get.mockRejectedValueOnce(error);
      
      await expect(activityService.getRecommendedActivities())
        .rejects.toThrow('Not found');
      
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });
  });
});
