"use client";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertRow } from "@/types/crowdsec";
import { formatDateTime } from "@/lib/utils";

export function AlertDetailDrawer({
  alert,
  open,
  onOpenChange,
}: {
  alert: AlertRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {alert ? (
          <>
            <SheetHeader>
              <SheetTitle>{alert.scenario}</SheetTitle>
              <SheetDescription>
                Alert {alert.id} from {alert.sourceIp}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Time" value={formatDateTime(alert.time)} />
                <Detail label="Country" value={alert.country} />
                <Detail label="Events" value={String(alert.eventsCount)} />
                <Detail label="Machine" value={alert.machine} />
              </div>
              <div>
                <div className="mb-2 text-xs uppercase text-muted-foreground">Decision status</div>
                <Badge
                  variant={
                    alert.decisionStatus === "Active"
                      ? "destructive"
                      : alert.decisionStatus === "Simulated"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {alert.decisionStatus}
                </Badge>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase text-muted-foreground">Message</div>
                <div className="rounded-md border bg-background/50 p-3 text-muted-foreground">{alert.message}</div>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase text-muted-foreground">Raw alert</div>
                <pre className="max-h-[45vh] overflow-auto rounded-md border bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(alert.raw, null, 2)}
                </pre>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/40 p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
