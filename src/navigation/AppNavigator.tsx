import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// スクリーンのインポート
import HomeScreen from '../screens/HomeScreen';
import GameAddScreen from '../screens/GameAddScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ナビゲーション型定義
export type RootStackParamList = {
  MainTab: undefined;
  GameAdd: undefined;
  GameDetail: { gameId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// メインタブナビゲーション
const MainTabNavigator: React.FC = () => {
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
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ホーム' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: '設定' }}
      />
    </Tab.Navigator>
  );
};

// メインアプリケーションナビゲーター
const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTab" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GameAdd" 
        component={GameAddScreen} 
        options={{ title: 'ゲームを追加' }}
      />
      <Stack.Screen 
        name="GameDetail" 
        component={GameDetailScreen} 
        options={{ title: 'ゲーム詳細' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;