export interface GuideComment {
  id: number;
  guide_id: number;
  user_id: number;
  user_type: 'elder' | 'family' | 'admin';
  content: string;
  rating?: number;
  parent_id?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GuideFAQ {
  id: number;
  guide_id: number;
  question: string;
  answer: string;
  category?: string;
  views: number;
  helpful_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  guide_id: number;
  user_id: number;
  user_type: GuideComment['user_type'];
  content: string;
  rating?: number;
  parent_id?: number;
}

export interface CreateFAQRequest {
  guide_id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface UpdateFAQRequest extends Partial<CreateFAQRequest> {
  status?: GuideFAQ['status'];
}
