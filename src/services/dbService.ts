import * as SQLite from 'expo-sqlite';

const DB_NAME = 'krishna_uvaach.db';

export interface Bookmark {
  id: string;
  verse_id: string;
  created_at: string;
}

export interface ReadingHistory {
  id: string;
  verse_id: string;
  last_read_at: string;
}

class DBService {
  private db: SQLite.SQLiteDatabase | null = null;

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

  async addBookmark(verseId: string) {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT OR REPLACE INTO bookmarks (verse_id) VALUES (?)',
      [verseId]
    );
  }

  async removeBookmark(verseId: string) {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'DELETE FROM bookmarks WHERE verse_id = ?',
      [verseId]
    );
  }

  async getBookmarks(): Promise<string[]> {
    if (!this.db) await this.init();
    const results = await this.db!.getAllAsync<{ verse_id: string }>(
      'SELECT verse_id FROM bookmarks ORDER BY created_at DESC'
    );
    return results.map(r => r.verse_id);
  }

  async isBookmarked(verseId: string): Promise<boolean> {
    if (!this.db) await this.init();
    const result = await this.db!.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookmarks WHERE verse_id = ?',
      [verseId]
    );
    return (result?.count ?? 0) > 0;
  }

  async addToHistory(verseId: string) {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT OR REPLACE INTO history (verse_id, last_read_at) VALUES (?, CURRENT_TIMESTAMP)',
      [verseId]
    );
  }

  async getHistory(): Promise<string[]> {
    if (!this.db) await this.init();
    const results = await this.db!.getAllAsync<{ verse_id: string }>(
      'SELECT verse_id FROM history ORDER BY last_read_at DESC LIMIT 100'
    );
    return results.map(r => r.verse_id);
  }
}

export const dbService = new DBService();
