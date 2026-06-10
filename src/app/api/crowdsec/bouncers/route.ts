import { NextResponse } from "next/server";

import { getBouncers } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getBouncers();
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load bouncers" },
      { status: 502 },
    );
  }
}
