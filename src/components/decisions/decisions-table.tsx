"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "@/lib/table-utils";
import { formatDateTime } from "@/lib/utils";
import { DecisionRow } from "@/types/crowdsec";

export const decisionColumns: ColumnDef<DecisionRow>[] = [
  {
    accessorKey: "ip",
    header: ({ column }) => <SortableHeader label="IP" column={column} />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.ip}</span>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "action",
    header: ({ column }) => <SortableHeader label="Action" column={column} />,
    cell: ({ row }) => <Badge variant="destructive">{row.original.action}</Badge>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "reason",
    header: ({ column }) => <SortableHeader label="Reason" column={column} />,
  },
  {
    accessorKey: "country",
    header: ({ column }) => <SortableHeader label="Country" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <SortableHeader label="Duration" column={column} />,
  },
  {
    accessorKey: "expiration",
    header: ({ column }) => <SortableHeader label="Expiration" column={column} />,
    cell: ({ row }) => (row.original.expiration === "Unknown" ? "Unknown" : formatDateTime(row.original.expiration)),
  },
];

const exportColumns = [
  { key: "ip", label: "IP" },
  { key: "action", label: "Action" },
  { key: "reason", label: "Reason" },
  { key: "country", label: "Country" },
  { key: "duration", label: "Duration" },
  { key: "expiration", label: "Expiration" },
  { key: "scenario", label: "Scenario" },
];

export function DecisionsTable({
  data,
  emptyLabel,
  showExport = true,
}: {
  data: DecisionRow[];
  emptyLabel?: string;
  showExport?: boolean;
}) {
  return (
    <DataTable
      columns={decisionColumns}
      data={data}
      searchPlaceholder="Search decisions by IP, action, reason"
      emptyLabel={emptyLabel}
      exportFilename={showExport ? `crowdsec-decisions-${Date.now()}.csv` : undefined}
      exportColumns={showExport ? exportColumns : undefined}
    />
  );
}
