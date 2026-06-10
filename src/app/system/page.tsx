"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorPanel, LoadingPanel } from "@/components/shared/state-panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import { formatDateTime } from "@/lib/utils";
import type { SystemInfo } from "@/types/dashboard";
import { RefreshCw } from "lucide-react";

export default function SystemPage() {
  const query = useCrowdSecQuery<SystemInfo>(["crowdsec", "system"], "/api/crowdsec/system");

  return (
    <>
      <PageHeader
        title="System Information"
        description="CrowdSec engine, LAPI connectivity, and dashboard runtime details."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <LoadingPanel label="Loading system information" /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? <SystemContent info={query.data.data} lastUpdated={query.data.lastUpdated} /> : null}
    </>
  );
}

function SystemContent({ info, lastUpdated }: { info: SystemInfo; lastUpdated: string }) {
  const fields = [
    { label: "Dashboard Version", value: info.dashboardVersion },
    { label: "CrowdSec Version", value: info.crowdsecVersion },
    { label: "LAPI Version", value: info.lapiVersion },
    { label: "Machine ID", value: info.machineId },
    { label: "Operating System", value: info.os },
    { label: "LAPI URL", value: info.lapiUrl },
    { label: "Last Sync", value: formatDateTime(lastUpdated) },
  ];

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in duration-300">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Environment</CardTitle>
          <Badge variant={info.authStatus === "authenticated" ? "success" : "destructive"} className="gap-1.5">
            {info.authStatus === "authenticated" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {info.authStatus === "authenticated" ? "Authenticated" : "Offline"}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="font-mono text-sm font-medium">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
