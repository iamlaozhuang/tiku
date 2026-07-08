import { describe, expect, it } from "vitest";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingAdminPublishedVersionDetailDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import type { OrganizationTrainingPublishInput } from "../models/organization-training";
import { normalizeOrganizationTrainingPublishInput } from "../validators/organization-training";
import {
  buildOrganizationTrainingAdminDetailReadModel,
  buildOrganizationTrainingAdminLifecycleFlowReadModel,
  buildOrganizationTrainingEmployeeAnswerLifecycleFlowReadModel,
  buildOrganizationTrainingAuditLogReferenceReadModel,
  buildOrganizationTrainingAuditLogRedactedReferencePolicyReadModel,
  buildOrganizationTrainingSourceContextUsageReadModel,
  createOrganizationTrainingService,
  type OrganizationTrainingStore,
  type OrganizationTrainingManualDraftWrite,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingEmployeeAnswerDraftWrite,
  type OrganizationTrainingEmployeeAnswerSubmissionWrite,
  type OrganizationTrainingVersionCopyToNewDraftWrite,
  type OrganizationTrainingPublishedVersionPersistenceWrite,
  type OrganizationTrainingSourceContextWrite,
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
  let attachedSourceContexts: OrganizationTrainingSourceContextWrite[] = [];
  let savedAnswerDrafts: OrganizationTrainingEmployeeAnswerDraftWrite[] = [];
  let submittedAnswers: OrganizationTrainingEmployeeAnswerSubmissionWrite[] =
    [];

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
    async attachSourceContext(sourceContextWrite) {
      attachedSourceContexts = [...attachedSourceContexts, sourceContextWrite];

      return {
        draftPublicId: sourceContextWrite.draftPublicId,
        organizationPublicId: sourceContextWrite.organizationPublicId,
        sourceContexts: sourceContextWrite.sourceContexts,
        redactionStatus: sourceContextWrite.redactionStatus,
      };
    },
    async saveEmployeeAnswerDraft(answerDraftWrite) {
      savedAnswerDrafts = [...savedAnswerDrafts, answerDraftWrite];

      return {
        publicId: "training_answer_draft_public_123",
        trainingVersionPublicId: answerDraftWrite.trainingVersionPublicId,
        employeePublicId: answerDraftWrite.employeePublicId,
        organizationPublicId: answerDraftWrite.organizationPublicId,
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            ...answerDraftWrite.answerOrganizationSnapshot
              .organizationPublicIds,
          ],
          capturedAt: answerDraftWrite.answerOrganizationSnapshot.capturedAt,
        },
        answerStatus: answerDraftWrite.answerStatus,
        scoreSummary: null,
        submittedAt: null,
        resultSummaryVisible: false,
      };
    },
    async submitEmployeeAnswer(answerSubmissionWrite) {
      submittedAnswers = [...submittedAnswers, answerSubmissionWrite];

      return {
        publicId: "training_answer_record_public_123",
        trainingVersionPublicId: answerSubmissionWrite.trainingVersionPublicId,
        employeePublicId: answerSubmissionWrite.employeePublicId,
        organizationPublicId: answerSubmissionWrite.organizationPublicId,
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            ...answerSubmissionWrite.answerOrganizationSnapshot
              .organizationPublicIds,
          ],
          capturedAt:
            answerSubmissionWrite.answerOrganizationSnapshot.capturedAt,
        },
        answerStatus: answerSubmissionWrite.answerStatus,
        scoreSummary: answerSubmissionWrite.scoreSummary,
        submittedAt: answerSubmissionWrite.submittedAt,
        resultSummaryVisible: false,
      };
    },
  };

  return {
    draftStore,
    getCreatedDrafts: () => createdDrafts,
    getPublishedVersions: () => publishedVersions,
    getTakenDownVersions: () => takenDownVersions,
    getCopiedDrafts: () => copiedDrafts,
    getAttachedSourceContexts: () => attachedSourceContexts,
    getSavedAnswerDrafts: () => savedAnswerDrafts,
    getSubmittedAnswers: () => submittedAnswers,
  };
}

function createServiceFixture() {
  const {
    draftStore,
    getCreatedDrafts,
    getPublishedVersions,
    getTakenDownVersions,
    getCopiedDrafts,
    getAttachedSourceContexts,
    getSavedAnswerDrafts,
    getSubmittedAnswers,
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
    getAttachedSourceContexts,
    getSavedAnswerDrafts,
    getSubmittedAnswers,
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
        sequenceNumber: 1,
        questionType: "single_choice",
        materialTitle: " Safety material ",
        materialContent: " Safety material body ",
        stem: " Which option is compliant? ",
        options: [
          {
            publicId: " training_question_option_a ",
            label: " A ",
            content: " compliant option ",
          },
          {
            publicId: " training_question_option_b ",
            label: " B ",
            content: " distractor option ",
          },
        ],
        score: 2,
        standardAnswer: " A ",
        analysisSummary: " choice rationale ",
        evidenceStatus: "sufficient",
        citationCount: 1,
      },
      {
        publicId: " training_question_public_456 ",
        sequenceNumber: 2,
        questionType: "short_answer",
        materialTitle: null,
        materialContent: null,
        stem: " Describe the handling rule. ",
        options: [],
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
    weakEvidenceConfirmed: true,
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

function createSubmittedEmployeeAnswer(
  overrides: Partial<EmployeeOrganizationTrainingAnswerDto> = {},
): EmployeeOrganizationTrainingAnswerDto {
  return {
    publicId: "training_answer_record_public_123",
    trainingVersionPublicId: "training_version_public_123",
    employeePublicId: "employee_public_123",
    organizationPublicId: "organization_branch_public_456",
    answerOrganizationSnapshot: {
      organizationPublicIds: [
        "organization_branch_public_456",
        "organization_public_123",
      ],
      capturedAt: fixedNow.toISOString(),
    },
    answerStatus: "submitted",
    scoreSummary: {
      score: 4,
      totalScore: 5,
    },
    submittedAt: fixedNow.toISOString(),
    resultSummaryVisible: false,
    ...overrides,
  };
}

describe("organization training service", () => {
  it("builds a redacted audit_log reference for organization training without raw content", () => {
    const rawQuestionBody = ["RAW", "QUESTION", "BODY"].join("-");
    const rawAnswerBody = ["RAW", "ANSWER", "BODY"].join("-");
    const externalSnapshotBody = ["EXTERNAL", "SNAPSHOT", "BODY"].join("-");
    const privateRowData = ["PRIVATE", "ROW", "DATA"].join("-");

    const result = buildOrganizationTrainingAuditLogReferenceReadModel({
      id: 901,
      auditLogPublicId: " audit_log_public_184 ",
      actionType: "organization_training.publish",
      targetResourceType: "organization_training_version",
      trainingDraftPublicId: " training_draft_public_184 ",
      trainingVersionPublicId: " training_version_public_184 ",
      employeeAnswerPublicId: null,
      organizationPublicId: " organization_public_184 ",
      actorPublicId: " admin_public_184 ",
      rawQuestionBody,
      rawAnswerBody,
      externalSnapshotBody,
      privateRowData,
      authorizationHeader: "Bearer secret-token",
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        auditLogReference: {
          publicId: "audit_log_public_184",
          redactionStatus: "redacted",
        },
        targetReference: {
          targetResourceType: "organization_training_version",
          trainingDraftPublicId: "training_draft_public_184",
          trainingVersionPublicId: "training_version_public_184",
          employeeAnswerPublicId: null,
          organizationPublicId: "organization_public_184",
        },
        actorReference: {
          actorPublicId: "admin_public_184",
          redactionStatus: "redacted",
        },
        actionType: "organization_training.publish",
        referenceStatus: "redacted_reference",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(rawQuestionBody);
    expect(serializedResult).not.toContain(rawAnswerBody);
    expect(serializedResult).not.toContain(externalSnapshotBody);
    expect(serializedResult).not.toContain(privateRowData);
    expect(serializedResult).not.toContain("secret-token");
  });

  it("rejects an organization training version audit_log reference without version public id", () => {
    expect(
      buildOrganizationTrainingAuditLogReferenceReadModel({
        auditLogPublicId: "audit_log_public_184",
        actionType: "organization_training.publish",
        targetResourceType: "organization_training_version",
        trainingDraftPublicId: "training_draft_public_184",
        trainingVersionPublicId: null,
        employeeAnswerPublicId: null,
        organizationPublicId: "organization_public_184",
        actorPublicId: "admin_public_184",
      }),
    ).toEqual({
      code: 400184,
      message: "Invalid organization training audit_log reference input.",
      data: null,
    });
  });

  it("builds a redacted audit_log reference policy without raw payload fields", () => {
    const rawPayloadKey = ["raw", "Payload"].join("");
    const rawPayloadMarker = ["RAW", "PAY", "LOAD", "BODY"].join("-");
    const rawPromptKey = ["raw", "Prompt"].join("");
    const rawPromptMarker = ["RAW", "PROMPT", "BODY"].join("-");
    const rawAnswerKey = ["raw", "Answer"].join("");
    const rawAnswerMarker = ["RAW", "ANSWER", "BODY"].join("-");
    const protectedPayloadKey = ["provider", "Payload"].join("");
    const protectedPayloadMarker = ["PROVIDER", "PAY", "LOAD", "BODY"].join(
      "-",
    );
    const privateRowData = ["PRIVATE", "ROW", "DATA"].join("-");

    const result =
      buildOrganizationTrainingAuditLogRedactedReferencePolicyReadModel({
        [rawPayloadKey]: rawPayloadMarker,
        [rawPromptKey]: rawPromptMarker,
        [rawAnswerKey]: rawAnswerMarker,
        [protectedPayloadKey]: protectedPayloadMarker,
        privateRowData,
      });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        targetResourceTypes: [
          "organization_training_draft",
          "organization_training_version",
          "organization_training_answer",
          "organization_training_source_context",
          "organization_training_summary",
        ],
        referenceStatus: "redacted_reference",
        redactionStatus: "redacted",
        exposeRawPayload: false,
        exposeRawPrompt: false,
        exposeRawAnswer: false,
        exposeProviderPayload: false,
        exposeRowData: false,
        exposePrivateData: false,
      },
    });
    expect(serializedResult).not.toContain(rawPayloadMarker);
    expect(serializedResult).not.toContain(rawPromptMarker);
    expect(serializedResult).not.toContain(rawAnswerMarker);
    expect(serializedResult).not.toContain(protectedPayloadMarker);
    expect(serializedResult).not.toContain(privateRowData);
  });

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

  it("preserves a source task public id when creating an AI-copied training draft", async () => {
    const { service, getCreatedDrafts } = createServiceFixture();

    const result = await service.createManualDraft({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftInput: {
        organizationPublicId: "organization_public_123",
        sourceTaskPublicId: " admin_ai_generation_task_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "AI copied training",
        description: "AI source",
      },
    });

    expect(result.success).toBe(true);
    expect(getCreatedDrafts()[0]).toMatchObject({
      sourceTaskPublicId: "admin_ai_generation_task_public_123",
      title: "AI copied training",
      description: "AI source",
    });
  });

  it("builds a metadata-only admin lifecycle flow for draft, published, and taken-down training", () => {
    const rawQuestionBody = ["RAW", "QUESTION", "BODY"].join("-");
    const standardAnswer = ["STANDARD", "ANSWER", "BODY"].join("-");
    const analysis = ["TEACHER", "ANALYSIS", "BODY"].join("-");
    const protectedPayloadKey = ["provider", "Payload"].join("");
    const protectedPayloadMarker = ["PROVIDER", "PAY", "LOAD", "BODY"].join(
      "-",
    );
    const privateRowData = ["PRIVATE", "ROW", "DATA"].join("-");
    const draft: OrganizationTrainingDraftDto = {
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
    };
    const publishedVersion = {
      ...createPublishedVersion(),
      rawQuestionBody,
      standardAnswer,
      analysis,
      [protectedPayloadKey]: protectedPayloadMarker,
      privateRowData,
    };
    const takenDownVersion = createPublishedVersion({
      publicId: "training_version_taken_down_public_123",
      status: "taken_down",
      takenDownAt: fixedNow.toISOString(),
      takedownReason: "outdated training",
    });
    const invisibleVersion = createPublishedVersion({
      publicId: "training_version_invisible_public_123",
      organizationPublicId: "organization_other_public_999",
      publishScopeSnapshot: {
        organizationPublicIds: ["organization_other_public_999"],
        capturedAt: fixedNow.toISOString(),
      },
    });

    const result = buildOrganizationTrainingAdminLifecycleFlowReadModel({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      drafts: [draft],
      versions: [publishedVersion, takenDownVersion, invisibleVersion],
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        items: [
          {
            publicId: "training_draft_public_123",
            resourceType: "organization_training_draft",
            organizationPublicId: "organization_public_123",
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
            status: "draft",
            sourceKind: "manual_group",
            contentKind: "question_training",
            availableActions: ["publish"],
          },
          {
            publicId: "training_version_public_123",
            resourceType: "organization_training_version",
            organizationPublicId: "organization_public_123",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            title: "Safety training",
            description: null,
            questionCount: 2,
            totalScore: 5,
            status: "published",
            sourceKind: "unknown",
            contentKind: "unknown",
            availableActions: ["take_down", "copy_to_new_draft"],
          },
          {
            publicId: "training_version_taken_down_public_123",
            resourceType: "organization_training_version",
            organizationPublicId: "organization_public_123",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            title: "Safety training",
            description: null,
            questionCount: 2,
            totalScore: 5,
            status: "taken_down",
            sourceKind: "unknown",
            contentKind: "unknown",
            availableActions: ["copy_to_new_draft"],
          },
        ],
        redactionStatus: "metadata_only",
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 3,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    expect(serializedResult).not.toContain("training_version_invisible");
    expect(serializedResult).not.toContain(rawQuestionBody);
    expect(serializedResult).not.toContain(standardAnswer);
    expect(serializedResult).not.toContain(analysis);
    expect(serializedResult).not.toContain(protectedPayloadMarker);
    expect(serializedResult).not.toContain(privateRowData);
  });

  it("builds an admin-safe published training detail with collapsed answer and evidence summaries", () => {
    const protectedPayloadKey = ["provider", "Payload"].join("");
    const protectedPayloadMarker = ["PROVIDER", "PAY", "LOAD", "BODY"].join(
      "-",
    );
    const rawPromptKey = ["raw", "Prompt"].join("");
    const rawPromptMarker = ["RAW", "PROMPT", "BODY"].join("-");
    const version: OrganizationTrainingAdminPublishedVersionDetailDto = {
      ...createPublishedVersion({
        questionCount: 1,
        totalScore: 2,
      }),
      questions: [
        {
          publicId: "training_question_public_123",
          sequenceNumber: 1,
          questionType: "single_choice" as const,
          materialTitle: "Safety material",
          materialContent: "Safety material body",
          stem: "Which option is compliant?",
          options: [
            {
              publicId: "training_question_option_a",
              label: "A",
              content: "Compliant option",
            },
          ],
          score: 2,
          evidenceSummary: {
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
          answerAndAnalysis: {
            visibility: "collapsed_by_default",
            standardAnswer: "A",
            analysis: "Choose the compliant answer.",
          },
          [protectedPayloadKey]: protectedPayloadMarker,
          [rawPromptKey]: rawPromptMarker,
        },
      ],
    };

    const result = buildOrganizationTrainingAdminDetailReadModel({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      version,
      sourceMetadata: {
        draftPublicId: "training_draft_public_123",
        sourceTaskPublicId: null,
        sourceVersionPublicId: null,
        sourceType: "paper",
        generationKind: null,
        redactionStatus: "metadata_only",
      },
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        publicId: "training_version_public_123",
        resourceType: "organization_training_version",
        detailAvailability: "available",
        organizationPublicId: "organization_public_123",
        title: "Safety training",
        description: null,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        status: "published",
        sourceKind: "platform_paper",
        contentKind: "paper_training",
        structure: {
          questionCount: 1,
          totalScore: 2,
          questionTypeSummary: {
            singleChoice: 1,
            multiChoice: 0,
            trueFalse: 0,
            shortAnswer: 0,
          },
        },
        questions: [
          {
            publicId: "training_question_public_123",
            sequenceNumber: 1,
            questionType: "single_choice",
            materialTitle: "Safety material",
            materialContent: "Safety material body",
            stem: "Which option is compliant?",
            options: [
              {
                publicId: "training_question_option_a",
                label: "A",
                content: "Compliant option",
              },
            ],
            score: 2,
            evidenceSummary: {
              evidenceStatus: "sufficient",
              citationCount: 1,
            },
            answerAndAnalysis: {
              visibility: "collapsed_by_default",
              standardAnswer: "A",
              analysis: "Choose the compliant answer.",
            },
          },
        ],
        redactionStatus: "admin_safe_detail",
      },
    });
    expect(serializedResult).not.toContain(protectedPayloadMarker);
    expect(serializedResult).not.toContain(rawPromptMarker);
    expect(serializedResult).not.toMatch(/"id":|"organizationId":/u);
  });

  it("returns an explicit unavailable admin detail for drafts without structured snapshots", () => {
    const result = buildOrganizationTrainingAdminDetailReadModel({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      draft: {
        publicId: "training_draft_public_123",
        sourceTaskPublicId: null,
        organizationPublicId: "organization_public_123",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training draft",
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

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        publicId: "training_draft_public_123",
        resourceType: "organization_training_draft",
        detailAvailability: "unavailable",
        unavailableReason: "draft_snapshot_unavailable",
        organizationPublicId: "organization_public_123",
        title: "Safety training draft",
        description: null,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        status: "draft",
        sourceKind: "manual_group",
        contentKind: "question_training",
        recommendedAction: "continue_configuration",
        redactionStatus: "metadata_only",
      },
    });
  });

  it("denies admin detail outside the visible organization scope", () => {
    expect(
      buildOrganizationTrainingAdminDetailReadModel({
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds: ["organization_public_123"],
        },
        version: {
          ...createPublishedVersion({
            organizationPublicId: "organization_other_public_999",
          }),
          questions: [],
        },
      }),
    ).toEqual({
      code: 403092,
      message: "Organization training detail organization scope is denied.",
      data: null,
    });
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
        questionSnapshot: publishInput.questions,
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

  it("blocks AI-sourced publish when evidence is none or weak evidence is not confirmed", async () => {
    const blockedCases = [
      {
        publishInput: createPublishInput({
          questions: [
            {
              ...createPublishInput().questions[0],
              evidenceStatus: "none",
              citationCount: 0,
            },
          ],
          questionCount: 1,
          totalScore: 2,
          questionTypeSummary: {
            singleChoice: 1,
            multiChoice: 0,
            trueFalse: 0,
            shortAnswer: 0,
          },
        }),
        expectedReason: "insufficient_evidence",
      },
      {
        publishInput: createPublishInput({
          weakEvidenceConfirmed: false,
        }),
        expectedReason: "weak_evidence_confirmation_required",
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

  it("attaches first-release paper context as redacted metadata only", async () => {
    const { service, getAttachedSourceContexts } = createServiceFixture();

    const result = await service.attachSourceContext({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftPublicId: " training_draft_public_123 ",
      organizationPublicId: " organization_public_123 ",
      sourceContexts: [
        {
          sourceType: "paper",
          sourcePublicId: " paper_public_123 ",
          title: " Formal paper reference ",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 20,
          totalScore: 100,
          sourceStatus: "published",
          questionBody: "LEAK_FULL_PAPER_QUESTION_BODY",
          standardAnswer: "LEAK_STANDARD_ANSWER",
          analysis: "LEAK_ANALYSIS",
          privateRowId: 99001,
        } as never,
      ],
    });

    expect(result).toEqual({
      success: true,
      context: {
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
            redactionStatus: "metadata_only",
          },
        ],
        redactionStatus: "metadata_only",
      },
    });
    expect(getAttachedSourceContexts()).toEqual([
      {
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        contentType: "organization_training_source_context",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
            redactionStatus: "metadata_only",
          },
        ],
        formalUsagePolicy: {
          createFormalPaper: false,
          createMockExam: false,
          exposeQuestionBody: false,
          exposeStandardAnswer: false,
          exposeAnalysis: false,
          exposeProviderPayload: false,
        },
        redactionStatus: "metadata_only",
      },
    ]);

    const serializedResult = JSON.stringify({
      result,
      attachedSourceContexts: getAttachedSourceContexts(),
    });

    expect(serializedResult).not.toContain("LEAK_FULL_PAPER_QUESTION_BODY");
    expect(serializedResult).not.toContain("LEAK_STANDARD_ANSWER");
    expect(serializedResult).not.toContain("LEAK_ANALYSIS");
    expect(serializedResult).not.toContain("privateRowId");
  });

  it("blocks mock_exam as a first-release organization training source context", async () => {
    const { service, getAttachedSourceContexts } = createServiceFixture();

    const result = await service.attachSourceContext({
      adminContext: {
        adminPublicId: "admin_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
      authorizationContext: createAdvancedOrgAuthContext(),
      draftPublicId: "training_draft_public_123",
      organizationPublicId: "organization_public_123",
      sourceContexts: [
        {
          sourceType: "mock_exam",
          sourcePublicId: "mock_exam_public_456",
          title: "Mock exam reference",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 10,
          totalScore: 50,
          sourceStatus: "published",
        },
      ],
    });

    expect(result).toEqual({
      success: false,
      reason: "invalid_source_context_input",
      message: "Organization training source context is blocked.",
    });
    expect(getAttachedSourceContexts()).toEqual([]);
  });

  it("builds metadata-only paper context usage without full paper content", () => {
    const fullPaperContent = ["FULL", "PAPER", "CONTENT"].join("-");
    const fullQuestionBody = ["FULL", "QUESTION", "BODY"].join("-");
    const standardAnswer = ["STANDARD", "ANSWER", "BODY"].join("-");
    const analysis = ["TEACHER", "ANALYSIS", "BODY"].join("-");
    const protectedPayloadKey = ["provider", "Payload"].join("");
    const protectedPayloadMarker = ["PROVIDER", "PAY", "LOAD", "BODY"].join(
      "-",
    );

    const result = buildOrganizationTrainingSourceContextUsageReadModel({
      draftPublicId: " training_draft_public_123 ",
      organizationPublicId: " organization_public_123 ",
      sourceContexts: [
        {
          sourceType: "paper",
          sourcePublicId: " paper_public_123 ",
          title: " Formal paper reference ",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 20,
          totalScore: 100,
          sourceStatus: "published",
          fullPaperContent,
          fullQuestionBody,
          standardAnswer,
          analysis,
          [protectedPayloadKey]: protectedPayloadMarker,
        } as never,
      ],
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
            redactionStatus: "metadata_only",
          },
        ],
        formalUsagePolicy: {
          createFormalPaper: false,
          createMockExam: false,
          exposeQuestionBody: false,
          exposeStandardAnswer: false,
          exposeAnalysis: false,
          exposeProviderPayload: false,
        },
        redactionStatus: "metadata_only",
      },
    });
    expect(serializedResult).not.toContain(fullPaperContent);
    expect(serializedResult).not.toContain(fullQuestionBody);
    expect(serializedResult).not.toContain(standardAnswer);
    expect(serializedResult).not.toContain(analysis);
    expect(serializedResult).not.toContain(protectedPayloadMarker);
  });

  it("returns null source context usage when mock_exam is supplied as a first-release source", () => {
    const result = buildOrganizationTrainingSourceContextUsageReadModel({
      draftPublicId: "training_draft_public_123",
      organizationPublicId: "organization_public_123",
      sourceContexts: [
        {
          sourceType: "mock_exam",
          sourcePublicId: "mock_exam_public_456",
          title: "Mock exam reference",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 10,
          totalScore: 50,
          sourceStatus: "published",
        },
      ],
    });

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("blocks source context attachment outside org_auth scope or content scope", async () => {
    const blockedCases = [
      {
        name: "standard edition",
        authorizationContext: createAdvancedOrgAuthContext({
          effectiveEdition: "standard",
        }),
        organizationPublicId: "organization_public_123",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
          },
        ],
        expectedReason: "advanced_edition_required",
      },
      {
        name: "outside visible organization scope",
        authorizationContext: createAdvancedOrgAuthContext(),
        organizationPublicId: "organization_other_public_999",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
          },
        ],
        expectedReason: "organization_scope_denied",
      },
      {
        name: "content scope mismatch",
        authorizationContext: createAdvancedOrgAuthContext(),
        organizationPublicId: "organization_public_123",
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_456",
            title: "Paper reference",
            profession: "marketing",
            level: 3,
            subject: "theory",
            questionCount: 10,
            totalScore: 50,
            sourceStatus: "published",
          },
        ],
        expectedReason: "source_context_scope_mismatch",
      },
    ] as const;

    for (const blockedCase of blockedCases) {
      const { service, getAttachedSourceContexts } = createServiceFixture();

      const result = await service.attachSourceContext({
        adminContext: {
          adminPublicId: "admin_public_123",
          visibleOrganizationPublicIds: ["organization_public_123"],
        },
        authorizationContext: blockedCase.authorizationContext,
        draftPublicId: "training_draft_public_123",
        organizationPublicId: blockedCase.organizationPublicId,
        sourceContexts: blockedCase.sourceContexts,
      });

      expect(result).toEqual({
        success: false,
        reason: blockedCase.expectedReason,
        message: "Organization training source context is blocked.",
      });
      expect(getAttachedSourceContexts()).toEqual([]);
    }
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

  it("lists only published training versions visible to the employee organization context", async () => {
    const { service } = createServiceFixture();

    const result = await service.listEmployeeVisibleVersions({
      employeeContext: {
        employeePublicId: " employee_public_123 ",
        currentOrganizationPublicId: " organization_branch_public_456 ",
        visibleOrganizationPublicIds: [
          " organization_branch_public_456 ",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      sourceVersions: [
        createPublishedVersion(),
        createPublishedVersion({
          publicId: "training_version_other_scope_public_456",
          publishScopeSnapshot: {
            organizationPublicIds: ["organization_other_public_999"],
            capturedAt: fixedNow.toISOString(),
          },
        }),
        createPublishedVersion({
          publicId: "training_version_taken_down_public_789",
          status: "taken_down",
          takenDownAt: fixedNow.toISOString(),
          takedownReason: "outdated training",
        }),
      ],
    });

    expect(result).toEqual({
      success: true,
      versions: [createPublishedVersion()],
    });
  });

  it("builds a metadata-only employee answer lifecycle flow for local role actions", () => {
    const rawQuestionBody = ["RAW", "QUESTION", "BODY"].join("-");
    const standardAnswer = ["STANDARD", "ANSWER", "BODY"].join("-");
    const analysis = ["TEACHER", "ANALYSIS", "BODY"].join("-");
    const protectedPayloadKey = ["provider", "Payload"].join("");
    const protectedPayloadMarker = ["PROVIDER", "PAY", "LOAD", "BODY"].join(
      "-",
    );
    const privateRowData = ["PRIVATE", "ROW", "DATA"].join("-");
    const inProgressAnswer: EmployeeOrganizationTrainingAnswerDto = {
      publicId: "training_answer_draft_public_456",
      trainingVersionPublicId: "training_version_in_progress_public_456",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_branch_public_456",
      answerOrganizationSnapshot: {
        organizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        capturedAt: fixedNow.toISOString(),
      },
      answerStatus: "in_progress",
      scoreSummary: null,
      submittedAt: null,
      resultSummaryVisible: false,
    };
    const submittedAnswer = createSubmittedEmployeeAnswer({
      trainingVersionPublicId: "training_version_submitted_public_789",
    });
    const takenDownAnswer = createSubmittedEmployeeAnswer({
      trainingVersionPublicId: "training_version_taken_down_public_999",
    });
    const otherEmployeeAnswer = createSubmittedEmployeeAnswer({
      employeePublicId: "employee_public_other_999",
      trainingVersionPublicId: "training_version_other_employee_public_888",
    });
    const versionWithProtectedContent = {
      ...createPublishedVersion({
        publicId: "training_version_not_started_public_123",
        title: "Not started training",
      }),
      rawQuestionBody,
      standardAnswer,
      analysis,
      [protectedPayloadKey]: protectedPayloadMarker,
      privateRowData,
    };
    const result =
      buildOrganizationTrainingEmployeeAnswerLifecycleFlowReadModel({
        employeeContext: {
          employeePublicId: " employee_public_123 ",
          currentOrganizationPublicId: " organization_branch_public_456 ",
          visibleOrganizationPublicIds: [
            "organization_branch_public_456",
            "organization_public_123",
          ],
          authorizationContext: createAdvancedOrgAuthContext(),
        },
        versions: [
          versionWithProtectedContent,
          createPublishedVersion({
            publicId: "training_version_in_progress_public_456",
            title: "In-progress training",
          }),
          createPublishedVersion({
            publicId: "training_version_submitted_public_789",
            title: "Submitted training",
          }),
          createPublishedVersion({
            publicId: "training_version_taken_down_public_999",
            title: "Taken-down training",
            status: "taken_down",
            takenDownAt: fixedNow.toISOString(),
            takedownReason: "outdated training",
          }),
          createPublishedVersion({
            publicId: "training_version_other_scope_public_999",
            publishScopeSnapshot: {
              organizationPublicIds: ["organization_other_public_999"],
              capturedAt: fixedNow.toISOString(),
            },
          }),
          createPublishedVersion({
            publicId: "training_version_other_employee_public_888",
            title: "Other employee answer training",
          }),
        ],
        answers: [
          inProgressAnswer,
          submittedAnswer,
          takenDownAnswer,
          otherEmployeeAnswer,
        ],
      });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        items: [
          {
            trainingVersionPublicId: "training_version_not_started_public_123",
            organizationPublicId: "organization_public_123",
            title: "Not started training",
            versionStatus: "published",
            answerStatus: "not_started",
            availableActions: ["start_answer"],
            resultSummaryVisible: false,
          },
          {
            trainingVersionPublicId: "training_version_in_progress_public_456",
            organizationPublicId: "organization_public_123",
            title: "In-progress training",
            versionStatus: "published",
            answerStatus: "in_progress",
            availableActions: ["continue_answer", "submit_answer"],
            resultSummaryVisible: false,
          },
          {
            trainingVersionPublicId: "training_version_submitted_public_789",
            organizationPublicId: "organization_public_123",
            title: "Submitted training",
            versionStatus: "published",
            answerStatus: "submitted",
            availableActions: ["view_result"],
            resultSummaryVisible: true,
          },
          {
            trainingVersionPublicId: "training_version_taken_down_public_999",
            organizationPublicId: "organization_public_123",
            title: "Taken-down training",
            versionStatus: "taken_down",
            answerStatus: "read_only",
            availableActions: ["view_result"],
            resultSummaryVisible: true,
          },
          {
            trainingVersionPublicId:
              "training_version_other_employee_public_888",
            organizationPublicId: "organization_public_123",
            title: "Other employee answer training",
            versionStatus: "published",
            answerStatus: "not_started",
            availableActions: ["start_answer"],
            resultSummaryVisible: false,
          },
        ],
        redactionStatus: "metadata_only",
      },
    });
    expect(serializedResult).not.toContain(rawQuestionBody);
    expect(serializedResult).not.toContain(standardAnswer);
    expect(serializedResult).not.toContain(analysis);
    expect(serializedResult).not.toContain(protectedPayloadMarker);
    expect(serializedResult).not.toContain(privateRowData);
    expect(serializedResult).not.toContain("answerRecordPublicId");
    expect(serializedResult).not.toContain("practicePublicId");
    expect(serializedResult).not.toContain("mockExamPublicId");
    expect(serializedResult).not.toContain("examReportPublicId");
    expect(serializedResult).not.toContain("mistakeBookPublicId");
    expect(serializedResult).not.toContain(
      "training_version_other_scope_public_999",
    );
    expect(serializedResult).not.toContain("employee_public_other_999");
    expect(serializedResult).not.toContain("training_answer_record_public_123");
  });

  it("saves an employee answer draft with answer-time organization snapshot and no formal writes", async () => {
    const { service, getSavedAnswerDrafts } = createServiceFixture();

    const result = await service.saveEmployeeAnswerDraft({
      employeeContext: {
        employeePublicId: " employee_public_123 ",
        currentOrganizationPublicId: " organization_branch_public_456 ",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      version: createPublishedVersion(),
      answerInput: {
        trainingVersionPublicId: " training_version_public_123 ",
        answeredQuestionCount: 1,
      },
      existingAnswer: null,
    });

    expect(result).toEqual({
      success: true,
      answer: {
        publicId: "training_answer_draft_public_123",
        trainingVersionPublicId: "training_version_public_123",
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_branch_public_456",
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            "organization_branch_public_456",
            "organization_public_123",
          ],
          capturedAt: fixedNow.toISOString(),
        },
        answerStatus: "in_progress",
        scoreSummary: null,
        submittedAt: null,
        resultSummaryVisible: false,
      },
    });
    expect(getSavedAnswerDrafts()).toEqual([
      {
        contentType: "organization_training_answer_draft",
        trainingVersionPublicId: "training_version_public_123",
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_branch_public_456",
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            "organization_branch_public_456",
            "organization_public_123",
          ],
          capturedAt: fixedNow.toISOString(),
        },
        answerStatus: "in_progress",
        answeredQuestionCount: 1,
        answerItems: [],
        scoreSummary: null,
        savedAt: fixedNow.toISOString(),
        submittedAt: null,
        formalWritePolicy: {
          createPractice: false,
          createMockExam: false,
          createFormalAnswerRecord: false,
          createExamReport: false,
          createMistakeBook: false,
        },
      },
    ]);
  });

  it("submits an employee answer once and blocks duplicate official submission", async () => {
    const { service, getSubmittedAnswers } = createServiceFixture();

    const result = await service.submitEmployeeAnswer({
      employeeContext: {
        employeePublicId: "employee_public_123",
        currentOrganizationPublicId: "organization_branch_public_456",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      version: createPublishedVersion(),
      answerInput: {
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
      },
      existingAnswer: null,
    });

    expect(result).toEqual({
      success: true,
      answer: {
        publicId: "training_answer_record_public_123",
        trainingVersionPublicId: "training_version_public_123",
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_branch_public_456",
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            "organization_branch_public_456",
            "organization_public_123",
          ],
          capturedAt: fixedNow.toISOString(),
        },
        answerStatus: "submitted",
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
        submittedAt: fixedNow.toISOString(),
        resultSummaryVisible: false,
      },
    });
    expect(getSubmittedAnswers()).toEqual([
      {
        contentType: "organization_training_answer_record",
        trainingVersionPublicId: "training_version_public_123",
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_branch_public_456",
        answerOrganizationSnapshot: {
          organizationPublicIds: [
            "organization_branch_public_456",
            "organization_public_123",
          ],
          capturedAt: fixedNow.toISOString(),
        },
        answerStatus: "submitted",
        answeredQuestionCount: 2,
        answerItems: [],
        questionResults: [],
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
        submittedAt: fixedNow.toISOString(),
        formalWritePolicy: {
          createPractice: false,
          createMockExam: false,
          createFormalAnswerRecord: false,
          createExamReport: false,
          createMistakeBook: false,
        },
      },
    ]);

    const duplicateResult = await service.submitEmployeeAnswer({
      employeeContext: {
        employeePublicId: "employee_public_123",
        currentOrganizationPublicId: "organization_branch_public_456",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      version: createPublishedVersion(),
      answerInput: {
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
      },
      existingAnswer: createSubmittedEmployeeAnswer(),
    });

    expect(duplicateResult).toEqual({
      success: false,
      reason: "already_submitted",
      message: "Organization training employee answer is blocked.",
    });
  });

  it("keeps taken-down training limited to own read-only historical summary", async () => {
    const { service, getSavedAnswerDrafts } = createServiceFixture();
    const takenDownVersion = createPublishedVersion({
      status: "taken_down",
      takenDownAt: fixedNow.toISOString(),
      takedownReason: "outdated training",
    });

    const draftResult = await service.saveEmployeeAnswerDraft({
      employeeContext: {
        employeePublicId: "employee_public_123",
        currentOrganizationPublicId: "organization_branch_public_456",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      version: takenDownVersion,
      answerInput: {
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 1,
      },
      existingAnswer: null,
    });

    expect(draftResult).toEqual({
      success: false,
      reason: "version_not_answerable",
      message: "Organization training employee answer is blocked.",
    });
    expect(getSavedAnswerDrafts()).toEqual([]);

    const summaryResult = await service.getEmployeeAnswerReadonlySummary({
      employeeContext: {
        employeePublicId: "employee_public_123",
        currentOrganizationPublicId: "organization_branch_public_456",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
        authorizationContext: createAdvancedOrgAuthContext(),
      },
      version: takenDownVersion,
      existingAnswer: createSubmittedEmployeeAnswer(),
    });

    expect(summaryResult).toEqual({
      success: true,
      answer: createSubmittedEmployeeAnswer({
        answerStatus: "read_only",
        resultSummaryVisible: true,
      }),
    });
    expect(JSON.stringify(summaryResult)).not.toContain("standardAnswer");
    expect(JSON.stringify(summaryResult)).not.toContain("analysis");
    expect(JSON.stringify(summaryResult)).not.toContain("practicePublicId");
    expect(JSON.stringify(summaryResult)).not.toContain("mockExamPublicId");
    expect(JSON.stringify(summaryResult)).not.toContain("answerRecordPublicId");
    expect(JSON.stringify(summaryResult)).not.toContain("examReportPublicId");
    expect(JSON.stringify(summaryResult)).not.toContain("mistakeBookPublicId");
  });
});
