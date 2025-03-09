import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Game, DailyTask } from '../@types';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { v4 as uuidv4 } from 'uuid';

const GameAddScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addGame } = useTaskContext();
  const { colors } = useTheme();

  // 状態管理
  const [gameName, setGameName] = useState('');
  const [resetTimes, setResetTimes] = useState<string[]>(['06:00']);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(-1);
  const [dailyTasks, setDailyTasks] = useState<Omit<DailyTask, 'id' | 'resetSettings'>[]>([
    { name: '', completed: false, lastCompletedAt: null },
  ]);

  // 時間選択を表示
  const handleShowTimePicker = (index: number) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  // 時間選択ハンドラ
  const handleTimeChange = (event: any, selectedDate?: Date, index: number = 0) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const updatedTimes = [...resetTimes];
      updatedTimes[index] = timeString;
      setResetTimes(updatedTimes);
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
    }
  };

  // 時間文字列をDate型に変換
  const getTimeAsDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // タスク名更新ハンドラ
  const handleTaskNameChange = (text: string, index: number) => {
    const updatedTasks = [...dailyTasks];
    updatedTasks[index].name = text;
    setDailyTasks(updatedTasks);
  };

  // タスク追加ハンドラ
  const handleAddTask = () => {
    setDailyTasks([...dailyTasks, { name: '', completed: false, lastCompletedAt: null }]);
  };

  // タスク削除ハンドラ
  const handleRemoveTask = (index: number) => {
    if (dailyTasks.length > 1) {
      const updatedTasks = [...dailyTasks];
      updatedTasks.splice(index, 1);
      setDailyTasks(updatedTasks);
    }
  };

  // ゲーム保存ハンドラ
  const handleSaveGame = async () => {
    // バリデーション
    if (gameName.trim() === '') {
      Alert.alert('エラー', 'ゲーム名を入力してください');
      return;
    }

    if (resetTimes.length === 0) {
      Alert.alert('エラー', '少なくとも1つのリセット時間を設定してください');
      return;
    }

    const hasEmptyTask = dailyTasks.some((task) => task.name.trim() === '');
    if (hasEmptyTask) {
      Alert.alert('エラー', 'すべてのタスク名を入力してください');
      return;
    }

    // ゲームオブジェクト作成
    const newGame: Game = {
      id: uuidv4(),
      name: gameName.trim(),
      resetTime: resetTimes[0], // 互換性のため最初の時間をデフォルトとして設定
      resetTimes: resetTimes,   // 複数のリセット時間
      dailyTasks: dailyTasks.map((task) => ({
        ...task,
        id: uuidv4(),
        name: task.name.trim(),
        resetSettings: {
          type: 'game',  // デフォルトでゲーム共通設定を使用
          times: [],     // カスタム時間は空配列
          lastResetAt: null,
        }
      })),
      customTasks: [],
    };

    // ゲーム保存処理
    try {
      await addGame(newGame);
      navigation.goBack();
    } catch (error) {
      Alert.alert('エラー', 'ゲームの保存に失敗しました');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>ゲーム名</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }
            ]}
            value={gameName}
            onChangeText={setGameName}
            placeholder="ゲーム名を入力"
            placeholderTextColor={colors.subText}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>タスクリセット時間</Text>
          
          {resetTimes.map((time, index) => (
            <View key={index} style={styles.timeInputContainer}>
              <TouchableOpacity
                style={[
                  styles.timePickerButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => handleShowTimePicker(index)}
              >
                <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
              </TouchableOpacity>
              
              {/* 削除ボタン（1つ以上ある場合のみ表示） */}
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
                >
                  <Text style={[styles.removeButtonText, { color: colors.error }]}>削除</Text>
                </TouchableOpacity>
              )}
              
              {selectedTimeIndex === index && showTimePicker && (
                <DateTimePicker
                  value={getTimeAsDate(time)}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) handleTimeChange(event, selectedDate, index);
                  }}
                />
              )}
            </View>
          ))}
          
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
          >
            <Text style={[styles.addButtonText, { color: colors.primary }]}>+ リセット時間を追加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>デイリータスク</Text>
          {dailyTasks.map((task, index) => (
            <View key={index} style={styles.taskInputContainer}>
              <TextInput
                style={[
                  styles.taskInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={task.name}
                onChangeText={(text) => handleTaskNameChange(text, index)}
                placeholder="タスク名を入力"
                placeholderTextColor={colors.subText}
              />
              <TouchableOpacity
                style={[
                  styles.removeButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => handleRemoveTask(index)}
                disabled={dailyTasks.length === 1}
              >
                <Text style={[
                  styles.removeButtonText,
                  { color: colors.error },
                  dailyTasks.length === 1 && { color: colors.border }
                ]}>削除</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            style={[
              styles.addButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary
              }
            ]} 
            onPress={handleAddTask}
          >
            <Text style={[styles.addButtonText, { color: colors.primary }]}>+ タスクを追加</Text>
          </TouchableOpacity>
        </View>
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
        >
          <Text style={[styles.cancelButtonText, { color: colors.subText }]}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary
            }
          ]} 
          onPress={handleSaveGame}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
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
  removeTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 16,
  },
  taskInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  removeButton: {
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
});

export default GameAddScreen;