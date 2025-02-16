import request from '@/utils/request';
import type { Guide, CreateGuideRequest, UpdateGuideRequest } from '@/types/guide';

const BASE_URL = '/api/v1/guides';

export const guideService = {
  // 获取指南列表
  getGuides: (params?: { category?: string; region?: string }) => 
    request.get<Guide[]>(BASE_URL, { params }),
  
  // 获取单个指南详情
  getGuide: (id: number) => request.get<Guide>(`${BASE_URL}/${id}`),
  
  // 创建指南
  createGuide: (data: CreateGuideRequest) => 
    request.post<Guide>(BASE_URL, data),
  
  // 更新指南
  updateGuide: (id: number, data: UpdateGuideRequest) =>
    request.put<Guide>(`${BASE_URL}/${id}`, data),
  
  // 删除指南
  deleteGuide: (id: number) => request.delete(`${BASE_URL}/${id}`),
  
  // 增加浏览量
  incrementViews: (id: number) =>
    request.post(`${BASE_URL}/${id}/views`),
  
  // 点赞/取消点赞
  toggleLike: (id: number) =>
    request.post(`${BASE_URL}/${id}/likes`),
  
  // 获取热门指南
  getPopularGuides: (limit: number = 10) =>
    request.get<Guide[]>(`${BASE_URL}/popular`, { params: { limit } }),
  
  // 搜索指南
  searchGuides: (query: string) =>
    request.get<Guide[]>(`${BASE_URL}/search`, { params: { query } }),
};
