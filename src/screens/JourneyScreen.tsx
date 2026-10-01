import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Flame, Compass, Sparkles, BookOpen } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { ReadingGoalCard } from '../components/cards/ReadingGoalCard';
import { StreakCalendar } from '../components/common/StreakCalendar';
import { MilestoneBadges } from '../components/common/MilestoneBadges';
import { COLORS, SPACING, LAYOUT, ROUNDNESS, SHADOWS } from '../theme/tokens';
import { useStreak } from '../hooks/useStreak';
import { useProgress } from '../hooks/useProgress';
import { dbService, ReadingDateEntry, ReadingGoal } from '../services/dbService';

export const JourneyScreen: React.FC = () => {
  const streak = useStreak();
  const { progress } = useProgress();
  const [readingDates, setReadingDates] = useState<ReadingDateEntry[]>([]);
  const [readingGoal, setReadingGoal] = useState<ReadingGoal | null>(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [dates, goal, milestones] = await Promise.all([
          dbService.getReadingDates(),
          dbService.getReadingGoal(),
          dbService.getMilestones(),
        ]);
        setReadingDates(dates);
        setReadingGoal(goal);
        setUnlockedMilestones(milestones.map(m => m.key));
      };

      loadData();
    }, [])
  );

  const handleSetGoal = async (targetDays: number) => {
    await dbService.setReadingGoal(targetDays);
    const updatedGoal = await dbService.getReadingGoal();
    setReadingGoal(updatedGoal);
  };

  const handleClearGoal = async () => {
    await dbService.clearReadingGoal();
    setReadingGoal(null);
  };

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']}>
        <ScreenHeader title="Spiritual Journey" showStreak streakCount={streak} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          {/* 1. Sacred Streak Details Hero Banner */}
          <View style={styles.streakHeroCard}>
            <View style={styles.streakHeroLeft}>
              <View style={styles.flameIconCircle}>
                <Flame size={24} color={COLORS.primary} fill={COLORS.primary} />
              </View>
              <View style={styles.streakHeroTextCol}>
                <AppText variant="headline" style={styles.streakHeroTitle}>
                  {streak > 0 ? `${streak} Day Sadhana Streak` : 'Begin Your Streak'}
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  {streak > 0
                    ? 'Consistent reading transforms knowledge into wisdom.'
                    : 'Read at least one verse today to ignite your streak.'}
                </AppText>
              </View>
            </View>

            <View style={styles.statsMiniRow}>
              <View style={styles.miniStat}>
                <AppText variant="headline" color={COLORS.primary} style={styles.miniStatNum}>
                  {progress.versesRead}
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  Verses Read
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStat}>
                <AppText variant="headline" color={COLORS.primary} style={styles.miniStatNum}>
                  {progress.chaptersCompleted}/18
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  Chapters
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStat}>
                <AppText variant="headline" color={COLORS.primary} style={styles.miniStatNum}>
                  {progress.percentage}%
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  Mastery
                </AppText>
              </View>
            </View>
          </View>

          {/* 2. Reading Goal Card (reflects chosen goal with Edit modal) */}
          <ReadingGoalCard
            goal={readingGoal}
            versesRead={progress.versesRead}
            totalVerses={progress.totalVerses}
            onSetGoal={handleSetGoal}
            onClearGoal={handleClearGoal}
          />

          {/* 3. Spiritual Consistency Calendar (Heatmap) */}
          <StreakCalendar
            readingDates={readingDates}
            currentStreak={streak}
          />

          {/* 4. Sacred Milestones & Badges */}
          <MilestoneBadges unlockedKeys={unlockedMilestones} />
        </View>
      </ScrollView>

      <BottomTabBar active="Journey" />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.xl,
  },
  cards: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  streakHeroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.lg,
    padding: SPACING.md,
    borderWidth: 0,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  streakHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  flameIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  streakHeroTextCol: {
    flex: 1,
  },
  streakHeroTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  statsMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
});
