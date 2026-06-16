export interface AppColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  border: string;
  borderLight: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  white: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  success: string;
  warning: string;
  error: string;
  gradient: [string, string];
  accent: string;
  inputBg: string;
  tabBg: string;
  glass: string;
  glassLight: string;
  coolSlate: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
}

export const DarkColors: AppColors = {
  background: '#0a0a0a',
  surface: '#141414',
  surfaceElevated: '#1e1e1e',
  card: '#141414',
  border: '#262626',
  borderLight: '#1a1a1a',
  primary: '#E8E8E8',
  primarySoft: 'rgba(232, 232, 232, 0.1)',
  onPrimary: '#0a0a0a',
  white: '#ffffff',
  textPrimary: '#f0f0f0',
  textSecondary: '#8a8a8a',
  textMuted: '#555555',
  overlay: 'rgba(0, 0, 0, 0.7)',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#e53935',
  gradient: ['#1a1a1a', '#2a2a2a'],
  accent: '#e53935',
  inputBg: '#1e1e1e',
  tabBg: '#0a0a0a',
  glass: 'rgba(20, 20, 20, 0.92)',
  glassLight: 'rgba(255, 255, 255, 0.06)',
  coolSlate: '#8a8a8a',
  buttonPrimary: '#ffffff',
  buttonPrimaryText: '#000000',
  buttonSecondary: '#1e1e1e',
  buttonSecondaryText: '#ffffff',
};

export const LightColors: AppColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceElevated: '#f0f0f0',
  card: '#ffffff',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  primary: '#1a1a1a',
  primarySoft: 'rgba(26, 26, 26, 0.08)',
  onPrimary: '#ffffff',
  white: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#999999',
  textMuted: '#cccccc',
  overlay: 'rgba(0, 0, 0, 0.4)',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#e53935',
  gradient: ['#1a1a1a', '#333333'],
  accent: '#e53935',
  inputBg: '#f5f5f5',
  tabBg: '#f8f8f8',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassLight: 'rgba(0, 0, 0, 0.04)',
  coolSlate: '#999999',
  buttonPrimary: '#1a1a1a',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#f0f0f0',
  buttonSecondaryText: '#1a1a1a',
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  sectionSm: 48,
  section: 64,
  sectionLg: 78,
  hero: 120,
  huge: 48,
} as const;

export const FontSize = {
  micro: 10,
  xs: 11,
  sm: 12,
  caption: 13,
  captionBold: 13,
  bodySm: 13,
  bodySmMedium: 14,
  bodyMd: 15,
  bodyMdMedium: 16,
  subtitle: 16,
  heading5: 17,
  heading4: 20,
  heading3: 24,
  heading2: 28,
  heading1: 32,
  displayLg: 40,
  heroDisplay: 48,
  md: 16,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 24,
  hero: 48,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  full: 9999,
} as const;

export const Elevation = {
  flat: { shadowOpacity: 0 },
  subtle: { shadowOpacity: 0 },
  card: { shadowOpacity: 0 },
  mockup: { shadowOpacity: 0 },
  modal: { shadowOpacity: 0 },
} as const;

export const Colors = DarkColors;
