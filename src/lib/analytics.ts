import type { ActivityEvent, AttackTimeline, DecisionDistribution, KpiMetrics, TopAttacker, TrendDirection } from "@/types/dashboard";
import type { AlertRow, BouncerRow, DecisionRow, MachineRow } from "@/types/crowdsec";
import { formatDateTime } from "@/lib/utils";

function parseTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function trendDirection(current: number, previous: number): TrendDirection {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

function formatTrendPercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

/** Compute KPI trends by comparing last-hour vs prior-hour windows */
export function computeKpiTrends(alerts: AlertRow[], decisions: DecisionRow[], machines: MachineRow[], bouncers: BouncerRow[]): KpiMetrics {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  const inWindow = (value: string | undefined, start: number, end: number) => {
    const date = parseTime(value);
    if (!date) return false;
    const ts = date.getTime();
    return ts >= start && ts < end;
  };

  const lastHourStart = now - hourMs;
  const prevHourStart = now - 2 * hourMs;

  const alertsLastHour = alerts.filter((a) => inWindow(a.time, lastHourStart, now)).length;
  const alertsPrevHour = alerts.filter((a) => inWindow(a.time, prevHourStart, lastHourStart)).length;

  const decisionsLastHour = decisions.filter((d) => inWindow(d.raw.until || d.expiration, lastHourStart, now) || alerts.some((a) => a.sourceIp === d.ip && inWindow(a.time, lastHourStart, now))).length;
  const decisionsPrevHour = Math.max(0, decisions.length - decisionsLastHour);

  const onlineMachines = machines.filter((m) => m.status === "Online").length;
  const activeBouncers = bouncers.filter((b) => b.status !== "Offline").length;

  const makeTrend = (current: number, previous: number, label: string): KpiMetrics["totalAlerts"] => ({
    direction: trendDirection(current, previous),
    value: formatTrendPercent(current, previous),
    label,
  });

  return {
    totalAlerts: makeTrend(alertsLastHour, alertsPrevHour, "vs prior hour"),
    activeDecisions: makeTrend(decisionsLastHour, decisionsPrevHour, "vs prior hour"),
    registeredMachines: {
      direction: onlineMachines > 0 ? "up" : "neutral",
      value: `${onlineMachines} online`,
      label: "machine status",
    },
    activeBouncers: {
      direction: activeBouncers > 0 ? "up" : "neutral",
      value: `${activeBouncers} active`,
      label: "bouncer status",
    },
    alertsLastHour,
  };
}

/** Build hourly (24 buckets) and daily (14 buckets) attack timelines */
export function buildAttackTimeline(alerts: AlertRow[]): AttackTimeline {
  const hourly = new Map<string, number>();
  const daily = new Map<string, number>();

  alerts.forEach((alert) => {
    const date = parseTime(alert.time);
    if (!date) return;

    const hourKey = new Date(date);
    hourKey.setMinutes(0, 0, 0);
    const hourLabel = formatDateTime(hourKey.toISOString());
    hourly.set(hourLabel, (hourly.get(hourLabel) || 0) + 1);

    const dayKey = new Date(date);
    dayKey.setHours(0, 0, 0, 0);
    const dayLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(dayKey);
    daily.set(dayLabel, (daily.get(dayLabel) || 0) + 1);
  });

  const toBuckets = (map: Map<string, number>, limit: number) =>
    Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-limit)
      .map(([label, count]) => ({ key: label, label, alerts: count }));

  return {
    hourly: toBuckets(hourly, 24),
    daily: toBuckets(daily, 14),
  };
}

/** Normalize decision actions into ban/captcha/throttle/other buckets */
export function buildDecisionDistribution(decisions: DecisionRow[]): DecisionDistribution[] {
  const buckets = new Map<string, number>();
  const labels: Record<string, string> = {
    ban: "Ban",
    captcha: "Captcha",
    throttle: "Throttle",
  };

  decisions.forEach((decision) => {
    const action = (decision.action || "other").toLowerCase();
    const key = labels[action] ? action : "other";
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  const order = ["ban", "captcha", "throttle", "other"];
  return order
    .filter((key) => buckets.has(key))
    .map((action) => ({
      action,
      label: labels[action] || "Other",
      count: buckets.get(action) || 0,
    }));
}

/** Aggregate top attackers with country and last-seen metadata */
export function buildTopAttackers(alerts: AlertRow[], limit = 10): TopAttacker[] {
  const map = new Map<string, { count: number; country: string; lastSeen: string; scenarios: Set<string> }>();

  alerts.forEach((alert) => {
    const ip = alert.sourceIp;
    if (!ip || ip === "Unknown") return;
    const existing = map.get(ip);
    const scenarios = existing?.scenarios || new Set<string>();
    scenarios.add(alert.scenario);
    const lastSeen = !existing || (parseTime(alert.time)?.getTime() || 0) > (parseTime(existing.lastSeen)?.getTime() || 0) ? alert.time : existing.lastSeen;
    map.set(ip, {
      count: (existing?.count || 0) + 1,
      country: alert.country !== "Unknown" ? alert.country : existing?.country || "Unknown",
      lastSeen,
      scenarios,
    });
  });

  return Array.from(map.entries())
    .map(([ip, data]) => ({
      ip,
      count: data.count,
      country: data.country,
      lastSeen: data.lastSeen,
      scenarios: Array.from(data.scenarios).slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Derive recent activity events from alerts, decisions, and machines */
export function buildActivityFeed(alerts: AlertRow[], decisions: DecisionRow[], machines: MachineRow[], limit = 20): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  alerts.slice(0, 15).forEach((alert) => {
    events.push({
      id: `alert-${alert.id}`,
      type: "alert_created",
      title: `Alert: ${alert.scenario}`,
      description: `${alert.sourceIp} from ${alert.country}`,
      timestamp: alert.time,
      severity: alert.decisionStatus === "Active" ? "critical" : "warning",
    });
  });

  decisions.slice(0, 10).forEach((decision) => {
    events.push({
      id: `decision-${decision.id}`,
      type: "decision_created",
      title: `Decision: ${decision.action}`,
      description: `${decision.ip} — ${decision.reason}`,
      timestamp: decision.expiration !== "Unknown" ? decision.expiration : new Date().toISOString(),
      severity: decision.action.toLowerCase() === "ban" ? "critical" : "warning",
    });
  });

  machines.forEach((machine) => {
    events.push({
      id: `machine-${machine.id}`,
      type: machine.status === "Online" ? "machine_connected" : "machine_disconnected",
      title: machine.status === "Online" ? "Machine online" : "Machine offline",
      description: `${machine.name} — last heartbeat ${machine.lastHeartbeat}`,
      timestamp: new Date().toISOString(),
      severity: machine.status === "Online" ? "info" : "warning",
    });
  });

  return events
    .sort((a, b) => (parseTime(b.timestamp)?.getTime() || 0) - (parseTime(a.timestamp)?.getTime() || 0))
    .slice(0, limit);
}

/** Build IP threat intelligence profile from alert corpus */
export function buildIpIntel(ip: string, alerts: AlertRow[], decisions: DecisionRow[]): import("@/types/dashboard").IpIntel | null {
  const ipAlerts = alerts.filter((a) => a.sourceIp === ip);
  if (!ipAlerts.length) return null;

  const ipDecisions = decisions.filter((d) => d.ip === ip);
  const times = ipAlerts.map((a) => parseTime(a.time)).filter(Boolean) as Date[];
  const sorted = times.sort((a, b) => a.getTime() - b.getTime());

  const scenarios = [...new Set(ipAlerts.map((a) => a.scenario))];
  const reasons = [...new Set(ipDecisions.map((d) => d.reason))];
  const country = ipAlerts.find((a) => a.country !== "Unknown")?.country || "Unknown";
  const asn = ipAlerts[0]?.raw.source?.as_name || "Unknown";

  return {
    ip,
    alertCount: ipAlerts.length,
    decisionCount: ipDecisions.length,
    firstSeen: sorted[0]?.toISOString() || "Unknown",
    lastSeen: sorted[sorted.length - 1]?.toISOString() || "Unknown",
    country,
    asn,
    scenarios,
    reasons,
    recentAlerts: ipAlerts.slice(0, 10),
    recentDecisions: ipDecisions.slice(0, 10),
  };
}
