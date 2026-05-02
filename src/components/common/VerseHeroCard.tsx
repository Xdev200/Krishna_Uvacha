import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { GradientView } from './GradientView';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS, FONTS, SHADOWS } from '../../theme/tokens';

interface VerseHeroCardProps {
  sanskrit: string;
  transliteration?: string;
  chapter: number;
  verse: number;
}

export const VerseHeroCard: React.FC<VerseHeroCardProps> = ({
  sanskrit,
  transliteration,
  chapter,
  verse,
}) => {
  const lines = sanskrit.split('\n').filter(l => l.trim().length > 0);
  
  return (
    <View style={styles.container}>
      <GradientView 
        style={styles.card} 
        startColor="#FFF9F0" 
        endColor="#E8F5F1"
        direction="vertical"
      >
        <View style={styles.sanskritContainer}>
          {lines.map((line, index) => {
            const isSpeaker = line.includes('उवाच');
            const isLast = index === lines.length - 1;
            const hasSpeaker = lines[0].includes('उवाच');
            
            // Add margin if it's a speaker line or the end of a couplet
            const hasExtraMargin = isSpeaker || (hasSpeaker ? (index > 0 && index % 2 === 0) : index % 2 === 1);

            return (
              <AppText 
                key={index} 
                variant="shloka" 
                color={COLORS.sanskrit} 
                centered 
                style={[
                  styles.sanskritLine,
                  hasExtraMargin && !isLast && { marginBottom: SPACING.md }
                ]}
              >
                {line}
              </AppText>
            );
          })}
        </View>

        {transliteration ? (
          <AppText variant="label" color={COLORS.textSecondary} centered style={styles.transliteration}>
            {transliteration}
          </AppText>
        ) : null}

        <View style={styles.pill}>
          <AppText variant="caption" color={COLORS.textMuted} style={styles.pillText}>
            Chapter {chapter} | Verse {verse}
          </AppText>
        </View>
      </GradientView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  card: {
    borderRadius: ROUNDNESS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -120 }],
    zIndex: -1,
  },
  sanskritContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sanskritLine: {
    // Basic styles handled by 'shloka' variant in AppText
  },
  transliteration: {
    fontStyle: 'italic',
    maxWidth: '90%',
  },
  pill: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: ROUNDNESS.full,
    ...SHADOWS.sm,
  },
  pillText: {
    // Basic styles handled by 'caption' variant in AppText
  },
});
