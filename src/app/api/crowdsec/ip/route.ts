import { NextRequest, NextResponse } from "next/server";

import { getIpIntel } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip");
  if (!ip) {
    return NextResponse.json({ message: "Missing ip query parameter" }, { status: 400 });
  }

  try {
    const data = await getIpIntel(ip);
    if (!data) {
      return NextResponse.json({ message: `No intelligence found for ${ip}` }, { status: 404 });
    }
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load IP intelligence" },
      { status: 502 },
    );
  }
}
