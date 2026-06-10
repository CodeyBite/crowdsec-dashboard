"use client";

import { BouncersTable } from "@/components/bouncers/bouncers-table";
import { PageHeader } from "@/components/layout/page-header";
import { TablePageSkeleton } from "@/components/shared/skeleton-panels";
import { ErrorPanel } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import { BouncerRow } from "@/types/crowdsec";
import { RefreshCw } from "lucide-react";

export default function BouncersPage() {
  const query = useCrowdSecQuery<BouncerRow[]>(["crowdsec", "bouncers"], "/api/crowdsec/bouncers");

  return (
    <>
      <PageHeader
        title="Bouncers"
        description="Remediation components pulling decisions from CrowdSec LAPI."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <TablePageSkeleton /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? <BouncersTable data={query.data.data} /> : null}
    </>
  );
}
