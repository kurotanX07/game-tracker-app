import 'react-native-get-random-values'; // UUID対応のため必要
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AdService } from './src/services/AdService';
import { TaskProvider } from './src/contexts/TaskContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <NavigationContainer>
          <AppNavigator />
          <AdService.BannerAd />
        </NavigationContainer>
      </TaskProvider>
    </SafeAreaProvider>
  );
};

export default App;