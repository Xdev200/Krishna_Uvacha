import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { Verse } from '../../services/gitaService';

interface VerseListItemProps {
  verse: Verse;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const VerseListItem: React.FC<VerseListItemProps> = ({
  verse,
  onPress,
  onLongPress,
  isSelectable = false,
  isSelected = false,
  onSelect,
}) => {
  const handlePress = () => {
    if (isSelectable) {
      if (onSelect) onSelect();
      else onPress();
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
    >
      <View style={styles.row}>
        {isSelectable && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
          </View>
        )}

        <View style={styles.content}>
          <AppText variant="label" color={COLORS.tertiary}>
            CH {verse.chapter} • VERSE {verse.verse}
          </AppText>
          <AppText variant="body" numberOfLines={2} style={styles.preview}>
            {verse.english_translation}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDNESS.lg,
    marginBottom: SPACING.md,
    borderWidth: 0,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  containerSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(217, 119, 6, 0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  preview: {
    marginTop: SPACING.xs,
  },
});
