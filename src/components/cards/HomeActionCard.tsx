import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { AppText } from '../common/AppText';
import { CardAccent } from '../common/CardAccent';
import { GradientView } from '../common/GradientView';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';

interface HomeActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
  headerImage?: any;
  gradient?: boolean;
  decorativeText?: string;
  style?: ViewStyle;
}

export const HomeActionCard: React.FC<HomeActionCardProps> = ({
  title,
  description,
  icon,
  onPress,
  headerImage,
  gradient = false,
  decorativeText,
  style,
}) => {
  const inner = (
    <View style={styles.inner}>
      {decorativeText ? (
        <AppText
          variant="shloka"
          style={[styles.watermark, { color: gradient ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)' }]}
          numberOfLines={4}
        >
          {decorativeText}
        </AppText>
      ) : null}

      <View style={styles.titleRow}>
        <View style={styles.iconTile}>{icon}</View>
        <AppText variant="headline" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      </View>

      <AppText variant="body" color={COLORS.textSecondary} style={styles.description}>
        {description}
      </AppText>

     
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.base, !gradient && styles.flatCard, style]}
      activeOpacity={0.9}
    >
      {gradient ? (
        <GradientView style={styles.gradientWrapper}>{inner}</GradientView>
      ) : (
        <>
          {headerImage && (
            <Image source={headerImage} style={styles.headerImage} resizeMode="cover" />
          )}
          {inner}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: ROUNDNESS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  flatCard: {
    backgroundColor: COLORS.surface,
  },
  gradientWrapper: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 160,
  },
  inner: {
    padding: SPACING.md,
    minHeight: 120,
    justifyContent: 'center',
  },
  watermark: {
    position: 'absolute',
    top: 30,
    left: SPACING.md,
    right: SPACING.md,
    fontSize: 16,
    lineHeight: 24,
    zIndex: 0,
    opacity: 0.8,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    zIndex: 1,
  },
  iconTile: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDNESS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  title: {
    flex: 1,
  },
  description: {
    zIndex: 1,
    opacity: 0.9,
  },
});
