import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTaskContext } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const TaskSettingsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId, taskId } = route.params as { gameId: string; taskId: string };
  const { games, updateTaskSettings } = useTaskContext();
  const { colors } = useTheme();
  
  // ゲームとタスクの取得
  const game = games.find(g => g.id === gameId);
  const task = game?.dailyTasks.find(t => t.id === taskId);
  
  if (!game || !task) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          タスクが見つかりませんでした
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // 状態管理
  const [useCustomSettings, setUseCustomSettings] = useState(
    task.resetSettings.type === 'custom'
  );
  const [resetTimes, setResetTimes] = useState(
    task.resetSettings.type === 'custom'
      ? [...task.resetSettings.times]
      : [...game.resetTimes]
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(-1);
  
  // 時間選択を表示
  const handleShowTimePicker = (index: number) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  // 時間選択ハンドラ
  const handleTimeChange = (event: any, selectedDate?: Date, index: number = 0) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const updatedTimes = [...resetTimes];
      updatedTimes[index] = timeString;
      setResetTimes(updatedTimes);
    }
  };

  // リセット時間追加ハンドラ
  const handleAddResetTime = () => {
    // デフォルトで正午を追加
    setResetTimes([...resetTimes, '12:00']);
  };

  // リセット時間削除ハンドラ
  const handleRemoveResetTime = (index: number) => {
    if (resetTimes.length > 1) {
      const updatedTimes = [...resetTimes];
      updatedTimes.splice(index, 1);
      setResetTimes(updatedTimes);
    } else {
      Alert.alert('エラー', '少なくとも1つのリセット時間が必要です');
    }
  };

  // 時間文字列をDate型に変換
  const getTimeAsDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  // 設定保存ハンドラ
  const handleSave = async () => {
    if (resetTimes.length === 0) {
      Alert.alert('エラー', '少なくとも1つのリセット時間を設定してください');
      return;
    }
    
    const settings = {
      type: useCustomSettings ? 'custom' : 'game',
      times: useCustomSettings ? resetTimes : [],
    };
    
    try {
      await updateTaskSettings(gameId, taskId, settings);
      navigation.goBack();
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました');
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.header, { color: colors.text }]}>
            タスク: {task.name}
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              カスタムリセット設定を使用
            </Text>
            <Switch
              value={useCustomSettings}
              onValueChange={setUseCustomSettings}
              trackColor={{ false: '#DDDDDD', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.subText }]}>
              {useCustomSettings
                ? 'このタスクは独自のリセット時間を使用します'
                : 'このタスクはゲーム共通のリセット時間を使用します'}
            </Text>
          </View>
          
          {useCustomSettings && (
            <View style={styles.timesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                リセット時間
              </Text>
              
              {resetTimes.map((time, index) => (
                <View key={index} style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.timePickerButton,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => handleShowTimePicker(index)}
                  >
                    <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                  </TouchableOpacity>
                  
                  {/* 削除ボタン（1つ以上あるときのみ表示） */}
                  {resetTimes.length > 1 && (
                    <TouchableOpacity
                      style={[
                        styles.removeTimeButton,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => handleRemoveResetTime(index)}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.error }]}>削除</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedTimeIndex === index && showTimePicker && (
                    <DateTimePicker
                      value={getTimeAsDate(time)}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) handleTimeChange(event, selectedDate, index);
                      }}
                    />
                  )}
                </View>
              ))}
              
              {/* 時間追加ボタン */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary
                  }
                ]}
                onPress={handleAddResetTime}
              >
                <Text style={[styles.addButtonText, { color: colors.primary }]}>
                  + リセット時間を追加
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {!useCustomSettings && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ゲーム共通のリセット時間
            </Text>
            
            <View style={styles.gameTimesContainer}>
              {game.resetTimes.map((time, index) => (
                <View key={index} style={[
                  styles.gameTimeItem,
                  { backgroundColor: colors.background, borderColor: colors.border }
                ]}>
                  <Text style={[styles.gameTimeText, { color: colors.text }]}>
                    {time}
                  </Text>
                </View>
              ))}
            </View>
            
            <Text style={[styles.noteText, { color: colors.subText }]}>
              ※ゲーム共通の時間を変更するには、ゲーム設定画面から行ってください
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.cancelButton,
            {
              borderColor: colors.border
            }
          ]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.subText }]}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary
            }
          ]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timesContainer: {
    marginTop: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  timePickerButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
  },
  removeTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  gameTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gameTimeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  gameTimeText: {
    fontSize: 14,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TaskSettingsScreen;