import { describe, expect, it } from "vitest";

import { buildAuthorizationSourceReasonSummaryReadModel } from "./authorization-source-reason-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const dbRowPrivateStatus = "db-row-private-status";

function createBaseInput() {
  return {
    id: 974,
    userPublicId: "user_public_123",
    selectedAuthorizationPublicId: "personal_auth_public_123",
    authorizationSources: [
      {
        id: 975,
        publicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
        redeemCodePublicId: "redeem_code_public_123",
        plaintextRedeemCode,
      },
      {
        id: 976,
        publicId: "org_auth_public_456",
        authorizationType: "org_auth",
        profession: "marketing",
        level: 2,
        startsAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-31T00:00:00.000Z",
        status: "expired",
        organizationPublicId: "organization_public_456",
        redeemCodePublicId: null,
        dbRowPrivateStatus,
      },
    ],
  };
}

describe("authorization source reason summary service", () => {
  it("summarizes active selected personal_auth as reason_summary_only", () => {
    const result =
      buildAuthorizationSourceReasonSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        selectedAuthorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        selectedAuthorization: {
          publicId: "personal_auth_public_123",
          authorizationType: "personal_auth",
          status: "active",
          organizationPublicId: null,
          sourceReasonCode: "selected_authorization_active",
          redeemCodeReference: {
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(dbRowPrivateStatus);
  });

  it("summarizes inactive selected org_auth without changing permission rules", () => {
    expect(
      buildAuthorizationSourceReasonSummaryReadModel({
        ...createBaseInput(),
        selectedAuthorizationPublicId: "org_auth_public_456",
      }).data,
    ).toMatchObject({
      selectedAuthorization: {
        publicId: "org_auth_public_456",
        authorizationType: "org_auth",
        status: "expired",
        organizationPublicId: "organization_public_456",
        sourceReasonCode: "selected_authorization_inactive",
      },
    });
  });

  it("flags missing selected authorization as reason-only", () => {
    expect(
      buildAuthorizationSourceReasonSummaryReadModel({
        ...createBaseInput(),
        selectedAuthorizationPublicId: "org_auth_public_missing",
      }).data,
    ).toEqual({
      userPublicId: "user_public_123",
      selectedAuthorizationPublicId: "org_auth_public_missing",
      reasonStatus: "reason_summary_only",
      selectedAuthorization: null,
    });
  });

  it("rejects invalid authorization source reason input", () => {
    expect(
      buildAuthorizationSourceReasonSummaryReadModel({
        ...createBaseInput(),
        userPublicId: "",
      }),
    ).toEqual({
      code: 400022,
      message: "Invalid authorization source reason summary input.",
      data: null,
    });
  });
});
