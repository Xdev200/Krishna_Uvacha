# Krishna Uvacha — Code Review

**Reviewed:** 2026-05-02  
**Branch:** feature/revamp  
**Scope:** Full codebase audit — DRY, KISS, reusability, architecture, gaps, and dead code

---

## Summary

The codebase is clean and well-structured for an early-stage app. Theme tokens are centralized, components are composable, and the service layer is correctly separated. The issues below are not blockers — they are the natural accumulation that happens once initial screens are working and you haven't done a second pass yet.

**Priority legend:** 🔴 High impact · 🟡 Medium · 🟢 Low / polish

---

## 1. DRY Violations

### 🔴 N+1 SQLite queries for bookmark state
**File:** [ReaderScreen.tsx:147–150](../src/screens/ReaderScreen.tsx#L147)

```typescript
// ❌ Current: fires one DB query per verse on mount
initialVerses.forEach(async (v) => {
  const bookmarked = await dbService.isBookmarked(v.id);
  setBookmarks(prev => ({ ...prev, [v.id]: bookmarked }));
});
```

With 100 verses loaded in shuffle mode, this fires 100 concurrent SQLite calls, each triggering `init()` before the previous one completes (race condition — see §4).

```typescript
// ✅ Fix: one query, build map client-side
const bookmarkIds = await dbService.getBookmarks();
const map = Object.fromEntries(bookmarkIds.map(id => [id, true]));
setBookmarks(map);
```

---

### 🔴 Verse list item duplicated across two screens
**Files:** [BookmarksScreen.tsx:63–74](../src/screens/BookmarksScreen.tsx#L63) · [ChapterBrowserScreen.tsx:47–58](../src/screens/ChapterBrowserScreen.tsx#L47)

Both screens render identical markup and near-identical styles:

```
AppText "CH X • VERSE Y"   ← variant="label", color=tertiary
AppText {translation}       ← variant="body", numberOfLines={2}
TouchableOpacity container  ← surface bg, ROUNDNESS.lg, border, md padding
```

**Fix:** Extract to `src/components/cards/VerseListItem.tsx`:
```typescript
interface VerseListItemProps {
  verse: Verse;
  onPress: () => void;
}
```

---

### 🟡 Hardcoded streak value "7" in three places
**Files:**  
- [HomeScreen.tsx:39](../src/screens/HomeScreen.tsx#L39) — `streakCount={7}`  
- [ReaderScreen.tsx:207](../src/screens/ReaderScreen.tsx#L207) — hardcoded `7` in JSX  
- [ScreenHeader.tsx:26](../src/components/layout/ScreenHeader.tsx#L26) — default `streakCount = 7`

The `history` table exists in SQLite — streak could be calculated from `last_read_at` dates. At minimum, the constant should live in one place.

---

### 🟡 `HEADER_HEIGHT` / `TAB_BAR_HEIGHT` re-declared in ReaderScreen
**File:** [ReaderScreen.tsx:25–26](../src/screens/ReaderScreen.tsx#L25)

```typescript
const HEADER_HEIGHT = 60;   // duplicates LAYOUT.headerHeight
const TAB_BAR_HEIGHT = 80;  // duplicates LAYOUT.tabBarHeight
```

`LAYOUT` is exported from `tokens.ts` but never imported by any screen. Both constants are unused in ReaderScreen's logic anyway (only `listHeight` derived from `onLayout` is used).

**Fix:** Delete the local constants. Import `LAYOUT` where needed.

---

### 🟡 `paddingBottom: 100` magic number duplicated
**Files:** [HomeScreen.tsx:81](../src/screens/HomeScreen.tsx#L81) · [ReaderScreen.tsx:305](../src/screens/ReaderScreen.tsx#L305)

`ReaderScreen`'s instance is inside a dead `styles.scrollContent` block that's never applied (the `ScrollView` inside `VerseItem` uses `verseItemContent`, not `scrollContent`). The `HomeScreen` value is active but undocumented.

**Fix:** Use `LAYOUT.tabBarHeight + SPACING.xl` and delete the dead style in ReaderScreen.

---

### 🟡 `if (!this.db) await this.init()` repeated 6 times
**File:** [dbService.ts:39,47,55,63,71,80](../src/services/dbService.ts#L39)

Every public method repeats this guard. Extract to a private helper:

```typescript
private async getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!this.db) await this.init();
  return this.db!;
}
```

---

### 🟡 `getChapterName` called twice with same args in ReaderScreen
**File:** [ReaderScreen.tsx:117,182](../src/screens/ReaderScreen.tsx#L117)

```typescript
const headerTitle = chapter ? getChapterName(chapter) : "Krishna Uvacha";  // computed
// ...then later:
subtitle={chapter ? getChapterName(chapter) : undefined}  // computed again
```

Store in a variable once: `const chapterName = chapter ? getChapterName(chapter) : undefined;`

---

## 2. KISS — Unnecessary Complexity

### 🔴 `useGita` hook is a passthrough wrapper that adds no value
**File:** [useGita.ts:8–40](../src/hooks/useGita.ts#L8)

The hook wraps every `gitaService` method in a `useCallback` with no deps (`[]`). The `loading` state is declared but never set to `true` for any operation. This indirection makes callers write `const { getVersesByChapter } = useGita()` instead of `gitaService.getVersesByChapter()` with no benefit.

The hook is worth keeping **only** if it ever becomes async (e.g., lazy-loaded data). For now:

- `getRandomVerses` (the only logic added here) should move into `gitaService`
- Screens can call `gitaService` directly, or keep the hook but remove `loading` noise

---

### 🟡 `BookmarksScreen` builds its own header instead of using `ScreenHeader`
**File:** [BookmarksScreen.tsx:41–50](../src/screens/BookmarksScreen.tsx#L41)

Every other screen uses `<ScreenHeader>`. BookmarksScreen manually builds a `View` with `TouchableOpacity` + spacer. It also doesn't get a `BottomTabBar`, so the user is stranded — they can only leave via the back button.

**Fix:**
1. Replace manual header with `<ScreenHeader title="Bookmarks" onBack={...} />`
2. Add `<BottomTabBar active="Saved" />` (same as the other screens)
3. Switch `navigation` prop to `useNavigation()` hook (consistent pattern)

---

### 🟡 `VerseHeroCard` line-spacing logic is hard to follow
**File:** [VerseHeroCard.tsx:33–49](../src/components/common/VerseHeroCard.tsx#L33)

The `hasExtraMargin` condition:
```typescript
const hasExtraMargin = isSpeaker || (hasSpeaker ? (index > 0 && index % 2 === 0) : index % 2 === 1);
```

This encodes couplet-rhythm spacing in an implicit way. The intent is good but the logic is tricky to read. Extract to a named function: `shouldAddCoupletBreak(lines, index)`.

---

### 🟢 `clearAll` is a stub that does nothing
**File:** [BookmarksScreen.tsx:34–36](../src/screens/BookmarksScreen.tsx#L34)

```typescript
const clearAll = async () => {
  // Logic to clear all bookmarks could go here
};
```

The function is declared and not called anywhere. Either implement it or delete it.

---

### 🟢 `cornerIconContainer` renders an invisible decorative circle
**File:** [HomeActionCard.tsx:146–158](../src/components/cards/HomeActionCard.tsx#L146)

`opacity: 0.05` on a `borderColor: COLORS.text` circle, positioned offscreen (`bottom: -15, right: -15`). Visually this does nothing detectable. Either make it visible enough to matter or remove it.

---

## 3. Reusability Gaps

### 🔴 No typed navigation — `any` used everywhere
**Files:** All screens and BottomTabBar

```typescript
const navigation = useNavigation<any>();  // 4 places
navigation: any  // BookmarksScreen prop
params?: any     // BottomTabBar TabConfig
```

**Fix:** Define once in `src/types/navigation.ts`:

```typescript
export type RootStackParamList = {
  Home: undefined;
  Chapters: undefined;
  Bookmarks: undefined;
  Reader: { verseId?: string; isShuffle?: boolean; chapter?: number };
};
```

Then use:
```typescript
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
```

---

### 🟡 `VerseListItem` — extract shared card UI (see §1 DRY)

---

### 🟡 Search bar is inline in `ChapterBrowserScreen`
**File:** [ChapterBrowserScreen.tsx:30–41](../src/screens/ChapterBrowserScreen.tsx#L30)

If search is ever added to another screen (history search, bookmark search), this would be duplicated. Candidate for `src/components/common/SearchBar.tsx` with `value`, `onChangeText`, `placeholder` props.

---

### 🟢 `EmptyState` component
**File:** [BookmarksScreen.tsx:53–57](../src/screens/BookmarksScreen.tsx#L53)

A centered message for empty lists is a repeated UI pattern. A simple `EmptyState` component taking `message` and optional `icon` would cover this and future empty states (history, search no-results).

---

## 4. Architecture & Bug Risks

### 🔴 `dbService.init()` has a race condition
**File:** [dbService.ts:20–35](../src/services/dbService.ts#L20)

When `isBookmarked` is called 100× concurrently (from the N+1 forEach), every call hits `if (!this.db) await this.init()` before any call completes. The DB opens multiple times. Fix: cache a single init promise:

```typescript
private initPromise: Promise<void> | null = null;

private async getDb() {
  if (!this.db) {
    if (!this.initPromise) this.initPromise = this.init();
    await this.initPromise;
  }
  return this.db!;
}
```

---

### 🔴 `route.params` destructured without null guard
**File:** [ReaderScreen.tsx:105](../src/screens/ReaderScreen.tsx#L105)

```typescript
const { verseId, isShuffle, chapter } = route.params;
```

If `Reader` is navigated to without params (e.g., from BottomTabBar's Feed tab with `params: { isShuffle: true }` — this is fine, but if future code navigates without params), this throws. Safe pattern:

```typescript
const { verseId, isShuffle, chapter } = route.params ?? {};
```

---

### 🟡 `App.js` is not TypeScript
**File:** [App.js](../App.js)

All other source files are `.tsx`. `App.js` bypasses TypeScript checks for the root component (navigation container setup, font loading logic). Rename to `App.tsx`.

---

### 🟡 `SplashScreen` Animated.loop is never stopped on unmount
**File:** [SplashScreen.tsx:26–30](../src/screens/SplashScreen.tsx#L26)

```typescript
Animated.loop(
  Animated.timing(spinValue, { ... })
).start();
```

The returned `AnimatedCompositeAnimation` reference is discarded. When `onFinish()` is called and the component unmounts, the loop has no `.stop()` call. Add:

```typescript
const spinLoop = Animated.loop(...);
spinLoop.start();
return () => { clearTimeout(timer); spinLoop.stop(); };
```

---

### 🟡 `BookmarksScreen` uses `navigation` prop; all others use hook
**File:** [BookmarksScreen.tsx:15](../src/screens/BookmarksScreen.tsx#L15)

Inconsistent pattern. The prop-based approach is fine with React Navigation but means `BookmarksScreen` can't be used as a standalone component. Standardise on `useNavigation()`.

---

### 🟢 `getChapterName` is O(1) map lookup recreated on every call
**File:** [gitaService.ts:50–71](../src/services/gitaService.ts#L50)

The `Record<number, string>` is re-created inside the function on every invocation. Move it to a module-level constant.

---

## 5. Dead Code & Unused Imports

| File | Dead item | Line |
|------|-----------|------|
| [ReaderScreen.tsx](../src/screens/ReaderScreen.tsx#L9) | `Platform` import | 9 |
| [ReaderScreen.tsx](../src/screens/ReaderScreen.tsx#L14) | `ChevronLeft` import | 14 |
| [ReaderScreen.tsx](../src/screens/ReaderScreen.tsx#L20) | `useVerse` import | 20 |
| [ReaderScreen.tsx](../src/screens/ReaderScreen.tsx#L256) | `styles.header`, `styles.backBtn`, `styles.headerTitle`, `styles.scroll`, `styles.scrollContent`, `styles.langLabel`, `styles.streakText` — defined, never applied | 256–308 |
| [useGita.ts](../src/hooks/useGita.ts#L45) | `useVerse` hook — exported but never imported | 45–60 |
| [gitaService.ts](../src/services/gitaService.ts#L45) | `getChapters()` — never called (screens use `Array.from({ length: 18 })`) | 45–48 |
| [gitaService.ts](../src/services/gitaService.ts#L74) | `getRandomVerse()` — superseded by `getRandomVerses` in hook | 74–77 |
| [dbService.ts](../src/services/dbService.ts#L5) | `Bookmark` and `ReadingHistory` interfaces — exported but never imported | 5–14 |
| [ChapterBrowserScreen.tsx](../src/screens/ChapterBrowserScreen.tsx#L99) | `styles.header`, `styles.backButton` — old header styles, replaced by `ScreenHeader` | 99–107 |
| [tokens.ts](../src/theme/tokens.ts#L45) | `LAYOUT` — exported but never imported | 45–51 |
| `package.json` | `moti` — installed but zero imports anywhere | — |

---

## 6. TypeScript Quality

| Issue | Location |
|-------|----------|
| `navigation: any` | All screens + BottomTabBar |
| `params?: any` in TabConfig | [BottomTabBar.tsx:14](../src/components/layout/BottomTabBar.tsx#L14) |
| `headerImage?: any` | [HomeActionCard.tsx:14](../src/components/cards/HomeActionCard.tsx#L14) |
| `route` typed inline instead of `RouteProp` | [ReaderScreen.tsx:28–36](../src/screens/ReaderScreen.tsx#L28) |
| `onMomentumScrollEnd` typed as `(event: any)` | [ReaderScreen.tsx:171](../src/screens/ReaderScreen.tsx#L171) |

---

## 7. Features Implemented but Not Surfaced

These are built in the data/services layer but invisible in the UI:

| Feature | Where it exists | Missing UI |
|---------|----------------|------------|
| Reading history | `dbService.addToHistory` + `history` table | No history screen |
| Streak calculation | Daily `last_read_at` data available | Streak hardcoded to 7 |
| Word meanings | `verse.word_meanings` field in every verse | Never rendered |
| Transliteration | `verse.transliteration` field + `VerseHeroCard` prop | Commented out at [ReaderScreen.tsx:63](../src/screens/ReaderScreen.tsx#L63) |
| Speaker attribution | `verse.speaker` field | Only inferred via `उवाच` detection |
| Clear all bookmarks | `clearAll` stub | Function body empty |

---

## 8. Quick Wins (Low effort, high payoff)

1. **Fix N+1 bookmarks** — 3-line change, eliminates 97 redundant DB queries per Reader load
2. **Add `BottomTabBar` to `BookmarksScreen`** — 1 line, fixes navigation dead-end
3. **Replace `BookmarksScreen` manual header with `<ScreenHeader>`** — 10-line change
4. **Delete 8 dead style blocks in `ReaderScreen`** — pure cleanup
5. **Remove unused imports** (`Platform`, `ChevronLeft`, `useVerse` in ReaderScreen)
6. **Extract `chapterName` variable** — avoids calling `getChapterName` twice
7. **Move chapter names map** out of `getChapterName` function body
8. **Remove `moti` from package.json** — ~60KB from bundle

---

## Recommended Extraction Order

If refactoring incrementally, do these in order (each builds on the previous):

1. `src/types/navigation.ts` — typed navigation, unblocks type-safe `navigate()` everywhere
2. `src/components/cards/VerseListItem.tsx` — eliminates BookmarksScreen + ChapterBrowser duplication
3. Fix N+1 bookmark loading in `ReaderScreen`
4. Fix `dbService` race condition
5. Add `BottomTabBar` + `ScreenHeader` to `BookmarksScreen`
6. Implement streak from history data
