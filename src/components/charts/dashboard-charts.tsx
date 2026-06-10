"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/charts/chart-card";
import { Button } from "@/components/ui/button";
import type { AttackTimeline, DecisionDistribution } from "@/types/dashboard";
import { DashboardSummary } from "@/types/crowdsec";

const colors = ["#22d3ee", "#38bdf8", "#2dd4bf", "#a3e635", "#facc15", "#fb7185", "#c084fc", "#94a3b8"];
const decisionColors: Record<string, string> = {
  ban: "#fb7185",
  captcha: "#facc15",
  throttle: "#38bdf8",
  other: "#94a3b8",
};

const tooltipStyle = {
  background: "hsl(222 41% 8%)",
  border: "1px solid hsl(218 28% 18%)",
  borderRadius: 8,
  color: "hsl(216 24% 93%)",
};

export function AttackTimelineChart({ data }: { data: AttackTimeline }) {
  const [mode, setMode] = useState<"hourly" | "daily">("hourly");
  const chartData = mode === "hourly" ? data.hourly : data.daily;

  return (
    <ChartCard
      title="Attack Timeline"
      action={
        <div className="flex gap-1">
          <Button variant={mode === "hourly" ? "default" : "outline"} size="sm" onClick={() => setMode("hourly")}>
            Hourly
          </Button>
          <Button variant={mode === "daily" ? "default" : "outline"} size="sm" onClick={() => setMode("daily")}>
            Daily
          </Button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="hsl(218 28% 18%)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="hsl(218 12% 64%)" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis stroke="hsl(218 12% 64%)" allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="alerts" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AlertsTimeline({ data }: { data: DashboardSummary["alertsTimeline"] }) {
  return (
    <ChartCard title="Alerts Over Time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="hsl(218 28% 18%)" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="hsl(218 12% 64%)" tick={{ fontSize: 12 }} />
          <YAxis stroke="hsl(218 12% 64%)" allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="alerts" stroke="#22d3ee" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopCountriesChart({ data }: { data: DashboardSummary["topCountries"] }) {
  return (
    <ChartCard title="Country Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="hsl(218 28% 18%)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="country" stroke="hsl(218 12% 64%)" tick={{ fontSize: 12 }} />
          <YAxis stroke="hsl(218 12% 64%)" allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="alerts" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopIpsChart({ data }: { data: DashboardSummary["topIps"] }) {
  return (
    <ChartCard title="Top Attacking IPs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke="hsl(218 28% 18%)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="hsl(218 12% 64%)" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="ip" stroke="hsl(218 12% 64%)" width={120} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="alerts" fill="#38bdf8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ScenarioPieChart({ data }: { data: DashboardSummary["scenarioDistribution"] }) {
  return (
    <ChartCard title="Scenario Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Pie data={data} dataKey="value" nameKey="scenario" innerRadius={68} outerRadius={108} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.scenario} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DecisionDistributionChart({ data }: { data: DecisionDistribution[] }) {
  return (
    <ChartCard title="Decision Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="hsl(218 28% 18%)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" stroke="hsl(218 12% 64%)" tick={{ fontSize: 12 }} />
          <YAxis stroke="hsl(218 12% 64%)" allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.action} fill={decisionColors[entry.action] || decisionColors.other} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
