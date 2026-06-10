"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "@/lib/table-utils";
import { formatDateTime } from "@/lib/utils";
import { AlertRow } from "@/types/crowdsec";

export const alertColumns: ColumnDef<AlertRow>[] = [
  {
    accessorKey: "time",
    header: ({ column }) => <SortableHeader label="Time" column={column} />,
    cell: ({ row }) => formatDateTime(row.original.time),
  },
  {
    accessorKey: "sourceIp",
    header: ({ column }) => <SortableHeader label="Source IP" column={column} />,
    cell: ({ row }) => <span className="font-mono text-sm text-primary">{row.original.sourceIp}</span>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "scenario",
    header: ({ column }) => <SortableHeader label="Scenario" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "country",
    header: ({ column }) => <SortableHeader label="Country" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "eventsCount",
    header: ({ column }) => <SortableHeader label="Events" column={column} />,
  },
  {
    accessorKey: "decisionStatus",
    header: "Decision Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.decisionStatus === "Active"
            ? "destructive"
            : row.original.decisionStatus === "Simulated"
              ? "warning"
              : "secondary"
        }
      >
        {row.original.decisionStatus}
      </Badge>
    ),
  },
];

const exportColumns = [
  { key: "time", label: "Time" },
  { key: "sourceIp", label: "Source IP" },
  { key: "scenario", label: "Scenario" },
  { key: "country", label: "Country" },
  { key: "eventsCount", label: "Events" },
  { key: "decisionStatus", label: "Decision Status" },
  { key: "machine", label: "Machine" },
];

export function AlertsTable({
  data,
  onRowClick,
  emptyLabel,
  showExport = true,
}: {
  data: AlertRow[];
  onRowClick?: (alert: AlertRow) => void;
  emptyLabel?: string;
  showExport?: boolean;
}) {
  return (
    <DataTable
      columns={alertColumns}
      data={data}
      searchPlaceholder="Search alerts by IP, scenario, country"
      onRowClick={onRowClick}
      emptyLabel={emptyLabel}
      exportFilename={showExport ? `crowdsec-alerts-${Date.now()}.csv` : undefined}
      exportColumns={showExport ? exportColumns : undefined}
    />
  );
}
