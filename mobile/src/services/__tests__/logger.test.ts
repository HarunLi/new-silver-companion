import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger, LogLevel } from '../logger';
import { monitoring } from '../monitoring';

jest.mock('../monitoring', () => ({
  monitoring: {
    recordError: jest.fn(),
  },
}));

describe('Logger', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    logger.setMinLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log levels', () => {
    it('should log messages at or above minimum level', async () => {
      logger.setMinLevel(LogLevel.INFO);

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const logs = await logger.getLogs();
      expect(logs).toHaveLength(3); // INFO, WARN, ERROR
      expect(logs.map(log => log.level)).not.toContain(LogLevel.DEBUG);
    });

    it('should include metadata in log entries', async () => {
      const metadata = { userId: 123, action: 'test' };
      logger.info('Test message', metadata);

      const logs = await logger.getLogs();
      expect(logs[0].metadata).toMatchObject(metadata);
    });
  });

  describe('error logging', () => {
    it('should log errors with stack traces', async () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const logs = await logger.getLogs();
      expect(logs[0].error).toBeDefined();
      expect(logs[0].error?.stack).toBeDefined();
    });

    it('should forward errors to monitoring service', async () => {
      const error = new Error('Test error');
      const metadata = { context: 'test' };
      
      logger.error('Error occurred', error, metadata);

      expect(monitoring.recordError).toHaveBeenCalledWith(error, {
        ...metadata,
        logMessage: 'Error occurred',
      });
    });
  });

  describe('log filtering', () => {
    beforeEach(async () => {
      // Add some test logs
      logger.info('Info 1');
      logger.warn('Warning 1');
      logger.error('Error 1');
      logger.info('Info 2');
    });

    it('should filter logs by level', async () => {
      const warnLogs = await logger.getLogs(LogLevel.WARN);
      expect(warnLogs).toHaveLength(2); // WARN and ERROR
      expect(warnLogs.every(log => 
        [LogLevel.WARN, LogLevel.ERROR].includes(log.level)
      )).toBe(true);
    });

    it('should filter logs by time range', async () => {
      const now = Date.now();
      const startTime = now - 1000;
      const endTime = now + 1000;

      const logs = await logger.getLogs(undefined, startTime, endTime);
      expect(logs.every(log => 
        log.timestamp >= startTime && log.timestamp <= endTime
      )).toBe(true);
    });
  });

  describe('log retention', () => {
    it('should limit the number of stored logs', async () => {
      // Add more than MAX_LOGS entries
      for (let i = 0; i < 1500; i++) {
        logger.info(`Log entry ${i}`);
      }

      // Force flush
      await (logger as any).flush();

      const logs = await logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('should remove logs older than retention period', async () => {
      const oldDate = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
      const recentDate = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days ago

      // Mock Date.now for the first log
      const realDateNow = Date.now;
      Date.now = jest.fn(() => oldDate);
      logger.info('Old log');

      // Restore Date.now for the second log
      Date.now = jest.fn(() => recentDate);
      logger.info('Recent log');

      // Force flush
      await (logger as any).flush();

      // Restore real Date.now
      Date.now = realDateNow;

      const logs = await logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Recent log');
    });
  });

  describe('export and clear', () => {
    it('should export logs in JSON format', async () => {
      logger.info('Test log');
      logger.error('Test error');

      const exported = await logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('should clear all logs', async () => {
      logger.info('Test log');
      await logger.clearLogs();

      const logs = await logger.getLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

      // This should not throw
      await expect(logger.info('Test message')).resolves.not.toThrow();

      mockSetItem.mockRestore();
    });

    it('should handle JSON parse errors', async () => {
      await AsyncStorage.setItem('app_logs', 'invalid json');

      const logs = await logger.getLogs();
      expect(logs).toEqual([]);
    });
  });

  describe('automatic flushing', () => {
    it('should flush logs when buffer is full', async () => {
      // Add more than 100 logs to trigger auto-flush
      for (let i = 0; i < 150; i++) {
        logger.info(`Log ${i}`);
      }

      const logs = await logger.getLogs();
      expect(logs.length).toBeGreaterThan(100);
    });

    it('should flush immediately for error logs', async () => {
      logger.error('Critical error');

      const logs = await logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });
  });
});
