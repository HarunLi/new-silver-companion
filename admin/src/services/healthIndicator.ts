import { request } from './request';

const BASE_URL = '/health-indicators';

export const healthIndicatorService = {
  async getHealthIndicators() {
    return request.get(BASE_URL);
  },

  async getHealthIndicator(id: number) {
    return request.get(`${BASE_URL}/${id}`);
  },

  async createHealthIndicator(data: any) {
    return request.post(BASE_URL, data);
  },

  async updateHealthIndicator(id: number, data: any) {
    return request.put(`${BASE_URL}/${id}`, data);
  },

  async deleteHealthIndicator(id: number) {
    return request.delete(`${BASE_URL}/${id}`);
  },
};

export default healthIndicatorService;
