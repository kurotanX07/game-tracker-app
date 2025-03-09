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
  
  // 新しいメソッド
  updateTaskSettings: (
    gameId: string, 
    taskId: string, 
    settings: {
      type: 'game' | 'custom';
      times: string[];
    }
  ) => Promise<void>;
  
  updateGameResetTimes: (
    gameId: string,
    resetTimes: string[]
  ) => Promise<void>;
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

  // 初期データの読み込み
  useEffect(() => {
    fetchGames();
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
          return { ...game, dailyTasks: updatedTasks };
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
      type: 'game' | 'custom';
      times: string[];
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
    updateGameResetTimes
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