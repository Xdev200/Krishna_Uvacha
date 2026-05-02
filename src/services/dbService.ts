import * as SQLite from 'expo-sqlite';

const DB_NAME = 'krishna_uvaach.db';

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
    `);
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      if (!this.initPromise) this.initPromise = this.init();
      await this.initPromise;
    }
    return this.db!;
  }

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
}

export const dbService = new DBService();
