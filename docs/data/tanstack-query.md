# TanStack Query in React Native

Setup and usage guide for TanStack Query (React Query) in a React Native / Expo project.

---

## Installation

```bash
npm install @tanstack/react-query
```

---

## 1. QueryClient Setup

Create a singleton `QueryClient` instance:

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,  // not relevant on mobile
    },
  },
})
```

---

## 2. Provider + App Focus + Offline Wiring

Wire everything up once in the root layout:

```tsx
// app/_layout.tsx
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query'
import NetInfo from '@react-native-community/netinfo'
import { Stack } from 'expo-router'
import { queryClient } from '@/lib/query-client'

// Refetch queries when app comes back to foreground
function onAppStateChange(status: string) {
  focusManager.setFocused(status === 'active')
}

// Pause/resume queries based on network connectivity
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

export default function RootLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  )
}
```

Install NetInfo if using offline support:

```bash
npx expo install @react-native-community/netinfo
```

---

## 3. Queries — `useQuery`

Define query hooks per feature:

```ts
// hooks/use-posts.ts
import { useQuery } from '@tanstack/react-query'

const fetchPosts = async () => {
  const res = await fetch('https://api.example.com/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
```

Query with dynamic params — key changes trigger a new fetch:

```ts
// hooks/use-post.ts
import { useQuery } from '@tanstack/react-query'

const fetchPost = async (id: number) => {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}

export const usePost = (id: number) =>
  useQuery({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
    enabled: id != null,
  })
```

Using a query in a component:

```tsx
import { usePosts } from '@/hooks/use-posts'
import { FlatList, Text, ActivityIndicator } from 'react-native'

export default function PostsScreen() {
  const { data, isLoading, isError, error } = usePosts()

  if (isLoading) return <ActivityIndicator />
  if (isError) return <Text>Error: {error.message}</Text>

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  )
}
```

---

## 4. Mutations — `useMutation`

```ts
// hooks/use-create-post.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CreatePostBody = { title: string; body: string }

const createPost = async (body: CreatePostBody) => {
  const res = await fetch('https://api.example.com/posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] }) // refetch list
    },
  })
}
```

Using a mutation in a component:

```tsx
const { mutate, isPending, isError } = useCreatePost()

mutate(
  { title: 'Hello', body: 'World' },
  {
    onSuccess: (data) => console.log('Created:', data),
    onError: (err) => console.error(err),
  }
)
```

---

## 5. Default Config Reference

| Option | Value | Reason |
|---|---|---|
| `staleTime` | `5 * 60 * 1000` | Avoid over-fetching on navigation |
| `refetchOnWindowFocus` | `false` | Window focus doesn't apply to mobile |
| `retry` | `2` | Retry failed requests twice |
| `gcTime` | `5 * 60 * 1000` (default) | Cache retained for 5 min after unmount |

---

## 6. Recommended Project Structure

```
lib/
  query-client.ts        # singleton QueryClient

hooks/
  use-posts.ts           # query hooks, one file per feature
  use-post.ts
  use-create-post.ts     # mutation hooks

app/
  _layout.tsx            # QueryClientProvider + AppState + NetInfo wiring
```

---

## React Native–Specific Notes

- **`refetchOnWindowFocus`** — disable it; mobile has no browser window focus events.
- **`AppState`** — use `focusManager.setFocused()` wired to `AppState` to refetch when app returns to foreground.
- **`NetInfo`** — use `onlineManager.setEventListener()` to pause/resume queries based on connectivity.
