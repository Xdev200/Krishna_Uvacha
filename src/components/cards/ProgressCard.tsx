import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Play, BookOpen, Flame, BarChart3 } from 'lucide-react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS, FONTS } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressCardProps {
  chaptersCompleted: number;
  versesRead: number;
  totalVerses: number;
  percentage: number;
  currentChapter: number;
  currentVerse: number;
  streakCount: number;
  isComplete: boolean;
  onResume: () => void;
}

const RING_SIZE = 100;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const ProgressCard: React.FC<ProgressCardProps> = ({
  chaptersCompleted,
  versesRead,
  totalVerses,
  percentage,
  currentChapter,
  currentVerse,
  streakCount,
  isComplete,
  onResume,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(percentage / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  return (
    <View style={styles.card}>
      {/* Top section: Ring + Stats */}
      <View style={styles.topSection}>
        {/* Circular Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={COLORS.outlineVariant}
              strokeWidth={RING_STROKE}
              fill="none"
              opacity={0.3}
            />
            {/* Progress arc */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={COLORS.primary}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              animatedProps={animatedProps}
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.ringLabel}>
            <AppText style={styles.ringPercentage}>{percentage}%</AppText>
            <AppText style={styles.ringSubtitle}>complete</AppText>
          </View>
        </View>

        {/* Stats Column */}
        <View style={styles.statsColumn}>
          <StatRow
            icon={<BookOpen color={COLORS.primary} size={16} />}
            label="Chapters"
            value={`${chaptersCompleted} / 18`}
          />
          <StatRow
            icon={<BarChart3 color={COLORS.secondary} size={16} />}
            label="Verses Read"
            value={`${versesRead} / ${totalVerses}`}
          />
          <StatRow
            icon={<Flame color={COLORS.accentOrange} size={16} fill={COLORS.accentOrange} />}
            label="Day Streak"
            value={`${streakCount}`}
          />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Resume CTA */}
      <TouchableOpacity style={styles.ctaButton} onPress={onResume} activeOpacity={0.85}>
        <View style={styles.ctaContent}>
          <View style={styles.ctaTextContainer}>
            <AppText style={styles.ctaTitle}>
              {isComplete ? 'Start Again' : 'Continue Reading'}
            </AppText>
            <AppText style={styles.ctaSubtitle}>
              {isComplete
                ? 'You have completed the entire Bhagavad Gita 🙏'
                : `Chapter ${currentChapter} • Verse ${currentVerse}`}
            </AppText>
          </View>
          <View style={styles.playIcon}>
            <Play color={COLORS.surface} size={18} fill={COLORS.surface} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// ─── Sub-components ────────────────────────────────────────────

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value }) => (
  <View style={styles.statRow}>
    <View style={styles.statIcon}>{icon}</View>
    <View style={styles.statText}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  </View>
);

// ─── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  // ── Ring ──
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringPercentage: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    color: COLORS.primary,
    lineHeight: 26,
  },
  ringSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // ── Stats ──
  statsColumn: {
    flex: 1,
    gap: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
  },
  statLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.md,
    opacity: 0.5,
  },
  // ── CTA ──
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDNESS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.sm,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.surface,
    lineHeight: 20,
  },
  ctaSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
    marginTop: 2,
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
});
