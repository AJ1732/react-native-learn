# React Native Learning Project

A hands-on React Native app built while transitioning from a React/Next.js background.
The goal is not just to ship a working app, but to deeply understand how React Native
differs from web — and why.

---

## Background

Coming from React and Next.js, the mental model shifts in React Native are non-trivial:

| Web (React/Next.js) | React Native |
|---|---|
| `<div>`, `<p>`, `<input>` | `<View>`, `<Text>`, `<TextInput>` |
| CSS / Tailwind classes | NativeWind (Tailwind → StyleSheet) |
| `react-router` / file-based routing (Next.js) | Expo Router (file-based, same concept) |
| `localStorage` / `sessionStorage` | `AsyncStorage` / `SecureStore` |
| Browser form refs (uncontrolled inputs) | React Hook Form `Controller` (no DOM refs) |
| `overflow: scroll` in CSS | `<ScrollView>` component |
| Safe area = browser handles it | `SafeAreaView` with manual `edges` control |
| Global CSS variables | `constants/` + NativeWind theme tokens |
| `useContext` is common for global state | Zustand preferred (works outside React too) |

---

## Stack

**Client**
- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing
- [NativeWind](https://www.nativewind.dev/) — Tailwind CSS for React Native
- [Zustand](https://zustand-demo.pmnd.rs/) — global client state (auth)
- [TanStack Query](https://tanstack.com/query) — server state, caching, loading/error
- [Axios](https://axios-http.com/) — HTTP client with interceptors for silent token refresh
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form validation
- [CVA](https://cva.style/) + [clsx](https://github.com/lukeed/clsx) — component variant design system

**Backend**
- Node.js / Express — BFF (Backend for Frontend), owns business logic and auth
- Supabase — PostgreSQL database + Auth (user records, refresh token storage)

> The Express layer sits between the client and Supabase. The app never talks
> to Supabase directly — the API shapes all responses for the mobile client.

---

## Project Structure

```
app/
  index.tsx              # Entry point — redirects based on auth state
  _layout.tsx            # Root Stack (formSheet modals registered here)
  (auth)/                # Auth screens — login, signup
  (tabs)/                # Main app tabs — opportunities, profile
  modal/                 # FormSheet modal (root Stack child, not tabs child)

components/
  atoms/                 # Design system — Button, Text, TextInput, Link, FormField
  svgs/                  # Icon + illustration components

lib/
  axios/                 # Axios instance, interceptors, token store, silent refresh
  query/                 # TanStack Query client config
  stores/                # Zustand stores (auth-store)

hooks/api/               # React Query mutation/query hooks (useLogin, useSignup, etc.)
services/                # Axios service functions — one file per domain
types/domain/            # TypeScript types for API contracts
constants/               # Theme tokens, API endpoints
docs/                    # Architecture decisions and patterns (see below)
```

---

## Key Patterns Learned

### Auth Flow
JWT access token (short-lived, in memory) + refresh token (long-lived, SecureStore).
Silent refresh queue prevents multiple concurrent token refreshes.
→ See [`docs/auth-flow.md`](./docs/auth-flow.md)

### Protected Routes
`app/index.tsx` handles the initial redirect. Layout files (`_layout.tsx`) act as
reactive guards — Zustand state changes trigger re-renders and redirect automatically.
→ See [`docs/protected-routes.md`](./docs/protected-routes.md)

### State Management
Zustand for auth/client state. React Query for server state. They don't overlap.
Zustand's `getState()` works outside React (used in Axios interceptors).
→ See [`docs/state-management.md`](./docs/state-management.md)

### Forms
React Hook Form requires `Controller` in React Native (no DOM refs).
Reusable `FormField` component wraps `Controller` + error display into one line per field.
→ See [`docs/react-hook-form.md`](./docs/react-hook-form.md)

### Safe Area
`SafeAreaView` with `edges={["top"]}` inside tab screens — the tab bar handles
its own bottom inset, so applying `"bottom"` causes a visible double gap.
→ See [`docs/safe-area.md`](./docs/safe-area.md)

### Axios Service Layer
Services return typed Axios promises. Hooks wrap them with React Query.
This keeps network logic out of components entirely.
→ See [`docs/axios-service-layer.md`](./docs/axios-service-layer.md)

---

## Running the App

```bash
npm install
npx expo start
```

Open in iOS Simulator, Android Emulator, or Expo Go.
