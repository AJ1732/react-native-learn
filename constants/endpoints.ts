export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  user: {
    profile: "/profile",
  },

  opportunities: {
    all: "/opportunities",
    byId: (id: ID) => `/opportunities/${id}`,
  },
} as const;
