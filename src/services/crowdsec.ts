import "server-only";

import {
  AlertRow,
  BouncerRow,
  CrowdSecAlert,
  CrowdSecDecision,
  CrowdSecHealth,
  CrowdSecMetrics,
  DashboardSummary,
  DecisionRow,
  MachineRow,
} from "@/types/crowdsec";
import {
  buildActivityFeed,
  buildAttackTimeline,
  buildDecisionDistribution,
  buildIpIntel,
  buildTopAttackers,
  computeKpiTrends,
} from "@/lib/analytics";
import { formatDateTime, isRecentUnix } from "@/lib/utils";
import type { HealthComponentStatus, HealthMonitoring, IpIntel, SystemInfo } from "@/types/dashboard";

type CrowdSecCredentials = {
  url: string;
  login: string;
  password: string;
};

type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  auth?: "watcher" | "bouncer" | "none";
  method?: string;
};

const CROWDSEC_USER_AGENT = "crowdsec-dashboard/1.0";

let cachedJwt: { token: string; expiresAt: number } | null = null;
let cachedCredentials: CrowdSecCredentials | null = null;

function logCrowdSec(step: string, details?: Record<string, unknown>) {
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.info(`[crowdsec] ${step}${payload}`);
}

function logCrowdSecError(step: string, error: unknown, details?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.error(`[crowdsec] ${step} failed: ${message}${payload}`);
}

export function getCrowdSecEnvStatus() {
  const url = process.env.CROWDSEC_URL;
  const login = process.env.CROWDSEC_LOGIN;
  const password = process.env.CROWDSEC_PASSWORD;
  return {
    hasUrl: Boolean(url?.trim()),
    hasLogin: Boolean(login?.trim()),
    hasPassword: Boolean(password?.trim()),
  };
}

function loadCredentials(): CrowdSecCredentials {
  if (cachedCredentials) return cachedCredentials;

  const envUrl = process.env.CROWDSEC_URL?.trim();
  const envLogin = process.env.CROWDSEC_LOGIN?.trim();
  const envPassword = process.env.CROWDSEC_PASSWORD?.trim();

  const missing = [
    !envUrl ? "CROWDSEC_URL" : null,
    !envLogin ? "CROWDSEC_LOGIN" : null,
    !envPassword ? "CROWDSEC_PASSWORD" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `CrowdSec credentials are not configured. Set these environment variables in .env.local: ${missing.join(", ")}`,
    );
  }

  cachedCredentials = {
    url: envUrl!.replace(/\/$/, ""),
    login: envLogin!,
    password: envPassword!,
  };

  logCrowdSec("credentials loaded", {
    source: "environment",
    url: cachedCredentials.url,
    login: cachedCredentials.login,
  });

  return cachedCredentials;
}

function crowdsecBaseUrl() {
  return loadCredentials().url;
}

function buildApiUrl(path: string, query?: RequestOptions["query"]) {
  const base = crowdsecBaseUrl();
  let url: URL;
  try {
    url = new URL(`${base}/v1${path}`);
  } catch (error) {
    throw new Error(`Invalid CrowdSec URL "${base}": ${error instanceof Error ? error.message : "malformed URL"}`);
  }

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parseResponse<T>(response: Response, requestUrl: string): Promise<T> {
  const text = await response.text();
  let payload: { message?: string; errors?: string } | null = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(
        `CrowdSec returned non-JSON from ${requestUrl} (${response.status} ${response.statusText}): ${text.slice(0, 200)}`,
      );
    }
  }

  if (!response.ok) {
    const detail = payload?.message || payload?.errors || text || response.statusText;
    throw new Error(`CrowdSec ${requestUrl} returned ${response.status}: ${detail}`);
  }

  return payload as T;
}

function clearJwtCache() {
  cachedJwt = null;
}

export async function testWatcherLogin() {
  const { login, password, url } = loadCredentials();
  const requestUrl = buildApiUrl("/watchers/login");

  logCrowdSec("debug login start", { url, login, requestUrl });

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": CROWDSEC_USER_AGENT,
      },
      body: JSON.stringify({ machine_id: login, password }),
      cache: "no-store",
    });

    const text = await response.text();
    let crowdsecResponse: unknown = null;
    if (text) {
      try {
        crowdsecResponse = JSON.parse(text);
      } catch {
        crowdsecResponse = { raw: text.slice(0, 500) };
      }
    }

    if (crowdsecResponse && typeof crowdsecResponse === "object" && crowdsecResponse !== null && "token" in crowdsecResponse) {
      const { token: _removedToken, ...safe } = crowdsecResponse as { token?: string };
      void _removedToken;
      return {
        success: response.ok,
        status: response.status,
        crowdsecResponse: safe,
      };
    }

    return {
      success: response.ok,
      status: response.status,
      crowdsecResponse,
    };
  } catch (error) {
    logCrowdSecError("debug login", error, { url, login });
    return {
      success: false,
      status: 0,
      crowdsecResponse: { message: error instanceof Error ? error.message : "Login request failed" },
    };
  }
}

async function getWatcherJwt(forceRefresh = false) {
  if (!forceRefresh && cachedJwt && cachedJwt.expiresAt > Date.now() + 30_000) {
    logCrowdSec("jwt cache hit", { expiresAt: new Date(cachedJwt.expiresAt).toISOString() });
    return cachedJwt.token;
  }

  const { login, password } = loadCredentials();
  const requestUrl = buildApiUrl("/watchers/login");

  logCrowdSec("jwt login start", { requestUrl, login });

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": CROWDSEC_USER_AGENT,
    },
    body: JSON.stringify({ machine_id: login, password }),
    cache: "no-store",
  });

  const payload = await parseResponse<{ token?: string; expire?: string }>(response, requestUrl);
  if (!payload.token) {
    throw new Error("CrowdSec login response did not include a token");
  }

  const expiresAt = payload.expire ? new Date(payload.expire).getTime() : Date.now() + 10 * 60_000;
  cachedJwt = { token: payload.token, expiresAt };

  logCrowdSec("jwt login success", { expiresAt: new Date(expiresAt).toISOString() });

  return payload.token;
}

async function crowdsecFetch<T>(path: string, options: RequestOptions = {}, retryOnAuth = true): Promise<T> {
  const requestUrl = buildApiUrl(path, options.query);
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": CROWDSEC_USER_AGENT,
  };

  if (options.auth !== "none") {
    if (options.auth === "bouncer") {
      const apiKey = process.env.CROWDSEC_BOUNCER_API_KEY?.trim();
      if (!apiKey) throw new Error("CROWDSEC_BOUNCER_API_KEY is not configured");
      headers["X-Api-Key"] = apiKey;
    } else {
      headers.Authorization = `Bearer ${await getWatcherJwt()}`;
    }
  }

  logCrowdSec("fetch start", {
    method: options.method || "GET",
    path,
    requestUrl,
    auth: options.auth || "watcher",
  });

  const response = await fetch(requestUrl, {
    method: options.method || "GET",
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && options.auth === "watcher" && retryOnAuth) {
    logCrowdSec("fetch auth retry", { path, status: response.status });
    clearJwtCache();
    return crowdsecFetch<T>(path, options, false);
  }

  try {
    const data = await parseResponse<T>(response, requestUrl);
    logCrowdSec("fetch success", { path, status: response.status });
    return data;
  } catch (error) {
    logCrowdSecError("fetch", error, { path, requestUrl, status: response.status });
    throw error;
  }
}

function metaValue(alert: CrowdSecAlert, key: string) {
  return alert.meta?.find((item) => item.key?.toLowerCase() === key.toLowerCase())?.value;
}

function alertIp(alert: CrowdSecAlert) {
  return alert.source?.ip || alert.source?.value || metaValue(alert, "source_ip") || metaValue(alert, "target_ip") || "Unknown";
}

function alertCountry(alert: CrowdSecAlert) {
  return alert.source?.country || metaValue(alert, "IsoCode") || metaValue(alert, "country") || "Unknown";
}

function alertTime(alert: CrowdSecAlert) {
  return alert.created_at || alert.start_at || alert.updated_at || alert.stop_at || "";
}

function normalizeAlert(alert: CrowdSecAlert, index = 0): AlertRow {
  const decisions = alert.decisions || [];
  const hasDecision = decisions.length > 0;
  const simulated = decisions.some((decision) => decision.simulated);
  return {
    id: String(alert.id || alert.uuid || `${alertTime(alert)}-${index}`),
    time: alertTime(alert),
    sourceIp: alertIp(alert),
    scenario: alert.scenario || metaValue(alert, "scenario") || "Unknown scenario",
    country: alertCountry(alert),
    eventsCount: alert.events_count || alert.events?.length || 0,
    hasDecision,
    decisionStatus: simulated ? "Simulated" : hasDecision ? "Active" : "None",
    message: alert.message || "CrowdSec alert",
    machine: alert.machine_id || "Unknown",
    raw: alert,
  };
}

function normalizeDecision(decision: CrowdSecDecision, index = 0, country = "Unknown"): DecisionRow {
  return {
    id: String(decision.id || `${decision.value || "decision"}-${index}`),
    ip: decision.value || "Unknown",
    action: decision.type || "ban",
    reason: decision.reason || decision.scenario || "CrowdSec decision",
    country,
    duration: decision.duration || "Unknown",
    expiration: decision.until || "Unknown",
    scenario: decision.scenario || "Unknown scenario",
    raw: decision,
  };
}

function topBy<T extends string>(values: T[], fallback: string, limit = 7) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = value || fallback;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function deriveDecisionsFromAlerts(alerts: CrowdSecAlert[]) {
  const rows: DecisionRow[] = [];
  alerts.forEach((alert, alertIndex) => {
    (alert.decisions || []).forEach((decision, index) => {
      rows.push(normalizeDecision(decision, alertIndex + index, alertCountry(alert)));
    });
  });
  return rows;
}

function unixFromIso(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : Math.floor(parsed / 1000);
}

function buildMetricsFromAlerts(alerts: CrowdSecAlert[]): CrowdSecMetrics {
  const machines = new Map<string, { lastActivity: number }>();

  alerts.forEach((alert) => {
    const machineId = alert.machine_id;
    if (!machineId) return;
    const activity = unixFromIso(alertTime(alert));
    const existing = machines.get(machineId);
    if (!existing || activity > existing.lastActivity) {
      machines.set(machineId, { lastActivity: activity });
    }
  });

  return {
    log_processors: Array.from(machines.entries()).map(([name, info]) => ({
      name,
      last_push: info.lastActivity,
      last_update: info.lastActivity,
      version: "Unknown",
    })),
    remediation_components: [],
    lapi: {
      version: undefined,
    },
  };
}

function normalizeMachines(metrics: CrowdSecMetrics | null): MachineRow[] {
  return (metrics?.log_processors || []).map((machine, index) => ({
    id: machine.name || String(index),
    name: machine.name || `machine-${index + 1}`,
    lastHeartbeat: machine.last_push ? formatDateTime(machine.last_push) : formatDateTime(machine.last_update),
    version: machine.version || "Unknown",
    status: isRecentUnix(machine.last_push || machine.last_update, 180) ? "Online" : "Offline",
  }));
}

function normalizeBouncers(metrics: CrowdSecMetrics | null): BouncerRow[] {
  return (metrics?.remediation_components || []).map((bouncer, index) => {
    const healthy = isRecentUnix(bouncer.last_pull, 180);
    const warning = isRecentUnix(bouncer.last_pull, 900);
    return {
      id: bouncer.name || String(index),
      name: bouncer.name || `bouncer-${index + 1}`,
      type: bouncer.type || "remediation",
      lastPull: bouncer.last_pull ? formatDateTime(bouncer.last_pull) : "Unknown",
      status: healthy ? "Healthy" : warning ? "Warning" : "Offline",
    };
  });
}

async function checkLapiReachable() {
  const base = crowdsecBaseUrl();
  const healthUrl = `${base}/health`;
  const response = await fetch(healthUrl, {
    headers: { Accept: "application/json", "User-Agent": CROWDSEC_USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CrowdSec health check ${healthUrl} returned ${response.status}`);
  }

  logCrowdSec("lapi health ok", { healthUrl, status: response.status });
}

async function checkWatcherSession() {
  await crowdsecFetch<void>("/heartbeat", { auth: "watcher" });
  logCrowdSec("watcher heartbeat ok");
}

export async function getAlerts(params?: { limit?: number; search?: string; scenario?: string }) {
  const alerts = await crowdsecFetch<CrowdSecAlert[]>("/alerts", {
    auth: "watcher",
    query: { limit: params?.limit || 100, scenario: params?.scenario },
  });
  const normalized = alerts.map(normalizeAlert);
  const search = params?.search?.toLowerCase();
  if (!search) return normalized;
  return normalized.filter((alert) =>
    [alert.sourceIp, alert.scenario, alert.country, alert.machine, alert.message].some((value) =>
      value.toLowerCase().includes(search),
    ),
  );
}

export async function getAlertById(id: string) {
  const alerts = await getAlerts({ limit: 500 });
  return alerts.find((alert) => alert.id === id) || null;
}

export async function getDecisions(params?: { search?: string }) {
  let rows: DecisionRow[] = [];
  if (process.env.CROWDSEC_BOUNCER_API_KEY?.trim()) {
    const decisions = await crowdsecFetch<CrowdSecDecision[]>("/decisions", { auth: "bouncer" });
    rows = decisions.map((decision, index) => normalizeDecision(decision, index));
  } else {
    const alerts = await crowdsecFetch<CrowdSecAlert[]>("/alerts", {
      auth: "watcher",
      query: { limit: 200, has_active_decision: true, simulated: true },
    });
    rows = deriveDecisionsFromAlerts(alerts);
  }

  const search = params?.search?.toLowerCase();
  if (!search) return rows;
  return rows.filter((decision) =>
    [decision.ip, decision.action, decision.reason, decision.country, decision.duration, decision.scenario].some((value) =>
      value.toLowerCase().includes(search),
    ),
  );
}

export async function getMetrics() {
  const alerts = await crowdsecFetch<CrowdSecAlert[]>("/alerts", {
    auth: "watcher",
    query: { limit: 500 },
  });
  return buildMetricsFromAlerts(alerts);
}

export async function getMachines() {
  return normalizeMachines(await getMetrics());
}

export async function getBouncers() {
  return normalizeBouncers(await getMetrics());
}

async function fetchCrowdSecVersion(): Promise<string> {
  try {
    const base = crowdsecBaseUrl();
    const prometheusUrl = base.replace(":8080", ":6060") + "/metrics";
    const response = await fetch(prometheusUrl, { cache: "no-store" });
    if (!response.ok) return "Unknown";
    const text = await response.text();
    const match = text.match(/crowdsec_version\{[^}]*\}\s+(\S+)/) || text.match(/version="([^"]+)"/);
    return match?.[1] || "Unknown";
  } catch {
    return "Unknown";
  }
}

function maskMachineId(login: string) {
  if (login.length <= 8) return login;
  return `${login.slice(0, 6)}…${login.slice(-4)}`;
}

function buildHealthMonitoring(health: CrowdSecHealth, machines: MachineRow[], bouncers: BouncerRow[]): HealthMonitoring {
  const toStatus = (ok: boolean, warn?: boolean): HealthComponentStatus => {
    if (ok) return "healthy";
    if (warn) return "warning";
    return "critical";
  };

  const lapiOk = health.ok && health.status === "connected";
  const authOk = lapiOk;
  const onlineMachines = machines.filter((m) => m.status === "Online").length;
  const activeBouncers = bouncers.filter((b) => b.status !== "Offline").length;

  const components = [
    {
      id: "engine",
      label: "CrowdSec Engine",
      status: toStatus(lapiOk),
      detail: lapiOk ? "LAPI responding" : "Engine unreachable",
    },
    {
      id: "lapi",
      label: "LAPI",
      status: toStatus(lapiOk),
      detail: health.message || (lapiOk ? "Connected" : "Offline"),
    },
    {
      id: "auth",
      label: "Machine Authentication",
      status: toStatus(authOk),
      detail: authOk ? `Watcher JWT valid · ${onlineMachines} machine(s) online` : "Authentication failed",
    },
    {
      id: "bouncers",
      label: "Bouncers",
      status: bouncers.length === 0 ? "warning" : toStatus(activeBouncers > 0, activeBouncers === 0),
      detail: bouncers.length ? `${activeBouncers}/${bouncers.length} active` : "No bouncers registered",
    },
    {
      id: "api",
      label: "API Connectivity",
      status: toStatus(lapiOk),
      detail: lapiOk ? "All endpoints reachable" : "Connection errors detected",
    },
  ];

  const overall: HealthComponentStatus = components.some((c) => c.status === "critical")
    ? "critical"
    : components.some((c) => c.status === "warning")
      ? "warning"
      : "healthy";

  return { components, overall };
}

export async function getHealth(): Promise<CrowdSecHealth> {
  try {
    logCrowdSec("health check start");
    await checkLapiReachable();
    await checkWatcherSession();
    const version = await fetchCrowdSecVersion();
    return {
      ok: true,
      status: "connected",
      lapiVersion: version !== "Unknown" ? version : undefined,
      message: "Connected to CrowdSec LAPI",
    };
  } catch (error) {
    logCrowdSecError("health check", error);
    return {
      ok: false,
      status: "offline",
      message: error instanceof Error ? error.message : "Unable to connect to CrowdSec LAPI",
    };
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const health = await getHealth();
  const { login, url } = loadCredentials();
  const version = await fetchCrowdSecVersion();

  return {
    dashboardVersion: process.env.npm_package_version || "0.1.0",
    crowdsecVersion: version,
    lapiVersion: health.lapiVersion || (health.ok ? "Connected" : "Unknown"),
    machineId: maskMachineId(login),
    os: process.platform,
    lapiUrl: url,
    lastSync: new Date().toISOString(),
    authStatus: health.ok ? "authenticated" : "offline",
  };
}

export async function getIpIntel(ip: string): Promise<IpIntel | null> {
  const [alerts, decisions] = await Promise.all([getAlerts({ limit: 500 }), getDecisions()]);
  return buildIpIntel(ip, alerts, decisions);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [alerts, decisions, metrics, health] = await Promise.all([
    getAlerts({ limit: 200 }),
    getDecisions(),
    getMetrics().catch(() => null),
    getHealth(),
  ]);

  const machines = normalizeMachines(metrics);
  const bouncers = normalizeBouncers(metrics);
  const topCountries = topBy(alerts.map((alert) => alert.country), "Unknown").map(([country, count]) => ({
    country,
    alerts: count,
  }));
  const topIps = topBy(alerts.map((alert) => alert.sourceIp), "Unknown").map(([ip, count]) => ({ ip, alerts: count }));
  const scenarioDistribution = topBy(alerts.map((alert) => alert.scenario), "Unknown", 8).map(([scenario, count]) => ({
    scenario,
    value: count,
  }));

  const attackTimeline = buildAttackTimeline(alerts);

  return {
    totalAlerts: alerts.length,
    activeDecisions: decisions.length,
    registeredMachines: machines.length,
    activeBouncers: bouncers.filter((bouncer) => bouncer.status !== "Offline").length,
    alertsTimeline: attackTimeline.hourly.map((b) => ({ time: b.label, alerts: b.alerts })),
    topCountries,
    topIps,
    scenarioDistribution,
    recentAlerts: alerts.slice(0, 10),
    recentDecisions: decisions.slice(0, 10),
    machines,
    bouncers,
    health,
    lastUpdated: new Date().toISOString(),
    kpiTrends: computeKpiTrends(alerts, decisions, machines, bouncers),
    healthMonitoring: buildHealthMonitoring(health, machines, bouncers),
    activityFeed: buildActivityFeed(alerts, decisions, machines),
    topAttackers: buildTopAttackers(alerts),
    attackTimeline,
    decisionDistribution: buildDecisionDistribution(decisions),
  };
}
