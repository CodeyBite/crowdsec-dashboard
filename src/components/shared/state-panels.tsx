import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingPanel({ label = "Loading CrowdSec data" }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </CardContent>
    </Card>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-red-300" />
        <div>
          <div className="font-medium">Unable to reach CrowdSec LAPI</div>
          <div className="mt-1 max-w-xl text-sm text-muted-foreground">{message}</div>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyPanel({ label, description }: { label: string; description?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {description ? <p className="max-w-sm text-xs text-muted-foreground/70">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
