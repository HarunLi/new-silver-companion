import { request } from './request';

const BASE_URL = '/diseases';

export const diseaseService = {
  // 获取疾病列表
  async getDiseases(params?: { 
    category?: string; 
    status?: string;
  }) {
    return request.get(BASE_URL, { params });
  },

  // 获取单个疾病详情
  async getDisease(id: number) {
    return request.get(`${BASE_URL}/${id}`);
  },

  // 创建疾病
  async createDisease(data: any) {
    return request.post(BASE_URL, data);
  },

  // 更新疾病
  async updateDisease(id: number, data: any) {
    return request.put(`${BASE_URL}/${id}`, data);
  },

  // 删除疾病
  async deleteDisease(id: number) {
    return request.delete(`${BASE_URL}/${id}`);
  },

  // 批量更新状态
  async batchUpdateStatus(ids: number[], status: any) {
    return request.put(`${BASE_URL}/batch-status`, { ids, status });
  },

  // 获取疾病统计信息
  async getStats() {
    return request.get<{
      total: number;
      by_category: Record<string, number>;
      by_status: Record<string, number>;
    }>(`${BASE_URL}/stats`);
  },

  // 搜索疾病
  async searchDiseases(query: string) {
    return request.get(`${BASE_URL}/search`, { params: { query } });
  },

  // 获取相关疾病
  async getRelatedDiseases(id: number) {
    return request.get(`${BASE_URL}/${id}/related`);
  },

  // 获取疾病的监测指标建议
  async getMonitoringSuggestions(id: number) {
    return request.get(`${BASE_URL}/${id}/monitoring`);
  },

  // 获取疾病的饮食建议
  async getDietarySuggestions(id: number) {
    return request.get(`${BASE_URL}/${id}/diet`);
  },

  // 获取疾病的运动建议
  async getExerciseSuggestions(id: number) {
    return request.get(`${BASE_URL}/${id}/exercises`);
  },
};

export default diseaseService;
