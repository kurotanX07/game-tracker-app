/**
 * 日本語の翻訳ファイル
 */
export default {
    common: {
      add: '追加',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      back: '戻る',
      confirm: '確認',
      yes: 'はい',
      no: 'いいえ',
      error: 'エラー',
      success: '成功',
      loading: '読み込み中...',
      processing: '処理中...',
      settings: '設定',
      retry: '再試行',
      done: '完了'
    },
    home: {
      title: 'マイゲーム',
      emptyState: 'ゲームがまだ登録されていません',
      addFirstGame: '最初のゲームを追加する',
      loadingGames: 'ゲームデータを読み込み中...',
      errorLoadingGames: 'ゲームデータの取得に失敗しました',
      sortMode: {
        custom: 'カスタム順表示モード',
        resetTime: 'リセット時間順',
        completed: '完了タスクを下部に表示',
        compact: 'コンパクト表示',
        sorting: '並び替えモード（上下の矢印で順序を変更）'
      }
    },
    gameAdd: {
      title: 'ゲームを追加',
      gameName: 'ゲーム名',
      nameInputPlaceholder: 'ゲーム名を入力',
      resetTime: 'タスクリセット時間',
      addResetTime: '+ リセット時間を追加',
      removeTime: '削除',
      dailyTasks: 'デイリータスク',
      taskInputPlaceholder: 'タスク名を入力',
      addTask: '+ タスクを追加',
      validation: {
        gameNameRequired: 'ゲーム名を入力してください',
        resetTimeRequired: '少なくとも1つのリセット時間を設定してください',
        taskNameRequired: 'すべてのタスク名を入力してください'
      },
      errorSaving: 'ゲームの保存に失敗しました'
    },
    gameDetail: {
      title: 'ゲーム詳細',
      resetTime: 'リセット時間:',
      tasks: 'タスク',
      addTask: '追加',
      deleteGame: 'ゲームを削除',
      deleteConfirm: {
        title: 'ゲームの削除',
        message: 'を削除してもよろしいですか？'
      },
      gameNotFound: 'ゲームが見つかりませんでした',
      noTasks: 'タスクはまだありません',
      modalAddTask: {
        title: 'タスクを追加',
        taskName: 'タスク名',
        taskType: 'タスクタイプ',
        checkbox: 'チェックボックス',
        counter: 'カウンター',
        maxValue: '最大値'
      },
      modalResetTime: {
        title: 'リセット時間設定',
        commonTime: 'ゲーム共通のリセット時間:',
        addTime: '+ リセット時間を追加',
        info: 'リセット時間を変更すると、ゲーム共通設定を使用しているすべてのタスクに影響します。'
      }
    },
    taskSettings: {
      title: 'タスク設定',
      notifications: 'リセット通知',
      notificationInfo: {
        enabled: 'リセット時間の5分前と、リセット時間に通知が届きます',
        disabled: '通知はオフになっています'
      },
      resetSettings: 'リセット設定',
      resetType: {
        game: {
          title: 'ゲーム共通のリセット時間を使用',
          description: '設定された時間ごとに毎日リセット'
        },
        custom: {
          title: 'カスタムリセット時間を使用',
          description: 'このタスク専用のリセット時間を設定'
        },
        date: {
          title: '特定日時までリセットしない',
          description: '指定した日時まで完了状態を維持'
        }
      },
      resetTime: 'リセット時間',
      addResetTime: '+ リセット時間を追加',
      resetDate: 'リセット日時',
      selectDate: '日付を選択',
      gameCommonTimes: 'ゲーム共通のリセット時間',
      noteChangeCommonTime: '※ゲーム共通の時間を変更するには、ゲーム設定画面から行ってください',
      dateModeInfo: '指定した日時までタスク完了状態を維持します。その後、次回のリセット時間でリセットされます。',
      permissionDenied: '通知許可が必要です',
      permissionMessage: '設定アプリから本アプリの通知を許可してください',
      deleteTask: 'タスクを削除',
      taskDeleteConfirm: {
        title: 'タスクの削除',
        message: 'を削除してもよろしいですか？'
      }
    },
    settings: {
      title: '設定',
      general: '一般設定',
      notifications: '通知',
      darkMode: 'ダークモード',
      dataManagement: 'データ管理',
      exportData: 'データのエクスポート',
      importData: 'データのインポート',
      resetData: 'データのリセット',
      support: 'サポート',
      helpAndSupport: 'ヘルプとサポート',
      appInfo: {
        version: 'バージョン:',
        copyright: '© 2025 ゲームデイリータスク'
      },
      reset: {
        title: 'データのリセット',
        message: 'すべてのゲームとタスクデータを削除しますか？この操作は元に戻せません。',
        success: 'すべてのデータがリセットされました'
      }
    },
    displaySettings: {
      title: '表示設定',
      gameDisplaySettings: 'ゲーム表示の設定',
      priorityDisplaySettings: '優先表示設定',
      completedToBottom: 'タスク完了したゲームを下に表示',
      resetTimeSort: 'リセット時間が近いゲームを上に表示',
      customSortSettings: 'カスタム並べ替え設定',
      manualSort: '手動で順序を並べ替え',
      customSortInfo: 'ゲームカードに上下矢印が表示され、タップしてゲームの順序を変更できます。この設定が有効な場合、優先表示設定は無効になります。',
      note: {
        favoriteFirst: '※ お気に入り設定したゲームは常に一番上に表示されます。',
        favoriteToggle: '※ ゲームカードの右上の星マークをタップするとお気に入り設定できます。'
      },
      customSortConfirm: {
        title: 'カスタム並び替えモード',
        message: '手動並び替えを有効にすると、優先表示設定（タスク完了ゲームを下に表示、リセット時間順）は無効になります。よろしいですか？',
        enable: '有効にする'
      }
    },
    notifications: {
      resetSoon: 'リセットまもなく',
      resetSoonBody: 'が5分後にリセットされます',
      taskReset: 'タスクリセット',
      taskResetBody: 'がリセットされました',
      deadlineSoon: 'タスク完了期限まもなく',
      deadlineSoonBody: 'の完了期限があと5分で終了します'
    }
  };