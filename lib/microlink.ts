import { encode } from "qss";

interface MicrolinkResponse {
  data?: {
    screenshot?: {
      url?: string;
    };
  };
  status?: string;
  message?: string;
}

/** Builds the Microlink API request URL (server-side only). */
export function buildMicrolinkApiUrl(liveUrl: string): string {
  const params = encode({
    url: liveUrl,
    screenshot: true,
    meta: false,
    colorScheme: "dark",
    "viewport.isMobile": false,
    "viewport.deviceScaleFactor": 1,
    "viewport.width": 1440,
    "viewport.height": 900,
    ttl: "1d",
  });

  return `https://api.microlink.io/?${params}`;
}

/**
 * Calls Microlink once and returns the hosted screenshot URL to store in DB.
 */
export async function fetchMicrolinkScreenshotUrl(
  liveUrl: string
): Promise<string | null> {
  const apiUrl = buildMicrolinkApiUrl(liveUrl);
  const headers: HeadersInit = {};
  const apiKey = process.env.MICROLINK_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(apiUrl, {
      headers,
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as MicrolinkResponse;
    const screenshotUrl = json.data?.screenshot?.url;
    return typeof screenshotUrl === "string" && screenshotUrl.trim()
      ? screenshotUrl
      : null;
  } catch {
    return null;
  }
}
