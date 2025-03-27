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
      title: 'My Tasks',
      emptyState: 'No tasks added yet',
      addFirstGame: 'Add your first task',
      loadingGames: 'Loading task data...',
      errorLoadingGames: 'Failed to load task data',
      sortMode: {
        custom: 'Custom order mode',
        resetTime: 'Sorted by reset time',
        completed: 'Completed tasks at bottom',
        compact: 'Compact view',
        sorting: 'Sorting mode (use arrows to change order)'
      }
    },
    gameAdd: {
      title: 'Add Task',
      gameName: 'Task Name',
      nameInputPlaceholder: 'Enter task name',
      resetTime: 'Task Reset Time',
      addResetTime: '+ Add reset time',
      removeTime: 'Remove',
      dailyTasks: 'Daily Tasks',
      taskInputPlaceholder: 'Enter task name',
      addTask: '+ Add task',
      validation: {
        gameNameRequired: 'Please enter a task name',
        resetTimeRequired: 'Please set at least one reset time',
        taskNameRequired: 'Please fill in all task names'
      },
      errorSaving: 'Failed to save the task'
    },
    gameDetail: {
      title: 'Task Details',
      resetTime: 'Reset time:',
      tasks: 'Tasks',
      addTask: 'Add',
      deleteGame: 'Delete Task',
      deleteConfirm: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete'
      },
      gameNotFound: 'Task not found',
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
        commonTime: 'Common reset times:',
        addTime: '+ Add reset time',
        info: 'Changing reset times will affect all tasks using the common settings.'
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
        copyright: '© 2025 Daily Task Manager'
      },
      reset: {
        title: 'Reset Data',
        message: 'Delete all task data? This action cannot be undone.',
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