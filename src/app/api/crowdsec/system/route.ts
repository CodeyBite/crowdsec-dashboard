import { NextResponse } from "next/server";

import { getSystemInfo } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSystemInfo();
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load system information" },
      { status: 502 },
    );
  }
}
