import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24, // 24h — must be >= persister maxAge
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
