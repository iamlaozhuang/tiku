import { describe, expect, it, vi } from "vitest";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";
import {
  resolveEffectivePersonalAiGenerationAuthorizationContext,
  resolveOwnedPersonalAiGenerationAuthorizationContext,
  type PersonalAiGenerationAuthorizationUserContext,
} from "./personal-ai-generation-authorization-context";

const startsAt = new Date("2026-07-01T00:00:00.000Z");
const expiresAt = new Date("2026-08-01T00:00:00.000Z");
const currentOrganizationPublicId = "organization_current_001";

const employeeUserContext: PersonalAiGenerationAuthorizationUserContext = {
  userPublicId: "user_employee_001",
  userType: "employee",
  organizationPublicId: currentOrganizationPublicId,
};

const personalUserContext: PersonalAiGenerationAuthorizationUserContext = {
  userPublicId: "user_personal_001",
  userType: "personal",
  organizationPublicId: null,
};

const disabledCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
};

function createPersonalAuth(
  overrides: Partial<EffectivePersonalAuthRow> = {},
): EffectivePersonalAuthRow {
  return {
    id: 101,
    public_id: "personal_auth_employee_owned_001",
    edition: "advanced",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    ...overrides,
  };
}

function createOrgAuth(
  overrides: Partial<EffectiveOrgAuthRow> = {},
): EffectiveOrgAuthRow {
  return {
    id: 201,
    public_id: "org_auth_current_001",
    organization_public_id: currentOrganizationPublicId,
    organization_name: "Current organization",
    organization_status: "active",
    edition: "advanced",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    ...overrides,
  };
}

function createAuthorizationRepository(
  input: {
    personalAuths?: EffectivePersonalAuthRow[];
    orgAuths?: EffectiveOrgAuthRow[];
  } = {},
) {
  return {
    listPersonalAuthsByUserPublicId: vi.fn(async () =>
      Promise.resolve(input.personalAuths ?? []),
    ),
    listOrgAuthsByUserPublicId: vi.fn(async () =>
      Promise.resolve(input.orgAuths ?? []),
    ),
  } satisfies Pick<
    EffectiveAuthorizationRepository,
    "listPersonalAuthsByUserPublicId" | "listOrgAuthsByUserPublicId"
  >;
}

function createPersonalEffectiveContext(
  overrides: Partial<EffectiveAuthorizationContextDto> = {},
): EffectiveAuthorizationContextDto {
  return {
    profession: "monopoly",
    level: 3,
    contextDisplayStatus: "display_only",
    edition: "advanced",
    effectiveEdition: "advanced",
    upgradeStatus: "none",
    expiresAt: expiresAt.toISOString(),
    displayStatus: "active",
    authorizationSource: "personal_auth",
    authorizationPublicId: "personal_auth_employee_owned_001",
    ownerType: "personal",
    ownerPublicId: employeeUserContext.userPublicId,
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: employeeUserContext.userPublicId,
    capabilities: {
      ...disabledCapabilities,
      canGenerateAiQuestion: true,
      canGenerateAiPaper: true,
    },
    blockedReason: null,
    ...overrides,
  };
}

function createOrgEffectiveContext(
  overrides: Partial<EffectiveAuthorizationContextDto> = {},
): EffectiveAuthorizationContextDto {
  return {
    profession: "monopoly",
    level: 3,
    contextDisplayStatus: "display_only",
    edition: "advanced",
    effectiveEdition: "advanced",
    upgradeStatus: "none",
    expiresAt: expiresAt.toISOString(),
    displayStatus: "active",
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_current_001",
    ownerType: "organization",
    ownerPublicId: currentOrganizationPublicId,
    organizationPublicId: currentOrganizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: currentOrganizationPublicId,
    capabilities: {
      ...disabledCapabilities,
      canGenerateAiQuestion: true,
      canGenerateAiPaper: true,
    },
    blockedReason: null,
    ...overrides,
  };
}

function createEffectiveAuthorizationServiceStub(
  authorizationContexts: EffectiveAuthorizationContextDto[],
): Pick<EffectiveAuthorizationService, "listEffectiveAuthorizations"> {
  return {
    listEffectiveAuthorizations: vi.fn(async () =>
      Promise.resolve({
        code: 0,
        message: "ok",
        data: {
          authorizations: [],
          effectiveAuthorizations: [],
          authorizationContexts,
        },
      }),
    ),
  };
}

describe("personal AI generation authorization ownership policy", () => {
  it("resolves an employee-owned personal authorization without substituting organization ownership", async () => {
    const authorizationRepository = createAuthorizationRepository({
      personalAuths: [createPersonalAuth()],
      orgAuths: [createOrgAuth()],
    });

    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: "personal_auth_employee_owned_001",
        userContext: employeeUserContext,
        authorizationRepository,
      }),
    ).resolves.toEqual({
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_employee_owned_001",
      ownerType: "personal",
      ownerPublicId: employeeUserContext.userPublicId,
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: employeeUserContext.userPublicId,
    });
    expect(
      authorizationRepository.listPersonalAuthsByUserPublicId,
    ).toHaveBeenCalledWith(employeeUserContext.userPublicId);
    expect(
      authorizationRepository.listOrgAuthsByUserPublicId,
    ).toHaveBeenCalledWith(employeeUserContext.userPublicId);
  });

  it("resolves only the employee current organization authorization", async () => {
    const authorizationRepository = createAuthorizationRepository({
      orgAuths: [createOrgAuth()],
    });

    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: "org_auth_current_001",
        userContext: employeeUserContext,
        authorizationRepository,
      }),
    ).resolves.toEqual({
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_current_001",
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
      organizationPublicId: employeeUserContext.organizationPublicId,
      quotaOwnerType: "organization",
      quotaOwnerPublicId: employeeUserContext.organizationPublicId,
    });
  });

  it.each([
    {
      name: "foreign personal authorization",
      authorizationPublicId: "personal_auth_foreign_001",
      userContext: employeeUserContext,
      personalAuths: [createPersonalAuth()],
      orgAuths: [],
    },
    {
      name: "old organization authorization",
      authorizationPublicId: "org_auth_old_001",
      userContext: employeeUserContext,
      personalAuths: [],
      orgAuths: [
        createOrgAuth({
          public_id: "org_auth_old_001",
          organization_public_id: "organization_old_001",
        }),
      ],
    },
    {
      name: "organization authorization selected by a personal user",
      authorizationPublicId: "org_auth_current_001",
      userContext: personalUserContext,
      personalAuths: [],
      orgAuths: [createOrgAuth()],
    },
    {
      name: "unknown authorization",
      authorizationPublicId: "authorization_unknown_001",
      userContext: employeeUserContext,
      personalAuths: [createPersonalAuth()],
      orgAuths: [createOrgAuth()],
    },
  ])("rejects $name", async (input) => {
    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: input.authorizationPublicId,
        userContext: input.userContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: input.personalAuths,
          orgAuths: input.orgAuths,
        }),
      }),
    ).resolves.toBeNull();
  });

  it.each([
    {
      name: "duplicate personal rows",
      personalAuths: [
        createPersonalAuth({ id: 101 }),
        createPersonalAuth({ id: 102 }),
      ],
      orgAuths: [],
    },
    {
      name: "same exact id across personal and organization sources",
      personalAuths: [createPersonalAuth()],
      orgAuths: [
        createOrgAuth({ public_id: "personal_auth_employee_owned_001" }),
      ],
    },
  ])("fails closed for $name", async ({ personalAuths, orgAuths }) => {
    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: "personal_auth_employee_owned_001",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths,
          orgAuths,
        }),
      }),
    ).resolves.toBeNull();
  });

  it("uses an inactive and expired raw personal row for history ownership", async () => {
    const expiredPersonalAuth = createPersonalAuth({
      starts_at: new Date("2025-01-01T00:00:00.000Z"),
      expires_at: new Date("2025-01-31T00:00:00.000Z"),
      status: "cancelled",
    });

    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: expiredPersonalAuth.public_id,
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [expiredPersonalAuth],
        }),
      }),
    ).resolves.toMatchObject({
      authorizationSource: "personal_auth",
      authorizationPublicId: expiredPersonalAuth.public_id,
      ownerType: "personal",
    });
  });

  it("uses an inactive and expired raw current-organization row for history ownership", async () => {
    const expiredOrgAuth = createOrgAuth({
      organization_status: "disabled",
      starts_at: new Date("2025-01-01T00:00:00.000Z"),
      expires_at: new Date("2025-01-31T00:00:00.000Z"),
      status: "expired",
    });

    await expect(
      resolveOwnedPersonalAiGenerationAuthorizationContext({
        authorizationPublicId: expiredOrgAuth.public_id,
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          orgAuths: [expiredOrgAuth],
        }),
      }),
    ).resolves.toMatchObject({
      authorizationSource: "org_auth",
      authorizationPublicId: expiredOrgAuth.public_id,
      ownerType: "organization",
      organizationPublicId: employeeUserContext.organizationPublicId,
    });
  });
});

describe("personal AI generation effective policy", () => {
  it("returns the exact personal advanced context for employee question generation", async () => {
    const authorizationContext = createPersonalEffectiveContext();

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
        ]),
      }),
    ).resolves.toEqual(authorizationContext);
  });

  it("returns the exact organization advanced context for employee paper generation", async () => {
    const authorizationContext = createOrgEffectiveContext();

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_paper_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          orgAuths: [createOrgAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
        ]),
      }),
    ).resolves.toEqual(authorizationContext);
  });

  it("allows only the established production-enablement blocked reason exception", async () => {
    const allowedContext = createPersonalEffectiveContext({
      blockedReason: "production_enablement_blocked",
    });
    const deniedContext = createPersonalEffectiveContext({
      blockedReason: "authorization_missing",
    });
    const authorizationRepository = createAuthorizationRepository({
      personalAuths: [createPersonalAuth()],
    });

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: allowedContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository,
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          allowedContext,
        ]),
      }),
    ).resolves.toEqual(allowedContext);

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: deniedContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository,
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          deniedContext,
        ]),
      }),
    ).resolves.toBeNull();
  });

  it("rejects a standard effective authorization", async () => {
    const authorizationContext = createPersonalEffectiveContext({
      edition: "standard",
      effectiveEdition: "standard",
    });

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
        ]),
      }),
    ).resolves.toBeNull();
  });

  it.each([
    {
      name: "profession",
      requestedScope: { profession: "marketing" as const, level: 3 },
    },
    {
      name: "level",
      requestedScope: { profession: "monopoly" as const, level: 4 },
    },
  ])("rejects a wrong requested $name scope", async ({ requestedScope }) => {
    const authorizationContext = createPersonalEffectiveContext();

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope,
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
        ]),
      }),
    ).resolves.toBeNull();
  });

  it.each([
    {
      name: "question capability",
      taskType: "ai_question_generation" as const,
      authorizationContext: createPersonalEffectiveContext({
        capabilities: { ...disabledCapabilities, canGenerateAiPaper: true },
      }),
    },
    {
      name: "paper capability",
      taskType: "ai_paper_generation" as const,
      authorizationContext: createPersonalEffectiveContext({
        capabilities: { ...disabledCapabilities, canGenerateAiQuestion: true },
      }),
    },
  ])("rejects a missing $name", async ({ taskType, authorizationContext }) => {
    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType,
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
        ]),
      }),
    ).resolves.toBeNull();
  });

  it("rejects a foreign raw authorization before consulting effective contexts", async () => {
    const effectiveAuthorizationService =
      createEffectiveAuthorizationServiceStub([
        createPersonalEffectiveContext(),
      ]);

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: "personal_auth_foreign_001",
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService,
      }),
    ).resolves.toBeNull();
    expect(
      effectiveAuthorizationService.listEffectiveAuthorizations,
    ).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "authorization source",
      overrides: { authorizationSource: "org_auth" as const },
    },
    {
      name: "owner type",
      overrides: { ownerType: "organization" as const },
    },
    {
      name: "owner public id",
      overrides: { ownerPublicId: "user_foreign_001" },
    },
    {
      name: "organization public id",
      overrides: { organizationPublicId: "organization_foreign_001" },
    },
    {
      name: "quota owner type",
      overrides: { quotaOwnerType: "organization" as const },
    },
    {
      name: "quota owner public id",
      overrides: { quotaOwnerPublicId: "user_foreign_001" },
    },
  ])(
    "rejects an effective context with mismatched $name",
    async ({ overrides }) => {
      const mismatchedContext = createPersonalEffectiveContext(overrides);

      await expect(
        resolveEffectivePersonalAiGenerationAuthorizationContext({
          authorizationPublicId: "personal_auth_employee_owned_001",
          requestedScope: { profession: "monopoly", level: 3 },
          taskType: "ai_question_generation",
          userContext: employeeUserContext,
          authorizationRepository: createAuthorizationRepository({
            personalAuths: [createPersonalAuth()],
          }),
          effectiveAuthorizationService:
            createEffectiveAuthorizationServiceStub([mismatchedContext]),
        }),
      ).resolves.toBeNull();
    },
  );

  it("fails closed when effective contexts contain duplicate exact ownership matches", async () => {
    const authorizationContext = createPersonalEffectiveContext();

    await expect(
      resolveEffectivePersonalAiGenerationAuthorizationContext({
        authorizationPublicId: authorizationContext.authorizationPublicId,
        requestedScope: { profession: "monopoly", level: 3 },
        taskType: "ai_question_generation",
        userContext: employeeUserContext,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuth()],
        }),
        effectiveAuthorizationService: createEffectiveAuthorizationServiceStub([
          authorizationContext,
          { ...authorizationContext },
        ]),
      }),
    ).resolves.toBeNull();
  });
});
