"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { REFRESH_INTERVALS, RefreshIntervalOption } from "@/types/dashboard";

type RefreshIntervalContextValue = {
  interval: RefreshIntervalOption;
  setInterval: (value: RefreshIntervalOption) => void;
  options: typeof REFRESH_INTERVALS;
};

const RefreshIntervalContext = createContext<RefreshIntervalContextValue | null>(null);

const STORAGE_KEY = "crowdsec-refresh-interval";

export function RefreshIntervalProvider({ children }: { children: React.ReactNode }) {
  const [interval, setIntervalState] = useState<RefreshIntervalOption>(30_000);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored) as RefreshIntervalOption;
      if (REFRESH_INTERVALS.some((o) => o.value === parsed)) setIntervalState(parsed);
    }
  }, []);

  const setInterval = useCallback((value: RefreshIntervalOption) => {
    setIntervalState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const value = useMemo(() => ({ interval, setInterval, options: REFRESH_INTERVALS }), [interval, setInterval]);

  return <RefreshIntervalContext.Provider value={value}>{children}</RefreshIntervalContext.Provider>;
}

export function useRefreshInterval() {
  const context = useContext(RefreshIntervalContext);
  if (!context) throw new Error("useRefreshInterval must be used within RefreshIntervalProvider");
  return context;
}
