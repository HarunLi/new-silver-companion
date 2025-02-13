export interface Disease {
  id: number;
  name: string;
  category: 'cardiovascular' | 'endocrine' | 'respiratory' | 'musculoskeletal' | 'neurological' | 'digestive' | 'other';  // 疾病类别
  description: string;
  symptoms: string[];
  risk_factors: string[];
  monitoring_indicators: Array<{
    indicator_id: number;
    name: string;
    frequency: {
      value: number;
      unit: 'hour' | 'day' | 'week' | 'month';
    };
    importance: 'required' | 'recommended' | 'optional';
  }>;
  precautions: Array<{
    category: 'diet' | 'exercise' | 'medication' | 'lifestyle' | 'emergency';
    content: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  emergency_signs: Array<{
    description: string;
    action: string;
    severity: 'critical' | 'severe' | 'moderate';
  }>;
  recommended_exercises?: Array<{
    name: string;
    description: string;
    duration: string;
    frequency: string;
    notes?: string;
  }>;
  dietary_suggestions?: Array<{
    category: 'recommended' | 'limited' | 'avoided';
    foods: string[];
    reason: string;
  }>;
  medication_notes?: Array<{
    category: string;
    notes: string;
    warnings?: string;
  }>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 常见老年疾病类别
export const ELDERLY_DISEASE_CATEGORIES = {
  cardiovascular: {
    label: '心血管疾病',
    examples: ['高血压', '冠心病', '心律失常', '心力衰竭']
  },
  endocrine: {
    label: '内分泌疾病',
    examples: ['糖尿病', '甲状腺疾病', '骨质疏松']
  },
  respiratory: {
    label: '呼吸系统疾病',
    examples: ['慢性支气管炎', '肺气肿', '哮喘']
  },
  musculoskeletal: {
    label: '骨骼肌肉疾病',
    examples: ['关节炎', '腰椎间盘突出', '骨质疏松']
  },
  neurological: {
    label: '神经系统疾病',
    examples: ['帕金森病', '阿尔茨海默病', '中风']
  },
  digestive: {
    label: '消化系统疾病',
    examples: ['胃炎', '便秘', '消化性溃疡']
  },
  other: {
    label: '其他疾病',
    examples: ['白内障', '前列腺疾病', '失眠']
  }
};

export interface CreateDiseaseRequest {
  name: string;
  category: Disease['category'];
  description: string;
  symptoms: string[];
  risk_factors: string[];
  monitoring_indicators: Disease['monitoring_indicators'];
  precautions: Disease['precautions'];
  emergency_signs: Disease['emergency_signs'];
  recommended_exercises?: Disease['recommended_exercises'];
  dietary_suggestions?: Disease['dietary_suggestions'];
  medication_notes?: Disease['medication_notes'];
}

export interface UpdateDiseaseRequest extends Partial<CreateDiseaseRequest> {
  status?: Disease['status'];
}
