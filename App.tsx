import 'react-native-get-random-values'; // UUID対応のため必要
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TaskProvider } from './src/contexts/TaskContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { AdService } from './src/services/AdService';
import { View, StyleSheet } from 'react-native';

// Theme-aware NavigationContainer wrapper
const ThemedApp = () => {
  const { theme, colors } = useTheme();
  
  // Initialize AdService when app starts
  useEffect(() => {
    AdService.initializeAds();
  }, []);
  
  // Define navigation theme
  const navigationTheme = {
    dark: theme === 'dark',
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
      <NavigationContainer theme={navigationTheme}>
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