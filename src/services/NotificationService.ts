import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Game, DailyTask } from '../@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  // ストレージキー
  static NOTIFICATION_SETTINGS_KEY = 'task_notification_settings';
  static NOTIFICATION_LAST_SCHEDULED_KEY = 'task_notification_last_scheduled';
  
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
  
  // スケジュール可能かをチェック（前回から1分以上経過していること）
  static async canScheduleNotification(taskId: string): Promise<boolean> {
    const lastScheduled = await this.getLastScheduledTime(taskId);
    
    if (!lastScheduled) {
      return true;
    }
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastScheduled.getTime()) / (1000 * 60);
    
    // 前回のスケジュールから1分以上経過している場合のみ許可
    return diffMinutes >= 1;
  }

  // タスクのリセット通知をスケジュール
  static async scheduleTaskResetNotification(game: Game, task: DailyTask) {
    // 通知が有効かチェック
    const isEnabled = await this.getTaskNotificationSetting(task.id);
    if (!isEnabled) {
      // 通知が無効な場合は既存の通知をキャンセルして終了
      await this.cancelTaskNotifications(task.id);
      return;
    }
    
    // スケジュール可能かチェック（直接トグルしたときなど連続してスケジュールしないため）
    const canSchedule = await this.canScheduleNotification(task.id);
    if (!canSchedule) {
      return;
    }
    
    // 許可を確認
    const { status } = await this.requestPermissions();
    if (status !== 'granted') {
      console.log('通知の許可が得られていません');
      return;
    }
    
    // リセット時間を取得（タスク固有かゲーム共通か）
    const resetTimes = task.resetSettings.type === 'custom' 
      ? task.resetSettings.times 
      : game.resetTimes;
    
    // 通知をキャンセル（既存のものを削除）
    await this.cancelTaskNotifications(task.id);
    
    // 各リセット時間に通知をスケジュール
    for (const timeStr of resetTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // リセット時間5分前の事前通知
      let beforeMinutes = minutes >= 5 ? minutes - 5 : minutes + 55;
      let beforeHours = minutes >= 5 ? hours : (hours === 0 ? 23 : hours - 1);
      
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
        identifier: `task_${task.id}_before_${timeStr.replace(':', '')}`
      });
      
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
        identifier: `task_${task.id}_after_${timeStr.replace(':', '')}`
      });
    }
    
    // 最後にスケジュールした時間を記録
    await this.saveLastScheduledTime(task.id);
  }

  // タスクの通知をキャンセル
  static async cancelTaskNotifications(taskId: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const notificationsToCancel = scheduledNotifications
      .filter(notification => notification.identifier.startsWith(`task_${taskId}`))
      .map(notification => notification.identifier);
    
    await Promise.all(notificationsToCancel.map(id => 
      Notifications.cancelScheduledNotificationAsync(id)
    ));
  }

  // すべてのゲームとタスクをチェックして通知をスケジュール
  static async updateAllTaskNotifications(games: Game[]) {
    for (const game of games) {
      for (const task of game.dailyTasks) {
        await this.scheduleTaskResetNotification(game, task);
      }
    }
  }
}

export default NotificationService;