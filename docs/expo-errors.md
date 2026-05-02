# Expo / React Native Error Log — Krishna Uvaach

Project stack: **Expo SDK 54 · React Native 0.81.5 · React 19.1.0 · New Architecture enabled**

---

## Error 1 — TurboModule `installTurboModule` called with 1 argument (expected 0)

**Platform:** Android (mobile) — red screen crash at startup

**Error message:**
```
[runtime not ready]: Error: Exception in HostFunction:
TurboModule method "installTurboModule" called with 1 arguments
(expected argument count: 0).
Stack: NativeWorklets@...
```

### Root Cause
`react-native-reanimated` 4.x delegates worklet execution to a separate package, `react-native-worklets`. At JS startup, worklets call `installTurboModule()` on the native side to register themselves. The native side (compiled into the app / Expo Go) expects **0 arguments**, but the JS side was sending **1 argument**.

This mismatch happens because the **Babel plugin was never running**. The project had no `babel.config.js`, so `react-native-worklets/plugin` (which `react-native-reanimated/plugin` forwards to) never transformed the worklet functions at build time. Without the transformation, the initialisation code reaches the native layer with the wrong call signature.

A secondary cause on Expo Go specifically: Expo Go embeds a native `react-native-worklets` binary compiled at Expo SDK release time. If the npm-installed JS version of `react-native-worklets` (pulled in by `react-native-reanimated ~4.1.x`) differs from the compiled native version in Expo Go, the method signature is mismatched even with the correct Babel config.

### Solution

1. **Create `babel.config.js`** at the project root (the file was entirely missing):

   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'react-native-reanimated/plugin', // must be last
       ],
     };
   };
   ```

2. **Create `metro.config.js`** at the project root:

   ```js
   const { getDefaultConfig } = require('expo/metro-config');
   const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

   const config = getDefaultConfig(__dirname);
   module.exports = wrapWithReanimatedMetroConfig(config);
   ```

3. **Install `babel-preset-expo` as a direct dev dependency** (see Error 2 below).

4. **Clear Metro cache** and restart:

   ```bash
   npx expo start --clear
   ```

5. **If using Expo Go**: run `npx expo install react-native-reanimated` to let Expo pin the exact compatible version, or switch to a development build (`npx expo run:android`) which compiles the correct native binary.

---

## Error 2 — `babel-preset-expo` not resolvable

**Platform:** All — Babel compilation error when `babel.config.js` was created

**Error message:**
```
Cannot find module 'babel-preset-expo'
```

### Root Cause
`babel-preset-expo` was not a direct dependency of the project. It existed only as a nested dependency at:

```
node_modules/expo/node_modules/babel-preset-expo  (v54.0.10)
```

Node/Babel module resolution walks **up** the requiring file's directory tree — it does not reach into sibling packages' `node_modules`. So `babel-preset-expo` was invisible to Babel when referenced from the project root's `babel.config.js`.

This is unusual because `create-expo-app` normally adds `babel-preset-expo` to `devDependencies` at project creation time. It was missing from `package.json`, which means the project was bootstrapped without it.

### Solution
Install `babel-preset-expo` at the **same major version as the Expo SDK** being used:

```bash
npm install --save-dev babel-preset-expo@~54.0.10
```

The version must match the Expo SDK major (54 → `babel-preset-expo@54.x`). Installing a mismatched major (e.g. `55.x` when on Expo 54) can cause silent preset incompatibilities.

---

## Error 3 — Invalid hook call in `<Moti.View>` / `Cannot read properties of null (reading 'useContext')`

**Platform:** Web — app crashes immediately when `SplashScreen` or `ShlokaCard` render

**Error messages (browser console):**
```
Invalid hook call. Hooks can only be called inside of the body of a
function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app

Uncaught TypeError: Cannot read properties of null (reading 'useContext')

An error occurred in the <Moti.View> component.
```

### Root Cause
`moti` 0.30.0 was authored against:
- `react-native-reanimated: 3.11.0` (dev dependency)
- React 18.x

The project runs:
- `react-native-reanimated: ~4.1.1` (4.1.7 installed)
- `react: 19.1.0`

Two compounding issues:

1. **Reanimated 4.x restructured its internals** — the React context that moti relies on to read shared values and animation state changed shape between v3 and v4. On web, `useContext(ReanimatedContext)` returns `null` because the context provider is absent or renamed in v4.

2. **React 19 stricter hook enforcement** — React 19 made the "invalid hook call" detection stricter. When reanimated's web context returns `null`, the subsequent hook calls inside moti fail React 19's invariant checks, triggering the "Cannot read properties of null" crash.

### Solution
Removed `moti` entirely from the two files that imported it and replaced the animations with React Native's built-in `Animated` API, which has no external dependencies and works identically across Android, iOS, and web.

**`SplashScreen.tsx`** — replaced `MotiView` / `MotiText` with `Animated.View`:
```tsx
// Before
import { MotiView, MotiText } from 'moti';
<MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1000 }}>

// After
import { Animated } from 'react-native';
const opacity = useRef(new Animated.Value(0)).current;
Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
<Animated.View style={{ opacity }}>
```

**`ShlokaCard.tsx`** — replaced `MotiView` with `Animated.View`:
```tsx
// Before
<MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 800 }}>

// After
const cardOpacity = useRef(new Animated.Value(0)).current;
const cardScale   = useRef(new Animated.Value(0.9)).current;
Animated.parallel([
  Animated.timing(cardOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
  Animated.timing(cardScale,   { toValue: 1, duration: 800, useNativeDriver: true }),
]).start();
<Animated.View style={{ opacity: cardOpacity, transform: [{ scale: cardScale }] }}>
```

---

## Error 4 — `shadow*` style props deprecated warning (web)

**Platform:** Web — browser console warning (non-blocking)

**Warning message:**
```
"shadow*" style props are deprecated. Use "boxShadow".
```

### Root Cause
React Native's `shadow*` style props (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) are mobile-only. React Native Web maps them to a CSS `box-shadow` but logs a deprecation warning because the correct web-first approach is to use the `boxShadow` CSS property directly.

These appear in `SHADOWS` in `src/theme/tokens.ts`:
```ts
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 4,
```

### Solution (if web support is a priority)
Use platform-specific styles in `tokens.ts`:

```ts
import { Platform } from 'react-native';

export const SHADOWS = {
  sm: Platform.select({
    web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  // ...
};
```

**Current status:** Warning only — does not crash or affect functionality on mobile. Deferred.

---

## Error 5 — `COLORS.textSecondary` undefined (TypeScript + runtime)

**Platform:** All — TypeScript error, potential `undefined` colour at runtime

**Error:**
```
Property 'textSecondary' does not exist on type '{ primary: string; secondary: string; ... }'
```

### Root Cause
`ShlokaCard.tsx` referenced `COLORS.textSecondary` for the translation text colour, but `textSecondary` was never defined in `src/theme/tokens.ts`. The `COLORS` object had `textMuted` and `tertiary` but no `textSecondary`. This was likely a copy-paste oversight when the component was first authored.

### Solution
Added the missing token to `src/theme/tokens.ts`:

```ts
export const COLORS = {
  // ...existing colours...
  textSecondary: '#5C3D2E', // Medium warm brown
};
```

---

## Quick Reference — All Fixes Applied

| # | Error | File(s) changed | Action |
|---|-------|----------------|--------|
| 1 | TurboModule `installTurboModule` arg mismatch | `babel.config.js` (new), `metro.config.js` (new), `package.json` | Created babel + metro config; installed `babel-preset-expo@~54.0.10` |
| 2 | `babel-preset-expo` not resolvable | `package.json` | `npm install --save-dev babel-preset-expo@~54.0.10` |
| 3 | Invalid hook call in `Moti.View` | `SplashScreen.tsx`, `ShlokaCard.tsx` | Replaced `moti` with React Native `Animated` API |
| 4 | `shadow*` deprecated (web) | `tokens.ts` | Deferred; fix with `Platform.select` if web is a target |
| 5 | `COLORS.textSecondary` undefined | `tokens.ts` | Added `textSecondary: '#5C3D2E'` |

---

## Prevention Checklist for New Expo Projects

- [ ] Always scaffold with `create-expo-app` — it includes `babel.config.js` and `babel-preset-expo` by default
- [ ] After adding `react-native-reanimated`, verify `babel.config.js` has the plugin as the **last entry**
- [ ] Use `npx expo install <package>` (not `npm install`) for Expo-managed packages — it pins the exact SDK-compatible version
- [ ] Verify all token references exist before using them across components
- [ ] Test on web early if web is a target — moti, reanimated, and other animation libraries have varying web support
