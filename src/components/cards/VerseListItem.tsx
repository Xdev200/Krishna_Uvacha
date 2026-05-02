import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS } from '../../theme/tokens';
import { Verse } from '../../services/gitaService';

interface VerseListItemProps {
  verse: Verse;
  onPress: () => void;
}

export const VerseListItem: React.FC<VerseListItemProps> = ({ verse, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    <AppText variant="label" color={COLORS.tertiary}>
      CH {verse.chapter} • VERSE {verse.verse}
    </AppText>
    <AppText variant="body" numberOfLines={2} style={styles.preview}>
      {verse.english_translation}
    </AppText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDNESS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  preview: {
    marginTop: SPACING.xs,
  },
});
