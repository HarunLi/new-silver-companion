import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheService } from '../cache';

describe('CacheService', () => {
  const cache = CacheService.getInstance();
  
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should be a singleton', () => {
    const instance1 = CacheService.getInstance();
    const instance2 = CacheService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return cached data within TTL', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      
      const result = await cache.get('test-key', { ttl: 1000 });
      expect(result).toEqual(testData);
    });

    it('should return null for expired data', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      
      // Mock Date.now to simulate time passing
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() + 2000);
      
      const result = await cache.get('test-key', { ttl: 1000 });
      expect(result).toBeNull();
      
      Date.now = realDateNow;
    });

    it('should return null when forceRefresh is true', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      
      const result = await cache.get('test-key', { forceRefresh: true });
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data with timestamp', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      
      const stored = await AsyncStorage.getItem('test-key');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.data).toEqual(testData);
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('should overwrite existing data', async () => {
      const testData1 = { test: 'data1' };
      const testData2 = { test: 'data2' };
      
      await cache.set('test-key', testData1);
      await cache.set('test-key', testData2);
      
      const result = await cache.get('test-key');
      expect(result).toEqual(testData2);
    });
  });

  describe('remove', () => {
    it('should remove cached data', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      await cache.remove('test-key');
      
      const result = await cache.get('test-key');
      expect(result).toBeNull();
    });

    it('should not throw error when removing non-existent key', async () => {
      await expect(cache.remove('non-existent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all cached data', async () => {
      await cache.set('key1', { test: 'data1' });
      await cache.set('key2', { test: 'data2' });
      
      await cache.clear();
      
      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      // Mock AsyncStorage.getItem to throw error
      const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
      mockGetItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await cache.get('test-key');
      expect(result).toBeNull();
      
      mockGetItem.mockRestore();
    });

    it('should handle JSON parse errors', async () => {
      // Store invalid JSON
      await AsyncStorage.setItem('test-key', 'invalid json');
      
      const result = await cache.get('test-key');
      expect(result).toBeNull();
    });
  });
});
