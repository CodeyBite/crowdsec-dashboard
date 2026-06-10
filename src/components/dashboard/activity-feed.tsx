import { Bell, Gavel, Server, ServerOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatRelative } from "@/lib/utils";
import type { ActivityEvent, ActivityEventType } from "@/types/dashboard";

const eventIcons: Record<ActivityEventType, typeof Bell> = {
  alert_created: Bell,
  decision_created: Gavel,
  machine_connected: Server,
  machine_disconnected: ServerOff,
};

const severityColors = {
  info: "border-l-primary",
  warning: "border-l-warning",
  critical: "border-l-destructive",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
            {events.map((event) => {
              const Icon = eventIcons[event.type];
              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-md border border-l-2 bg-background/40 px-3 py-2.5 transition-colors hover:bg-accent/40",
                    severityColors[event.severity],
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{event.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{event.description}</div>
                      <div className="mt-1 text-xs text-muted-foreground/70">{formatRelative(event.timestamp)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
