"use client";

import { MachinesTable } from "@/components/machines/machines-table";
import { PageHeader } from "@/components/layout/page-header";
import { TablePageSkeleton } from "@/components/shared/skeleton-panels";
import { ErrorPanel } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import { MachineRow } from "@/types/crowdsec";
import { RefreshCw } from "lucide-react";

export default function MachinesPage() {
  const query = useCrowdSecQuery<MachineRow[]>(["crowdsec", "machines"], "/api/crowdsec/machines");

  return (
    <>
      <PageHeader
        title="Machines"
        description="Registered CrowdSec log processors and their heartbeat status."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <TablePageSkeleton /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? <MachinesTable data={query.data.data} /> : null}
    </>
  );
}
