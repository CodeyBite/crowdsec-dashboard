import type { ApiEnvelope } from "@/types/crowdsec";

/** Runtime validation for API envelope responses — guards against malformed LAPI data */
export function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "lastUpdated" in payload &&
    typeof (payload as ApiEnvelope<T>).lastUpdated === "string"
  );
}

export function assertApiEnvelope<T>(payload: unknown): ApiEnvelope<T> {
  if (!isApiEnvelope<T>(payload)) {
    throw new Error("Invalid API response envelope");
  }
  return payload;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
