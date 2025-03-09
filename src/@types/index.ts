export interface Game {
    id: string;
    name: string;
    resetTime: string;
    dailyTasks: DailyTask[];
    customTasks: CustomTask[];
  }
  
  export interface DailyTask {
    id: string;
    name: string;
    completed: boolean;
    lastCompletedAt?: Date | null;
  }
  
  export interface CustomTask {
    id: string;
    name: string;
    type: 'checkbox' | 'counter';
    value?: number;
    maxValue?: number;
    completed: boolean;
  }