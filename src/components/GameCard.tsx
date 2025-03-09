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
  compact?: boolean; // コンパクトモード用のプロパティを追加
}

const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
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
        },
        compact && styles.compactCard
      ]} 
      onPress={handlePress}
    >
      <View style={styles.contentContainer}>
        {/* 左側のコンテンツ: ゲーム名とタスク */}
        <View style={styles.leftContent}>
          <Text 
            style={[
              styles.title, 
              { color: colors.text },
              compact && styles.compactTitle
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {game.name}
          </Text>
          
          {/* タスク一覧 - ゲーム名のすぐ下 */}
          <View style={[styles.tasksContainer, compact && styles.compactTasksContainer]}>
            {compact ? (
              // コンパクトモード: 横並びでタスクを表示
              <View style={styles.compactTasksRow}>
                {game.dailyTasks.map((task, index) => (
                  <View 
                    key={task.id} 
                    style={[
                      styles.compactTaskItem, 
                      index < game.dailyTasks.length - 1 && styles.compactTaskItemWithMargin
                    ]}
                  >
                    <View 
                      style={[
                        styles.taskStatus, 
                        styles.compactTaskStatus,
                        task.completed 
                          ? [styles.completed, { backgroundColor: colors.success }] 
                          : [styles.pending, { backgroundColor: colors.border }]
                      ]} 
                    />
                    <Text 
                      style={[
                        styles.taskName, 
                        { color: task.completed ? colors.subText : colors.text },
                        styles.compactTaskName
                      ]} 
                      numberOfLines={1}
                    >
                      {task.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              // 標準モード: タスクを縦に表示
              <>
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
                  <Text style={[styles.moreText, { color: colors.subText }]}>
                    他 {game.dailyTasks.length - 2} 個のタスク...
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
        
        {/* 右側のコンテンツ: リセット時間と進捗バー */}
        <View style={styles.rightContent}>
          {/* リセット時間 */}
          <View style={styles.resetTimeContainer}>
            <Text 
              style={[
                styles.resetTimeLabel, 
                { color: colors.subText },
                compact && styles.compactResetTimeLabel
              ]}
            >
              リセット:
            </Text>
            <View style={styles.resetTimeValuesScrollContainer}>
              <View style={styles.resetTimeValuesContainer}>
                {game.resetTimes.map((time, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.resetTimeValue,
                      { color: colors.subText },
                      compact && styles.compactResetTimeValue,
                      index < game.resetTimes.length - 1 && styles.resetTimeValueWithMargin
                    ]}
                  >
                    {time}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          
          {/* 進捗バー */}
          <View style={[styles.progressContainer, compact && styles.compactProgressContainer]}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: colors.progressBar },
                compact && styles.compactProgressBar
              ]}
            >
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
            <Text 
              style={[
                styles.progressText, 
                { color: colors.subText },
                compact && styles.compactProgressText
              ]}
            >
              {game.dailyTasks.filter(task => task.completed).length}/{game.dailyTasks.length}
            </Text>
          </View>
        </View>
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
  compactCard: {
    padding: 10,
    paddingVertical: 8,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    marginRight: 10,
  },
  rightContent: {
    alignItems: 'flex-end',
    width: 140, // 幅を広げて横並びを確保
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  resetTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 5,
    flexWrap: 'nowrap', // 折り返しを禁止
    maxWidth: '100%',   // 親コンテナの幅を超えないように
  },
  resetTimeValuesScrollContainer: {
    maxWidth: 100, // スクロール領域の最大幅
    overflow: 'hidden',
  },
  resetTimeValuesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexShrink: 0, // 縮小しないように
  },
  resetTimeLabel: {
    fontSize: 12,
    marginRight: 3,
    flexShrink: 0, // 縮小しないように
  },
  resetTimeValue: {
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    flexShrink: 1,  // 必要に応じて縮小
    minWidth: 30,  // 最小幅を設定
  },
  compactResetTimeLabel: {
    fontSize: 10,
  },
  compactResetTimeValue: {
    fontSize: 10,
    paddingHorizontal: 3,
    paddingVertical: 0,
  },
  resetTimeValueWithMargin: {
    marginRight: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90,
  },
  compactProgressContainer: {
    width: 70,
  },
  progressBar: {
    width: 50,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 4,
  },
  compactProgressBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    width: 36,
    textAlign: 'right',
  },
  compactProgressText: {
    fontSize: 10,
    width: 26,
  },
  tasksContainer: {
    marginTop: 0, // タスク表示をゲーム名のすぐ下に
  },
  compactTasksContainer: {
    marginTop: 0,
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
  compactTaskStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  completed: {},
  pending: {},
  taskName: {
    fontSize: 14,
    flex: 1,
  },
  compactTaskName: {
    fontSize: 12,
  },
  moreText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  compactTasksRow: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  compactTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%', // 最大で画面の半分の幅
    flexShrink: 1,
  },
  compactTaskItemWithMargin: {
    marginRight: 8,
  },
});

export default GameCard;