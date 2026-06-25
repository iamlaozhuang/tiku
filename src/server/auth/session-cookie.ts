export const SESSION_COOKIE_NAME = "tiku_session";
export const COOKIE_BACKED_SESSION_AUTHORIZATION =
  "Bearer __cookie_backed_session__";
const EXPIRED_SESSION_COOKIE_DATE = "Thu, 01 Jan 1970 00:00:00 GMT";

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export function createSessionCookieHeader(
  token: string,
  request: Request,
  expiresAt: string | null,
): string {
  const expiresAtAttribute = expiresAt === null ? null : `Expires=${expiresAt}`;
  const secureAttribute = isSecureRequest(request) ? "Secure" : null;

  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    expiresAtAttribute,
    secureAttribute,
  ]
    .filter((attribute): attribute is string => attribute !== null)
    .join("; ");
}

export function createExpiredSessionCookieHeader(request: Request): string {
  const secureAttribute = isSecureRequest(request) ? "Secure" : null;

  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${EXPIRED_SESSION_COOKIE_DATE}`,
    "Max-Age=0",
    secureAttribute,
  ]
    .filter((attribute): attribute is string => attribute !== null)
    .join("; ");
}

function readSessionCookie(cookieHeader: string | null): string | null {
  if (cookieHeader === null) {
    return null;
  }

  for (const rawCookie of cookieHeader.split(";")) {
    const cookie = rawCookie.trim();
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const cookieName = cookie.slice(0, separatorIndex).trim();

    if (cookieName !== SESSION_COOKIE_NAME) {
      continue;
    }

    const cookieValue = cookie.slice(separatorIndex + 1);
    const decodedCookieValue = (() => {
      try {
        return decodeURIComponent(cookieValue).trim();
      } catch {
        return "";
      }
    })();

    return decodedCookieValue === "" ? null : decodedCookieValue;
  }

  return null;
}

export function getRequestAuthorization(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const normalizedAuthorization = authorization?.trim() ?? null;

  if (
    normalizedAuthorization !== null &&
    normalizedAuthorization !== "" &&
    normalizedAuthorization !== COOKIE_BACKED_SESSION_AUTHORIZATION
  ) {
    return normalizedAuthorization;
  }

  const sessionCredential = readSessionCookie(request.headers.get("cookie"));

  return sessionCredential === null ? null : `Bearer ${sessionCredential}`;
}
