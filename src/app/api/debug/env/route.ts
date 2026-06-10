import { NextResponse } from "next/server";

import { getCrowdSecEnvStatus } from "@/services/crowdsec";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getCrowdSecEnvStatus());
}
