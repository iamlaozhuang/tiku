import { describe, expect, it } from "vitest";

import { buildAuthorizationSourceTypeSummaryReadModel } from "./authorization-source-type-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const privateDbPayload = "private-db-payload";

function createBaseInput() {
  return {
    id: 960,
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        id: 961,
        authorizationType: "personal_auth",
        publicId: "personal_auth_public_123",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
        plaintextRedeemCode,
      },
      {
        id: 962,
        authorizationType: "org_auth",
        publicId: "org_auth_public_456",
        effectiveEdition: "advanced",
        profession: "marketing",
        level: 2,
        startsAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-31T00:00:00.000Z",
        status: "expired",
        organizationPublicId: "organization_public_456",
        privateDbPayload,
      },
      {
        id: 963,
        authorizationType: "org_auth",
        publicId: "org_auth_public_789",
        profession: "logistics",
        level: 1,
        startsAt: "2026-06-15T00:00:00.000Z",
        expiresAt: "2026-08-15T00:00:00.000Z",
        status: "active",
        organizationPublicId: "organization_public_789",
      },
    ],
  };
}

describe("authorization source type summary service", () => {
  it("builds local summaries for personal_auth and org_auth sources", () => {
    const result =
      buildAuthorizationSourceTypeSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        runtimeStatus: "local_contract_only",
        sourceSummaryStatus: "personal_org_summary",
        sourceTypeSummary: {
          totalCount: 3,
          personalAuthCount: 1,
          orgAuthCount: 2,
          activePersonalAuthCount: 1,
          activeOrgAuthCount: 1,
          organizationReferenceCount: 2,
        },
        effectiveWindow: {
          earliestStartsAt: "2026-05-01T00:00:00.000Z",
          latestExpiresAt: "2026-08-15T00:00:00.000Z",
        },
        sourceTypes: [
          {
            authorizationPublicId: "personal_auth_public_123",
            authorizationSource: "personal_auth",
            effectiveEdition: "standard",
            ownerType: "personal",
            ownerPublicId: "user_public_123",
            quotaOwnerType: "personal",
            quotaOwnerPublicId: "user_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            summaryStatus: "source_summary_only",
          },
          {
            authorizationPublicId: "org_auth_public_456",
            authorizationSource: "org_auth",
            effectiveEdition: "advanced",
            ownerType: "organization",
            ownerPublicId: "organization_public_456",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization_public_456",
            profession: "marketing",
            level: 2,
            startsAt: "2026-05-01T00:00:00.000Z",
            expiresAt: "2026-05-31T00:00:00.000Z",
            status: "expired",
            organizationPublicId: "organization_public_456",
            summaryStatus: "source_summary_only",
          },
          {
            authorizationPublicId: "org_auth_public_789",
            authorizationSource: "org_auth",
            effectiveEdition: "standard",
            ownerType: "organization",
            ownerPublicId: "organization_public_789",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization_public_789",
            profession: "logistics",
            level: 1,
            startsAt: "2026-06-15T00:00:00.000Z",
            expiresAt: "2026-08-15T00:00:00.000Z",
            status: "active",
            organizationPublicId: "organization_public_789",
            summaryStatus: "source_summary_only",
          },
        ],
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(privateDbPayload);
  });

  it("rejects invalid personal_auth and org_auth local summary input", () => {
    expect(
      buildAuthorizationSourceTypeSummaryReadModel({
        ...createBaseInput(),
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[1],
            organizationPublicId: null,
          },
        ],
      }),
    ).toEqual({
      code: 400022,
      message: "Invalid authorization source type summary input.",
      data: null,
    });
  });
});
