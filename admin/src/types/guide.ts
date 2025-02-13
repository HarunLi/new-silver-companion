export interface Guide {
  id: number;
  title: string;
  category: 'transportation' | 'device' | 'app' | 'service' | 'health' | 'other';
  sub_category?: string;  // 例如：地铁、高铁、公交等
  difficulty_level: 'easy' | 'medium' | 'hard';
  content: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    image_url?: string;
    tips?: string;
  }>;
  common_problems?: Array<{
    question: string;
    answer: string;
  }>;
  related_links?: Array<{
    title: string;
    url: string;
  }>;
  views: number;
  likes: number;
  region?: string;  // 适用地区
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuideRequest {
  title: string;
  category: 'transportation' | 'device' | 'app' | 'service' | 'health' | 'other';
  sub_category?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  content: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    image_url?: string;
    tips?: string;
  }>;
  common_problems?: Array<{
    question: string;
    answer: string;
  }>;
  related_links?: Array<{
    title: string;
    url: string;
  }>;
  region?: string;
}

export interface UpdateGuideRequest extends Partial<CreateGuideRequest> {
  views?: number;
  likes?: number;
}
