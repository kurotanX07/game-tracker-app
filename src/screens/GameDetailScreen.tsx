import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTaskContext } from '../contexts/TaskContext';
import { DailyTaskItem, CustomTaskItem } from '../components/TaskItem';
import { CustomTask } from '../@types';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import { AdService } from '../services/AdService';

// 現在のバージョンのReact Navigationに対応するため型を変更
type GameDetailScreenRouteProp = any;

const GameDetailScreen: React.FC = () => {
  const route = useRoute<GameDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: string };
  const { games, updateDailyTask, addCustomTask, removeGame } = useTaskContext();
  const { colors } = useTheme();

  const game = games.find(g => g.id === gameId);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskType, setTaskType] = useState<'checkbox' | 'counter'>('checkbox');
  const [counterMaxValue, setCounterMaxValue] = useState('1');

  // ゲームが見つからない場合
  if (!game) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>ゲームが見つかりませんでした</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // デイリータスク完了時のハンドラ
  const handleTaskToggle = async (taskId: string) => {
    await updateDailyTask(gameId, taskId);
    
    // アドカウンターを増加させ、条件を満たすと広告を表示
    await AdService.incrementAdCounter();
  };

  // カスタムタスク追加
  const handleAddCustomTask = async () => {
    if (newTaskName.trim() === '') {
      Alert.alert('エラー', 'タスク名を入力してください');
      return;
    }

    const maxValue = parseInt(counterMaxValue);
    if (taskType === 'counter' && (isNaN(maxValue) || maxValue <= 0)) {
      Alert.alert('エラー', '有効なカウンター最大値を入力してください');
      return;
    }

    const newTask: CustomTask = {
      id: uuidv4(),
      name: newTaskName.trim(),
      type: taskType,
      completed: false,
    };

    if (taskType === 'counter') {
      newTask.value = 0;
      newTask.maxValue = maxValue;
    }

    await addCustomTask(gameId, newTask);
    
    // 広告表示の可能性
    await AdService.incrementAdCounter();
    
    setModalVisible(false);
    setNewTaskName('');
    setTaskType('checkbox');
    setCounterMaxValue('1');
  };

  // ゲーム削除処理
  const handleDeleteGame = () => {
    Alert.alert(
      'ゲームの削除',
      `"${game.name}"を削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await removeGame(gameId);
            
            // ゲーム削除時は確率高めで広告表示
            await AdService.showInterstitial();
            
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.gameName, { color: colors.text }]}>{game.name}</Text>
          <Text style={[styles.resetTime, { color: colors.subText }]}>リセット時間: {game.resetTime}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>デイリータスク</Text>
          <View style={styles.taskList}>
            {game.dailyTasks.map(task => (
              <DailyTaskItem
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>カスタムタスク</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.taskList}>
            {game.customTasks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.subText }]}>カスタムタスクはまだありません</Text>
            ) : (
              game.customTasks.map(task => (
                <CustomTaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => {}}
                />
              ))
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.card, borderColor: colors.error }]} 
          onPress={handleDeleteGame}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>ゲームを削除</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* カスタムタスク追加モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>カスタムタスクを追加</Text>

            <Text style={[styles.modalLabel, { color: colors.text }]}>タスク名</Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text
              }]}
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder="タスク名を入力"
              placeholderTextColor={colors.subText}
            />

            <Text style={[styles.modalLabel, { color: colors.text }]}>タスクタイプ</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTaskType('checkbox')}
              >
                <View 
                  style={[
                    styles.radioButton,
                    { borderColor: colors.primary },
                    taskType === 'checkbox' && [styles.radioButtonSelected, { backgroundColor: colors.primary }]
                  ]}
                />
                <Text style={[styles.radioLabel, { color: colors.text }]}>チェックボックス</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTaskType('counter')}
              >
                <View 
                  style={[
                    styles.radioButton,
                    { borderColor: colors.primary },
                    taskType === 'counter' && [styles.radioButtonSelected, { backgroundColor: colors.primary }]
                  ]}
                />
                <Text style={[styles.radioLabel, { color: colors.text }]}>カウンター</Text>
              </TouchableOpacity>
            </View>

            {taskType === 'counter' && (
              <>
                <Text style={[styles.modalLabel, { color: colors.text }]}>最大値</Text>
                <TextInput
                  style={[styles.modalInput, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={counterMaxValue}
                  onChangeText={setCounterMaxValue}
                  keyboardType="numeric"
                  placeholder="最大値を入力"
                  placeholderTextColor={colors.subText}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.subText }]}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAddButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomTask}
              >
                <Text style={styles.modalAddButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resetTime: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskList: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  radioGroup: {
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 10,
  },
  radioButtonSelected: {},
  radioLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    fontWeight: 'bold',
  },
  modalAddButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalAddButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default GameDetailScreen;