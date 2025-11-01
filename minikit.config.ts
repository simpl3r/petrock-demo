const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  'http://localhost:3000';

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  "accountAssociation": {
    "header": "eyJmaWQiOjMzMzc5OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDEzQjM3OEU2OTU2MjVhQmZGYjFFMzJEOTc4MTEzNzg2YmEwNzM3RjYifQ",
    "payload": "eyJkb21haW4iOiJwZXRyb2NrLWRlbW8udmVyY2VsLmFwcCJ9",
    "signature": "WS1Hwwz9YvNa5GLCen+WY6Ggk9i8gT8wzIuc6Fc31Kl6i0z3pysifuwCeOT1PfbtK8c1GllcK1sf7rQCzE27xRs="
  },
  miniapp: {
    version: "1",
    name: "PetRock", 
    subtitle: "Your AI Ad Companion", 
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/pet-rock.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

