// Theme configuration for WinningSon-inator

export type ThemeName = 'default' | 'dark' | 'vintage' | 'baby-pink';

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgCard: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Border and accent colors
    border: string;
    shadow: string;

    // Button colors
    btnPrimaryBg: string;
    btnPrimaryText: string;
    btnPrimaryHoverBg: string;
    btnPrimaryHoverText: string;

    btnSecondaryBg: string;
    btnSecondaryText: string;
    btnSecondaryHoverBg: string;

    // Input colors
    inputBg: string;
    inputBorder: string;
    inputFocusShadow: string;

    // Special colors
    accent: string;
    accentLight: string;
    error: string;
    warning: string;
    success: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    displayName: 'Classic',
    description: 'Bold black and white design',
    colors: {
      bgPrimary: '#f9fafb',
      bgSecondary: '#ffffff',
      bgCard: '#ffffff',

      textPrimary: '#000000',
      textSecondary: '#374151',
      textMuted: '#9ca3af',

      border: '#000000',
      shadow: '#000000',

      btnPrimaryBg: '#000000',
      btnPrimaryText: '#ffffff',
      btnPrimaryHoverBg: '#ffffff',
      btnPrimaryHoverText: '#000000',

      btnSecondaryBg: '#ffffff',
      btnSecondaryText: '#000000',
      btnSecondaryHoverBg: '#f3f4f6',

      inputBg: '#ffffff',
      inputBorder: '#000000',
      inputFocusShadow: '#000000',

      accent: '#000000',
      accentLight: '#f3f4f6',
      error: '#ef4444',
      warning: '#fef3c7',
      success: '#10b981',
    },
  },

  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    description: 'Sleek greyish dark theme',
    colors: {
      bgPrimary: '#1a1a1a',
      bgSecondary: '#2a2a2a',
      bgCard: '#2a2a2a',

      textPrimary: '#f5f5f5',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',

      border: '#404040',
      shadow: '#000000',

      btnPrimaryBg: '#f5f5f5',
      btnPrimaryText: '#1a1a1a',
      btnPrimaryHoverBg: '#3a3a3a',
      btnPrimaryHoverText: '#f5f5f5',

      btnSecondaryBg: '#3a3a3a',
      btnSecondaryText: '#f5f5f5',
      btnSecondaryHoverBg: '#4a4a4a',

      inputBg: '#2a2a2a',
      inputBorder: '#404040',
      inputFocusShadow: '#606060',

      accent: '#60a5fa',
      accentLight: '#3a3a3a',
      error: '#f87171',
      warning: '#78350f',
      success: '#34d399',
    },
  },

  vintage: {
    name: 'vintage',
    displayName: 'Vintage Paper',
    description: 'Coffee-stained nostalgia',
    colors: {
      bgPrimary: '#f4e8d8',
      bgSecondary: '#faf5ed',
      bgCard: '#faf5ed',

      textPrimary: '#3e2723',
      textSecondary: '#5d4037',
      textMuted: '#8d6e63',

      border: '#6d4c41',
      shadow: '#4e342e',

      btnPrimaryBg: '#6d4c41',
      btnPrimaryText: '#faf5ed',
      btnPrimaryHoverBg: '#faf5ed',
      btnPrimaryHoverText: '#6d4c41',

      btnSecondaryBg: '#faf5ed',
      btnSecondaryText: '#6d4c41',
      btnSecondaryHoverBg: '#f0e5d8',

      inputBg: '#faf5ed',
      inputBorder: '#6d4c41',
      inputFocusShadow: '#8d6e63',

      accent: '#a0522d',
      accentLight: '#f0e5d8',
      error: '#c62828',
      warning: '#fef3c7',
      success: '#558b2f',
    },
  },

  'baby-pink': {
    name: 'baby-pink',
    displayName: 'Baby Pink',
    description: 'Soft feminine pastels',
    colors: {
      bgPrimary: '#fff5f7',
      bgSecondary: '#fffafc',
      bgCard: '#fffafc',

      textPrimary: '#4a1942',
      textSecondary: '#7c2d75',
      textMuted: '#c084ba',

      border: '#f48fb1',
      shadow: '#ec407a',

      btnPrimaryBg: '#f48fb1',
      btnPrimaryText: '#4a1942',
      btnPrimaryHoverBg: '#fffafc',
      btnPrimaryHoverText: '#f48fb1',

      btnSecondaryBg: '#fffafc',
      btnSecondaryText: '#f48fb1',
      btnSecondaryHoverBg: '#fff0f5',

      inputBg: '#fffafc',
      inputBorder: '#f48fb1',
      inputFocusShadow: '#f8bbd0',

      accent: '#f48fb1',
      accentLight: '#fff0f5',
      error: '#e91e63',
      warning: '#fef3c7',
      success: '#66bb6a',
    },
  },
};

export const getTheme = (themeName: ThemeName): Theme => {
  return themes[themeName] || themes.default;
};

export const themeNames = Object.keys(themes) as ThemeName[];
