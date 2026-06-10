import { NextRequest, NextResponse } from "next/server";

import { getAlerts } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const data = await getAlerts({
      limit: Number(searchParams.get("limit") || 200),
      search: searchParams.get("search") || undefined,
      scenario: searchParams.get("scenario") || undefined,
    });
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load alerts" },
      { status: 502 },
    );
  }
}
