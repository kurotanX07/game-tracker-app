import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { Game } from '../@types';

// React Navigation 7対応のため型を変更
type HomeScreenNavigationProp = any;

// 画面の高さと幅を取得
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// デバウンス関数 - 連続呼び出しを制限
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  
  // コンパクトモード状態とその変更履歴
  const [useCompactMode, setUseCompactMode] = useState(false);
  const [modeChangeCount, setModeChangeCount] = useState(0); // モード変更回数を追跡
  const lastModeChangeTime = useRef(0); // 最後にモードを変更した時間
  
  // コンテンツサイズと表示領域のサイズを追跡
  const [listContentHeight, setListContentHeight] = useState(0);
  const [listViewHeight, setListViewHeight] = useState(0);
  
  // ヘッダー高さとフッター高さを追跡
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerSpace, setFooterSpace] = useState(80); // ボトムタブバーなどの下部スペース
  
  // 安定化のためのヒステリシス閾値
  const COMPACT_THRESHOLD_RATIO = 0.95; // 画面の95%以上埋まったらコンパクトモードに
  const NORMAL_THRESHOLD_RATIO = 0.85;  // 画面の85%以下になったら通常モードに戻す
  
  // モード切替のクールダウン時間（ミリ秒）
  const MODE_CHANGE_COOLDOWN = 1000; // 1秒間は再切替を禁止
  
  // ゲーム数による簡易判定のための閾値
  const MIN_GAMES_FOR_COMPACT = 6; // この数以上のゲームがあれば常にコンパクトモード
  
  // FlatListの参照
  const listRef = useRef<FlatList>(null);
  
  // ソート済みのゲームリスト
  const [sortedGames, setSortedGames] = useState<Game[]>([]);
  
  // 並び替えモード（新規追加）
  const [sortingMode, setSortingMode] = useState(false);
  
  // ヘッダーの高さを測定
  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };
  
  // 安定化したコンパクトモード切替関数
  const updateCompactMode = useCallback(debounce((availableHeight: number, contentHeight: number, gameCount: number) => {
    const now = Date.now();
    const timeSinceLastChange = now - lastModeChangeTime.current;
    
    // クールダウン期間中は切替をスキップ
    if (timeSinceLastChange < MODE_CHANGE_COOLDOWN && modeChangeCount > 0) {
      console.log(`モード切替をスキップ: クールダウン中 (${timeSinceLastChange}ms / ${MODE_CHANGE_COOLDOWN}ms)`);
      return;
    }
    
    // ゲーム数が多い場合は常にコンパクトモード
    if (gameCount >= MIN_GAMES_FOR_COMPACT) {
      if (!useCompactMode) {
        console.log(`コンパクトモードに切替: ゲーム数(${gameCount})が閾値(${MIN_GAMES_FOR_COMPACT})以上`);
        setUseCompactMode(true);
        setModeChangeCount(prev => prev + 1);
        lastModeChangeTime.current = now;
      }
      return;
    }
    
    // 現在の表示率を計算
    const contentRatio = contentHeight / availableHeight;
    
    // ヒステリシスを使った切替判定
    if (!useCompactMode && contentRatio > COMPACT_THRESHOLD_RATIO) {
      // 通常モード → コンパクトモード
      console.log(`コンパクトモードに切替: 表示率 ${(contentRatio * 100).toFixed(1)}% > ${(COMPACT_THRESHOLD_RATIO * 100).toFixed(1)}%`);
      setUseCompactMode(true);
      setModeChangeCount(prev => prev + 1);
      lastModeChangeTime.current = now;
    } else if (useCompactMode && contentRatio < NORMAL_THRESHOLD_RATIO) {
      // コンパクトモード → 通常モード
      console.log(`通常モードに切替: 表示率 ${(contentRatio * 100).toFixed(1)}% < ${(NORMAL_THRESHOLD_RATIO * 100).toFixed(1)}%`);
      setUseCompactMode(false);
      setModeChangeCount(prev => prev + 1);
      lastModeChangeTime.current = now;
    }
  }, 300), [useCompactMode, modeChangeCount]); // デバウンス時間300ms
  
  // サイズ変更時のコンパクトモード判定
  useEffect(() => {
    if (listContentHeight > 0 && listViewHeight > 0 && headerHeight > 0) {
      // リストの表示可能な最大高さを計算
      const availableHeight = screenHeight - headerHeight - footerSpace;
      
      // コンパクトモードを更新
      updateCompactMode(availableHeight, listContentHeight, games.length);
    }
  }, [listContentHeight, listViewHeight, headerHeight, games.length]);
  
  // 画面回転やサイズ変更の検出
  useEffect(() => {
    // Dimensionsの変更を監視
    const onChange = () => {
      // サイズ変更時に再計算をトリガー
      const { height, width } = Dimensions.get('window');
      console.log(`画面サイズ変更: ${width}x${height}`);
      
      // 少し遅延させてコンテンツサイズが調整された後に判定
      setTimeout(() => {
        if (listRef.current) {
          // 強制的に再レンダリングして正確なサイズを取得
          listRef.current.forceUpdate();
        }
      }, 100);
    };
    
    // リスナーを追加
    Dimensions.addEventListener('change', onChange);
    
    // クリーンアップ
    return () => {
      // React Native新バージョンではこの方法でリスナーを削除
      // Dimensions.removeEventListener('change', onChange);
    };
  }, []);

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
  
  // ソーティングモードの切り替え（新規追加）
  const toggleSortingMode = () => {
    setSortingMode(!sortingMode);
    
    // ソーティングモードを終了する時、カスタム並び替えを有効にする
    if (sortingMode && !displaySettings.allowDragDrop) {
      updateDisplaySettings({ 
        allowDragDrop: true,
        sortCompletedToBottom: false,
        sortByResetTime: false
      });
    }
  };

  // タスク追加画面に遷移
  const handleAddGame = () => {
    navigation.navigate('GameAdd');
  };
  
  // 表示設定画面へ遷移
  const handleDisplaySettings = () => {
    navigation.navigate('DisplaySettings');
  };
  
  // タスクを上下に移動する関数（新規追加）
  const handleMoveGame = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sortedGames.length - 1)
    ) {
      return; // 境界チェック
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newGames = [...sortedGames];
    
    // 要素を入れ替え
    [newGames[index], newGames[newIndex]] = [newGames[newIndex], newGames[index]];
    
    // 並び順を更新
    const reorderedGames = newGames.map((game, idx) => ({
      ...game,
      order: idx
    }));
    
    // 保存
    reorderGames(reorderedGames);
  };
  
  // リストのコンテンツサイズが変わったときに呼ばれる
  const handleContentSizeChange = (width: number, height: number) => {
    setListContentHeight(height);
  };
  
  // リストのレイアウトが変わったときに呼ばれる
  const handleListLayout = (event: LayoutChangeEvent) => {
    setListViewHeight(event.nativeEvent.layout.height);
  };
  
  // 通常リストのアイテムレンダリング（修正済み）
  const renderItem = ({ item, index }: { item: Game; index: number }) => {
    return (
      <View style={styles.gameItemContainer}>
        {/* ソートボタン - ソーティングモード時のみ表示 */}
        {sortingMode && (
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                { borderColor: colors.border },
                index === 0 && { opacity: 0.3 }
              ]}
              onPress={() => handleMoveGame(index, 'up')}
              disabled={index === 0}
            >
              <Ionicons name="chevron-up" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                { borderColor: colors.border },
                index === sortedGames.length - 1 && { opacity: 0.3 }
              ]}
              onPress={() => handleMoveGame(index, 'down')}
              disabled={index === sortedGames.length - 1}
            >
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.gameCardWrapper}>
          <GameCard 
            game={item} 
            compact={useCompactMode} 
            onFavoriteToggle={toggleGameFavorite}
          />
        </View>
      </View>
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
        <Text style={[styles.loadingText, { color: colors.subText }]}>タスクデータを読み込み中...</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>マイタスク</Text>
          
          <View style={styles.headerButtons}>
            {/* 並び替えボタン（新規追加） */}
            <TouchableOpacity 
              style={[
                styles.iconButton,
                sortingMode && { backgroundColor: colors.primary + '33' }  // 薄い背景色を追加
              ]} 
              onPress={toggleSortingMode}
            >
              <Ionicons 
                name={sortingMode ? "save-outline" : "list-outline"} 
                size={22} 
                color={sortingMode ? colors.primary : colors.text} 
              />
            </TouchableOpacity>
            
            {/* 設定ボタン */}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleDisplaySettings}
            >
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            
            {/* 追加ボタン */}
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
            {sortingMode ? (
              <Text style={[styles.sortModeText, { color: colors.primary }]}>
                <Ionicons name="information-circle-outline" size={14} /> 
                並び替えモード（上下の矢印で順序を変更）
              </Text>
            ) : (
              displaySettings.allowDragDrop ? (
                <Text style={[styles.sortModeText, { color: colors.subText }]}>
                  <Ionicons name="reorder-four-outline" size={14} /> 
                  カスタム順表示モード {useCompactMode ? '(コンパクト表示)' : ''}
                </Text>
              ) : (
                <Text style={[styles.sortModeText, { color: colors.subText }]}>
                  <Ionicons name="arrow-up-outline" size={14} />
                  {displaySettings.sortByResetTime ? ' リセット時間順' : ' 標準'}
                  {displaySettings.sortCompletedToBottom ? ' / 完了タスクを下部に表示' : ''}
                  {useCompactMode ? ' (コンパクト表示)' : ''}
                </Text>
              )
            )}
          </View>
        )}
      </View>

      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>タスクがまだ登録されていません</Text>
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.primary }]} 
            onPress={handleAddGame}
          >
            <Text style={styles.startButtonText}>最初のタスクを追加する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={sortedGames}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchGames}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleListLayout}
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
  iconButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
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
  // 並び替え関連の新しいスタイル
  gameItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameCardWrapper: {
    flex: 1,
  },
  sortButtons: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 4,
    marginRight: 4,
  },
  sortButton: {
    borderWidth: 1,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
});

export default HomeScreen;