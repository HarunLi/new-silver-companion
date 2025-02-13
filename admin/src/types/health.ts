export interface HealthRecord {
  id: number;
  elder_id: number;
  record_type: 'vital_signs' | 'medication' | 'exercise' | 'diet' | 'sleep' | 'medical_visit';
  record_date: string;
  data: {
    // 生命体征
    vital_signs?: {
      blood_pressure?: string;
      heart_rate?: number;
      blood_sugar?: number;
      temperature?: number;
      weight?: number;
      height?: number;
    };
    // 用药记录
    medication?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      time: string;
      notes?: string;
    }>;
    // 运动记录
    exercise?: {
      type: string;
      duration: number;
      intensity: 'low' | 'medium' | 'high';
      steps?: number;
      notes?: string;
    };
    // 饮食记录
    diet?: Array<{
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      time: string;
      foods: Array<{
        name: string;
        portion: string;
        calories?: number;
      }>;
      notes?: string;
    }>;
    // 睡眠记录
    sleep?: {
      start_time: string;
      end_time: string;
      quality: 'poor' | 'fair' | 'good';
      interruptions?: number;
      notes?: string;
    };
    // 就医记录
    medical_visit?: {
      hospital: string;
      department: string;
      doctor: string;
      diagnosis?: string;
      prescription?: string;
      next_visit?: string;
      notes?: string;
    };
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthAlert {
  id: number;
  elder_id: number;
  type: 'medication' | 'appointment' | 'exercise' | 'vital_signs';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  scheduled_time: string;
  status: 'pending' | 'completed' | 'missed';
  created_at: string;
  updated_at: string;
}

export interface HealthGoal {
  id: number;
  elder_id: number;
  type: 'exercise' | 'diet' | 'medication' | 'vital_signs';
  title: string;
  description: string;
  target: {
    metric: string;
    value: number;
    unit: string;
  };
  start_date: string;
  end_date: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface CreateHealthRecordRequest {
  elder_id: number;
  record_type: HealthRecord['record_type'];
  record_date: string;
  data: HealthRecord['data'];
  notes?: string;
}

export interface UpdateHealthRecordRequest extends Partial<CreateHealthRecordRequest> {}
