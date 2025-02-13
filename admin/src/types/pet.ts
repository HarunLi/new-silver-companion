export interface VirtualPet {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';  // 电子宠物类型
  level: number;  // 宠物等级
  mood: number;   // 心情值 0-100
  energy: number; // 能量值 0-100
  health: number; // 健康值 0-100
  happiness: number; // 幸福值 0-100
  last_interaction: string; // 最后互动时间
  owner_id: number; // 所属老人ID
  family_members: Array<{  // 关联的家庭成员
    id: number;
    name: string;
    relationship: string;
  }>;
  daily_tasks: Array<{  // 每日任务
    id: number;
    type: 'health_check' | 'exercise' | 'social' | 'medicine';
    name: string;
    description: string;
    completed: boolean;
    completion_time?: string;
  }>;
  achievements: Array<{  // 成就系统
    id: number;
    name: string;
    description: string;
    unlocked: boolean;
    unlock_time?: string;
  }>;
  interaction_history: Array<{  // 互动历史
    id: number;
    type: 'feed' | 'play' | 'health_check' | 'exercise' | 'social';
    description: string;
    timestamp: string;
    performed_by: {
      id: number;
      name: string;
      role: 'elder' | 'family';
    };
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateVirtualPetRequest {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  owner_id: number;
  family_members: Array<{
    id: number;
    name: string;
    relationship: string;
  }>;
}

export interface PetInteractionRequest {
  type: 'feed' | 'play' | 'health_check' | 'exercise' | 'social';
  description?: string;
}

export interface UpdatePetStatusRequest {
  mood?: number;
  energy?: number;
  health?: number;
  happiness?: number;
  level?: number;
}
