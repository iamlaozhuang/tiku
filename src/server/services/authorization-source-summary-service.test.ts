import { describe, expect, it } from "vitest";

import { buildAuthorizationSourceSummaryReadModel } from "./authorization-source-summary-service";

const sensitiveDbRowStatus = "db_row_private_status";

function createBaseInput() {
  const plaintextRedeemCode = ["PLAIN", "REDEEM", "CODE"].join("-");
  const dbRowPayload = { id: 901, internal_status: sensitiveDbRowStatus };

  return {
    id: 900,
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        id: 901,
        authorizationType: "personal_auth",
        publicId: "personal_auth_public_123",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
        redeemCodePublicId: "redeem_code_public_123",
        plaintextRedeemCode,
        token: "secret-token",
      },
      {
        id: 902,
        authorizationType: "org_auth",
        publicId: "org_auth_public_456",
        profession: "marketing",
        level: 2,
        startsAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-31T00:00:00.000Z",
        status: "expired",
        organizationPublicId: "organization_public_456",
        redeemCodePublicId: null,
        dbRowPayload,
      },
    ],
  };
}

describe("authorization source summary service", () => {
  it("builds a redacted authorization source summary from public references", () => {
    const input = createBaseInput();
    const personalAuthSource = input.authorizationSources[0];
    const orgAuthSource = input.authorizationSources[1];

    if (personalAuthSource === undefined || orgAuthSource === undefined) {
      throw new Error("authorization source summary fixture is incomplete.");
    }

    const result = buildAuthorizationSourceSummaryReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        runtimeStatus: "local_contract_only",
        sourceSummary: {
          totalCount: 2,
          activeCount: 1,
          inactiveCount: 1,
        },
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            redeemCodeReference: {
              publicId: "redeem_code_public_123",
              redactionStatus: "redacted",
            },
          },
          {
            publicId: "org_auth_public_456",
            authorizationType: "org_auth",
            profession: "marketing",
            level: 2,
            startsAt: "2026-05-01T00:00:00.000Z",
            expiresAt: "2026-05-31T00:00:00.000Z",
            status: "expired",
            organizationPublicId: "organization_public_456",
            redeemCodeReference: {
              publicId: null,
              redactionStatus: "redacted",
            },
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(personalAuthSource.token);
    expect(serializedResult).not.toContain(
      personalAuthSource.plaintextRedeemCode,
    );
    expect(serializedResult).not.toContain(sensitiveDbRowStatus);
  });

  it("rejects invalid authorization source input", () => {
    expect(
      buildAuthorizationSourceSummaryReadModel({
        ...createBaseInput(),
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[1],
            organizationPublicId: null,
          },
        ],
      }),
    ).toEqual({
      code: 400013,
      message: "Invalid authorization source summary input.",
      data: null,
    });
  });
});
