import { Clock, LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime, shortNumber } from "@/lib/utils";
import type { KpiTrend } from "@/types/dashboard";

export function MetricCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning";
  trend?: KpiTrend;
  subtitle?: string;
}) {
  const color = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendColor =
    trend?.direction === "up" ? "text-destructive" : trend?.direction === "down" ? "text-success" : "text-muted-foreground";

  return (
    <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-panel">
      <CardContent className="flex items-start justify-between p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {typeof value === "number" ? shortNumber(value) : value}
          </p>
          {trend ? (
            <div className={cn("mt-2 flex items-center gap-1.5 text-xs", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{trend.value}</span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          ) : null}
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SyncMetricCard({ lastUpdated }: { lastUpdated: string }) {
  return (
    <MetricCard
      title="Last Sync"
      value={formatDateTime(lastUpdated)}
      icon={Clock}
      tone="primary"
      subtitle="CrowdSec LAPI"
    />
  );
}
