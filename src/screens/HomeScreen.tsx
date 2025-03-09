import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, LayoutChangeEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GameCard from '../components/GameCard';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';

// React Navigation 7対応のため型を変更
type HomeScreenNavigationProp = any;

// 画面の高さを取得
const { height: screenHeight } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { games, loading, error, fetchGames } = useTaskContext();
  const { colors } = useTheme();
  
  // コンパクトモード状態
  const [useCompactMode, setUseCompactMode] = useState(false);
  // 利用可能な高さ
  const [availableHeight, setAvailableHeight] = useState(screenHeight);
  
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
        <Text style={[styles.title, { color: colors.text }]}>マイゲーム</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]} 
          onPress={handleAddGame}
        >
          <Text style={styles.addButtonText}>+ 追加</Text>
        </TouchableOpacity>
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
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GameCard game={item} compact={useCompactMode} />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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