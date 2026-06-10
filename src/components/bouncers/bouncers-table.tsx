"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "@/lib/table-utils";
import { BouncerRow } from "@/types/crowdsec";

export const bouncerColumns: ColumnDef<BouncerRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader label="Type" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "lastPull",
    header: ({ column }) => <SortableHeader label="Last Pull" column={column} />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader label="Status" column={column} />,
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "Healthy" ? "success" : row.original.status === "Warning" ? "warning" : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
    enableColumnFilter: true,
  },
];

const exportColumns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "lastPull", label: "Last Pull" },
  { key: "status", label: "Status" },
];

export function BouncersTable({ data }: { data: BouncerRow[] }) {
  return (
    <DataTable
      columns={bouncerColumns}
      data={data}
      searchPlaceholder="Search bouncers"
      emptyLabel="No bouncers registered"
      exportFilename={`crowdsec-bouncers-${Date.now()}.csv`}
      exportColumns={exportColumns}
    />
  );
}
