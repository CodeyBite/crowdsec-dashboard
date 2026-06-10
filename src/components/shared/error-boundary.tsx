"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message?: string };

/** React error boundary for graceful UI failure in SOC widgets */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-destructive/30">
            <CardContent className="flex min-h-32 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div className="text-sm text-muted-foreground">{this.state.message || "Something went wrong"}</div>
              <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        )
      );
    }
    return this.props.children;
  }
}
