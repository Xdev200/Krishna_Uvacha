import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { ChevronRight } from 'lucide-react-native';

interface ChapterCardProps {
  number: number;
  onPress: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ number, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.numberCircle}>
        <AppText variant="label" color={COLORS.surface}>
          {number}
        </AppText>
      </View>
      <View style={styles.content}>
        <AppText variant="headline" style={styles.title}>
          Chapter {number}
        </AppText>
        <AppText variant="label" color={COLORS.textMuted}>
          Explore wisdom and divine teachings
        </AppText>
      </View>
      <ChevronRight color={COLORS.outline} size={20} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDNESS.lg,
    marginBottom: SPACING.md,
    borderWidth: 0,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    // Handled by 'headline' variant
  },
});
