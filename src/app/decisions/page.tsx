"use client";

import { DecisionsTable } from "@/components/decisions/decisions-table";
import { PageHeader } from "@/components/layout/page-header";
import { TablePageSkeleton } from "@/components/shared/skeleton-panels";
import { ErrorPanel } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import { DecisionRow } from "@/types/crowdsec";
import { RefreshCw } from "lucide-react";

export default function DecisionsPage() {
  const query = useCrowdSecQuery<DecisionRow[]>(["crowdsec", "decisions"], "/api/crowdsec/decisions");

  return (
    <>
      <PageHeader
        title="Decisions"
        description="Active remediation decisions — bans, captchas, and throttles enforced by CrowdSec."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <TablePageSkeleton /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? <DecisionsTable data={query.data.data} emptyLabel="No active decisions" /> : null}
    </>
  );
}
