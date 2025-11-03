import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export function GET() {
  const { accountAssociation, miniapp } = minikitConfig;

  const manifest = {
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: {
      version: miniapp.version,
      name: miniapp.name,
      iconUrl: miniapp.iconUrl,
      homeUrl: miniapp.homeUrl,
      imageUrl: miniapp.heroImageUrl ?? miniapp.imageUrl,
      buttonTitle: "Open",
      splashImageUrl: miniapp.splashImageUrl,
      splashBackgroundColor: miniapp.splashBackgroundColor,
      webhookUrl: miniapp.webhookUrl,
      disableNativeGestures: miniapp.disableNativeGestures === true,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}