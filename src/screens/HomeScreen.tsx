import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppText } from '../components/common/AppText';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { HomeActionCard } from '../components/cards/HomeActionCard';
import { ProgressCard } from '../components/cards/ProgressCard';
import { DailyReminderModal } from '../components/common/DailyReminderModal';
import { MILESTONES, renderMilestoneIcon } from '../components/common/MilestoneBadges';
import { Sparkles, BookOpen, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, LAYOUT, ROUNDNESS, SHADOWS, FONTS } from '../theme/tokens';
import { useStreak } from '../hooks/useStreak';
import { useProgress } from '../hooks/useProgress';
import { dbService } from '../services/dbService';
import { notificationService } from '../services/notificationService';
import { AppNavigation } from '../types/navigation';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigation>();
  const streak = useStreak();
  const { progress } = useProgress();
  const [unlockedMilestones, setUnlockedMilestones] = useState<string[]>([]);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const checkedReminderOnVisitRef = useRef(false);

  // Check reminder eligibility on visit (max 2 times per session) and load milestones
  useFocusEffect(
    useCallback(() => {
      const checkAndLoad = async () => {
        // Load milestones
        try {
          const milestones = await dbService.getMilestones();
          setUnlockedMilestones(milestones.map(m => m.key));
        } catch {}

        if (checkedReminderOnVisitRef.current) return;
        const allowed = await dbService.isReminderAllowed();
        const stats = await dbService.getProgressStats();
        if (!allowed && stats.versesRead >= 1 && notificationService.canPromptReminderInSession()) {
          checkedReminderOnVisitRef.current = true;
          notificationService.recordReminderPromptShown();
          setTimeout(() => {
            setReminderModalVisible(true);
          }, 800);
        }
      };

      checkAndLoad();
    }, [])
  );

  const handleResume = () => {
    if (progress.nextVerseId) {
      navigation.navigate('Reader', { verseId: progress.nextVerseId });
    } else {
      navigation.navigate('Reader', { verseId: '1.1' });
    }
  };

  const handleBrowse = () => navigation.navigate('Chapters');

  const handleOpenJourney = () => {
    navigation.navigate('Journey');
  };

  const chaptersImage = require('../../assets/browse_chapters.png');

  // Milestone progression resolution
  // Sequence: Dawn (1) -> Scholar (47) -> Summit (350) -> Master (701)
  const unlockedSet = new Set(unlockedMilestones);
  let currentBadge = null;
  let upcomingBadge = null;
  let neededVerses = 0;

  if (!unlockedSet.has('first_verse') && progress.versesRead < 1) {
    currentBadge = null;
    upcomingBadge = MILESTONES.find(m => m.key === 'first_verse') || null;
    neededVerses = Math.max(1, 1 - progress.versesRead);
  } else if (!unlockedSet.has('first_chapter') && progress.versesRead < 47) {
    currentBadge = MILESTONES.find(m => m.key === 'first_verse') || null;
    upcomingBadge = MILESTONES.find(m => m.key === 'first_chapter') || null;
    neededVerses = Math.max(1, 47 - progress.versesRead);
  } else if (!unlockedSet.has('halfway') && progress.versesRead < 350) {
    currentBadge = MILESTONES.find(m => m.key === 'first_chapter') || null;
    upcomingBadge = MILESTONES.find(m => m.key === 'halfway') || null;
    neededVerses = Math.max(1, 350 - progress.versesRead);
  } else if (!unlockedSet.has('complete') && progress.versesRead < 701) {
    currentBadge = MILESTONES.find(m => m.key === 'halfway') || null;
    upcomingBadge = MILESTONES.find(m => m.key === 'complete') || null;
    neededVerses = Math.max(1, 701 - progress.versesRead);
  } else {
    currentBadge = MILESTONES.find(m => m.key === 'complete') || null;
    upcomingBadge = null;
    neededVerses = 0;
  }

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']}>
        <ScreenHeader title="Geeta Saar" showStreak streakCount={streak} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          {/* 1. Reading Progress Hero Card */}
          <ProgressCard
            chaptersCompleted={progress.chaptersCompleted}
            versesRead={progress.versesRead}
            totalVerses={progress.totalVerses}
            percentage={progress.percentage}
            currentChapter={progress.currentChapter}
            currentVerse={progress.currentVerse}
            streakCount={streak}
            isComplete={progress.isComplete}
            onResume={handleResume}
          />

          {/* 2. Spiritual Journey Sleek Card */}
          <TouchableOpacity
            style={styles.journeyCard}
            onPress={handleOpenJourney}
            activeOpacity={0.85}
          >
            {/* Card Header Title */}
            <View style={styles.journeyHeader}>
              <AppText variant="headline" style={styles.journeyTitle}>
                Spiritual Journey
              </AppText>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </View>

            {/* Badges and Centered Verse Count Row */}
            <View style={styles.journeyContentRow}>
              {/* Current Milestone Badge */}
              <View style={styles.badgePillActive}>
                <View style={styles.badgeMedallionActive}>
                  {currentBadge ? (
                    renderMilestoneIcon(currentBadge.key, COLORS.primary, 14)
                  ) : (
                    <Sparkles color={COLORS.primary} size={14} />
                  )}
                </View>
                <AppText variant="caption" style={styles.badgeNameActive}>
                  {currentBadge ? currentBadge.name : 'Beginning'}
                </AppText>
              </View>

              {/* Horizontal Center: Verse count overlapping the arrow */}
              {upcomingBadge ? (
                <View style={styles.centerTrack}>
                  {/* Arrow track aligned to center of milestone badges */}
                  <View style={styles.trackConnector} pointerEvents="none">
                    <View style={styles.trackLine} />
                    <ChevronRight size={14} color={COLORS.primary} strokeWidth={2.5} style={styles.trackArrow} />
                  </View>

                  {/* Centered text overlapping the arrow */}
                  <View style={styles.verseTextOverlay}>
                    <AppText style={styles.versesCountText}>
                      {neededVerses} {neededVerses === 1 ? 'verse' : 'verses'}
                    </AppText>
                  </View>
                </View>
              ) : (
                <View style={styles.centerTrack}>
                  <View style={styles.trackConnector} pointerEvents="none">
                    <View style={styles.trackLine} />
                  </View>
                  <View style={styles.verseTextOverlay}>
                    <AppText style={styles.versesCountText}>Completed 🙏</AppText>
                  </View>
                </View>
              )}

              {/* Upcoming Milestone Badge */}
              {upcomingBadge ? (
                <View style={styles.badgePillUpcoming}>
                  <View style={styles.badgeMedallionUpcoming}>
                    {renderMilestoneIcon(upcomingBadge.key, '#8C7A6B', 14)}
                  </View>
                  <AppText variant="caption" style={styles.badgeNameUpcoming}>
                    {upcomingBadge.name}
                  </AppText>
                </View>
              ) : (
                <View style={styles.badgePillActive}>
                  <View style={styles.badgeMedallionActive}>
                    {renderMilestoneIcon('complete', COLORS.primary, 14)}
                  </View>
                  <AppText variant="caption" style={styles.badgeNameActive}>
                    Master
                  </AppText>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* 3. Browse Chapters Card */}
          <HomeActionCard
            title="Browse Chapters"
            description="Read the Gita verse by verse through all 18 chapters of divine conversation."
            icon={<BookOpen color={COLORS.surface} size={22} />}
            headerImage={chaptersImage}
            onPress={handleBrowse}
          />
        </View>
      </ScrollView>

      {/* Smart Daily Reminder Modal */}
      <DailyReminderModal
        visible={reminderModalVisible}
        onDismiss={() => setReminderModalVisible(false)}
        nextVerseId={progress.nextVerseId || '1.1'}
      />

      <BottomTabBar active="Home" />
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
  journeyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md + 2,
    borderWidth: 0,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
  journeyTitle: {
    fontSize: 16,
    fontFamily: FONTS.serif,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  journeyContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ROUNDNESS.full,
    ...SHADOWS.sm,
  },
  badgeMedallionActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(201, 151, 90, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNameActive: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  badgePillUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDFCFA',
    borderWidth: 1.2,
    borderColor: 'rgba(201, 151, 90, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ROUNDNESS.full,
  },
  badgeMedallionUpcoming: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(140, 122, 107, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNameUpcoming: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  centerTrack: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
    position: 'relative',
  },
  trackConnector: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(201, 151, 90, 0.4)',
    borderRadius: 1,
  },
  trackArrow: {
    marginLeft: -4,
  },
  verseTextOverlay: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDNESS.sm,
    zIndex: 2,
  },
  versesCountText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
