import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { Game } from '../@types';
import LocalStorageService from './LocalStorageService';

/**
 * データのインポート・エクスポートを管理するサービス
 */
class DataImportExportService {
  /**
   * 現在のゲームデータを文字列として取得
   */
  static async getDataAsString(): Promise<string> {
    try {
      const games = await LocalStorageService.getGames();
      return JSON.stringify(games, null, 2); // 整形して読みやすくする
    } catch (error) {
      console.error('データ取得エラー:', error);
      throw new Error('データの取得に失敗しました');
    }
  }

  /**
   * データをクリップボードにコピー
   */
  static async copyToClipboard(): Promise<void> {
    try {
      const dataString = await this.getDataAsString();
      await Clipboard.setStringAsync(dataString);
    } catch (error) {
      console.error('クリップボードコピーエラー:', error);
      throw new Error('クリップボードへのコピーに失敗しました');
    }
  }

  /**
   * データをファイルとしてエクスポート
   */
  static async exportToFile(): Promise<string> {
    try {
      // ファイル名を生成（現在の日時を含む）
      const now = new Date();
      const fileName = `game_tracker_data_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.json`;
      
      // エクスポート用の一時ファイルパス
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // データを取得してファイルに書き込む
      const dataString = await this.getDataAsString();
      await FileSystem.writeAsStringAsync(fileUri, dataString);
      
      // ファイルを共有
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'ゲームデータをエクスポート',
          UTI: 'public.json' // iOS用
        });
        return fileUri;
      } else {
        throw new Error('ファイル共有がこのデバイスでは使用できません');
      }
    } catch (error) {
      console.error('ファイルエクスポートエラー:', error);
      throw error;
    }
  }

  /**
   * ファイルからデータをインポート
   */
  static async importFromFile(): Promise<Game[]> {
    try {
      // ファイル選択ダイアログを表示
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      // ユーザーがキャンセルした場合
      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('ファイル選択がキャンセルされました');
      }
      
      const fileUri = result.assets[0].uri;
      
      // ファイルを読み込む
      const jsonData = await FileSystem.readAsStringAsync(fileUri);
      
      try {
        // JSONデータをパース
        const importedGames = JSON.parse(jsonData) as Game[];
        
        // バリデーション - 最低限の構造チェック
        if (!Array.isArray(importedGames)) {
          throw new Error('インポートされたデータは有効なゲームデータではありません');
        }
        
        // 各ゲームのデータが正しい形式かチェック
        for (const game of importedGames) {
          if (!game.id || !game.name || !Array.isArray(game.dailyTasks)) {
            throw new Error('インポートされたデータに無効なゲーム情報が含まれています');
          }
        }
        
        return importedGames;
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        throw new Error('ファイルの内容が有効なJSONデータではありません');
      }
    } catch (error) {
      console.error('ファイルインポートエラー:', error);
      throw error;
    }
  }

  /**
   * クリップボードからデータをインポート
   */
  static async importFromClipboard(): Promise<Game[]> {
    try {
      // クリップボードからテキストを取得
      const clipboardText = await Clipboard.getStringAsync();
      
      if (!clipboardText) {
        throw new Error('クリップボードにテキストがありません');
      }
      
      try {
        // JSONデータをパース
        const importedGames = JSON.parse(clipboardText) as Game[];
        
        // バリデーション - 最低限の構造チェック
        if (!Array.isArray(importedGames)) {
          throw new Error('クリップボードのデータは有効なゲームデータではありません');
        }
        
        // 各ゲームのデータが正しい形式かチェック
        for (const game of importedGames) {
          if (!game.id || !game.name || !Array.isArray(game.dailyTasks)) {
            throw new Error('クリップボードのデータに無効なゲーム情報が含まれています');
          }
        }
        
        return importedGames;
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        throw new Error('クリップボードの内容が有効なJSONデータではありません');
      }
    } catch (error) {
      console.error('クリップボードインポートエラー:', error);
      throw error;
    }
  }

  /**
   * インポートしたデータを既存データに統合
   * @param importedGames インポートされたゲームデータ
   * @param mergeStrategy 統合戦略（'replace'=置き換え, 'merge'=統合, 'add'=追加のみ）
   */
  static async mergeImportedData(
    importedGames: Game[], 
    mergeStrategy: 'replace' | 'merge' | 'add' = 'merge'
  ): Promise<Game[]> {
    try {
      // 現在のゲームデータを取得
      const currentGames = await LocalStorageService.getGames();
      
      let resultGames: Game[] = [];
      
      switch (mergeStrategy) {
        case 'replace':
          // 既存データを完全に置き換える
          resultGames = [...importedGames];
          break;
          
        case 'add':
          // 既存のIDと重複しないものだけを追加
          const existingIds = new Set(currentGames.map(game => game.id));
          const newGames = importedGames.filter(game => !existingIds.has(game.id));
          resultGames = [...currentGames, ...newGames];
          break;
          
        case 'merge':
        default:
          // IDごとに統合する（同じIDがあれば上書き）
          const gamesMap = new Map<string, Game>();
          
          // 現在のゲームをMapに追加
          currentGames.forEach(game => {
            gamesMap.set(game.id, game);
          });
          
          // インポートしたゲームで上書きまたは追加
          importedGames.forEach(game => {
            gamesMap.set(game.id, game);
          });
          
          // Mapから配列に戻す
          resultGames = Array.from(gamesMap.values());
          break;
      }
      
      // 更新したデータを保存
      await LocalStorageService.saveGames(resultGames);
      
      return resultGames;
    } catch (error) {
      console.error('データ統合エラー:', error);
      throw new Error('インポートデータの統合に失敗しました');
    }
  }
}

export default DataImportExportService;