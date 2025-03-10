import React from 'react';
import { View } from 'react-native';

// 完全にダミーのAdService - 何も実行しないバージョン
export class AdService {
  // 何もしない初期化関数
  static initializeAds() {
    console.log('ダミー広告サービス: 初期化スキップ');
    return Promise.resolve();
  }

  // 何もしないカウンター関数
  static incrementAdCounter() {
    return Promise.resolve(false);
  }

  // 何も表示しないバナー
  static BannerAd = () => {
    // 透明な空のコンポーネントを返す
    return <View style={{ height: 0 }} />;
  };

  // 何もしないインタースティシャル
  static showInterstitial() {
    return Promise.resolve(false);
  }
}