import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private isInitialized = false;
  private sessionPromptCount = 0;
  private readonly MAX_SESSION_PROMPTS = 2;

  /**
   * Checks whether the daily reminder prompt can be shown in the current app session.
   * Returns true only if it has appeared fewer than 2 times.
   */
  canPromptReminderInSession(): boolean {
    return this.sessionPromptCount < this.MAX_SESSION_PROMPTS;
  }

  /**
   * Records that a daily reminder prompt was shown in this session.
   */
  recordReminderPromptShown(): void {
    this.sessionPromptCount++;
  }

  async init() {
    if (this.isInitialized) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-streak-reminder', {
        name: 'Daily Streak & Geeta Saar Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D97706',
        sound: 'default',
      });
    }

    this.isInitialized = true;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  async arePermissionsGranted(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Schedules a daily recurring notification at the specified time (default 8:00 AM).
   * Reminds the user to continue their reading streak with the next verse.
   */
  async scheduleDailyReminder(hour: number = 8, minute: number = 0, nextVerseId?: string): Promise<string | null> {
    try {
      await this.init();
      const granted = await this.requestPermissions();
      if (!granted) return null;

      // Cancel existing reminders first to prevent duplicate notifications
      await this.cancelDailyReminder();

      const title = '🙏 Your Geeta Saar Journey Awaits';
      const body = nextVerseId
        ? `Continue with Chapter ${nextVerseId.split('.')[0]}, Verse ${nextVerseId.split('.')[1]} today.`
        : 'Take a mindful moment with the sacred wisdom of Geeta Saar today.';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { verseId: nextVerseId },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'daily-streak-reminder',
        },
      });

      return notificationId;
    } catch (error) {
      console.warn('NotificationService: Failed to schedule daily reminder', error);
      return null;
    }
  }

  /**
   * Cancel all scheduled reminders.
   */
  async cancelDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('NotificationService: Failed to cancel reminders', error);
    }
  }

  /**
   * Check if any scheduled reminder is currently active.
   */
  async hasScheduledReminder(): Promise<boolean> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.length > 0;
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();
