import { useCallback } from 'react';
import { gitaService } from '../services/gitaService';

export const useGita = () => {
  const getAllVerses = useCallback(() => gitaService.getAllVerses(), []);
  const getVersesByChapter = useCallback((chapter: number) => gitaService.getVersesByChapter(chapter), []);
  const searchVerses = useCallback((query: string) => gitaService.searchVerses(query), []);
  const getRandomVerses = useCallback((count: number = 50) => gitaService.getRandomVerses(count), []);
  const getChapterName = useCallback((chapter: number) => gitaService.getChapterName(chapter), []);

  return { getAllVerses, getVersesByChapter, searchVerses, getRandomVerses, getChapterName };
};
