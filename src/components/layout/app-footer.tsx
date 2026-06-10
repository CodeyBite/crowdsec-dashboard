"use client";

import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import type { CrowdSecHealth } from "@/types/crowdsec";
import type { SystemInfo } from "@/types/dashboard";

const DASHBOARD_VERSION = "0.1.0";

export function AppFooter() {
  const { data: healthData } = useCrowdSecQuery<CrowdSecHealth>(["crowdsec", "health"], "/api/crowdsec/health");
  const { data: systemData } = useCrowdSecQuery<SystemInfo>(["crowdsec", "system"], "/api/crowdsec/system");

  const lapiVersion = healthData?.data.lapiVersion || systemData?.data.lapiVersion || "—";

  return (
    <footer className="mt-auto border-t bg-background/50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-foreground/80">CrowdSec Dashboard</span>
          <span>v{DASHBOARD_VERSION}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>LAPI {lapiVersion}</span>
          <span className="hidden sm:inline">Read-only SOC monitoring</span>
        </div>
      </div>
    </footer>
  );
}
