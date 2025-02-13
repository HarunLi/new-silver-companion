import { request } from './request';

const BASE_URL = '/pets';

export const petService = {
  async getPets() {
    return request.get(BASE_URL);
  },

  async getPet(id: number) {
    return request.get(`${BASE_URL}/${id}`);
  },

  async createPet(data: any) {
    return request.post(BASE_URL, data);
  },

  async updatePet(id: number, data: any) {
    return request.put(`${BASE_URL}/${id}`, data);
  },

  async deletePet(id: number) {
    return request.delete(`${BASE_URL}/${id}`);
  },
};

export default petService;
