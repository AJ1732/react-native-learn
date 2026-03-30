# App State

App State is React Native's API for detecting whether your app is in the foreground, background, or transitioning between the two. It is the mobile equivalent of browser `visibilitychange` events.

---

## The 3 States

| State | When |
|---|---|
| `active` | App is in the foreground — user is interacting |
| `background` | App is running but not visible — home screen or another app |
| `inactive` | Transitioning between states (iOS only — e.g. notification shade open, mid-app-switch) |

---

## Basic Usage

```ts
import { AppState, type AppStateStatus } from "react-native";

// Read current state synchronously
AppState.currentState; // "active" | "background" | "inactive"

// Listen for changes
const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
  if (nextState === "active") {
    // app came to foreground
  }
  if (nextState === "background") {
    // app went to background
  }
});

// Always remove the listener on cleanup
subscription.remove();
```

---

## How It's Used in This Project

Wired up once in `app/_layout.tsx` to tell TanStack Query when to refetch stale data:

```ts
// Defined outside the component — stable reference, no re-creation on render
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

// Inside RootLayout
useEffect(() => {
  const subscription = AppState.addEventListener("change", onAppStateChange);
  return () => subscription.remove();
}, []);
```

When the user returns to the app, `focusManager.setFocused(true)` triggers TanStack Query to refetch any queries marked as stale — keeping data fresh without manual intervention.

---

## Best Practices

**Define the handler outside the component.**
Defining it inside causes a new function reference on every render. Since `AppState.addEventListener` doesn't re-subscribe on reference changes, it doesn't cause bugs — but it's cleaner and avoids confusion.

```ts
// ✅ Outside component — stable, no closures over props/state needed
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

// ❌ Inside component — new reference on every render
export default function RootLayout() {
  const onAppStateChange = (status: AppStateStatus) => { ... }
}
```

**Always clean up the subscription.**
Not removing the listener causes a memory leak and may fire callbacks after the component unmounts.

```ts
useEffect(() => {
  const subscription = AppState.addEventListener("change", handler);
  return () => subscription.remove(); // ✅ cleanup
}, []);
```

**Guard against web.**
`AppState` works on iOS and Android. On web it behaves differently — guard with `Platform.OS !== "web"` if your project targets web.

**Wire it up once at the root.**
App State is global — one listener at the root layout is enough. Don't add listeners per-screen.

---

## Common Use Cases

| Use case | What to do |
|---|---|
| Refetch stale data on foreground | `focusManager.setFocused(status === "active")` (TanStack Query) |
| Pause/resume media playback | Pause on `background`, resume on `active` |
| Lock app after inactivity | Record timestamp on `background`, check elapsed time on `active` |
| Stop polling intervals | Clear interval on `background`, restart on `active` |
| Sync offline queue | Trigger flush on `active` (see offline-compatibility-plan.md) |

---

## React Native–Specific Notes

- There is no `"hidden"` state like the browser's `visibilitychange` — `"background"` is the equivalent.
- `"inactive"` is iOS-only and fires briefly during transitions. Don't rely on it for business logic.
- `AppState.currentState` is available synchronously at any time — no listener needed for one-off checks.
