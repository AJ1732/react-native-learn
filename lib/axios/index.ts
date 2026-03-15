import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { ENDPOINTS } from "@/constants/endpoints";

import { tokenStore } from "./token-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Queue of requests waiting for a token refresh to complete
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

const processQueue = (error: unknown, token: string | null) => {
  queue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error),
  );
  queue = [];
};

// Inject access token on every request
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Attempt token refresh on 401, queue concurrent requests, otherwise logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // A refresh is already in-flight — queue this request until it resolves
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStore.getRefresh();

    if (!refreshToken) {
      isRefreshing = false;
      tokenStore.clear();
      const { useAuthStore } = await import("@/lib/stores/auth-store");
      useAuthStore.setState({ isAuth: false });
      return Promise.reject(error);
    }

    try {
      const { data } = await axiosInstance.post(ENDPOINTS.auth.refresh, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = data.data;
      tokenStore.set(access_token, refresh_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      processQueue(null, access_token);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.clear();
      const { useAuthStore } = await import("@/lib/stores/auth-store");
      useAuthStore.setState({ isAuth: false });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
