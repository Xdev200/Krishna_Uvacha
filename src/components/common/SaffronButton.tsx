import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS } from '../../theme/tokens';

interface SaffronButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

/**
 * A themed button component following the Saffron design tokens.
 */
export const SaffronButton: React.FC<SaffronButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = styles.base;
    const variantStyle: ViewStyle = styles[variant];
    const sizeStyle: ViewStyle = styles[size];
    
    return [baseStyle, variantStyle, sizeStyle, style, disabled && styles.disabled];
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    if (variant === 'primary') return COLORS.surface;
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <ActivityIndicator color={getTextColor()} style={{ marginRight: 8 }} />}
          <AppText
            variant="label"
            color={getTextColor()}
            style={[styles.text, textStyle]}
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ROUNDNESS.full,
  },
  primary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  md: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  lg: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  disabled: {
    backgroundColor: COLORS.outlineVariant,
    borderColor: COLORS.outlineVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
