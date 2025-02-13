export interface HealthIndicator {
  id: number;
  name: string;                    // 指标名称
  code: string;                    // 指标代码
  category: 'vital_signs' | 'body_metrics' | 'blood_test' | 'other';  // 指标类别
  unit: string;                    // 单位
  description: string;             // 描述
  normal_ranges: Array<{          // 不同年龄段的正常范围
    min_age: number;
    max_age: number;
    gender?: 'male' | 'female';
    min_value: number;
    max_value: number;
  }>;
  warning_rules: Array<{          // 警报规则
    condition: 'lt' | 'gt' | 'between' | 'outside';  // 小于、大于、区间内、区间外
    value1: number;
    value2?: number;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  measurement_frequency?: {       // 建议测量频率
    value: number;
    unit: 'hour' | 'day' | 'week' | 'month';
  };
  display_format?: string;        // 显示格式
  status: 'active' | 'inactive';  // 状态
  created_at: string;
  updated_at: string;
}

export interface CreateHealthIndicatorRequest {
  name: string;
  code: string;
  category: HealthIndicator['category'];
  unit: string;
  description: string;
  normal_ranges: HealthIndicator['normal_ranges'];
  warning_rules: HealthIndicator['warning_rules'];
  measurement_frequency?: HealthIndicator['measurement_frequency'];
  display_format?: string;
}

export interface UpdateHealthIndicatorRequest extends Partial<CreateHealthIndicatorRequest> {
  status?: HealthIndicator['status'];
}
