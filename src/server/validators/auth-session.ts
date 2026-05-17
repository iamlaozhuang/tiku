const BEARER_PREFIX = "bearer ";

export function normalizeBearerToken(
  authorization: string | null | undefined,
): string | null {
  const normalizedAuthorization = authorization?.trim();

  if (!normalizedAuthorization) {
    return null;
  }

  if (!normalizedAuthorization.toLowerCase().startsWith(BEARER_PREFIX)) {
    return null;
  }

  const sessionToken = normalizedAuthorization
    .slice(BEARER_PREFIX.length)
    .trim();

  return sessionToken === "" ? null : sessionToken;
}
