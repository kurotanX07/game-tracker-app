import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import GameCard from '../components/GameCard';
import { useTaskContext } from '../contexts/TaskContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTab'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { games, loading, error, fetchGames } = useTaskContext();

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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGames}>
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 読み込み中の表示
  if (loading && games.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>ゲームデータを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>マイゲーム</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGame}>
          <Text style={styles.addButtonText}>+ 追加</Text>
        </TouchableOpacity>
      </View>

      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ゲームがまだ登録されていません</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleAddGame}>
            <Text style={styles.startButtonText}>最初のゲームを追加する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GameCard game={item} />}
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6200EE',
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
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#6200EE',
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
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6200EE',
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
    color: '#666',
  },
});

export default HomeScreen;