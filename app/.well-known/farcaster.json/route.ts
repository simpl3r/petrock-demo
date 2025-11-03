import { NextResponse } from "next/server";

const HOSTED_MANIFEST_URL =
  "https://api.farcaster.xyz/miniapps/hosted-manifest/019a473c-664d-95f0-78b2-26bc9c836b08";

export function GET() {
  // Temporary 307 redirect to Farcaster Hosted Manifest per publishing checklist
  return NextResponse.redirect(HOSTED_MANIFEST_URL, 307);
}