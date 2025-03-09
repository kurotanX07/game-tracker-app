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
import { useTheme } from '../contexts/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { fetchGames } = useTaskContext();
  const { theme, colors, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // 通知設定切り替え
  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
    Alert.alert(
      '通知設定',
      '通知機能は現在のバージョンでは利用できません。今後のアップデートをお待ちください。'
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText, borderBottomColor: colors.border }]}>一般設定</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabel}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>通知</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#DDDDDD', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabel}>
            <Ionicons name={theme === 'dark' ? 'moon' : 'moon-outline'} size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>ダークモード</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#DDDDDD', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText, borderBottomColor: colors.border }]}>データ管理</Text>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleExportData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="download-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>データのエクスポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleImportData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="upload-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>データのインポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleResetData}>
          <View style={styles.menuItemContent}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
            <Text style={[styles.menuItemText, { color: colors.error }]}>データのリセット</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText, borderBottomColor: colors.border }]}>サポート</Text>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleOpenSupport}>
          <View style={styles.menuItemContent}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>ヘルプとサポート</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: colors.subText }]}>バージョン: 1.0.0</Text>
        <Text style={[styles.copyright, { color: colors.subText }]}>© 2025 ゲームデイリータスク</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  appInfo: {
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
  },
});

export default SettingsScreen;