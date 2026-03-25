# Offline Compatibility Plan

**Date:** 2026-03-25
**Status:** Complete (Phases 1–4 implemented)

---

## Overview

This document outlines the phased plan to make the app fully offline-compatible. The app currently has network detection and TanStack Query configured but is missing persistent cache, offline UI feedback, error boundaries, and mutation queuing.

All code in this plan follows the React Native skills guidelines:
- No `&&` with falsy values — use ternary or `!!` coercion
- Animate only `transform` and `opacity` (GPU properties) — no `height` animations
- Destructure functions early from hooks (stable references)
- Use `setState(prev => ...)` dispatcher when state depends on previous value
- Use `Pressable` not `TouchableOpacity`
- Use `undefined` + nullish coalescing for fallback state, not `useEffect` sync

---

## Phase 1 — Offline UI Feedback (High Priority)

**Goal:** Users know when they're offline and see meaningful errors.

### 1.1 — `useNetworkStatus` hook

**File:** `hooks/use-network-status.ts`

Expose network state reactively via `useSyncExternalStore` over `NetInfo`. Derive `isConnected` as a boolean — no extra state, no `useEffect`.

```ts
// hooks/use-network-status.ts
import NetInfo from '@react-native-community/netinfo'
import { useSyncExternalStore } from 'react'

let _isConnected = true

function subscribe(cb: () => void) {
  return NetInfo.addEventListener((state) => {
    _isConnected = state.isConnected ?? true
    cb()
  })
}

function getSnapshot() {
  return _isConnected
}

export function useNetworkStatus() {
  const isConnected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { isConnected }
}
```

**Why `useSyncExternalStore`:** Zero state, zero `useEffect`, tearing-safe. Network state is an external store — this is the correct React primitive for it.

---

### 1.2 — Offline Banner component

**File:** `components/atoms/offline-banner.tsx`

Animated banner that slides in/out using `translateY` + `opacity` (GPU-only, per `animation-gpu-properties` rule). No `height` animation.

```tsx
// components/atoms/offline-banner.tsx
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useNetworkStatus } from '@/hooks/use-network-status'

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isConnected ? -48 : 0) }],
    opacity: withTiming(isConnected ? 0 : 1),
  }))

  // Use ternary, not &&, to avoid falsy render crash (rendering-no-falsy-and)
  return (
    <Animated.View style={[styles.banner, animatedStyle]}>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  )
}
```

**Integration:** Add `<OfflineBanner />` in `app/_layout.tsx` inside `<QueryClientProvider>`, positioned absolutely at the top of the screen.

---

### 1.3 — Axios: distinguish network errors from HTTP errors

**File:** `lib/axios/index.ts`

In the response interceptor, check whether `error.response` is absent (network failure) vs present (server error). Throw a typed `NetworkError` so UI can render context-specific messages.

```ts
// In response interceptor
if (!error.response) {
  // Device is offline or server unreachable — not a 4xx/5xx
  throw Object.assign(new Error('No internet connection'), { isNetworkError: true })
}
// error.response exists → HTTP error (401, 500, etc.) — handled as before
```

Add `isNetworkError: boolean` to `types/domain/error.types.ts`.

---

## Phase 2 — Persistent Query Cache (High Priority)

**Goal:** Fetched data survives app restarts. Users see stale data instantly on reopen.

### 2.1 — Install dependencies

```bash
npx expo install @react-native-async-storage/async-storage
npm install @tanstack/react-query-persist-client @tanstack/async-storage-persister
```

### 2.2 — Create persister

**File:** `lib/query/persister.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/async-storage-persister'

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_CACHE',
  throttleTime: 1000,
})
```

### 2.3 — Wrap app with `PersistQueryClientProvider`

**File:** `app/_layout.tsx`

Replace `<QueryClientProvider>` with `<PersistQueryClientProvider>`:

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { asyncStoragePersister } from '@/lib/query/persister'

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24h
  }}
>
  {children}
</PersistQueryClientProvider>
```

### 2.4 — Increase `gcTime` in query client config

**File:** `lib/query/query-client.ts`

`gcTime` must be >= `maxAge` to prevent the cache from being evicted before the persister writes it.

```ts
gcTime: 1000 * 60 * 60 * 24, // 24h (was 5 min)
```

---

## Phase 3 — Error Boundaries on Data Screens (Medium Priority)

**Goal:** Every screen that fetches data has a retry fallback instead of crashing or showing blank content.

### 3.1 — Create `QueryErrorBoundary` component

**File:** `components/atoms/query-error-boundary.tsx`

Reusable React error boundary. Renders a fallback with a "Try again" `Pressable` (not `TouchableOpacity`, per `ui-pressable` rule) that resets the boundary.

```tsx
import { Pressable } from 'react-native'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class QueryErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  reset = () => {
    // Dispatcher pattern: setState with prev (react-state-dispatcher rule)
    this.setState((prev) => (prev.hasError ? { hasError: false } : prev))
  }

  render() {
    // Ternary not && (rendering-no-falsy-and rule)
    return this.state.hasError ? (
      <View style={styles.container}>
        <Text>Something went wrong.</Text>
        <Pressable onPress={this.reset}>
          <Text>Try again</Text>
        </Pressable>
      </View>
    ) : (
      this.props.children
    )
  }
}
```

### 3.2 — Wrap data screens

| Screen | File |
|---|---|
| Opportunities list | `app/(tabs)/opportunities/index.tsx` |
| Opportunity detail | `app/(tabs)/opportunities/[id].tsx` |
| Profile | `app/(tabs)/profile/index.tsx` |

Each screen wraps its data-dependent content in `<QueryErrorBoundary>`.

### 3.3 — Surface `isError` + `refetch` from query hooks

**Files:** `hooks/api/use-opportunities.ts`, `hooks/api/use-profile.ts`

Return `{ data, isLoading, isError, refetch }` from each hook so screens can show inline retry UI for soft failures (e.g., no data, but error boundary did not trigger).

---

## Phase 4 — Mutation Offline Queue (Medium Priority)

**Goal:** Mutations (e.g. profile update) don't silently fail when offline. They queue and flush automatically on reconnect.

### 4.1 — Create offline mutation queue store

**File:** `store/offline-queue.store.ts`

Use Zustand with AsyncStorage middleware for persistence across restarts.

```ts
interface QueuedMutation {
  id: string
  type: 'UPDATE_PROFILE' | string
  payload: unknown
  createdAt: number
}

// Actions: enqueue(mutation), dequeue(id), flush()
// flush() replays each mutation in order using the relevant API call
```

### 4.2 — Enqueue when offline, execute when online

**File:** `hooks/api/use-update-profile.ts`

```ts
const { isConnected } = useNetworkStatus()
// Destructure flush from store early (react-compiler-destructure-functions rule)
const { enqueue } = useOfflineQueue()

const handleSubmit = (payload: UpdateProfilePayload) => {
  if (!isConnected) {
    enqueue({ type: 'UPDATE_PROFILE', payload })
    // Show "Saved offline, will sync when connected" toast
    return
  }
  mutate(payload)
}
```

### 4.3 — Flush queue on reconnect

**File:** `app/_layout.tsx`

In the existing `NetInfo.addEventListener` callback, call `offlineQueue.flush()` when `isConnected` becomes `true`:

```ts
NetInfo.addEventListener((state) => {
  const online = state.isConnected ?? false
  onlineManager.setOnline(online)
  if (online) offlineQueue.flush()
})
```

---

## File Change Summary

| File | Action | Phase |
|---|---|---|
| `hooks/use-network-status.ts` | New | 1 |
| `components/atoms/offline-banner.tsx` | New | 1 |
| `lib/axios/index.ts` | Update | 1 |
| `types/domain/error.types.ts` | Update | 1 |
| `lib/query/persister.ts` | New | 2 |
| `lib/query/query-client.ts` | Update (`gcTime`) | 2 |
| `app/_layout.tsx` | Update (PersistQueryClientProvider, banner, flush) | 2, 4 |
| `components/atoms/query-error-boundary.tsx` | New | 3 |
| `app/(tabs)/opportunities/index.tsx` | Update | 3 |
| `app/(tabs)/opportunities/[id].tsx` | Update | 3 |
| `app/(tabs)/profile/index.tsx` | Update | 3 |
| `store/offline-queue.store.ts` | New | 4 |
| `hooks/api/use-update-profile.ts` | Update | 4 |

---

## Implementation Order

```
Phase 1 (UI feedback) → Phase 2 (persistent cache) → Phase 3 (error boundaries) → Phase 4 (mutation queue)
```

Each phase ships independently. Phases 1 + 2 deliver the highest user-visible value.
