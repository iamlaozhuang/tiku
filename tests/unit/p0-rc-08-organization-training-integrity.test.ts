import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  OrganizationTrainingDraftQuestionInput,
  OrganizationTrainingPublishQuestionInput,
} from "../../src/server/models/organization-training";
import {
  createCanonicalOrganizationTrainingDraftQuestions,
  createOrganizationTrainingService,
  evaluateOrganizationTrainingAnswer,
  type OrganizationTrainingPublishedVersionPersistenceWrite,
  type OrganizationTrainingStore,
} from "../../src/server/services/organization-training-service";
import { OrganizationTrainingPersistenceConflictError } from "../../src/server/contracts/organization-training-persistence-contract";
import {
  isValidOrganizationTrainingScoringCompletion,
  isValidOrganizationTrainingScoringCompletionForInput,
} from "../../src/server/repositories/organization-training-scoring-task-repository";
import {
  normalizeOrganizationTrainingDraftSaveInput,
  normalizeOrganizationTrainingEmployeeAnswerDraftInput,
  normalizeOrganizationTrainingEmployeeAnswerSubmitInput,
  normalizeOrganizationTrainingPublishInput,
} from "../../src/server/validators/organization-training";

const canonicalQuestions: OrganizationTrainingPublishQuestionInput[] = [
  {
    publicId: "question_single_1",
    sequenceNumber: 1,
    questionType: "single_choice",
    materialTitle: null,
    materialContent: null,
    stem: "Choose A",
    options: [
      { publicId: "option_a", label: "A", content: "Correct" },
      { publicId: "option_b", label: "B", content: "Wrong" },
    ],
    score: 2,
    standardAnswer: "A",
    analysisSummary: "A is correct.",
    evidenceStatus: "sufficient",
    citationCount: 1,
  },
  {
    publicId: "question_multi_1",
    sequenceNumber: 2,
    questionType: "multi_choice",
    materialTitle: null,
    materialContent: null,
    stem: "Choose A and B",
    options: [
      { publicId: "multi_a", label: "A", content: "First" },
      { publicId: "multi_b", label: "B", content: "Second" },
      { publicId: "multi_c", label: "C", content: "Wrong" },
    ],
    score: 3,
    standardAnswer: "A,B",
    analysisSummary: "A and B are correct.",
    evidenceStatus: "sufficient",
    citationCount: 2,
  },
  {
    publicId: "question_short_1",
    sequenceNumber: 3,
    questionType: "short_answer",
    materialTitle: null,
    materialContent: null,
    stem: "Explain",
    options: [],
    score: 5,
    standardAnswer: "Expected explanation",
    analysisSummary: "Use the scoring points.",
    evidenceStatus: "weak",
    citationCount: 0,
  },
];

function toDraftQuestion(
  question: OrganizationTrainingPublishQuestionInput,
): OrganizationTrainingDraftQuestionInput {
  return {
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    ...(question.paperSectionKey !== undefined &&
    question.paperSectionTitle !== undefined &&
    question.paperSectionSortOrder !== undefined &&
    question.questionSortOrder !== undefined
      ? {
          paperSectionKey: question.paperSectionKey,
          paperSectionTitle: question.paperSectionTitle,
          paperSectionSortOrder: question.paperSectionSortOrder,
          questionSortOrder: question.questionSortOrder,
        }
      : {}),
    materialTitle: question.materialTitle,
    materialContent: question.materialContent,
    stem: question.stem,
    options: question.options.map((option) => ({ ...option })),
    score: question.score,
    standardAnswer: question.standardAnswer,
    analysisSummary: question.analysisSummary,
  };
}

describe("P0 RC-08 organization training integrity", () => {
  it("accepts only a minimal publish command and rejects client-owned truth", () => {
    expect(
      normalizeOrganizationTrainingPublishInput({
        draftPublicId: "training_draft_1",
        expectedRevision: 2,
        operationId: "publish_operation_1",
        answerDeadlineAt: null,
        publishScopeOrganizationPublicIds: ["organization_1"],
        weakEvidenceConfirmed: true,
      }),
    ).toEqual({
      success: true,
      value: {
        draftPublicId: "training_draft_1",
        expectedRevision: 2,
        operationId: "publish_operation_1",
        answerDeadlineAt: null,
        publishScopeOrganizationPublicIds: ["organization_1"],
        weakEvidenceConfirmed: true,
      },
    });

    expect(
      normalizeOrganizationTrainingPublishInput({
        draftPublicId: "training_draft_1",
        expectedRevision: 2,
        operationId: "publish_operation_1",
        answerDeadlineAt: null,
        publishScopeOrganizationPublicIds: ["organization_1"],
        weakEvidenceConfirmed: true,
        questions: canonicalQuestions,
        questionCount: 999,
        totalScore: 999,
        organizationPublicId: "attacker_org",
        authorizationPublicId: "attacker_auth",
      }),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("downgrades every client-edited draft question and rejects evidence authority", () => {
    const draftSave = normalizeOrganizationTrainingDraftSaveInput({
      draftPublicId: "training_draft_1",
      expectedRevision: 1,
      operationId: "save_operation_1",
      title: "Canonical training",
      description: null,
      questions: canonicalQuestions.map(toDraftQuestion),
    });

    expect(draftSave.success).toBe(true);
    if (!draftSave.success) {
      return;
    }

    expect(
      createCanonicalOrganizationTrainingDraftQuestions(
        draftSave.value.questions,
      ),
    ).toEqual(
      canonicalQuestions.map((question) => ({
        ...question,
        evidenceStatus: "weak",
        citationCount: 0,
      })),
    );
    expect(
      normalizeOrganizationTrainingDraftSaveInput({
        ...draftSave.value,
        questions: canonicalQuestions,
      }),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("preserves only byte-equivalent server evidence and downgrades edited content", () => {
    const clientQuestions = canonicalQuestions.map(toDraftQuestion);

    expect(
      createCanonicalOrganizationTrainingDraftQuestions(
        clientQuestions,
        canonicalQuestions,
      ),
    ).toEqual(canonicalQuestions);

    const editedQuestions = clientQuestions.map((question, index) =>
      index === 0 ? { ...question, stem: "Client-edited stem" } : question,
    );
    const canonicalEditedQuestions =
      createCanonicalOrganizationTrainingDraftQuestions(
        editedQuestions,
        canonicalQuestions,
      );

    expect(canonicalEditedQuestions[0]).toEqual(
      expect.objectContaining({
        evidenceStatus: "weak",
        citationCount: 0,
      }),
    );
    expect(canonicalEditedQuestions.slice(1)).toEqual(
      canonicalQuestions.slice(1),
    );

    const noEvidenceQuestion = {
      ...canonicalQuestions[0],
      evidenceStatus: "none" as const,
      citationCount: 0,
    };
    expect(
      createCanonicalOrganizationTrainingDraftQuestions(
        [clientQuestions[0]],
        [noEvidenceQuestion],
      ),
    ).toEqual([noEvidenceQuestion]);
  });

  it("rejects client counts and scores while accepting revisioned answer items", () => {
    const answerCommand = {
      trainingVersionPublicId: "training_version_1",
      expectedRevision: 0,
      operationId: "answer_operation_1",
      answerItems: [
        {
          questionPublicId: "question_single_1",
          selectedOptionPublicIds: ["option_a"],
          textAnswer: null,
        },
      ],
    };

    expect(
      normalizeOrganizationTrainingEmployeeAnswerDraftInput(answerCommand),
    ).toEqual({
      success: true,
      value: answerCommand,
    });
    expect(
      normalizeOrganizationTrainingEmployeeAnswerSubmitInput(answerCommand),
    ).toEqual({
      success: true,
      value: answerCommand,
    });
    expect(
      normalizeOrganizationTrainingEmployeeAnswerSubmitInput({
        ...answerCommand,
        answeredQuestionCount: 999,
        scoreSummary: { score: 999, totalScore: 999 },
      }),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("validates ownership and computes objective score without fabricating short-answer score", () => {
    expect(
      evaluateOrganizationTrainingAnswer({
        questions: canonicalQuestions,
        answerItems: [
          {
            questionPublicId: "question_single_1",
            selectedOptionPublicIds: ["option_a"],
            textAnswer: null,
          },
          {
            questionPublicId: "question_multi_1",
            selectedOptionPublicIds: ["multi_b", "multi_a"],
            textAnswer: null,
          },
          {
            questionPublicId: "question_short_1",
            selectedOptionPublicIds: [],
            textAnswer: "Learner explanation",
          },
        ],
        requireComplete: true,
      }),
    ).toEqual(
      expect.objectContaining({
        answeredQuestionCount: 3,
        answerStatus: "scoring",
        scoreSummary: null,
        objectiveScore: 5,
        totalScore: 10,
        requiresAiScoring: true,
      }),
    );

    expect(
      evaluateOrganizationTrainingAnswer({
        questions: canonicalQuestions,
        answerItems: [
          {
            questionPublicId: "question_single_1",
            selectedOptionPublicIds: ["foreign_option"],
            textAnswer: null,
          },
        ],
        requireComplete: false,
      }),
    ).toBeNull();
  });

  it("requires atomic source paths for draft publish and answer/scoring transitions", () => {
    const repositorySource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/organization-training-repository.ts",
      ),
      "utf8",
    );
    const scoringSource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/organization-training-scoring-task-repository.ts",
      ),
      "utf8",
    );

    expect(repositorySource).toContain("publishCanonicalDraftTransaction");
    expect(repositorySource).toContain("submitEmployeeAnswerTransaction");
    expect(repositorySource).toContain("for update");
    expect(scoringSource).toContain("transaction");
    expect(scoringSource).toContain("skip locked");
    expect(scoringSource).toContain("maxAttemptCount: 3");
    expect(scoringSource).toContain("timeoutSecond: 60");
    expect(scoringSource).toContain("lease_expires_at >");
    expect(scoringSource).toContain(
      "isValidOrganizationTrainingScoringCompletionForInput",
    );
  });

  it("rejects impossible worker scores before they can pollute training statistics", () => {
    const validCompletion = {
      score: 5,
      totalScore: 10,
      questionResults: [
        {
          questionPublicId: "question_single_1",
          score: 2,
          maxScore: 2,
          standardAnswer: "A",
          analysis: "A is correct.",
          scoringPointResults: [],
        },
        {
          questionPublicId: "question_short_1",
          score: 3,
          maxScore: 8,
          standardAnswer: "Expected explanation",
          analysis: "Use the scoring points.",
          scoringPointResults: [],
        },
      ],
    };

    expect(isValidOrganizationTrainingScoringCompletion(validCompletion)).toBe(
      true,
    );
    expect(
      isValidOrganizationTrainingScoringCompletion({
        ...validCompletion,
        score: 999,
      }),
    ).toBe(false);
    expect(
      isValidOrganizationTrainingScoringCompletion({
        ...validCompletion,
        questionResults: [validCompletion.questionResults[0]!],
      }),
    ).toBe(false);
  });

  it("rejects scoring output that rewrites canonical objective or answer facts", () => {
    const inputSnapshot = {
      objectiveScore: 2,
      totalScore: 7,
      questionResults: [
        {
          questionPublicId: "question_single_1",
          score: 2,
          maxScore: 2,
          standardAnswer: "A",
          analysis: "A is correct.",
          scoringPointResults: [],
        },
        {
          questionPublicId: "question_short_1",
          score: 0,
          maxScore: 5,
          standardAnswer: "Expected explanation",
          analysis: "Use the scoring points.",
          scoringPointResults: [],
        },
      ],
      shortAnswerQuestionPublicIds: ["question_short_1"],
    };
    const validCompletion = {
      score: 6,
      totalScore: 7,
      questionResults: [
        inputSnapshot.questionResults[0]!,
        {
          ...inputSnapshot.questionResults[1]!,
          score: 4,
        },
      ],
    };

    expect(
      isValidOrganizationTrainingScoringCompletionForInput(
        validCompletion,
        inputSnapshot,
      ),
    ).toBe(true);
    expect(
      isValidOrganizationTrainingScoringCompletionForInput(
        {
          ...validCompletion,
          questionResults: validCompletion.questionResults.map(
            (result, index) => (index === 0 ? { ...result, score: 1 } : result),
          ),
        },
        inputSnapshot,
      ),
    ).toBe(false);
    expect(
      isValidOrganizationTrainingScoringCompletionForInput(
        {
          ...validCompletion,
          questionResults: validCompletion.questionResults.map(
            (result, index) =>
              index === 1
                ? { ...result, standardAnswer: "worker-controlled answer" }
                : result,
          ),
        },
        inputSnapshot,
      ),
    ).toBe(false);
    expect(
      isValidOrganizationTrainingScoringCompletionForInput(validCompletion, {
        ...inputSnapshot,
        shortAnswerQuestionPublicIds: ["question_single_1"],
      }),
    ).toBe(false);
  });

  it("turns a publish race into a recoverable conflict instead of a runtime failure", async () => {
    const service = createOrganizationTrainingService(
      {
        async publishVersion() {
          throw new OrganizationTrainingPersistenceConflictError(
            "publish_conflict",
          );
        },
      } as unknown as OrganizationTrainingStore,
      { now: () => new Date("2026-07-15T12:00:00.000Z") },
    );
    const draft = {
      publicId: "training_draft_1",
      draftStatus: "draft" as const,
      revision: 2,
      sourceTaskPublicId: null,
      organizationPublicId: "organization_1",
      authorizationSource: "org_auth" as const,
      authorizationPublicId: "org_auth_1",
      profession: "monopoly" as const,
      level: 3,
      subject: "theory" as const,
      title: "Training",
      description: null,
      questionCount: canonicalQuestions.length,
      totalScore: 10,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 1,
        trueFalse: 0,
        shortAnswer: 1,
      },
      questions: canonicalQuestions,
      evidenceStatus: "weak" as const,
      validationStatus: "needs_review" as const,
      retentionStatus: "active" as const,
      createdAt: "2026-07-15T11:00:00.000Z",
      expiresAt: null,
    };

    const result = await service.publishVersion({
      publishInput: {
        draftPublicId: draft.publicId,
        expectedRevision: 2,
        operationId: "publish_operation_1",
        answerDeadlineAt: null,
        publishScopeOrganizationPublicIds: [draft.organizationPublicId],
        weakEvidenceConfirmed: true,
      },
      draft,
      adminContext: {
        adminPublicId: "admin_1",
        visibleOrganizationPublicIds: [draft.organizationPublicId],
      },
      authorizationContext: {
        profession: "monopoly",
        level: 3,
        contextDisplayStatus: "display_only",
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        authorizationPublicId: draft.authorizationPublicId,
        ownerType: "organization",
        ownerPublicId: draft.organizationPublicId,
        organizationPublicId: draft.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: draft.organizationPublicId,
        capabilities: {
          canGenerateAiQuestion: false,
          canGenerateAiPaper: false,
          canCreateOrganizationTraining: true,
          canAnswerOrganizationTraining: false,
          canViewOrganizationTrainingSummary: true,
          canManageAuthorizationQuota: false,
        },
        blockedReason: null,
      },
      persistenceLineage: { organizationId: 1, orgAuthId: 1 },
    });

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        reason: "persistence_conflict",
      }),
    );
  });

  it("delegates stale-looking retries to the transactional idempotency authority", async () => {
    let savedDraftWriteCount = 0;
    let publishedVersionWriteCount = 0;
    const draft = {
      publicId: "training_draft_1",
      draftStatus: "draft" as const,
      revision: 2,
      sourceTaskPublicId: null,
      organizationPublicId: "organization_1",
      authorizationSource: "org_auth" as const,
      authorizationPublicId: "org_auth_1",
      profession: "monopoly" as const,
      level: 3,
      subject: "theory" as const,
      title: "Training",
      description: null,
      questionCount: canonicalQuestions.length,
      totalScore: 10,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 1,
        trueFalse: 0,
        shortAnswer: 1,
      },
      questions: canonicalQuestions,
      evidenceStatus: "weak" as const,
      validationStatus: "needs_review" as const,
      retentionStatus: "active" as const,
      createdAt: "2026-07-15T11:00:00.000Z",
      expiresAt: null,
    };
    const service = createOrganizationTrainingService(
      {
        async saveDraft() {
          savedDraftWriteCount += 1;
          return draft;
        },
        async publishVersion(
          write: OrganizationTrainingPublishedVersionPersistenceWrite,
        ) {
          publishedVersionWriteCount += 1;
          return {
            ...write,
            publicId: "training_version_1",
            versionNumber: 1,
            answerDeadlineAt: write.answerDeadlineAt ?? null,
          };
        },
      } as unknown as OrganizationTrainingStore,
      { now: () => new Date("2026-07-15T12:00:00.000Z") },
    );
    const adminContext = {
      adminPublicId: "admin_1",
      visibleOrganizationPublicIds: [draft.organizationPublicId],
    };
    const authorizationContext = {
      profession: "monopoly" as const,
      level: 3,
      contextDisplayStatus: "display_only" as const,
      effectiveEdition: "advanced" as const,
      authorizationSource: "org_auth" as const,
      authorizationPublicId: draft.authorizationPublicId,
      ownerType: "organization" as const,
      ownerPublicId: draft.organizationPublicId,
      organizationPublicId: draft.organizationPublicId,
      quotaOwnerType: "organization" as const,
      quotaOwnerPublicId: draft.organizationPublicId,
      capabilities: {
        canGenerateAiQuestion: false,
        canGenerateAiPaper: false,
        canCreateOrganizationTraining: true,
        canAnswerOrganizationTraining: false,
        canViewOrganizationTrainingSummary: true,
        canManageAuthorizationQuota: false,
      },
      blockedReason: null,
    };

    const saveResult = await service.saveDraft({
      adminContext,
      authorizationContext,
      draft,
      draftInput: {
        draftPublicId: draft.publicId,
        expectedRevision: 1,
        operationId: "save_operation_1",
        title: draft.title,
        description: draft.description,
        questions: canonicalQuestions.map(toDraftQuestion),
      },
      trustedDraftQuestions: canonicalQuestions,
    });
    const publishResult = await service.publishVersion({
      publishInput: {
        draftPublicId: draft.publicId,
        expectedRevision: 1,
        operationId: "publish_operation_1",
        answerDeadlineAt: null,
        publishScopeOrganizationPublicIds: [draft.organizationPublicId],
        weakEvidenceConfirmed: true,
      },
      draft: { ...draft, draftStatus: "consumed" as const },
      adminContext,
      authorizationContext,
      persistenceLineage: { organizationId: 1, orgAuthId: 1 },
    });

    expect(saveResult.success).toBe(true);
    expect(publishResult.success).toBe(true);
    expect(savedDraftWriteCount).toBe(1);
    expect(publishedVersionWriteCount).toBe(1);
  });
});
