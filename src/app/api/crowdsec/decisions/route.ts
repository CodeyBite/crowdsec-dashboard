import { NextRequest, NextResponse } from "next/server";

import { getDecisions } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await getDecisions({ search: request.nextUrl.searchParams.get("search") || undefined });
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load decisions" },
      { status: 502 },
    );
  }
}
