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

// 現在のバージョンのReact Navigationに対応するため型を変更
type GameDetailScreenRouteProp = any;

const GameDetailScreen: React.FC = () => {
  const route = useRoute<GameDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: string };
  const { games, updateDailyTask, addCustomTask, removeGame } = useTaskContext();

  const game = games.find(g => g.id === gameId);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskType, setTaskType] = useState<'checkbox' | 'counter'>('checkbox');
  const [counterMaxValue, setCounterMaxValue] = useState('1');

  // ゲームが見つからない場合
  if (!game) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>ゲームが見つかりませんでした</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // デイリータスク完了時のハンドラ
  const handleTaskToggle = (taskId: string) => {
    updateDailyTask(gameId, taskId);
  };

  // カスタムタスク追加
  const handleAddCustomTask = () => {
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

    addCustomTask(gameId, newTask);
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
          onPress: () => {
            removeGame(gameId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.gameName}>{game.name}</Text>
          <Text style={styles.resetTime}>リセット時間: {game.resetTime}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>デイリータスク</Text>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>カスタムタスク</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.taskList}>
            {game.customTasks.length === 0 ? (
              <Text style={styles.emptyText}>カスタムタスクはまだありません</Text>
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

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGame}>
          <Text style={styles.deleteButtonText}>ゲームを削除</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>カスタムタスクを追加</Text>

            <Text style={styles.modalLabel}>タスク名</Text>
            <TextInput
              style={styles.modalInput}
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder="タスク名を入力"
            />

            <Text style={styles.modalLabel}>タスクタイプ</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTaskType('checkbox')}
              >
                <View 
                  style={[
                    styles.radioButton,
                    taskType === 'checkbox' && styles.radioButtonSelected
                  ]}
                />
                <Text style={styles.radioLabel}>チェックボックス</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTaskType('counter')}
              >
                <View 
                  style={[
                    styles.radioButton,
                    taskType === 'counter' && styles.radioButtonSelected
                  ]}
                />
                <Text style={styles.radioLabel}>カウンター</Text>
              </TouchableOpacity>
            </View>

            {taskType === 'counter' && (
              <>
                <Text style={styles.modalLabel}>最大値</Text>
                <TextInput
                  style={styles.modalInput}
                  value={counterMaxValue}
                  onChangeText={setCounterMaxValue}
                  keyboardType="numeric"
                  placeholder="最大値を入力"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
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
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6200EE',
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resetTime: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    marginTop: 8,
    backgroundColor: '#FFF',
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
    color: '#333',
    marginBottom: 12,
  },
  taskList: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  addButton: {
    backgroundColor: '#6200EE',
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
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#D32F2F',
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
    backgroundColor: '#FFF',
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
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    borderColor: '#6200EE',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#6200EE',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
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
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#6200EE',
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