"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useRefreshInterval } from "@/hooks/use-refresh-interval";
import { assertApiEnvelope } from "@/lib/api-validation";
import { ApiEnvelope } from "@/types/crowdsec";

async function fetchApi<T>(path: string): Promise<ApiEnvelope<T>> {
  const response = await fetch(path, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "CrowdSec API request failed");
  return assertApiEnvelope<T>(payload);
}

export function useCrowdSecQuery<T>(key: readonly unknown[], path: string, options?: { enabled?: boolean }) {
  const { interval } = useRefreshInterval();
  return useQuery({
    queryKey: [...key, interval],
    queryFn: () => fetchApi<T>(path),
    enabled: options?.enabled,
    refetchInterval: interval,
    staleTime: 10_000,
  });
}

export function useRefreshCrowdSec() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["crowdsec"] });
}
