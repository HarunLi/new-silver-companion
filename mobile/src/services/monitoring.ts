import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface NetworkMetric extends PerformanceMetric {
  url: string;
  method: string;
  status?: number;
  responseSize?: number;
}

interface CacheMetric extends PerformanceMetric {
  key: string;
  hit: boolean;
  size?: number;
}

const STORAGE_KEYS = {
  PERFORMANCE: 'monitoring_performance',
  NETWORK: 'monitoring_network',
  CACHE: 'monitoring_cache',
  ERROR: 'monitoring_error',
};

const MAX_STORED_METRICS = 100;

class MonitoringService {
  private static instance: MonitoringService;
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // 启用或禁用监控
  enable(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 记录性能指标
  async recordPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const metrics = await this.getStoredMetrics(STORAGE_KEYS.PERFORMANCE);
      metrics.unshift({
        ...metric,
        timestamp: Date.now(),
        platform: Platform.OS,
        version: Platform.Version,
      });

      await this.storeMetrics(STORAGE_KEYS.PERFORMANCE, metrics);
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // 记录网络请求
  async recordNetworkRequest(metric: NetworkMetric): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const metrics = await this.getStoredMetrics(STORAGE_KEYS.NETWORK);
      metrics.unshift({
        ...metric,
        timestamp: Date.now(),
        platform: Platform.OS,
      });

      await this.storeMetrics(STORAGE_KEYS.NETWORK, metrics);
    } catch (error) {
      console.error('Failed to record network metric:', error);
    }
  }

  // 记录缓存操作
  async recordCacheOperation(metric: CacheMetric): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const metrics = await this.getStoredMetrics(STORAGE_KEYS.CACHE);
      metrics.unshift({
        ...metric,
        timestamp: Date.now(),
      });

      await this.storeMetrics(STORAGE_KEYS.CACHE, metrics);
    } catch (error) {
      console.error('Failed to record cache metric:', error);
    }
  }

  // 记录错误
  async recordError(error: Error, metadata?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const errors = await this.getStoredMetrics(STORAGE_KEYS.ERROR);
      errors.unshift({
        name: error.name,
        message: error.message,
        stack: error.stack,
        metadata,
        timestamp: Date.now(),
        platform: Platform.OS,
      });

      await this.storeMetrics(STORAGE_KEYS.ERROR, errors);
    } catch (err) {
      console.error('Failed to record error:', err);
    }
  }

  // 获取性能报告
  async getPerformanceReport(): Promise<{
    performance: any[];
    network: any[];
    cache: any[];
    errors: any[];
  }> {
    return {
      performance: await this.getStoredMetrics(STORAGE_KEYS.PERFORMANCE),
      network: await this.getStoredMetrics(STORAGE_KEYS.NETWORK),
      cache: await this.getStoredMetrics(STORAGE_KEYS.CACHE),
      errors: await this.getStoredMetrics(STORAGE_KEYS.ERROR),
    };
  }

  // 清除所有监控数据
  async clearAllMetrics(): Promise<void> {
    try {
      await Promise.all(
        Object.values(STORAGE_KEYS).map(key => AsyncStorage.removeItem(key))
      );
    } catch (error) {
      console.error('Failed to clear metrics:', error);
    }
  }

  // 辅助方法：获取存储的指标
  private async getStoredMetrics(key: string): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Failed to get stored metrics for ${key}:`, error);
      return [];
    }
  }

  // 辅助方法：存储指标
  private async storeMetrics(key: string, metrics: any[]): Promise<void> {
    // 限制存储的指标数量
    const trimmedMetrics = metrics.slice(0, MAX_STORED_METRICS);
    await AsyncStorage.setItem(key, JSON.stringify(trimmedMetrics));
  }
}

export const monitoring = MonitoringService.getInstance();
