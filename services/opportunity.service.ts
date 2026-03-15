import { ENDPOINTS } from "@/constants/endpoints";
import { makeRequests } from "@/lib/axios/helper";

export const OpportunityService = {
  getAll: makeRequests(ENDPOINTS.opportunities.all, "GET"),
  getById: (id: ID) => makeRequests(ENDPOINTS.opportunities.byId(id), "GET"),
};
