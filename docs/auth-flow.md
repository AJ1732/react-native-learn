# Auth Flow & Refresh Token Strategy

## Token Types

| Token | Lifespan | Stored in | Sent via |
|---|---|---|---|
| `access_token` | Short (minutes/hours) | Memory + SecureStore | `Authorization: Bearer` header |
| `refresh_token` | Long (days/weeks) | SecureStore | Request body only |

The access token authenticates every API request. The refresh token's only job
is to exchange for a new access token when the current one expires.

---

## Login Response Shape

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "..." },
    "access_token": "eyJ...",
    "refresh_token": "xmpefg3vkfyd",
    "expires_at": 1773613805
  }
}
```

Both tokens are stored on login:
- `access_token` → in-memory (`_accessToken`) + SecureStore
- `refresh_token` → SecureStore only (never held in memory beyond the store call)

---

## How the Backend Uses the Refresh Token

The backend doesn't know about the client's queue or retry logic — it only
sees one thing: a POST to `/auth/refresh` with a `refresh_token` in the body.

```
POST /auth/refresh
Body: { "refresh_token": "xmpefg3vkfyd" }
Authorization: (none — this is an unauthenticated endpoint)
```

The backend:
1. Looks up the `refresh_token` in its database/session store
2. Verifies it hasn't expired and hasn't been revoked
3. Verifies it belongs to a valid user
4. Issues a new `access_token` and a new `refresh_token` (rotation)
5. Invalidates the old `refresh_token` so it can't be reused

This is called **refresh token rotation** — each refresh produces a new pair
of tokens. If an old refresh token is ever used again, the backend treats it
as a breach and revokes the entire session.

**Why not send the expired access token in the header?**
The refresh endpoint is unauthenticated — the expired access token would fail
validation anyway. The refresh token in the body is the credential, not the
access token.

---

## Silent Refresh + Request Queue

Without a queue, if 3 requests fire simultaneously when the token expires:
- All 3 get a 401
- All 3 attempt a refresh independently
- Each refresh invalidates the previous one (token rotation)
- 2 of the 3 refreshes fail → user gets logged out unexpectedly

With the queue:

```
Token expires. Requests A, B, C fire simultaneously → all get 401.

A → isRefreshing = false → starts refresh → isRefreshing = true
B → isRefreshing = true  → joins queue, waits
C → isRefreshing = true  → joins queue, waits

Refresh succeeds → new access_token + refresh_token stored
  → processQueue(null, newToken)
      → B retries with new token ✓
      → C retries with new token ✓
  → A retries with new token ✓
  → isRefreshing = false

Refresh fails
  → processQueue(error, null)
      → B rejects ✗
      → C rejects ✗
  → A rejects ✗
  → tokenStore.clear()
  → useAuthStore: isAuth = false
  → (tabs)/_layout.tsx guard redirects to login
```

Only **one** refresh request ever hits the backend regardless of how many
requests were in-flight.

---

## The `_retry` Flag

```ts
if (error.response?.status !== 401 || originalRequest._retry) {
  return Promise.reject(error);
}
originalRequest._retry = true;
```

Prevents an infinite loop. After the token is refreshed and the original
request is retried, if that retry itself returns a 401 (e.g. the account was
deleted mid-session), `_retry = true` stops the interceptor from attempting
another refresh.

---

## User Persistence

The authenticated user object (`{ id, email }`) is persisted in SecureStore
alongside tokens so it survives app restarts.

```ts
// On login/signup — all three written together
tokenStore.set(accessToken, refreshToken, user);
// SecureStore keys: auth_access_token, auth_refresh_token, auth_user (JSON)

// On logout — all three cleared together
tokenStore.clear();
// useAuthStore: { isAuth: false, user: null }
```

**Why SecureStore and not AsyncStorage?**
User identity (`id`, `email`) is sensitive — SecureStore encrypts the data
at rest (Keychain on iOS, Keystore on Android). AsyncStorage is plaintext.

---

## Token + User Rehydration on App Startup

```ts
// lib/axios/token-store.ts — initTokenStore()
const [accessToken, refreshToken, userJson] = await Promise.all([
  SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  SecureStore.getItemAsync(USER_KEY),
]);

if (accessToken) {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  const user = userJson ? JSON.parse(userJson) : null;
  useAuthStore.setState({ isAuth: true, user });
}
```

`Promise.all` reads all three in parallel at startup. If an access token
exists, the user is considered authenticated and both `isAuth` and `user`
are restored — no re-login required.

---

## Startup Race Condition: Splash Screen vs Rehydration

`isAuth` starts as `false`. If `SplashScreen.hideAsync()` fires before
`initTokenStore()` resolves, `app/index.tsx` sees `isAuth = false` and
redirects returning users to login — causing a flash before the correct
redirect to tabs.

**Fix:** tie the splash screen hide to the completion of `initTokenStore`:

```ts
// app/_layout.tsx
useEffect(() => {
  initTokenStore().then(() => SplashScreen.hideAsync());
}, []);
```

The splash screen acts as a loading gate. Auth state is correct before any
screen renders.

---

## Full Token Lifecycle

```
App install
  └── No tokens → index.tsx → /(auth)/login

Login
  └── POST /auth/login → { access_token, refresh_token }
        └── tokenStore.set(both) → useAuthStore: isAuth = true
              └── (auth)/_layout.tsx guard → /(tabs)

App restart
  └── initTokenStore() → reads SecureStore (tokens + user JSON)
        ├── tokens found → isAuth = true, user restored → /(tabs)
        └── no tokens    → isAuth = false, user = null  → /(auth)/login

API request with expired access_token
  └── 401 received
        └── interceptor: refresh token exists?
              ├── YES → POST /auth/refresh (no auth header, token in body)
              │          ├── success → store new tokens, retry request
              │          └── fail    → clear tokens, isAuth = false → login
              └── NO  → clear tokens, isAuth = false → login

Logout
  └── POST /auth/logout → tokenStore.clear() → isAuth = false → login
```
