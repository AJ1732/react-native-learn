export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  opportunities: {
    all: "/opportunities",
    byId: (id: ID) => `/opportunities/${id}`,
  },
} as const;
