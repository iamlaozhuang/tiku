import { describe, expect, it } from "vitest";

import { mapEditionAwareAuthorizationListToApi } from "./edition-aware-authorization-mapper";
import type { EditionAwareAuthorizationContextRow } from "./edition-aware-authorization-mapper";

const expiresAt = new Date("2026-07-18T04:00:00.000Z");

function createAuthorizationContextRow(
  overrides: Partial<EditionAwareAuthorizationContextRow> = {},
): EditionAwareAuthorizationContextRow {
  return {
    authorization_source: "personal_auth",
    authorization_public_id: "personal_auth_public_123",
    edition: "standard",
    effective_edition: "advanced",
    upgrade_status: "active",
    profession: "monopoly",
    level: 3,
    owner_type: "personal",
    owner_public_id: "user_public_123",
    organization_public_id: null,
    quota_owner_type: "personal",
    quota_owner_public_id: "user_public_123",
    expires_at: expiresAt,
    display_status: "active",
    ...overrides,
  };
}

describe("edition-aware authorization mapper", () => {
  it("maps authorization context rows to camelCase DTOs without internal ids", () => {
    const result = mapEditionAwareAuthorizationListToApi([
      createAuthorizationContextRow(),
      createAuthorizationContextRow({
        authorization_source: "org_auth",
        authorization_public_id: "org_auth_public_456",
        edition: "advanced",
        effective_edition: "advanced",
        upgrade_status: "none",
        owner_type: "organization",
        owner_public_id: "org_public_456",
        organization_public_id: "org_public_456",
        quota_owner_type: "organization",
        quota_owner_public_id: "org_public_456",
      }),
    ]);

    expect(JSON.stringify(result)).not.toContain('"id"');
    expect(JSON.stringify(result)).not.toContain("authorization_source");
    expect(JSON.stringify(result)).not.toContain("effective_edition");
    expect(JSON.stringify(result)).not.toContain("quota_owner");
    expect(result).toEqual({
      authorizationContexts: [
        {
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal_auth_public_123",
          edition: "standard",
          effectiveEdition: "advanced",
          upgradeStatus: "active",
          profession: "monopoly",
          level: 3,
          ownerType: "personal",
          ownerPublicId: "user_public_123",
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "user_public_123",
          expiresAt: "2026-07-18T04:00:00.000Z",
          displayStatus: "active",
        },
        {
          authorizationSource: "org_auth",
          authorizationPublicId: "org_auth_public_456",
          edition: "advanced",
          effectiveEdition: "advanced",
          upgradeStatus: "none",
          profession: "monopoly",
          level: 3,
          ownerType: "organization",
          ownerPublicId: "org_public_456",
          organizationPublicId: "org_public_456",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "org_public_456",
          expiresAt: "2026-07-18T04:00:00.000Z",
          displayStatus: "active",
        },
      ],
    });
  });
});
