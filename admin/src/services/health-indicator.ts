import request from '@/utils/request';
import type { 
  HealthIndicator, 
  CreateHealthIndicatorRequest, 
  UpdateHealthIndicatorRequest 
} from '@/types/health-indicator';

const BASE_URL = '/api/v1/health-indicators';

export const healthIndicatorService = {
  // 获取指标列表
  getIndicators: (params?: { 
    category?: string; 
    status?: string;
  }) => request.get<HealthIndicator[]>(BASE_URL, { params }),

  // 获取单个指标
  getIndicator: (id: number) => 
    request.get<HealthIndicator>(`${BASE_URL}/${id}`),

  // 创建指标
  createIndicator: (data: CreateHealthIndicatorRequest) =>
    request.post<HealthIndicator>(BASE_URL, data),

  // 更新指标
  updateIndicator: (id: number, data: UpdateHealthIndicatorRequest) =>
    request.put<HealthIndicator>(`${BASE_URL}/${id}`, data),

  // 删除指标
  deleteIndicator: (id: number) =>
    request.delete(`${BASE_URL}/${id}`),

  // 批量更新状态
  batchUpdateStatus: (ids: number[], status: HealthIndicator['status']) =>
    request.put(`${BASE_URL}/batch-status`, { ids, status }),

  // 验证指标代码唯一性
  validateCode: (code: string, excludeId?: number) =>
    request.get<{ valid: boolean }>(`${BASE_URL}/validate-code`, {
      params: { code, excludeId }
    }),

  // 获取指标统计信息
  getStats: () =>
    request.get<{
      total: number;
      by_category: Record<string, number>;
      by_status: Record<string, number>;
    }>(`${BASE_URL}/stats`),
};
