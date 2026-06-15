import { describe, expect, it } from "vitest";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import {
  createOrganizationTrainingService,
  type OrganizationTrainingDraftStore,
  type OrganizationTrainingManualDraftWrite,
} from "./organization-training-service";

const fixedNow = new Date("2026-06-15T19:20:13.000Z");

function createAdvancedOrgAuthContext(
  overrides: Partial<EffectiveAuthorizationContextDto> = {},
): EffectiveAuthorizationContextDto {
  return {
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
      canGenerateAiQuestion: false,
      canGenerateAiPaper: false,
      canCreateOrganizationTraining: true,
      canAnswerOrganizationTraining: true,
      canViewOrganizationTrainingSummary: true,
      canManageAuthorizationQuota: false,
    },
    blockedReason: null,
    ...overrides,
  };
}

function createDraftStore() {
  let createdDrafts: OrganizationTrainingManualDraftWrite[] = [];

  const draftStore: OrganizationTrainingDraftStore = {
    async createManualDraft(draftWrite) {
      createdDrafts = [...createdDrafts, draftWrite];

      return {
        publicId: "training_draft_public_123",
        sourceTaskPublicId: draftWrite.sourceTaskPublicId,
        organizationPublicId: draftWrite.organizationPublicId,
        authorizationSource: draftWrite.authorizationSource,
        authorizationPublicId: draftWrite.authorizationPublicId,
        profession: draftWrite.profession,
        level: draftWrite.level,
        subject: draftWrite.subject,
        title: draftWrite.title,
        description: draftWrite.description,
        questionCount: draftWrite.questionCount,
        totalScore: draftWrite.totalScore,
        questionTypeSummary: draftWrite.questionTypeSummary,
        evidenceStatus: draftWrite.evidenceStatus,
        validationStatus: draftWrite.validationStatus,
        retentionStatus: draftWrite.retentionStatus,
        createdAt: draftWrite.createdAt,
        expiresAt: draftWrite.expiresAt,
      };
    },
  };

  return {
    draftStore,
    getCreatedDrafts: () => createdDrafts,
  };
}

function createServiceFixture() {
  const { draftStore, getCreatedDrafts } = createDraftStore();
  const service = createOrganizationTrainingService(draftStore, {
    now: () => fixedNow,
  });

  return {
    service,
    getCreatedDrafts,
  };
}

describe("organization training service", () => {
  it("keeps effective authorization context source-backed without selected subject", () => {
    const subjectKeyAbsent: "subject" extends keyof EffectiveAuthorizationContextDto
      ? false
      : true = true;

    expect(subjectKeyAbsent).toBe(true);
  });

  it("creates a metadata-only manual draft for an advanced org_auth organization admin", async () => {
    const { service, getCreatedDrafts } = createServiceFixture();

    const result = await service.createManualDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: [
          "organization_public_123",
          "organization_child_public_456",
        ],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftInput: {
        organizationPublicId: " organization_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: " Safety training ",
        description: "",
      },
    });

    expect(result).toEqual({
      success: true,
      draft: {
        publicId: "training_draft_public_123",
        sourceTaskPublicId: null,
        organizationPublicId: "organization_public_123",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questionCount: 0,
        totalScore: 0,
        questionTypeSummary: {
          singleChoice: 0,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 0,
        },
        evidenceStatus: "none",
        validationStatus: "needs_review",
        retentionStatus: "active",
        createdAt: fixedNow.toISOString(),
        expiresAt: null,
      },
    });
    expect(getCreatedDrafts()).toEqual([
      {
        contentType: "organization_training_draft",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
        sourceTaskPublicId: null,
        organizationPublicId: "organization_public_123",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questionCount: 0,
        totalScore: 0,
        questionTypeSummary: {
          singleChoice: 0,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 0,
        },
        evidenceStatus: "none",
        validationStatus: "needs_review",
        retentionStatus: "active",
        createdAt: fixedNow.toISOString(),
        expiresAt: null,
      },
    ]);
  });

  it("blocks manual draft creation when advanced org_auth capability gates fail", async () => {
    const blockedCases = [
      {
        name: "standard edition",
        authorizationContext: createAdvancedOrgAuthContext({
          effectiveEdition: "standard",
        }),
        expectedReason: "advanced_edition_required",
      },
      {
        name: "personal authorization",
        authorizationContext: createAdvancedOrgAuthContext({
          authorizationSource: "personal_auth",
          ownerType: "personal",
          ownerPublicId: "student_public_123",
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student_public_123",
        }),
        expectedReason: "org_auth_required",
      },
      {
        name: "missing organization training capability",
        authorizationContext: createAdvancedOrgAuthContext({
          capabilities: {
            ...createAdvancedOrgAuthContext().capabilities,
            canCreateOrganizationTraining: false,
          },
        }),
        expectedReason: "organization_training_capability_required",
      },
    ] as const;

    for (const blockedCase of blockedCases) {
      const { service, getCreatedDrafts } = createServiceFixture();

      const result = await service.createManualDraft({
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds: ["organization_public_123"],
        },
        authorizationContext: blockedCase.authorizationContext,
        draftInput: {
          organizationPublicId: "organization_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          title: `Safety training ${blockedCase.name}`,
          description: null,
        },
      });

      expect(result).toEqual({
        success: false,
        reason: blockedCase.expectedReason,
        message: "Organization training manual draft creation is blocked.",
      });
      expect(getCreatedDrafts()).toEqual([]);
    }
  });

  it("blocks manual draft creation outside organization ownership and content scope", async () => {
    const blockedCases = [
      {
        name: "organization outside admin visible scope",
        authorizationContext: createAdvancedOrgAuthContext(),
        visibleOrganizationPublicIds: ["organization_other_public_999"],
        draftInput: {
          organizationPublicId: "organization_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          title: "Safety training",
          description: null,
        },
        expectedReason: "organization_scope_denied",
      },
      {
        name: "organization outside org_auth owner scope",
        authorizationContext: createAdvancedOrgAuthContext(),
        visibleOrganizationPublicIds: ["organization_child_public_456"],
        draftInput: {
          organizationPublicId: "organization_child_public_456",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          title: "Safety training",
          description: null,
        },
        expectedReason: "organization_scope_denied",
      },
      {
        name: "profession mismatch",
        authorizationContext: createAdvancedOrgAuthContext(),
        visibleOrganizationPublicIds: ["organization_public_123"],
        draftInput: {
          organizationPublicId: "organization_public_123",
          profession: "marketing",
          level: 3,
          subject: "theory",
          title: "Safety training",
          description: null,
        },
        expectedReason: "authorization_scope_mismatch",
      },
    ] as const;

    for (const blockedCase of blockedCases) {
      const { service, getCreatedDrafts } = createServiceFixture();

      const result = await service.createManualDraft({
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds:
            blockedCase.visibleOrganizationPublicIds,
        },
        authorizationContext: blockedCase.authorizationContext,
        draftInput: blockedCase.draftInput,
      });

      expect(result).toEqual({
        success: false,
        reason: blockedCase.expectedReason,
        message: "Organization training manual draft creation is blocked.",
      });
      expect(getCreatedDrafts()).toEqual([]);
    }
  });

  it("blocks manual draft creation when authorization level does not match draft level", async () => {
    const { service, getCreatedDrafts } = createServiceFixture();

    const result = await service.createManualDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext({
        level: 2,
      }),
      draftInput: {
        organizationPublicId: "organization_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
      },
    });

    expect(result).toEqual({
      success: false,
      reason: "authorization_scope_mismatch",
      message: "Organization training manual draft creation is blocked.",
    });
    expect(getCreatedDrafts()).toEqual([]);
  });

  it("blocks manual draft creation when selected content scope subject is invalid", async () => {
    const { service, getCreatedDrafts } = createServiceFixture();

    const result = await service.createManualDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftInput: {
        organizationPublicId: "organization_public_123",
        profession: "monopoly",
        level: 3,
        subject: "invalid_subject" as never,
        title: "Safety training",
        description: null,
      },
    });

    expect(result).toEqual({
      success: false,
      reason: "invalid_manual_draft_input",
      message: "Organization training manual draft creation is blocked.",
    });
    expect(getCreatedDrafts()).toEqual([]);
  });

  it("keeps manual draft creation isolated from formal content targets", async () => {
    const { service, getCreatedDrafts } = createServiceFixture();

    const result = await service.createManualDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftInput: {
        organizationPublicId: "organization_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
      },
    });

    const serializedResult = JSON.stringify(result);

    expect(getCreatedDrafts()[0]?.contentType).toBe(
      "organization_training_draft",
    );
    expect(serializedResult).not.toContain("formalQuestionPublicId");
    expect(serializedResult).not.toContain("formalPaperPublicId");
    expect(serializedResult).not.toContain("practicePublicId");
    expect(serializedResult).not.toContain("mockExamPublicId");
    expect(serializedResult).not.toContain("examReportPublicId");
    expect(serializedResult).not.toContain("mistakeBookPublicId");
    expect(serializedResult).not.toContain("answerRecordPublicId");
    expect(serializedResult).not.toContain("providerPayload");
    expect(serializedResult).not.toContain("rawPrompt");
    expect(serializedResult).not.toContain("rawAnswer");
  });
});
