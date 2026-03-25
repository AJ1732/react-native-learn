export const queryKeys = {
  opportunities: {
    all: ["opportunities"] as const,
    byId: (id: ID) => ["opportunities", id] as const,
  },
  user: {
    profile: ["profile"] as const,
  },
} as const;
