import { request } from './request';

const BASE_URL = '/activities';

export const activityService = {
  async getActivities() {
    return request.get(BASE_URL);
  },

  async getActivity(id: number) {
    return request.get(`${BASE_URL}/${id}`);
  },

  async createActivity(data: any) {
    return request.post(BASE_URL, data);
  },

  async updateActivity(id: number, data: any) {
    return request.put(`${BASE_URL}/${id}`, data);
  },

  async deleteActivity(id: number) {
    return request.delete(`${BASE_URL}/${id}`);
  },
};

export default activityService;
