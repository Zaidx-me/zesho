export const DarkColors = {
  background: '#000000',
  surface: '#121212',
  surfaceElevated: '#1C1C1E',
  card: '#1C1C1E',
  primary: '#ff6b6b',
  primarySoft: 'rgba(255, 107, 107, 0.15)',
  white: '#FFFFFF',
  textPrimary: '#F2F2F2',
  textSecondary: '#8E8E93',
  textMuted: '#A1A1AA',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  glass: 'rgba(28, 28, 30, 0.8)',
  glassLight: 'rgba(255, 255, 255, 0.08)',
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF453A',
  gradient: ['#ff6b6b', '#ee5a24'],
} as const;

export const LightColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#ff6b6b',
  primarySoft: 'rgba(255, 107, 107, 0.12)',
  white: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textMuted: '#AEAEB2',
  border: 'rgba(0, 0, 0, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassLight: 'rgba(0, 0, 0, 0.05)',
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF453A',
  gradient: ['#ff6b6b', '#ee5a24'],
} as const;

export type AppColors = typeof DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 34,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// Default export for backward compatibility (dark)
export const Colors = DarkColors;
