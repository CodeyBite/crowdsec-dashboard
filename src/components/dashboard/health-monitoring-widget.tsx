import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HealthComponentStatus, HealthMonitoring } from "@/types/dashboard";

const statusConfig: Record<HealthComponentStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  healthy: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export function HealthMonitoringWidget({ data }: { data: HealthMonitoring }) {
  const overall = statusConfig[data.overall];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Health Monitoring</CardTitle>
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", overall.bg, overall.color)}>
          <Activity className="h-3.5 w-3.5" />
          {data.overall.charAt(0).toUpperCase() + data.overall.slice(1)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.components.map((component) => {
          const config = statusConfig[component.status];
          const Icon = config.icon;
          return (
            <div
              key={component.id}
              className="flex items-center justify-between rounded-md border bg-background/40 px-3 py-2.5 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div>
                  <div className="text-sm font-medium">{component.label}</div>
                  <div className="text-xs text-muted-foreground">{component.detail}</div>
                </div>
              </div>
              <div className={cn("h-2 w-2 rounded-full", config.color.replace("text-", "bg-"))} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
