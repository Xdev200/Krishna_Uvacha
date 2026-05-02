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

  getRandomVerses(count: number = 50): Verse[] {
    return [...this.data].sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

export const gitaService = new GitaService();
