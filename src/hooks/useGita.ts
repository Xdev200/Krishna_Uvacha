import { useCallback } from 'react';
import { gitaService } from '../services/gitaService';

export const useGita = () => {
  const getAllVerses = useCallback(() => gitaService.getAllVerses(), []);
  const getVersesByChapter = useCallback((chapter: number) => gitaService.getVersesByChapter(chapter), []);
  const getVerseById = useCallback((id: string) => gitaService.getVerseById(id), []);
  const searchVerses = useCallback((query: string) => gitaService.searchVerses(query), []);
  const getChapterName = useCallback((chapter: number) => gitaService.getChapterName(chapter), []);
  const getNextVerse = useCallback(
    (chapter: number, verse: number) => gitaService.getNextVerse(chapter, verse),
    []
  );
  const getTotalVerseCount = useCallback(() => gitaService.getTotalVerseCount(), []);
  const getChapterVerseCount = useCallback((chapter: number) => gitaService.getChapterVerseCount(chapter), []);

  return {
    getAllVerses,
    getVersesByChapter,
    getVerseById,
    searchVerses,
    getChapterName,
    getNextVerse,
    getTotalVerseCount,
    getChapterVerseCount,
  };
};
