import { describe, expect, it } from "vitest";

import {
  collectEditionAwareAuthorizationPublicIds,
  groupEditionAwareAuthUpgradesByAuthorizationPublicId,
  type EditionAwareAuthUpgradeRow,
  type EditionAwareOrgAuthRow,
  type EditionAwarePersonalAuthRow,
} from "./edition-aware-authorization-repository";

const startsAt = new Date("2026-06-01T04:00:00.000Z");
const expiresAt = new Date("2026-07-01T04:00:00.000Z");

const personalAuth: EditionAwarePersonalAuthRow = {
  public_id: "personal_auth_public_123",
  profession: "monopoly",
  level: 3,
  starts_at: startsAt,
  expires_at: expiresAt,
  status: "active",
  edition: "standard",
};

const orgAuth: EditionAwareOrgAuthRow = {
  public_id: "org_auth_public_456",
  organization_public_id: "org_public_456",
  organization_status: "active",
  profession: "monopoly",
  level: 3,
  starts_at: startsAt,
  expires_at: expiresAt,
  status: "active",
  edition: "advanced",
};

function createAuthUpgrade(
  overrides: Partial<EditionAwareAuthUpgradeRow> = {},
): EditionAwareAuthUpgradeRow {
  return {
    public_id: "auth_upgrade_public_123",
    personal_auth_public_id: "personal_auth_public_123",
    org_auth_public_id: null,
    target_edition: "advanced",
    source_type: "redeem_code",
    starts_at: startsAt,
    expires_at: expiresAt,
    revoked_at: null,
    status: "active",
    ...overrides,
  };
}

describe("edition-aware authorization repository helpers", () => {
  it("collects unique source public ids for upgrade lookup without internal ids", () => {
    expect(
      collectEditionAwareAuthorizationPublicIds({
        personalAuths: [personalAuth, personalAuth],
        orgAuths: [orgAuth],
      }),
    ).toEqual(["personal_auth_public_123", "org_auth_public_456"]);
  });

  it("groups auth upgrades by personal or organization authorization public id", () => {
    const groupedUpgrades =
      groupEditionAwareAuthUpgradesByAuthorizationPublicId([
        createAuthUpgrade(),
        createAuthUpgrade({
          public_id: "auth_upgrade_org_456",
          personal_auth_public_id: null,
          org_auth_public_id: "org_auth_public_456",
          source_type: "ops_manual",
        }),
      ]);

    expect(groupedUpgrades).toEqual({
      personal_auth_public_123: [createAuthUpgrade()],
      org_auth_public_456: [
        createAuthUpgrade({
          public_id: "auth_upgrade_org_456",
          personal_auth_public_id: null,
          org_auth_public_id: "org_auth_public_456",
          source_type: "ops_manual",
        }),
      ],
    });
  });
});
