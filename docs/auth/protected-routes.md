# Protected Routes in Expo Router

## Overview

Protected routes guard entire route groups at the layout level. A single guard
in a group's `_layout.tsx` covers every screen in that group — no per-screen
redirect logic needed.

---

## The Two-Part Pattern

### 1. Entry point — `app/index.tsx`

Runs once at app startup. Decides the initial route before any screen renders.

```tsx
// app/index.tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Index() {
  const isAuth = useAuthStore((state) => state.isAuth);
  return <Redirect href={isAuth ? "/(tabs)" : "/(auth)/login"} />;
}
```

### 2. Layout guards — `_layout.tsx` in each group

Stay mounted for the lifetime of the group. React to auth state changes and
redirect when the condition is no longer met.

```tsx
// app/(auth)/_layout.tsx — redirect out when user logs in
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AuthLayout() {
  const isAuth = useAuthStore((state) => state.isAuth);

  if (isAuth) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login/index" />
      <Stack.Screen name="signup/index" />
    </Stack>
  );
}
```

```tsx
// app/(tabs)/_layout.tsx — redirect out when session expires
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function TabsLayout() {
  const isAuth = useAuthStore((state) => state.isAuth);

  if (!isAuth) return <Redirect href="/(auth)/login" />;

  return <Tabs>{/* ... */}</Tabs>;
}
```

---

## How They Work Together

```
App opens
  └── app/index.tsx
        ├── isAuth = false → <Redirect href="/(auth)/login" />
        └── isAuth = true  → <Redirect href="/(tabs)" />

User on login screen, presses login
  └── useAuthStore: isAuth = false → true
        └── (auth)/_layout.tsx re-renders
              └── isAuth is true → <Redirect href="/(tabs)" />

Token expires mid-session
  └── useAuthStore: isAuth = true → false
        └── (tabs)/_layout.tsx re-renders
              └── isAuth is false → <Redirect href="/(auth)/login" />
```

---

## Why Layout Guards, Not Screen-Level Redirects

```tsx
// Incorrect — logic duplicated in every screen
export default function LoginScreen() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const router = useRouter();

  useEffect(() => {
    if (isAuth) router.replace("/(tabs)");
  }, [isAuth]);

  return <View>...</View>;
}
```

```tsx
// Correct — one guard covers all screens in the group
export default function AuthLayout() {
  const isAuth = useAuthStore((state) => state.isAuth);
  if (isAuth) return <Redirect href="/(tabs)" />;
  return <Stack />;
}
```

**Benefits of layout-level guards:**
- One guard covers every screen in the group automatically
- No `useEffect` + `router.push` timing issues — `<Redirect>` is declarative
- Adding new screens to the group (e.g. `forgot-password`) is automatically protected

---

## Why Not `useEffect` + `router.push` in Root Layout

```tsx
// Incorrect — navigator not mounted yet when useEffect fires
export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/login"); // Error: navigated before Root Layout mounted
  }, []);

  return <Stack />;
}
```

The root layout's `useEffect` fires during the layout's own render cycle, before
the Stack's children exist. Always use `<Redirect>` inside a screen or guard
inside a child layout instead.

---

## Race Condition: Splash Screen vs Token Rehydration

On app launch, `isAuth` defaults to `false` in the Zustand store. If the
splash screen hides before `initTokenStore()` finishes reading from SecureStore,
`app/index.tsx` redirects returning users to login — then immediately redirects
back to tabs once rehydration completes. This causes a visible flash.

**Incorrect (two uncoordinated effects):**

```ts
// app/_layout.tsx
useEffect(() => { SplashScreen.hideAsync(); }, []);   // hides immediately
useEffect(() => { initTokenStore(); }, []);            // rehydrates async
```

**Correct (splash hides only after rehydration):**

```ts
// app/_layout.tsx
useEffect(() => {
  initTokenStore().then(() => SplashScreen.hideAsync());
}, []);
```

The splash screen acts as a loading gate — by the time it hides, `isAuth` is
already set to its correct value and `app/index.tsx` routes directly to the
right screen with no flash.

---

## File Structure

```
app/
  index.tsx              ← entry point, initial redirect
  _layout.tsx            ← root layout, no navigation logic
  (auth)/
    _layout.tsx          ← guard: if isAuth → redirect to (tabs)
    login/index.tsx
    signup/index.tsx
  (tabs)/
    _layout.tsx          ← guard: if !isAuth → redirect to (auth)/login
    index.tsx
    ...
```
