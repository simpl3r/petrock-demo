import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export function GET() {
  const m = minikitConfig.miniapp;

  const frame = {
    name: m.name,
    homeUrl: m.homeUrl,
    iconUrl: m.iconUrl,
    version: m.version,
    imageUrl: m.heroImageUrl,
    subtitle: m.subtitle,
    webhookUrl: m.webhookUrl,
    description: m.description,
    heroImageUrl: m.heroImageUrl,
    screenshotUrls: m.screenshotUrls,
    splashImageUrl: m.splashImageUrl,
    primaryCategory: m.primaryCategory,
    splashBackgroundColor: m.splashBackgroundColor,
  };

  const manifest = {
    frame,
    accountAssociation: minikitConfig.accountAssociation,
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