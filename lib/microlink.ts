import { encode } from "qss";

type MicrolinkResponse = {
  status?: string;
  message?: string;
  data?: {
    screenshot?: {
      url?: string;
    };
  };
};

export async function fetchMicrolinkScreenshotUrl(
  url: string
): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const params = encode({
    url: trimmed,
    screenshot: true,
    meta: false,
    colorScheme: "dark",
    "viewport.isMobile": false,
    "viewport.deviceScaleFactor": 1,
    "viewport.width": 1440,
    "viewport.height": 900,
  });

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const apiKey = process.env.MICROLINK_API_KEY?.trim();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(`https://api.microlink.io/?${params}`, {
      headers,
      signal: AbortSignal.timeout(45_000),
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error(
        "[microlink] Unexpected response type:",
        contentType,
        "for",
        trimmed
      );
      return null;
    }

    const json = (await res.json()) as MicrolinkResponse;

    if (!res.ok || json.status === "fail" || json.status === "error") {
      console.error(
        "[microlink] Request failed:",
        trimmed,
        json.message ?? res.status
      );
      return null;
    }

    const screenshotUrl = json.data?.screenshot?.url;
    return typeof screenshotUrl === "string" && screenshotUrl.trim()
      ? screenshotUrl.trim()
      : null;
  } catch (error) {
    console.error("[microlink] Fetch error for", trimmed, error);
    return null;
  }
}
