import { describe, expect, it } from "vitest";

import { normalizeAuthorizationSourceTypeSummaryInput } from "./authorization-source-type-summary";

function createBaseInput() {
  return {
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        authorizationType: "personal_auth",
        publicId: "personal_auth_public_123",
        effectiveEdition: "advanced",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
      },
      {
        authorizationType: "org_auth",
        publicId: "org_auth_public_456",
        profession: "marketing",
        level: 2,
        startsAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-31T00:00:00.000Z",
        status: "expired",
        organizationPublicId: "organization_public_456",
      },
    ],
  };
}

describe("authorization source type summary validator", () => {
  it("normalizes local personal_auth and org_auth summary input", () => {
    expect(
      normalizeAuthorizationSourceTypeSummaryInput(createBaseInput()),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            authorizationType: "personal_auth",
            publicId: "personal_auth_public_123",
            effectiveEdition: "advanced",
            organizationPublicId: null,
          },
          {
            authorizationType: "org_auth",
            publicId: "org_auth_public_456",
            effectiveEdition: "standard",
            organizationPublicId: "organization_public_456",
          },
        ],
      },
    });
  });

  it("rejects invalid effective edition values", () => {
    expect(
      normalizeAuthorizationSourceTypeSummaryInput({
        ...createBaseInput(),
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[0],
            effectiveEdition: "enterprise",
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization source type summary input.",
    });
  });

  it("requires org_auth organization public references and personal_auth null organization", () => {
    expect(
      normalizeAuthorizationSourceTypeSummaryInput({
        ...createBaseInput(),
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[0],
            organizationPublicId: "organization_public_123",
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization source type summary input.",
    });

    expect(
      normalizeAuthorizationSourceTypeSummaryInput({
        ...createBaseInput(),
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[1],
            organizationPublicId: null,
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization source type summary input.",
    });
  });
});
