export type Severity = "healthy" | "warning" | "offline" | "online";

export type CrowdSecMeta = {
  key?: string;
  value?: string;
};

export type CrowdSecDecision = {
  id?: number | string;
  origin?: string;
  type?: string;
  scope?: string;
  value?: string;
  duration?: string;
  until?: string;
  scenario?: string;
  reason?: string;
  simulated?: boolean;
};

export type CrowdSecAlert = {
  id?: number | string;
  uuid?: string;
  machine_id?: string;
  created_at?: string;
  updated_at?: string;
  start_at?: string;
  stop_at?: string;
  scenario?: string;
  scenario_hash?: string;
  scenario_version?: string;
  message?: string;
  source?: {
    scope?: string;
    value?: string;
    ip?: string;
    range?: string;
    country?: string;
    as_name?: string;
    latitude?: number;
    longitude?: number;
  };
  decisions?: CrowdSecDecision[];
  events?: unknown[];
  events_count?: number;
  meta?: CrowdSecMeta[];
  capacity?: number;
  leakspeed?: string;
  remediation?: boolean;
};

export type CrowdSecMetricItem = {
  name?: string;
  value?: number;
  unit?: string;
  labels?: Record<string, string>;
};

export type CrowdSecMetricsBlock = {
  items?: CrowdSecMetricItem[];
  meta?: {
    window_size_seconds?: number;
    utc_now_timestamp?: number;
  };
};

export type CrowdSecLogProcessorMetric = {
  name?: string;
  version?: string;
  last_push?: number;
  last_update?: number;
  utc_startup_timestamp?: number;
  metrics?: CrowdSecMetricsBlock[];
};

export type CrowdSecRemediationMetric = {
  name?: string;
  type?: string;
  version?: string;
  last_pull?: number;
  utc_startup_timestamp?: number;
  metrics?: CrowdSecMetricsBlock[];
};

export type CrowdSecMetrics = {
  log_processors?: CrowdSecLogProcessorMetric[];
  remediation_components?: CrowdSecRemediationMetric[];
  lapi?: {
    version?: string;
    utc_startup_timestamp?: number;
    metrics?: CrowdSecMetricsBlock[];
  };
};

export type AlertRow = {
  id: string;
  time: string;
  sourceIp: string;
  scenario: string;
  country: string;
  eventsCount: number;
  hasDecision: boolean;
  decisionStatus: "Active" | "None" | "Simulated";
  message: string;
  machine: string;
  raw: CrowdSecAlert;
};

export type DecisionRow = {
  id: string;
  ip: string;
  action: string;
  reason: string;
  country: string;
  duration: string;
  expiration: string;
  scenario: string;
  raw: CrowdSecDecision;
};

export type MachineRow = {
  id: string;
  name: string;
  lastHeartbeat: string;
  version: string;
  status: "Online" | "Offline";
};

export type BouncerRow = {
  id: string;
  name: string;
  type: string;
  lastPull: string;
  status: "Healthy" | "Warning" | "Offline";
};

export type DashboardSummary = {
  totalAlerts: number;
  activeDecisions: number;
  registeredMachines: number;
  activeBouncers: number;
  alertsTimeline: Array<{ time: string; alerts: number }>;
  topCountries: Array<{ country: string; alerts: number }>;
  topIps: Array<{ ip: string; alerts: number }>;
  scenarioDistribution: Array<{ scenario: string; value: number }>;
  recentAlerts: AlertRow[];
  recentDecisions: DecisionRow[];
  machines: MachineRow[];
  bouncers: BouncerRow[];
  health: CrowdSecHealth;
  lastUpdated: string;
  // SOC analytics extensions
  kpiTrends?: import("@/types/dashboard").KpiMetrics;
  healthMonitoring?: import("@/types/dashboard").HealthMonitoring;
  activityFeed?: import("@/types/dashboard").ActivityEvent[];
  topAttackers?: import("@/types/dashboard").TopAttacker[];
  attackTimeline?: import("@/types/dashboard").AttackTimeline;
  decisionDistribution?: import("@/types/dashboard").DecisionDistribution[];
};

export type CrowdSecHealth = {
  ok: boolean;
  status: "connected" | "degraded" | "offline";
  lapiVersion?: string;
  message?: string;
};

export type ApiEnvelope<T> = {
  data: T;
  lastUpdated: string;
};
