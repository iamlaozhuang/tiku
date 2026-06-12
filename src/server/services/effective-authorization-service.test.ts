import { describe, expect, it } from "vitest";

import {
  createEffectiveAuthorizationService,
  type EffectiveAuthorizationClock,
} from "./effective-authorization-service";
import type {
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";

type EffectivePersonalAuthRowFixture = EffectivePersonalAuthRow & {
  effective_edition?: "standard" | "advanced";
};

type EffectiveOrgAuthRowFixture = EffectiveOrgAuthRow & {
  effective_edition?: "standard" | "advanced";
};

const now = new Date("2026-05-18T04:00:00.000Z");
const startsAt = new Date("2026-05-01T04:00:00.000Z");
const futureStartsAt = new Date("2026-05-19T04:00:00.000Z");
const expiredAt = new Date("2026-05-17T04:00:00.000Z");
const personalExpiresAt = new Date("2026-06-18T04:00:00.000Z");
const orgExpiresAt = new Date("2026-07-18T04:00:00.000Z");

const disabledCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
};

const clock: EffectiveAuthorizationClock = {
  now() {
    return now;
  },
};

function createPersonalAuth(
  overrides: Partial<EffectivePersonalAuthRowFixture> = {},
): EffectivePersonalAuthRowFixture {
  return {
    id: 301,
    public_id: "personal_auth_public_123",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: personalExpiresAt,
    status: "active",
    ...overrides,
  };
}

function createOrgAuth(
  overrides: Partial<EffectiveOrgAuthRowFixture> = {},
): EffectiveOrgAuthRowFixture {
  return {
    id: 401,
    public_id: "org_auth_public_456",
    organization_public_id: "org_city_123",
    organization_name: "杭州烟草",
    organization_status: "active",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: orgExpiresAt,
    status: "active",
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<EffectiveAuthorizationRepository> = {},
): EffectiveAuthorizationRepository {
  return {
    async listPersonalAuthsByUserPublicId() {
      return [createPersonalAuth()];
    },
    async listOrgAuthsByUserPublicId() {
      return [createOrgAuth()];
    },
    ...overrides,
  };
}

describe("effective authorization service", () => {
  it("returns the union of active personal and org authorizations", async () => {
    const authorizationService = createEffectiveAuthorizationService(
      createRepository(),
      clock,
    );

    await expect(
      authorizationService.listEffectiveAuthorizations({
        userPublicId: "user_public_123",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizations: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-01T04:00:00.000Z",
            expiresAt: "2026-06-18T04:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            organizationName: null,
          },
          {
            publicId: "org_auth_public_456",
            authorizationType: "org_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-01T04:00:00.000Z",
            expiresAt: "2026-07-18T04:00:00.000Z",
            status: "active",
            organizationPublicId: "org_city_123",
            organizationName: "杭州烟草",
          },
        ],
        effectiveAuthorizations: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth", "org_auth"],
            expiresAt: "2026-07-18T04:00:00.000Z",
            status: "active",
          },
        ],
        authorizationContexts: [
          {
            profession: "monopoly",
            level: 3,
            contextDisplayStatus: "display_only",
            effectiveEdition: "standard",
            authorizationSource: "personal_auth",
            authorizationPublicId: "personal_auth_public_123",
            ownerType: "personal",
            ownerPublicId: "user_public_123",
            organizationPublicId: null,
            quotaOwnerType: "personal",
            quotaOwnerPublicId: "user_public_123",
            capabilities: disabledCapabilities,
            blockedReason: null,
          },
          {
            profession: "monopoly",
            level: 3,
            contextDisplayStatus: "display_only",
            effectiveEdition: "standard",
            authorizationSource: "org_auth",
            authorizationPublicId: "org_auth_public_456",
            ownerType: "organization",
            ownerPublicId: "org_city_123",
            organizationPublicId: "org_city_123",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "org_city_123",
            capabilities: disabledCapabilities,
            blockedReason: null,
          },
        ],
      },
    });
  });

  it("builds org advanced display contexts without leaking sensitive source fields", async () => {
    const plaintextRedeemCode = "plain-redeem-code-value";
    const rawProviderPayload = "raw-provider-payload";
    const rawPrompt = "raw-prompt-value";
    const connectionLocator = "sensitive-connection-locator";
    const credentialMarker = "sensitive-credential-marker";
    const sessionMarker = "sensitive-session-marker";
    const authorizationService = createEffectiveAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [];
        },
        async listOrgAuthsByUserPublicId() {
          return [
            createOrgAuth({
              effective_edition: "advanced",
              plaintextRedeemCode,
              rawProviderPayload,
              rawPrompt,
              connectionLocator,
              credentialMarker,
              sessionMarker,
            } as Partial<EffectiveOrgAuthRowFixture>),
          ];
        },
      }),
      clock,
      {
        isProductionEnablementConfigured: true,
      },
    );

    const response = await authorizationService.listEffectiveAuthorizations({
      userPublicId: "employee_public_123",
    });
    const serializedResponse = JSON.stringify(response);

    expect(response).toMatchObject({
      code: 0,
      data: {
        authorizationContexts: [
          {
            contextDisplayStatus: "display_only",
            effectiveEdition: "advanced",
            authorizationSource: "org_auth",
            authorizationPublicId: "org_auth_public_456",
            ownerType: "organization",
            ownerPublicId: "org_city_123",
            organizationPublicId: "org_city_123",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "org_city_123",
            capabilities: {
              ...disabledCapabilities,
              canCreateOrganizationTraining: true,
              canAnswerOrganizationTraining: true,
              canViewOrganizationTrainingSummary: true,
            },
            blockedReason: null,
          },
        ],
      },
    });
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain(plaintextRedeemCode);
    expect(serializedResponse).not.toContain(rawProviderPayload);
    expect(serializedResponse).not.toContain(rawPrompt);
    expect(serializedResponse).not.toContain(connectionLocator);
    expect(serializedResponse).not.toContain(credentialMarker);
    expect(serializedResponse).not.toContain(sessionMarker);
  });

  it("excludes expired, cancelled, disabled, and not-yet-started authorization sources", async () => {
    const authorizationService = createEffectiveAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [
            createPersonalAuth(),
            createPersonalAuth({
              public_id: "personal_auth_expired",
              expires_at: expiredAt,
            }),
            createPersonalAuth({
              public_id: "personal_auth_cancelled",
              status: "cancelled",
            }),
            createPersonalAuth({
              public_id: "personal_auth_future",
              starts_at: futureStartsAt,
            }),
          ];
        },
        async listOrgAuthsByUserPublicId() {
          return [
            createOrgAuth({
              organization_status: "disabled",
            }),
            createOrgAuth({
              public_id: "org_auth_active_marketing",
              organization_public_id: "org_marketing_123",
              organization_name: "营销烟草",
              profession: "marketing",
              level: 2,
            }),
          ];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listEffectiveAuthorizations({
        userPublicId: "user_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        authorizations: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
          },
          {
            publicId: "org_auth_active_marketing",
            authorizationType: "org_auth",
          },
        ],
        effectiveAuthorizations: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth"],
          },
          {
            profession: "marketing",
            level: 2,
            authorizationTypes: ["org_auth"],
          },
        ],
      },
    });
  });

  it("enables personal advanced AI display capabilities when local production enablement is configured", async () => {
    const authorizationService = createEffectiveAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [
            createPersonalAuth({
              effective_edition: "advanced",
            }),
          ];
        },
        async listOrgAuthsByUserPublicId() {
          return [];
        },
      }),
      clock,
      {
        isProductionEnablementConfigured: true,
      },
    );

    await expect(
      authorizationService.listEffectiveAuthorizations({
        userPublicId: "user_public_advanced",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        authorizationContexts: [
          {
            effectiveEdition: "advanced",
            authorizationSource: "personal_auth",
            ownerType: "personal",
            ownerPublicId: "user_public_advanced",
            quotaOwnerType: "personal",
            quotaOwnerPublicId: "user_public_advanced",
            capabilities: {
              ...disabledCapabilities,
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
            },
            blockedReason: null,
          },
        ],
      },
    });
  });

  it("keeps advanced capabilities blocked when production enablement is missing", async () => {
    const authorizationService = createEffectiveAuthorizationService(
      createRepository({
        async listPersonalAuthsByUserPublicId() {
          return [
            createPersonalAuth({
              effective_edition: "advanced",
            }),
          ];
        },
        async listOrgAuthsByUserPublicId() {
          return [];
        },
      }),
      clock,
    );

    await expect(
      authorizationService.listEffectiveAuthorizations({
        userPublicId: "user_public_advanced",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        authorizationContexts: [
          {
            effectiveEdition: "advanced",
            capabilities: disabledCapabilities,
            blockedReason: "production_enablement_blocked",
          },
        ],
      },
    });
  });
});
