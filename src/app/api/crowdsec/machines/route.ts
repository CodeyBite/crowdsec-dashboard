import { NextResponse } from "next/server";

import { getMachines } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMachines();
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load machines" },
      { status: 502 },
    );
  }
}
