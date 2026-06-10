"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import type { TopAttacker } from "@/types/dashboard";

export function TopAttackersWidget({
  data,
  onIpClick,
}: {
  data: TopAttacker[];
  onIpClick?: (ip: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Attackers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="hidden sm:table-cell">Country</TableHead>
                <TableHead className="hidden md:table-cell">Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No attacker data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((attacker) => (
                  <TableRow
                    key={attacker.ip}
                    className={onIpClick ? "cursor-pointer hover:bg-accent/50" : undefined}
                    onClick={() => onIpClick?.(attacker.ip)}
                  >
                    <TableCell className="font-mono text-sm text-primary">{attacker.ip}</TableCell>
                    <TableCell className="text-right font-medium">{attacker.count}</TableCell>
                    <TableCell className="hidden sm:table-cell">{attacker.country}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDateTime(attacker.lastSeen)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
