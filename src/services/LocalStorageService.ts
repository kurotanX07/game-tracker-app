import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, DailyTask, CustomTask } from '../@types';

class LocalStorageService {
  static GAMES_STORAGE_KEY = 'user_games';

  // JSON文字列化前にDateオブジェクトを処理
  private static replacer(key: string, value: any) {
    if (key === 'lastCompletedAt' && value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  // JSON解析後にDateオブジェクトを復元
  private static reviver(key: string, value: any) {
    if (key === 'lastCompletedAt' && typeof value === 'string') {
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
      return jsonValue != null 
        ? JSON.parse(jsonValue, this.reviver) 
        : [];
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
        const [hours, minutes] = game.resetTime.split(':').map(Number);
        const resetDate = new Date();
        resetDate.setHours(hours, minutes, 0, 0);

        // リセット時間を過ぎている場合にタスクをリセット
        if (now >= resetDate) {
          return {
            ...game,
            dailyTasks: game.dailyTasks.map(task => ({
              ...task,
              completed: false,
              lastCompletedAt: null
            }))
          };
        }
        return game;
      });

      await this.saveGames(updatedGames);
    } catch (error) {
      console.error('自動タスクリセットエラー:', error);
    }
  }
}

export default LocalStorageService;