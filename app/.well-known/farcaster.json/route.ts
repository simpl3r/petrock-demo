import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export function GET() {
  const manifest = {
    ...minikitConfig,
    baseBuilder: {
      ownerAddress: "0x4a26eEC01bF369bB53f6743bA15952606Cd0536A",
    },
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}