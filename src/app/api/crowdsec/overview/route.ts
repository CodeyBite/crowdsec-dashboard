import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDashboardSummary();
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load CrowdSec overview" },
      { status: 502 },
    );
  }
}
