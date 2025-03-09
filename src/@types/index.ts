export interface Game {
  id: string;
  name: string;
  resetTime: string;
  resetTimes: string[];     // 複数のリセット時間（例: ["06:00", "18:00"]）
  dailyTasks: DailyTask[];
  customTasks: CustomTask[];
  favorite?: boolean;       // お気に入り設定フラグ（追加）
  order?: number;           // カスタム並び順（ドラッグ＆ドロップ用）（追加）
  lastCompletedAt?: Date | null; // ゲーム全体の最終完了時間（追加）
}

export interface DailyTask {
  id: string;
  name: string;
  completed: boolean;
  lastCompletedAt?: Date | null;
  resetSettings: {
    type: 'game' | 'custom'; // ゲーム共通のリセット時間を使うか、カスタム設定を使うか
    times: string[];         // リセット時間のリスト（例: ["06:00", "18:00"]）
    lastResetAt?: Date | null; // 最後にリセットされた時間
  };
}

export interface CustomTask {
  id: string;
  name: string;
  type: 'checkbox' | 'counter';
  value?: number;
  maxValue?: number;
  completed: boolean;
}