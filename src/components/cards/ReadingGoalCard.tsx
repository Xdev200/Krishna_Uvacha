import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Target, CheckCircle2, AlertCircle, Edit3, X, Check } from 'lucide-react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { ReadingGoal } from '../../services/dbService';

interface ReadingGoalCardProps {
  goal: ReadingGoal | null;
  versesRead: number;
  totalVerses: number;
  onSetGoal: (targetDays: number) => Promise<void>;
  onClearGoal?: () => Promise<void>;
}

export const PRESET_GOALS = [
  { days: 30, label: '30 Days', pace: '~24/day', desc: 'Intense Devotion' },
  { days: 60, label: '60 Days', pace: '~12/day', desc: 'Dedicated Path' },
  { days: 90, label: '90 Days', pace: '~8/day', desc: 'Balanced Journey' },
  { days: 180, label: '180 Days', pace: '~4/day', desc: 'Gentle Flow' },
];

export const ReadingGoalCard: React.FC<ReadingGoalCardProps> = ({
  goal,
  versesRead,
  totalVerses,
  onSetGoal,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPace, setSelectedPace] = useState<number>(goal?.targetDays ?? 90);

  const handleOpenEdit = () => {
    setSelectedPace(goal?.targetDays ?? 90);
    setModalVisible(true);
  };

  const handleSavePace = async () => {
    await onSetGoal(selectedPace);
    setModalVisible(false);
  };

  // If no goal is configured yet, display a dignified, compact card prompting to set one
  if (!goal) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Target size={22} color={COLORS.primary} />
          </View>
          <View style={styles.emptyContent}>
            <AppText variant="headline" style={styles.title}>
              Gita Reading Goal
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              Track your pace to complete all 701 sacred verses
            </AppText>
          </View>
          <TouchableOpacity style={styles.setGoalBtn} onPress={handleOpenEdit}>
            <AppText variant="caption" color={COLORS.surface} style={styles.setGoalText}>
              Set Goal
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Edit / Choice Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AppText variant="headline" style={styles.modalTitle}>
                  Set Reading Pace
                </AppText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <AppText variant="body" color={COLORS.textSecondary} style={styles.modalSubtitle}>
                Choose your pace to complete all 701 verses of the Bhagavad Gita:
              </AppText>

              <View style={styles.modalGrid}>
                {PRESET_GOALS.map(preset => {
                  const isSelected = selectedPace === preset.days;
                  return (
                    <TouchableOpacity
                      key={preset.days}
                      style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                      onPress={() => setSelectedPace(preset.days)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalOptionTextCol}>
                        <AppText
                          variant="headline"
                          color={isSelected ? COLORS.primary : COLORS.text}
                          style={styles.optionLabel}
                        >
                          {preset.label}
                        </AppText>
                        <AppText variant="caption" color={COLORS.textMuted}>
                          {preset.desc}
                        </AppText>
                      </View>
                      <View style={styles.modalOptionRight}>
                        <AppText
                          variant="caption"
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                          style={styles.optionPace}
                        >
                          {preset.pace}
                        </AppText>
                        {isSelected && <Check size={16} color={COLORS.primary} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <AppText variant="caption" color={COLORS.textSecondary}>
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSavePace}>
                  <AppText variant="caption" color={COLORS.surface} style={styles.saveBtnText}>
                    Save Goal
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Active goal view — strictly reflects selected goal only
  const startDate = new Date(goal.startDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, goal.targetDays - daysElapsed);
  const versesRemaining = Math.max(0, totalVerses - versesRead);
  const requiredPace = daysRemaining > 0 ? Math.ceil(versesRemaining / daysRemaining) : versesRemaining;

  const expectedProgressVerses = Math.min(
    totalVerses,
    Math.round((daysElapsed / goal.targetDays) * totalVerses)
  );
  const isOnTrack = versesRead >= expectedProgressVerses;
  const progressPercent = Math.min(100, Math.round((versesRead / totalVerses) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Target size={18} color={COLORS.primary} />
          <AppText variant="headline" style={styles.title}>
            {goal.targetDays}-Day Reading Goal
          </AppText>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, isOnTrack ? styles.badgeSuccess : styles.badgeWarning]}>
            {isOnTrack ? (
              <CheckCircle2 size={12} color="#059669" />
            ) : (
              <AlertCircle size={12} color="#D97706" />
            )}
            <AppText
              variant="caption"
              color={isOnTrack ? '#059669' : '#D97706'}
              style={styles.statusText}
            >
              {isOnTrack ? 'On Track' : 'Behind Pace'}
            </AppText>
          </View>

          <TouchableOpacity onPress={handleOpenEdit} style={styles.editBtn} activeOpacity={0.7}>
            <Edit3 size={15} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress track */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <AppText variant="caption" color={COLORS.textSecondary}>
            {versesRead} of {totalVerses} read ({progressPercent}%)
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary}>
            Day {daysElapsed} of {goal.targetDays}
          </AppText>
        </View>
      </View>

      {/* Pace stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <AppText variant="headline" color={COLORS.primary} style={styles.statNumber}>
            {daysRemaining}
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary}>Days Left</AppText>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <AppText variant="headline" color={COLORS.primary} style={styles.statNumber}>
            ~{requiredPace}
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary}>Verses/Day</AppText>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <AppText variant="headline" color={COLORS.primary} style={styles.statNumber}>
            {versesRemaining}
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary}>Remaining</AppText>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Target size={20} color={COLORS.primary} />
                <AppText variant="headline" style={styles.modalTitle}>
                  Change Reading Goal
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <AppText variant="body" color={COLORS.textSecondary} style={styles.modalSubtitle}>
              Select your preferred pace to complete all 701 verses:
            </AppText>

            <View style={styles.modalGrid}>
              {PRESET_GOALS.map(preset => {
                const isSelected = selectedPace === preset.days;
                return (
                  <TouchableOpacity
                    key={preset.days}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => setSelectedPace(preset.days)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionTextCol}>
                      <AppText
                        variant="headline"
                        color={isSelected ? COLORS.primary : COLORS.text}
                        style={styles.optionLabel}
                      >
                        {preset.label}
                      </AppText>
                      <AppText variant="caption" color={COLORS.textMuted}>
                        {preset.desc}
                      </AppText>
                    </View>
                    <View style={styles.modalOptionRight}>
                      <AppText
                        variant="caption"
                        color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        style={styles.optionPace}
                      >
                        {preset.pace}
                      </AppText>
                      {isSelected && <Check size={16} color={COLORS.primary} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePace}>
                <AppText variant="caption" color={COLORS.surface} style={styles.saveBtnText}>
                  Update Goal
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    flex: 1,
  },
  setGoalBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: ROUNDNESS.full,
  },
  setGoalText: {
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDNESS.full,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 11,
  },
  editBtn: {
    padding: 6,
    borderRadius: ROUNDNESS.full,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  progressSection: {
    marginVertical: SPACING.xs,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalTitle: {
    fontSize: 17,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  modalGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: ROUNDNESS.md,
    backgroundColor: COLORS.background,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  modalOptionSelected: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  modalOptionTextCol: {
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
  },
  modalOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionPace: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: ROUNDNESS.full,
  },
  saveBtnText: {
    fontWeight: '700',
  },
});
