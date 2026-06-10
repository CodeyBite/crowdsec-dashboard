import { NextRequest, NextResponse } from "next/server";

import { getAlertById } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getAlertById(id);
    if (!data) return NextResponse.json({ message: "Alert not found" }, { status: 404 });
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load alert" },
      { status: 502 },
    );
  }
}
