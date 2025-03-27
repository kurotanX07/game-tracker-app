import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

/**
 * ルートスタックナビゲーションの型定義
 */
export type RootStackParamList = {
  MainTab: undefined;
  GameAdd: undefined;
  GameDetail: { gameId: string };
  TaskSettings: { gameId: string; taskId: string };
  DisplaySettings: undefined;
};

/**
 * メインタブナビゲーションの型定義
 */
export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

/**
 * ホーム画面のナビゲーション型
 * (タブナビゲーションとスタックナビゲーションの複合型)
 */
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

/**
 * 設定画面のナビゲーション型
 */
export type SettingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  StackNavigationProp<RootStackParamList>
>;

/**
 * ゲーム詳細画面のナビゲーション型とルート型
 */
export type GameDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GameDetail'
>;

export type GameDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'GameDetail'
>;

/**
 * タスク設定画面のナビゲーション型とルート型
 */
export type TaskSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TaskSettings'
>;

export type TaskSettingsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TaskSettings'
>;

/**
 * ゲームカードのナビゲーション型
 */
export type GameCardNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * ディスプレイ設定画面のナビゲーション型
 */
export type DisplaySettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DisplaySettings'
>;