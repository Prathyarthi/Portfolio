export const MAX_STORED_URL_CHARS = 2_048;

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const URL_FIELD_NAME = /(?:url|link|href)$/i;
const EXPLICIT_SCHEME = /^[A-Za-z][A-Za-z\d+.-]*:/;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

function validateStoredUrl(value: string, fieldName: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new ContentValidationError(`${fieldName} cannot be empty`);
  }
  if (CONTROL_CHARACTERS.test(normalized)) {
    throw new ContentValidationError(`${fieldName} contains control characters`);
  }

  const candidate = normalized.startsWith("//")
    ? `https:${normalized}`
    : EXPLICIT_SCHEME.test(normalized)
      ? normalized
      : `https://${normalized}`;
  if (candidate.length > MAX_STORED_URL_CHARS) {
    throw new ContentValidationError(
      `${fieldName} must be at most ${MAX_STORED_URL_CHARS} characters`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new ContentValidationError(`${fieldName} must be a valid URL`);
  }

  if (parsed.username || parsed.password) {
    throw new ContentValidationError(`${fieldName} must not contain credentials`);
  }

  const isHttps = parsed.protocol === "https:";
  const isLocalDevelopmentHttp =
    process.env.NODE_ENV !== "production"
    && parsed.protocol === "http:"
    && LOCAL_HOSTNAMES.has(parsed.hostname);
  if (!isHttps && !isLocalDevelopmentHttp) {
    throw new ContentValidationError(
      `${fieldName} must use HTTPS${process.env.NODE_ENV !== "production" ? " (HTTP is allowed only for local development)" : ""}`,
    );
  }

  return parsed.toString();
}

export function normalizeRequiredStoredUrl(value: string, fieldName = "URL") {
  return validateStoredUrl(value, fieldName);
}

export function normalizeOptionalStoredUrl(
  value: string | null | undefined,
  fieldName = "URL",
) {
  if (value == null || !value.trim()) return null;
  return validateStoredUrl(value, fieldName);
}

export function sanitizeImportedStoredUrl(
  value: string | null | undefined,
  fieldName = "URL",
) {
  try {
    return normalizeOptionalStoredUrl(value, fieldName);
  } catch (error) {
    if (error instanceof ContentValidationError) return null;
    throw error;
  }
}

export function normalizeStoredUrlsInJson(value: unknown, path = "content"): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      normalizeStoredUrlsInJson(item, `${path}[${index}]`),
    );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => {
        if (URL_FIELD_NAME.test(key) && typeof nestedValue === "string") {
          return [
            key,
            normalizeOptionalStoredUrl(nestedValue, `${path}.${key}`) ?? "",
          ];
        }
        return [key, normalizeStoredUrlsInJson(nestedValue, `${path}.${key}`)];
      }),
    );
  }

  return value;
}

export function sanitizeImportedStoredUrlsInJson(
  value: unknown,
  path = "content",
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeImportedStoredUrlsInJson(item, `${path}[${index}]`),
    );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => {
        if (URL_FIELD_NAME.test(key) && typeof nestedValue === "string") {
          return [
            key,
            sanitizeImportedStoredUrl(nestedValue, `${path}.${key}`) ?? "",
          ];
        }
        return [
          key,
          sanitizeImportedStoredUrlsInJson(nestedValue, `${path}.${key}`),
        ];
      }),
    );
  }

  return value;
}
