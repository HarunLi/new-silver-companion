import { api } from '../config';
import { CacheService } from '../cache';
import { todoService } from '../todo';

jest.mock('../config', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('todoService', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const cache = CacheService.getInstance();
  
  beforeEach(async () => {
    jest.clearAllMocks();
    await cache.clear();
  });

  describe('getDailyTodos', () => {
    const mockTodos = [
      {
        id: 1,
        title: 'Take Medicine',
        time: '09:00',
        completed: false,
        type: 'medicine',
        date: '2025-02-09',
        reminder: true,
      },
    ];

    it('should return cached data when available', async () => {
      await cache.set('todos_daily', mockTodos);
      
      const result = await todoService.getDailyTodos();
      
      expect(result).toEqual(mockTodos);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTodos });
      
      const result = await todoService.getDailyTodos();
      
      expect(result).toEqual(mockTodos);
      expect(mockApi.get).toHaveBeenCalledWith('/todos/daily');
    });

    it('should fetch from API when forceRefresh is true', async () => {
      await cache.set('todos_daily', mockTodos);
      mockApi.get.mockResolvedValueOnce({ data: mockTodos });
      
      const result = await todoService.getDailyTodos(true);
      
      expect(result).toEqual(mockTodos);
      expect(mockApi.get).toHaveBeenCalledWith('/todos/daily');
    });
  });

  describe('getTodos', () => {
    const mockTodos = [
      {
        id: 1,
        title: 'Take Medicine',
        completed: false,
      },
    ];

    it('should cache results with date range', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTodos });
      
      const startDate = '2025-02-09';
      const endDate = '2025-02-09';
      const result = await todoService.getTodos(startDate, endDate);
      
      expect(result).toEqual(mockTodos);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const cachedResult = await todoService.getTodos(startDate, endDate);
      expect(cachedResult).toEqual(mockTodos);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should pass date range to API', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTodos });
      
      const startDate = '2025-02-09';
      const endDate = '2025-02-10';
      await todoService.getTodos(startDate, endDate);
      
      expect(mockApi.get).toHaveBeenCalledWith('/todos', {
        params: { startDate, endDate },
      });
    });
  });

  describe('createTodo', () => {
    const mockTodo = {
      title: 'Take Medicine',
      time: '09:00',
      type: 'medicine',
      date: '2025-02-09',
      reminder: true,
      completed: false,
    };

    it('should clear related caches after creation', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: { id: 1, ...mockTodo },
      });
      
      await todoService.createTodo(mockTodo);
      
      // Verify cache is cleared
      const dailyCache = await cache.get('todos_daily');
      const listCache = await cache.get(`todos_list_${mockTodo.date}_${mockTodo.date}`);
      
      expect(dailyCache).toBeNull();
      expect(listCache).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should clear related caches after update', async () => {
      const todoId = 1;
      const update = {
        completed: true,
        date: '2025-02-09',
      };
      
      mockApi.put.mockResolvedValueOnce({
        data: { id: todoId, ...update },
      });
      
      await todoService.updateTodo(todoId, update);
      
      // Verify cache is cleared
      const dailyCache = await cache.get('todos_daily');
      const listCache = await cache.get(`todos_list_${update.date}_${update.date}`);
      
      expect(dailyCache).toBeNull();
      expect(listCache).toBeNull();
    });
  });

  describe('toggleTodo', () => {
    it('should clear daily cache after toggle', async () => {
      const todoId = 1;
      mockApi.put.mockResolvedValueOnce({
        data: { id: todoId, completed: true },
      });
      
      await todoService.toggleTodo(todoId);
      
      // Verify cache is cleared
      const dailyCache = await cache.get('todos_daily');
      expect(dailyCache).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should retry on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))
              .mockResolvedValueOnce({ data: [] });
      
      const result = await todoService.getDailyTodos();
      
      expect(result).toEqual([]);
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };
      mockApi.get.mockRejectedValueOnce(error);
      
      await expect(todoService.getDailyTodos())
        .rejects.toThrow('Not found');
      
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });
  });
});
