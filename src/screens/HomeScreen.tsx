import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  LayoutChangeEvent,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GameCard from '../components/GameCard';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { 
  RenderItemParams, 
  ScaleDecorator 
} from 'react-native-draggable-flatlist';
import { Game } from '../@types';

// React Navigation 7対応のため型を変更
type HomeScreenNavigationProp = any;

// 画面の高さを取得
const { height: screenHeight } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { 
    games, 
    loading, 
    error, 
    fetchGames, 
    toggleGameFavorite,
    reorderGames,
    displaySettings,
    updateDisplaySettings
  } = useTaskContext();
  const { colors } = useTheme();
  
  // コンパクトモード状態
  const [useCompactMode, setUseCompactMode] = useState(false);
  // 利用可能な高さ
  const [availableHeight, setAvailableHeight] = useState(screenHeight);
  
  // ソート済みのゲームリスト
  const [sortedGames, setSortedGames] = useState<Game[]>([]);
  
  // ヘッダーの高さを測定し、利用可能な高さを計算
  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    // 利用可能な高さを計算 (画面高さ - ヘッダー高さ - 余白)
    setAvailableHeight(screenHeight - height - 100); // 100はボトムタブやマージン用の余裕
  };
  
  // ゲーム数に応じてコンパクトモードを判断
  useEffect(() => {
    // 標準カードの推定高さ (マージンも含む)
    const standardCardHeight = 180;
    // コンパクトカードの推定高さ
    const compactCardHeight = 100;
    
    // 標準サイズで表示した場合の合計高さを計算
    const totalHeightStandard = games.length * standardCardHeight;
    
    // 合計高さが利用可能な高さを超える場合
    if (totalHeightStandard > availableHeight && games.length > 3) {
      setUseCompactMode(true);
    } else {
      setUseCompactMode(false);
    }
  }, [games.length, availableHeight]);

  // ゲームの並び替え
  useEffect(() => {
    if (games.length === 0) return;
    
    // 並び替えロジック
    let sorted = [...games];
    
    if (!displaySettings.allowDragDrop) {
      // カスタム並び替えが無効の場合は優先順位に基づいて並べ替え
      
      // 1. お気に入りのゲームを上部に表示
      sorted.sort((a, b) => {
        // まずはお気に入り状態で比較
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        
        // お気に入り状態が同じ場合は次の条件で比較
        return 0;
      });
      
      // 2. タスク完了状態に基づいて並べ替え（設定がONの場合）
      if (displaySettings.sortCompletedToBottom) {
        // 同じお気に入り状態のゲーム間でのみ完了状態で並び替え
        sorted = [
          // お気に入りのゲーム
          ...sorted.filter(game => game.favorite).sort((a, b) => {
            const aCompleted = isGameCompleted(a);
            const bCompleted = isGameCompleted(b);
            
            if (!aCompleted && bCompleted) return -1;
            if (aCompleted && !bCompleted) return 1;
            
            // 残りのソート条件を適用
            return sortByNextReset(a, b, displaySettings.sortByResetTime);
          }),
          
          // お気に入りでないゲーム
          ...sorted.filter(game => !game.favorite).sort((a, b) => {
            const aCompleted = isGameCompleted(a);
            const bCompleted = isGameCompleted(b);
            
            if (!aCompleted && bCompleted) return -1;
            if (aCompleted && !bCompleted) return 1;
            
            // 残りのソート条件を適用
            return sortByNextReset(a, b, displaySettings.sortByResetTime);
          })
        ];
      } else if (displaySettings.sortByResetTime) {
        // お気に入り状態が同じ場合はリセット時間で並び替え
        sorted = [
          // お気に入りのゲーム
          ...sorted.filter(game => game.favorite).sort((a, b) => {
            return sortByNextReset(a, b, true);
          }),
          
          // お気に入りでないゲーム
          ...sorted.filter(game => !game.favorite).sort((a, b) => {
            return sortByNextReset(a, b, true);
          })
        ];
      }
    } else {
      // カスタム並び替えが有効な場合はorder属性で並べ替え
      sorted.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    
    setSortedGames(sorted);
  }, [games, displaySettings]);

  // ゲームの完了状態をチェック
  const isGameCompleted = (game: Game) => {
    // デイリータスクがない場合は未完了とみなす
    if (game.dailyTasks.length === 0) return false;
    
    // すべてのデイリータスクが完了しているかチェック
    return game.dailyTasks.every(task => task.completed);
  };
  
  // 次のリセット時間に基づいてゲームを比較するヘルパー関数
  const sortByNextReset = (a: Game, b: Game, useResetTime: boolean) => {
    if (!useResetTime) return 0;
    
    // 次のリセット時間を計算
    const aNextReset = getNextResetTime(a);
    const bNextReset = getNextResetTime(b);
    
    // 次のリセット時間が早い順に並べる
    if (aNextReset < bNextReset) return -1;
    if (aNextReset > bNextReset) return 1;
    
    // リセット時間が同じ場合は名前でソート
    return a.name.localeCompare(b.name);
  };
  
  // 次のリセット時間を取得するヘルパー関数
  const getNextResetTime = (game: Game) => {
    if (!game.resetTimes || game.resetTimes.length === 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    // すべてのリセット時間を分単位に変換
    const resetTimesInMinutes = game.resetTimes.map(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    // 次に来るリセット時間を見つける
    let nextResetMinutes = Number.MAX_SAFE_INTEGER;
    
    for (const resetTimeMinutes of resetTimesInMinutes) {
      if (resetTimeMinutes > currentTimeMinutes) {
        // 今日の残りの時間内に次のリセットがある場合
        nextResetMinutes = Math.min(nextResetMinutes, resetTimeMinutes);
      } else {
        // 次のリセットは翌日の場合
        nextResetMinutes = Math.min(nextResetMinutes, resetTimeMinutes + 24 * 60);
      }
    }
    
    return nextResetMinutes;
  };

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchGames();
  }, []);

  // 画面がフォーカスされた時にデータを再取得
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGames();
    });

    return unsubscribe;
  }, [navigation]);

  // ゲーム追加画面に遷移
  const handleAddGame = () => {
    navigation.navigate('GameAdd');
  };
  
  // 表示設定画面へ遷移
  const handleDisplaySettings = () => {
    navigation.navigate('DisplaySettings');
  };
  
  // ドラッグ＆ドロップによる並べ替え後の処理
  const handleDragEnd = ({ data }: { data: Game[] }) => {
    // 並び替え後のデータを保存
    reorderGames(data);
  };
  
  // ドラッグ可能なリストのレンダリング
  const renderDraggableItem = ({ item, drag, isActive }: RenderItemParams<Game>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity 
          onLongPress={drag}
          disabled={isActive}
          style={{ opacity: isActive ? 0.7 : 1 }}
        >
          <GameCard 
            game={item} 
            compact={useCompactMode} 
            onFavoriteToggle={toggleGameFavorite}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };
  
  // 通常リストのアイテムレンダリング
  const renderItem = ({ item }: { item: Game }) => {
    return (
      <GameCard 
        game={item} 
        compact={useCompactMode} 
        onFavoriteToggle={toggleGameFavorite}
      />
    );
  };

  // エラー時の表示
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={fetchGames}
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 読み込み中の表示
  if (loading && games.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>ゲームデータを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View 
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onLayout={onHeaderLayout}
      >
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>マイゲーム</Text>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.settingsButton]} 
              onPress={handleDisplaySettings}
            >
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]} 
              onPress={handleAddGame}
            >
              <Text style={styles.addButtonText}>+ 追加</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 表示モードのインジケーター */}
        {games.length > 0 && (
          <View style={styles.sortModeContainer}>
            {displaySettings.allowDragDrop ? (
              <Text style={[styles.sortModeText, { color: colors.subText }]}>
                <Ionicons name="reorder-four-outline" size={14} /> 
                カスタム順 (長押しで並べ替え)
              </Text>
            ) : (
              <Text style={[styles.sortModeText, { color: colors.subText }]}>
                <Ionicons name="arrow-up-outline" size={14} />
                {displaySettings.sortByResetTime ? ' リセット時間順' : ' 標準'}
                {displaySettings.sortCompletedToBottom ? ' / 完了タスクを下部に表示' : ''}
              </Text>
            )}
          </View>
        )}
      </View>

      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>ゲームがまだ登録されていません</Text>
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.primary }]} 
            onPress={handleAddGame}
          >
            <Text style={styles.startButtonText}>最初のゲームを追加する</Text>
          </TouchableOpacity>
        </View>
      ) : displaySettings.allowDragDrop ? (
        <DraggableFlatList
          data={sortedGames}
          keyExtractor={(item) => item.id}
          renderItem={renderDraggableItem}
          onDragEnd={handleDragEnd}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchGames}
        />
      ) : (
        <FlatList
          data={sortedGames}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchGames}
        />
      )}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 6,
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sortModeContainer: {
    marginTop: 6,
  },
  sortModeText: {
    fontSize: 12,
    textAlign: 'right',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default HomeScreen;