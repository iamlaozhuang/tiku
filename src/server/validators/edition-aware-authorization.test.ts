import { describe, expect, it } from "vitest";

import { normalizeEditionAwareAuthorizationQuery } from "./edition-aware-authorization";

describe("edition-aware authorization validator", () => {
  it("normalizes optional route filters from URL search params", () => {
    expect(
      normalizeEditionAwareAuthorizationQuery(
        new URLSearchParams({
          profession: "monopoly",
          level: "3",
          authorizationSource: "org_auth",
          effectiveEdition: "advanced",
        }),
      ),
    ).toEqual({
      success: true,
      value: {
        profession: "monopoly",
        level: 3,
        authorizationSource: "org_auth",
        effectiveEdition: "advanced",
      },
    });
  });

  it("keeps absent filters as null keys", () => {
    expect(
      normalizeEditionAwareAuthorizationQuery(new URLSearchParams()),
    ).toEqual({
      success: true,
      value: {
        profession: null,
        level: null,
        authorizationSource: null,
        effectiveEdition: null,
      },
    });
  });

  it("rejects unknown enum values and invalid levels", () => {
    expect(
      normalizeEditionAwareAuthorizationQuery(
        new URLSearchParams({
          profession: "sales",
          level: "0",
          authorizationSource: "legacy_auth",
          effectiveEdition: "premium",
        }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid edition-aware authorization query.",
    });
  });
});
