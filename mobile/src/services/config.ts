import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { monitoring } from './monitoring';
import { logger } from './logger';

// 环境配置
const ENV = {
  dev: 'http://localhost:8001/api/v1',
  test: 'https://test.api.silvercompanion.com',
  prod: 'https://api.silvercompanion.com'
};

// 获取当前环境
const getEnvironment = () => {
  if (__DEV__) return 'dev';
  // 这里可以根据构建配置或其他逻辑判断是 test 还是 prod
  return 'prod';
};

// 超时配置（毫秒）
const TIMEOUTS = {
  DEFAULT: 15000,
  UPLOAD: 60000,
  CRITICAL: 5000
};

// 离线请求队列
interface QueuedRequest {
  config: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000;

  async add(request: QueuedRequest) {
    this.queue.push(request);
    await AsyncStorage.setItem('requestQueue', JSON.stringify(this.queue));
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      logger.info('Network offline, waiting for connection');
      return;
    }

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const request = this.queue[0];
      try {
        const response = await api.request(request.config);
        request.resolve(response);
        this.queue.shift();
        await AsyncStorage.setItem('requestQueue', JSON.stringify(this.queue));
      } catch (error) {
        logger.error('Error processing queued request', error);
        if (request.retryCount >= this.maxRetries) {
          request.reject(error);
          this.queue.shift();
        } else {
          request.retryCount++;
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    this.isProcessing = false;
  }

  async restore() {
    const savedQueue = await AsyncStorage.getItem('requestQueue');
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
      this.processQueue();
    }
  }
}

const requestQueue = new RequestQueue();

// 创建 axios 实例
export const api = axios.create({
  baseURL: ENV[getEnvironment()],
  timeout: TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Platform': Platform.OS,
    'X-Platform-Version': Platform.Version,
  },
});

// 网络状态监听
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    requestQueue.processQueue();
  }
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 从 AsyncStorage 获取 token
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 根据请求类型设置超时
    if (config.url?.includes('/upload')) {
      config.timeout = TIMEOUTS.UPLOAD;
    } else if (config.url?.includes('/auth') || config.url?.includes('/payment')) {
      config.timeout = TIMEOUTS.CRITICAL;
    }

    // 记录请求开始时间
    const requestStartTime = Date.now();
    config.metadata = { startTime: requestStartTime };

    // 检查网络状态
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected && !config.offlineDisabled) {
      return new Promise((resolve, reject) => {
        requestQueue.add({
          config,
          resolve,
          reject,
          timestamp: Date.now(),
          retryCount: 0
        });
      });
    }

    return config;
  },
  (error) => {
    logger.error('Request error', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const requestEndTime = Date.now();
    const duration = requestEndTime - (config.metadata?.startTime || requestEndTime);

    // 记录网络请求性能
    monitoring.recordNetworkRequest({
      name: `${config.method?.toUpperCase()} ${config.url}`,
      startTime: config.metadata?.startTime || requestEndTime - duration,
      endTime: requestEndTime,
      duration,
      success: true,
      url: config.url || '',
      method: config.method?.toUpperCase() || 'UNKNOWN',
      status: response.status,
      responseSize: JSON.stringify(response.data).length,
    });

    return response;
  },
  async (error) => {
    const { config, response } = error;
    const requestEndTime = Date.now();
    const duration = requestEndTime - (config?.metadata?.startTime || requestEndTime);

    // 记录失败的网络请求
    monitoring.recordNetworkRequest({
      name: `${config?.method?.toUpperCase()} ${config?.url}`,
      startTime: config?.metadata?.startTime || requestEndTime - duration,
      endTime: requestEndTime,
      duration,
      success: false,
      url: config?.url || '',
      method: config?.method?.toUpperCase() || 'UNKNOWN',
      status: response?.status || 0,
      error: error.message,
    });

    logger.error('Response error', {
      url: config?.url,
      status: response?.status,
      error: error.message,
    });

    return Promise.reject(error);
  }
);

// 初始化
(async () => {
  try {
    await requestQueue.restore();
  } catch (error) {
    logger.error('Error restoring request queue', error);
  }
})();

export default api;
