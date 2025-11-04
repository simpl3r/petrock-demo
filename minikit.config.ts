// Normalize the app root URL to a safe https origin without localhost/IP
function normalizeRootUrl(raw?: string): string {
  const fallback = 'https://petrock-demo.vercel.app';
  const base = raw?.trim();
  const candidate = base
    ? (base.startsWith('http') ? base : `https://${base}`)
    : fallback;
  try {
    const url = new URL(candidate);
    const host = url.hostname;
    const isIpV4 = /^\d+\.\d+\.\d+\.\d+$/.test(host);
    const isIpV6 = /:/.test(host);
    if (url.protocol !== 'https:' || host === 'localhost' || isIpV4 || isIpV6) {
      return fallback;
    }
    // Return origin to avoid accidental paths or trailing slashes
    return url.origin;
  } catch {
    return fallback;
  }
}

const ROOT_URL = normalizeRootUrl(process.env.NEXT_PUBLIC_URL);

const AA_HEADER =
  process.env.MINIAPP_AA_HEADER ||
  "eyJmaWQiOjMzMzc5OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDEzQjM3OEU2OTU2MjVhQmZGYjFFMzJEOTc4MTEzNzg2YmEwNzM3RjYifQ";

const AA_PAYLOAD =
  process.env.MINIAPP_AA_PAYLOAD ||
  "eyJkb21haW4iOiJwZXRyb2NrLWRlbW8udmVyY2VsLmFwcCJ9";

const AA_SIGNATURE =
  process.env.MINIAPP_AA_SIGNATURE ||
  "WS1Hwwz9YvNa5GLCen+WY6Ggk9i8gT8wzIuc6Fc31Kl6i0z3pysifuwCeOT1PfbtK8c1GllcK1sf7rQCzE27xRs=";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  "accountAssociation": {
    "header": AA_HEADER,
    "payload": AA_PAYLOAD,
    "signature": AA_SIGNATURE
  },
  miniapp: {
    version: "1",
    name: "PetRock", 
    subtitle: "Your fun rock", 
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/pet-rock.png`],
    iconUrl: `${ROOT_URL}/pet-rock.png`,
    splashImageUrl: `${ROOT_URL}/pet-rock.png`,
    splashBackgroundColor: "#6200ea",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    disableNativeGestures: true,
    primaryCategory: "social",
    tags: ["petrock", "miniapp", "social", "fun", "companion"],
    heroImageUrl: `${ROOT_URL}/pet-rock.png`, 
    tagline: undefined,
    ogTitle: undefined,
    ogDescription: undefined,
    ogImageUrl: `${ROOT_URL}/pet-rock.png`,
  },
} as const;

