import { Column, SortingState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Reusable sortable column header — eliminates duplication across table components */
export function SortableHeader<T>({ label, column }: { label: string; column: Column<T, unknown> }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
    </Button>
  );
}

/** Export table rows to CSV and trigger browser download */
export function exportToCsv<T extends Record<string, unknown>>(rows: T[], filename: string, columns: { key: keyof T; label: string }[]) {
  if (!rows.length) return;

  const escape = (value: unknown) => {
    const str = String(value ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Default sort state for tables */
export function defaultSort(id: string, desc = true): SortingState {
  return [{ id, desc }];
}
