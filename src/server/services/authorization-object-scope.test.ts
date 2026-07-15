import { describe, expect, it } from "vitest";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import { selectAuthorizationObjectScope } from "./authorization-object-scope";

const advancedContext: EffectiveAuthorizationContextDto = {
  profession: "monopoly",
  level: 3,
  contextDisplayStatus: "display_only",
  effectiveEdition: "advanced",
  authorizationSource: "org_auth",
  authorizationPublicId: "org_auth_public_123",
  ownerType: "organization",
  ownerPublicId: "organization_public_123",
  organizationPublicId: "organization_public_123",
  quotaOwnerType: "organization",
  quotaOwnerPublicId: "organization_public_123",
  capabilities: {
    canGenerateAiQuestion: true,
    canGenerateAiPaper: true,
    canCreateOrganizationTraining: true,
    canAnswerOrganizationTraining: true,
    canViewOrganizationTrainingSummary: true,
    canManageAuthorizationQuota: false,
  },
  blockedReason: null,
};

describe("authorization object scope", () => {
  it("selects exactly one current advanced authorization with an exact object scope", () => {
    expect(
      selectAuthorizationObjectScope([advancedContext], {
        authorizationPublicId: "org_auth_public_123",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
        profession: "monopoly",
        level: 3,
        requiredCapability: "canGenerateAiQuestion",
        allowedBlockedReasons: [],
      }),
    ).toEqual(advancedContext);
  });

  it.each([
    { profession: "marketing" as const, level: 3 },
    { profession: "monopoly" as const, level: 4 },
  ])("rejects a cross-scope request: %o", ({ profession, level }) => {
    expect(
      selectAuthorizationObjectScope([advancedContext], {
        authorizationPublicId: "org_auth_public_123",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
        profession,
        level,
        requiredCapability: "canGenerateAiQuestion",
        allowedBlockedReasons: [],
      }),
    ).toBeNull();
  });

  it("fails closed when the selected authorization public id is ambiguous", () => {
    expect(
      selectAuthorizationObjectScope(
        [advancedContext, { ...advancedContext }],
        {
          authorizationPublicId: "org_auth_public_123",
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          profession: "monopoly",
          level: 3,
          requiredCapability: "canAnswerOrganizationTraining",
          allowedBlockedReasons: [],
        },
      ),
    ).toBeNull();
  });

  it("rejects standard, capability-disabled and blocked contexts", () => {
    expect(
      selectAuthorizationObjectScope(
        [
          {
            ...advancedContext,
            effectiveEdition: "standard",
            capabilities: {
              ...advancedContext.capabilities,
              canGenerateAiQuestion: false,
            },
            blockedReason: "production_enablement_blocked",
          },
        ],
        {
          authorizationPublicId: "org_auth_public_123",
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          profession: "monopoly",
          level: 3,
          requiredCapability: "canGenerateAiQuestion",
          allowedBlockedReasons: [],
        },
      ),
    ).toBeNull();
  });
});
