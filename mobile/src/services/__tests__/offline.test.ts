import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { offline } from '../offline';
import { logger } from '../logger';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('OfflineService', () => {
  const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
  
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    
    // Mock initial online state
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true });
  });

  describe('initialization', () => {
    it('should load saved queue on initialization', async () => {
      const savedQueue = [
        {
          id: 'test1',
          timestamp: Date.now(),
          method: 'POST',
          url: '/test',
          retryCount: 0,
        },
      ];

      await AsyncStorage.setItem('offline_queue', JSON.stringify(savedQueue));

      // Re-initialize the service
      await (offline as any).initialize();

      // Verify the queue was loaded
      expect((offline as any).requestQueue).toEqual(savedQueue);
    });

    it('should start with empty queue if no saved queue exists', async () => {
      // Re-initialize the service
      await (offline as any).initialize();

      // Verify the queue is empty
      expect((offline as any).requestQueue).toEqual([]);
    });
  });

  describe('queueRequest', () => {
    it('should add request to queue', async () => {
      const request = {
        method: 'POST',
        url: '/test',
        data: { test: true },
      };

      await offline.queueRequest(request);

      const queue = JSON.parse(
        await AsyncStorage.getItem('offline_queue') || '[]'
      );
      
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject(request);
    });

    it('should process queue immediately if online', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const request = {
        method: 'POST',
        url: '/test',
        data: { test: true },
      };

      await offline.queueRequest(request);

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('offline data management', () => {
    it('should save and retrieve offline data', async () => {
      const testData = { key: 'value' };
      await offline.saveOfflineData('test', testData);

      const retrieved = await offline.getOfflineData('test');
      expect(retrieved).toEqual(testData);
    });

    it('should clear specific offline data', async () => {
      await offline.saveOfflineData('test1', { key: 'value1' });
      await offline.saveOfflineData('test2', { key: 'value2' });

      await offline.clearOfflineData('test1');

      const data1 = await offline.getOfflineData('test1');
      const data2 = await offline.getOfflineData('test2');

      expect(data1).toBeNull();
      expect(data2).toEqual({ key: 'value2' });
    });

    it('should clear all offline data', async () => {
      await offline.saveOfflineData('test1', { key: 'value1' });
      await offline.saveOfflineData('test2', { key: 'value2' });

      await offline.clearOfflineData();

      const data = await offline.getOfflineData();
      expect(data).toEqual({});
    });
  });

  describe('queue processing', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should process queued requests when coming online', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Simulate offline state
      mockNetInfo.fetch.mockResolvedValueOnce({ isConnected: false });
      await (offline as any).initialize();

      // Queue a request while offline
      await offline.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true },
      });

      // Simulate coming online
      const networkCallback = mockNetInfo.addEventListener.mock.calls[0][0];
      await networkCallback({ isConnected: true });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should retry failed requests', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true });

      await offline.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true },
      });

      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 5000));

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should stop retrying after max attempts', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await offline.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true },
      });

      // Wait for all retries
      await new Promise(resolve => setTimeout(resolve, 20000));

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('queue status', () => {
    it('should report correct queue status', async () => {
      // Simulate offline state
      mockNetInfo.fetch.mockResolvedValueOnce({ isConnected: false });
      await (offline as any).initialize();

      await offline.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true },
      });

      const status = offline.getQueueStatus();
      expect(status).toEqual({
        isOnline: false,
        queueLength: 1,
        isProcessing: false,
      });
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

      // This should not throw
      await expect(offline.queueRequest({
        method: 'POST',
        url: '/test',
      })).resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle network state errors', async () => {
      mockNetInfo.fetch.mockRejectedValueOnce(new Error('NetInfo error'));

      // Re-initialize should not throw
      await expect((offline as any).initialize()).resolves.not.toThrow();
    });
  });
});
