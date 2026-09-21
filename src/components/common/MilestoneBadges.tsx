import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  Award,
  Lock,
  Check,
  Sunrise,
  BookOpen,
  Flame,
  Mountain,
  Crown,
  Zap,
} from 'lucide-react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS, FONTS } from '../../theme/tokens';

export interface MilestoneDef {
  key: string;
  emoji: string;
  name: string;
  desc: string;
}

/**
 * 7 Curated Milestones with punchy 1-word names:
 * Dawn, Scholar, Warrior, Summit, Yogi, Master, Victor
 */
export const MILESTONES: MilestoneDef[] = [
  { key: 'first_verse', emoji: '🌅', name: 'Dawn', desc: 'Read your first sacred verse' },
  { key: 'first_chapter', emoji: '📖', name: 'Scholar', desc: 'Completed 1 full chapter' },
  { key: 'streak_7', emoji: '🔥', name: 'Warrior', desc: 'Kept a 7-day reading streak' },
  { key: 'halfway', emoji: '🏔️', name: 'Summit', desc: 'Read 350+ verses of the Gita' },
  { key: 'streak_30', emoji: '👑', name: 'Yogi', desc: 'Kept a 30-day reading streak' },
  { key: 'complete', emoji: '🏆', name: 'Master', desc: 'Completed all 701 sacred verses' },
  { key: 'goal_complete', emoji: '⚡', name: 'Victor', desc: 'Finished within your target goal' },
];

/**
 * Renders the handcrafted luxury vector emblem for each milestone
 */
export const renderMilestoneIcon = (key: string, color: string, size: number = 22) => {
  switch (key) {
    case 'first_verse':
      return <Sunrise color={color} size={size} strokeWidth={2.2} />;
    case 'first_chapter':
      return <BookOpen color={color} size={size} strokeWidth={2.2} />;
    case 'streak_7':
      return <Flame color={color} size={size} strokeWidth={2.2} fill={color} />;
    case 'halfway':
      return <Mountain color={color} size={size} strokeWidth={2.2} />;
    case 'streak_30':
      return <Crown color={color} size={size} strokeWidth={2.2} />;
    case 'complete':
      return <Award color={color} size={size} strokeWidth={2.2} />;
    case 'goal_complete':
      return <Zap color={color} size={size} strokeWidth={2.2} fill={color} />;
    default:
      return <Award color={color} size={size} strokeWidth={2.2} />;
  }
};

interface MilestoneBadgesProps {
  unlockedKeys: string[];
}

export const MilestoneBadges: React.FC<MilestoneBadgesProps> = ({ unlockedKeys }) => {
  const unlockedSet = new Set(unlockedKeys);

  const handleBadgePress = (milestone: MilestoneDef) => {
    const isUnlocked = unlockedSet.has(milestone.key);
    Alert.alert(
      `${milestone.name} Milestone`,
      `${milestone.desc}\n\nStatus: ${isUnlocked ? '✅ Unlocked' : '🔒 Locked — keep reading to unlock!'}`,
      [{ text: 'Close' }]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Award size={18} color={COLORS.primary} />
          <AppText variant="headline" style={styles.title}>
            Milestones & Badges
          </AppText>
        </View>
        <AppText variant="caption" color={COLORS.primary} style={styles.counter}>
          {unlockedSet.size} of {MILESTONES.length} Unlocked
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MILESTONES.map(milestone => {
          const isUnlocked = unlockedSet.has(milestone.key);
          const iconColor = isUnlocked ? COLORS.primary : '#A39182';

          return (
            <TouchableOpacity
              key={milestone.key}
              style={styles.badgeItem}
              onPress={() => handleBadgePress(milestone)}
              activeOpacity={0.75}
            >
              {/* Premium Multi-Layer Medallion */}
              <View
                style={[
                  styles.medallionOuter,
                  isUnlocked ? styles.medallionUnlocked : styles.medallionLocked,
                ]}
              >
                <View
                  style={[
                    styles.medallionInner,
                    isUnlocked ? styles.innerUnlocked : styles.innerLocked,
                  ]}
                >
                  {renderMilestoneIcon(milestone.key, iconColor, 22)}
                </View>

                {/* Status indicator pin */}
                <View
                  style={[
                    styles.pin,
                    isUnlocked ? styles.pinUnlocked : styles.pinLocked,
                  ]}
                >
                  {isUnlocked ? (
                    <Check size={8} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Lock size={7} color="#FFFFFF" strokeWidth={2.8} />
                  )}
                </View>
              </View>

              {/* One-word, fully visible and readable title */}
              <AppText
                variant="caption"
                color={isUnlocked ? COLORS.text : COLORS.textMuted}
                numberOfLines={1}
                style={styles.badgeName}
              >
                {milestone.name}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.lg,
    padding: SPACING.md,
    borderWidth: 0,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 15,
  },
  counter: {
    fontWeight: '700',
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  badgeItem: {
    alignItems: 'center',
    width: 72,
  },
  medallionOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  medallionUnlocked: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#D4AF37', // Gleaming gold outer ring
    shadowColor: '#C9975A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  medallionLocked: {
    backgroundColor: '#F5EFE7',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  medallionInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerUnlocked: {
    backgroundColor: 'rgba(201, 151, 90, 0.12)',
  },
  innerLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  pin: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  pinUnlocked: {
    backgroundColor: '#059669',
  },
  pinLocked: {
    backgroundColor: '#8C7A6B',
  },
  badgeName: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: FONTS.sansBold,
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
