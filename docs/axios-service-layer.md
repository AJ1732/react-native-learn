# Axios Service Layer in React Native

Architecture for making API requests in React Native, adapted from a Next.js client/server pattern.

---

## Why No `server` Object?

In the Next.js version, `makeRequests` returns `{ client, server }` because requests can run in two contexts:

| Context  | Where it runs               | Auth source                |
| -------- | --------------------------- | -------------------------- |
| `client` | Browser → Next.js API route | Cookie / session           |
| `server` | Next.js API route → Backend | Token from `next-auth/jwt` |

**React Native has no server context.** The app runs entirely on the device. There are no API routes, no SSR, and no cookies. So `makeRequests` returns a single async function directly — no `.client()` wrapper needed.

---

## File Structure

```
lib/
  axios/
    index.ts          # axios instance + interceptors
    helper.ts         # makeRequests factory
    token-store.ts    # in-memory token + SecureStore persistence
  query-keys.ts       # centralized TanStack Query key factory

constants/
  endpoints.ts        # all API paths in one place

services/
  beneficiary.service.ts  # one file per resource

hooks/
  use-beneficiaries.ts    # TanStack Query hooks per resource
```

---

## 1. Token Store — `lib/axios/token-store.ts`

Handles auth token for the app's lifetime.

**Why two layers (memory + SecureStore)?**

- **In-memory** (`_token` variable): synchronous, zero-cost reads inside axios interceptors — no async needed.
- **SecureStore**: persists across app restarts. Tokens stored here are encrypted by the OS keychain (iOS Keychain / Android Keystore).

```ts
// Set token after login
tokenStore.set(response.data.accessToken);

// Clear on logout
tokenStore.clear();

// Rehydrate at app startup (call once in _layout.tsx)
await initTokenStore();
```

---

## 2. Axios Instance — `lib/axios/index.ts`

Single axios instance shared across the entire app.

**Request interceptor** — injects the Bearer token on every outgoing request automatically. No need to pass tokens manually in service calls.

**Response interceptor** — handles 401 globally with a silent token refresh and request queue. See [auth-flow.md](./auth-flow.md) for the full refresh token strategy.

```ts
// Set your API base URL in .env
EXPO_PUBLIC_API_URL=https://api.example.com
```

---

## 3. `makeRequests` Helper — `lib/axios/helper.ts`

Factory that binds a route + HTTP method to a callable async function.

```ts
// Produces: ({ data?, requestConfig? }) => Promise<AxiosResponse>
const getAll = makeRequests("/beneficiaries", "GET");

await getAll(); // no params
await getAll({ data: { page: 2 } }); // GET params → becomes ?page=2
await getAll({ data: formData }); // FormData → Content-Type auto-set
```

**GET vs body methods:**

- `GET` → `data` is serialized as query params (`params`)
- All others → `data` goes in the request body

**FormData handling:** sets `Content-Type: undefined` so axios auto-generates the correct `multipart/form-data` boundary.

---

## 4. Endpoints — `constants/endpoints.ts`

Single source of truth for all API paths. Static paths are plain strings; dynamic segments are functions.

```ts
ENDPOINTS.beneficiaries.all; // "/beneficiaries"
ENDPOINTS.beneficiaries.byId(42); // "/beneficiaries/42"
```

Adding a new resource:

```ts
posts: {
  all: "/posts",
  byId: (id: ID) => `/posts/${id}`,
},
```

---

## 5. Services — `services/beneficiary.service.ts`

Thin layer that maps CRUD operations to bound request functions.

```ts
// Static methods — created once at module load
BeneficiaryService.getAll();
BeneficiaryService.create({ data: payload });

// Dynamic methods — factory called per invocation (URL varies by id)
BeneficiaryService.getById(id)();
BeneficiaryService.update(id)({ data: payload });
BeneficiaryService.delete(id)();
```

---

## 6. Query Keys — `lib/query-keys.ts`

Centralized key factory prevents typos and makes cache invalidation reliable.

```ts
queryKeys.beneficiaries.all; // ["beneficiaries"]
queryKeys.beneficiaries.byId(42); // ["beneficiaries", 42]
```

Invalidating the list after a mutation:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.all });
```

---

## 7. Hooks — `hooks/use-beneficiaries.ts`

TanStack Query hooks that consume the services. Components stay clean — they never import axios or services directly.

```tsx
// Read
const { data, isLoading, isError } = useBeneficiaries();
const { data: item } = useBeneficiary(id);

// Write
const { mutate: create, isPending } = useCreateBeneficiary();
const { mutate: update } = useUpdateBeneficiary(id);
const { mutate: remove } = useDeleteBeneficiary();

create(payload);
update(payload);
remove(id);
```

---

## 8. App Startup Wiring — `app/_layout.tsx`

```tsx
import { initTokenStore } from "@/lib/axios/token-store";

export default function RootLayout() {
  useEffect(() => {
    initTokenStore(); // rehydrate token from SecureStore
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

---

## Data Flow Summary

```
Component
  └─ hook (useQuery / useMutation)
       └─ Service (BeneficiaryService.getAll)
            └─ makeRequests (bound route + method)
                 └─ axiosInstance (injects token via interceptor)
                      └─ REST API
```

---

## Adding a New Resource

1. Add paths to `constants/endpoints.ts`
2. Create `services/my-resource.service.ts`
3. Add keys to `lib/query-keys.ts`
4. Create `hooks/api/use-my-resource.ts`
5. Import directly from the service file — no barrel
