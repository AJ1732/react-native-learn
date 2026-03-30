# State Management in React Native

## Decision Guide

| State type | Solution |
|---|---|
| Server data (fetch, cache, sync) | TanStack Query |
| Global app state (auth, user, settings) | Zustand |
| Local UI state (modals open, form values) | `useState` |
| Derived values | Compute inline, never store |

---

## Zustand

Zustand is the recommended solution for global client state. It uses
selector-based subscriptions — components only re-render when the specific
slice they subscribe to changes, unlike `useContext` which re-renders all
consumers on any change.

### Creating a store

```ts
// lib/stores/auth-store.ts
import { create } from "zustand";

type AuthStore = {
  isAuth: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuth: false,

  login: (token) => {
    tokenStore.set(token);
    set({ isAuth: true });
  },

  logout: () => {
    tokenStore.clear();
    set({ isAuth: false });
  },
}));
```

### Consuming in a component

Always select only the slice you need — this prevents unnecessary re-renders:

```tsx
// Correct — component only re-renders when isAuth changes
const isAuth = useAuthStore((state) => state.isAuth);

// Incorrect — component re-renders on any store change
const store = useAuthStore();
```

### Reading state outside React

Zustand stores can be read and written outside of components. This is
critical for the axios interceptor pattern used in this project:

```ts
// In axios interceptor or any non-component file
useAuthStore.setState({ isAuth: false }); // write
useAuthStore.getState().isAuth;           // read
```

This is why Zustand was chosen over `useContext` — the token store and auth
store can stay in sync without React being involved.

---

## Auth Store + Token Store Integration

The auth store and axios token store are kept in sync:

- **`login(token)`** — sets the in-memory token, persists to SecureStore, sets `isAuth: true`
- **`logout()`** — clears token from memory and SecureStore, sets `isAuth: false`
- **`initTokenStore()`** — called at app startup, rehydrates token from SecureStore and syncs `isAuth: true` if a token exists

```
App starts
  └── initTokenStore()
        ├── reads SecureStore
        ├── sets _token (in-memory)
        └── useAuthStore.setState({ isAuth: true })  ← triggers redirect to (tabs)
```

---

## Auth Redirect Pattern

Never navigate in `useEffect` from the root layout — the navigator isn't
mounted yet. Use `<Redirect>` inside a screen file instead:

```tsx
// app/index.tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Index() {
  const isAuth = useAuthStore((state) => state.isAuth);

  return <Redirect href={isAuth ? "/(tabs)" : "/(auth)/login"} />;
}
```

When `isAuth` changes (e.g. after login), the component re-renders and
`<Redirect>` navigates automatically.

---

## `useContext` vs Zustand

`useContext` is available in React Native — it's a React API, not web-specific.
But for global state it has a key drawback:

```tsx
// Every consumer re-renders when ANY value in the context changes
const { isAuth, user, settings } = useAuthContext();
```

Zustand selectors eliminate this:

```tsx
// Only re-renders when isAuth changes, even if user or settings change
const isAuth = useAuthStore((state) => state.isAuth);
```

Use `useContext` when state is scoped to a subtree and changes infrequently
(e.g. theme, locale).

---

## File Conventions

```
lib/
  stores/
    auth-store.ts      ← auth session state
    <feature>-store.ts ← other global state slices
```

One store per domain concern. Keep stores small and focused.
