import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageService from '../services/LocalStorageService';
import { useTaskContext } from '../contexts/TaskContext';

const SettingsScreen: React.FC = () => {
  const { fetchGames } = useTaskContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // 通知設定切り替え
  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
    Alert.alert(
      '通知設定',
      '通知機能は現在のバージョンでは利用できません。今後のアップデートをお待ちください。'
    );
  };

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setDarkModeEnabled(previousState => !previousState);
    Alert.alert(
      'ダークモード',
      'ダークモード機能は現在のバージョンでは利用できません。今後のアップデートをお待ちください。'
    );
  };

  // データエクスポート
  const handleExportData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(LocalStorageService.GAMES_STORAGE_KEY);
      if (jsonValue) {
        Alert.alert(
          'エクスポート成功',
          'データのエクスポートに成功しました。（実際のアプリではファイル保存またはクリップボードへのコピーなどが実装されます）'
        );
      }
    } catch (error) {
      Alert.alert('エラー', 'データのエクスポートに失敗しました');
    }
  };

  // データインポート
  const handleImportData = () => {
    Alert.alert(
      'データのインポート',
      'この機能は現在のバージョンでは利用できません。今後のアップデートをお待ちください。'
    );
  };

  // データリセット
  const handleResetData = () => {
    Alert.alert(
      'データのリセット',
      'すべてのゲームとタスクデータを削除しますか？この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(LocalStorageService.GAMES_STORAGE_KEY);
              await fetchGames(); // データリセット後に再取得
              Alert.alert('完了', 'すべてのデータがリセットされました');
            } catch (error) {
              Alert.alert('エラー', 'データのリセットに失敗しました');
            }
          },
        },
      ]
    );
  };

  // サポートページを開く
  const handleOpenSupport = () => {
    Linking.openURL('https://example.com/support');
  };

  // プライバシーポリシーを開く
  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  // 利用規約を開く
  const handleOpenTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>一般設定</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={styles.settingText}>通知</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#DDDDDD', true: '#6200EE' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Ionicons name="moon-outline" size={24} color="#333" />
            <Text style={styles.settingText}>ダークモード</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#DDDDDD', true: '#6200EE' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ管理</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="download-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>データのエクスポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleImportData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="upload-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>データのインポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleResetData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="trash-outline" size={24} color="#D32F2F" />
            <Text style={[styles.menuItemText, { color: '#D32F2F' }]}>データのリセット</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>サポート</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleOpenSupport}>
          <View style={styles.menuItemContent}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>ヘルプとサポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>バージョン: 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 ゲームデイリータスク</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  appInfo: {
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;