# React Native Concepts Progress

Track of mobile development concepts explored in this project.

## Covered

- **FlashList** — performant list rendering via `@shopify/flash-list`
- **Skeleton loading** — UX placeholders while data fetches
- **Auth guard** — protected routes with splash screen / token rehydration race condition fix
- **Reanimated** — layout animations, spring physics, `useSharedValue`, `useDerivedValue`, `useAnimatedStyle`
- **React Query** — data fetching, offline compatibility, pull-to-refresh
- **Design system** — NativeWind + CVA atoms: `Button`, `Text`, `Switch`, `Accordion`, `Skeleton`, `TextInput`, `Link`
- **Safe area handling** — `react-native-safe-area-context`
- **Modal pages** — Expo Router modal navigation
- **Image handling** — `expo-image` with transitions and cache
- **Forms** — login, signup, edit profile with `react-hook-form`
- **Secure storage** — `expo-secure-store` for auth tokens in device keychain, with silent refresh on startup
- **Haptics** — `expo-haptics` via `lib/haptics.ts` utility; applied on `Button` (impact) and `Switch` (selection)
- **App state** — `AppState` wired in `_layout.tsx` to refetch TanStack Query data when app foregrounds
- **Camera / media picker** — `expo-image-picker` in `components/ui/form-image-picker.tsx`; action sheet → permission → crop → upload pattern
- **Native context menus** — `zeego` on `OpportunityCard`; long-press reveals Save, Share, Report

## Not Yet Explored

| Area | Packages | Notes |
|---|---|---|
| **Gestures** | `react-native-gesture-handler` + Reanimated | Swipe-to-delete, drag-to-reorder — highest impact next step |
| **Native navigators** | Expo Router native stack/tabs | Significant perf improvement over JS navigators |
| **Push notifications** | `expo-notifications` | Permissions, foreground + background handlers |
| **Deep linking** | Expo Router | URL schemes + universal links — see `docs/navigation/` |
| **Background tasks** | `expo-background-fetch`, `expo-task-manager` | Periodic sync, background work |

## Recommended Next: Gestures

Animations are solid — gestures are the natural next layer and combine directly with Reanimated. Start with swipe-to-delete on a list item using `Gesture.Pan()` + `useAnimatedStyle`.
