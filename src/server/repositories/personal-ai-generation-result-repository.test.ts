import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type {
  GetPersonalAiGenerationResultOwnerQuery,
  GetPersonalAiGenerationResultQuery,
  PersonalAiGenerationResultPersistenceRow,
  PersonalAiGenerationResultLookupRepository,
  PersonalAiGenerationResultSelectedAuthorizationLookupRepository,
  PersonalAiGenerationResultTaskGateway,
} from "./personal-ai-generation-result-repository";
import {
  createPersonalAiGenerationResultByPublicIdCondition,
  createPersonalAiGenerationResultBySelectedAuthorizationCondition,
  createPersonalAiGenerationResultByTaskCondition,
  createPersonalAiGenerationResultHistoryCondition,
  createPersonalAiGenerationResultRepository,
  persistPersonalAiGenerationDraftResultAndCompleteTask,
} from "./personal-ai-generation-result-repository";
import type { RuntimeDatabase } from "./runtime-database";
import {
  createPersonalAiGenerationPrivatePaperQuestionSnapshot,
  createPersonalAiGenerationPrivateQuestionDraftSnapshot,
} from "../validators/personal-ai-generation-result-persistence";

function createPrivateQuestionDraftSnapshot(
  taskPublicId: string,
  ownerPublicId: string,
  standardAnswer = "测试答案",
) {
  const snapshot = createPersonalAiGenerationPrivateQuestionDraftSnapshot({
    taskPublicId,
    ownerPublicId,
    requestedQuestionCount: 1,
    questions: [
      {
        draftPublicId: "ai_question_draft_test_1",
        draftNumber: 1,
        questionType: "short_answer",
        difficulty: "medium",
        knowledgeNodeCount: 1,
        knowledgeNodeLabels: ["测试知识点"],
        questionStem: "测试题干",
        questionOptions: [],
        standardAnswer,
        analysis: "测试解析",
        scoringPoints: [{ description: "要点", score: "1", sortOrder: 1 }],
        fillBlankAnswers: [],
        reviewStatus: "draft_review_required",
      },
    ],
  });

  if (snapshot === null) {
    throw new Error("test question snapshot must be valid");
  }

  return snapshot;
}

function createPrivatePaperQuestionSnapshot(
  resultPublicId: string,
  taskPublicId: string,
  ownerPublicId: string,
  questionStem = "不可变试卷题干",
) {
  const paperAssemblyContainer = {
    title: "不可变试卷",
    profession: "marketing" as const,
    level: 3,
    subject: "theory" as const,
    requestedQuestionCount: 1,
    selectedQuestionCount: 1,
    sourceComposition: {
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 0,
    },
    matchQuality: "fully_matched" as const,
    constraintLineage: {
      request: { difficulty: "medium", knowledgeNodePublicIds: [] },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: [],
        parentKnowledgeNodePublicIds: [],
      },
    },
    sections: [
      {
        sectionKey: "single_choice",
        title: "单选题",
        questionType: "single_choice" as const,
        targetQuestionCount: 1,
        selectedQuestionCount: 1,
        selectedQuestions: [
          {
            questionPublicId: "question_public_paper_snapshot",
            sourceKind: "platform_formal_question" as const,
            matchTier: "exact" as const,
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact" as const,
            },
            questionGroup: null,
          },
        ],
        degradationSummary: {
          exactCount: 1,
          descendantCount: 0,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
  const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
    resultPublicId,
    taskPublicId,
    ownerType: "personal",
    ownerPublicId,
    paperAssemblyContainer,
    sourceQuestions: [
      {
        questionPublicId: "question_public_paper_snapshot",
        sourceKind: "platform_formal_question",
        sourceVersion: {
          kind: "platform_question_updated_at",
          updatedAt: "2026-07-23T12:00:00.000Z",
        },
        profession: "marketing",
        level: 3,
        subject: "theory",
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodePublicIds: [],
        parentKnowledgeNodePublicIds: [],
        ancestorKnowledgeNodePublicIds: [],
        questionStem,
        questionOptions: [
          { optionLabel: "A", optionText: "正确", isCorrect: true },
          { optionLabel: "B", optionText: "错误", isCorrect: false },
        ],
        standardAnswerLabels: ["A"],
        standardAnswerText: "A",
        analysis: "不可变解析",
        scoringPoints: [],
        fillBlankAnswers: [],
        questionGroup: null,
      },
    ],
  });

  if (snapshot === null) {
    throw new Error("test paper snapshot must be valid");
  }

  return snapshot;
}

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

function createMeasuredAiCallLogRow(
  id: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    observationSchemaVersion: 1,
    tokenSource: "estimated",
    tokenEstimationMethod: "canonical_json_unicode_code_point_ceiling_v1",
    promptTokenCount: 12,
    completionTokenCount: 18,
    totalTokenCount: 30,
    estimatedCostCny: "0.002000",
    latencySource: "provider_reported",
    latencyMs: 40,
    ...overrides,
  };
}

function createPersistenceRow(
  overrides: Partial<PersonalAiGenerationResultPersistenceRow> = {},
): PersonalAiGenerationResultPersistenceRow {
  const row: PersonalAiGenerationResultPersistenceRow = {
    id: 901,
    public_id: "personal_ai_result_public_170",
    ai_generation_task_id: 701,
    task_public_id: "ai_generation_task_public_170",
    request_public_id: "personal_ai_request_public_170",
    owner_public_id: "student_public_170",
    actor_public_id: "student_public_170",
    task_type: "ai_question_generation",
    result_status: "draft",
    content_redacted_snapshot: {
      redactionStatus: "redacted",
      contentHash: "sha256:content_170",
    },
    content_digest: "sha256:content_170",
    content_preview_masked: "masked preview 170",
    citation_redacted_snapshot: null,
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    is_formal_adoption_blocked: true,
    created_at: new Date("2026-06-13T12:00:00.000Z"),
    updated_at: new Date("2026-06-13T12:00:00.000Z"),
    ...overrides,
  };

  if (
    row.task_type === "ai_question_generation" &&
    row.question_draft_schema_version === undefined
  ) {
    const privateSnapshot = createPrivateQuestionDraftSnapshot(
      row.task_public_id,
      row.owner_public_id,
    );
    row.question_draft_schema_version = privateSnapshot.schemaVersion;
    row.question_draft_snapshot = privateSnapshot.snapshot;
    row.question_draft_digest = privateSnapshot.digest;
  }

  return row;
}

function createAtomicPersistenceInput(
  row: PersonalAiGenerationResultPersistenceRow,
) {
  const privatePaperQuestionSnapshot =
    row.task_type === "ai_paper_generation"
      ? createPrivatePaperQuestionSnapshot(
          row.public_id,
          row.task_public_id,
          row.owner_public_id,
        )
      : null;

  return {
    result: {
      resultPublicId: row.public_id,
      taskPublicId: row.task_public_id,
      ownerType: "personal" as const,
      ownerPublicId: row.owner_public_id,
      actorPublicId: row.actor_public_id ?? row.owner_public_id,
      taskType: row.task_type,
      aiGenerationTaskId: row.ai_generation_task_id,
      requestPublicId: row.request_public_id,
      resultStatus: "draft" as const,
      contentRedactedSnapshot: row.content_redacted_snapshot,
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      privateQuestionDraftSnapshot:
        row.task_type === "ai_question_generation"
          ? createPrivateQuestionDraftSnapshot(
              row.task_public_id,
              row.owner_public_id,
            )
          : null,
      privatePaperQuestionSnapshot,
      citationRedactedSnapshot: row.citation_redacted_snapshot,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      isFormalAdoptionBlocked: true as const,
      createdAt: row.created_at,
    },
    task: {
      ownerType: "personal" as const,
      ownerPublicId: row.owner_public_id,
      actorPublicId: row.actor_public_id ?? row.owner_public_id,
      taskPublicId: row.task_public_id,
      resultPublicId: row.public_id,
      taskStatus: "succeeded" as const,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      attempt: {
        taskPublicId: row.task_public_id,
        retryCount: 1,
        startedAt: new Date("2026-07-22T12:05:00.123Z"),
      },
    },
  };
}

function createGateway(
  options: {
    rows?: PersonalAiGenerationResultPersistenceRow[];
    existingRow?: PersonalAiGenerationResultPersistenceRow | null;
    insertedRow?: PersonalAiGenerationResultPersistenceRow | null;
    taskRow?: {
      id: number;
      public_id: string;
      request_public_id: string;
      owner_public_id: string;
    } | null;
  } = {},
) {
  const listResultRows = vi.fn(async (query) =>
    (options.rows ?? [])
      .filter(
        (row) =>
          row.owner_public_id === query.ownerPublicId &&
          (query.actorPublicId === undefined ||
            row.actor_public_id === query.actorPublicId) &&
          row.result_status === "draft" &&
          (query.taskType === undefined || row.task_type === query.taskType),
      )
      .sort(
        (leftRow, rightRow) =>
          rightRow.created_at.getTime() - leftRow.created_at.getTime() ||
          leftRow.public_id.localeCompare(rightRow.public_id),
      )
      .slice(query.offset, query.offset + query.limit),
  );
  const findResultByTaskPublicId = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findResultByPublicId = vi.fn(
    async (query) =>
      (options.rows ?? []).find(
        (row) =>
          row.public_id === query.resultPublicId &&
          row.owner_public_id === query.ownerPublicId &&
          row.actor_public_id === query.actorPublicId &&
          row.result_status === "draft",
      ) ?? null,
  );
  const findTaskByPublicId = vi.fn(async () => options.taskRow ?? null);
  const insertDraftResultAndCompleteTask = vi.fn(
    async () => options.insertedRow ?? createPersistenceRow(),
  );

  const gateway: PersonalAiGenerationResultTaskGateway = {
    listResultRows,
    findResultByPublicId,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResultAndCompleteTask,
  };

  return {
    gateway,
    listResultRows,
    findResultByPublicId,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResultAndCompleteTask,
  };
}

describe("personal AI generation result repository", () => {
  it("separates exact selected-authorization lookup from owner-only learning lookup", () => {
    type SelectedAuthorizationQuery = Parameters<
      PersonalAiGenerationResultSelectedAuthorizationLookupRepository["findDraftResultByPublicId"]
    >[0];
    type OwnerOnlyQuery = Parameters<
      PersonalAiGenerationResultLookupRepository["findDraftResultByPublicId"]
    >[0];

    expectTypeOf<SelectedAuthorizationQuery>().toEqualTypeOf<GetPersonalAiGenerationResultQuery>();
    expectTypeOf<OwnerOnlyQuery>().toEqualTypeOf<GetPersonalAiGenerationResultOwnerQuery>();
  });

  it("builds exact authorization, owner, and actor scoped result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      authorizationPublicId: "personal_auth_public_exact_170",
      ownerType: "personal",
      ownerPublicId: "student_public_170",
      actorPublicId: "student_public_170",
    });

    expect(containsText(condition, "authorization_public_id")).toBe(true);
    expect(containsText(condition, "personal_auth_public_exact_170")).toBe(
      true,
    );
    expect(containsText(condition, "owner_type")).toBe(true);
    expect(containsText(condition, "personal")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
  });

  it("keeps two personal authorization result histories isolated", async () => {
    const firstAuthorizationResult = createPersistenceRow({
      public_id: "personal_ai_result_first_authorization",
      task_public_id: "task_first_authorization",
    });
    const secondAuthorizationResult = createPersistenceRow({
      public_id: "personal_ai_result_second_authorization",
      task_public_id: "task_second_authorization",
    });
    const listResultRows = vi.fn(async (query) =>
      query.authorizationPublicId === "personal_auth_public_first"
        ? [firstAuthorizationResult]
        : query.authorizationPublicId === "personal_auth_public_second"
          ? [secondAuthorizationResult]
          : [],
    );
    const gateway = {
      ...createGateway().gateway,
      listResultRows,
    };
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const firstResults = await repository.listDraftResults({
      authorizationPublicId: "personal_auth_public_first",
      ownerType: "personal",
      ownerPublicId: "student_public_170",
    });
    const secondResults = await repository.listDraftResults({
      authorizationPublicId: "personal_auth_public_second",
      ownerType: "personal",
      ownerPublicId: "student_public_170",
    });

    expect(firstResults.map((result) => result.resultPublicId)).toEqual([
      firstAuthorizationResult.public_id,
    ]);
    expect(secondResults.map((result) => result.resultPublicId)).toEqual([
      secondAuthorizationResult.public_id,
    ]);
    expect(listResultRows).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        authorizationPublicId: "personal_auth_public_first",
      }),
    );
    expect(listResultRows).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        authorizationPublicId: "personal_auth_public_second",
      }),
    );
  });

  it("builds exact authorization scoped result detail conditions", () => {
    const condition =
      createPersonalAiGenerationResultBySelectedAuthorizationCondition({
        authorizationPublicId: "org_auth_public_exact_172",
        ownerType: "organization",
        ownerPublicId: "organization_public_172",
        actorPublicId: "employee_user_public_172",
        resultPublicId: "personal_ai_result_public_172",
      });

    expect(containsText(condition, "authorization_public_id")).toBe(true);
    expect(containsText(condition, "org_auth_public_exact_172")).toBe(true);
  });

  it("persists the draft result and succeeded task state in one database transaction", async () => {
    const insertedRow = createPersistenceRow({
      ai_call_log_public_id: "ai-call-log-personal-170",
    });
    const updateValues: unknown[] = [];
    const updateConditions: unknown[] = [];
    let updateCallCount = 0;
    const insertReturning = vi.fn(async () => [insertedRow]);
    const insertOnConflict = vi.fn(() => ({ returning: insertReturning }));
    const insertValues = vi.fn(() => ({
      onConflictDoNothing: insertOnConflict,
    }));
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({ values: insertValues })),
      update: vi.fn(() => {
        updateCallCount += 1;
        return {
          set: vi.fn((values: unknown) => {
            updateValues.push(values);
            return {
              where: vi.fn((condition: unknown) => {
                updateConditions.push(condition);
                return {
                  returning: vi.fn(async () =>
                    updateCallCount === 1
                      ? [createMeasuredAiCallLogRow(801)]
                      : [{ public_id: insertedRow.task_public_id }],
                  ),
                };
              }),
            };
          }),
        };
      }),
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    const result = await persistPersonalAiGenerationDraftResultAndCompleteTask(
      { transaction } as unknown as RuntimeDatabase,
      createAtomicPersistenceInput(insertedRow),
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateValues).toEqual([
      expect.objectContaining({ call_status: "success" }),
      expect.objectContaining({
        task_status: "succeeded",
        result_public_id: insertedRow.public_id,
        ai_call_log_public_id: insertedRow.ai_call_log_public_id,
      }),
    ]);
    expect(
      containsText(updateConditions[0], "observation_schema_version"),
    ).toBe(true);
    expect(containsText(updateConditions[0], "provider_reported")).toBe(true);
    expect(containsText(updateConditions[0], "estimated")).toBe(true);
    expect(containsText(updateConditions[0], "client_observed")).toBe(true);
    expect(result).toEqual(insertedRow);
  });

  it("persists the paper snapshot in the same result and task completion transaction", async () => {
    const paperSnapshot = createPrivatePaperQuestionSnapshot(
      "personal_ai_result_paper_atomic",
      "ai_generation_task_paper_atomic",
      "student_public_paper_atomic",
    );
    const insertedRow = createPersistenceRow({
      public_id: paperSnapshot.snapshot.resultPublicId,
      task_public_id: paperSnapshot.snapshot.taskPublicId,
      owner_public_id: paperSnapshot.snapshot.ownerPublicId,
      task_type: "ai_paper_generation",
      ai_call_log_public_id: "ai-call-log-paper-atomic",
      question_draft_schema_version: null,
      question_draft_snapshot: null,
      question_draft_digest: null,
      paper_question_snapshot_schema_version: paperSnapshot.schemaVersion,
      paper_question_snapshot: paperSnapshot.snapshot,
      paper_question_snapshot_digest: paperSnapshot.digest,
    });
    let insertedValues: Record<string, unknown> | null = null;
    let updateCallCount = 0;
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn((values: Record<string, unknown>) => {
          insertedValues = values;

          return {
            onConflictDoNothing: vi.fn(() => ({
              returning: vi.fn(async () => [insertedRow]),
            })),
          };
        }),
      })),
      update: vi.fn(() => {
        updateCallCount += 1;
        return {
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(async () =>
                updateCallCount === 1
                  ? [createMeasuredAiCallLogRow(801)]
                  : [{ public_id: insertedRow.task_public_id }],
              ),
            })),
          })),
        };
      }),
    };

    await persistPersonalAiGenerationDraftResultAndCompleteTask(
      {
        transaction: async (callback: (database: unknown) => unknown) =>
          callback(transactionDatabase),
      } as unknown as RuntimeDatabase,
      createAtomicPersistenceInput(insertedRow),
    );

    expect(insertedValues).toMatchObject({
      question_draft_schema_version: null,
      question_draft_snapshot: null,
      question_draft_digest: null,
      paper_question_snapshot_schema_version: "paper_question_snapshot_v1",
      paper_question_snapshot: paperSnapshot.snapshot,
      paper_question_snapshot_digest: paperSnapshot.digest,
    });
    expect(updateCallCount).toBe(2);
  });

  it("rolls back when the owner-scoped task cannot be completed", async () => {
    const insertedRow = createPersistenceRow({
      ai_call_log_public_id: "ai-call-log-personal-170",
    });
    let updateCallCount = 0;
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoNothing: vi.fn(() => ({
            returning: vi.fn(async () => [insertedRow]),
          })),
        })),
      })),
      update: vi.fn(() => {
        updateCallCount += 1;
        return {
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(async () =>
                updateCallCount === 1 ? [createMeasuredAiCallLogRow(801)] : [],
              ),
            })),
          })),
        };
      }),
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    await expect(
      persistPersonalAiGenerationDraftResultAndCompleteTask(
        { transaction } as unknown as RuntimeDatabase,
        createAtomicPersistenceInput(insertedRow),
      ),
    ).rejects.toThrow(
      "personal AI generation task completion persistence failed.",
    );
  });

  it("fails closed when personal log finalization is not unique", async () => {
    const insertedRow = createPersistenceRow({
      ai_call_log_public_id: "ai-call-log-personal-170",
    });
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(async () => [
              createMeasuredAiCallLogRow(801),
              createMeasuredAiCallLogRow(802),
            ]),
          })),
        })),
      })),
    };

    await expect(
      persistPersonalAiGenerationDraftResultAndCompleteTask(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        createAtomicPersistenceInput(insertedRow),
      ),
    ).rejects.toThrow("ai_call_log finalization was lost");
  });

  it("rolls back before personal result insertion for unavailable legacy partial or malformed measured provenance", async () => {
    const insertedRow = createPersistenceRow({
      ai_call_log_public_id: "ai-call-log-personal-170",
    });
    const invalidObservations = [
      createMeasuredAiCallLogRow(801, {
        tokenSource: "unavailable",
        tokenEstimationMethod: null,
        promptTokenCount: null,
        completionTokenCount: null,
        totalTokenCount: null,
        estimatedCostCny: null,
      }),
      createMeasuredAiCallLogRow(801, {
        observationSchemaVersion: null,
        tokenSource: null,
        tokenEstimationMethod: null,
        latencySource: null,
      }),
      createMeasuredAiCallLogRow(801, {
        latencySource: null,
      }),
      createMeasuredAiCallLogRow(801, {
        tokenEstimationMethod: "unsupported_method",
      }),
    ];

    for (const invalidObservation of invalidObservations) {
      const insert = vi.fn();
      const transactionDatabase = {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              for: vi.fn(() => ({
                limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
              })),
            })),
          })),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(async () => [invalidObservation]),
            })),
          })),
        })),
        insert,
      };

      await expect(
        persistPersonalAiGenerationDraftResultAndCompleteTask(
          {
            transaction: async (callback: (database: unknown) => unknown) =>
              callback(transactionDatabase),
          } as unknown as RuntimeDatabase,
          createAtomicPersistenceInput(insertedRow),
        ),
      ).rejects.toThrow("AI call observation is invalid.");
      expect(insert).not.toHaveBeenCalled();
    }
  });

  it("rolls back the personal log when result insertion conflicts", async () => {
    const insertedRow = createPersistenceRow({
      ai_call_log_public_id: "ai-call-log-personal-170",
    });
    const transactionDatabase = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [{ aiCallLogId: 801 }]),
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(async () => [createMeasuredAiCallLogRow(801)]),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoNothing: vi.fn(() => ({
            returning: vi.fn(async () => []),
          })),
        })),
      })),
    };

    await expect(
      persistPersonalAiGenerationDraftResultAndCompleteTask(
        {
          transaction: async (callback: (database: unknown) => unknown) =>
            callback(transactionDatabase),
        } as unknown as RuntimeDatabase,
        createAtomicPersistenceInput(insertedRow),
      ),
    ).rejects.toThrow("result persistence conflicted");
  });

  it("builds owner-scoped result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      authorizationPublicId: "personal_auth_public_170",
      ownerPublicId: "student_public_170",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_170")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
  });

  it("builds actor-scoped organization result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      authorizationPublicId: "org_auth_public_170",
      ownerType: "organization",
      ownerPublicId: "organization_public_170",
      actorPublicId: "employee_user_public_170",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_170")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_170")).toBe(true);
  });

  it("builds owner-scoped result lookup by task public id", () => {
    const condition = createPersonalAiGenerationResultByTaskCondition({
      ownerPublicId: "student_public_171",
      taskPublicId: "ai_generation_task_public_171",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_171")).toBe(true);
    expect(containsText(condition, "task_public_id")).toBe(true);
    expect(containsText(condition, "ai_generation_task_public_171")).toBe(true);
  });

  it("builds actor-scoped result lookup by task public id", () => {
    const condition = createPersonalAiGenerationResultByTaskCondition({
      ownerPublicId: "organization_public_171",
      actorPublicId: "employee_user_public_171",
      taskPublicId: "ai_generation_task_public_171",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_171")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_171")).toBe(true);
  });

  it("builds an actor- and owner-scoped draft result lookup by result public id", () => {
    const condition = createPersonalAiGenerationResultByPublicIdCondition({
      ownerType: "organization",
      ownerPublicId: "organization_public_172",
      actorPublicId: "employee_user_public_172",
      resultPublicId: "personal_ai_result_public_172",
    });

    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_172")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_172")).toBe(true);
    expect(containsText(condition, "owner_type")).toBe(true);
    expect(containsText(condition, "organization")).toBe(true);
    expect(containsText(condition, "public_id")).toBe(true);
    expect(containsText(condition, "personal_ai_result_public_172")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
  });

  it("returns one persisted draft result only for the matching actor and owner", async () => {
    const persistedRow = createPersistenceRow({
      public_id: "personal_ai_result_public_173",
      owner_public_id: "organization_public_173",
      actor_public_id: "employee_user_public_173",
      task_type: "ai_paper_generation",
    });
    const { gateway } = createGateway({ rows: [persistedRow] });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    await expect(
      repository.findDraftResultByPublicId({
        ownerPublicId: "organization_public_173",
        actorPublicId: "employee_user_public_173",
        resultPublicId: persistedRow.public_id,
      }),
    ).resolves.toMatchObject({
      resultPublicId: persistedRow.public_id,
      taskType: "ai_paper_generation",
    });
    await expect(
      repository.findDraftResultByPublicId({
        ownerPublicId: "organization_public_173",
        actorPublicId: "different_employee_public_173",
        resultPublicId: persistedRow.public_id,
      }),
    ).resolves.toBeNull();
  });

  it("keeps the persisted private paper snapshot out of the public result projection", async () => {
    const resultPublicId = "personal_ai_result_private_projection";
    const taskPublicId = "ai_generation_task_private_projection";
    const ownerPublicId = "student_public_private_projection";
    const privateSnapshot = createPrivatePaperQuestionSnapshot(
      resultPublicId,
      taskPublicId,
      ownerPublicId,
      "SENSITIVE_PRIVATE_PAPER_STEM",
    );
    const row = createPersistenceRow({
      public_id: resultPublicId,
      task_public_id: taskPublicId,
      owner_public_id: ownerPublicId,
      actor_public_id: ownerPublicId,
      task_type: "ai_paper_generation",
      question_draft_schema_version: null,
      question_draft_snapshot: null,
      question_draft_digest: null,
      paper_question_snapshot_schema_version: privateSnapshot.schemaVersion,
      paper_question_snapshot: privateSnapshot.snapshot,
      paper_question_snapshot_digest: privateSnapshot.digest,
    });
    const repository = createPersonalAiGenerationResultRepository(
      createGateway({ rows: [row] }).gateway,
    );

    const result = await repository.findDraftResultByPublicId({
      ownerType: "personal",
      ownerPublicId,
      actorPublicId: ownerPublicId,
      resultPublicId,
    });
    const serializedResult = JSON.stringify(result);

    expect(result).not.toBeNull();
    expect(serializedResult).not.toContain("SENSITIVE_PRIVATE_PAPER_STEM");
    expect(serializedResult).not.toMatch(
      /paperQuestionSnapshot|paper_question_snapshot|standardAnswer|scoringPoints/u,
    );
  });

  it("lists owner draft results newest first without exposing internal ids or snapshots", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_b",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_c",
          created_at: new Date("2026-06-13T13:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_a",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      authorizationPublicId: "personal_auth_public_172",
      ownerPublicId: "student_public_172",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      authorizationPublicId: "personal_auth_public_172",
      ownerPublicId: "student_public_172",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_public_c",
      "personal_ai_result_public_a",
      "personal_ai_result_public_b",
    ]);
    expect(JSON.stringify(draftResults)).not.toMatch(/"id":/);
    expect(JSON.stringify(draftResults)).not.toContain(
      "content_redacted_snapshot",
    );
  });

  it("filters same-organization draft results by actor public id", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          public_id: "personal_ai_result_employee_a",
          owner_public_id: "organization_public_172",
          actor_public_id: "employee_user_public_a",
        }),
        createPersistenceRow({
          public_id: "personal_ai_result_employee_b",
          owner_public_id: "organization_public_172",
          actor_public_id: "employee_user_public_b",
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      authorizationPublicId: "org_auth_public_172",
      ownerType: "organization",
      ownerPublicId: "organization_public_172",
      actorPublicId: "employee_user_public_a",
      page: 1,
      pageSize: 20,
      limit: 20,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      authorizationPublicId: "org_auth_public_172",
      ownerType: "organization",
      ownerPublicId: "organization_public_172",
      actorPublicId: "employee_user_public_a",
      page: 1,
      pageSize: 20,
      limit: 20,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_employee_a",
    ]);
  });

  it("filters owner draft results by task type before pagination", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_question_newer",
          task_type: "ai_question_generation",
          created_at: new Date("2026-06-13T14:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_paper_newer",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-13T13:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_paper_older",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      authorizationPublicId: "personal_auth_public_172",
      ownerPublicId: "student_public_172",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      authorizationPublicId: "personal_auth_public_172",
      ownerPublicId: "student_public_172",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_paper_newer",
    ]);
  });

  it("reuses an existing draft result for the owner and task", async () => {
    const existingRow = createPersistenceRow({
      public_id: "personal_ai_result_public_existing",
      task_public_id: "ai_generation_task_public_existing",
      owner_public_id: "student_public_173",
    });
    const { gateway, insertDraftResultAndCompleteTask } = createGateway({
      existingRow,
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "personal_ai_result_public_existing",
      taskPublicId: "ai_generation_task_public_existing",
      ownerType: "personal",
      ownerPublicId: "student_public_173",
      actorPublicId: "student_public_173",
      taskType: "ai_question_generation",
      contentRedactedSnapshot: { redactionStatus: "redacted" },
      contentDigest: "sha256:new",
      contentPreviewMasked: "masked preview new",
      privateQuestionDraftSnapshot: createPrivateQuestionDraftSnapshot(
        "ai_generation_task_public_existing",
        "student_public_173",
      ),
      privatePaperQuestionSnapshot: null,
      citationRedactedSnapshot: null,
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
      createdAt: new Date("2026-06-13T13:30:00.000Z"),
      attempt: {
        taskPublicId: "ai_generation_task_public_existing",
        retryCount: 0,
        startedAt: new Date("2026-06-13T13:29:00.123Z"),
      },
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.result.resultPublicId).toBe(
      "personal_ai_result_public_existing",
    );
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();
  });

  it("rejects an idempotent replay whose private question snapshot changed", async () => {
    const existingRow = createPersistenceRow({
      public_id: "personal_ai_result_public_snapshot_conflict",
      task_public_id: "ai_generation_task_public_snapshot_conflict",
      owner_public_id: "student_public_snapshot_conflict",
    });
    const { gateway, insertDraftResultAndCompleteTask } = createGateway({
      existingRow,
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    await expect(
      repository.createOrReuseDraftResult({
        resultPublicId: existingRow.public_id,
        taskPublicId: existingRow.task_public_id,
        ownerType: "personal",
        ownerPublicId: existingRow.owner_public_id,
        actorPublicId: existingRow.owner_public_id,
        taskType: "ai_question_generation",
        contentRedactedSnapshot: { redactionStatus: "redacted" },
        contentDigest: "sha256:conflict",
        contentPreviewMasked: "masked conflict",
        privateQuestionDraftSnapshot: createPrivateQuestionDraftSnapshot(
          existingRow.task_public_id,
          existingRow.owner_public_id,
          "冲突答案",
        ),
        privatePaperQuestionSnapshot: null,
        citationRedactedSnapshot: null,
        evidenceStatus: "weak",
        citationCount: 1,
        aiCallLogPublicId: null,
        createdAt: new Date("2026-06-13T13:30:00.000Z"),
        attempt: {
          taskPublicId: existingRow.task_public_id,
          retryCount: 0,
          startedAt: new Date("2026-06-13T13:29:00.123Z"),
        },
      }),
    ).rejects.toThrow("snapshot conflicted");
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();
  });

  it("reuses only the exact persisted paper snapshot and rejects changed private facts", async () => {
    const resultPublicId = "personal_ai_result_paper_replay";
    const taskPublicId = "ai_generation_task_paper_replay";
    const ownerPublicId = "student_public_paper_replay";
    const persistedSnapshot = createPrivatePaperQuestionSnapshot(
      resultPublicId,
      taskPublicId,
      ownerPublicId,
    );
    const existingRow = createPersistenceRow({
      public_id: resultPublicId,
      task_public_id: taskPublicId,
      owner_public_id: ownerPublicId,
      task_type: "ai_paper_generation",
      question_draft_schema_version: null,
      question_draft_snapshot: null,
      question_draft_digest: null,
      paper_question_snapshot_schema_version: persistedSnapshot.schemaVersion,
      paper_question_snapshot: persistedSnapshot.snapshot,
      paper_question_snapshot_digest: persistedSnapshot.digest,
    });
    const { gateway, insertDraftResultAndCompleteTask } = createGateway({
      existingRow,
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);
    const baseInput = {
      resultPublicId,
      taskPublicId,
      ownerType: "personal" as const,
      ownerPublicId,
      actorPublicId: ownerPublicId,
      taskType: "ai_paper_generation" as const,
      contentRedactedSnapshot: existingRow.content_redacted_snapshot,
      contentDigest: existingRow.content_digest,
      contentPreviewMasked: existingRow.content_preview_masked,
      privateQuestionDraftSnapshot: null,
      citationRedactedSnapshot: null,
      evidenceStatus: "weak" as const,
      citationCount: 1,
      aiCallLogPublicId: null,
      createdAt: new Date("2026-07-23T12:30:00.000Z"),
      attempt: {
        taskPublicId,
        retryCount: 0,
        startedAt: new Date("2026-07-23T12:29:00.123Z"),
      },
    };

    await expect(
      repository.createOrReuseDraftResult({
        ...baseInput,
        privatePaperQuestionSnapshot: persistedSnapshot,
      }),
    ).resolves.toMatchObject({ persistenceStatus: "reused" });
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();

    await expect(
      repository.createOrReuseDraftResult({
        ...baseInput,
        contentDigest: "sha256:changed-paper-content",
        privatePaperQuestionSnapshot: persistedSnapshot,
      }),
    ).rejects.toThrow("snapshot conflicted");
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();

    await expect(
      repository.createOrReuseDraftResult({
        ...baseInput,
        privatePaperQuestionSnapshot: createPrivatePaperQuestionSnapshot(
          resultPublicId,
          taskPublicId,
          ownerPublicId,
          "漂移后的题干",
        ),
      }),
    ).rejects.toThrow("snapshot conflicted");
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();
  });

  it("creates a draft result with server-owned no-adoption metadata", async () => {
    const insertedRow = createPersistenceRow({
      public_id: "personal_ai_result_public_created",
      task_public_id: "ai_generation_task_public_created",
      request_public_id: "personal_ai_request_public_created",
      owner_public_id: "student_public_174",
      content_digest: "sha256:created",
      content_preview_masked: "masked preview created",
      evidence_status: "sufficient",
      citation_count: 2,
    });
    const { gateway, findTaskByPublicId, insertDraftResultAndCompleteTask } =
      createGateway({
        insertedRow,
        taskRow: {
          id: 704,
          public_id: "ai_generation_task_public_created",
          request_public_id: "personal_ai_request_public_created",
          owner_public_id: "student_public_174",
        },
      });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "personal_ai_result_public_created",
      taskPublicId: "ai_generation_task_public_created",
      ownerType: "personal",
      ownerPublicId: "student_public_174",
      actorPublicId: "student_public_174",
      taskType: "ai_question_generation",
      contentRedactedSnapshot: {
        redactionStatus: "redacted",
        contentHash: "sha256:created",
      },
      contentDigest: "sha256:created",
      contentPreviewMasked: "masked preview created",
      privateQuestionDraftSnapshot: createPrivateQuestionDraftSnapshot(
        "ai_generation_task_public_created",
        "student_public_174",
      ),
      privatePaperQuestionSnapshot: null,
      citationRedactedSnapshot: null,
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
      createdAt: new Date("2026-06-13T14:00:00.000Z"),
      attempt: {
        taskPublicId: "ai_generation_task_public_created",
        retryCount: 1,
        startedAt: new Date("2026-06-13T13:59:00.123Z"),
      },
    });

    expect(findTaskByPublicId).toHaveBeenCalledWith({
      ownerType: "personal",
      ownerPublicId: "student_public_174",
      actorPublicId: "student_public_174",
      taskPublicId: "ai_generation_task_public_created",
    });
    expect(insertDraftResultAndCompleteTask).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({
          aiGenerationTaskId: 704,
          requestPublicId: "personal_ai_request_public_created",
          resultStatus: "draft",
          isFormalAdoptionBlocked: true,
        }),
        task: {
          ownerType: "personal",
          ownerPublicId: "student_public_174",
          actorPublicId: "student_public_174",
          taskPublicId: "ai_generation_task_public_created",
          resultPublicId: "personal_ai_result_public_created",
          taskStatus: "succeeded",
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: null,
          attempt: {
            taskPublicId: "ai_generation_task_public_created",
            retryCount: 1,
            startedAt: new Date("2026-06-13T13:59:00.123Z"),
          },
        },
      }),
    );
    expect(result).toMatchObject({
      persistenceStatus: "created",
      result: {
        resultPublicId: "personal_ai_result_public_created",
        requestPublicId: "personal_ai_request_public_created",
        status: "draft",
        formalAdoption: {
          isBlocked: true,
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });
});
