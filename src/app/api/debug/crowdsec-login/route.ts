import { NextResponse } from "next/server";

import { testWatcherLogin } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await testWatcherLogin();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
