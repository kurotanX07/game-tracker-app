import { Game } from '../@types';

/**
 * 日付をフォーマットする関数
 * @param date 日付オブジェクト
 * @param format フォーマット (省略時は YYYY/MM/DD HH:MM)
 * @returns フォーマット済みの日付文字列
 */
export const formatDate = (date: Date | null, format: string = 'datetime'): string => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // 月と日を2桁で表示
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  switch (format) {
    case 'date':
      return `${year}/${monthStr}/${dayStr}`;
    case 'time':
      return `${hours}:${minutes}`;
    case 'datetime':
    default:
      return `${year}/${monthStr}/${dayStr} ${hours}:${minutes}`;
  }
};

/**
 * 日付を表示用にフォーマットする関数
 * @param date 日付オブジェクト
 * @returns YYYY/MM/DD形式の文字列
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '日付を選択';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

/**
 * 時間文字列をDate型に変換
 * @param timeString 時間文字列 (HH:MM形式)
 * @returns Date型のオブジェクト
 */
export const getTimeAsDate = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * 次のリセット時間を取得 (分単位)
 * @param game ゲームオブジェクト
 * @returns 次のリセット時間 (午前0時からの分数)
 */
export const getNextResetTime = (game: Game): number => {
  if (!game.resetTimes || game.resetTimes.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  // すべてのリセット時間を分単位に変換
  const resetTimesInMinutes = game.resetTimes.map(timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  // 次に来るリセット時間を見つける
  let nextResetMinutes = Number.MAX_SAFE_INTEGER;
  
  for (const resetTimeMinutes of resetTimesInMinutes) {
    if (resetTimeMinutes > currentTimeMinutes) {
      // 今日の残りの時間内に次のリセットがある場合
      nextResetMinutes = Math.min(nextResetMinutes, resetTimeMinutes);
    } else {
      // 次のリセットは翌日の場合
      nextResetMinutes = Math.min(nextResetMinutes, resetTimeMinutes + 24 * 60);
    }
  }
  
  return nextResetMinutes;
};

/**
 * 時間までの残り時間を人間が読みやすい形式で取得
 * @param targetMinutes 目標時間 (分)
 * @returns 「あとX時間Y分」という形式の文字列
 */
export const getReadableTimeUntil = (targetMinutes: number): string => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  let diffMinutes = targetMinutes - currentTimeMinutes;
  
  // 翌日の場合
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0) {
    return `あと${hours}時間${minutes > 0 ? `${minutes}分` : ''}`;
  } else {
    return `あと${minutes}分`;
  }
};

/**
 * 2つの日付が同じ日か確認する
 * @param date1 日付1
 * @param date2 日付2
 * @returns 同じ日ならtrue
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 現在の日付に指定した日数を加えた日付を取得
 * @param days 加算する日数
 * @returns 新しい日付
 */
export const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * 日付文字列をYYYY-MM-DD形式に変換する
 * @param date 日付オブジェクト
 * @returns YYYY-MM-DD形式の文字列
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};