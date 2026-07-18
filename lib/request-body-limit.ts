import { DEFAULT_JSON_BODY_LIMIT_BYTES } from "@/lib/content-policy";

export async function exceedsRequestBodyLimit(
  request: Request,
  limitBytes = DEFAULT_JSON_BODY_LIMIT_BYTES,
) {
  if (
    request.method === "GET"
    || request.method === "HEAD"
  ) {
    return false;
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > limitBytes) {
    return true;
  }
  if (!request.body) return false;

  const reader = request.clone().body!.getReader();
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return false;
      totalBytes += value.byteLength;
      if (totalBytes > limitBytes) {
        await reader.cancel();
        return true;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
