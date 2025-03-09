import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ProgressBar } from 'react-native';
import { Game } from '../@types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type GameCardNavigationProp = StackNavigationProp<RootStackParamList, 'GameDetail'>;

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigation = useNavigation<GameCardNavigationProp>();

  // デイリータスクの完了率を計算
  const completionRate = game.dailyTasks.length > 0 
    ? game.dailyTasks.filter(task => task.completed).length / game.dailyTasks.length 
    : 0;

  // ゲーム詳細画面に遷移
  const handlePress = () => {
    navigation.navigate('GameDetail', { gameId: game.id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>{game.name}</Text>
        <Text style={styles.resetTime}>リセット: {game.resetTime}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completionRate * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {game.dailyTasks.filter(task => task.completed).length}/{game.dailyTasks.length}
        </Text>
      </View>

      <View style={styles.tasksPreview}>
        {game.dailyTasks.slice(0, 2).map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={[styles.taskStatus, task.completed ? styles.completed : styles.pending]} />
            <Text style={styles.taskName} numberOfLines={1}>{task.name}</Text>
          </View>
        ))}
        {game.dailyTasks.length > 2 && (
          <Text style={styles.moreText}>他 {game.dailyTasks.length - 2} 個のタスク...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
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
    color: '#333',
  },
  resetTime: {
    fontSize: 12,
    color: '#666',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
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
  completed: {
    backgroundColor: '#4CAF50',
  },
  pending: {
    backgroundColor: '#E0E0E0',
  },
  taskName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default GameCard;