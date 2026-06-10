"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "@/lib/table-utils";
import { MachineRow } from "@/types/crowdsec";

export const machineColumns: ColumnDef<MachineRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Machine Name" column={column} />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "lastHeartbeat",
    header: ({ column }) => <SortableHeader label="Last Heartbeat" column={column} />,
  },
  {
    accessorKey: "version",
    header: ({ column }) => <SortableHeader label="Version" column={column} />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader label="Status" column={column} />,
    cell: ({ row }) => <Badge variant={row.original.status === "Online" ? "success" : "destructive"}>{row.original.status}</Badge>,
    enableColumnFilter: true,
  },
];

const exportColumns = [
  { key: "name", label: "Name" },
  { key: "lastHeartbeat", label: "Last Heartbeat" },
  { key: "version", label: "Version" },
  { key: "status", label: "Status" },
];

export function MachinesTable({ data }: { data: MachineRow[] }) {
  return (
    <DataTable
      columns={machineColumns}
      data={data}
      searchPlaceholder="Search machines"
      emptyLabel="No machines registered"
      exportFilename={`crowdsec-machines-${Date.now()}.csv`}
      exportColumns={exportColumns}
    />
  );
}
