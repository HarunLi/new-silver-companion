import { request } from './request';

const BASE_URL = '/guidelines';

export const guidelineService = {
  async getGuidelines() {
    return request.get(BASE_URL);
  },

  async getGuideline(id: number) {
    return request.get(`${BASE_URL}/${id}`);
  },

  async createGuideline(data: any) {
    return request.post(BASE_URL, data);
  },

  async updateGuideline(id: number, data: any) {
    return request.put(`${BASE_URL}/${id}`, data);
  },

  async deleteGuideline(id: number) {
    return request.delete(`${BASE_URL}/${id}`);
  },
};

export default guidelineService;
