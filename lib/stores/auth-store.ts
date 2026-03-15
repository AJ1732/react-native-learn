import { create } from "zustand";

import { tokenStore } from "@/lib/axios/token-store";
import type { AuthUser } from "@/types/domain/auth.types";

type AuthStore = {
  isAuth: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuth: false,
  user: null,

  login: (accessToken: string, refreshToken: string, user: AuthUser) => {
    tokenStore.set(accessToken, refreshToken, user);
    set({ isAuth: true, user });
  },

  logout: () => {
    tokenStore.clear();
    set({ isAuth: false, user: null });
  },
}));
