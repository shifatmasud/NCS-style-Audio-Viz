import React, { createContext, useState, useContext, useMemo } from 'react';
import { colors, typography, spacing, radii, motion, shadows, zIndex } from './designTokens';

// Tier 2 - Design System: Semantic Tokens
const darkTheme = {
  // Category/Purpose/Context/Variant
  Color: {
    Base: {
      Surface: { 1: colors.black, 2: colors.gray950, 3: colors.gray900 },
      Content: { 1: colors.gray100, 2: colors.gray400, 3: colors.gray600 },
    },
    Primary: {
      Surface: { 1: colors.blue },
      Content: { 1: colors.white },
    },
    Border: {
      1: colors.gray800,
      2: colors.gray700
    },
  },
  Typography: typography,
  Spacing: spacing,
  Radii: radii,
  Motion: motion,
  Shadows: shadows,
  ZIndex: zIndex,
};

const lightTheme = {
  ...darkTheme, // Inherit non-color tokens
  Color: {
    Base: {
      Surface: { 1: colors.white, 2: colors.gray100, 3: colors.gray200 },
      Content: { 1: colors.gray900, 2: colors.gray700, 3: colors.gray500 },
    },
    Primary: {
      Surface: { 1: colors.blue },
      Content: { 1: colors.white },
    },
    Border: {
      1: colors.gray300,
      2: colors.gray400
    },
  },
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
  theme: Theme;
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

  // FIX: Replaced JSX with React.createElement to avoid parsing issues in a .ts file.
  // JSX syntax is not supported in files with a .ts extension; it requires a .tsx extension.
  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, themeMode, toggleTheme } },
    children
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
