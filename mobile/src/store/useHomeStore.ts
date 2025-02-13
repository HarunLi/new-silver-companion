import { create } from 'zustand';
import { healthService, HealthData } from '../services/health';
import { todoService, Todo } from '../services/todo';
import { activityService, Activity } from '../services/activity';
import { tipService, Tip } from '../services/tip';

interface HomeState {
  healthData: HealthData | null;
  todos: Todo[];
  activities: Activity[];
  tips: Tip[];
  isLoading: boolean;
  error: string | null;

  // 加载所有数据
  loadAll: () => Promise<void>;
  
  // 健康数据
  loadHealthData: () => Promise<void>;
  
  // 待办事项
  loadTodos: () => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  
  // 活动
  loadActivities: () => Promise<void>;
  joinActivity: (id: number) => Promise<void>;
  
  // 健康小贴士
  loadTips: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  healthData: null,
  todos: [],
  activities: [],
  tips: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadHealthData(),
        get().loadTodos(),
        get().loadActivities(),
        get().loadTips(),
      ]);
    } catch (error) {
      set({ error: '加载数据失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadHealthData: async () => {
    try {
      const data = await healthService.getDailyHealth();
      set({ healthData: data });
    } catch (error) {
      set({ error: '加载健康数据失败' });
    }
  },

  loadTodos: async () => {
    try {
      const todos = await todoService.getDailyTodos();
      set({ todos });
    } catch (error) {
      set({ error: '加载待办事项失败' });
    }
  },

  toggleTodo: async (id: number) => {
    try {
      const updatedTodo = await todoService.toggleTodo(id);
      set(state => ({
        todos: state.todos.map(todo =>
          todo.id === id ? updatedTodo : todo
        ),
      }));
    } catch (error) {
      set({ error: '更新待办事项失败' });
    }
  },

  loadActivities: async () => {
    try {
      const activities = await activityService.getRecommendedActivities();
      set({ activities });
    } catch (error) {
      set({ error: '加载活动失败' });
    }
  },

  joinActivity: async (id: number) => {
    try {
      await activityService.joinActivity(id);
      // 重新加载活动列表以更新参与人数
      await get().loadActivities();
    } catch (error) {
      set({ error: '报名活动失败' });
    }
  },

  loadTips: async () => {
    try {
      const tips = await tipService.getRecommendedTips();
      set({ tips });
    } catch (error) {
      set({ error: '加载健康小贴士失败' });
    }
  },
}));
