import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

// AdService クラス - 広告管理
export class AdService {
  // 広告ID（プラットフォーム別・テスト用ID）
  private static bannerAdUnitId = Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111'
  });

  private static interstitialAdUnitId = Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712'
  });

  private static rewardedAdUnitId = Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917'
  });

  // ストレージキー
  private static AD_COUNTER_KEY = 'ad_interaction_counter';
  private static LAST_INTERSTITIAL_KEY = 'last_interstitial_time';

  // テストモード設定
  static async initializeAds() {
    console.log('広告の初期化は一時的に無効化されています');
  }

  // インタースティシャル広告を表示
  static async showInterstitial() {
    console.log('インタースティシャル広告は一時的に無効化されています');
    return false;
  }

  // リワード広告を表示
  static async showRewarded(): Promise<boolean> {
    console.log('リワード広告は一時的に無効化されています');
    return false;
  }

  // インタラクション回数の増加
  static async incrementAdCounter() {
    console.log('広告カウンターは一時的に無効化されています');
    return false;
  }

  // バナー広告コンポーネント - テーマに対応
  static BannerAd = () => {
    const { colors } = useTheme();
    
    // ダミーのバナー広告コンポーネントを返す
    return (
      <View style={[styles.adContainer, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.subText, fontSize: 12 }}>広告スペース (開発中)</Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  }
});