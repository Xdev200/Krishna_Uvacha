import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GradientView } from './GradientView';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';

interface VerseHeroCardProps {
  sanskrit: string;
  transliteration?: string;
  chapter: number;
  verse: number;
}

const shouldAddCoupletBreak = (lines: string[], index: number): boolean => {
  if (lines[index].includes('उवाच')) return true;
  const hasSpeakerLine = lines[0].includes('उवाच');
  return hasSpeakerLine ? index > 0 && index % 2 === 0 : index % 2 === 1;
};

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
            const isLast = index === lines.length - 1;
            const addBreak = shouldAddCoupletBreak(lines, index);
            return (
              <AppText
                key={index}
                variant="shloka"
                color={COLORS.sanskrit}
                centered
                style={addBreak && !isLast ? styles.coupletBreak : undefined}
              >
                {line}
              </AppText>
            );
          })}
        </View>

        {/* {transliteration ? (
          <AppText variant="label" color={COLORS.textSecondary} centered style={styles.transliteration}>
            {transliteration}
          </AppText>
        ) : null} */}

        <View style={styles.pill}>
          <AppText variant="caption" color={COLORS.textMuted}>
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
  sanskritContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  coupletBreak: {
    marginBottom: SPACING.md,
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
});
