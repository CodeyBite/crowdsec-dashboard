"use client";

import { Activity, Shield, Zap } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Real-time Threat Visibility",
    description: "Monitor CrowdSec alerts, decisions, machines, and bouncers through the Local API with live auto-refresh.",
  },
  {
    icon: Activity,
    title: "SOC Operations Center",
    description: "Health monitoring, activity feeds, top attacker intelligence, and analytics charts for security operations.",
  },
  {
    icon: Zap,
    title: "Read-only by Design",
    description: "This dashboard observes CrowdSec data without modifying detections, decisions, or remediation actions.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About"
        description="CrowdSec Security Operations Dashboard — internal threat monitoring platform."
      />
      <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
        <Card>
          <CardHeader>
            <CardTitle>CrowdSec SOC Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              A professional Security Operations Center (SOC) dashboard built on Next.js 15, React 19, and TypeScript.
              It connects to your local CrowdSec LAPI instance and provides real-time visibility into security events.
            </p>
            <p>
              Designed for security analysts and engineering teams who need a centralized view of CrowdSec detections
              without leaving the browser. All data is fetched server-side with watcher authentication.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="p-5">
                  <Icon className="mb-3 h-8 w-8 text-primary" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                ["⌘K / Ctrl+K", "Open command palette"],
                ["r", "Refresh all data"],
                ["g d", "Go to Dashboard"],
                ["g a", "Go to Alerts"],
                ["g e", "Go to Decisions"],
                ["g m", "Go to Machines"],
                ["g b", "Go to Bouncers"],
                ["g s", "Go to System"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-3">
                  <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs">{key}</kbd>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
