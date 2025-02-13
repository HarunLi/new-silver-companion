import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { monitoring } from './monitoring';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const STORAGE_KEY = 'app_logs';
const MAX_LOGS = 1000;
const RETENTION_DAYS = 7;

class Logger {
  private static instance: Logger;
  private minLevel: LogLevel = LogLevel.INFO;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    // 每分钟将日志写入存储
    this.flushInterval = setInterval(() => this.flush(), 60 * 1000);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 设置最小日志级别
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  // 记录调试信息
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  // 记录一般信息
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  // 记录警告信息
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  // 记录错误信息
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const errorInfo = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log(LogLevel.ERROR, message, metadata, errorInfo);

    // 同时记录到监控系统
    if (error) {
      monitoring.recordError(error, {
        ...metadata,
        logMessage: message,
      });
    }
  }

  // 获取所有日志
  async getLogs(
    level?: LogLevel,
    startTime?: number,
    endTime?: number
  ): Promise<LogEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let logs: LogEntry[] = stored ? JSON.parse(stored) : [];

      // 添加内存中的日志
      logs = [...this.buffer, ...logs];

      // 应用过滤器
      return logs.filter(log => {
        const matchesLevel = !level || log.level === level;
        const matchesTimeRange = (!startTime || log.timestamp >= startTime) &&
                               (!endTime || log.timestamp <= endTime);
        return matchesLevel && matchesTimeRange;
      });
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  // 清除所有日志
  async clearLogs(): Promise<void> {
    try {
      this.buffer = [];
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  // 导出日志
  async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  // 停止日志服务
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }

  private async log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: LogEntry['error']
  ): Promise<void> {
    // 检查日志级别
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level,
        message,
        metadata: {
          ...metadata,
          platform: Platform.OS,
          version: Platform.Version,
        },
        error,
      };

      // 添加到缓冲区
      this.buffer.push(entry);

      // 如果是错误日志，立即刷新
      if (level === LogLevel.ERROR) {
        await this.flush();
      }
      // 如果缓冲区太大，也立即刷新
      else if (this.buffer.length >= 100) {
        await this.flush();
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      // 获取现有日志
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let logs: LogEntry[] = stored ? JSON.parse(stored) : [];

      // 添加新日志
      logs = [...this.buffer, ...logs];

      // 移除超过保留期限的日志
      const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
      logs = logs.filter(log => log.timestamp >= cutoffTime);

      // 限制日志数量
      logs = logs.slice(0, MAX_LOGS);

      // 保存日志
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

      // 清空缓冲区
      this.buffer = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }
}

export const logger = Logger.getInstance();
