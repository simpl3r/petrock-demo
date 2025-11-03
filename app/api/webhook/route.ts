import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Minimal webhook endpoint to satisfy manifest validation
export async function GET() {
  return NextResponse.json({ ok: true, message: "webhook online" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    // No-op processing; just acknowledge receipt
    return NextResponse.json({ ok: true, received: !!body }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error)?.message ?? "unknown" }, { status: 500 });
  }
}