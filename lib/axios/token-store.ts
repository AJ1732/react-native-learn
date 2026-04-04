import * as SecureStore from "expo-secure-store";

import type { User } from "@/types/domain/auth.types";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";
const EXPIRES_AT_KEY = "auth_expires_at";

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  getRefresh: (): string | null => _refreshToken,

  set: (
    accessToken: string,
    refreshToken: string,
    expiresAt?: number,
    user?: User,
  ): void => {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken).catch(
      console.error,
    );
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken).catch(
      console.error,
    );
    if (expiresAt) {
      SecureStore.setItemAsync(EXPIRES_AT_KEY, String(expiresAt)).catch(
        console.error,
      );
    }
    if (user) {
      tokenStore.persistUser(user);
    }
  },

  persistUser: (user: User): void => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(console.error);
  },

  clear: (): void => {
    _accessToken = null;
    _refreshToken = null;
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY).catch(console.error);
    SecureStore.deleteItemAsync(USER_KEY).catch(console.error);
  },
};

/** Call once at app startup to rehydrate tokens and user from SecureStore */
export const initTokenStore = async (): Promise<void> => {
  const [accessToken, refreshToken, expiresAtRaw, userJson] = await Promise.all(
    [
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(EXPIRES_AT_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ],
  );

  if (!accessToken || !refreshToken) return;

  const { useAuthStore } = await import("@/lib/stores/auth-store");
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;
  const isExpired = expiresAt ? Date.now() / 1000 > expiresAt : false;

  if (!isExpired) {
    // Token still valid — restore session as-is
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    useAuthStore.setState({ isAuth: true, user });
    return;
  }

  // Access token expired — try a silent refresh before deciding
  try {
    const { default: axiosInstance } = await import("@/lib/axios");
    const { ENDPOINTS } = await import("@/constants/endpoints");

    const { data } = await axiosInstance.post(ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token, expires_at } = data.data;
    _accessToken = access_token;
    _refreshToken = refresh_token;
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token).catch(
      console.error,
    );
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token).catch(
      console.error,
    );
    if (expires_at) {
      SecureStore.setItemAsync(EXPIRES_AT_KEY, String(expires_at)).catch(
        console.error,
      );
    }
    useAuthStore.setState({ isAuth: true, user });
  } catch {
    // Refresh token also expired — clear everything, force re-login
    _accessToken = null;
    _refreshToken = null;
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(console.error);
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY).catch(console.error);
    SecureStore.deleteItemAsync(USER_KEY).catch(console.error);
    useAuthStore.setState({ isAuth: false, user: null });
  }
};
