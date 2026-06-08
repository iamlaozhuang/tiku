import { describe, expect, it } from "vitest";

import { normalizeAuthorizationAudienceSummaryInput } from "./authorization-audience-summary";

describe("authorization audience summary validator", () => {
  it("normalizes valid authorization audience input", () => {
    expect(
      normalizeAuthorizationAudienceSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationSources: [
          {
            publicId: " personal_auth_public_123 ",
            authorizationType: "personal_auth",
            organizationPublicId: null,
          },
          {
            publicId: " org_auth_public_123 ",
            authorizationType: "org_auth",
            organizationPublicId: " organization_public_123 ",
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            organizationPublicId: null,
          },
          {
            publicId: "org_auth_public_123",
            authorizationType: "org_auth",
            organizationPublicId: "organization_public_123",
          },
        ],
      },
    });
  });

  it("rejects invalid authorization source audience input", () => {
    expect(
      normalizeAuthorizationAudienceSummaryInput({
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            publicId: "org_auth_public_123",
            authorizationType: "org_auth",
            organizationPublicId: null,
          },
        ],
      }).success,
    ).toBe(false);

    expect(
      normalizeAuthorizationAudienceSummaryInput({
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            publicId: "unknown_auth_public_123",
            authorizationType: "unknown_auth",
            organizationPublicId: null,
          },
        ],
      }).success,
    ).toBe(false);
  });
});
