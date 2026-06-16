import { describe, expect, it } from "vitest";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import type { OrganizationTrainingPublishInput } from "../models/organization-training";
import { normalizeOrganizationTrainingPublishInput } from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  type OrganizationTrainingStore,
  type OrganizationTrainingManualDraftWrite,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingVersionCopyToNewDraftWrite,
  type OrganizationTrainingPublishedVersionPersistenceWrite,
  type OrganizationTrainingVersionTakedownWrite,
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
  let publishedVersions: OrganizationTrainingPublishedVersionPersistenceWrite[] =
    [];
  let takenDownVersions: OrganizationTrainingVersionTakedownWrite[] = [];
  let copiedDrafts: OrganizationTrainingVersionCopyToNewDraftWrite[] = [];

  const draftStore: OrganizationTrainingStore = {
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
    async publishVersion(versionWrite) {
      publishedVersions = [...publishedVersions, versionWrite];

      return {
        publicId: "training_version_public_123",
        draftPublicId: versionWrite.draftPublicId,
        versionNumber: 1,
        organizationPublicId: versionWrite.organizationPublicId,
        publishScopeSnapshot: {
          organizationPublicIds: [
            ...versionWrite.publishScopeSnapshot.organizationPublicIds,
          ],
          capturedAt: versionWrite.publishScopeSnapshot.capturedAt,
        },
        profession: versionWrite.profession,
        level: versionWrite.level,
        subject: versionWrite.subject,
        title: versionWrite.title,
        description: versionWrite.description,
        questionCount: versionWrite.questionCount,
        totalScore: versionWrite.totalScore,
        status: versionWrite.status,
        publishedAt: versionWrite.publishedAt,
        takenDownAt: versionWrite.takenDownAt,
        takedownReason: versionWrite.takedownReason,
      };
    },
    async takeDownVersion(takedownWrite) {
      takenDownVersions = [...takenDownVersions, takedownWrite];

      return {
        publicId: takedownWrite.versionPublicId,
        draftPublicId: "training_draft_public_123",
        versionNumber: 1,
        organizationPublicId: takedownWrite.organizationPublicId,
        publishScopeSnapshot: {
          organizationPublicIds: ["organization_public_123"],
          capturedAt: "2026-06-15T19:20:13.000Z",
        },
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questionCount: 2,
        totalScore: 5,
        status: takedownWrite.status,
        publishedAt: "2026-06-15T19:20:13.000Z",
        takenDownAt: takedownWrite.takenDownAt,
        takedownReason: takedownWrite.takedownReason,
      };
    },
    async copyVersionToNewDraft(copyWrite) {
      copiedDrafts = [...copiedDrafts, copyWrite];

      return {
        publicId: "training_draft_copy_public_123",
        sourceTaskPublicId: null,
        organizationPublicId: copyWrite.organizationPublicId,
        authorizationSource: "org_auth",
        authorizationPublicId: copyWrite.authorizationPublicId,
        profession: copyWrite.sourceVersion.profession,
        level: copyWrite.sourceVersion.level,
        subject: copyWrite.sourceVersion.subject,
        title: copyWrite.newDraftTitle,
        description: copyWrite.sourceVersion.description,
        questionCount: copyWrite.sourceVersion.questionCount,
        totalScore: copyWrite.sourceVersion.totalScore,
        questionTypeSummary: copyWrite.sourceQuestionTypeSummary,
        evidenceStatus: "none",
        validationStatus: "needs_review",
        retentionStatus: "active",
        createdAt: copyWrite.createdAt,
        expiresAt: null,
      };
    },
  };

  return {
    draftStore,
    getCreatedDrafts: () => createdDrafts,
    getPublishedVersions: () => publishedVersions,
    getTakenDownVersions: () => takenDownVersions,
    getCopiedDrafts: () => copiedDrafts,
  };
}

function createServiceFixture() {
  const {
    draftStore,
    getCreatedDrafts,
    getPublishedVersions,
    getTakenDownVersions,
    getCopiedDrafts,
  } = createDraftStore();
  const service = createOrganizationTrainingService(draftStore, {
    now: () => fixedNow,
  });

  return {
    service,
    getCreatedDrafts,
    getPublishedVersions,
    getTakenDownVersions,
    getCopiedDrafts,
  };
}

function createPublishInput(
  overrides: Partial<OrganizationTrainingPublishInput> = {},
): OrganizationTrainingPublishInput {
  const normalizedInput = normalizeOrganizationTrainingPublishInput({
    draftPublicId: " training_draft_public_123 ",
    organizationPublicId: " organization_public_123 ",
    authorizationPublicId: " org_auth_public_123 ",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: " Safety training ",
    description: "",
    questions: [
      {
        publicId: " training_question_public_123 ",
        questionType: "single_choice",
        score: 2,
        standardAnswer: " A ",
        analysisSummary: " choice rationale ",
        evidenceStatus: "sufficient",
        citationCount: 1,
      },
      {
        publicId: " training_question_public_456 ",
        questionType: "short_answer",
        score: 3,
        standardAnswer: " expected answer ",
        analysisSummary: " scoring rationale ",
        evidenceStatus: "weak",
        citationCount: 0,
      },
    ],
    publishScopeOrganizationPublicIds: [
      " organization_public_123 ",
      "organization_branch_public_456",
    ],
    capabilityContext: {
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canCreateOrganizationTraining: true,
    },
  });

  if (!normalizedInput.success) {
    throw new Error("Expected normalized organization training publish input.");
  }

  return {
    ...normalizedInput.value,
    ...overrides,
  };
}

function createPersistenceLineage(
  overrides: Partial<OrganizationTrainingPersistenceLineage> = {},
): OrganizationTrainingPersistenceLineage {
  return {
    organizationId: 501,
    orgAuthId: 601,
    ...overrides,
  };
}

function createPublishedVersion(
  overrides: Partial<OrganizationTrainingPublishedVersionDto> = {},
): OrganizationTrainingPublishedVersionDto {
  return {
    publicId: "training_version_public_123",
    draftPublicId: "training_draft_public_123",
    versionNumber: 1,
    organizationPublicId: "organization_public_123",
    publishScopeSnapshot: {
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: fixedNow.toISOString(),
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training",
    description: null,
    questionCount: 2,
    totalScore: 5,
    status: "published",
    publishedAt: fixedNow.toISOString(),
    takenDownAt: null,
    takedownReason: null,
    ...overrides,
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

  it("publishes validated draft metadata as an immutable organization training version snapshot", async () => {
    const { service, getPublishedVersions } = createServiceFixture();
    const publishInput = createPublishInput();

    const result = await service.publishVersion({
      publishInput,
      persistenceLineage: createPersistenceLineage(),
    });

    publishInput.publishScopeOrganizationPublicIds.push(
      "organization_other_public_999",
    );

    const expectedVersion: OrganizationTrainingPublishedVersionDto = {
      publicId: "training_version_public_123",
      draftPublicId: "training_draft_public_123",
      versionNumber: 1,
      organizationPublicId: "organization_public_123",
      publishScopeSnapshot: {
        organizationPublicIds: [
          "organization_public_123",
          "organization_branch_public_456",
        ],
        capturedAt: fixedNow.toISOString(),
      },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training",
      description: null,
      questionCount: 2,
      totalScore: 5,
      status: "published",
      publishedAt: fixedNow.toISOString(),
      takenDownAt: null,
      takedownReason: null,
    };

    expect(result).toEqual({
      success: true,
      version: expectedVersion,
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected organization training publish to succeed.");
    }
    expect(getPublishedVersions()).toEqual([
      {
        contentType: "organization_training_version",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        publishScopeSnapshot: {
          organizationPublicIds: [
            "organization_public_123",
            "organization_branch_public_456",
          ],
          capturedAt: fixedNow.toISOString(),
        },
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questionCount: 2,
        totalScore: 5,
        questionTypeSummary: {
          singleChoice: 1,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 1,
        },
        status: "published",
        publishedAt: fixedNow.toISOString(),
        takenDownAt: null,
        takedownReason: null,
        organizationId: 501,
        orgAuthId: 601,
      },
    ]);
    expect(
      result.version.publishScopeSnapshot.organizationPublicIds,
    ).not.toContain("organization_other_public_999");
    expect("authorizationSource" in result.version).toBe(false);
    expect("authorizationPublicId" in result.version).toBe(false);
  });

  it("passes internal organization and org_auth lineage to the publish store without exposing it in the DTO", async () => {
    const { service, getPublishedVersions } = createServiceFixture();

    const result = await service.publishVersion({
      publishInput: createPublishInput(),
      persistenceLineage: createPersistenceLineage(),
    });

    expect(getPublishedVersions()).toEqual([
      expect.objectContaining({
        organizationId: 501,
        orgAuthId: 601,
      }),
    ]);
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected organization training publish to succeed.");
    }
    expect("organizationId" in result.version).toBe(false);
    expect("orgAuthId" in result.version).toBe(false);
  });

  it("blocks publish version when authorization lineage is missing", async () => {
    const { service, getPublishedVersions } = createServiceFixture();

    const result = await service.publishVersion({
      publishInput: createPublishInput({
        authorizationPublicId: " ",
      }),
      persistenceLineage: createPersistenceLineage(),
    });

    expect(result).toEqual({
      success: false,
      reason: "invalid_publish_input",
      message: "Organization training publish is blocked.",
    });
    expect(getPublishedVersions()).toEqual([]);
  });

  it("blocks publish version when capability or organization scope is invalid", async () => {
    const blockedCases = [
      {
        name: "standard edition",
        publishInput: createPublishInput({
          capabilityContext: {
            effectiveEdition: "standard",
            authorizationSource: "org_auth",
            canCreateOrganizationTraining: true,
          } as never,
        }),
        expectedReason: "advanced_edition_required",
      },
      {
        name: "personal authorization",
        publishInput: createPublishInput({
          capabilityContext: {
            effectiveEdition: "advanced",
            authorizationSource: "personal_auth",
            canCreateOrganizationTraining: true,
          } as never,
        }),
        expectedReason: "org_auth_required",
      },
      {
        name: "missing training capability",
        publishInput: createPublishInput({
          capabilityContext: {
            effectiveEdition: "advanced",
            authorizationSource: "org_auth",
            canCreateOrganizationTraining: false,
          } as never,
        }),
        expectedReason: "organization_training_capability_required",
      },
      {
        name: "scope without owner organization",
        publishInput: createPublishInput({
          publishScopeOrganizationPublicIds: ["organization_branch_public_456"],
        }),
        expectedReason: "organization_scope_denied",
      },
    ] as const;

    for (const blockedCase of blockedCases) {
      const { service, getPublishedVersions } = createServiceFixture();

      const result = await service.publishVersion({
        publishInput: blockedCase.publishInput,
        persistenceLineage: createPersistenceLineage(),
      });

      expect(result).toEqual({
        success: false,
        reason: blockedCase.expectedReason,
        message: "Organization training publish is blocked.",
      });
      expect(getPublishedVersions()).toEqual([]);
    }
  });

  it("keeps publish version output isolated from formal content targets and provider raw fields", async () => {
    const { service, getPublishedVersions } = createServiceFixture();

    const result = await service.publishVersion({
      publishInput: createPublishInput(),
      persistenceLineage: createPersistenceLineage(),
    });

    const serializedResult = JSON.stringify({
      result,
      publishedVersions: getPublishedVersions(),
    });

    expect(serializedResult).toContain("organization_training_version");
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

  it("takes down a published version while preserving historical visibility policy", async () => {
    const { service, getTakenDownVersions } = createServiceFixture();

    const result = await service.takeDownVersion({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      versionOrganizationPublicId: " organization_public_123 ",
      takedownInput: {
        versionPublicId: " training_version_public_123 ",
        takedownReason: " outdated training ",
      },
    });

    expect(result).toEqual({
      success: true,
      version: {
        publicId: "training_version_public_123",
        draftPublicId: "training_draft_public_123",
        versionNumber: 1,
        organizationPublicId: "organization_public_123",
        publishScopeSnapshot: {
          organizationPublicIds: ["organization_public_123"],
          capturedAt: fixedNow.toISOString(),
        },
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questionCount: 2,
        totalScore: 5,
        status: "taken_down",
        publishedAt: fixedNow.toISOString(),
        takenDownAt: fixedNow.toISOString(),
        takedownReason: "outdated training",
      },
    });
    expect(getTakenDownVersions()).toEqual([
      {
        versionPublicId: "training_version_public_123",
        organizationPublicId: "organization_public_123",
        status: "taken_down",
        takenDownAt: fixedNow.toISOString(),
        takedownReason: "outdated training",
        accessPolicy: {
          allowNewAnswers: false,
          allowDraftSaves: false,
          allowQuestionDetailReentry: false,
          employeeHistoryVisibility: "own_summary_only",
          preserveHistory: true,
        },
      },
    ]);
  });

  it("blocks takedown outside visible organization scope or without reason", async () => {
    const blockedCases = [
      {
        name: "missing reason",
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds: ["organization_public_123"],
        },
        versionOrganizationPublicId: "organization_public_123",
        takedownInput: {
          versionPublicId: "training_version_public_123",
          takedownReason: " ",
        },
        expectedReason: "invalid_takedown_input",
      },
      {
        name: "outside visible scope",
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds: ["organization_other_public_999"],
        },
        versionOrganizationPublicId: "organization_public_123",
        takedownInput: {
          versionPublicId: "training_version_public_123",
          takedownReason: "outdated training",
        },
        expectedReason: "organization_scope_denied",
      },
    ] as const;

    for (const blockedCase of blockedCases) {
      const { service, getTakenDownVersions } = createServiceFixture();

      const result = await service.takeDownVersion({
        adminContext: blockedCase.adminContext,
        versionOrganizationPublicId: blockedCase.versionOrganizationPublicId,
        takedownInput: blockedCase.takedownInput,
      });

      expect(result).toEqual({
        success: false,
        reason: blockedCase.expectedReason,
        message: "Organization training takedown is blocked.",
      });
      expect(getTakenDownVersions()).toEqual([]);
    }
  });

  it("copies a published version to a fresh editable draft without overwriting source version state", async () => {
    const { service, getCopiedDrafts } = createServiceFixture();
    const sourceVersion = createPublishedVersion();
    const sourceVersionBeforeCopy = structuredClone(sourceVersion);

    const result = await service.copyVersionToNewDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationPublicId: " org_auth_public_123 ",
      copyInput: {
        sourceVersionPublicId: " training_version_public_123 ",
        newDraftTitle: " Refreshed training ",
      },
      sourceVersion,
      sourceQuestionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 1,
      },
    });

    const expectedDraft: OrganizationTrainingDraftDto = {
      publicId: "training_draft_copy_public_123",
      sourceTaskPublicId: null,
      organizationPublicId: "organization_public_123",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Refreshed training",
      description: null,
      questionCount: 2,
      totalScore: 5,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 1,
      },
      evidenceStatus: "none",
      validationStatus: "needs_review",
      retentionStatus: "active",
      createdAt: fixedNow.toISOString(),
      expiresAt: null,
    };

    expect(result).toEqual({
      success: true,
      draft: expectedDraft,
    });
    expect(getCopiedDrafts()).toEqual([
      {
        sourceVersionPublicId: "training_version_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        sourceVersion: sourceVersionBeforeCopy,
        sourceQuestionTypeSummary: {
          singleChoice: 1,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 1,
        },
        newDraftTitle: "Refreshed training",
        contentType: "organization_training_draft",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
        createdAt: fixedNow.toISOString(),
        copyPolicy: {
          preserveSourceVersion: true,
          preservePublishScopeSnapshot: true,
          createFreshDraftPublicId: true,
        },
      },
    ]);
    expect(sourceVersion).toEqual(sourceVersionBeforeCopy);
    expect(
      JSON.stringify({ result, copiedDrafts: getCopiedDrafts() }),
    ).not.toContain("formalPaperPublicId");
  });

  it("copies a taken-down version to a fresh editable draft for revision", async () => {
    const { service, getCopiedDrafts } = createServiceFixture();
    const sourceVersion = createPublishedVersion({
      status: "taken_down",
      takenDownAt: fixedNow.toISOString(),
      takedownReason: "outdated training",
    });

    const result = await service.copyVersionToNewDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationPublicId: "org_auth_public_123",
      copyInput: {
        sourceVersionPublicId: "training_version_public_123",
        newDraftTitle: "Revision draft",
      },
      sourceVersion,
      sourceQuestionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 1,
      },
    });

    expect(result.success).toBe(true);
    expect(getCopiedDrafts()).toHaveLength(1);
    expect(getCopiedDrafts()[0]?.sourceVersion).toMatchObject({
      publicId: "training_version_public_123",
      status: "taken_down",
      takenDownAt: fixedNow.toISOString(),
      takedownReason: "outdated training",
    });
  });
});
