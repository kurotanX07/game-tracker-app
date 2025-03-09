import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

export class AdService {
  // 広告IDの設定（プラットフォーム別・テスト用ID）
  private static bannerAdId = Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111'
  });

  // バナー広告コンポーネント
  static BannerAd = () => {
    return (
      <View style={styles.adContainer}>
        <AdMobBanner
          bannerSize="banner"
          adUnitID={AdService.bannerAdId}
          servePersonalizedAds={true}
          onDidFailToReceiveAdWithError={(error) => console.warn(error)}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
  }
});