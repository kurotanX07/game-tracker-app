import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import NotificationService, { TaskNotificationSettings } from '../services/NotificationService';
import { formatDateForDisplay, getTimeAsDate } from '../utils/dateUtils';
import { ToastService } from '../services/ToastService';

const TaskSettingsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId, taskId } = route.params as { gameId: string; taskId: string };
  const { games, updateTaskSettings, removeTask } = useTaskContext();
  const { colors } = useTheme();
  
  // ゲームとタスクの取得
  const game = games.find(g => g.id === gameId);
  const task = game?.dailyTasks.find(t => t.id === taskId);
  
  // 状態管理
  const [resetType, setResetType] = useState<'game' | 'custom' | 'date'>(
    task?.resetSettings.type || 'game'
  );
  const [resetTimes, setResetTimes] = useState(
    (task?.resetSettings.type === 'custom' && task?.resetSettings.times.length > 0)
      ? [...task.resetSettings.times]
      : (game?.resetTimes || ['06:00'])
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(-1);
  
  // 日付設定の状態
  const [endDate, setEndDate] = useState<Date | null>(
    task?.resetSettings.endDate ? new Date(task.resetSettings.endDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 終了時間設定の状態
  const [endTime, setEndTime] = useState<string>(
    task?.resetSettings.endTime || '23:59'
  );
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // 通知設定の状態
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<{
    beforeMinutes: number;
    notifyOnReset: boolean;
  }>({
    beforeMinutes: 5,
    notifyOnReset: true
  });
  
  // 処理中フラグを追加
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 通知設定を読み込む
  useEffect(() => {
    if (task) {
      const loadNotificationSetting = async () => {
        try {
          const settings = await NotificationService.getTaskNotificationSettings(task.id);
          setNotificationsEnabled(settings.enabled);
          setNotificationSettings({
            beforeMinutes: settings.beforeMinutes,
            notifyOnReset: settings.notifyOnReset
          });
        } catch (error) {
          console.error('通知設定の読み込みエラー:', error);
        }
      };
      
      loadNotificationSetting();
    }
  }, [task]);
  
  if (!game || !task) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          タスクが見つかりませんでした
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // 時間選択を表示
  const handleShowTimePicker = (index: number) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  // 時間選択ハンドラ
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const updatedTimes = [...resetTimes];
      updatedTimes[selectedTimeIndex] = timeString;
      setResetTimes(updatedTimes);
    }
  };

  // 日付選択ハンドラ
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // 現在日より過去の日付は選択できないようにする
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        Alert.alert('エラー', '現在日より過去の日付は選択できません');
        return;
      }
      
      setEndDate(selectedDate);
    }
  };
  
  // 終了時間選択ハンドラ
  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setEndTime(timeString);
    }
  };

  // リセット時間追加ハンドラ
  const handleAddResetTime = () => {
    setResetTimes([...resetTimes, '12:00']);
  };

  // リセット時間削除ハンドラ
  const handleRemoveResetTime = (index: number) => {
    if (resetTimes.length > 1) {
      const updatedTimes = [...resetTimes];
      updatedTimes.splice(index, 1);
      setResetTimes(updatedTimes);
    } else {
      Alert.alert('エラー', '少なくとも1つのリセット時間が必要です');
    }
  };
  
  // 通知設定変更ハンドラ
  const handleToggleNotification = async (value: boolean) => {
    try {
      // 処理中フラグをセット
      setIsProcessing(true);
      
      // UIの即時反映のために先に状態を変更
      setNotificationsEnabled(value);
      
      if (value) {
        // 通知を有効にする場合は許可を確認
        const { status } = await NotificationService.requestPermissions();
        if (status !== 'granted') {
          Alert.alert(
            '通知許可が必要です',
            '設定アプリから本アプリの通知を許可してください',
            [{ text: '了解' }]
          );
          setNotificationsEnabled(false);
          setIsProcessing(false);
          return;
        }
        
        // 設定を保存
        await NotificationService.saveTaskNotificationSettings(task.id, {
          enabled: value,
          beforeMinutes: notificationSettings.beforeMinutes,
          notifyOnReset: notificationSettings.notifyOnReset
        });
        
        // まず既存の通知をキャンセル
        await NotificationService.cancelTaskNotifications(task.id);
        
        // 通知をスケジュール
        if (game && task) {
          const success = await NotificationService.scheduleTaskResetNotification(game, task);
          
          if (success) {
            // 成功メッセージを変更（即時通知でないため）
            console.log('リセット通知を次回のリセット時間にスケジュールしました');
          } else {
            Alert.alert('注意', '通知設定を保存しましたが、通知のスケジュールに問題がありました');
          }
        }
      } else {
        // 通知を無効にする場合
        await NotificationService.saveTaskNotificationSettings(task.id, {
          enabled: value,
          beforeMinutes: notificationSettings.beforeMinutes,
          notifyOnReset: notificationSettings.notifyOnReset
        });
        
        // 既存の通知をキャンセル
        const canceled = await NotificationService.cancelTaskNotifications(task.id);
        console.log(`${canceled}件の通知をキャンセルしました`);
      }
    } catch (error) {
      console.error('通知設定変更エラー:', error);
      Alert.alert('エラー', '通知設定の変更中にエラーが発生しました');
      // エラー時は元の状態に戻す
      setNotificationsEnabled(!value);
    } finally {
      // 処理完了
      setIsProcessing(false);
    }
  };
  
  // 通知タイミング変更ハンドラ
  const handleNotificationMinutesChange = (value: number) => {
    setNotificationSettings({
      ...notificationSettings,
      beforeMinutes: Math.max(0, value)
    });
  };
  
  // リセット時通知設定変更ハンドラ
  const handleToggleResetNotification = (value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      notifyOnReset: value
    });
  };
  
  // 通知設定を保存
  const saveNotificationSettings = async () => {
    try {
      if (notificationsEnabled) {
        await NotificationService.saveTaskNotificationSettings(task.id, {
          enabled: true,
          beforeMinutes: notificationSettings.beforeMinutes,
          notifyOnReset: notificationSettings.notifyOnReset
        });
        
        // 既存の通知をキャンセルして再スケジュール
        await NotificationService.cancelTaskNotifications(task.id);
        await NotificationService.scheduleTaskResetNotification(game, task);
      }
    } catch (error) {
      console.error('通知設定の保存に失敗:', error);
      ToastService.showError(error, '通知設定の保存に失敗しました');
    }
  };

  // 設定保存ハンドラ
  const handleSave = async () => {
    // すでに処理中なら早期リターン
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // リセットタイプによるバリデーション
      if (resetType === 'custom' && resetTimes.length === 0) {
        Alert.alert('エラー', '少なくとも1つのリセット時間を設定してください');
        return;
      }
      
      if (resetType === 'date' && !endDate) {
        Alert.alert('エラー', 'リセット日を選択してください');
        return;
      }
      
      // リセット設定の更新
      let settings: any = {
        type: resetType,
        times: resetType === 'custom' ? resetTimes : [],
      };
      
      // 日付指定の場合は終了日時を追加
      if (resetType === 'date' && endDate) {
        settings.endDate = endDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
        settings.endTime = endTime; // HH:MM形式
      } else {
        // 日付指定でない場合は終了日時を削除
        settings.endDate = undefined;
        settings.endTime = undefined;
      }
      
      await updateTaskSettings(gameId, taskId, settings);
      
      // 通知設定を保存
      await saveNotificationSettings();
      
      navigation.goBack();
    } catch (error) {
      // ToastService を使用してエラーを表示
      ToastService.showError(error, '設定の保存に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // タスク削除ハンドラ
  const handleDeleteTask = () => {
    Alert.alert(
      'タスクの削除',
      `"${task.name}"を削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              // 通知をキャンセル
              await NotificationService.cancelTaskNotifications(task.id);
              // タスクを削除
              await removeTask(gameId, taskId, 'daily');
              setIsProcessing(false);
              navigation.goBack();
            } catch (error) {
              setIsProcessing(false);
              console.error('タスク削除エラー:', error);
              Alert.alert('エラー', 'タスクの削除に失敗しました');
            }
          },
        },
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.header, { color: colors.text }]}>
            タスク: {task.name}
          </Text>
          
          {/* 通知設定 */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              リセット通知
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotification}
              trackColor={{ false: '#DDDDDD', true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={isProcessing}
            />
          </View>
          
          {/* 通知が有効な場合のみ詳細設定を表示 */}
          {notificationsEnabled && (
            <View style={[styles.notificationSettings, { borderTopColor: colors.border }]}>
              {/* リセット前の通知タイミング設定 */}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  リセット前通知
                </Text>
                <View style={styles.minutesPicker}>
                  <TouchableOpacity
                    style={[styles.minutesButton, { borderColor: colors.border }]}
                    onPress={() => handleNotificationMinutesChange(Math.max(0, notificationSettings.beforeMinutes - 5))}
                    disabled={notificationSettings.beforeMinutes <= 0}
                  >
                    <Text style={{ color: colors.text }}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.minutesText, { color: colors.text }]}>
                    {notificationSettings.beforeMinutes > 0 
                      ? `${notificationSettings.beforeMinutes}分前` 
                      : 'なし'}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.minutesButton, { borderColor: colors.border }]}
                    onPress={() => handleNotificationMinutesChange(notificationSettings.beforeMinutes + 5)}
                  >
                    <Text style={{ color: colors.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* リセット時の通知設定 */}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  リセット時に通知
                </Text>
                <Switch
                  value={notificationSettings.notifyOnReset}
                  onValueChange={handleToggleResetNotification}
                  trackColor={{ false: '#DDDDDD', true: colors.primary }}
                  thumbColor="#FFFFFF"
                  disabled={isProcessing}
                />
              </View>
            </View>
          )}
          
          <View style={styles.infoBox}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.subText }]}>
              {notificationsEnabled
                ? `リセット${notificationSettings.beforeMinutes > 0 ? `${notificationSettings.beforeMinutes}分前` : ''}${notificationSettings.beforeMinutes > 0 && notificationSettings.notifyOnReset ? 'と' : ''}${notificationSettings.notifyOnReset ? 'リセット時' : ''}に通知が届きます`
                : '通知はオフになっています'}
            </Text>
          </View>
          
          {/* リセット設定タイプ選択 */}
          <View style={styles.resetTypeContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              リセット設定
            </Text>
            
            {/* ゲーム共通設定 */}
            <TouchableOpacity 
              style={[
                styles.resetTypeOption,
                resetType === 'game' && [styles.resetTypeSelected, { borderColor: colors.primary }]
              ]}
              onPress={() => setResetType('game')}
              disabled={isProcessing}
            >
              <Ionicons 
                name={resetType === 'game' ? "radio-button-on" : "radio-button-off"} 
                size={24} 
                color={resetType === 'game' ? colors.primary : colors.text} 
              />
              <View style={styles.resetTypeTextContainer}>
                <Text style={[styles.resetTypeText, { color: colors.text }]}>
                  ゲーム共通のリセット時間を使用
                </Text>
                <Text style={[styles.resetTypeDescription, { color: colors.subText }]}>
                  設定された時間ごとに毎日リセット
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* カスタム時間設定 */}
            <TouchableOpacity 
              style={[
                styles.resetTypeOption,
                resetType === 'custom' && [styles.resetTypeSelected, { borderColor: colors.primary }]
              ]}
              onPress={() => setResetType('custom')}
              disabled={isProcessing}
            >
              <Ionicons 
                name={resetType === 'custom' ? "radio-button-on" : "radio-button-off"} 
                size={24} 
                color={resetType === 'custom' ? colors.primary : colors.text} 
              />
              <View style={styles.resetTypeTextContainer}>
                <Text style={[styles.resetTypeText, { color: colors.text }]}>
                  カスタムリセット時間を使用
                </Text>
                <Text style={[styles.resetTypeDescription, { color: colors.subText }]}>
                  このタスク専用のリセット時間を設定
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* 日付指定設定 */}
            <TouchableOpacity 
              style={[
                styles.resetTypeOption,
                resetType === 'date' && [styles.resetTypeSelected, { borderColor: colors.primary }]
              ]}
              onPress={() => setResetType('date')}
              disabled={isProcessing}
            >
              <Ionicons 
                name={resetType === 'date' ? "radio-button-on" : "radio-button-off"} 
                size={24} 
                color={resetType === 'date' ? colors.primary : colors.text} 
              />
              <View style={styles.resetTypeTextContainer}>
                <Text style={[styles.resetTypeText, { color: colors.text }]}>
                  特定日時までリセットしない
                </Text>
                <Text style={[styles.resetTypeDescription, { color: colors.subText }]}>
                  指定した日時まで完了状態を維持
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* カスタムリセット時間設定 */}
          {resetType === 'custom' && (
            <View style={styles.timesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                リセット時間
              </Text>
              
              {resetTimes.map((time, index) => (
                <View key={index} style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.timePickerButton,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => handleShowTimePicker(index)}
                    disabled={isProcessing}
                  >
                    <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                  </TouchableOpacity>
                  
                  {/* 削除ボタン（1つ以上あるときのみ表示） */}
                  {resetTimes.length > 1 && (
                    <TouchableOpacity
                      style={[
                        styles.removeTimeButton,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => handleRemoveResetTime(index)}
                      disabled={isProcessing}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.error }]}>削除</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {/* 時間選択のDateTimePicker */}
              {showTimePicker && (
                <DateTimePicker
                  value={getTimeAsDate(resetTimes[selectedTimeIndex])}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                  style={styles.datePicker}
                />
              )}
              
              {/* 時間追加ボタン */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary
                  }
                ]}
                onPress={handleAddResetTime}
                disabled={isProcessing}
              >
                <Text style={[styles.addButtonText, { color: colors.primary }]}>
                  + リセット時間を追加
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* 日付指定設定（日時両方を設定） */}
          {resetType === 'date' && (
            <View style={styles.dateContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                リセット日時
              </Text>
              
              {/* 日付と時間を横並びで表示 */}
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      flex: 1, // 幅を調整
                      marginRight: 8 // 日付と時間の間隔
                    }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isProcessing}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.calendarIcon} />
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {endDate ? formatDateForDisplay(endDate) : '日付を選択'}
                  </Text>
                </TouchableOpacity>
                
                {/* 時間選択 */}
                <TouchableOpacity
                  style={[
                    styles.timePickerButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      width: 100 // 固定幅
                    }
                  ]}
                  onPress={() => setShowEndTimePicker(true)}
                  disabled={isProcessing}
                >
                  <Ionicons name="time-outline" size={20} color={colors.text} style={styles.calendarIcon} />
                  <Text style={[styles.timeText, { color: colors.text }]}>{endTime}</Text>
                </TouchableOpacity>
              </View>
              
              {/* 日付選択のDateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()} // 現在日以降のみ選択可能
                  style={styles.datePicker}
                />
              )}
              
              {/* 時間選択のDateTimePicker */}
              {showEndTimePicker && (
                <DateTimePicker
                  value={getTimeAsDate(endTime)}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleEndTimeChange}
                  style={styles.datePicker}
                />
              )}
              
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: colors.subText }]}>
                  指定した日時までタスク完了状態を維持します。その後、次回のリセット時間でリセットされます。
                </Text>
              </View>
            </View>
          )}
          
          {/* ゲーム共通設定の場合の表示 */}
          {resetType === 'game' && (
            <View style={styles.gameTimesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                ゲーム共通のリセット時間
              </Text>
              
              <View style={styles.gameTimesRow}>
                {game.resetTimes.map((time, index) => (
                  <View key={index} style={[
                    styles.gameTimeItem,
                    { backgroundColor: colors.background, borderColor: colors.border }
                  ]}>
                    <Text style={[styles.gameTimeText, { color: colors.text }]}>
                      {time}
                    </Text>
                  </View>
                ))}
              </View>
              
              <Text style={[styles.noteText, { color: colors.subText }]}>
                ※ゲーム共通の時間を変更するには、ゲーム設定画面から行ってください
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.card, borderColor: colors.error }]} 
          onPress={handleDeleteTask}
          disabled={isProcessing}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>タスクを削除</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.cancelButton,
            {
              borderColor: colors.border
            }
          ]} 
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
          accessible={true}
          accessibilityLabel="設定をキャンセルして戻る"
          accessibilityRole="button"
        >
          <Text style={[styles.cancelButtonText, { color: colors.subText }]}>戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              opacity: isProcessing ? 0.7 : 1
            }
          ]} 
          onPress={handleSave}
          disabled={isProcessing}
          accessible={true}
          accessibilityLabel="設定を保存する"
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>
            {isProcessing ? '処理中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // リセットタイプ選択のスタイル
  resetTypeContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  resetTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  resetTypeSelected: {
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resetTypeTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  resetTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resetTypeDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  // 時間設定のスタイル
  timesContainer: {
    marginTop: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  timePickerButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
  },
  removeTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  // 日付選択のスタイル
  dateContainer: {
    marginTop: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  datePickerButton: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  // ゲーム共通時間のスタイル
  gameTimesContainer: {
    marginTop: 8,
  },
  gameTimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gameTimeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  gameTimeText: {
    fontSize: 14,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  // フッターのスタイル
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  datePicker: {
    marginBottom: 8,
  },
  deleteButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  // 通知設定のスタイル
  notificationSettings: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  minutesPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minutesButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  minutesText: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
});

export default TaskSettingsScreen;