import { Platform, NativeModules } from 'react-native';
import en from './locales/en';
import ja from './locales/ja';

/**
 * 利用可能な言語コード
 */
export type LanguageCode = 'en' | 'ja';

/**
 * すべての翻訳を含むオブジェクト
 */
const locales: Record<LanguageCode, any> = { en, ja };

/**
 * デバイスの言語コードを取得する
 */
const getDeviceLanguage = (): LanguageCode => {
  try {
    // デバイスの言語設定を取得
    const deviceLanguage = 
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;
    
    // 言語コードの最初の部分を取得（例: 'en_US' から 'en'）
    const languageCode = deviceLanguage.split('_')[0].toLowerCase();
    
    // サポートしている言語コードであるかチェック
    if (languageCode === 'en' || languageCode === 'ja') {
      return languageCode;
    }
    
    // サポートしていない言語の場合は英語をデフォルトにする
    return 'ja';
  } catch (error) {
    console.error('デバイス言語の取得に失敗しました:', error);
    return 'ja'; // エラーの場合は日本語をデフォルトにする
  }
};

/**
 * 現在の言語設定を保持する変数
 */
let currentLanguage: LanguageCode = getDeviceLanguage();

/**
 * 現在の言語の翻訳を取得する
 */
export const getLocale = () => {
  return locales[currentLanguage] || locales.ja;
};

/**
 * アプリの言語を設定する
 * @param languageCode 言語コード
 */
export const setLanguage = (languageCode: LanguageCode) => {
  if (locales[languageCode]) {
    currentLanguage = languageCode;
  }
};

/**
 * 翻訳キーに対応する文字列を取得する
 * ネストされたキーをドット表記で指定できる（例: 'home.title'）
 * @param key 翻訳キー
 * @param fallback フォールバックの文字列
 */
export const t = (key: string, fallback: string = ''): string => {
  try {
    const locale = getLocale();
    const keys = key.split('.');
    
    // ネストされたキーを順に探索
    let result = locale;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return fallback || key; // キーが見つからない場合はフォールバックまたはキー自体を返す
      }
    }
    
    // 結果が文字列の場合のみ返し、そうでなければフォールバック
    return typeof result === 'string' ? result : fallback || key;
  } catch (error) {
    console.error('翻訳キーの解決に失敗:', error);
    return fallback || key;
  }
};

/**
 * 翻訳文字列内の変数を置換する
 * 例: formatString('Hello {name}', { name: 'World' }) => 'Hello World'
 * @param text 置換対象の文字列
 * @param params 置換用パラメータ
 */
export const formatString = (text: string, params: Record<string, string | number>) => {
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  return result;
};

/**
 * 翻訳キーと置換パラメータを組み合わせて翻訳文字列を取得する
 * @param key 翻訳キー
 * @param params 置換用パラメータ
 * @param fallback フォールバックの文字列
 */
export const formatT = (key: string, params: Record<string, string | number>, fallback: string = '') => {
  const text = t(key, fallback);
  return formatString(text, params);
};

export default {
  t,
  formatT,
  setLanguage,
  getLocale,
  formatString,
};