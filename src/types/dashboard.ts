import type { AlertRow, BouncerRow, CrowdSecHealth, DecisionRow, MachineRow } from "@/types/crowdsec";

/** KPI trend direction and magnitude for metric cards */
export type TrendDirection = "up" | "down" | "neutral";

export type KpiTrend = {
  direction: TrendDirection;
  value: string;
  label: string;
};

export type KpiMetrics = {
  totalAlerts: KpiTrend;
  activeDecisions: KpiTrend;
  registeredMachines: KpiTrend;
  activeBouncers: KpiTrend;
  alertsLastHour: number;
};

/** Individual health component status for SOC monitoring widget */
export type HealthComponentStatus = "healthy" | "warning" | "critical";

export type HealthComponent = {
  id: string;
  label: string;
  status: HealthComponentStatus;
  detail: string;
};

export type HealthMonitoring = {
  components: HealthComponent[];
  overall: HealthComponentStatus;
};

/** Recent security event for activity feed */
export type ActivityEventType = "alert_created" | "decision_created" | "machine_connected" | "machine_disconnected";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
};

/** Top attacker row with enriched metadata */
export type TopAttacker = {
  ip: string;
  count: number;
  country: string;
  lastSeen: string;
  scenarios: string[];
};

/** Aggregated threat intelligence for a single IP */
export type IpIntel = {
  ip: string;
  alertCount: number;
  decisionCount: number;
  firstSeen: string;
  lastSeen: string;
  country: string;
  asn: string;
  scenarios: string[];
  reasons: string[];
  recentAlerts: AlertRow[];
  recentDecisions: DecisionRow[];
};

/** Decision action breakdown for analytics chart */
export type DecisionDistribution = {
  action: string;
  label: string;
  count: number;
};

/** Timeline bucket with hour and day granularity */
export type TimelineBucket = {
  key: string;
  label: string;
  alerts: number;
};

export type AttackTimeline = {
  hourly: TimelineBucket[];
  daily: TimelineBucket[];
};

/** Extended dashboard summary with SOC analytics */
export type SocDashboardSummary = {
  totalAlerts: number;
  activeDecisions: number;
  registeredMachines: number;
  activeBouncers: number;
  lastUpdated: string;
  kpiTrends: KpiMetrics;
  healthMonitoring: HealthMonitoring;
  activityFeed: ActivityEvent[];
  topAttackers: TopAttacker[];
  attackTimeline: AttackTimeline;
  topCountries: Array<{ country: string; alerts: number }>;
  topIps: Array<{ ip: string; alerts: number }>;
  scenarioDistribution: Array<{ scenario: string; value: number }>;
  decisionDistribution: DecisionDistribution[];
  recentAlerts: AlertRow[];
  recentDecisions: DecisionRow[];
  machines: MachineRow[];
  bouncers: BouncerRow[];
  health: CrowdSecHealth;
};

/** System information for About / System pages */
export type SystemInfo = {
  dashboardVersion: string;
  crowdsecVersion: string;
  lapiVersion: string;
  machineId: string;
  os: string;
  lapiUrl: string;
  lastSync: string;
  authStatus: "authenticated" | "offline";
};

export type RefreshIntervalOption = 15_000 | 30_000 | 60_000 | 300_000;

export const REFRESH_INTERVALS: { label: string; value: RefreshIntervalOption }[] = [
  { label: "15 sec", value: 15_000 },
  { label: "30 sec", value: 30_000 },
  { label: "60 sec", value: 60_000 },
  { label: "5 min", value: 300_000 },
];
