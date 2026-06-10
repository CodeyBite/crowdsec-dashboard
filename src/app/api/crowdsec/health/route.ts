import { NextResponse } from "next/server";

import { getHealth } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getHealth();
  const body = { data, lastUpdated: new Date().toISOString(), ...(data.ok ? {} : { message: data.message }) };
  return NextResponse.json(body, { status: data.ok ? 200 : 502 });
}
