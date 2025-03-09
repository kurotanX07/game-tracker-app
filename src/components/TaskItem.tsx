import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailyTask, CustomTask } from '../@types';

interface DailyTaskItemProps {
  task: DailyTask;
  onToggle: (taskId: string) => void;
}

interface CustomTaskItemProps {
  task: CustomTask;
  onToggle: (taskId: string) => void;
  onIncrement?: (taskId: string) => void;
}

export const DailyTaskItem: React.FC<DailyTaskItemProps> = ({ task, onToggle }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onToggle(task.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
        {task.completed && <View style={styles.checkmark} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.taskText, task.completed && styles.completedText]}>
          {task.name}
        </Text>
        {task.lastCompletedAt && (
          <Text style={styles.dateText}>
            最終完了: {task.lastCompletedAt.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const CustomTaskItem: React.FC<CustomTaskItemProps> = ({ 
  task, 
  onToggle,
  onIncrement 
}) => {
  if (task.type === 'checkbox') {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
          {task.completed && <View style={styles.checkmark} />}
        </View>
        <View style={styles.content}>
          <Text style={[styles.taskText, task.completed && styles.completedText]}>
            {task.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  } else { // counter type
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.taskText}>{task.name}</Text>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {task.value || 0}/{task.maxValue || 1}
            </Text>
            {!task.completed && onIncrement && (
              <TouchableOpacity 
                style={styles.incrementButton}
                onPress={() => onIncrement(task.id)}
              >
                <Text style={styles.incrementButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200EE',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6200EE',
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }],
  },
  content: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  counterText: {
    fontSize: 14,
    color: '#666',
  },
  incrementButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  incrementButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default { DailyTaskItem, CustomTaskItem };