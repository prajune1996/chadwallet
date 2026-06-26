import { NextResponse } from "next/server";
import { getTokens } from "@/lib/getTokens";

export async function GET() {
  const tokens = await getTokens();
  return NextResponse.json({ tokens });
}
