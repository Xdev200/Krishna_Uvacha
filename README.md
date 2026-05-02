# Krishna Uvaach (कृष्ण उवाच)

A premium, fully offline-accessible React Native Expo application for experiencing the divine wisdom of the Bhagavad Gita.

## ✨ Features

- **Manuscript Aesthetic**: Implements the "Sacred Clarity" design system with Saffron primary colors, Parchment backgrounds, and Charcoal typography.
- **TikTok-style Feed**: Immersive, full-screen vertical scrolling for discovering verses in a modern, engaging format.
- **Offline First**: All 700+ verses of the Bhagavad Gita are stored locally in a optimized JSON structure.
- **Deep Reader**: Detailed view for every shloka including Sanskrit text, transliteration, word-by-word meanings, and English/Hindi translations.
- **Smart Browsing**: Navigate through all 18 chapters or search for specific keywords like "Karma", "Yoga", or "Bhakti".
- **Local Persistence**: Save your favorite verses with Bookmarks and track your journey with Reading History, all stored locally using SQLite.
- **Premium Typography**: Uses Noto Serif, Newsreader, and Inter fonts for a readable and authentic feel.

## 🏗️ Architecture

- **Core**: React Native + Expo (SDK 54).
- **Styling**: Vanilla React Native StyleSheet with design tokens.
- **Animations**: Moti + React Native Reanimated.
- **Navigation**: React Navigation (Stack).
- **Data Layer**: 
  - `gitaService.ts`: Core data logic for JSON parsing and search.
  - `dbService.ts`: SQLite service for local state persistence.
- **Theming**: Centralized design tokens in `src/theme/tokens.ts`.

## 🛠️ Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the App**:
   ```bash
   npm start
   ```

3. **Platforms**: 
   - iOS (Simulator or Physical device via Expo Go)
   - Android (Emulator or Physical device via Expo Go)
   - Web (Preview)

## 📄 License

This project is built for the dissemination of spiritual wisdom. Content source: Bhagavad Gita JSON dataset.

---

*“Man is made by his belief. As he believes, so he is.” — Lord Krishna*
