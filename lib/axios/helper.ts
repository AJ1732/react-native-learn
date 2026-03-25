import type { AxiosRequestConfig, AxiosResponse } from "axios";

import axiosInstance from ".";

type RequestProps = {
  data?: unknown;
  requestConfig?: AxiosRequestConfig;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Creates a reusable async request function bound to a specific route + method.
 *
 * @param route  - API path, e.g. "/posts" or "/posts/123"
 * @param method - HTTP verb, defaults to "GET"
 */
export function makeRequests(route: string, method: HttpMethod = "GET") {
  return async ({ data, requestConfig }: RequestProps = {}): Promise<AxiosResponse> => {
    const config: AxiosRequestConfig = {
      url: route,
      method,
      ...(method === "GET" ? { params: data } : { data }),
      ...requestConfig,
    };

    return axiosInstance(config);
  };
}
