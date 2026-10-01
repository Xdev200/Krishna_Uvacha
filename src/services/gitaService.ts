import gitaData from '../data/gita.json';

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  english_translation: string;
  hindi_translation: string;
  word_meanings: string;
  speaker: string;
  keywords: string[];
}

const CHAPTER_NAMES: Record<number, string> = {
  1: 'Arjuna Visada Yoga',
  2: 'Sankhya Yoga',
  3: 'Karma Yoga',
  4: 'Jnana Karma Sanyasa Yoga',
  5: 'Karma Sanyasa Yoga',
  6: 'Dhyana Yoga',
  7: 'Jnana Vijnana Yoga',
  8: 'Aksara Brahma Yoga',
  9: 'Raja Vidya Raja Guhya Yoga',
  10: 'Vibhuti Vistara Yoga',
  11: 'Viswarupa Darshana Yoga',
  12: 'Bhakti Yoga',
  13: 'Kshetra Kshetrajna Vibhaga Yoga',
  14: 'Gunatraya Vibhaga Yoga',
  15: 'Purushottama Yoga',
  16: 'Daivasura Sampad Vibhaga Yoga',
  17: 'Shraddhatraya Vibhaga Yoga',
  18: 'Moksha Sanyasa Yoga',
};

class GitaService {
  private data: Verse[] = gitaData as Verse[];

  getAllVerses(): Verse[] {
    return this.data;
  }

  getVersesByChapter(chapter: number): Verse[] {
    return this.data.filter(v => v.chapter === chapter);
  }

  getVerseById(id: string): Verse | undefined {
    return this.data.find(v => v.id === id);
  }

  getVerse(chapter: number, verse: number): Verse | undefined {
    return this.data.find(v => v.chapter === chapter && v.verse === verse);
  }

  /**
   * Returns the next verse in sequential order.
   * Handles chapter transitions (e.g., last verse of Ch.1 → first verse of Ch.2).
   * Returns undefined if the user has reached the very last verse (18.78).
   */
  getNextVerse(chapter: number, verse: number): Verse | undefined {
    const currentIndex = this.data.findIndex(
      v => v.chapter === chapter && v.verse === verse
    );
    if (currentIndex === -1 || currentIndex >= this.data.length - 1) {
      return undefined;
    }
    return this.data[currentIndex + 1];
  }

  searchVerses(query: string): Verse[] {
    const lowerQuery = query.toLowerCase();
    return this.data.filter(
      v =>
        v.english_translation.toLowerCase().includes(lowerQuery) ||
        v.hindi_translation.toLowerCase().includes(lowerQuery) ||
        v.sanskrit.includes(query) ||
        v.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }

  getChapterName(chapter: number): string {
    return CHAPTER_NAMES[chapter] ?? `Chapter ${chapter}`;
  }

  getTotalVerseCount(): number {
    return this.data.length;
  }

  getChapterVerseCount(chapter: number): number {
    return this.data.filter(v => v.chapter === chapter).length;
  }
}

export const gitaService = new GitaService();
