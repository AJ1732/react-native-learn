export const queryKeys = {
  opportunities: {
    all: ["opportunities"] as const,
    byId: (id: ID) => ["opportunities", id] as const,
  },
} as const;
