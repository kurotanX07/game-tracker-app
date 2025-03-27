/**
 * English translation file
 */
export default {
    common: {
      add: 'Add',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      processing: 'Processing...',
      settings: 'Settings',
      retry: 'Retry',
      done: 'Done'
    },
    home: {
      title: 'My Games',
      emptyState: 'No games added yet',
      addFirstGame: 'Add your first game',
      loadingGames: 'Loading game data...',
      errorLoadingGames: 'Failed to load game data',
      sortMode: {
        custom: 'Custom order mode',
        resetTime: 'Sorted by reset time',
        completed: 'Completed games at bottom',
        compact: 'Compact view',
        sorting: 'Sorting mode (use arrows to change order)'
      }
    },
    gameAdd: {
      title: 'Add Game',
      gameName: 'Game Name',
      nameInputPlaceholder: 'Enter game name',
      resetTime: 'Task Reset Time',
      addResetTime: '+ Add reset time',
      removeTime: 'Remove',
      dailyTasks: 'Daily Tasks',
      taskInputPlaceholder: 'Enter task name',
      addTask: '+ Add task',
      validation: {
        gameNameRequired: 'Please enter a game name',
        resetTimeRequired: 'Please set at least one reset time',
        taskNameRequired: 'Please fill in all task names'
      },
      errorSaving: 'Failed to save the game'
    },
    gameDetail: {
      title: 'Game Details',
      resetTime: 'Reset time:',
      tasks: 'Tasks',
      addTask: 'Add',
      deleteGame: 'Delete Game',
      deleteConfirm: {
        title: 'Delete Game',
        message: 'Are you sure you want to delete'
      },
      gameNotFound: 'Game not found',
      noTasks: 'No tasks added yet',
      modalAddTask: {
        title: 'Add Task',
        taskName: 'Task Name',
        taskType: 'Task Type',
        checkbox: 'Checkbox',
        counter: 'Counter',
        maxValue: 'Max Value'
      },
      modalResetTime: {
        title: 'Reset Time Settings',
        commonTime: 'Game common reset times:',
        addTime: '+ Add reset time',
        info: 'Changing reset times will affect all tasks using the game common settings.'
      }
    },
    taskSettings: {
      title: 'Task Settings',
      notifications: 'Reset Notifications',
      notificationInfo: {
        enabled: 'You will receive notifications 5 minutes before and at reset time',
        disabled: 'Notifications are turned off'
      },
      resetSettings: 'Reset Settings',
      resetType: {
        game: {
          title: 'Use game common reset times',
          description: 'Resets daily at configured times'
        },
        custom: {
          title: 'Use custom reset times',
          description: 'Set specific reset times for this task'
        },
        date: {
          title: 'Do not reset until specific date',
          description: 'Maintain completion state until specified date'
        }
      },
      resetTime: 'Reset Time',
      addResetTime: '+ Add reset time',
      resetDate: 'Reset Date & Time',
      selectDate: 'Select date',
      gameCommonTimes: 'Game Common Reset Times',
      noteChangeCommonTime: '※ To change common reset times, go to the game settings screen',
      dateModeInfo: 'Task completion state will be maintained until the specified date and time. It will reset at the next reset time after that.',
      permissionDenied: 'Notification permission required',
      permissionMessage: 'Please enable notifications for this app in the Settings app',
      deleteTask: 'Delete Task',
      taskDeleteConfirm: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete'
      }
    },
    settings: {
      title: 'Settings',
      general: 'General Settings',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      dataManagement: 'Data Management',
      exportData: 'Export Data',
      importData: 'Import Data',
      resetData: 'Reset Data',
      support: 'Support',
      helpAndSupport: 'Help & Support',
      appInfo: {
        version: 'Version:',
        copyright: '© 2025 Game Daily Tasks'
      },
      reset: {
        title: 'Reset Data',
        message: 'Delete all games and task data? This action cannot be undone.',
        success: 'All data has been reset'
      }
    },
    displaySettings: {
      title: 'Display Settings',
      gameDisplaySettings: 'Game Display Settings',
      priorityDisplaySettings: 'Priority Display Settings',
      completedToBottom: 'Show completed games at the bottom',
      resetTimeSort: 'Show games with upcoming reset times at the top',
      customSortSettings: 'Custom Sort Settings',
      manualSort: 'Manually sort order',
      customSortInfo: 'Up and down arrows will appear on game cards, allowing you to change the order by tapping. When this setting is enabled, priority display settings will be disabled.',
      note: {
        favoriteFirst: '※ Favorite games will always appear at the top.',
        favoriteToggle: '※ Tap the star icon in the top right of a game card to favorite it.'
      },
      customSortConfirm: {
        title: 'Custom Sort Mode',
        message: 'When enabling manual sorting, priority display settings (completed games at bottom, sort by reset time) will be disabled. Continue?',
        enable: 'Enable'
      }
    },
    notifications: {
      resetSoon: 'Reset Soon',
      resetSoonBody: 'will reset in 5 minutes',
      taskReset: 'Task Reset',
      taskResetBody: 'has been reset',
      deadlineSoon: 'Task Deadline Soon',
      deadlineSoonBody: 'completion deadline ends in 5 minutes'
    }
  };