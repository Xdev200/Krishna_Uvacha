import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { dbService, ProgressStats } from '../services/dbService';
import { gitaService } from '../services/gitaService';

export interface UserProgress {
  currentChapter: number;
  currentVerse: number;
  chaptersCompleted: number;
  versesRead: number;
  totalVerses: number;
  percentage: number;
  nextVerseId: string | null;
  isComplete: boolean;
}

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>({
    currentChapter: 1,
    currentVerse: 1,
    chaptersCompleted: 0,
    versesRead: 0,
    totalVerses: gitaService.getTotalVerseCount(),
    percentage: 0,
    nextVerseId: '1.1',
    isComplete: false,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const savedProgress = await dbService.getProgress();
      const stats: ProgressStats = await dbService.getProgressStats();

      let currentChapter = 1;
      let currentVerse = 1;
      let nextVerseId: string | null = '1.1';

      if (savedProgress) {
        currentChapter = savedProgress.chapter;
        currentVerse = savedProgress.verse;

        // Compute the next verse to resume from
        const nextVerse = gitaService.getNextVerse(currentChapter, currentVerse);
        nextVerseId = nextVerse ? nextVerse.id : null;
      }

      const isComplete = stats.versesRead >= stats.totalVerses;

      setProgress({
        currentChapter,
        currentVerse,
        chaptersCompleted: stats.chaptersCompleted,
        versesRead: stats.versesRead,
        totalVerses: stats.totalVerses,
        percentage: stats.percentage,
        nextVerseId,
        isComplete,
      });
    } catch (error) {
      console.warn('useProgress: Failed to load progress', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh when screen receives focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { progress, loading, refresh };
};
