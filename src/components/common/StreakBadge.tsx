import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS } from '../../theme/tokens';
import { Flame } from 'lucide-react-native';

interface StreakBadgeProps {
  count?: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ count = 7 }) => (
  <View style={styles.container}>
    <AppText variant="label" color={COLORS.primary} style={styles.text}>
      {count}
    </AppText>
    <Flame color={COLORS.primary} size={14} fill={COLORS.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: ROUNDNESS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  text: {
    // Handled by variant in AppText
  },
});
