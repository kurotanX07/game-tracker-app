import 'react-native-get-random-values'; // UUID対応のため必要
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TaskProvider, useTaskContext } from './src/contexts/TaskContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import NotificationService from './src/services/NotificationService';
import { View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 通知設定の初期化
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 通知初期化済みチェック用のキー
const NOTIFICATION_INIT_CHECK_KEY = 'notification_init_session';

// Theme-aware NavigationContainer wrapper
const ThemedApp = () => {
  const { theme, colors } = useTheme();
  const { games } = useTaskContext();
  
  // 通知初期化済みフラグ
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);
  
  // 通知の参照を保持
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  // Initialize Notifications when app starts
  useEffect(() => {
    // 通知のタスクスケジュール (改善版)
// ThemedApp コンポーネント内の通知初期化関数
const initNotifications = async () => {
  try {
    // このセッションで既に初期化済みかチェック
    const isInitializedThisSession = await AsyncStorage.getItem(NOTIFICATION_INIT_CHECK_KEY);
    
    if (isInitializedThisSession === 'true') {
      console.log('このセッションで既に通知が初期化されています。スキップします。');
      setNotificationsInitialized(true);
      return;
    }
    
    // 通知の初期セットアップを一度だけ実行
    // 初回起動時にはリセットのみ行い、通知のスケジュールは行わない
    await NotificationService.initialSetup(games);
    
    // このセッションでの初期化完了をマーク
    await AsyncStorage.setItem(NOTIFICATION_INIT_CHECK_KEY, 'true');
    setNotificationsInitialized(true);
    console.log('通知の初期化が完了しました');
  } catch (error) {
    console.error('通知初期化エラー:', error);
    setNotificationsInitialized(true); // エラー時も初期化完了とマーク
  }
};
    
    // 通知初期化を実行
    if (!notificationsInitialized) {
      initNotifications();
    }
    
    // 通知リスナーを設定
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // 通知を受け取った時の処理（必要に応じて）
      console.log('通知を受信:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // 通知をタップした時の処理
      handleNotificationResponse(response);
    });

    // クリーンアップ関数
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [games, notificationsInitialized]);
  
  // 通知応答の処理
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // 通知のデータに基づいて処理
    if (data.gameId && data.taskId) {
      // 必要に応じてナビゲーションやその他の処理を行う
      // 例: navigation.navigate('GameDetail', { gameId: data.gameId });
      console.log('通知タップ:', data);
    }
  };
  
  // カスタムナビゲーションテーマを作成
  const customTheme = {
    // デフォルトのダークテーマまたはライトテーマをベースにする
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    // 以下のプロパティをオーバーライド
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={customTheme}>
        <AppNavigator />
      </NavigationContainer>
      {/* 広告の表示を一時的に無効化 */}
    </View>
  );
};

const App = () => {
  // アプリ起動時にセッション初期化フラグをリセット
  useEffect(() => {
    const resetSessionFlag = async () => {
      try {
        await AsyncStorage.removeItem(NOTIFICATION_INIT_CHECK_KEY);
        console.log('通知セッションフラグをリセットしました');
      } catch (error) {
        console.error('セッションフラグリセットエラー:', error);
      }
    };
    
    resetSessionFlag();
  }, []);
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TaskProvider>
          <ThemedApp />
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;