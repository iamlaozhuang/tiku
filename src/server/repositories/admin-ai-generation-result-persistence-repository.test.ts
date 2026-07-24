import { describe, expect, it, vi } from "vitest";

import type {
  AdminAiGenerationResultPersistenceGateway,
  AdminAiGenerationResultPersistenceRow,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import {
  createAdminAiGenerationResultByTaskCondition,
  createAdminAiGenerationResultHistoryCondition,
  createAdminAiGenerationResultPersistenceRepository,
  createAdminAiGenerationResultsByTaskPublicIdsCondition,
  resolveGenerationParametersSnapshot,
  resolveOrganizationTrainingPaperDraftSnapshot,
  resolveOrganizationTrainingQuestionDraftSnapshot,
} from "./admin-ai-generation-result-persistence-repository";
import { aiGenerationQuestionTypeValues } from "../services/ai-generation-question-type-contract";

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsText(item, text, seen));
  }

  return Object.values(value).some((item) => containsText(item, text, seen));
}

function createResultRow(
  overrides: Partial<AdminAiGenerationResultPersistenceRow> = {},
): AdminAiGenerationResultPersistenceRow {
  return {
    id: 901,
    public_id: "admin_ai_generation_result_public_901",
    ai_generation_task_id: 701,
    task_public_id: "admin_ai_generation_task_public_901",
    request_public_id: "admin_ai_generation_request_public_901",
    workspace: "organization",
    generation_kind: "paper",
    owner_type: "organization",
    owner_public_id: "organization_public_901",
    organization_public_id: "organization_public_901",
    task_type: "ai_paper_generation",
    result_status: "draft",
    content_redacted_snapshot: {
      redactionStatus: "redacted",
      contentDigest: "sha256:admin_result_901",
    },
    content_digest: "sha256:admin_result_901",
    content_preview_masked: "masked admin generated result preview",
    citation_redacted_snapshot: null,
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    source_question_public_id: null,
    source_paper_public_id: null,
    is_formal_adoption_blocked: true,
    formal_adoption_review_status: null,
    formal_adoption_target_write_status: null,
    formal_adoption_question_public_id: null,
    formal_adoption_paper_public_id: null,
    formal_adoption_reviewed_at: null,
    created_at: new Date("2026-06-26T20:00:00.000Z"),
    updated_at: new Date("2026-06-26T20:00:00.000Z"),
    ...overrides,
  };
}

function createPersistedOrganizationTrainingQuestion(
  questionType: string,
  sequenceNumber = 1,
  options: { currentTypeFacts?: boolean } = {},
) {
  const currentTypeFacts = options.currentTypeFacts ?? true;
  const isChoice =
    questionType === "single_choice" || questionType === "multi_choice";
  const isFillBlank = questionType === "fill_blank";
  const isScoredSubjective = [
    "short_answer",
    "case_analysis",
    "calculation",
  ].includes(questionType);

  return {
    publicId: `organization_training_question_${sequenceNumber}`,
    sequenceNumber,
    questionType,
    materialTitle: null,
    materialContent: null,
    stem: `Question ${sequenceNumber}`,
    options: isChoice
      ? [
          {
            publicId: `organization_training_question_${sequenceNumber}_option_a`,
            label: "A",
            content: "Answer A",
          },
        ]
      : [],
    ...(currentTypeFacts
      ? {
          scoringPoints: isScoredSubjective
            ? [{ description: "Key fact", score: 1, sortOrder: 1 }]
            : [],
          fillBlankAnswers: isFillBlank
            ? [
                {
                  blankKey: "blank_1",
                  standardAnswers: ["Answer"],
                  score: 1,
                  sortOrder: 1,
                },
              ]
            : [],
        }
      : {}),
    score: 1,
    evidenceSummary: {
      evidenceStatus: "sufficient",
      citationCount: 1,
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer: isFillBlank ? "Answer" : "A",
      analysis: "Analysis",
    },
  };
}

function createGateway(options: {
  rows?: AdminAiGenerationResultPersistenceRow[];
  existingRow?: AdminAiGenerationResultPersistenceRow | null;
  insertedRow?: AdminAiGenerationResultPersistenceRow | null;
  taskRow?: {
    id: number;
    public_id: string;
    request_public_id: string;
    workspace: "content" | "organization";
    owner_type: "platform" | "organization";
    owner_public_id: string;
    organization_public_id: string | null;
    task_type: "ai_question_generation" | "ai_paper_generation";
  } | null;
}) {
  const listResultRows = vi.fn(async (query) =>
    (options.rows ?? [])
      .filter(
        (row) =>
          row.workspace === query.workspace &&
          row.owner_type === query.ownerType &&
          row.owner_public_id === query.ownerPublicId &&
          row.generation_kind === query.generationKind &&
          row.result_status === "draft",
      )
      .sort(
        (leftRow, rightRow) =>
          rightRow.created_at.getTime() - leftRow.created_at.getTime() ||
          leftRow.public_id.localeCompare(rightRow.public_id),
      )
      .slice(query.offset, query.offset + query.limit),
  );
  const listResultRowsByTaskPublicIds = vi.fn(async (query) => {
    const taskPublicIds = new Set(query.taskPublicIds);

    return (options.rows ?? []).filter(
      (row) =>
        row.workspace === query.workspace &&
        row.owner_type === query.ownerType &&
        row.owner_public_id === query.ownerPublicId &&
        row.generation_kind === query.generationKind &&
        row.result_status === "draft" &&
        taskPublicIds.has(row.task_public_id),
    );
  });
  const findResultByTaskPublicId = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findTaskByPublicId = vi.fn(async () => options.taskRow ?? null);
  const insertDraftResult = vi.fn(async (...args: unknown[]) => {
    void args;
    return options.insertedRow ?? createResultRow();
  });
  const attachResultToTask = vi.fn(async (...args: unknown[]) => {
    void args;
  });
  const insertDraftResultAndCompleteTask = vi.fn(async (input) => {
    const row = await insertDraftResult(input);

    if (row !== null) {
      await attachResultToTask(input);
    }

    return row;
  });

  const gateway: AdminAiGenerationResultPersistenceGateway = {
    listResultRows,
    listResultRowsByTaskPublicIds,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResult,
    insertDraftResultAndCompleteTask,
    attachResultToTask,
  };

  return {
    gateway,
    listResultRows,
    listResultRowsByTaskPublicIds,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResult,
    insertDraftResultAndCompleteTask,
    attachResultToTask,
  };
}

describe("admin AI generation result persistence repository", () => {
  it("persists result and succeeded attempt through one atomic gateway call", async () => {
    const insertedRow = createResultRow();
    const atomicComplete = vi.fn(async () => insertedRow);
    const { gateway, insertDraftResult, attachResultToTask } = createGateway({
      insertedRow,
      taskRow: {
        id: 701,
        public_id: insertedRow.task_public_id,
        request_public_id: insertedRow.request_public_id,
        workspace: insertedRow.workspace,
        owner_type: insertedRow.owner_type,
        owner_public_id: insertedRow.owner_public_id,
        organization_public_id: insertedRow.organization_public_id,
        task_type: insertedRow.task_type,
      },
    });
    const repository = createAdminAiGenerationResultPersistenceRepository({
      ...gateway,
      insertDraftResultAndCompleteTask: atomicComplete,
    } as AdminAiGenerationResultPersistenceGateway & {
      insertDraftResultAndCompleteTask: typeof atomicComplete;
    });
    const attempt = {
      taskPublicId: insertedRow.task_public_id,
      retryCount: 1,
      startedAt: new Date("2026-07-22T12:05:00.123Z"),
    };

    await repository.createOrReuseDraftResult({
      resultPublicId: insertedRow.public_id,
      taskPublicId: insertedRow.task_public_id,
      workspace: insertedRow.workspace,
      generationKind: insertedRow.generation_kind,
      ownerType: insertedRow.owner_type,
      ownerPublicId: insertedRow.owner_public_id,
      organizationPublicId: insertedRow.organization_public_id,
      taskType: insertedRow.task_type,
      contentRedactedSnapshot: insertedRow.content_redacted_snapshot,
      contentDigest: insertedRow.content_digest,
      contentPreviewMasked: insertedRow.content_preview_masked,
      citationRedactedSnapshot: insertedRow.citation_redacted_snapshot,
      evidenceStatus: insertedRow.evidence_status,
      citationCount: insertedRow.citation_count,
      aiCallLogPublicId: insertedRow.ai_call_log_public_id,
      sourceQuestionPublicId: insertedRow.source_question_public_id,
      sourcePaperPublicId: insertedRow.source_paper_public_id,
      createdAt: insertedRow.created_at,
      attempt,
    });

    expect(atomicComplete).toHaveBeenCalledWith(
      expect.objectContaining({ attempt }),
    );
    expect(insertDraftResult).not.toHaveBeenCalled();
    expect(attachResultToTask).not.toHaveBeenCalled();
  });

  it("builds workspace and owner scoped result history conditions", () => {
    const condition = createAdminAiGenerationResultHistoryCondition({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "workspace")).toBe(true);
    expect(containsText(condition, "organization")).toBe(true);
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_901")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
  });

  it("builds workspace and owner scoped result lookup by task public id", () => {
    const condition = createAdminAiGenerationResultByTaskCondition({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      taskPublicId: "admin_ai_generation_task_public_content_901",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "workspace")).toBe(true);
    expect(containsText(condition, "content")).toBe(true);
    expect(containsText(condition, "owner_type")).toBe(true);
    expect(containsText(condition, "platform")).toBe(true);
    expect(containsText(condition, "task_public_id")).toBe(true);
  });

  it("builds a draft-only scoped condition for the authoritative task page", () => {
    const condition = createAdminAiGenerationResultsByTaskPublicIdsCondition({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      taskPublicIds: [
        "admin_ai_generation_task_public_page_6",
        "admin_ai_generation_task_public_page_7",
      ],
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "workspace")).toBe(true);
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_901")).toBe(true);
    expect(containsText(condition, "generation_kind")).toBe(true);
    expect(containsText(condition, "paper")).toBe(true);
    expect(containsText(condition, "result_status")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
    expect(containsText(condition, "task_public_id")).toBe(true);
    expect(
      containsText(condition, "admin_ai_generation_task_public_page_7"),
    ).toBe(true);
  });

  it("loads one scoped result batch by the authoritative task page public ids", async () => {
    const requestedTaskPublicIds = [
      "admin_ai_generation_task_public_page_6",
      "admin_ai_generation_task_public_page_7",
    ];
    const { gateway, listResultRowsByTaskPublicIds } = createGateway({
      rows: [
        createResultRow({
          public_id: "admin_ai_generation_result_public_page_7",
          task_public_id: requestedTaskPublicIds[1],
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_page_6",
          task_public_id: requestedTaskPublicIds[0],
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_other_page",
          task_public_id: "admin_ai_generation_task_public_other_page",
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const results = await repository.listDraftResultsByTaskPublicIds({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      taskPublicIds: [...requestedTaskPublicIds, requestedTaskPublicIds[0]],
    });

    expect(listResultRowsByTaskPublicIds).toHaveBeenCalledOnce();
    expect(listResultRowsByTaskPublicIds).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      taskPublicIds: requestedTaskPublicIds,
    });
    expect(results.map((result) => result.taskPublicId)).toEqual(
      requestedTaskPublicIds,
    );
  });

  it("lists redacted draft results newest first without internal ids or raw snapshots", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createResultRow({
          public_id: "admin_ai_generation_result_public_b",
          created_at: new Date("2026-06-26T20:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_c",
          created_at: new Date("2026-06-26T21:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_a",
          created_at: new Date("2026-06-26T20:00:00.000Z"),
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });
    expect(draftResults.map((result) => result.resultPublicId)).toEqual([
      "admin_ai_generation_result_public_c",
      "admin_ai_generation_result_public_a",
      "admin_ai_generation_result_public_b",
    ]);
    expect(JSON.stringify(draftResults)).not.toMatch(/"id":/u);
    expect(JSON.stringify(draftResults)).not.toContain(
      "content_redacted_snapshot",
    );
  });

  it("surfaces a content-admin reviewed draft snapshot for historical formal adoption", async () => {
    const { gateway } = createGateway({
      rows: [
        createResultRow({
          workspace: "content",
          generation_kind: "question",
          owner_type: "platform",
          owner_public_id: "platform_content_review_pool",
          organization_public_id: null,
          task_type: "ai_question_generation",
          content_redacted_snapshot: {
            redactionStatus: "redacted",
            formalReviewedDraft: {
              questionType: "single_choice",
              profession: "marketing",
              level: 3,
              subject: "theory",
              stemRichText: "历史草稿题干",
              analysisRichText: "历史草稿解析",
              standardAnswerRichText: "A",
              multiChoiceRule: "all_correct_only",
              scoringMethod: "auto_match",
              materialPublicId: null,
              questionOptions: [
                {
                  label: "A",
                  contentRichText: "历史选项 A",
                  isCorrect: true,
                  sortOrder: 1,
                },
              ],
              scoringPoints: [],
              fillBlankAnswers: [],
              knowledgeNodePublicIds: [],
              tagPublicIds: [],
            },
          },
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      generationKind: "question",
      page: 1,
      pageSize: 10,
      limit: 10,
      offset: 0,
    });

    expect(draftResults[0]?.contentReference).toMatchObject({
      reviewedDraft: {
        questionType: "single_choice",
        stemRichText: "历史草稿题干",
        standardAnswerRichText: "A",
      },
    });
    expect(JSON.stringify(draftResults)).not.toContain("rawPrompt");
    expect(JSON.stringify(draftResults)).not.toContain("rawOutput");
    expect(JSON.stringify(draftResults)).not.toContain("providerPayload");
  });

  it("surfaces persisted formal adoption draft status for content-admin history", async () => {
    const { gateway } = createGateway({
      rows: [
        createResultRow({
          workspace: "content",
          generation_kind: "question",
          owner_type: "platform",
          owner_public_id: "platform_content_review_pool",
          organization_public_id: null,
          task_type: "ai_question_generation",
          formal_adoption_review_status: "approved_for_formal_adoption",
          formal_adoption_target_write_status: "draft_created",
          formal_adoption_question_public_id: "formal_question_public_reviewed",
          formal_adoption_reviewed_at: new Date("2026-06-26T21:00:00.000Z"),
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      generationKind: "question",
      page: 1,
      pageSize: 10,
      limit: 10,
      offset: 0,
    });

    expect(draftResults[0]?.formalAdoption).toEqual({
      isBlocked: true,
      status: "draft_created",
      reviewStatus: "approved_for_formal_adoption",
      formalTargetWriteStatus: "draft_created",
      formalQuestionPublicId: "formal_question_public_reviewed",
      formalPaperPublicId: null,
      reviewedAt: "2026-06-26T21:00:00.000Z",
    });
    expect(JSON.stringify(draftResults)).not.toMatch(
      /providerPayload|rawPrompt|rawOutput|"id":/u,
    );
  });

  it("preserves all seven canonical question types and their current type facts", () => {
    const snapshot = resolveOrganizationTrainingQuestionDraftSnapshot({
      workspace: "organization",
      generation_kind: "question",
      content_redacted_snapshot: {
        organizationTrainingQuestionDraft: {
          questions: aiGenerationQuestionTypeValues.map((questionType, index) =>
            createPersistedOrganizationTrainingQuestion(
              questionType,
              index + 1,
            ),
          ),
        },
      },
    });

    expect(
      snapshot?.questions.map((question) => question.questionType),
    ).toEqual(aiGenerationQuestionTypeValues);
    expect(snapshot?.questions[3]).toMatchObject({
      questionType: "fill_blank",
      scoringPoints: [],
      fillBlankAnswers: [
        {
          blankKey: "blank_1",
          standardAnswers: ["Answer"],
          score: 1,
          sortOrder: 1,
        },
      ],
    });
    expect(
      snapshot?.questions.slice(4).map((question) => question.scoringPoints),
    ).toEqual([
      [{ description: "Key fact", score: 1, sortOrder: 1 }],
      [{ description: "Key fact", score: 1, sortOrder: 1 }],
      [{ description: "Key fact", score: 1, sortOrder: 1 }],
    ]);
  });

  it.each([
    ["multiple_choice", "multi_choice"],
    ["subjective", "short_answer"],
  ] as const)(
    "normalizes the explicit legacy persisted alias %s to %s without re-emitting the alias",
    (legacyQuestionType, canonicalQuestionType) => {
      const snapshot = resolveOrganizationTrainingQuestionDraftSnapshot({
        workspace: "organization",
        generation_kind: "question",
        content_redacted_snapshot: {
          organizationTrainingQuestionDraft: {
            questions: [
              createPersistedOrganizationTrainingQuestion(
                legacyQuestionType,
                1,
                { currentTypeFacts: false },
              ),
            ],
          },
        },
      });

      expect(snapshot?.questions).toHaveLength(1);
      expect(snapshot?.questions[0]?.questionType).toBe(canonicalQuestionType);
      expect(JSON.stringify(snapshot)).not.toContain(legacyQuestionType);
    },
  );

  it.each([
    "unknown",
    "judge",
    "判断题",
    "Multi_Choice",
    " multi_choice",
    "multi_choice ",
  ])("rejects the noncanonical persisted question type %s", (questionType) => {
    expect(
      resolveOrganizationTrainingQuestionDraftSnapshot({
        workspace: "organization",
        generation_kind: "question",
        content_redacted_snapshot: {
          organizationTrainingQuestionDraft: {
            questions: [
              createPersistedOrganizationTrainingQuestion(questionType, 1, {
                currentTypeFacts: false,
              }),
            ],
          },
        },
      }),
    ).toBeNull();
  });

  it("rejects the whole persisted question result when one question is malformed", () => {
    expect(
      resolveOrganizationTrainingQuestionDraftSnapshot({
        workspace: "organization",
        generation_kind: "question",
        content_redacted_snapshot: {
          organizationTrainingQuestionDraft: {
            questions: [
              createPersistedOrganizationTrainingQuestion("single_choice", 1),
              createPersistedOrganizationTrainingQuestion("unknown", 2),
            ],
          },
        },
      }),
    ).toBeNull();
  });

  it("rejects a sparse persisted question collection instead of returning a partial projection", () => {
    const questions = [
      createPersistedOrganizationTrainingQuestion("single_choice", 1),
      createPersistedOrganizationTrainingQuestion("multi_choice", 2),
    ];
    delete questions[1];

    expect(
      resolveOrganizationTrainingQuestionDraftSnapshot({
        workspace: "organization",
        generation_kind: "question",
        content_redacted_snapshot: {
          organizationTrainingQuestionDraft: { questions },
        },
      }),
    ).toBeNull();
  });

  it("normalizes legacy aliases in a whole paper projection and rejects a malformed section without partial output", () => {
    const createPaperSnapshot = (sectionQuestionType: string) => ({
      paperTitle: "Legacy paper",
      requestedQuestionCount: 1,
      selectedQuestionCount: 1,
      sourceComposition: {
        platformFormalQuestionCount: 1,
        enterpriseTrainingSnapshotCount: 0,
      },
      matchQuality: "fully_matched",
      paperSections: [
        {
          sectionKey: "legacy_section",
          title: "Legacy section",
          questionType: sectionQuestionType,
          targetQuestionCount: 1,
          selectedQuestionCount: 1,
          totalScore: 1,
          questions: [
            createPersistedOrganizationTrainingQuestion(
              sectionQuestionType,
              1,
              { currentTypeFacts: false },
            ),
          ],
        },
      ],
      redactionStatus: "admin_safe_detail",
    });
    const legacySnapshot = resolveOrganizationTrainingPaperDraftSnapshot({
      workspace: "organization",
      generation_kind: "paper",
      content_redacted_snapshot: {
        organizationTrainingPaperDraft: createPaperSnapshot("subjective"),
      },
    });

    expect(legacySnapshot?.paperSections?.[0]?.questionType).toBe(
      "short_answer",
    );
    expect(legacySnapshot?.paperSections?.[0]?.questions[0]?.questionType).toBe(
      "short_answer",
    );
    expect(JSON.stringify(legacySnapshot)).not.toContain("subjective");

    expect(
      resolveOrganizationTrainingPaperDraftSnapshot({
        workspace: "organization",
        generation_kind: "paper",
        content_redacted_snapshot: {
          organizationTrainingPaperDraft: {
            ...createPaperSnapshot("single_choice"),
            paperSections: [
              ...createPaperSnapshot("single_choice").paperSections,
              {
                ...createPaperSnapshot("single_choice").paperSections[0],
                sectionKey: "broken_section",
                questionType: "judge",
              },
            ],
          },
        },
      }),
    ).toBeNull();
  });

  it("surfaces organization AI question results as enterprise training draft snapshots", async () => {
    const { gateway } = createGateway({
      rows: [
        createResultRow({
          workspace: "organization",
          generation_kind: "question",
          task_type: "ai_question_generation",
          evidence_status: "sufficient",
          citation_count: 2,
          content_redacted_snapshot: {
            redactionStatus: "redacted",
            generationParameters: {
              profession: "monopoly",
              level: 3,
              subject: "theory",
              questionType: "single_choice",
              questionCount: 1,
              difficulty: "medium",
              learningObjective: null,
              knowledgeNode: null,
              knowledgeNodeMode: "balanced",
              knowledgeNodePublicIds: [],
              includeDescendants: false,
              knowledgeNodeSupplement: null,
              sourcePreference: "balanced",
              questionTypeDistribution: null,
              paperStructure: null,
            },
            organizationTrainingQuestionDraft: {
              questions: [
                {
                  publicId: "organization_training_ai_question_draft_001",
                  sequenceNumber: 1,
                  questionType: "single_choice",
                  materialTitle: null,
                  materialContent: null,
                  stem: "Synthetic organization training stem",
                  options: [
                    {
                      publicId:
                        "organization_training_ai_question_draft_001_option_a",
                      label: "A",
                      content: "Synthetic option A",
                    },
                  ],
                  score: 1,
                  evidenceSummary: {
                    evidenceStatus: "sufficient",
                    citationCount: 2,
                  },
                  answerAndAnalysis: {
                    visibility: "collapsed_by_default",
                    standardAnswer: "A",
                    analysis: "Synthetic analysis",
                  },
                },
              ],
            },
          },
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "question",
      page: 1,
      pageSize: 10,
      limit: 10,
      offset: 0,
    });

    expect(
      draftResults[0]?.contentReference.organizationTrainingDraft,
    ).toMatchObject({
      questions: [
        {
          sequenceNumber: 1,
          questionType: "single_choice",
          stem: "Synthetic organization training stem",
          answerAndAnalysis: {
            visibility: "collapsed_by_default",
            standardAnswer: "A",
            analysis: "Synthetic analysis",
          },
          evidenceSummary: {
            evidenceStatus: "sufficient",
            citationCount: 2,
          },
        },
      ],
    });
    expect(draftResults[0]?.contentReference).not.toHaveProperty(
      "generationParameters",
    );
    expect(
      resolveGenerationParametersSnapshot({
        content_redacted_snapshot: {
          generationParameters: {
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionType: "single_choice",
            questionCount: 1,
            difficulty: "medium",
            learningObjective: null,
            knowledgeNode: null,
            knowledgeNodeMode: "balanced",
            knowledgeNodePublicIds: [],
            includeDescendants: false,
            knowledgeNodeSupplement: null,
            sourcePreference: "balanced",
            questionTypeDistribution: null,
            paperStructure: null,
          },
        },
      }),
    ).toEqual({
      profession: "monopoly",
      level: 3,
      subject: "theory",
      questionType: "single_choice",
      questionCount: 1,
      difficulty: "medium",
      learningObjective: null,
      knowledgeNode: null,
      knowledgeNodeMode: "balanced",
      knowledgeNodePublicIds: [],
      includeDescendants: false,
      knowledgeNodeSupplement: null,
      sourcePreference: "balanced",
      questionTypeDistribution: null,
      paperStructure: null,
    });
    expect(JSON.stringify(draftResults)).not.toMatch(
      /providerPayload|rawPrompt|rawOutput|"id":/u,
    );
  });

  it("surfaces organization AI paper results as enterprise training paper draft snapshots", async () => {
    const { gateway } = createGateway({
      rows: [
        createResultRow({
          workspace: "organization",
          generation_kind: "paper",
          task_type: "ai_paper_generation",
          evidence_status: "sufficient",
          citation_count: 2,
          content_redacted_snapshot: {
            redactionStatus: "redacted",
            organizationTrainingPaperDraft: {
              paperTitle: "Synthetic enterprise training paper",
              requestedQuestionCount: 1,
              selectedQuestionCount: 1,
              sourceComposition: {
                platformFormalQuestionCount: 1,
                enterpriseTrainingSnapshotCount: 0,
              },
              matchQuality: "fully_matched",
              constraintLineage: {
                request: {
                  difficulty: "medium",
                  knowledgeNodePublicIds: ["knowledge_node_public_a"],
                },
                plan: {
                  difficulty: "medium",
                  knowledgeNodePublicIds: ["knowledge_node_public_a"],
                  parentKnowledgeNodePublicIds: [],
                },
              },
              assemblySections: [
                {
                  sectionKey: "single_choice",
                  title: "Single choice section",
                  questionType: "single_choice",
                  targetQuestionCount: 1,
                  selectedQuestionCount: 1,
                  selectedQuestions: [
                    {
                      questionPublicId: "question_public_a",
                      sourceKind: "platform_formal_question",
                      matchTier: "descendant",
                      score: 5,
                      constraintMatchBasis: {
                        difficulty: "medium",
                        knowledgeNodePublicIds: ["knowledge_node_public_child"],
                        parentKnowledgeNodePublicIds: [
                          "knowledge_node_public_a",
                        ],
                        ancestorKnowledgeNodePublicIds: [
                          "knowledge_node_public_a",
                        ],
                        matchTier: "descendant",
                      },
                    },
                  ],
                },
              ],
              paperSections: [
                {
                  sectionKey: "single_choice",
                  title: "Single choice section",
                  questionType: "single_choice",
                  targetQuestionCount: 1,
                  selectedQuestionCount: 1,
                  totalScore: 5,
                  questions: [
                    {
                      publicId: "organization_training_ai_paper_question_001",
                      sequenceNumber: 1,
                      questionType: "single_choice",
                      materialTitle: null,
                      materialContent: null,
                      stem: "Synthetic paper source stem",
                      options: [
                        {
                          publicId:
                            "organization_training_ai_paper_question_001_option_a",
                          label: "A",
                          content: "Synthetic option A",
                        },
                      ],
                      score: 5,
                      evidenceSummary: {
                        evidenceStatus: "sufficient",
                        citationCount: 2,
                      },
                      answerAndAnalysis: {
                        visibility: "collapsed_by_default",
                        standardAnswer: "A",
                        analysis: "Synthetic paper analysis",
                      },
                    },
                  ],
                },
              ],
              questions: [
                {
                  publicId: "organization_training_ai_paper_question_001",
                  sequenceNumber: 1,
                  questionType: "single_choice",
                  materialTitle: null,
                  materialContent: null,
                  stem: "Synthetic paper source stem",
                  options: [
                    {
                      publicId:
                        "organization_training_ai_paper_question_001_option_a",
                      label: "A",
                      content: "Synthetic option A",
                    },
                  ],
                  score: 5,
                  evidenceSummary: {
                    evidenceStatus: "sufficient",
                    citationCount: 2,
                  },
                  answerAndAnalysis: {
                    visibility: "collapsed_by_default",
                    standardAnswer: "A",
                    analysis: "Synthetic paper analysis",
                  },
                },
              ],
              redactionStatus: "admin_safe_detail",
            },
          },
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      page: 1,
      pageSize: 10,
      limit: 10,
      offset: 0,
    });

    expect(
      draftResults[0]?.contentReference.organizationTrainingPaperDraft,
    ).toMatchObject({
      paperTitle: "Synthetic enterprise training paper",
      selectedQuestionCount: 1,
      constraintLineage: {
        request: {
          difficulty: "medium",
          knowledgeNodePublicIds: ["knowledge_node_public_a"],
        },
        plan: {
          difficulty: "medium",
          knowledgeNodePublicIds: ["knowledge_node_public_a"],
          parentKnowledgeNodePublicIds: [],
        },
      },
      assemblySections: [
        {
          selectedQuestions: [
            {
              questionPublicId: "question_public_a",
              matchTier: "descendant",
              constraintMatchBasis: {
                difficulty: "medium",
                knowledgeNodePublicIds: ["knowledge_node_public_child"],
                parentKnowledgeNodePublicIds: ["knowledge_node_public_a"],
                ancestorKnowledgeNodePublicIds: ["knowledge_node_public_a"],
                matchTier: "descendant",
              },
            },
          ],
        },
      ],
      paperSections: [
        {
          title: "Single choice section",
          questions: [
            {
              stem: "Synthetic paper source stem",
              answerAndAnalysis: {
                visibility: "collapsed_by_default",
                standardAnswer: "A",
              },
            },
          ],
        },
      ],
      redactionStatus: "admin_safe_detail",
    });
    expect(JSON.stringify(draftResults)).not.toMatch(
      /providerPayload|rawPrompt|rawOutput|"id":/u,
    );
  });

  it("fails closed when a persisted paper lineage contains duplicate canonical knowledge identities", () => {
    expect(
      resolveOrganizationTrainingPaperDraftSnapshot({
        workspace: "organization",
        generation_kind: "paper",
        content_redacted_snapshot: {
          organizationTrainingPaperDraft: {
            paperTitle: "Synthetic paper",
            requestedQuestionCount: 1,
            selectedQuestionCount: 1,
            sourceComposition: {
              platformFormalQuestionCount: 1,
              enterpriseTrainingSnapshotCount: 0,
            },
            matchQuality: "fully_matched",
            constraintLineage: {
              request: {
                difficulty: "medium",
                knowledgeNodePublicIds: [
                  "knowledge_node_public_a",
                  "KNOWLEDGE_NODE_PUBLIC_A",
                ],
              },
              plan: {
                difficulty: "medium",
                knowledgeNodePublicIds: ["knowledge_node_public_a"],
                parentKnowledgeNodePublicIds: [],
              },
            },
            assemblySections: [
              {
                sectionKey: "single_choice",
                title: "Single choice section",
                questionType: "single_choice",
                targetQuestionCount: 1,
                selectedQuestionCount: 1,
                selectedQuestions: [
                  {
                    questionPublicId: "question_public_a",
                    sourceKind: "platform_formal_question",
                    matchTier: "exact",
                    score: 1,
                  },
                ],
              },
            ],
            redactionStatus: "admin_safe_detail",
          },
        },
      }),
    ).toBeNull();
  });

  it("filters draft result history by generation kind before pagination", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createResultRow({
          public_id: "admin_ai_generation_result_question_newer",
          generation_kind: "question",
          task_type: "ai_question_generation",
          created_at: new Date("2026-06-26T22:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_paper_newer",
          generation_kind: "paper",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-26T21:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_paper_older",
          generation_kind: "paper",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-26T20:00:00.000Z"),
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      generationKind: "paper",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });
    expect(draftResults.map((result) => result.resultPublicId)).toEqual([
      "admin_ai_generation_result_paper_newer",
    ]);
  });

  it("creates a backend admin draft result and attaches only result summary fields to the task", async () => {
    const insertedRow = createResultRow({
      public_id: "admin_ai_generation_result_public_created",
      task_public_id: "admin_ai_generation_task_public_created",
      request_public_id: "admin_ai_generation_request_public_created",
      evidence_status: "sufficient",
      citation_count: 2,
      content_digest: "sha256:admin_result_created",
      content_preview_masked: "masked admin generated result created",
    });
    const {
      gateway,
      findTaskByPublicId,
      insertDraftResult,
      insertDraftResultAndCompleteTask,
    } = createGateway({
      insertedRow,
      taskRow: {
        id: 704,
        public_id: "admin_ai_generation_task_public_created",
        request_public_id: "admin_ai_generation_request_public_created",
        workspace: "organization",
        owner_type: "organization",
        owner_public_id: "organization_public_901",
        organization_public_id: "organization_public_901",
        task_type: "ai_paper_generation",
      },
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "admin_ai_generation_result_public_created",
      taskPublicId: "admin_ai_generation_task_public_created",
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
      taskType: "ai_paper_generation",
      contentRedactedSnapshot: {
        redactionStatus: "redacted",
        contentDigest: "sha256:admin_result_created",
      },
      contentDigest: "sha256:admin_result_created",
      contentPreviewMasked: "masked admin generated result created",
      citationRedactedSnapshot: null,
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      createdAt: new Date("2026-06-26T21:30:00.000Z"),
      attempt: {
        taskPublicId: "admin_ai_generation_task_public_created",
        retryCount: 0,
        startedAt: new Date("2026-06-26T21:29:30.000Z"),
      },
    });

    expect(findTaskByPublicId).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      taskPublicId: "admin_ai_generation_task_public_created",
    });
    expect(insertDraftResult).toHaveBeenCalledWith(
      expect.objectContaining({
        aiGenerationTaskId: 704,
        requestPublicId: "admin_ai_generation_request_public_created",
        resultStatus: "draft",
        isFormalAdoptionBlocked: true,
      }),
    );
    expect(insertDraftResultAndCompleteTask).toHaveBeenCalledWith(
      expect.objectContaining({
        workspace: "organization",
        ownerType: "organization",
        ownerPublicId: "organization_public_901",
        taskPublicId: "admin_ai_generation_task_public_created",
        resultPublicId: "admin_ai_generation_result_public_created",
        attempt: {
          taskPublicId: "admin_ai_generation_task_public_created",
          retryCount: 0,
          startedAt: new Date("2026-06-26T21:29:30.000Z"),
        },
      }),
    );
    expect(result).toMatchObject({
      persistenceStatus: "created",
      result: {
        resultPublicId: "admin_ai_generation_result_public_created",
        requestPublicId: "admin_ai_generation_request_public_created",
        workspace: "organization",
        generationKind: "paper",
        status: "draft",
        contentReference: {
          contentDigest: "sha256:admin_result_created",
          contentPreviewMasked: "masked admin generated result created",
        },
        formalAdoption: {
          isBlocked: true,
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/u);
  });

  it("reuses an existing backend admin draft result for the same workspace owner and task", async () => {
    const existingRow = createResultRow({
      public_id: "admin_ai_generation_result_public_existing",
      task_public_id: "admin_ai_generation_task_public_existing",
    });
    const { gateway, insertDraftResult, attachResultToTask } = createGateway({
      existingRow,
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "admin_ai_generation_result_public_new",
      taskPublicId: "admin_ai_generation_task_public_existing",
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
      taskType: "ai_paper_generation",
      contentRedactedSnapshot: { redactionStatus: "redacted" },
      contentDigest: "sha256:new",
      contentPreviewMasked: "masked preview new",
      citationRedactedSnapshot: null,
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      createdAt: new Date("2026-06-26T22:00:00.000Z"),
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.result.resultPublicId).toBe(
      "admin_ai_generation_result_public_existing",
    );
    expect(insertDraftResult).not.toHaveBeenCalled();
    expect(attachResultToTask).not.toHaveBeenCalled();
  });
});
