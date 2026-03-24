import { ENDPOINTS } from "@/constants/endpoints";
import { makeRequests } from "@/lib/axios/helper";

export const UserService = {
  getProfile: makeRequests(ENDPOINTS.user.profile, "GET"),
  updateProfile: makeRequests(ENDPOINTS.user.profile, "PATCH"),
};
