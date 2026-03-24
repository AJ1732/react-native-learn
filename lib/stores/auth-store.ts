import { create } from "zustand";

import { tokenStore } from "@/lib/axios/token-store";
import type { User } from "@/types/domain/auth.types";

type AuthStore = {
  isAuth: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string, user: User, expiresAt?: number) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuth: false,
  user: null,

  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
    expiresAt?: number,
  ) => {
    tokenStore.set(accessToken, refreshToken, expiresAt, user);
    set({ isAuth: true, user });
  },

  logout: () => {
    tokenStore.clear();
    set({ isAuth: false, user: null });
  },
}));
