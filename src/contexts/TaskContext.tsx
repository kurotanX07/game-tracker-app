import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Game, DailyTask, CustomTask } from '../@types';
import LocalStorageService from '../services/LocalStorageService';
import { v4 as uuidv4 } from 'uuid';

// コンテキストの型定義
interface TaskContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  addGame: (newGame: Game) => Promise<void>;
  updateDailyTask: (gameId: string, taskId: string) => Promise<void>;
  addCustomTask: (gameId: string, task: CustomTask) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  removeTask: (gameId: string, taskId: string, taskType: 'daily' | 'custom') => Promise<void>;
  
  // 既存のメソッド
  updateTaskSettings: (
    gameId: string, 
    taskId: string, 
    settings: {
      type: 'game' | 'custom' | 'date';
      times: string[];
      endDate?: string;
      endTime?: string;
    }
  ) => Promise<void>;
  
  updateGameResetTimes: (
    gameId: string,
    resetTimes: string[]
  ) => Promise<void>;

  // 新しい表示順・お気に入り関連のメソッド
  toggleGameFavorite: (gameId: string) => Promise<void>;
  updateGameOrder: (gameId: string, newOrder: number) => Promise<void>;
  reorderGames: (reorderedGames: Game[]) => Promise<void>;
  displaySettings: {
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  };
  updateDisplaySettings: (settings: Partial<{
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  }>) => Promise<void>;
  
  // ゲーム情報更新メソッド
  updateGameInfo: (gameId: string, updates: Partial<Game>) => Promise<void>;
}

// コンテキストの作成
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// コンテキストプロバイダーの型定義
interface TaskProviderProps {
  children: ReactNode;
}

// コンテキストプロバイダーコンポーネント
export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 表示設定のステートを追加
  const [displaySettings, setDisplaySettings] = useState<{
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  }>({
    sortCompletedToBottom: true,
    sortByResetTime: true,
    allowDragDrop: false
  });

  // 初期データの読み込み
  useEffect(() => {
    fetchGames();
    
    // 表示設定の読み込み
    const loadDisplaySettings = async () => {
      try {
        const settings = await LocalStorageService.getDisplaySettings();
        setDisplaySettings(settings);
      } catch (err) {
        console.error('表示設定の読み込みエラー:', err);
      }
    };
    
    loadDisplaySettings();
  }, []);

  // ゲームデータの取得
  const fetchGames = async () => {
    try {
      setLoading(true);
      // 自動リセットチェック
      await LocalStorageService.checkAndResetDailyTasks();
      
      const fetchedGames = await LocalStorageService.getGames();
      setGames(fetchedGames);
      setError(null);
    } catch (err) {
      setError('ゲームデータの取得に失敗しました');
      console.error('ゲームデータの取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新しいゲームの追加
  const addGame = async (newGame: Game) => {
    try {
      // resetTimesがない場合は、resetTimeから初期化
      if (!newGame.resetTimes || newGame.resetTimes.length === 0) {
        newGame.resetTimes = [newGame.resetTime];
      }

      // タスクにresetSettingsがない場合は追加
      newGame.dailyTasks = newGame.dailyTasks.map(task => {
        if (!task.resetSettings) {
          return {
            ...task,
            resetSettings: {
              type: 'game',
              times: [],
              lastResetAt: null
            }
          };
        }
        return task;
      });

      await LocalStorageService.addGame(newGame);
      setGames(prevGames => [...prevGames, newGame]);
    } catch (err) {
      setError('ゲームの追加に失敗しました');
      console.error('ゲームの追加エラー:', err);
    }
  };

  // デイリータスクの更新
  const updateDailyTask = async (gameId: string, taskId: string) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          const updatedTasks = game.dailyTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: !task.completed, lastCompletedAt: new Date() }
              : task
          );
          
          // すべてのタスクが完了したかチェック
          const allTasksCompleted = updatedTasks.every(task => task.completed);
          
          return { 
            ...game, 
            dailyTasks: updatedTasks,
            // すべてのタスクが完了した場合、ゲーム全体の完了時間を更新
            lastCompletedAt: allTasksCompleted ? new Date() : game.lastCompletedAt
          };
        }
        return game;
      });

      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error('タスクの更新エラー:', err);
    }
  };

  // カスタムタスクの追加
  const addCustomTask = async (gameId: string, task: CustomTask) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return { 
            ...game, 
            customTasks: [...game.customTasks, task] 
          };
        }
        return game;
      });

      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('カスタムタスクの追加に失敗しました');
      console.error('カスタムタスクの追加エラー:', err);
    }
  };

  // ゲームの削除
  const removeGame = async (gameId: string) => {
    try {
      const updatedGames = games.filter(game => game.id !== gameId);
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('ゲームの削除に失敗しました');
      console.error('ゲームの削除エラー:', err);
    }
  };

  // タスクの削除
  const removeTask = async (gameId: string, taskId: string, taskType: 'daily' | 'custom') => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          if (taskType === 'daily') {
            return {
              ...game,
              dailyTasks: game.dailyTasks.filter(task => task.id !== taskId)
            };
          } else {
            return {
              ...game,
              customTasks: game.customTasks.filter(task => task.id !== taskId)
            };
          }
        }
        return game;
      });

      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error('タスクの削除エラー:', err);
    }
  };

  // タスクのリセット設定を更新
  const updateTaskSettings = async (
    gameId: string,
    taskId: string,
    settings: {
      type: 'game' | 'custom' | 'date';
      times: string[];
      endDate?: string;
      endTime?: string;
    }
  ) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          const updatedTasks = game.dailyTasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                resetSettings: {
                  ...task.resetSettings,
                  type: settings.type,
                  times: settings.type === 'custom' ? settings.times : [],
                  endDate: settings.type === 'date' ? settings.endDate : undefined,
                  endTime: settings.type === 'date' ? settings.endTime : undefined,
                }
              };
            }
            return task;
          });
          return { ...game, dailyTasks: updatedTasks };
        }
        return game;
      });
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('タスク設定の更新に失敗しました');
      console.error('タスク設定の更新エラー:', err);
    }
  };

  // ゲームのリセット時間を更新
  const updateGameResetTimes = async (
    gameId: string,
    resetTimes: string[]
  ) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            resetTimes,
            resetTime: resetTimes[0] || '06:00', // 互換性のために単一のresetTimeも更新
          };
        }
        return game;
      });
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('ゲームリセット時間の更新に失敗しました');
      console.error('ゲームリセット時間の更新エラー:', err);
    }
  };
  
  // ゲームのお気に入り設定を切り替え
  const toggleGameFavorite = async (gameId: string) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return { ...game, favorite: !game.favorite };
        }
        return game;
      });
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('お気に入り設定の更新に失敗しました');
      console.error('お気に入り設定の更新エラー:', err);
    }
  };

  // ゲームの並び順を更新（ドラッグ＆ドロップで使用）
  const updateGameOrder = async (gameId: string, newOrder: number) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return { ...game, order: newOrder };
        }
        return game;
      });
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('ゲームの並び順の更新に失敗しました');
      console.error('ゲームの並び順の更新エラー:', err);
    }
  };

  // ゲームのリスト全体を並べ替え（ドラッグ＆ドロップ後）
  const reorderGames = async (reorderedGames: Game[]) => {
    try {
      // 新しい順序を各ゲームに設定
      const updatedGames = reorderedGames.map((game, index) => ({
        ...game,
        order: index
      }));
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('ゲームの並べ替えに失敗しました');
      console.error('ゲームの並べ替えエラー:', err);
    }
  };

  // 表示設定を更新
  const updateDisplaySettings = async (settings: Partial<{
    sortCompletedToBottom: boolean;
    sortByResetTime: boolean;
    allowDragDrop: boolean;
  }>) => {
    try {
      const newSettings = { ...displaySettings, ...settings };
      setDisplaySettings(newSettings);
      await LocalStorageService.saveDisplaySettings(newSettings);
    } catch (err) {
      setError('表示設定の更新に失敗しました');
      console.error('表示設定の更新エラー:', err);
    }
  };
  
  // ゲーム情報を更新する一般的なメソッド
  const updateGameInfo = async (gameId: string, updates: Partial<Game>) => {
    try {
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return { ...game, ...updates };
        }
        return game;
      });
      
      setGames(updatedGames);
      await LocalStorageService.saveGames(updatedGames);
    } catch (err) {
      setError('ゲーム情報の更新に失敗しました');
      console.error('ゲーム情報の更新エラー:', err);
    }
  };

  // コンテキスト値の作成
  const value = {
    games,
    loading,
    error,
    fetchGames,
    addGame,
    updateDailyTask,
    addCustomTask,
    removeGame,
    removeTask,
    updateTaskSettings,
    updateGameResetTimes,
    toggleGameFavorite,
    updateGameOrder,
    reorderGames,
    displaySettings,
    updateDisplaySettings,
    updateGameInfo
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// カスタムフック
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};