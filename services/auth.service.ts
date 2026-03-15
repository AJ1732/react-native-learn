import { ENDPOINTS } from "@/constants/endpoints";
import { makeRequests } from "@/lib/axios/helper";

export const AuthService = {
  login: makeRequests(ENDPOINTS.auth.login, "POST"),
  signup: makeRequests(ENDPOINTS.auth.signup, "POST"),
  logout: makeRequests(ENDPOINTS.auth.logout, "POST"),
};
