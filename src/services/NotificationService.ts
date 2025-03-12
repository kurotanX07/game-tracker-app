import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Game, DailyTask } from '../@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  // ストレージキー
  static NOTIFICATION_SETTINGS_KEY = 'task_notification_settings';
  static NOTIFICATION_INIT_KEY = 'notification_initialized';
  static NOTIFICATION_INIT_CHECK_KEY = 'notification_init_session';
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
  
  // 通知許可の要求と確認
  static async checkNotificationPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'デフォルト',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
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
      let settings = {};
      
      try {
        settings = settingsJson ? JSON.parse(settingsJson) : {};
      } catch (e) {
        this.log('通知設定の解析に失敗しました。設定をリセットします。');
        settings = {};
      }
      
      settings[taskId] = enabled;
      this.log(`タスク ${taskId} の通知設定を ${enabled ? '有効' : '無効'} に変更しました`);
      
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('通知設定の保存に失敗しました:', error);
      throw error; // エラーを上位に伝播させる
    }
  }

  // タスク通知設定を取得
  static async getTaskNotificationSetting(taskId: string): Promise<boolean> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      let settings = {};
      
      try {
        settings = settingsJson ? JSON.parse(settingsJson) : {};
      } catch (e) {
        this.log('通知設定の解析に失敗しました。設定をリセットします。');
        settings = {};
      }
      
      // 明示的に有効にされたタスクのみtrue - デフォルトはfalse
      return settings[taskId] === true;
    } catch (error) {
      console.error('通知設定の取得に失敗しました:', error);
      return false;
    }
  }
  
  // アプリ初期化済みかチェック (永続的なフラグ)
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
      this.log('初期化済みフラグを設定しました');
    } catch (error) {
      console.error('初期化フラグの保存に失敗:', error);
    }
  }
  
  // すべての通知をリセット
  static async resetAllNotifications(): Promise<void> {
    try {
      // 既存のすべての通知をキャンセル
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.log('すべての通知をリセットしました');
    } catch (error) {
      console.error('通知のリセットに失敗:', error);
    }
  }

  // タスクに適用するリセット時間を取得
  static getTaskResetTimes(game: Game, task: DailyTask): string[] {
    return task.resetSettings.type === 'custom' 
      ? task.resetSettings.times 
      : game.resetTimes;
  }
  
  // 時間文字列から通知IDを生成 (日付パターンを含む)
  static getNotificationIds(taskId: string, timeStr: string, timestamp: Date): {beforeId: string, afterId: string} {
    const safeTimeStr = timeStr.replace(':', '');
    const dateStr = `${timestamp.getFullYear()}${timestamp.getMonth() + 1}${timestamp.getDate()}`;
    return {
      beforeId: `task_${taskId}_before_${safeTimeStr}_${dateStr}`,
      afterId: `task_${taskId}_after_${safeTimeStr}_${dateStr}`
    };
  }
  
  // 通知がすでに存在するかチェック
  static async notificationExists(notificationId: string): Promise<boolean> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.some(notification => notification.identifier === notificationId);
    } catch (error) {
      console.error('通知存在チェックエラー:', error);
      return false;
    }
  }
  
  // 特定の時間に対する次回のタイムスタンプを取得
  static getNextOccurrence(hours: number, minutes: number): Date {
    const now = new Date();
    const todayTarget = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );
    
    // 現在時刻が目標時刻より後なら翌日
    if (now > todayTarget) {
      todayTarget.setDate(todayTarget.getDate() + 1);
    }
    
    return todayTarget;
  }
  
  // 特定の時間の5分前の次回のタイムスタンプを取得
  static getNextBeforeOccurrence(hours: number, minutes: number): Date | null {
    const now = new Date();
    
    // 5分前の時間を計算
    let beforeMinutes = minutes >= 5 ? minutes - 5 : minutes + 55;
    let beforeHours = minutes >= 5 ? hours : (hours === 0 ? 23 : hours - 1);
    
    const todayTarget = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      beforeHours,
      beforeMinutes,
      0,
      0
    );
    
    // 現在時刻がリセット時間より後で、5分前の時間が過去の場合
    const resetTime = this.getNextOccurrence(hours, minutes);
    const isResetToday = resetTime.getDate() === now.getDate();
    
    // リセット時間が今日で、5分前が過去の場合はスキップ
    if (isResetToday && todayTarget < now) {
      return null;
    }
    
    // 現在時刻が5分前の時間より後なら翌日
    if (now > todayTarget) {
      todayTarget.setDate(todayTarget.getDate() + 1);
    }
    
    return todayTarget;
  }
  
  // 次回のリセット通知をスケジュール (時刻ベース)
  static async scheduleNextNotificationForTime(
    game: Game, 
    task: DailyTask, 
    timeStr: string
  ): Promise<boolean> {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // 次回のリセット時間と5分前の時間のタイムスタンプを取得
      const nextResetTime = this.getNextOccurrence(hours, minutes);
      const nextBeforeTime = this.getNextBeforeOccurrence(hours, minutes);
      
      // 通知ID (日付を含む)
      const { beforeId, afterId } = this.getNotificationIds(task.id, timeStr, nextResetTime);
      
      let scheduledCount = 0;
      
      // 5分前の通知
      if (nextBeforeTime !== null) {
        // 5分前の通知が必要で、スケジュール可能な場合
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${game.name} リセットまもなく`,
            body: `「${task.name}」が5分後にリセットされます`,
            data: { 
              gameId: game.id, 
              taskId: task.id, 
              timeStr: timeStr,
              type: 'before_reset' 
            },
          },
          trigger: nextBeforeTime,
          identifier: beforeId
        });
        this.log(`タスク ${task.id} (${task.name}) の事前通知をスケジュールしました:`, {
          時間: timeStr,
          予定日時: nextBeforeTime.toLocaleString()
        });
        scheduledCount++;
      }
      
      // リセット通知
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${game.name} タスクリセット`,
          body: `「${task.name}」がリセットされました`,
          data: { 
            gameId: game.id, 
            taskId: task.id, 
            timeStr: timeStr,
            type: 'after_reset'
          },
        },
        trigger: nextResetTime,
        identifier: afterId
      });
      
      this.log(`タスク ${task.id} (${task.name}) のリセット通知をスケジュールしました:`, {
        時間: timeStr,
        予定日時: nextResetTime.toLocaleString()
      });
      scheduledCount++;
      
      return scheduledCount > 0;
    } catch (error) {
      console.error(`通知スケジュールエラー (${timeStr}):`, error);
      return false;
    }
  }

  // タスクのリセット通知をスケジュール (日付対応版)
  static async scheduleTaskResetNotification(game: Game, task: DailyTask): Promise<boolean> {
    try {
      // 通知が有効かチェック
      const isEnabled = await this.getTaskNotificationSetting(task.id);
      if (!isEnabled) {
        // 通知が無効な場合は既存の通知をキャンセルして終了
        await this.cancelTaskNotifications(task.id);
        this.log(`タスク ${task.id} (${task.name}) の通知は無効なためスキップします`);
        return false;
      }
      
      // 許可を確認
      const { status } = await this.requestPermissions();
      if (status !== 'granted') {
        this.log('通知の許可が得られていません');
        return false;
      }
      
      // 日付指定タイプの場合は特殊処理
      if (task.resetSettings.type === 'date' && task.resetSettings.endDate) {
        await this.cancelTaskNotifications(task.id);
        
        // 終了日の通知をスケジュール
        const endDate = new Date(task.resetSettings.endDate);
        
        // 終了時間が指定されている場合はそれを使用、なければ通知を23:55に設定
        if (task.resetSettings.endTime) {
          const [hours, minutes] = task.resetSettings.endTime.split(':').map(Number);
          // 通知は5分前に送信
          if (minutes >= 5) {
            endDate.setHours(hours, minutes - 5, 0, 0);
          } else {
            // 時間をまたぐ場合（例：00:03 → 前の時間の23:58）
            const newHours = hours === 0 ? 23 : hours - 1;
            const newMinutes = minutes + 55; // 60 - 5 + minutes
            endDate.setHours(newHours, newMinutes, 0, 0);
          }
        } else {
          // 時間未指定の場合は23:55に通知
          endDate.setHours(23, 55, 0, 0);
        }
        
        // 現在日と比較
        const now = new Date();
        if (endDate <= now) {
          this.log(`タスク ${task.id} (${task.name}) の終了日時(${task.resetSettings.endDate} ${task.resetSettings.endTime || '23:59'})は既に過ぎています`);
          return false;
        }
        
        // 終了通知ID
        const timeInfo = task.resetSettings.endTime || '2359';
        const endNotificationId = `task_${task.id}_enddate_${task.resetSettings.endDate}_${timeInfo.replace(':', '')}`;
        
        // 終了通知をスケジュール
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${game.name} タスク完了期限まもなく`,
            body: `「${task.name}」の完了期限があと5分で終了します`,
            data: { 
              gameId: game.id, 
              taskId: task.id, 
              type: 'end_date' 
            },
          },
          trigger: endDate,
          identifier: endNotificationId
        });
        
        this.log(`タスク ${task.id} (${task.name}) の期限通知をスケジュールしました:`, {
          日付: task.resetSettings.endDate,
          時間: task.resetSettings.endTime || '23:59',
          予定日時: endDate.toLocaleString()
        });
        
        return true;
      }
      
      // 通常の時間ベースのリセット処理
      // リセット時間を取得
      const resetTimes = this.getTaskResetTimes(game, task);
      
      if (resetTimes.length === 0) {
        this.log(`タスク ${task.id} (${task.name}) にリセット時間が設定されていません`);
        return false;
      }
      
      // まず既存の通知をキャンセル (重要)
      await this.cancelTaskNotifications(task.id);
      this.log(`タスク ${task.id} の既存の通知をキャンセルしました`);
      
      // 各リセット時間に通知をスケジュール
      const results = await Promise.all(resetTimes.map(timeStr => 
        this.scheduleNextNotificationForTime(game, task, timeStr)
      ));
      
      const successCount = results.filter(Boolean).length;
      if (successCount > 0) {
        this.log(`タスク ${task.id} (${task.name}) に ${successCount}/${resetTimes.length} 件の通知をスケジュールしました`);
      }
      
      return successCount > 0;
    } catch (error) {
      console.error(`タスク通知スケジュールエラー:`, error);
      return false;
    }
  }

  // タスクの通知をキャンセル
  static async cancelTaskNotifications(taskId: string): Promise<number> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications
        .filter(notification => notification.identifier.includes(`task_${taskId}`))
        .map(notification => notification.identifier);
      
      if (notificationsToCancel.length > 0) {
        await Promise.all(notificationsToCancel.map(id => 
          Notifications.cancelScheduledNotificationAsync(id)
        ));
        this.log(`タスク ${taskId} の ${notificationsToCancel.length} 件の通知をキャンセルしました`);
      }
      
      return notificationsToCancel.length;
    } catch (error) {
      console.error('通知キャンセルに失敗:', error);
      return 0;
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
          content: notification.content,
          date: notification.trigger.date ? new Date(notification.trigger.date) : 'なし'
        });
      }
      return notifications;
    } catch (error) {
      console.error('通知リスト取得エラー:', error);
      return [];
    }
  }

  // すべてのゲームとタスクをチェックして通知をスケジュール (改善版)
  static async updateAllTaskNotifications(games: Game[]): Promise<boolean> {
    this.log('全タスクの通知更新を開始します');
    
    // 許可を確認
    if (!(await this.checkNotificationPermissions())) {
      this.log('通知の許可が得られていません。更新をスキップします。');
      return false;
    }
    
    try {
      // 現在のスケジュール済み通知数
      const beforeCount = (await Notifications.getAllScheduledNotificationsAsync()).length;
      this.log(`更新前のスケジュール済み通知: ${beforeCount}件`);
      
      // すべてのゲームとタスクをチェック
      let successCount = 0;
      let totalEnabledCount = 0;
      
      for (const game of games) {
        for (const task of game.dailyTasks) {
          const isEnabled = await this.getTaskNotificationSetting(task.id);
          if (isEnabled) {
            totalEnabledCount++;
            const success = await this.scheduleTaskResetNotification(game, task);
            if (success) successCount++;
          } else {
            // 通知設定が無効なタスクは、念のため通知をキャンセル
            await this.cancelTaskNotifications(task.id);
          }
        }
      }
      
      // 更新後のスケジュール済み通知を確認
      const afterCount = (await Notifications.getAllScheduledNotificationsAsync()).length;
      
      this.log(`通知更新完了: ${totalEnabledCount}個の有効なタスクから${successCount}個のタスクの通知をスケジュールしました`);
      this.log(`更新後のスケジュール済み通知: ${afterCount}件`);
      
      // 初期化完了フラグを設定
      await this.setInitialized();
      
      return true;
    } catch (error) {
      console.error('通知更新に失敗:', error);
      return false;
    }
  }

  // 通知の初期セットアップ - 最初の一度だけ実行
  static async initialSetup(games: Game[]): Promise<boolean> {
    try {
      // 既に初期化済みかチェック
      const isAlreadyInitialized = await this.isInitialized();
      if (isAlreadyInitialized) {
        this.log('通知は既に初期化済みです。初期セットアップをスキップします。');
        return true;
      }
      
      // パーミッションチェック
      if (!(await this.checkNotificationPermissions())) {
        this.log('通知権限がありません。初期セットアップをスキップします。');
        return false;
      }
      
      // 既存の通知をすべてクリア
      await this.resetAllNotifications();
      
      // 初期化フラグをtrueに設定して初回のみ実行であることを示す
      await this.setInitialized();
      
      this.log('通知の初期セットアップが完了しました');
      return true;
    } catch (error) {
      console.error('通知の初期セットアップに失敗:', error);
      return false;
    }
  }
}

export default NotificationService;