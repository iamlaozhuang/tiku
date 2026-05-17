import { describe, expect, it } from "vitest";

import { normalizeBearerToken } from "./auth-session";

describe("normalizeBearerToken", () => {
  it("extracts a bearer session token and trims surrounding whitespace", () => {
    expect(normalizeBearerToken("  Bearer session_token_123  ")).toBe(
      "session_token_123",
    );
  });

  it("returns null for missing or malformed authorization headers", () => {
    expect(normalizeBearerToken(null)).toBeNull();
    expect(normalizeBearerToken(undefined)).toBeNull();
    expect(normalizeBearerToken("")).toBeNull();
    expect(normalizeBearerToken("Basic session_token_123")).toBeNull();
    expect(normalizeBearerToken("Bearer")).toBeNull();
    expect(normalizeBearerToken("Bearer   ")).toBeNull();
  });
});
