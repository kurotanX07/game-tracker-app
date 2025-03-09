import 'react-native-get-random-values'; // UUID対応のため必要
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TaskProvider, useTaskContext } from './src/contexts/TaskContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { AdService } from './src/services/AdService';
import NotificationService from './src/services/NotificationService';
import { View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

// 通知設定の初期化
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Theme-aware NavigationContainer wrapper
const ThemedApp = () => {
  const { theme, colors } = useTheme();
  const { games } = useTaskContext();
  
  // 通知の参照を保持
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  // Initialize AdService and Notifications when app starts
  useEffect(() => {
    // 広告の初期化
    AdService.initializeAds();
    
    // 通知のタスクスケジュール
    const initNotifications = async () => {
      // パーミッションチェック（リクエストはしない、設定画面でリクエスト）
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        // すべてのタスク通知を更新
        await NotificationService.updateAllTaskNotifications(games);
      }
    };
    
    initNotifications();
    
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
  }, [games]);
  
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
      {/* 広告モジュールの問題が解決するまで一時的にコメントアウト */}
      {/* <AdService.BannerAd /> */}
    </View>
  );
};

const App = () => {
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