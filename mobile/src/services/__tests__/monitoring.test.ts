import AsyncStorage from '@react-native-async-storage/async-storage';
import { monitoring } from '../monitoring';

describe('MonitoringService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    monitoring.enable(true);
  });

  describe('recordPerformanceMetric', () => {
    it('should record and store performance metrics', async () => {
      const metric = {
        name: 'test_operation',
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        success: true,
      };

      await monitoring.recordPerformanceMetric(metric);

      const report = await monitoring.getPerformanceReport();
      expect(report.performance).toHaveLength(1);
      expect(report.performance[0]).toMatchObject(metric);
    });

    it('should not record metrics when disabled', async () => {
      monitoring.enable(false);

      const metric = {
        name: 'test_operation',
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        success: true,
      };

      await monitoring.recordPerformanceMetric(metric);

      const report = await monitoring.getPerformanceReport();
      expect(report.performance).toHaveLength(0);
    });
  });

  describe('recordNetworkRequest', () => {
    it('should record and store network metrics', async () => {
      const metric = {
        name: 'api_call',
        startTime: Date.now(),
        endTime: Date.now() + 500,
        duration: 500,
        success: true,
        url: 'https://api.example.com/data',
        method: 'GET',
        status: 200,
        responseSize: 1024,
      };

      await monitoring.recordNetworkRequest(metric);

      const report = await monitoring.getPerformanceReport();
      expect(report.network).toHaveLength(1);
      expect(report.network[0]).toMatchObject(metric);
    });

    it('should record failed network requests', async () => {
      const metric = {
        name: 'api_call',
        startTime: Date.now(),
        endTime: Date.now() + 500,
        duration: 500,
        success: false,
        url: 'https://api.example.com/data',
        method: 'GET',
        status: 500,
        error: 'Internal Server Error',
      };

      await monitoring.recordNetworkRequest(metric);

      const report = await monitoring.getPerformanceReport();
      expect(report.network).toHaveLength(1);
      expect(report.network[0]).toMatchObject(metric);
    });
  });

  describe('recordCacheOperation', () => {
    it('should record and store cache metrics', async () => {
      const metric = {
        name: 'cache_get',
        startTime: Date.now(),
        endTime: Date.now() + 100,
        duration: 100,
        success: true,
        key: 'test_key',
        hit: true,
        size: 512,
      };

      await monitoring.recordCacheOperation(metric);

      const report = await monitoring.getPerformanceReport();
      expect(report.cache).toHaveLength(1);
      expect(report.cache[0]).toMatchObject(metric);
    });
  });

  describe('recordError', () => {
    it('should record and store errors', async () => {
      const error = new Error('Test error');
      const metadata = { component: 'TestComponent' };

      await monitoring.recordError(error, metadata);

      const report = await monitoring.getPerformanceReport();
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0]).toMatchObject({
        name: error.name,
        message: error.message,
        metadata,
      });
    });

    it('should include stack trace in error record', async () => {
      const error = new Error('Test error');
      await monitoring.recordError(error);

      const report = await monitoring.getPerformanceReport();
      expect(report.errors[0].stack).toBeDefined();
    });
  });

  describe('clearAllMetrics', () => {
    it('should clear all stored metrics', async () => {
      // Record some metrics
      await monitoring.recordPerformanceMetric({
        name: 'test',
        startTime: Date.now(),
        endTime: Date.now() + 100,
        duration: 100,
        success: true,
      });

      await monitoring.recordError(new Error('Test error'));

      // Clear metrics
      await monitoring.clearAllMetrics();

      // Verify all metrics are cleared
      const report = await monitoring.getPerformanceReport();
      expect(report.performance).toHaveLength(0);
      expect(report.network).toHaveLength(0);
      expect(report.cache).toHaveLength(0);
      expect(report.errors).toHaveLength(0);
    });
  });

  describe('storage limits', () => {
    it('should limit the number of stored metrics', async () => {
      // Record more than MAX_STORED_METRICS metrics
      for (let i = 0; i < 150; i++) {
        await monitoring.recordPerformanceMetric({
          name: `test_${i}`,
          startTime: Date.now(),
          endTime: Date.now() + 100,
          duration: 100,
          success: true,
        });
      }

      const report = await monitoring.getPerformanceReport();
      expect(report.performance.length).toBeLessThanOrEqual(100);
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      // Mock AsyncStorage.setItem to throw an error
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

      // This should not throw
      await expect(monitoring.recordPerformanceMetric({
        name: 'test',
        startTime: Date.now(),
        endTime: Date.now() + 100,
        duration: 100,
        success: true,
      })).resolves.not.toThrow();

      mockSetItem.mockRestore();
    });
  });
});
