"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { RefreshIntervalProvider } from "@/hooks/use-refresh-interval";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 30_000,
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 10_000,
            gcTime: 5 * 60_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RefreshIntervalProvider>{children}</RefreshIntervalProvider>
    </QueryClientProvider>
  );
}
