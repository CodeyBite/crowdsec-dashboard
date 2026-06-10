"use client";

import { useState } from "react";
import { Bot, Server, ShieldAlert, Siren } from "lucide-react";

import { AlertsTable } from "@/components/alerts/alerts-table";
import {
  AttackTimelineChart,
  DecisionDistributionChart,
  ScenarioPieChart,
  TopCountriesChart,
} from "@/components/charts/dashboard-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HealthMonitoringWidget } from "@/components/dashboard/health-monitoring-widget";
import { IpIntelDrawer } from "@/components/dashboard/ip-intel-drawer";
import { MetricCard, SyncMetricCard } from "@/components/dashboard/metric-card";
import { TopAttackersWidget } from "@/components/dashboard/top-attackers-widget";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { DashboardSkeleton } from "@/components/shared/skeleton-panels";
import { ErrorPanel } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrowdSecQuery } from "@/hooks/use-crowdsec-query";
import type { IpIntel } from "@/types/dashboard";
import { DashboardSummary } from "@/types/crowdsec";
import { DecisionsTable } from "@/components/decisions/decisions-table";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const query = useCrowdSecQuery<DashboardSummary>(["crowdsec", "overview"], "/api/crowdsec/overview");
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const ipQuery = useCrowdSecQuery<IpIntel>(
    ["crowdsec", "ip", selectedIp],
    `/api/crowdsec/ip?ip=${encodeURIComponent(selectedIp || "")}`,
    { enabled: Boolean(selectedIp) },
  );

  return (
    <>
      <PageHeader
        title="Security Operations Dashboard"
        description="Real-time CrowdSec threat visibility — alerts, decisions, machines, and bouncers."
        actions={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isLoading ? <DashboardSkeleton /> : null}
      {query.isError ? <ErrorPanel message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <DashboardContent
          data={query.data.data}
          onIpClick={(ip) => setSelectedIp(ip)}
        />
      ) : null}
      <IpIntelDrawer
        ip={selectedIp}
        data={ipQuery.data?.data || null}
        loading={ipQuery.isLoading}
        open={Boolean(selectedIp)}
        onOpenChange={(open) => !open && setSelectedIp(null)}
      />
    </>
  );
}

function DashboardContent({ data, onIpClick }: { data: DashboardSummary; onIpClick: (ip: string) => void }) {
  const trends = data.kpiTrends;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
        <MetricCard
          title="Total Alerts"
          value={data.totalAlerts}
          icon={ShieldAlert}
          trend={trends?.totalAlerts}
          subtitle={trends ? `+${trends.alertsLastHour} in last hour` : undefined}
        />
        <MetricCard title="Active Decisions" value={data.activeDecisions} icon={Siren} tone="warning" trend={trends?.activeDecisions} />
        <MetricCard title="Registered Machines" value={data.registeredMachines} icon={Server} tone="success" trend={trends?.registeredMachines} />
        <MetricCard title="Active Bouncers" value={data.activeBouncers} icon={Bot} tone="success" trend={trends?.activeBouncers} />
        <SyncMetricCard lastUpdated={data.lastUpdated} />
      </div>

      {/* Operations Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            {data.attackTimeline ? <AttackTimelineChart data={data.attackTimeline} /> : null}
          </ErrorBoundary>
        </div>
        <div className="space-y-4">
          <ErrorBoundary>
            {data.healthMonitoring ? <HealthMonitoringWidget data={data.healthMonitoring} /> : null}
          </ErrorBoundary>
        </div>
      </div>

      {/* Intelligence Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ErrorBoundary>
          {data.topAttackers ? <TopAttackersWidget data={data.topAttackers} onIpClick={onIpClick} /> : null}
        </ErrorBoundary>
        <ErrorBoundary>
          {data.activityFeed ? <ActivityFeed events={data.activityFeed} /> : null}
        </ErrorBoundary>
      </div>

      {/* Analytics Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ErrorBoundary>
          <TopCountriesChart data={data.topCountries} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ScenarioPieChart data={data.scenarioDistribution} />
        </ErrorBoundary>
        <ErrorBoundary>
          {data.decisionDistribution ? (
            <DecisionDistributionChart data={data.decisionDistribution} />
          ) : (
            <TopCountriesChart data={data.topCountries} />
          )}
        </ErrorBoundary>
      </div>

      {/* Recent Tables */}
      <div className="grid gap-4 2xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsTable data={data.recentAlerts} emptyLabel="No recent alerts" showExport={false} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <DecisionsTable data={data.recentDecisions} emptyLabel="No recent decisions" showExport={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
