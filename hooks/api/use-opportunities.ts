import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";
import { OpportunityService } from "@/services/opportunity.service";
import { Opportunity } from "@/types/domain/opportunity.types";

export function useOpportunities() {
  return useQuery({
    queryKey: queryKeys.opportunities.all,
    queryFn: async () => {
      const response = await OpportunityService.getAll();
      return response.data.data as Opportunity[];
    },
  });
}

export function useOpportunity(id: ID) {
  return useQuery({
    queryKey: queryKeys.opportunities.byId(id),
    queryFn: async () => {
      const response = await OpportunityService.getById(id)();
      return response.data.data as Opportunity;
    },
    enabled: id != null,
  });
}
