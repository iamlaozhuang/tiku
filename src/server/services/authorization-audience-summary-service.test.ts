import { describe, expect, it } from "vitest";

import { buildAuthorizationAudienceSummaryReadModel } from "./authorization-audience-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";

function createBaseInput() {
  return {
    id: 940,
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        id: 941,
        publicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        organizationPublicId: null,
        plaintextRedeemCode,
      },
      {
        id: 942,
        publicId: "org_auth_public_123",
        authorizationType: "org_auth",
        organizationPublicId: "organization_public_123",
      },
    ],
  };
}

describe("authorization audience summary service", () => {
  it("builds display_only audience metadata for personal_auth and org_auth", () => {
    const result =
      buildAuthorizationAudienceSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        displayStatus: "display_only",
        audienceSummary: {
          totalCount: 2,
          personalAuthCount: 1,
          orgAuthCount: 1,
          organizationReferenceCount: 1,
        },
        audiences: [
          {
            authorizationPublicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            audienceType: "personal_auth",
            organizationPublicId: null,
          },
          {
            authorizationPublicId: "org_auth_public_123",
            authorizationType: "org_auth",
            audienceType: "org_auth",
            organizationPublicId: "organization_public_123",
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
  });

  it("keeps organization references as public references only", () => {
    expect(
      buildAuthorizationAudienceSummaryReadModel(createBaseInput()).data,
    ).toMatchObject({
      audiences: [
        {
          organizationPublicId: null,
        },
        {
          organizationPublicId: "organization_public_123",
        },
      ],
    });
  });

  it("rejects invalid authorization audience input", () => {
    expect(
      buildAuthorizationAudienceSummaryReadModel({
        ...createBaseInput(),
        authorizationSources: [],
      }),
    ).toEqual({
      code: 400017,
      message: "Invalid authorization audience summary input.",
      data: null,
    });
  });
});
