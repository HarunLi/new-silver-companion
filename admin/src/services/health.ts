import { request } from './request';

export interface HealthRecord {
  id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
  record_type: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'temperature' | 'weight' | 'sleep' | 'medication';
  value: string;
  unit: string;
  measured_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthAlert {
  id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
  alert_type: 'abnormal_vital_signs' | 'medication_reminder' | 'appointment_reminder' | 'emergency';
  status: 'active' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high';
  message: string;
  created_at: string;
  resolved_at?: string;
}

export interface HealthRecordCreate {
  user_id: number;
  record_type: string;
  value: string;
  unit: string;
  measured_at: string;
  notes?: string;
}

export interface HealthRecordUpdate extends Partial<HealthRecordCreate> {}

export const healthService = {
  // 获取健康记录列表
  getHealthRecords: async (params?: { 
    user_id?: number;
    record_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<HealthRecord[]> => {
    return request.get('/health/records', { params });
  },

  // 获取单个健康记录
  getHealthRecord: async (id: number): Promise<HealthRecord> => {
    return request.get(`/health/records/${id}`);
  },

  // 创建健康记录
  createHealthRecord: async (data: HealthRecordCreate): Promise<HealthRecord> => {
    return request.post('/health/records', data);
  },

  // 更新健康记录
  updateHealthRecord: async (id: number, data: HealthRecordUpdate): Promise<HealthRecord> => {
    return request.put(`/health/records/${id}`, data);
  },

  // 删除健康记录
  deleteHealthRecord: async (id: number): Promise<void> => {
    await request.delete(`/health/records/${id}`);
  },

  // 获取健康警报列表
  getHealthAlerts: async (params?: {
    user_id?: number;
    status?: string;
    severity?: string;
  }): Promise<HealthAlert[]> => {
    return request.get('/health/alerts', { params });
  },

  // 更新健康警报状态
  updateHealthAlertStatus: async (id: number, status: string): Promise<HealthAlert> => {
    return request.put(`/health/alerts/${id}/status`, { status });
  },

  // 获取健康统计数据
  getHealthStats: async (params: {
    user_id: number;
    record_type: string;
    start_date: string;
    end_date: string;
  }) => {
    return request.get('/health/stats', { params });
  }
};
