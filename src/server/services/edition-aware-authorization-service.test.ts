import { describe, expect, it } from "vitest";

import {
  createEditionAwareAuthorizationService,
  type EditionAwareAuthorizationClock,
} from "./edition-aware-authorization-service";
import type {
  EditionAwareAuthorizationRepository,
  EditionAwareAuthUpgradeRow,
  EditionAwareOrgAuthRow,
  EditionAwarePersonalAuthRow,
} from "../repositories/edition-aware-authorization-repository";

const now = new Date("2026-06-21T04:00:00.000Z");
const startsAt = new Date("2026-06-01T04:00:00.000Z");
const expiresAt = new Date("2026-07-01T04:00:00.000Z");
const expiredAt = new Date("2026-06-20T04:00:00.000Z");

const clock: EditionAwareAuthorizationClock = {
  now() {
    return now;
  },
};

function createPersonalAuth(
  overrides: Partial<EditionAwarePersonalAuthRow> = {},
): EditionAwarePersonalAuthRow {
  return {
    public_id: "personal_auth_public_123",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    edition: "standard",
    ...overrides,
  };
}

function createOrgAuth(
  overrides: Partial<EditionAwareOrgAuthRow> = {},
): EditionAwareOrgAuthRow {
  return {
    public_id: "org_auth_public_456",
    organization_public_id: "org_public_456",
    organization_status: "active",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    edition: "standard",
    ...overrides,
  };
}

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

function createRepository(
  overrides: Partial<EditionAwareAuthorizationRepository> = {},
): EditionAwareAuthorizationRepository {
  return {
    async listPersonalAuthsByUserPublicId() {
      return [createPersonalAuth()];
    },
    async listOrgAuthsByUserPublicId() {
      return [];
    },
    async listAuthUpgradesByAuthorizationPublicIds() {
      return [];
    },
    ...overrides,
  };
}

describe("edition-aware authorization service", () => {
  it("derives advanced effective edition from an active personal auth upgrade", async () => {
    const authorizationService = createEditionAwareAuthorizationService(
      createRepository({
        async listAuthUpgradesByAuthorizationPublicIds() {
          return [createAuthUpgrade()];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listAuthorizationContexts(
        {
          userPublicId: "user_public_123",
        },
        {
          profession: null,
          level: null,
          authorizationSource: null,
          effectiveEdition: null,
        },
      ),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
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
            expiresAt: "2026-07-01T04:00:00.000Z",
            displayStatus: "active",
          },
        ],
      },
    });
  });

  it("keeps standard effective edition when upgrades are expired or revoked", async () => {
    const authorizationService = createEditionAwareAuthorizationService(
      createRepository({
        async listAuthUpgradesByAuthorizationPublicIds() {
          return [
            createAuthUpgrade({
              public_id: "auth_upgrade_expired_123",
              expires_at: expiredAt,
            }),
            createAuthUpgrade({
              public_id: "auth_upgrade_revoked_456",
              revoked_at: now,
              status: "revoked",
            }),
          ];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listAuthorizationContexts(
        {
          userPublicId: "user_public_123",
        },
        {
          profession: null,
          level: null,
          authorizationSource: null,
          effectiveEdition: null,
        },
      ),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        authorizationContexts: [
          {
            edition: "standard",
            effectiveEdition: "standard",
            upgradeStatus: "revoked",
          },
        ],
      },
    });
  });

  it("uses direct advanced org auth and organization quota owner when source filter matches", async () => {
    const authorizationService = createEditionAwareAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [createPersonalAuth()];
        },
        async listOrgAuthsByUserPublicId() {
          return [
            createOrgAuth({
              edition: "advanced",
            }),
          ];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listAuthorizationContexts(
        {
          userPublicId: "employee_public_123",
        },
        {
          profession: "monopoly",
          level: 3,
          authorizationSource: "org_auth",
          effectiveEdition: "advanced",
        },
      ),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizationContexts: [
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
            expiresAt: "2026-07-01T04:00:00.000Z",
            displayStatus: "active",
          },
        ],
      },
    });
  });

  it("excludes inactive source authorizations and scope mismatches", async () => {
    const authorizationService = createEditionAwareAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [
            createPersonalAuth({
              public_id: "personal_auth_expired",
              expires_at: expiredAt,
            }),
            createPersonalAuth({
              public_id: "personal_auth_cancelled",
              status: "cancelled",
            }),
          ];
        },
        async listOrgAuthsByUserPublicId() {
          return [
            createOrgAuth({
              organization_status: "disabled",
            }),
            createOrgAuth({
              public_id: "org_auth_marketing_789",
              organization_public_id: "org_public_789",
              profession: "marketing",
              level: 2,
            }),
          ];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listAuthorizationContexts(
        {
          userPublicId: "user_public_123",
        },
        {
          profession: "monopoly",
          level: 3,
          authorizationSource: null,
          effectiveEdition: null,
        },
      ),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizationContexts: [],
      },
    });
  });
});
