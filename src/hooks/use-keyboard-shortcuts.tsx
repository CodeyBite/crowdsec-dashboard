"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useRefreshCrowdSec } from "@/hooks/use-crowdsec-query";

type ShortcutHandlers = {
  onCommandPalette?: () => void;
};

export function useKeyboardShortcuts({ onCommandPalette }: ShortcutHandlers = {}) {
  const router = useRouter();
  const refresh = useRefreshCrowdSec();

  useEffect(() => {
    let pendingG = false;

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Command palette: Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onCommandPalette?.();
        return;
      }

      if (isInput) return;

      // Refresh: r
      if (event.key === "r" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        refresh();
        return;
      }

      // Navigation: g then key
      if (event.key === "g") {
        pendingG = true;
        return;
      }

      if (pendingG) {
        pendingG = false;
        const routes: Record<string, string> = {
          d: "/dashboard",
          a: "/alerts",
          e: "/decisions",
          m: "/machines",
          b: "/bouncers",
          s: "/system",
          o: "/about",
        };
        if (routes[event.key]) {
          event.preventDefault();
          router.push(routes[event.key]);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, refresh, onCommandPalette]);
}
