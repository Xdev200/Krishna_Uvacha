import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Bell, X, Sparkles, Check } from 'lucide-react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { notificationService } from '../../services/notificationService';
import { dbService } from '../../services/dbService';

interface DailyReminderModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  nextVerseId?: string;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  nextVerseId = '1.1',
}) => {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const scheduledId = await notificationService.scheduleDailyReminder(8, 0, nextVerseId);
      if (scheduledId) {
        await dbService.setReminderAllowed(true);
        if (onSuccess) onSuccess();
      } else {
        // If permission was denied or failed
        await dbService.setReminderAllowed(false);
      }
    } catch (e) {
      console.warn('Failed to schedule reminder', e);
      await dbService.setReminderAllowed(false);
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  const handleLater = async () => {
    // Keep reminder_allowed false so it can remind again on next visit or exit attempt
    await dbService.setReminderAllowed(false);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleLater}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleLater} activeOpacity={0.7}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Golden Bell Glow */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconHalo} />
            <View style={styles.iconCircle}>
              <Bell size={28} color={COLORS.primary} fill={COLORS.primary} />
            </View>
          </View>

          <View style={styles.titleRow}>
            <Sparkles size={16} color={COLORS.primary} />
            <AppText variant="headline" centered style={styles.title}>
              Daily Sacred Reminder
            </AppText>
          </View>

          <AppText variant="body" color={COLORS.textSecondary} centered style={styles.description}>
            Allow daily morning alerts at 8:00 AM with your next Gita verse to deepen your practice and preserve your sacred reading streak.
          </AppText>

          <View style={styles.timeBadge}>
            <AppText variant="caption" color={COLORS.primary} style={styles.timeBadgeText}>
              ⏰ Daily at 8:00 AM • Bhagavad Gita Verse of the Day
            </AppText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.enableBtn, loading && styles.btnDisabled]}
              onPress={handleEnable}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Bell size={18} color={COLORS.surface} />
              <AppText variant="headline" color={COLORS.surface} style={styles.enableText}>
                {loading ? 'Setting...' : 'Enable Daily Reminder'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterBtn}
              onPress={handleLater}
              activeOpacity={0.7}
            >
              <AppText variant="caption" color={COLORS.textMuted} style={styles.laterText}>
                Maybe Later
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: 6,
    zIndex: 1,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 20,
  },
  description: {
    lineHeight: 22,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  timeBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: ROUNDNESS.full,
    marginBottom: SPACING.lg,
  },
  timeBadgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  enableBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: ROUNDNESS.full,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  enableText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  laterBtn: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  laterText: {
    fontWeight: '600',
    fontSize: 13,
  },
});
