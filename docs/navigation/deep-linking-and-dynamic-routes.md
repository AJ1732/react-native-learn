# Deep Linking & Dynamic Routes

Expo Router uses file-based routing identical to Next.js — the same `[param]` syntax, the same nested layouts, the same route groups. Every file in `app/` is automatically a deep-linkable route.

---

## Dynamic Routes

Works exactly like Next.js:

```
app/
  opportunities/
    [id].tsx          → /opportunities/123
    index.tsx         → /opportunities
  users/
    [userId]/
      index.tsx       → /users/456
      posts/
        [postId].tsx  → /users/456/posts/789
```

### Reading params

```tsx
// app/opportunities/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // id === "123"
}
```

### Catch-all routes

```
app/
  [...slug].tsx       → matches /a, /a/b, /a/b/c
```

```tsx
const { slug } = useLocalSearchParams<{ slug: string[] }>();
// slug === ["a", "b", "c"]
```

### Optional catch-all

```
app/
  [[...slug]].tsx     → matches /, /a, /a/b
```

---

## This Project's Dynamic Route

You already have one:

```
app/(tabs)/opportunities/detail/index.tsx
```

This uses a query param (`?id=123`) rather than a path segment. To convert it to a true dynamic route:

```
app/(tabs)/opportunities/[id].tsx   → /opportunities/123
```

Both approaches work — path segments are cleaner URLs, query params are simpler to implement with existing code.

---

## Deep Linking

Deep links open your app directly to a specific screen from outside — a browser, email, push notification, or another app.

### 1. Configure the scheme

```json
// app.json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

This enables `myapp://` URI scheme. Every route is now deep-linkable automatically:

| Route file | Deep link URL |
|---|---|
| `app/(tabs)/index.tsx` | `myapp://` |
| `app/(tabs)/opportunities/index.tsx` | `myapp://opportunities` |
| `app/(tabs)/opportunities/[id].tsx` | `myapp://opportunities/123` |
| `app/(tabs)/profile/index.tsx` | `myapp://profile` |

### 2. Test it

```bash
# iOS Simulator
npx uri-scheme open "myapp://opportunities/123" --ios

# Android Emulator
npx uri-scheme open "myapp://opportunities/123" --android
```

### 3. Read params from a deep link

No extra work — `useLocalSearchParams` reads them the same way:

```tsx
// User opens myapp://opportunities/123
const { id } = useLocalSearchParams<{ id: string }>();
// id === "123"
```

---

## Universal Links (HTTPS Deep Links)

Universal Links (iOS) / App Links (Android) let `https://myapp.com/opportunities/123` open the app instead of the browser.

### Setup

**iOS** — host an `apple-app-site-association` file at `https://myapp.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.myapp",
        "paths": ["*"]
      }
    ]
  }
}
```

**Android** — host `assetlinks.json` at `https://myapp.com/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourcompany.myapp",
    "sha256_cert_fingerprints": ["YOUR_SHA256"]
  }
}]
```

Then add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "https", "host": "myapp.com" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

---

## Auth Guard + Deep Links

The current auth guard redirects unauthenticated users to login but loses the intended destination. To preserve it:

```tsx
// app/(tabs)/_layout.tsx
import { useSegments, useRouter } from "expo-router";

const isAuth = useAuthStore((state) => state.isAuth);
const segments = useSegments();
const router = useRouter();

// After login, redirect to the originally intended route
if (!isAuth) {
  router.replace({
    pathname: "/(auth)/login",
    params: { redirect: segments.join("/") },
  });
}
```

```tsx
// app/(auth)/login/index.tsx — after successful login
const { redirect } = useLocalSearchParams<{ redirect?: string }>();
router.replace(redirect ? `/${redirect}` : "/(tabs)");
```

---

## Expo Router vs Next.js — Routing Differences

| Feature | Next.js | Expo Router |
|---|---|---|
| Dynamic segments | `[param]` | `[param]` ✅ same |
| Catch-all | `[...slug]` | `[...slug]` ✅ same |
| Optional catch-all | `[[...slug]]` | `[[...slug]]` ✅ same |
| Route groups | `(group)` | `(group)` ✅ same |
| Layouts | `layout.tsx` | `_layout.tsx` |
| Navigation | `<Link href>` | `<Link href>` ✅ same |
| Programmatic nav | `router.push()` | `router.push()` ✅ same |
| Params | `useSearchParams()` | `useLocalSearchParams()` |
| Deep linking | URL / HTTP | URI scheme + Universal Links |
