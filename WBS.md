# Krishna_Uvaach - Implementation Plan (WBS)

## Phase 1: Foundation & Setup
- [x] 1.1 Project structure initialization
- [x] 1.2 Theme configuration (Design Tokens)
- [x] 1.3 Font integration (Noto Serif, Newsreader, Inter)
- [x] 1.4 Asset preparation (Mandala textures, Logos)

## Phase 2: Data Layer (Offline First)
- [x] 2.1 Gita JSON validation and schema
- [x] 2.2 Data service implementation (JSON parser + Search)
- [x] 2.3 SQLite integration for bookmarks and history
- [x] 2.4 Custom hooks for data access (`useGita`, `useVerse`)

## Phase 3: Core UI Components (Sacred Clarity)
- [x] 3.1 Custom Typography components
- [x] 3.2 ShlokaCard component (Manuscript aesthetic)
- [x] 3.3 Interactive buttons and controls (Saffron theme)
- [x] 3.4 Layout wrappers and navigation headers

## Phase 4: Screen Development
- [x] 4.1 Animated Splash Screen
- [x] 4.2 Home (TikTok-style Verse Feed)
- [x] 4.3 Chapter/Verse Browser
- [x] 4.4 Bookmarks & History
- [x] 4.5 Settings & About

## Phase 5: Polish & UX
- [x] 5.1 Smooth navigation transitions
- [x] 5.2 Micro-animations (Moti/Reanimated)
- [x] 5.3 Offline persistence verification
- [x] 5.4 Accessibility audit (Screen readers, Contrast)

## Phase 6: Finalization
- [x] 6.1 Performance optimization (Memoization)
- [x] 6.2 Documentation and Code Comments
- [x] 6.3 Cleanup and Handover

## Phase 7: UI Modernization
- [x] 7.1 Replicate Home Screen design exactly as per screenshot (Header, Cards, Bottom Nav)
- [x] 7.2 Implement Krishna hero asset and card gradients
- [x] 7.3 Align spacing and alignment to premium standards
- [x] 7.4 Create and integrate dedicated header image for Browse Chapters card
- [x] 7.5 Redesign Reader Screen to match premium visual reference
- [x] 7.6 Implement consistent header, interpretation section, and next verses selector
- [x] 7.7 Add Bottom Tab Bar to Reader Screen
- [x] 7.8 Fix ReaderScreen runtime error (getChapterVerses undefined)
- [x] 7.9 Configure Metro for .wasm support to fix expo-sqlite web build
- [x] 7.10 Implement TikTok-like vertical feed for ReaderScreen
- [x] 7.11 Optimize VerseHeroCard: increase Sanskrit font size, remove watermark
- [x] 7.12 Enable infinite random feed when coming from Shuffle card
- [x] 7.13 Format Sanskrit shloks into couplets with logical grouping
- [x] 7.14 Implement dynamic chapter titles in Reader header
- [x] 7.15 Unify chapter-wise reading flow with premium ReaderScreen UI
## Phase 8: Design System Synchronization
- [x] 8.1 Define comprehensive typography scale and semantic colors in `tokens.ts`
- [x] 8.2 Refactor `AppText` to dynamically apply all typography variant properties
- [x] 8.3 Tokenize `VerseHeroCard` with semantic color and spacing tokens
- [x] 8.4 Audit and refactor `ReaderScreen` to remove hardcoded style values
- [x] 8.5 Synchronize all global components (Header, TabBar, Cards) with design system tokens
## Phase 9: Header Refinement
- [x] 9.1 Implement two-line header for chapter-wise screens (Chapter Number + Name)
- [x] 9.2 Standardize ScreenHeader component across all screens for consistency
- [x] 9.3 Remove legacy ShlokaCard and FeedScreen components
- [x] 9.4 Generate and integrate premium header images for Shuffle Shlok and Browse Chapters (160px height)
- [x] 9.5 Safe migration from App.js to App.tsx (Remove App.js, utilize App.tsx as entry point)
