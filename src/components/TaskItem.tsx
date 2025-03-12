import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailyTask, CustomTask } from '../@types';
import { useTheme } from '../contexts/ThemeContext';

interface DailyTaskItemProps {
  task: DailyTask;
  onToggle: (taskId: string) => void;
}

interface CustomTaskItemProps {
  task: CustomTask;
  onToggle: (taskId: string) => void;
  onIncrement?: (taskId: string) => void;
}

// 日付をフォーマットする関数を追加
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export const DailyTaskItem: React.FC<DailyTaskItemProps> = ({ task, onToggle }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          shadowColor: colors.text,
          borderColor: colors.border
        }
      ]} 
      onPress={() => onToggle(task.id)}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.checkbox, 
          { borderColor: colors.checkbox },
          task.completed && [styles.checkboxChecked, { backgroundColor: colors.checkbox }]
        ]}
      >
        {task.completed && <View style={[styles.checkmark, { borderColor: '#fff' }]} />}
      </View>
      <View style={styles.content}>
        <Text 
          style={[
            styles.taskText, 
            { color: colors.text },
            task.completed && [styles.completedText, { color: colors.subText }]
          ]}
        >
          {task.name}
        </Text>
        {task.lastCompletedAt && (
          <Text style={[styles.dateText, { color: colors.subText }]}>
            最終完了: {formatDate(new Date(task.lastCompletedAt))}
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
  const { colors } = useTheme();
  
  if (task.type === 'checkbox') {
    return (
      <TouchableOpacity 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.card,
            shadowColor: colors.text,
            borderColor: colors.border
          }
        ]} 
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        <View 
          style={[
            styles.checkbox, 
            { borderColor: colors.checkbox },
            task.completed && [styles.checkboxChecked, { backgroundColor: colors.checkbox }]
          ]}
        >
          {task.completed && <View style={[styles.checkmark, { borderColor: '#fff' }]} />}
        </View>
        <View style={styles.content}>
          <Text 
            style={[
              styles.taskText, 
              { color: colors.text },
              task.completed && [styles.completedText, { color: colors.subText }]
            ]}
          >
            {task.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  } else { // counter type
    return (
      <View 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.card,
            shadowColor: colors.text,
            borderColor: colors.border
          }
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.taskText, { color: colors.text }]}>{task.name}</Text>
          <View style={styles.counterContainer}>
            <Text style={[styles.counterText, { color: colors.subText }]}>
              {task.value || 0}/{task.maxValue || 1}
            </Text>
            {!task.completed && onIncrement && (
              <TouchableOpacity 
                style={[styles.incrementButton, { backgroundColor: colors.primary }]}
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
    borderRadius: 8,
    marginVertical: 6,
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
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {},
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
  },
  content: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  counterText: {
    fontSize: 14,
  },
  incrementButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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