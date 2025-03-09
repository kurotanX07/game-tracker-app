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
import { v4 as uuidv4 } from 'uuid';

const GameAddScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addGame } = useTaskContext();

  // 状態管理
  const [gameName, setGameName] = useState('');
  const [resetTime, setResetTime] = useState('06:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dailyTasks, setDailyTasks] = useState<Omit<DailyTask, 'id'>[]>([
    { name: '', completed: false, lastCompletedAt: null },
  ]);

  // 時間選択ハンドラ
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      setResetTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      );
    }
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

    const hasEmptyTask = dailyTasks.some((task) => task.name.trim() === '');
    if (hasEmptyTask) {
      Alert.alert('エラー', 'すべてのタスク名を入力してください');
      return;
    }

    // ゲームオブジェクト作成
    const newGame: Game = {
      id: uuidv4(),
      name: gameName.trim(),
      resetTime,
      dailyTasks: dailyTasks.map((task) => ({
        ...task,
        id: uuidv4(),
        name: task.name.trim(),
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formSection}>
          <Text style={styles.label}>ゲーム名</Text>
          <TextInput
            style={styles.input}
            value={gameName}
            onChangeText={setGameName}
            placeholder="ゲーム名を入力"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>タスクリセット時間</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>{resetTime}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={(() => {
                const [hours, minutes] = resetTime.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                return date;
              })()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>デイリータスク</Text>
          {dailyTasks.map((task, index) => (
            <View key={index} style={styles.taskInputContainer}>
              <TextInput
                style={styles.taskInput}
                value={task.name}
                onChangeText={(text) => handleTaskNameChange(text, index)}
                placeholder="タスク名を入力"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.removeTaskButton}
                onPress={() => handleRemoveTask(index)}
                disabled={dailyTasks.length === 1}
              >
                <Text style={[
                  styles.removeTaskButtonText,
                  dailyTasks.length === 1 && styles.disabledText
                ]}>削除</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask}>
            <Text style={styles.addTaskButtonText}>+ タスクを追加</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveGame}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timePickerButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  taskInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  removeTaskButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  removeTaskButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#BDBDBD',
  },
  addTaskButton: {
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200EE',
    alignItems: 'center',
    marginTop: 8,
  },
  addTaskButtonText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6200EE',
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