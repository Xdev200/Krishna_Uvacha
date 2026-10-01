import * as SQLite from 'expo-sqlite';

const DB_NAME = 'krishna_Uvacha.db';

export interface ProgressData {
  chapter: number;
  verse: number;
  updatedAt: string;
}

export interface ProgressStats {
  chaptersCompleted: number;
  versesRead: number;
  totalVerses: number;
  percentage: number;
}

export interface ReadingDateEntry {
  date: string;
  count: number;
}

export interface ReadingGoal {
  targetDays: number;
  startDate: string;
  createdAt: string;
}

export interface Milestone {
  key: string;
  unlockedAt: string;
}

export interface HistoryEntry {
  verseId: string;
  lastReadAt: string;
}

// Total verses in the Bhagavad Gita
const TOTAL_VERSES = 701;

// Verse counts per chapter
const CHAPTER_VERSE_COUNTS: Record<number, number> = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
  7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
  13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78,
};

class DBService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id TEXT UNIQUE NOT NULL,
        last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        chapter INTEGER NOT NULL DEFAULT 1,
        verse INTEGER NOT NULL DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reading_goals (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        target_days INTEGER NOT NULL,
        start_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS milestones (
        milestone_key TEXT PRIMARY KEY,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      if (!this.initPromise) this.initPromise = this.init();
      await this.initPromise;
    }
    return this.db!;
  }

  // ─── Bookmarks ───────────────────────────────────────────────

  async addBookmark(verseId: string) {
    const db = await this.getDb();
    await db.runAsync('INSERT OR REPLACE INTO bookmarks (verse_id) VALUES (?)', [verseId]);
  }

  async removeBookmark(verseId: string) {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM bookmarks WHERE verse_id = ?', [verseId]);
  }

  async getBookmarks(): Promise<string[]> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ verse_id: string }>(
      'SELECT verse_id FROM bookmarks ORDER BY created_at DESC'
    );
    return results.map(r => r.verse_id);
  }

  async isBookmarked(verseId: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookmarks WHERE verse_id = ?',
      [verseId]
    );
    return (result?.count ?? 0) > 0;
  }

  // ─── History ─────────────────────────────────────────────────

  async addToHistory(verseId: string) {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO history (verse_id, last_read_at) VALUES (?, CURRENT_TIMESTAMP)',
      [verseId]
    );
  }

  async getHistory(): Promise<string[]> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ verse_id: string }>(
      'SELECT verse_id FROM history ORDER BY last_read_at DESC LIMIT 100'
    );
    return results.map(r => r.verse_id);
  }

  async getHistoryWithTimestamps(): Promise<HistoryEntry[]> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ verse_id: string; last_read_at: string }>(
      'SELECT verse_id, last_read_at FROM history ORDER BY last_read_at DESC LIMIT 100'
    );
    return results.map(r => ({ verseId: r.verse_id, lastReadAt: r.last_read_at }));
  }

  async getStreak(): Promise<number> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ date: string }>(
      "SELECT DISTINCT date(last_read_at) as date FROM history ORDER BY date DESC LIMIT 365"
    );
    if (results.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < results.length; i++) {
      const date = new Date(results[i].date + 'T00:00:00');
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (date.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ─── User Progress ──────────────────────────────────────────

  async saveProgress(chapter: number, verse: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO user_progress (id, chapter, verse, updated_at)
       VALUES (1, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET chapter = ?, verse = ?, updated_at = CURRENT_TIMESTAMP`,
      [chapter, verse, chapter, verse]
    );
    // Check for milestone unlocks after saving progress
    await this.checkMilestones();
  }

  async getProgress(): Promise<ProgressData | null> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{
      chapter: number;
      verse: number;
      updated_at: string;
    }>('SELECT chapter, verse, updated_at FROM user_progress WHERE id = 1');
    if (!result) return null;
    return {
      chapter: result.chapter,
      verse: result.verse,
      updatedAt: result.updated_at,
    };
  }

  async getProgressStats(): Promise<ProgressStats> {
    const db = await this.getDb();

    // Count unique verses read from history
    const countResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(DISTINCT verse_id) as count FROM history'
    );
    const versesRead = countResult?.count ?? 0;

    // Calculate chapters completed by checking if all verses in each chapter are read
    let chaptersCompleted = 0;
    for (let ch = 1; ch <= 18; ch++) {
      const chapterCount = CHAPTER_VERSE_COUNTS[ch] ?? 0;
      const readInChapter = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(DISTINCT verse_id) as count FROM history
         WHERE verse_id LIKE ?`,
        [`${ch}.%`]
      );
      if ((readInChapter?.count ?? 0) >= chapterCount) {
        chaptersCompleted++;
      }
    }

    const percentage = TOTAL_VERSES > 0
      ? Math.round((versesRead / TOTAL_VERSES) * 100)
      : 0;

    return {
      chaptersCompleted,
      versesRead,
      totalVerses: TOTAL_VERSES,
      percentage,
    };
  }

  // ─── Reading Dates (for Streak Calendar) ─────────────────────

  async getReadingDates(): Promise<ReadingDateEntry[]> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ date: string; count: number }>(
      `SELECT date(last_read_at) as date, COUNT(DISTINCT verse_id) as count
       FROM history
       GROUP BY date(last_read_at)
       ORDER BY date DESC
       LIMIT 90`
    );
    return results.map(r => ({ date: r.date, count: r.count }));
  }

  // ─── Reading Goals ───────────────────────────────────────────

  async setReadingGoal(targetDays: number): Promise<void> {
    const db = await this.getDb();
    const today = new Date().toISOString().split('T')[0];
    await db.runAsync(
      `INSERT INTO reading_goals (id, target_days, start_date, created_at)
       VALUES (1, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET target_days = ?, start_date = ?, created_at = CURRENT_TIMESTAMP`,
      [targetDays, today, targetDays, today]
    );
  }

  async getReadingGoal(): Promise<ReadingGoal | null> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{
      target_days: number;
      start_date: string;
      created_at: string;
    }>('SELECT target_days, start_date, created_at FROM reading_goals WHERE id = 1');
    if (!result) return null;
    return {
      targetDays: result.target_days,
      startDate: result.start_date,
      createdAt: result.created_at,
    };
  }

  async clearReadingGoal(): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM reading_goals WHERE id = 1');
  }

  // ─── Milestones ──────────────────────────────────────────────

  async unlockMilestone(key: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT OR IGNORE INTO milestones (milestone_key) VALUES (?)',
      [key]
    );
  }

  async getMilestones(): Promise<Milestone[]> {
    const db = await this.getDb();
    const results = await db.getAllAsync<{ milestone_key: string; unlocked_at: string }>(
      'SELECT milestone_key, unlocked_at FROM milestones ORDER BY unlocked_at ASC'
    );
    return results.map(r => ({ key: r.milestone_key, unlockedAt: r.unlocked_at }));
  }

  async isMilestoneUnlocked(key: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM milestones WHERE milestone_key = ?',
      [key]
    );
    return (result?.count ?? 0) > 0;
  }

  // ─── Milestone Auto-Check ────────────────────────────────────

  private async checkMilestones(): Promise<void> {
    const stats = await this.getProgressStats();
    const streak = await this.getStreak();

    // 🌅 First Light — Read your first verse
    if (stats.versesRead >= 1) {
      await this.unlockMilestone('first_verse');
    }

    // 📖 Chapter Seeker — Complete 1 chapter
    if (stats.chaptersCompleted >= 1) {
      await this.unlockMilestone('first_chapter');
    }

    // 🔥 Week Warrior — 7-day streak
    if (streak >= 7) {
      await this.unlockMilestone('streak_7');
    }

    // 🏔️ Halfway Summit — 350+ verses read
    if (stats.versesRead >= 350) {
      await this.unlockMilestone('halfway');
    }

    // 💎 Devoted Reader — 30-day streak
    if (streak >= 30) {
      await this.unlockMilestone('streak_30');
    }

    // 🕉️ Gita Graduate — All 701 verses read
    if (stats.versesRead >= TOTAL_VERSES) {
      await this.unlockMilestone('complete');
    }

    // ⚡ Speed Reader — Finish within reading goal
    if (stats.versesRead >= TOTAL_VERSES) {
      const goal = await this.getReadingGoal();
      if (goal) {
        const startDate = new Date(goal.startDate);
        const now = new Date();
        const daysTaken = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysTaken <= goal.targetDays) {
          await this.unlockMilestone('goal_complete');
        }
      }
    }
  }

  // ─── App Settings ────────────────────────────────────────────

  async setSetting(key: string, value: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
      [key, value, value]
    );
  }

  async getSetting(key: string): Promise<string | null> {
    const db = await this.getDb();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      [key]
    );
    return result?.value ?? null;
  }

  async isReminderAllowed(): Promise<boolean> {
    const val = await this.getSetting('daily_reminder_allowed');
    return val === 'true';
  }

  async setReminderAllowed(allowed: boolean): Promise<void> {
    await this.setSetting('daily_reminder_allowed', allowed ? 'true' : 'false');
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    const val = await this.getSetting('onboarding_completed');
    if (val === 'true') return true;
    // Fallback: If user already has a reading goal, consider onboarding done
    const goal = await this.getReadingGoal();
    return goal !== null;
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setSetting('onboarding_completed', completed ? 'true' : 'false');
  }
}

export const dbService = new DBService();
