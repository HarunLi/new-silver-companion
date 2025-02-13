import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';

interface QueuedRequest {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  retryCount: number;
}

const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'offline_queue',
  OFFLINE_DATA: 'offline_data',
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

class OfflineService {
  private static instance: OfflineService;
  private requestQueue: QueuedRequest[] = [];
  private isOnline: boolean = true;
  private isProcessing: boolean = false;
  private retryTimeout?: NodeJS.Timeout;

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 加载保存的离线请求队列
      const savedQueue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (savedQueue) {
        this.requestQueue = JSON.parse(savedQueue);
      }

      // 监听网络状态变化
      NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected ?? false;

        // 如果从离线变为在线，尝试处理队列
        if (wasOffline && this.isOnline) {
          this.processQueue();
        }
      });

      // 初始检查网络状态
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;

      // 如果在线，尝试处理队列
      if (this.isOnline) {
        this.processQueue();
      }
    } catch (error) {
      logger.error('Failed to initialize offline service', error as Error);
    }
  }

  // 添加请求到离线队列
  async queueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queuedRequest: QueuedRequest = {
        ...request,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.requestQueue.push(queuedRequest);
      await this.saveQueue();

      // 如果在线，立即尝试处理
      if (this.isOnline) {
        this.processQueue();
      }
    } catch (error) {
      logger.error('Failed to queue request', error as Error);
    }
  }

  // 保存离线数据
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      offlineData[key] = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineData));
    } catch (error) {
      logger.error('Failed to save offline data', error as Error);
    }
  }

  // 获取离线数据
  async getOfflineData(key?: string): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      const offlineData = stored ? JSON.parse(stored) : {};
      return key ? offlineData[key]?.data : offlineData;
    } catch (error) {
      logger.error('Failed to get offline data', error as Error);
      return key ? null : {};
    }
  }

  // 清除离线数据
  async clearOfflineData(key?: string): Promise<void> {
    try {
      if (key) {
        const offlineData = await this.getOfflineData();
        delete offlineData[key];
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineData));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      }
    } catch (error) {
      logger.error('Failed to clear offline data', error as Error);
    }
  }

  // 获取队列状态
  getQueueStatus(): {
    isOnline: boolean;
    queueLength: number;
    isProcessing: boolean;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const requests = [...this.requestQueue];
      this.requestQueue = [];
      await this.saveQueue();

      for (const request of requests) {
        try {
          // 发送请求
          const response = await fetch(request.url, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...request.headers,
            },
            body: request.data ? JSON.stringify(request.data) : undefined,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          logger.info('Processed offline request', {
            id: request.id,
            url: request.url,
            method: request.method,
          });
        } catch (error) {
          // 如果请求失败，增加重试次数并重新加入队列
          if (request.retryCount < MAX_RETRY_ATTEMPTS) {
            this.requestQueue.push({
              ...request,
              retryCount: request.retryCount + 1,
            });
          } else {
            logger.error('Failed to process offline request', error as Error, {
              request,
            });
          }
        }
      }

      // 保存更新后的队列
      await this.saveQueue();

      // 如果队列还有内容，设置重试定时器
      if (this.requestQueue.length > 0) {
        this.scheduleRetry();
      }
    } catch (error) {
      logger.error('Failed to process offline queue', error as Error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(this.requestQueue)
      );
    } catch (error) {
      logger.error('Failed to save offline queue', error as Error);
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, RETRY_DELAY);
  }
}

export const offline = OfflineService.getInstance();
