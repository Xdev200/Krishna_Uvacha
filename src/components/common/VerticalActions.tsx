import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, Share2, Volume2, VolumeX } from 'lucide-react-native';
import { COLORS, SPACING, ROUNDNESS, SHADOWS, FONTS } from '../../theme/tokens';
import { AppText } from './AppText';

interface VerticalActionsProps {
  isBookmarked: boolean;
  isSpeaking: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onToggleSpeech: () => void;
}

/**
 * Vertical action bar for shloka interaction (Listen, Save, Share).
 */
export const VerticalActions: React.FC<VerticalActionsProps> = ({
  isBookmarked,
  isSpeaking,
  onToggleBookmark,
  onShare,
  onToggleSpeech,
}) => {
  return (
    <View style={styles.container}>
      
      <ActionItem
        label="SAVE"
        onPress={onToggleBookmark}
        icon={
          <Bookmark
            color={isBookmarked ? COLORS.primary : COLORS.textSecondary}
            fill={isBookmarked ? COLORS.primary : 'none'}
            size={16}
          />
        }
      />
      <ActionItem
        label="SHARE"
        onPress={onShare}
        icon={<Share2 color={COLORS.textSecondary} size={16} />}
      />

      <ActionItem
        label="LISTEN"
        onPress={onToggleSpeech}
        icon={
          isSpeaking ? (
            <Volume2 color={COLORS.surface} size={16} />
          ) : (
            <VolumeX color={COLORS.surface} size={16} />
          )
        }
        highlight
      />
    </View>
  );
};

interface ActionItemProps {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  highlight?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({ label, onPress, icon, highlight }) => (
  <View style={styles.item}>
    <TouchableOpacity
      onPress={onPress}
      style={[styles.circle, highlight && styles.circleHighlight]}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
    <AppText variant="caption" style={styles.label}>
      {label}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    paddingRight: SPACING.md,
    gap: SPACING.md, // Further reduced gap
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  item: {
    alignItems: 'center',
    gap: 2, // Minimal gap
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  circleHighlight: {
    backgroundColor: COLORS.accentOrange,
    borderColor: COLORS.accentOrange,
  },
  label: {
    fontSize: 8,
    fontFamily: FONTS.serif,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
