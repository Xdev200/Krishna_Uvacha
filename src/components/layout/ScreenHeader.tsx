import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../common/AppText';
import { StreakBadge } from '../common/StreakBadge';
import { COLORS, SPACING, SHADOWS } from '../../theme/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Show the streak badge on the right side */
  showStreak?: boolean;
  streakCount?: number;
  /** Custom right-side content; overrides showStreak */
  right?: ReactNode;
  /** Custom left-side content; overrides title */
  left?: ReactNode;
  /** Callback for back button; if provided, shows a back arrow */
  onBack?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showStreak = false,
  streakCount = 7,
  right,
  left,
  onBack,
}) => (
  <View style={[styles.row, styles.depth]}>
    <View style={styles.leftSection}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft color={COLORS.primary} size={28} />
        </TouchableOpacity>
      )}
      {left ?? (
        <View style={styles.titleContainer}>
          <AppText variant="headline" color={COLORS.primary} style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color={COLORS.textMuted} style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      )}
    </View>
    {right ?? (showStreak ? <StreakBadge count={streakCount} /> : null)}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  depth: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    ...SHADOWS.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.2,
    fontSize: 22, // Slightly more compact for better fit
  },
  subtitle: {
    marginTop: -2,
  },
});
