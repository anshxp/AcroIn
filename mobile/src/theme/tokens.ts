// ─── AcroIn Mobile Design Tokens ─────────────────────────────────────
// Brand-consistent with web frontend (navy/blue palette)

export const colors = {
  // Brand
  primary: '#1e3a5f',
  primaryDark: '#0f2744',
  primaryLight: '#345f8c',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentDark: '#2563eb',

  // Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  card: '#ffffff',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#4b5563',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',

  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderFocus: '#3b82f6',

  // Input
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  inputPlaceholder: '#9ca3af',

  // Status
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fef2f2',
  errorBorder: '#fecaca',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Links
  link: '#3b82f6',
  linkPressed: '#2563eb',

  // Tab bar
  tabActive: '#0B5ED7',
  tabInactive: '#9CA3AF',

  // Gradients
  gradientStart: '#0f2744',
  gradientMid: '#1e3a5f',
  gradientEnd: '#345f8c',

  // Semantic
  verified: '#16a34a',
  unverified: '#f59e0b',
  badge: {
    student: '#dbeafe',
    studentText: '#1e40af',
    faculty: '#fce7f3',
    facultyText: '#be185d',
    admin: '#fef3c7',
    adminText: '#92400e',
  },

  // Extended palette
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 26,
    hero: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;
export default theme;
