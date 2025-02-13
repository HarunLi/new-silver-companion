export interface Activity {
  id: number;
  title: string;
  type: 'exercise' | 'social' | 'entertainment' | 'health';
  description: string;
  scheduled_time: string;
  duration: number; // 单位：分钟
  location?: string;
  elder_id: number;
  companion_required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  title: string;
  type: 'exercise' | 'social' | 'entertainment' | 'health';
  description: string;
  scheduled_time: string;
  duration: number;
  location?: string;
  elder_id: number;
  companion_required: boolean;
}

export interface UpdateActivityStatusRequest {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completion_notes?: string;
}
