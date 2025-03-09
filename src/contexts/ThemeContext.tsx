import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeType = 'light' | 'dark';

// Define colors for both themes
export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  primary: string;
  border: string;
  error: string;
  success: string;
  checkbox: string;
  progressBar: string;
  progressFill: string;
}

// Theme values
export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    subText: '#666666',
    primary: '#6200EE',
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#4CAF50',
    checkbox: '#6200EE',
    progressBar: '#EEEEEE',
    progressFill: '#4CAF50'
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    subText: '#AAAAAA',
    primary: '#BB86FC',
    border: '#333333',
    error: '#CF6679',
    success: '#03DAC5',
    checkbox: '#BB86FC',
    progressBar: '#333333',
    progressFill: '#03DAC5'
  }
};

// Context type definition
interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key
const THEME_STORAGE_KEY = 'app_theme';

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  // Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Save to storage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Get current theme colors
  const colors = themes[theme];

  // Context value
  const value = {
    theme,
    colors,
    toggleTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};