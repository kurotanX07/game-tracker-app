import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, DailyTask, CustomTask } from '../@types';

class LocalStorageService {
  static GAMES_STORAGE_KEY = 'user_games';
  static DISPLAY_SETTINGS_KEY = 'display_settings'; // 表示設定用のキーを追加

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
          // 日付指定タイプの場合は終了日時をチェック
          if (task.resetSettings.type === 'date' && task.resetSettings.endDate) {
            // 終了日時を生成
            const endDate = new Date(task.resetSettings.endDate);
            
            // 終了時間が指定されている場合はそれを使用、なければ23:59:59
            if (task.resetSettings.endTime) {
              const [hours, minutes] = task.resetSettings.endTime.split(':').map(Number);
              endDate.setHours(hours, minutes, 0, 0);
            } else {
              endDate.setHours(23, 59, 59, 999); // 終了日の終わりを設定
            }
            
            // 現在日時が終了日時を過ぎている場合はリセット
            if (now > endDate) {
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
            
            // 終了日時以前の場合はリセットしない
            return task;
          }
          
          // 通常のリセット（時間ベース）
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
      
      // タスクにresetSettingsがない場合は追加
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
  
  // 表示設定の保存
  static async saveDisplaySettings(settings: {
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  }): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(this.DISPLAY_SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('表示設定の保存エラー:', error);
    }
  }

  // 表示設定の取得
  static async getDisplaySettings(): Promise<{
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  }> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.DISPLAY_SETTINGS_KEY);
      return jsonValue != null 
        ? JSON.parse(jsonValue) 
        : {
            sortCompletedToBottom: true,
            sortByResetTime: true,
            allowDragDrop: false
          };
    } catch (error) {
      console.error('表示設定の取得エラー:', error);
      return {
        sortCompletedToBottom: true,
        sortByResetTime: true,
        allowDragDrop: false
      };
    }
  }
}

export default LocalStorageService;