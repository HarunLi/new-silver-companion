import request from '@/utils/request';
import type { 
  GuideComment, 
  GuideFAQ, 
  CreateCommentRequest, 
  CreateFAQRequest,
  UpdateFAQRequest 
} from '@/types/guide-interaction';

const COMMENT_URL = '/api/v1/guide-comments';
const FAQ_URL = '/api/v1/guide-faqs';

export const guideInteractionService = {
  // 评论相关
  getComments: (guideId: number) => 
    request.get<GuideComment[]>(`${COMMENT_URL}`, { params: { guide_id: guideId } }),
  
  createComment: (data: CreateCommentRequest) =>
    request.post<GuideComment>(COMMENT_URL, data),
  
  updateCommentStatus: (id: number, status: GuideComment['status']) =>
    request.put<GuideComment>(`${COMMENT_URL}/${id}/status`, { status }),
  
  deleteComment: (id: number) =>
    request.delete(`${COMMENT_URL}/${id}`),

  // FAQ相关
  getFAQs: (guideId: number) =>
    request.get<GuideFAQ[]>(`${FAQ_URL}`, { params: { guide_id: guideId } }),
  
  createFAQ: (data: CreateFAQRequest) =>
    request.post<GuideFAQ>(FAQ_URL, data),
  
  updateFAQ: (id: number, data: UpdateFAQRequest) =>
    request.put<GuideFAQ>(`${FAQ_URL}/${id}`, data),
  
  deleteFAQ: (id: number) =>
    request.delete(`${FAQ_URL}/${id}`),
  
  incrementFAQHelpful: (id: number) =>
    request.post(`${FAQ_URL}/${id}/helpful`),
  
  // 搜索相关
  searchComments: (query: string) =>
    request.get<GuideComment[]>(`${COMMENT_URL}/search`, { params: { query } }),
  
  searchFAQs: (query: string) =>
    request.get<GuideFAQ[]>(`${FAQ_URL}/search`, { params: { query } }),
};
