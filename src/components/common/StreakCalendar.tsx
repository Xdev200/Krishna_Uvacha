import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Flame, Calendar as CalendarIcon } from 'lucide-react-native';
import { AppText } from './AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { ReadingDateEntry } from '../../services/dbService';

interface StreakCalendarProps {
  readingDates: ReadingDateEntry[];
  currentStreak: number;
}

const WEEKS_TO_SHOW = 12; // 12 weeks (~84 days)
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  readingDates,
  currentStreak,
}) => {
  // Map of 'YYYY-MM-DD' -> count
  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of readingDates) {
      map.set(entry.date, entry.count);
    }
    return map;
  }, [readingDates]);

  // Generate grid columns (weeks), each with 7 day cells
  const { weeks, totalActiveDays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = WEEKS_TO_SHOW * 7;
    const startDate = new Date(today);
    // Align to the start of the week (Sunday)
    startDate.setDate(today.getDate() - totalDays + (6 - today.getDay()));

    const weeksList: { dateStr: string; count: number; isFuture: boolean }[][] = [];
    let activeDays = 0;

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const weekDays: { dateStr: string; count: number; isFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7 + d));

        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isFuture = currentDate.getTime() > today.getTime();
        const count = countMap.get(dateStr) ?? 0;
        if (count > 0 && !isFuture) {
          activeDays++;
        }

        weekDays.push({ dateStr, count, isFuture });
      }
      weeksList.push(weekDays);
    }

    return { weeks: weeksList, totalActiveDays: activeDays };
  }, [countMap]);

  const getCellColor = (count: number, isFuture: boolean) => {
    if (isFuture) return 'transparent';
    if (count === 0) return 'rgba(0, 0, 0, 0.05)';
    if (count <= 2) return 'rgba(217, 119, 6, 0.35)';
    if (count <= 4) return 'rgba(217, 119, 6, 0.65)';
    return COLORS.primary; // 5+ verses
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CalendarIcon size={18} color={COLORS.primary} />
          <AppText variant="headline" style={styles.title}>
            Spiritual Consistency
          </AppText>
        </View>

        <View style={styles.streakBadge}>
          <Flame size={14} color={COLORS.primary} fill={COLORS.primary} />
          <AppText variant="caption" color={COLORS.primary} style={styles.streakText}>
            {currentStreak} day streak
          </AppText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.gridContainer}>
          {/* Day label column */}
          <View style={styles.dayLabelsCol}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <View key={idx} style={styles.dayLabelCell}>
                <AppText variant="caption" color={COLORS.textMuted} style={styles.dayLabelText}>
                  {idx % 2 === 1 ? day : ''}
                </AppText>
              </View>
            ))}
          </View>

          {/* Week columns */}
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} style={styles.weekCol}>
              {week.map((day, dayIdx) => (
                <View
                  key={dayIdx}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(day.count, day.isFuture) },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend & Summary */}
      <View style={styles.footer}>
        <AppText variant="caption" color={COLORS.textSecondary}>
          {totalActiveDays} active reading days
        </AppText>

        <View style={styles.legend}>
          <AppText variant="caption" color={COLORS.textMuted}>Less</AppText>
          <View style={[styles.legendCell, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]} />
          <View style={[styles.legendCell, { backgroundColor: 'rgba(217, 119, 6, 0.35)' }]} />
          <View style={[styles.legendCell, { backgroundColor: 'rgba(217, 119, 6, 0.65)' }]} />
          <View style={[styles.legendCell, { backgroundColor: COLORS.primary }]} />
          <AppText variant="caption" color={COLORS.textMuted}>More</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDNESS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.sm,
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ROUNDNESS.full,
  },
  streakText: {
    fontWeight: '700',
  },
  scroll: {
    marginVertical: SPACING.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelsCol: {
    marginRight: 4,
    justifyContent: 'space-between',
  },
  dayLabelCell: {
    height: 14,
    marginBottom: 3,
    justifyContent: 'center',
  },
  dayLabelText: {
    fontSize: 9,
  },
  weekCol: {
    marginRight: 3,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginBottom: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
