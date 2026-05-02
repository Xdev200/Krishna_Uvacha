export const COLORS = {
  // Brand Colors
  primary: '#FF9933', // Saffron
  secondary: '#FDF6EC', // Parchment
  tertiary: '#7A4D1F', // Muted Earth
  
  // Functional Colors
  background: '#FCF9F8',
  surface: '#FFFFFF',
  surfaceVariant: '#F5EFE7',
  
  // Semantic Colors
  sanskrit: '#8B4513', // Deep Earth Brown for Shloks
  accent: '#C9975A', // Amber Gold
  success: '#2D6A4F',
  error: '#BA1A1A',
  
  // Text Colors
  text: '#1A1A1A', // Charcoal Brown
  textSecondary: '#5C3D2E', // Medium warm brown
  textMuted: '#554336',
  textOnPrimary: '#FFFFFF',
  
  // Border & Dividers
  outline: '#887364',
  outlineVariant: '#DBC2B0',
  
  // Gradients
  gradientWarm: '#C9975A',
  gradientCool: '#5E9E8A',
};

export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const LAYOUT = {
  screenPadding: SPACING.md,
  cardPadding: SPACING.lg,
  itemGap: SPACING.md,
  headerHeight: 60,
  tabBarHeight: 80,
};

export const ROUNDNESS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FONTS = {
  serif: 'NotoSerif_700Bold',
  secondary: 'Newsreader_400Regular',
  secondaryItalic: 'Newsreader_400Regular_Italic',
  sans: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};


export const TYPOGRAPHY = {
  display: {
    fontFamily: FONTS.serif,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  headline: {
    fontFamily: FONTS.serif,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  shloka: {
    fontFamily: FONTS.serif,
    fontSize: 16, // Optimized for couplets as per user request
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: FONTS.secondary,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: FONTS.secondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
};

