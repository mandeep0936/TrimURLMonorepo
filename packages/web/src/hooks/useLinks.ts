import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { CreateLinkPayload } from "../types";

export const LINKS_KEY = ["links"] as const;
export const analyticsKey = (code: string) => ["analytics", code] as const;

export function useLinks() {
  return useQuery({
    queryKey: LINKS_KEY,
    queryFn: api.getLinks,
  });
}

export function useAnalytics(code: string) {
  return useQuery({
    queryKey: analyticsKey(code),
    queryFn: () => api.getAnalytics(code),
    enabled: Boolean(code),
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLinkPayload) => api.createLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY });
    },
  });
}
