import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailyTaskItem } from './TaskItem';
import { DailyTask } from '../@types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/**
 * タスクリストコンポーネントのプロパティ
 */
interface TaskListComponentProps {
  tasks: DailyTask[];
  onToggle: (taskId: string) => void;
  onSettings: (taskId: string) => void;
  emptyText?: string;
}

/**
 * タスクリストコンポーネント
 * デイリータスクのリストを表示し、完了状態の切り替えと設定ボタンの機能を提供します
 */
const TaskListComponent: React.FC<TaskListComponentProps> = ({ 
  tasks, 
  onToggle, 
  onSettings,
  emptyText = 'タスクはまだありません'
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.taskList}>
      {tasks.length > 0 ? (
        tasks.map(task => (
          <View key={task.id} style={styles.taskContainer}>
            <View style={styles.taskItemContainer}>
              <View style={styles.taskItemWrapper}>
                <DailyTaskItem
                  task={task}
                  onToggle={onToggle}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.taskSettingsButton, 
                  { backgroundColor: colors.primary }
                ]}
                onPress={() => onSettings(task.id)}
                accessible={true}
                accessibilityLabel={`${task.name}の設定`}
                accessibilityHint="タスクのリセット時間などの設定を変更します"
              >
                <Ionicons name="options-outline" size={16} color="#FFF" />
                <Text style={styles.taskSettingsButtonText}>設定</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          {emptyText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskList: {
    marginTop: 8,
  },
  taskContainer: {
    marginBottom: 8,
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskItemWrapper: {
    flex: 1,
  },
  taskSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  taskSettingsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default TaskListComponent;