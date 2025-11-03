import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

function resolveUrl(origin: string, value?: string) {
  if (!value) return undefined;
  try {
    // Absolute URL stays as-is
    if (/^https?:\/\//i.test(value)) return value;
    // Leading slash -> origin + value
    if (value.startsWith("/")) return `${origin}${value}`;
    // Fallback -> origin/value
    return `${origin}/${value}`;
  } catch {
    return value;
  }
}

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const { accountAssociation, miniapp } = minikitConfig;

  const manifest = {
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: {
      version: miniapp.version,
      name: miniapp.name,
      subtitle: miniapp.subtitle,
      description: miniapp.description,
      // URLs normalized to current origin to avoid wrong domains
      iconUrl: resolveUrl(origin, miniapp.iconUrl),
      homeUrl: resolveUrl(origin, typeof miniapp.homeUrl === "string" ? miniapp.homeUrl : undefined),
      // Prefer heroImageUrl; fallback to optional imageUrl if present
      imageUrl: resolveUrl(
        origin,
        miniapp.heroImageUrl ?? (miniapp as Partial<{ imageUrl: string }>).imageUrl
      ),
      buttonTitle: "Open",
      splashImageUrl: resolveUrl(origin, miniapp.splashImageUrl),
      splashBackgroundColor: miniapp.splashBackgroundColor,
      webhookUrl: resolveUrl(origin, miniapp.webhookUrl),
      primaryCategory: miniapp.primaryCategory,
      tags: miniapp.tags,
      screenshotUrls: Array.isArray(miniapp.screenshotUrls)
        ? miniapp.screenshotUrls.map((u) => resolveUrl(origin, u))
        : undefined,
      heroImageUrl: resolveUrl(origin, miniapp.heroImageUrl),
      tagline: miniapp.tagline,
      ogTitle: miniapp.ogTitle,
      ogDescription: miniapp.ogDescription,
      ogImageUrl: resolveUrl(origin, miniapp.ogImageUrl),
      disableNativeGestures: miniapp.disableNativeGestures === true,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}