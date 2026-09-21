import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flower, Target, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../theme/tokens';
import { dbService } from '../services/dbService';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const GOAL_OPTIONS = [
  { days: 30, label: '30 Days', pace: '~24 verses / day', desc: 'Intense Devotion • Immersive daily wisdom' },
  { days: 60, label: '60 Days', pace: '~12 verses / day', desc: 'Dedicated Path • Steady spiritual discipline' },
  { days: 90, label: '90 Days', pace: '~8 verses / day', desc: 'Balanced Journey • Recommended for mindful study', recommended: true },
  { days: 180, label: '180 Days', pace: '~4 verses / day', desc: 'Gentle Flow • A few minutes of peace each day' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [selectedDays, setSelectedDays] = useState<number>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dbService.setReadingGoal(selectedDays);
      await dbService.setOnboardingCompleted(true);
      onComplete();
    } catch (e) {
      console.error('Failed to set onboarding goal', e);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Sacred Header Banner */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Flower color={COLORS.primary} size={36} strokeWidth={1.5} />
          </View>
          <AppText variant="display" color={COLORS.primary} centered style={styles.title}>
            Krishna Uvacha
          </AppText>
          <AppText variant="caption" color={COLORS.tertiary} centered style={styles.tagline}>
            SACRED CLARITY • BHAGAVAD GITA
          </AppText>
        </View>

        {/* Goal Selection Prompt */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Target size={20} color={COLORS.primary} />
            <AppText variant="headline" color={COLORS.text}>
              Set Your Reading Goal
            </AppText>
          </View>
          <AppText variant="body" color={COLORS.textSecondary} style={styles.sectionDesc}>
            Choose your pace to complete all 701 sacred verses of the Bhagavad Gita:
          </AppText>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {GOAL_OPTIONS.map(option => {
            const isSelected = selectedDays === option.days;
            return (
              <TouchableOpacity
                key={option.days}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedDays(option.days)}
                activeOpacity={0.8}
              >
                {option.recommended && (
                  <View style={styles.recommendedBadge}>
                    <AppText variant="caption" color={COLORS.surface} style={styles.recommendedText}>
                      RECOMMENDED
                    </AppText>
                  </View>
                )}

                <View style={styles.optionMainRow}>
                  <View style={styles.optionLeft}>
                    <View style={styles.labelRow}>
                      <AppText
                        variant="headline"
                        color={isSelected ? COLORS.primary : COLORS.text}
                        style={styles.optionLabel}
                      >
                        {option.label}
                      </AppText>
                      <AppText variant="caption" color={COLORS.primary} style={styles.paceBadge}>
                        {option.pace}
                      </AppText>
                    </View>
                    <AppText variant="bodySmall" color={COLORS.textSecondary} style={styles.descText}>
                      {option.desc}
                    </AppText>
                  </View>

                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <CheckCircle2 size={20} color={COLORS.primary} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText variant="caption" color={COLORS.textMuted} centered style={styles.footerNote}>
          You can adjust your reading goal anytime in the Journey tab.
        </AppText>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startBtn, isSubmitting && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <AppText variant="headline" color={COLORS.surface} style={styles.btnText}>
            Begin Sacred Journey
          </AppText>
          <ArrowRight size={20} color={COLORS.surface} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(201, 151, 90, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 151, 90, 0.3)',
  },
  title: {
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    letterSpacing: 3,
    opacity: 0.75,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 6,
  },
  sectionDesc: {
    lineHeight: 22,
  },
  optionsList: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.lg,
    padding: SPACING.md,
    borderWidth: 0,
    borderColor: 'transparent',
    position: 'relative',
    ...SHADOWS.sm,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(201, 151, 90, 0.08)',
    ...SHADOWS.sm,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: ROUNDNESS.full,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  optionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 18,
  },
  paceBadge: {
    fontWeight: '700',
    fontSize: 12,
  },
  descText: {
    lineHeight: 18,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 151, 90, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: 'transparent',
  },
  footerNote: {
    marginVertical: SPACING.sm,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: ROUNDNESS.full,
    ...SHADOWS.md,
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
