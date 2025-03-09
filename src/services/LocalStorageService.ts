import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, DailyTask, CustomTask } from '../@types';

class LocalStorageService {
  static GAMES_STORAGE_KEY = 'user_games';

  // JSON文字列化前にDateオブジェクトを処理
  private static replacer(key: string, value: any) {
    if ((key === 'lastCompletedAt' || key === 'lastResetAt') && value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  // JSON解析後にDateオブジェクトを復元
  private static reviver(key: string, value: any) {
    if ((key === 'lastCompletedAt' || key === 'lastResetAt') && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }

  // ゲームデータの保存
  static async saveGames(games: Game[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(games, this.replacer);
      await AsyncStorage.setItem(this.GAMES_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('ゲームデータの保存エラー:', error);
    }
  }

  // ゲームデータの取得
  static async getGames(): Promise<Game[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.GAMES_STORAGE_KEY);
      const games = jsonValue != null 
        ? JSON.parse(jsonValue, this.reviver) 
        : [];
      
      // データ形式の移行を行う
      return this.migrateGameDataFormat(games);
    } catch (error) {
      console.error('ゲームデータの取得エラー:', error);
      return [];
    }
  }

  // 特定のゲームを追加
  static async addGame(game: Game): Promise<void> {
    try {
      const currentGames = await this.getGames();
      const updatedGames = [...currentGames, game];
      await this.saveGames(updatedGames);
    } catch (error) {
      console.error('ゲームの追加エラー:', error);
    }
  }

  // 自動タスクリセットのチェック
  static async checkAndResetDailyTasks(): Promise<void> {
    try {
      const currentGames = await this.getGames();
      const now = new Date();

      const updatedGames = currentGames.map(game => {
        // ゲームのタスクをマップで更新
        const updatedTasks = game.dailyTasks.map(task => {
          // リセット設定を取得（タスク固有かゲーム共通か）
          const resetTimes = task.resetSettings.type === 'custom' 
            ? task.resetSettings.times 
            : game.resetTimes;
          
          const lastResetAt = task.resetSettings.lastResetAt || new Date(0);
          let shouldReset = false;
          
          // 各リセット時間をチェック
          for (const timeStr of resetTimes) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const resetDate = new Date();
            resetDate.setHours(hours, minutes, 0, 0);
            
            // 現在時刻がリセット時間を過ぎており、前回のリセットよりも後であれば
            if (now >= resetDate && lastResetAt < resetDate) {
              shouldReset = true;
              break;
            }
          }
          
          // リセットが必要な場合
          if (shouldReset) {
            return {
              ...task,
              completed: false,
              lastCompletedAt: null,
              resetSettings: {
                ...task.resetSettings,
                lastResetAt: now
              }
            };
          }
          
          return task;
        });
        
        return { ...game, dailyTasks: updatedTasks };
      });

      await this.saveGames(updatedGames);
    } catch (error) {
      console.error('自動タスクリセットエラー:', error);
    }
  }

  // 既存のデータを新しいフォーマットに移行
  private static migrateGameDataFormat(games: any[]): Game[] {
    return games.map(game => {
      // Game に resetTimes がなければ追加
      if (!game.resetTimes) {
        game.resetTimes = [game.resetTime]; // 既存のリセット時間を配列の最初の要素にする
      }
      
      // タスクにリセット設定がなければ追加
      const updatedTasks = game.dailyTasks.map((task: any) => {
        if (!task.resetSettings) {
          return {
            ...task,
            resetSettings: {
              type: 'game',  // デフォルトでゲーム共通設定を使用
              times: [],     // カスタム時間は空配列
              lastResetAt: null,
            }
          };
        }
        return task;
      });
      
      return { ...game, dailyTasks: updatedTasks };
    });
  }
}

export default LocalStorageService;