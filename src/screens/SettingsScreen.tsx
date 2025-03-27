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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageService from '../services/LocalStorageService';
import DataImportExportService from '../services/DataImportExportService';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { ToastService } from '../services/ToastService';

const SettingsScreen: React.FC = () => {
  const { fetchGames } = useTaskContext();
  const { theme, colors, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // 通知設定切り替え
  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
    Alert.alert(
      '通知設定',
      '通知機能は現在のバージョンでは利用できません。今後のアップデートをお待ちください。'
    );
  };

  // データエクスポート - ファイル保存
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      await DataImportExportService.exportToFile();
      ToastService.showSuccess('データのエクスポートに成功しました');
    } catch (error) {
      ToastService.showError(error, 'データのエクスポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // データエクスポート - クリップボードにコピー
  const handleCopyToClipboard = async () => {
    try {
      setIsLoading(true);
      await DataImportExportService.copyToClipboard();
      ToastService.showSuccess('データをクリップボードにコピーしました');
    } catch (error) {
      ToastService.showError(error, 'クリップボードへのコピーに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // データインポートモーダルを表示
  const handleShowImportModal = () => {
    setImportModalVisible(true);
  };

  // ファイルからインポート
  const handleImportFromFile = async () => {
    try {
      setIsLoading(true);
      setImportModalVisible(false);
      
      const importedGames = await DataImportExportService.importFromFile();
      
      // インポート方法を選択するアラート
      Alert.alert(
        'インポート方法を選択',
        `${importedGames.length}個のゲームデータをインポートします。どのように処理しますか？`,
        [
          {
            text: '既存データに追加',
            onPress: async () => {
              await DataImportExportService.mergeImportedData(importedGames, 'add');
              await fetchGames();
              ToastService.showSuccess(`${importedGames.length}個のゲームデータを追加しました`);
            }
          },
          {
            text: '統合（既存を上書き）',
            onPress: async () => {
              await DataImportExportService.mergeImportedData(importedGames, 'merge');
              await fetchGames();
              ToastService.showSuccess(`ゲームデータを統合しました`);
            }
          },
          {
            text: '完全に置き換え',
            style: 'destructive',
            onPress: async () => {
              Alert.alert(
                '確認',
                '現在のすべてのデータが置き換えられます。この操作は元に戻せません。続行しますか？',
                [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '置き換える',
                    style: 'destructive',
                    onPress: async () => {
                      await DataImportExportService.mergeImportedData(importedGames, 'replace');
                      await fetchGames();
                      ToastService.showSuccess('ゲームデータを置き換えました');
                    }
                  }
                ]
              );
            }
          },
          { text: 'キャンセル', style: 'cancel' }
        ]
      );
    } catch (error) {
      ToastService.showError(error, 'データのインポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // クリップボードからインポート
  const handleImportFromClipboard = async () => {
    try {
      setIsLoading(true);
      setImportModalVisible(false);
      
      const importedGames = await DataImportExportService.importFromClipboard();
      
      // インポート方法を選択するアラート
      Alert.alert(
        'インポート方法を選択',
        `${importedGames.length}個のゲームデータをインポートします。どのように処理しますか？`,
        [
          {
            text: '既存データに追加',
            onPress: async () => {
              await DataImportExportService.mergeImportedData(importedGames, 'add');
              await fetchGames();
              ToastService.showSuccess(`${importedGames.length}個のゲームデータを追加しました`);
            }
          },
          {
            text: '統合（既存を上書き）',
            onPress: async () => {
              await DataImportExportService.mergeImportedData(importedGames, 'merge');
              await fetchGames();
              ToastService.showSuccess(`ゲームデータを統合しました`);
            }
          },
          {
            text: '完全に置き換え',
            style: 'destructive',
            onPress: async () => {
              Alert.alert(
                '確認',
                '現在のすべてのデータが置き換えられます。この操作は元に戻せません。続行しますか？',
                [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '置き換える',
                    style: 'destructive',
                    onPress: async () => {
                      await DataImportExportService.mergeImportedData(importedGames, 'replace');
                      await fetchGames();
                      ToastService.showSuccess('ゲームデータを置き換えました');
                    }
                  }
                ]
              );
            }
          },
          { text: 'キャンセル', style: 'cancel' }
        ]
      );
    } catch (error) {
      ToastService.showError(error, 'クリップボードからのインポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
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
              setIsLoading(true);
              await AsyncStorage.removeItem(LocalStorageService.GAMES_STORAGE_KEY);
              await fetchGames(); // データリセット後に再取得
              ToastService.showSuccess('すべてのデータがリセットされました');
            } catch (error) {
              ToastService.showError(error, 'データのリセットに失敗しました');
            } finally {
              setIsLoading(false);
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

  // エクスポートオプションを表示
  const handleExportOptions = () => {
    Alert.alert(
      'データのエクスポート',
      'エクスポート方法を選択してください',
      [
        { text: 'ファイルとして保存', onPress: handleExportData },
        { text: 'クリップボードにコピー', onPress: handleCopyToClipboard },
        { text: 'キャンセル', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
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
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleExportOptions}>
            <View style={styles.menuItemContent}>
              <Ionicons name="download-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>データのエクスポート</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleShowImportModal}>
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
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleOpenPrivacyPolicy}>
            <View style={styles.menuItemContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleOpenTerms}>
            <View style={styles.menuItemContent}>
              <Ionicons name="document-text-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>利用規約</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.subText }]}>バージョン: 1.0.0</Text>
          <Text style={[styles.copyright, { color: colors.subText }]}>© 2025 ゲームデイリータスク</Text>
        </View>
      </ScrollView>

      {/* インポート選択モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={importModalVisible}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              データのインポート
            </Text>
            
            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleImportFromFile}
            >
              <Ionicons name="document-outline" size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                ファイルから読み込む
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleImportFromClipboard}
            >
              <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                クリップボードから読み込む
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setImportModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.subText }]}>
                キャンセル
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ローディングインジケータ */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
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
  // モーダルスタイル
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  // ローディングインジケータ
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;