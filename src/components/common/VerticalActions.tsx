import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, Share2, Volume2, VolumeX, ChevronsDown } from 'lucide-react-native';
import { COLORS, SPACING, ROUNDNESS, SHADOWS, FONTS } from '../../theme/tokens';
import { AppText } from './AppText';

interface VerticalActionsProps {
  isBookmarked: boolean;
  isSpeaking: boolean;
  isAutoScroll?: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onToggleSpeech: () => void;
  onToggleAutoScroll?: () => void;
}

/**
 * Vertical action bar for shloka interaction (Auto-scroll with ChevronsDown, Listen, Save, Share).
 */
export const VerticalActions: React.FC<VerticalActionsProps> = ({
  isBookmarked,
  isSpeaking,
  isAutoScroll = true,
  onToggleBookmark,
  onShare,
  onToggleSpeech,
  onToggleAutoScroll,
}) => {
  return (
    <View style={styles.container}>
      {onToggleAutoScroll && (
        <ActionItem
          label={isAutoScroll ? 'AUTO' : 'OFF'}
          onPress={onToggleAutoScroll}
          icon={
            <View style={[styles.autoIconWrapper, !isAutoScroll && styles.autoIconDisabled]}>
              <ChevronsDown
                color={isAutoScroll ? COLORS.primary : COLORS.textMuted}
                size={20}
                strokeWidth={2.8}
              />
            </View>
          }
          activeBorder={isAutoScroll}
          disabledStyle={!isAutoScroll}
        />
      )}

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
  activeBorder?: boolean;
  disabledStyle?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  label,
  onPress,
  icon,
  highlight,
  activeBorder,
  disabledStyle,
}) => (
  <View style={styles.item}>
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.circle,
        highlight && styles.circleHighlight,
        activeBorder && styles.circleActiveBorder,
        disabledStyle && styles.circleDisabled,
      ]}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
    <AppText
      variant="caption"
      style={[
        styles.label,
        activeBorder && styles.labelActive,
        disabledStyle && styles.labelDisabled,
      ]}
    >
      {label}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  circleHighlight: {
    backgroundColor: COLORS.accentOrange,
    borderColor: COLORS.accentOrange,
  },
  circleActiveBorder: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  circleDisabled: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  autoIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoIconDisabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 8,
    fontFamily: FONTS.serif,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  labelDisabled: {
    color: COLORS.textMuted,
    opacity: 0.6,
  },
});
