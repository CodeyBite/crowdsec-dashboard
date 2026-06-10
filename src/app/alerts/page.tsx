"use client";

import { useState } from "react";

import { AlertDetailDrawer } from "@/components/alerts/alert-detail-drawer";
import { AlertsTable } from "@/components/alerts/alerts-table";
import { PageHeader } from "@/components/layout/page-header";
import { TablePageSkeleton } from "@/components/shared/skeleton-panels";
import { ErrorPanel } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import { AlertRow } from "@/types/crowdsec";
import { RefreshCw } from "lucide-react";

export default function AlertsPage() {
  const [selected, setSelected] = useState<AlertRow | null>(null);
  const query = useCrowdSecQuery<AlertRow[]>(["crowdsec", "alerts"], "/api/crowdsec/alerts?limit=500");

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Investigate recent CrowdSec detections, scenarios, source metadata, and decision status."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <TablePageSkeleton /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <AlertsTable
          data={query.data.data}
          onRowClick={(alert) => setSelected(alert)}
          emptyLabel="No alerts recorded"
        />
      ) : null}
      <AlertDetailDrawer alert={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
