import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Game } from '../@types';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

// 型定義の修正（React Navigation 7での変更対応）
type GameCardNavigationProp = any; // 互換性のために一時的に any 型に

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigation = useNavigation<GameCardNavigationProp>();
  const { colors } = useTheme();

  // デイリータスクの完了率を計算
  const completionRate = game.dailyTasks.length > 0 
    ? game.dailyTasks.filter(task => task.completed).length / game.dailyTasks.length 
    : 0;

  // ゲーム詳細画面に遷移
  const handlePress = () => {
    navigation.navigate('GameDetail', { gameId: game.id });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.text
        }
      ]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{game.name}</Text>
        <Text style={[styles.resetTime, { color: colors.subText }]}>リセット: {game.resetTime}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.progressBar }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${completionRate * 100}%`,
                backgroundColor: colors.progressFill
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.subText }]}>
          {game.dailyTasks.filter(task => task.completed).length}/{game.dailyTasks.length}
        </Text>
      </View>

      <View style={styles.tasksPreview}>
        {game.dailyTasks.slice(0, 2).map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View 
              style={[
                styles.taskStatus, 
                task.completed 
                  ? [styles.completed, { backgroundColor: colors.success }] 
                  : [styles.pending, { backgroundColor: colors.border }]
              ]} 
            />
            <Text 
              style={[styles.taskName, { color: task.completed ? colors.subText : colors.text }]} 
              numberOfLines={1}
            >
              {task.name}
            </Text>
          </View>
        ))}
        {game.dailyTasks.length > 2 && (
          <Text style={[styles.moreText, { color: colors.subText }]}>他 {game.dailyTasks.length - 2} 個のタスク...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetTime: {
    fontSize: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  tasksPreview: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  completed: {},
  pending: {},
  taskName: {
    fontSize: 14,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default GameCard;