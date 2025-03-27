import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// スクリーンのインポート
import HomeScreen from '../screens/HomeScreen';
import GameAddScreen from '../screens/GameAddScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TaskSettingsScreen from '../screens/TaskSettingsScreen';
import DisplaySettingsScreen from '../screens/DisplaySettingsScreen'; // 新しい表示設定画面

// ナビゲーション型定義
export type RootStackParamList = {
  MainTab: undefined;
  GameAdd: undefined;
  GameDetail: { gameId: string };
  TaskSettings: { gameId: string; taskId: string };
  DisplaySettings: undefined; // 表示設定画面の型定義を追加
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

// React Navigation 7対応のための修正
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// メインタブナビゲーション
const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        // ヘッダータイトルのスタイルを明示的に定義
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',  // 'bold'ではなく数値または文字列の値を使用
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'ホーム',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: '設定',
        }}
      />
    </Tab.Navigator>
  );
};

// メインアプリケーションナビゲーター
const AppNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="MainTab" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GameAdd" 
        component={GameAddScreen} 
        options={{ title: 'タスクを追加' }}
      />
      <Stack.Screen 
        name="GameDetail" 
        component={GameDetailScreen} 
        options={{ title: 'タスク詳細' }}
      />
      <Stack.Screen 
        name="TaskSettings" 
        component={TaskSettingsScreen} 
        options={{ title: 'タスク設定' }}
      />
      <Stack.Screen 
        name="DisplaySettings" 
        component={DisplaySettingsScreen} 
        options={{ title: '表示設定' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;