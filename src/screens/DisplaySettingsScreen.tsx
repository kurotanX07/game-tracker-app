import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const DisplaySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { displaySettings, updateDisplaySettings } = useTaskContext();
  const { colors } = useTheme();
  
  // 現在の設定を一時的に保持するローカルステート
  const [sortCompletedToBottom, setSortCompletedToBottom] = useState(
    displaySettings.sortCompletedToBottom
  );
  
  const [sortByResetTime, setSortByResetTime] = useState(
    displaySettings.sortByResetTime
  );
  
  const [allowDragDrop, setAllowDragDrop] = useState(
    displaySettings.allowDragDrop
  );
  
  // タスク完了ゲームを下に表示する設定の切り替え
  const handleToggleSortCompleted = (value: boolean) => {
    setSortCompletedToBottom(value);
    updateDisplaySettings({ sortCompletedToBottom: value });
  };
  
  // リセット時間順での表示設定の切り替え
  const handleToggleSortByResetTime = (value: boolean) => {
    setSortByResetTime(value);
    updateDisplaySettings({ sortByResetTime: value });
  };
  
  // ドラッグ＆ドロップの切り替え
  const handleToggleDragDrop = (value: boolean) => {
    if (value) {
      // ドラッグ＆ドロップを有効にする前に確認
      Alert.alert(
        'カスタム並び替えモード',
        'カスタム並び替えを有効にすると、優先表示設定（タスク完了ゲームを下に表示、リセット時間順）は無効になります。よろしいですか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '有効にする',
            onPress: () => {
              setAllowDragDrop(true);
              updateDisplaySettings({ 
                allowDragDrop: true,
                // ドラッグ＆ドロップが有効の場合、他の自動並べ替え設定は無効化される
                sortCompletedToBottom: false,
                sortByResetTime: false
              });
              setSortCompletedToBottom(false);
              setSortByResetTime(false);
            }
          }
        ]
      );
    } else {
      // ドラッグ＆ドロップを無効にする場合は確認なしで切り替え
      setAllowDragDrop(false);
      updateDisplaySettings({ allowDragDrop: false });
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText, borderBottomColor: colors.border }]}>
          ゲーム表示の設定
        </Text>
        
        {/* 優先表示設定 */}
        <View style={styles.settingsGroup}>
          <Text style={[styles.groupLabel, { color: colors.primary }]}>
            優先表示設定
          </Text>
          
          {/* 自動並べ替え設定 - ドラッグ＆ドロップが無効の場合のみ有効 */}
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabel}>
              <Ionicons name="arrow-down-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                タスク完了したゲームを下に表示
              </Text>
            </View>
            <Switch
              value={sortCompletedToBottom}
              onValueChange={handleToggleSortCompleted}
              trackColor={{ false: '#DDDDDD', true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={allowDragDrop}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabel}>
              <Ionicons name="time-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                リセット時間が近いゲームを上に表示
              </Text>
            </View>
            <Switch
              value={sortByResetTime}
              onValueChange={handleToggleSortByResetTime}
              trackColor={{ false: '#DDDDDD', true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={allowDragDrop}
            />
          </View>
        </View>
        
        {/* カスタム並び替え設定 */}
        <View style={styles.settingsGroup}>
          <Text style={[styles.groupLabel, { color: colors.primary }]}>
            カスタム並び替え設定
          </Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabel}>
              <Ionicons name="reorder-four-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                ドラッグ＆ドロップで並べ替え
              </Text>
            </View>
            <Switch
              value={allowDragDrop}
              onValueChange={handleToggleDragDrop}
              trackColor={{ false: '#DDDDDD', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {allowDragDrop && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.subText }]}>
                ホーム画面でゲームカードを長押しするとドラッグできます。
                この設定が有効な場合、優先表示設定は無効になります。
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.noteContainer}>
        <Text style={[styles.noteText, { color: colors.subText }]}>
          ※ お気に入り設定したゲームは常に一番上に表示されます。
        </Text>
        <Text style={[styles.noteText, { color: colors.subText }]}>
          ※ ゲームカードの右上の星マークをタップするとお気に入り設定できます。
        </Text>
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
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsGroup: {
    paddingVertical: 8,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flexShrink: 1,
  },
  infoBox: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  noteContainer: {
    margin: 16,
    marginTop: 24,
  },
  noteText: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default DisplaySettingsScreen;