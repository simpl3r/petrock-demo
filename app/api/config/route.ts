export const runtime = "edge";

import { get } from "@vercel/edge-config";

export async function GET() {
  let edgeValue: unknown;
  try {
    edgeValue = await get("showGreeting");
  } catch (err) {
    edgeValue = undefined;
  }

  const envFlag = process.env.NEXT_PUBLIC_SHOW_GREETING === "true";
  const showGreeting = typeof edgeValue === "boolean" ? edgeValue : envFlag;
  const source = typeof edgeValue === "boolean" ? "edge" : "env";

  return new Response(
    JSON.stringify({ showGreeting, source }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        // Не кешируем, чтобы видеть актуальное значение сразу после изменения Edge Config
        "cache-control": "no-store",
      },
    }
  );
}