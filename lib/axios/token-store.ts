import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/types/domain/auth.types";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  getRefresh: (): string | null => _refreshToken,

  set: (accessToken: string, refreshToken: string, user?: AuthUser): void => {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken).catch(
      console.error,
    );
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken).catch(
      console.error,
    );
    if (user) {
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(
        console.error,
      );
    }
  },

  clear: (): void => {
    _accessToken = null;
    _refreshToken = null;
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(USER_KEY).catch(console.error);
  },
};

/** Call once at app startup to rehydrate tokens and user from SecureStore */
export const initTokenStore = async (): Promise<void> => {
  const [accessToken, refreshToken, userJson] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (accessToken) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;
    const { useAuthStore } = await import("@/lib/stores/auth-store");
    useAuthStore.setState({ isAuth: true, user });
  }
};
