import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Game, DailyTask } from '../@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  // ストレージキー
  static NOTIFICATION_SETTINGS_KEY = 'task_notification_settings';
  static NOTIFICATION_LAST_SCHEDULED_KEY = 'task_notification_last_scheduled';
  static NOTIFICATION_INIT_KEY = 'notification_initialized';
  static DEBUG_MODE = true; // デバッグログの有効化/無効化
  
  // ログ出力用ヘルパー関数
  static log(message: string, data?: any) {
    if (this.DEBUG_MODE) {
      if (data) {
        console.log(`[通知サービス] ${message}`, data);
      } else {
        console.log(`[通知サービス] ${message}`);
      }
    }
  }
  
  // 通知許可の要求
  static async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'デフォルト',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return await Notifications.requestPermissionsAsync();
  }

  // タスク通知設定を保存
  static async saveTaskNotificationSetting(taskId: string, enabled: boolean): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      const settings = settingsJson ? JSON.parse(settingsJson) : {};
      
      settings[taskId] = enabled;
      this.log(`タスク ${taskId} の通知設定を ${enabled ? '有効' : '無効'} に変更しました`);
      
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('通知設定の保存に失敗しました:', error);
    }
  }

  // タスク通知設定を取得
  static async getTaskNotificationSetting(taskId: string): Promise<boolean> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      const settings = settingsJson ? JSON.parse(settingsJson) : {};
      
      // デフォルトでfalse
      return settings[taskId] === true;
    } catch (error) {
      console.error('通知設定の取得に失敗しました:', error);
      return false;
    }
  }
  
  // 最後に通知がスケジュールされた時間を保存
  static async saveLastScheduledTime(taskId: string): Promise<void> {
    try {
      const lastScheduledJson = await AsyncStorage.getItem(this.NOTIFICATION_LAST_SCHEDULED_KEY);
      const lastScheduled = lastScheduledJson ? JSON.parse(lastScheduledJson) : {};
      
      lastScheduled[taskId] = new Date().toISOString();
      
      await AsyncStorage.setItem(this.NOTIFICATION_LAST_SCHEDULED_KEY, JSON.stringify(lastScheduled));
    } catch (error) {
      console.error('最終スケジュール時間の保存に失敗:', error);
    }
  }
  
  // 最後に通知がスケジュールされた時間を取得
  static async getLastScheduledTime(taskId: string): Promise<Date | null> {
    try {
      const lastScheduledJson = await AsyncStorage.getItem(this.NOTIFICATION_LAST_SCHEDULED_KEY);
      const lastScheduled = lastScheduledJson ? JSON.parse(lastScheduledJson) : {};
      
      if (lastScheduled[taskId]) {
        return new Date(lastScheduled[taskId]);
      }
      
      return null;
    } catch (error) {
      console.error('最終スケジュール時間の取得に失敗:', error);
      return null;
    }
  }
  
  // スケジュール可能かをチェック（前回から10分以上経過していること）
  static async canScheduleNotification(taskId: string): Promise<boolean> {
    const lastScheduled = await this.getLastScheduledTime(taskId);
    
    if (!lastScheduled) {
      return true;
    }
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastScheduled.getTime()) / (1000 * 60);
    
    // 前回のスケジュールから10分以上経過している場合のみ許可（短時間での再スケジュールを防止）
    return diffMinutes >= 10;
  }

  // アプリ初期化済みかチェック
  static async isInitialized(): Promise<boolean> {
    try {
      const initialized = await AsyncStorage.getItem(this.NOTIFICATION_INIT_KEY);
      return initialized === 'true';
    } catch (error) {
      return false;
    }
  }

  // アプリ初期化済みフラグを設定
  static async setInitialized(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATION_INIT_KEY, 'true');
    } catch (error) {
      console.error('初期化フラグの保存に失敗:', error);
    }
  }
  
  // すべての通知をリセット（アプリ起動時用）
  static async resetAllNotifications(): Promise<void> {
    try {
      // 既存のすべての通知をキャンセル
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.log('すべての通知をリセットしました');
    } catch (error) {
      console.error('通知のリセットに失敗:', error);
    }
  }

  // タスクのリセット通知をスケジュール
  static async scheduleTaskResetNotification(game: Game, task: DailyTask) {
    // 通知が有効かチェック
    const isEnabled = await this.getTaskNotificationSetting(task.id);
    if (!isEnabled) {
      // 通知が無効な場合は既存の通知をキャンセルして終了
      await this.cancelTaskNotifications(task.id);
      this.log(`タスク ${task.id} (${task.name}) の通知は無効なためスキップします`);
      return;
    }
    
    // スケジュール可能かチェック（直接トグルしたときなど連続してスケジュールしないため）
    const canSchedule = await this.canScheduleNotification(task.id);
    if (!canSchedule) {
      this.log(`タスク ${task.id} (${task.name}) の通知スケジュールをスキップ: 短時間に複数回スケジュールされました`);
      return;
    }
    
    // 許可を確認
    const { status } = await this.requestPermissions();
    if (status !== 'granted') {
      this.log('通知の許可が得られていません');
      return;
    }
    
    // リセット時間を取得（タスク固有かゲーム共通か）
    const resetTimes = task.resetSettings.type === 'custom' 
      ? task.resetSettings.times 
      : game.resetTimes;
    
    if (resetTimes.length === 0) {
      this.log(`タスク ${task.id} (${task.name}) にリセット時間が設定されていません`);
      return;
    }
    
    // まず既存の通知をキャンセル
    await this.cancelTaskNotifications(task.id);
    this.log(`タスク ${task.id} (${task.name}) の既存の通知をキャンセルしました`);
    
    // 各リセット時間に通知をスケジュール
    let scheduledCount = 0;
    
    for (const timeStr of resetTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // リセット時間5分前の事前通知
      let beforeMinutes = minutes >= 5 ? minutes - 5 : minutes + 55;
      let beforeHours = minutes >= 5 ? hours : (hours === 0 ? 23 : hours - 1);
      
      try {
        // 通知ID
        const beforeId = `task_${task.id}_before_${timeStr.replace(':', '')}`;
        const afterId = `task_${task.id}_after_${timeStr.replace(':', '')}`;
        
        // スケジュール済みの通知を確認
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const existingBeforeNotification = scheduledNotifications.find(n => n.identifier === beforeId);
        const existingAfterNotification = scheduledNotifications.find(n => n.identifier === afterId);
        
        // 通知が既に存在する場合はスキップ
        if (existingBeforeNotification) {
          this.log(`タスク ${task.id} の事前通知 ${timeStr} は既にスケジュールされています`);
        } else {
          // リセット時間5分前の事前通知
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${game.name} リセットまもなく`,
              body: `「${task.name}」が5分後にリセットされます`,
              data: { gameId: game.id, taskId: task.id, type: 'before_reset' },
            },
            trigger: {
              hour: beforeHours,
              minute: beforeMinutes,
              repeats: true,
            },
            identifier: beforeId
          });
          scheduledCount++;
        }
        
        if (existingAfterNotification) {
          this.log(`タスク ${task.id} のリセット通知 ${timeStr} は既にスケジュールされています`);
        } else {
          // リセット時間後の通知
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${game.name} タスクリセット完了`,
              body: `「${task.name}」がリセットされました`,
              data: { gameId: game.id, taskId: task.id, type: 'after_reset' },
            },
            trigger: {
              hour: hours,
              minute: minutes,
              repeats: true,
            },
            identifier: afterId
          });
          scheduledCount++;
        }
      } catch (error) {
        console.error(`通知スケジュールエラー (${timeStr}):`, error);
      }
    }
    
    if (scheduledCount > 0) {
      // 最後にスケジュールした時間を記録
      await this.saveLastScheduledTime(task.id);
      this.log(`タスク ${task.id} (${task.name}) に ${scheduledCount} 件の通知をスケジュールしました`);
    }
  }

  // タスクの通知をキャンセル
  static async cancelTaskNotifications(taskId: string) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications
        .filter(notification => notification.identifier.startsWith(`task_${taskId}`))
        .map(notification => notification.identifier);
      
      if (notificationsToCancel.length > 0) {
        await Promise.all(notificationsToCancel.map(id => 
          Notifications.cancelScheduledNotificationAsync(id)
        ));
        this.log(`タスク ${taskId} の ${notificationsToCancel.length} 件の通知をキャンセルしました`);
      }
    } catch (error) {
      console.error('通知キャンセルに失敗:', error);
    }
  }

  // スケジュール済みの通知を確認（デバッグ用）
  static async listAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      this.log(`スケジュール済み通知: ${notifications.length}件`);
      for (const notification of notifications) {
        this.log(`ID: ${notification.identifier}`, {
          trigger: notification.trigger,
          content: notification.content
        });
      }
      return notifications;
    } catch (error) {
      console.error('通知リスト取得エラー:', error);
      return [];
    }
  }

  // すべてのゲームとタスクをチェックして通知をスケジュール
  static async updateAllTaskNotifications(games: Game[]) {
    this.log('全タスクの通知更新を開始します');
    
    // 許可を確認
    const { status } = await this.requestPermissions();
    if (status !== 'granted') {
      this.log('通知の許可が得られていません。更新をスキップします。');
      return;
    }
    
    let totalEnabled = 0;
    let totalScheduled = 0;
    
    // 現在のスケジュール済み通知を取得
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    this.log(`更新前のスケジュール済み通知: ${existingNotifications.length}件`);
    
    for (const game of games) {
      for (const task of game.dailyTasks) {
        const isEnabled = await this.getTaskNotificationSetting(task.id);
        if (isEnabled) {
          totalEnabled++;
          
          try {
            // 通知をスケジュール
            await this.scheduleTaskResetNotification(game, task);
            totalScheduled++;
          } catch (error) {
            console.error(`タスク ${task.id} (${task.name}) の通知スケジュールに失敗:`, error);
          }
        }
      }
    }
    
    // 更新後のスケジュール済み通知を確認
    const updatedNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    this.log(`通知更新完了: ${totalEnabled}個の有効なタスクから${totalScheduled}個のタスクの通知をスケジュールしました`);
    this.log(`更新後のスケジュール済み通知: ${updatedNotifications.length}件`);
    
    // 初期化完了フラグを設定
    await this.setInitialized();
  }
}

export default NotificationService;