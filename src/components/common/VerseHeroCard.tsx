import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS } from '../../theme/tokens';

interface VerseHeroCardProps {
  sanskrit: string;
  transliteration?: string;
  chapter: number;
  verse: number;
  isActive?: boolean;
  isPaused?: boolean;
  onSanskritComplete?: () => void;
}

interface ParsedCouplet {
  speaker?: string;
  line1: string;
  line2: string;
}

/**
 * Parses raw Sanskrit into an optional speaker heading and couplet lines.
 */
const parseSanskritToCouplet = (raw: string): ParsedCouplet => {
  const rawLines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let speaker: string | undefined;
  const contentLines: string[] = [];

  for (const line of rawLines) {
    if (line.includes('उवाच')) {
      speaker = line;
    } else {
      contentLines.push(line);
    }
  }

  let line1 = '';
  let line2 = '';

  if (contentLines.length === 0) {
    line1 = raw;
  } else if (contentLines.length === 1) {
    line1 = contentLines[0];
  } else if (contentLines.length === 2) {
    line1 = contentLines[0];
    line2 = contentLines[1];
  } else if (contentLines.length === 4) {
    line1 = `${contentLines[0]} ${contentLines[1]}`;
    line2 = `${contentLines[2]} ${contentLines[3]}`;
  } else {
    const mid = Math.ceil(contentLines.length / 2);
    line1 = contentLines.slice(0, mid).join(' ');
    line2 = contentLines.slice(mid).join(' ');
  }

  return { speaker, line1, line2 };
};

export const VerseHeroCard: React.FC<VerseHeroCardProps> = ({
  sanskrit,
  chapter,
  verse,
  isActive = true,
  isPaused = false,
  onSanskritComplete,
}) => {
  const { speaker, line1, line2 } = parseSanskritToCouplet(sanskrit);

  useEffect(() => {
    if (isActive && onSanskritComplete) {
      onSanskritComplete();
    }
  }, [isActive, sanskrit, onSanskritComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {speaker && (
          <View style={styles.speakerPill}>
            <AppText variant="caption" color={COLORS.primary} style={styles.speakerText}>
              {speaker}
            </AppText>
          </View>
        )}

        <View style={styles.sanskritContainer}>
          <AppText
            variant="shloka"
            color={COLORS.sanskrit}
            centered
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.coupletLine}
          >
            {line1}
          </AppText>

          {line2 ? (
            <AppText
              variant="shloka"
              color={COLORS.sanskrit}
              centered
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={styles.coupletLine}
            >
              {line2}
            </AppText>
          ) : null}
        </View>

        <View style={styles.pill}>
          <AppText variant="caption" color={COLORS.textSecondary} style={styles.pillText}>
            Chapter {chapter} | Verse {verse}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    width: '100%',
  },
  card: {
    borderRadius: ROUNDNESS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl + 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  speakerPill: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: ROUNDNESS.full,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  speakerText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  sanskritContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  coupletLine: {
    width: '100%',
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontSize: 21,
    lineHeight: 32,
  },
  pill: {
    position: 'absolute',
    bottom: SPACING.xs,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: ROUNDNESS.full,
    borderWidth: 1,
    borderColor: 'rgba(201, 151, 90, 0.2)',
  },
  pillText: {
    fontWeight: '600',
  },
});
