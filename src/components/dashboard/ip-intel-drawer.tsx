"use client";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import type { IpIntel } from "@/types/dashboard";

export function IpIntelDrawer({
  ip,
  data,
  loading,
  open,
  onOpenChange,
}: {
  ip: string | null;
  data: IpIntel | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono">{ip || "IP Intelligence"}</SheetTitle>
          <SheetDescription>Threat intelligence profile aggregated from CrowdSec alerts</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data ? (
          <div className="mt-6 space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <IntelField label="Alert Count" value={String(data.alertCount)} />
              <IntelField label="Decision Count" value={String(data.decisionCount)} />
              <IntelField label="Country" value={data.country} />
              <IntelField label="ASN" value={data.asn} />
              <IntelField label="First Seen" value={formatDateTime(data.firstSeen)} />
              <IntelField label="Last Seen" value={formatDateTime(data.lastSeen)} />
            </div>

            <div>
              <div className="mb-2 text-xs uppercase text-muted-foreground">Scenarios</div>
              <div className="flex flex-wrap gap-1.5">
                {data.scenarios.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {data.reasons.length > 0 ? (
              <div>
                <div className="mb-2 text-xs uppercase text-muted-foreground">Reasons</div>
                <ul className="space-y-1 text-muted-foreground">
                  {data.reasons.map((r) => (
                    <li key={r} className="rounded border bg-background/40 px-2 py-1">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">No intelligence data for this IP.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function IntelField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/40 p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
