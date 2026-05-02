import { useState, useEffect, useCallback } from 'react';
import { gitaService, Verse } from '../services/gitaService';

/**
 * Hook to access Gita data.
 * Provides methods for getting all verses, verses by chapter, and searching.
 */
export const useGita = () => {
  const [loading, setLoading] = useState(false);

  const getAllVerses = useCallback(() => {
    return gitaService.getAllVerses();
  }, []);

  const getVersesByChapter = useCallback((chapter: number) => {
    return gitaService.getVersesByChapter(chapter);
  }, []);

  const searchVerses = useCallback((query: string) => {
    return gitaService.searchVerses(query);
  }, []);

  const getRandomVerses = useCallback((count: number = 50) => {
    const allVerses = gitaService.getAllVerses();
    return [...allVerses].sort(() => 0.5 - Math.random()).slice(0, count);
  }, []);

  const getChapterName = useCallback((chapter: number) => {
    return gitaService.getChapterName(chapter);
  }, []);

  return {
    loading,
    getAllVerses,
    getVersesByChapter,
    searchVerses,
    getRandomVerses,
    getChapterName,
  };
};

/**
 * Hook to access a specific verse by ID or chapter/verse number.
 */
export const useVerse = (verseId?: string) => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verseId) {
      setLoading(true);
      const allVerses = gitaService.getAllVerses();
      const found = allVerses.find(v => v.id === verseId);
      setVerse(found || null);
      setLoading(false);
    }
  }, [verseId]);

  return { verse, loading };
};
