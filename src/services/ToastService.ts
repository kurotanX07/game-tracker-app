import { Alert, Platform } from 'react-native';

/**
 * トースト通知を管理するサービスクラス
 * 
 * 注: 本番環境では react-native-toast-message や react-native-flash-message などの
 * 専用ライブラリを使うことをお勧めします。このサービスはシンプルな実装です。
 */
export class ToastService {
  /**
   * トーストメッセージを表示する
   * @param message 表示するメッセージ
   * @param title タイトル (省略可)
   * @param duration 表示時間 (短い/長い - 実際にはAlert APIでは使用されない)
   */
  static show(message: string, title: string = '', duration: 'short' | 'long' = 'short') {
    // 実際のトーストライブラリを使用する場合は、この実装を置き換える
    Alert.alert(title, message);
  }
  
  /**
   * エラーメッセージを表示する
   * @param error エラーオブジェクト
   * @param fallbackMessage エラーメッセージが取得できない場合のフォールバックメッセージ
   */
  static showError(error: any, fallbackMessage: string = 'エラーが発生しました') {
    const errorMessage = error?.message || fallbackMessage;
    this.show(errorMessage, 'エラー');
  }
  
  /**
   * 成功メッセージを表示する
   * @param message 表示するメッセージ
   */
  static showSuccess(message: string) {
    this.show(message, '完了');
  }
  
  /**
   * 情報メッセージを表示する
   * @param message 表示するメッセージ
   */
  static showInfo(message: string) {
    this.show(message, '情報');
  }
  
  /**
   * 警告メッセージを表示する
   * @param message 表示するメッセージ
   */
  static showWarning(message: string) {
    this.show(message, '警告');
  }
}