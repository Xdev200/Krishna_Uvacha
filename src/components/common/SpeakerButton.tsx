import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Volume2, Square } from 'lucide-react-native';
import { COLORS, ROUNDNESS } from '../../theme/tokens';

interface SpeakerButtonProps {
  isSpeaking: boolean;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

/**
 * A themed speaker button for TTS control.
 */
export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  isSpeaking,
  onPress,
  size = 24,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      {isSpeaking ? (
        <Square color={COLORS.primary} size={size} fill={COLORS.primary} />
      ) : (
        <Volume2 color={COLORS.primary} size={size} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: ROUNDNESS.full,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
