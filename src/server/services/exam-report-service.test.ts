import { describe, expect, it } from "vitest";

import {
  createExamReportService,
  type ExamReportClock,
  type ExamReportLearningSuggestionOptions,
  type ExamReportPublicIdFactory,
} from "./exam-report-service";
import { createModelConfigSnapshot } from "../models/ai-rag";
import type {
  ExamReportAnswerRecordRow,
  ExamReportAuthorizationScopeRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "../repositories/exam-report-repository";
import { ExamReportKnowledgeSnapshotIntegrityError } from "../repositories/exam-report-repository";
import type { LearningSuggestionMockContext } from "./ai-mock-provider-runtime";

const now = new Date("2026-05-19T09:00:00.000Z");
const startedAt = new Date("2026-05-19T08:00:00.000Z");
const submittedAt = new Date("2026-05-19T08:45:00.000Z");
const scopeExpiresAt = new Date("2026-06-19T08:00:00.000Z");
const modelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model-provider-dev-mock",
  providerKey: "mock",
  providerDisplayName: "Local Mock AI",
  modelConfigPublicId: "model-config-dev-learning-suggestion",
  aiFuncType: "learning_suggestion",
  modelName: "mock-learning-suggestion",
  displayName: "Local mock learning suggestion",
  configVersion: 1,
  timeoutSecond: 5,
  maxRetryCount: 0,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "learning_suggestion_v1",
  promptTemplateVersion: 1,
});

const userContext = {
  userPublicId: "user_public_123",
  organizationPublicId: "organization_public_123",
};

const clock: ExamReportClock = {
  now() {
    return now;
  },
};

function createIdFactory(): ExamReportPublicIdFactory {
  return {
    createPublicId() {
      return "exam_report_public_new";
    },
  };
}

function createScope(
  overrides: Partial<ExamReportAuthorizationScopeRow> = {},
): ExamReportAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: scopeExpiresAt,
    ...overrides,
  };
}

function createPaperSnapshot(): Record<string, unknown> {
  return {
    paperPublicId: "paper_public_123",
    name: "2024年专卖三级理论真题",
    paperSections: [
      {
        paperSectionTitle: "一、单项选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper_question_public_123",
            questionPublicId: "question_public_123",
            questionType: "single_choice",
            title: "Runtime single choice",
            stemRichText: "<p>题干</p>",
            standardAnswerLabels: ["A"],
            score: "1.0",
            knowledgeNodePublicIds: ["knowledge_node_public_123"],
          },
          {
            paperQuestionPublicId: "paper_question_public_unanswered",
            questionPublicId: "question_public_unanswered",
            questionType: "single_choice",
            title: "Runtime unanswered single choice",
            stemRichText: "<p>未答题干</p>",
            standardAnswerLabels: ["B"],
            score: "2.0",
            knowledgeNodePublicIds: ["knowledge_node_public_456"],
          },
        ],
      },
    ],
  };
}

function createNestedQuestionGroupPaperSnapshot(): Record<string, unknown> {
  const createQuestion = (index: number) => ({
    paperQuestionPublicId: `paper_question_group_${index}`,
    questionPublicId: `question_group_${index}`,
    questionType: "single_choice",
    title: `材料子题 ${index}`,
    stemRichText: `<p>材料子题 ${index}</p>`,
    standardAnswerLabels: ["A"],
    score: "1.0",
    knowledgeNodePublicIds: [`knowledge_node_group_${index}`],
  });

  return {
    snapshotVersion: 2,
    publicId: "paper_public_123",
    name: "2024年专卖三级技能材料题",
    paperSections: [
      {
        publicId: "paper_section_public_123",
        title: "一、案例分析题",
        sortOrder: 1,
        paperQuestions: [],
        questionGroups: [
          {
            publicId: "qgroup_public_123",
            title: "客户异议处理案例",
            sortOrder: 1,
            totalScore: "2.0",
            materialSnapshot: {
              materialPublicId: "material_public_123",
              title: "客户异议材料",
            },
            paperQuestions: [createQuestion(1), createQuestion(2)],
          },
        ],
      },
    ],
  };
}

function createExamReportRow(
  overrides: Partial<ExamReportRow> = {},
): ExamReportRow {
  return {
    id: 3001,
    public_id: "exam_report_public_123",
    exam_report_public_id: "exam_report_public_123",
    mock_exam_public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    paper_name: "2024年专卖三级理论真题",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    objective_score: "1.0",
    subjective_score: null,
    total_score: "1.0",
    duration_second: 2700,
    report_snapshot: {
      paperName: "2024年专卖三级理论真题",
      questionDetails: [],
    },
    learning_suggestion_snapshot: null,
    generated_at: now,
    started_at: startedAt,
    created_at: now,
    updated_at: now,
    ...overrides,
    report_revision:
      overrides.report_revision === undefined ? 1 : overrides.report_revision,
  };
}

function createLearningSuggestionReadyReportRow(
  overrides: Partial<ExamReportRow> = {},
): ExamReportRow {
  return createExamReportRow({
    report_snapshot: {
      paperPublicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "completed",
      scoreSummary: {
        objectiveScore: "1.0",
        subjectiveScore: null,
        totalScore: "1.0",
      },
      questionResults: [
        {
          paperQuestionPublicId: "paper_question_public_123",
          questionPublicId: "question_public_123",
          questionType: "single_choice",
          paperSectionTitle: "一、单项选择题",
          questionGroupPublicId: null,
          questionGroupTitle: null,
          isCorrect: true,
          score: "1.0",
          maxScore: "1.0",
          aiScoringEvidence: null,
        },
      ],
      knowledgeNodeAnalyticsStatus: "unavailable",
      knowledgeNodeAnalysis: [],
    },
    ...overrides,
  });
}

function createMockExamRow(
  overrides: Partial<ExamReportMockExamRow> = {},
): ExamReportMockExamRow {
  return {
    public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    paper_snapshot: createPaperSnapshot(),
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    started_at: startedAt,
    submitted_at: submittedAt,
    objective_score: "1.0",
    subjective_score: null,
    total_score: "1.0",
    ...overrides,
  };
}

function createAnswerRecordRow(): ExamReportAnswerRecordRow {
  return {
    public_id: "answer_record_public_123",
    paper_question_public_id: "paper_question_public_123",
    question_public_id: "question_public_123",
    question_snapshot: {
      stemRichText: "<p>题干</p>",
      score: "1.0",
    },
    answer_snapshot: {
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: null,
    },
    answer_record_status: "scored",
    ai_scoring_evidence: null,
    is_correct: true,
    score: "1.0",
    max_score: "1.0",
    answered_at: submittedAt,
    submitted_at: submittedAt,
  };
}

function createRepository(
  overrides: Partial<ExamReportRepository> = {},
): ExamReportRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async listExamReports() {
      return {
        rows: [createExamReportRow()],
        total: 1,
      };
    },
    async findExamReportByPublicId() {
      return createExamReportRow();
    },
    async findExamReportByMockExamPublicId() {
      return null;
    },
    async findSubmittedMockExamByPublicId() {
      return createMockExamRow();
    },
    async listMockExamAnswerRecords() {
      return [createAnswerRecordRow()];
    },
    async createExamReport(input) {
      return createExamReportRow({
        public_id: input.publicId,
        mock_exam_public_id: input.mockExamPublicId,
        paper_public_id: input.paperPublicId,
        paper_name: input.paperName,
        report_snapshot: input.reportSnapshot,
        learning_suggestion_snapshot: input.learningSuggestionSnapshot,
        generated_at: input.generatedAt,
        duration_second: input.durationSecond,
      });
    },
    async rebuildExamReport(input) {
      return createExamReportRow({
        public_id: input.publicId,
        exam_status: input.examStatus,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
        duration_second: input.durationSecond,
        report_snapshot: input.reportSnapshot,
        learning_suggestion_snapshot: null,
        generated_at: input.generatedAt,
      });
    },
    async updateExamReportLearningSuggestionSnapshot() {},
    ...overrides,
  };
}

function createLearningSuggestionOptions(
  capturedContexts: LearningSuggestionMockContext[],
): ExamReportLearningSuggestionOptions {
  return {
    learningSuggestionRuntime: {
      async generateLearningSuggestion(context) {
        capturedContexts.push(context);

        return {
          learningSuggestion: "Review missed knowledge nodes.",
          aiCallLog: {
            publicId: "ai_call_log_public_redacted",
          },
        };
      },
    },
    modelConfigSnapshot,
    promptTemplate: {
      promptTemplateKey: "learning_suggestion_v1",
      version: 1,
      templateHash: "learning_suggestion_v1_baseline",
    },
  };
}

describe("exam report service", () => {
  it("builds report questions from a versioned nested question_group snapshot", async () => {
    const nestedSnapshot = createNestedQuestionGroupPaperSnapshot();
    const reportSnapshots: Record<string, unknown>[] = [];
    const service = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({ paper_snapshot: nestedSnapshot });
        },
        async listMockExamAnswerRecords() {
          return [];
        },
        async createExamReport(input) {
          reportSnapshots.push(input.reportSnapshot);

          return createExamReportRow({
            public_id: input.publicId,
            report_snapshot: input.reportSnapshot,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({ code: 0 });
    expect(reportSnapshots).toHaveLength(1);
    expect(reportSnapshots[0].paperSectionSummaryText).toBe(
      "paper_section analytics: 一、案例分析题 2",
    );
    expect(reportSnapshots[0].questionGroupSummaryText).toBe(
      "question_group analytics: 客户异议处理案例 2",
    );
    expect(reportSnapshots[0].questionResults).toEqual([
      expect.objectContaining({
        paperQuestionPublicId: "paper_question_group_1",
        questionGroupPublicId: "qgroup_public_123",
        questionGroupTitle: "客户异议处理案例",
      }),
      expect.objectContaining({
        paperQuestionPublicId: "paper_question_group_2",
        questionGroupPublicId: "qgroup_public_123",
        questionGroupTitle: "客户异议处理案例",
      }),
    ]);
  });

  it("lists authorization-filtered exam_report summaries with pagination", async () => {
    const service = createExamReportService(createRepository(), clock);

    await expect(
      service.listExamReports(userContext, {
        page: "1",
        pageSize: "20",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReports: [
          {
            publicId: "exam_report_public_123",
            mockExamPublicId: "mock_exam_public_123",
            paperName: "2024年专卖三级理论真题",
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });
  });

  it("uses the repository-visible total without re-filtering the current page", async () => {
    const service = createExamReportService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          throw new Error(
            "list pagination must not read scopes outside its snapshot",
          );
        },
        async listExamReports() {
          return {
            rows: [createExamReportRow()],
            total: 41,
          };
        },
      }),
      clock,
    );

    await expect(
      service.listExamReports(userContext, { page: "2", pageSize: "20" }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReports: [{ publicId: "exam_report_public_123" }],
      },
      pagination: {
        page: 2,
        pageSize: 20,
        total: 41,
      },
    });
  });

  it("passes terminated status and startedAt sort semantics to the repository", async () => {
    const receivedQueries: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async listExamReports(query) {
          receivedQueries.push(query);

          return {
            rows: [
              createExamReportRow({
                public_id: "mock_exam_public_terminated",
                exam_report_public_id: null,
                mock_exam_public_id: "mock_exam_public_terminated",
                exam_status: "terminated",
                total_score: null,
                generated_at: startedAt,
                started_at: startedAt,
              }),
            ],
            total: 1,
          };
        },
      }),
      clock,
    );

    await expect(
      service.listExamReports(userContext, {
        status: "terminated",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReports: [
          {
            publicId: "mock_exam_public_terminated",
            examReportPublicId: null,
            mockExamPublicId: "mock_exam_public_terminated",
            examStatus: "terminated",
            startedAt: "2026-05-19T08:00:00.000Z",
          },
        ],
      },
      pagination: {
        sortBy: "startedAt",
      },
    });
    expect(receivedQueries).toEqual([
      expect.objectContaining({
        status: "terminated",
        sortBy: "startedAt",
        sortOrder: "desc",
      }),
    ]);
  });

  it("hides report detail when current authorization no longer covers its scope", async () => {
    const service = createExamReportService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [createScope({ level: 4 })];
        },
      }),
      clock,
    );

    await expect(
      service.getExamReport(userContext, "exam_report_public_123"),
    ).resolves.toEqual({
      code: 404321,
      message: "Exam report does not exist.",
      data: null,
    });
  });

  it("generates immutable report snapshot from completed mock_exam answers", async () => {
    const createInputs: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async createExamReport(input) {
          createInputs.push(input);

          return createExamReportRow({
            public_id: input.publicId,
            report_snapshot: input.reportSnapshot,
            learning_suggestion_snapshot: input.learningSuggestionSnapshot,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReport: {
          publicId: "exam_report_public_new",
          learningSuggestionSnapshot: null,
          reportSnapshot: {
            paperName: "2024年专卖三级理论真题",
            questionTypeSummaryText: "question_type analytics: single_choice 2",
            paperSectionSummaryText:
              "paper_section analytics: 一、单项选择题 2",
            knowledgeNodeAnalyticsStatus: "unavailable",
            knowledgeNodeSummaryText: null,
            knowledgeNodeAnalysis: [],
            questionResults: [
              {
                paperQuestionPublicId: "paper_question_public_123",
                questionPublicId: "question_public_123",
                questionType: "single_choice",
                title: "Runtime single choice",
                isCorrect: true,
                score: "1.0",
                maxScore: "1.0",
                selectedAnswer: "A",
                standardAnswer: "A",
                mistakeBookPublicId: null,
              },
              {
                paperQuestionPublicId: "paper_question_public_unanswered",
                questionPublicId: "question_public_unanswered",
                questionType: "single_choice",
                title: "Runtime unanswered single choice",
                isCorrect: false,
                score: "0.0",
                maxScore: "2.0",
                selectedAnswer: null,
                standardAnswer: "B",
                mistakeBookPublicId: null,
              },
            ],
            questionDetails: [
              {
                answerRecordPublicId: "answer_record_public_123",
                paperQuestionPublicId: "paper_question_public_123",
                score: "1.0",
              },
              {
                answerRecordPublicId: null,
                paperQuestionPublicId: "paper_question_public_unanswered",
                questionPublicId: "question_public_unanswered",
                answerSnapshot: null,
                answerRecordStatus: null,
                isCorrect: false,
                score: "0.0",
                maxScore: "2.0",
                answeredAt: null,
                submittedAt: null,
              },
            ],
          },
        },
      },
    });
    expect(createInputs).toEqual([
      expect.objectContaining({
        publicId: "exam_report_public_new",
        mockExamPublicId: "mock_exam_public_123",
        durationSecond: 2700,
        learningSuggestionSnapshot: null,
      }),
    ]);
  });

  it("rebuilds an existing report from current persisted scoring evidence without changing its public id", async () => {
    const rebuildInputs: unknown[] = [];
    let createCallCount = 0;
    const service = createExamReportService(
      createRepository({
        async findExamReportByMockExamPublicId() {
          return createExamReportRow({
            public_id: "exam_report_public_stable",
            exam_status: "scoring_partial_failed",
            total_score: "1.0",
          });
        },
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            exam_status: "completed",
            subjective_score: "4.0",
            total_score: "5.0",
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              ...createAnswerRecordRow(),
              ai_scoring_evidence: {
                taskPublicId: "ai_scoring_task_public_subjective",
                taskStatus: "succeeded",
                attemptNumber: 2,
                attemptStatus: "succeeded",
                modelConfigSnapshot: {
                  modelConfigPublicId: "model_config_public_subjective",
                  modelName: "governed-model",
                  providerDisplayName: "Governed Provider",
                },
                promptTemplateKey: "ai_scoring_v1",
                promptTemplateVersion: 4,
                promptTemplateHash: "prompt_hash_subjective",
                resultSnapshot: {
                  scoringStatus: "scored",
                  overallComment: "persisted evidence",
                },
              },
            },
          ];
        },
        async createExamReport(input) {
          createCallCount += 1;
          return createExamReportRow({ public_id: input.publicId });
        },
        async rebuildExamReport(input) {
          rebuildInputs.push(input);
          return createExamReportRow({
            public_id: input.publicId,
            exam_status: input.examStatus,
            subjective_score: input.subjectiveScore,
            total_score: input.totalScore,
            report_snapshot: input.reportSnapshot,
            learning_suggestion_snapshot: null,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReport: {
          publicId: "exam_report_public_stable",
          examStatus: "completed",
          totalScore: "5.0",
          reportSnapshot: {
            questionResults: expect.arrayContaining([
              expect.objectContaining({
                paperQuestionPublicId: "paper_question_public_123",
                aiScoringEvidence: expect.objectContaining({
                  taskPublicId: "ai_scoring_task_public_subjective",
                  overallComment: "persisted evidence",
                }),
              }),
            ]),
          },
        },
      },
    });
    expect(createCallCount).toBe(0);
    expect(rebuildInputs).toEqual([
      expect.objectContaining({
        publicId: "exam_report_public_stable",
        mockExamPublicId: "mock_exam_public_123",
        totalScore: "5.0",
        learningSuggestionSnapshot: null,
      }),
    ]);
  });

  it("projects only immutable redaction-safe scoring evidence into reports", async () => {
    const subjectivePaperSnapshot = {
      paperPublicId: "paper_public_123",
      name: "subjective evidence paper",
      paperSections: [
        {
          paperSectionTitle: "subjective",
          paperQuestions: [
            {
              paperQuestionPublicId: "paper_question_public_subjective",
              questionPublicId: "question_public_subjective",
              questionType: "short_answer",
              scoringMethod: "ai_scoring",
              standardAnswerRichText: "immutable standard answer",
              score: "5.0",
            },
          ],
        },
      ],
    };
    const service = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            paper_snapshot: subjectivePaperSnapshot,
            objective_score: "0.0",
            subjective_score: "4.0",
            total_score: "4.0",
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              ...createAnswerRecordRow(),
              paper_question_public_id: "paper_question_public_subjective",
              question_public_id: "question_public_subjective",
              question_snapshot: {
                questionType: "short_answer",
                scoringMethod: "ai_scoring",
              },
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "student answer",
                savedFromClientAt: null,
              },
              is_correct: null,
              score: "4.0",
              max_score: "5.0",
              ai_scoring_evidence: {
                taskPublicId: "ai_scoring_task_public_123",
                taskStatus: "succeeded",
                attemptNumber: 2,
                attemptStatus: "succeeded",
                modelConfigSnapshot: {
                  modelConfigPublicId: "model_config_public_123",
                  modelName: "governed-scoring-model",
                  providerDisplayName: "Governed Provider",
                  unexpectedModelConfigField: "must-not-leak",
                },
                promptTemplateKey: "ai_scoring_v1",
                promptTemplateVersion: 3,
                promptTemplateHash: "prompt_hash_123",
                resultSnapshot: {
                  scoringStatus: "scored",
                  scoringPoints: [
                    {
                      scoringPointPublicId: "scoring_point_public_123",
                      isHit: true,
                      score: 4,
                      reason: "matched immutable scoring point",
                    },
                  ],
                  overallComment: "evidence-backed overall comment",
                  improvementSuggestion: "add one missing condition",
                  evidenceStatus: "sufficient",
                  citations: [
                    {
                      resourcePublicId: "resource_public_123",
                      resourceTitle: "published resource",
                      chunkPublicId: "chunk_public_123",
                      generationPublicId: "generation_public_123",
                      headingPath: ["chapter", "section"],
                      chunkIndex: 2,
                      textHash: "text_hash_123",
                      chunkText: "must-not-leak",
                    },
                  ],
                  providerRequestPayload: "must-not-leak",
                  providerResponsePayload: "must-not-leak",
                  rawPrompt: "must-not-leak",
                },
              },
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    const response = await service.generateExamReport(userContext, {
      mockExamPublicId: "mock_exam_public_123",
    });
    const serializedResponse = JSON.stringify(response);

    expect(response).toMatchObject({
      code: 0,
      data: {
        examReport: {
          reportSnapshot: {
            questionResults: [
              {
                paperQuestionPublicId: "paper_question_public_subjective",
                aiScoringEvidence: {
                  taskPublicId: "ai_scoring_task_public_123",
                  attemptNumber: 2,
                  modelConfig: {
                    modelConfigPublicId: "model_config_public_123",
                    modelName: "governed-scoring-model",
                    providerDisplayName: "Governed Provider",
                  },
                  promptTemplate: {
                    promptTemplateKey: "ai_scoring_v1",
                    version: 3,
                    templateHash: "prompt_hash_123",
                  },
                  scoringPoints: [
                    {
                      scoringPointPublicId: "scoring_point_public_123",
                      isHit: true,
                      score: 4,
                      reason: "matched immutable scoring point",
                    },
                  ],
                  overallComment: "evidence-backed overall comment",
                  improvementSuggestion: "add one missing condition",
                  evidenceStatus: "sufficient",
                  citations: [
                    {
                      resourcePublicId: "resource_public_123",
                      resourceTitle: "published resource",
                      chunkPublicId: "chunk_public_123",
                      generationPublicId: "generation_public_123",
                      headingPath: ["chapter", "section"],
                      chunkIndex: 2,
                      textHash: "text_hash_123",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
    expect(serializedResponse).not.toContain("must-not-leak");
    expect(serializedResponse).not.toContain("providerRequestPayload");
    expect(serializedResponse).not.toContain("rawPrompt");
  });

  it("stores knowledge_node weakness analysis in the immutable report snapshot", async () => {
    const service = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            paper_snapshot: {
              paperPublicId: "paper_public_knowledge_analysis",
              name: "knowledge_node report paper",
              paperSections: [
                {
                  paperSectionTitle: "knowledge_node paper_section",
                  paperQuestions: [
                    {
                      paperQuestionPublicId: "paper_question_shared_correct",
                      questionPublicId: "question_shared_correct",
                      questionType: "single_choice",
                      title: "Shared correct question",
                      standardAnswerLabels: ["A"],
                      score: "2.0",
                      knowledgeNodePublicIds: ["knowledge_node_public_shared"],
                      knowledgeNodeSnapshot: {
                        schemaVersion: 1,
                        bindings: [
                          {
                            knowledgeNodePublicId:
                              "knowledge_node_public_shared",
                            name: "共享知识点",
                            pathName: "营销/共享知识点",
                            confirmationStatus: "confirmed",
                            bindingSource: "formal_question_binding",
                          },
                        ],
                      },
                    },
                    {
                      paperQuestionPublicId: "paper_question_shared_unanswered",
                      questionPublicId: "question_shared_unanswered",
                      questionType: "single_choice",
                      title: "Shared unanswered question",
                      standardAnswerLabels: ["B"],
                      score: "2.0",
                      knowledgeNodePublicIds: [
                        "knowledge_node_public_shared",
                        "knowledge_node_public_weak",
                      ],
                      knowledgeNodeSnapshot: {
                        schemaVersion: 1,
                        bindings: [
                          {
                            knowledgeNodePublicId:
                              "knowledge_node_public_shared",
                            name: "共享知识点",
                            pathName: "营销/共享知识点",
                            confirmationStatus: "confirmed",
                            bindingSource: "formal_question_binding",
                          },
                          {
                            knowledgeNodePublicId: "knowledge_node_public_weak",
                            name: "薄弱知识点",
                            pathName: "营销/薄弱知识点",
                            confirmationStatus: "confirmed",
                            bindingSource: "formal_question_binding",
                          },
                        ],
                      },
                    },
                    {
                      paperQuestionPublicId: "paper_question_strong_correct",
                      questionPublicId: "question_strong_correct",
                      questionType: "single_choice",
                      title: "Strong correct question",
                      standardAnswerLabels: ["C"],
                      score: "2.0",
                      knowledgeNodePublicIds: ["knowledge_node_public_strong"],
                      knowledgeNodeSnapshot: {
                        schemaVersion: 1,
                        bindings: [
                          {
                            knowledgeNodePublicId:
                              "knowledge_node_public_strong",
                            name: "优势知识点",
                            pathName: "营销/优势知识点",
                            confirmationStatus: "confirmed",
                            bindingSource: "formal_question_binding",
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            objective_score: "3.0",
            total_score: "3.0",
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              ...createAnswerRecordRow(),
              public_id: "answer_record_shared_correct",
              paper_question_public_id: "paper_question_shared_correct",
              question_public_id: "question_shared_correct",
              is_correct: true,
              score: "1.0",
              max_score: "2.0",
            },
            {
              ...createAnswerRecordRow(),
              public_id: "answer_record_strong_correct",
              paper_question_public_id: "paper_question_strong_correct",
              question_public_id: "question_strong_correct",
              is_correct: true,
              score: "2.0",
              max_score: "2.0",
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReport: {
          reportSnapshot: {
            knowledgeNodeAnalyticsStatus: "available",
            knowledgeNodeSummaryText:
              "knowledge_node analytics: 营销/共享知识点 2, 营销/优势知识点 1, 营销/薄弱知识点 1",
            knowledgeNodeWeaknessSummaryText:
              "知识点薄弱项：营销/薄弱知识点 得分率 0% 正确率 0% 得分 0.0/2.0；营销/共享知识点 得分率 25% 正确率 50% 得分 1.0/4.0；营销/优势知识点 得分率 100% 正确率 100% 得分 2.0/2.0",
            knowledgeNodeAnalysis: [
              {
                knowledgeNodePublicId: "knowledge_node_public_weak",
                name: "薄弱知识点",
                pathName: "营销/薄弱知识点",
                confirmationStatus: "confirmed",
                bindingSource: "formal_question_binding",
                questionCount: 1,
                answeredCount: 0,
                correctCount: 0,
                score: "0.0",
                maxScore: "2.0",
                scoreRate: 0,
                accuracyRate: 0,
                weaknessRank: 1,
                questionPublicIds: ["question_shared_unanswered"],
              },
              {
                knowledgeNodePublicId: "knowledge_node_public_shared",
                name: "共享知识点",
                pathName: "营销/共享知识点",
                confirmationStatus: "confirmed",
                bindingSource: "formal_question_binding",
                questionCount: 2,
                answeredCount: 1,
                correctCount: 1,
                score: "1.0",
                maxScore: "4.0",
                scoreRate: 25,
                accuracyRate: 50,
                weaknessRank: 2,
                questionPublicIds: [
                  "question_shared_correct",
                  "question_shared_unanswered",
                ],
              },
              {
                knowledgeNodePublicId: "knowledge_node_public_strong",
                name: "优势知识点",
                pathName: "营销/优势知识点",
                confirmationStatus: "confirmed",
                bindingSource: "formal_question_binding",
                questionCount: 1,
                answeredCount: 1,
                correctCount: 1,
                score: "2.0",
                maxScore: "2.0",
                scoreRate: 100,
                accuracyRate: 100,
                weaknessRank: 3,
                questionPublicIds: ["question_strong_correct"],
              },
            ],
          },
        },
      },
    });
  });

  it("distinguishes valid empty knowledge facts from mixed legacy snapshots", async () => {
    const createService = (paperQuestions: Record<string, unknown>[]) =>
      createExamReportService(
        createRepository({
          async findSubmittedMockExamByPublicId() {
            return createMockExamRow({
              paper_snapshot: {
                paperPublicId: "paper_public_knowledge_state",
                name: "knowledge state paper",
                paperSections: [
                  { paperSectionTitle: "section", paperQuestions },
                ],
              },
            });
          },
          async listMockExamAnswerRecords() {
            return [];
          },
        }),
        clock,
        createIdFactory(),
      );
    const validEmptyQuestion = {
      paperQuestionPublicId: "paper_question_empty",
      questionPublicId: "question_empty",
      questionType: "single_choice",
      standardAnswerLabels: ["A"],
      score: "1.0",
      knowledgeNodePublicIds: [],
      knowledgeNodeSnapshot: { schemaVersion: 1, bindings: [] },
    };

    await expect(
      createService(
        validEmptyQuestion ? [validEmptyQuestion] : [],
      ).generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      data: {
        examReport: {
          reportSnapshot: {
            knowledgeNodeAnalyticsStatus: "available",
            knowledgeNodeAnalysis: [],
            knowledgeNodeSummaryText: null,
          },
        },
      },
    });

    await expect(
      createService([
        validEmptyQuestion,
        {
          ...validEmptyQuestion,
          paperQuestionPublicId: "paper_question_legacy",
          questionPublicId: "question_legacy",
          knowledgeNodePublicIds: ["knowledge_node_legacy"],
          knowledgeNodeSnapshot: undefined,
        },
      ]).generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).rejects.toThrow(ExamReportKnowledgeSnapshotIntegrityError);

    const legacyQuestion = {
      ...validEmptyQuestion,
      paperQuestionPublicId: "paper_question_legacy",
      questionPublicId: "question_legacy",
      knowledgeNodePublicIds: ["knowledge_node_legacy"],
    };
    delete (legacyQuestion as { knowledgeNodeSnapshot?: unknown })
      .knowledgeNodeSnapshot;
    await expect(
      createService([validEmptyQuestion, legacyQuestion]).generateExamReport(
        userContext,
        { mockExamPublicId: "mock_exam_public_123" },
      ),
    ).resolves.toMatchObject({
      data: {
        examReport: {
          reportSnapshot: {
            knowledgeNodeAnalyticsStatus: "unavailable",
            knowledgeNodeAnalysis: [],
            knowledgeNodeSummaryText: null,
          },
        },
      },
    });
  });

  it("fails closed when the same knowledge identity has conflicting captured facts", async () => {
    const service = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          const createQuestion = (suffix: string, pathName: string) => ({
            paperQuestionPublicId: `paper_question_${suffix}`,
            questionPublicId: `question_${suffix}`,
            questionType: "single_choice",
            standardAnswerLabels: ["A"],
            score: "1.0",
            knowledgeNodePublicIds: ["knowledge_node_same"],
            knowledgeNodeSnapshot: {
              schemaVersion: 1,
              bindings: [
                {
                  knowledgeNodePublicId: "knowledge_node_same",
                  name: pathName.split("/").at(-1),
                  pathName,
                  confirmationStatus: "confirmed",
                  bindingSource: "formal_question_binding",
                },
              ],
            },
          });
          return createMockExamRow({
            paper_snapshot: {
              paperPublicId: "paper_public_conflict",
              name: "conflict paper",
              paperSections: [
                {
                  paperSectionTitle: "section",
                  paperQuestions: [
                    createQuestion("a", "营销/事实 A"),
                    createQuestion("b", "营销/事实 B"),
                  ],
                },
              ],
            },
          });
        },
        async listMockExamAnswerRecords() {
          return [];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).rejects.toThrow(ExamReportKnowledgeSnapshotIntegrityError);
  });

  it("keeps fill_blank scoring method and per-blank answers in report results", async () => {
    const service = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            paper_snapshot: {
              paperPublicId: "paper_public_fill_blank",
              name: "fill_blank_report_paper",
              paperSections: [
                {
                  paperSectionTitle: "fill_blank paper_section",
                  paperQuestions: [
                    {
                      paperQuestionPublicId: "paper_question_fill_blank_123",
                      questionPublicId: "question_fill_blank_123",
                      questionType: "fill_blank",
                      title: "Fill blank per blank report",
                      score: "2.0",
                      scoringMethod: "auto_match",
                      fillBlankAnswers: [
                        {
                          blankKey: "blank_1",
                          standardAnswers: ["customer motive"],
                          score: "1.0",
                          sortOrder: 1,
                        },
                        {
                          blankKey: "blank_2",
                          standardAnswers: ["purchase frequency"],
                          score: "1.0",
                          sortOrder: 2,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            objective_score: "1.0",
            total_score: "1.0",
          });
        },
        async listMockExamAnswerRecords() {
          return [
            {
              ...createAnswerRecordRow(),
              paper_question_public_id: "paper_question_fill_blank_123",
              question_public_id: "question_fill_blank_123",
              question_snapshot: {
                questionType: "fill_blank",
                scoringMethod: "auto_match",
                fillBlankAnswers: [
                  {
                    blankKey: "blank_1",
                    standardAnswers: ["customer motive"],
                    score: "1.0",
                    sortOrder: 1,
                  },
                  {
                    blankKey: "blank_2",
                    standardAnswers: ["purchase frequency"],
                    score: "1.0",
                    sortOrder: 2,
                  },
                ],
              },
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "customer motive; wrong answer",
                savedFromClientAt: null,
              },
              is_correct: false,
              score: "1.0",
              max_score: "2.0",
            },
          ];
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      service.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        examReport: {
          reportSnapshot: {
            questionResults: [
              {
                paperQuestionPublicId: "paper_question_fill_blank_123",
                questionType: "fill_blank",
                scoringMethod: "auto_match",
                selectedAnswer: "customer motive; wrong answer",
                standardAnswer:
                  "blank_1: customer motive; blank_2: purchase frequency",
                fillBlankAnswers: [
                  {
                    blankKey: "blank_1",
                    standardAnswers: ["customer motive"],
                    score: "1.0",
                    sortOrder: 1,
                  },
                  {
                    blankKey: "blank_2",
                    standardAnswers: ["purchase frequency"],
                    score: "1.0",
                    sortOrder: 2,
                  },
                ],
              },
            ],
          },
        },
      },
    });
  });

  it("persists a redaction-safe learning suggestion snapshot after local retry", async () => {
    const capturedContexts: LearningSuggestionMockContext[] = [];
    const updateInputs: unknown[] = [];
    const service = createExamReportService(
      createRepository({
        async findExamReportByPublicId() {
          return createLearningSuggestionReadyReportRow();
        },
        async updateExamReportLearningSuggestionSnapshot(input) {
          updateInputs.push(input);
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(capturedContexts),
    );

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(capturedContexts).toHaveLength(1);
    expect(capturedContexts[0]).toMatchObject({
      organizationPublicId: "organization_public_123",
      profession: "monopoly",
      level: 3,
      learningSuggestionInput: {
        schemaVersion: 1,
        reportRevision: 1,
      },
    });
    expect(updateInputs).toEqual([
      {
        userPublicId: "user_public_123",
        publicId: "exam_report_public_123",
        expectedReportRevision: 1,
        learningSuggestionSnapshot: {
          status: "generated",
          learningSuggestion: "Review missed knowledge nodes.",
          evidenceStatus: "none",
          generatedAt: "2026-05-19T09:00:00.000Z",
          inputSchemaVersion: 1,
          inputDigest: expect.stringMatching(/^[0-9a-f]{64}$/u),
          reportRevision: 1,
          modelConfigSnapshot: {
            modelConfigPublicId: "model-config-dev-learning-suggestion",
            aiFuncType: "learning_suggestion",
            modelName: "mock-learning-suggestion",
            providerDisplayName: "Local Mock AI",
            configVersion: 1,
          },
          promptTemplate: {
            promptTemplateKey: "learning_suggestion_v1",
            version: 1,
            templateHash: "learning_suggestion_v1_baseline",
          },
        },
      },
    ]);

    const serializedSnapshot = JSON.stringify(updateInputs);
    expect(serializedSnapshot).not.toContain("selectedLabels");
    expect(serializedSnapshot).not.toContain("rawPrompt");
    expect(serializedSnapshot).not.toContain("rawAnswer");
    expect(serializedSnapshot).not.toContain("ai_call_log_public_redacted");
  });

  it("replays an exact persisted revision without Provider or write side effects", async () => {
    let persistedSnapshot: ExamReportRow["learning_suggestion_snapshot"] = null;
    const firstContexts: LearningSuggestionMockContext[] = [];
    const firstService = createExamReportService(
      createRepository({
        async findExamReportByPublicId() {
          return createLearningSuggestionReadyReportRow();
        },
        async updateExamReportLearningSuggestionSnapshot(input) {
          persistedSnapshot = input.learningSuggestionSnapshot;
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(firstContexts),
    );
    await firstService.retryLearningSuggestion(
      userContext,
      "exam_report_public_123",
      { requestedFromClientAt: "2026-05-19T09:05:00.000Z" },
    );

    let replayWriteCount = 0;
    const replayContexts: LearningSuggestionMockContext[] = [];
    const replayService = createExamReportService(
      createRepository({
        async findExamReportByPublicId() {
          return createLearningSuggestionReadyReportRow({
            learning_suggestion_snapshot: persistedSnapshot,
          });
        },
        async updateExamReportLearningSuggestionSnapshot() {
          replayWriteCount += 1;
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(replayContexts),
    );

    await expect(
      replayService.retryLearningSuggestion(
        userContext,
        "exam_report_public_123",
        { requestedFromClientAt: "2026-05-19T09:06:00.000Z" },
      ),
    ).resolves.toEqual({ code: 0, message: "ok", data: null });
    expect(firstContexts).toHaveLength(1);
    expect(replayContexts).toHaveLength(0);
    expect(replayWriteCount).toBe(0);
  });

  it("fails closed before Provider and persistence for a corrupt completed report", async () => {
    const contexts: LearningSuggestionMockContext[] = [];
    let writeCount = 0;
    const service = createExamReportService(
      createRepository({
        async updateExamReportLearningSuggestionSnapshot() {
          writeCount += 1;
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(contexts),
    );

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 409323,
      message: "Learning suggestion input is unavailable.",
      data: null,
    });
    expect(contexts).toHaveLength(0);
    expect(writeCount).toBe(0);
  });

  it("rejects a revision CAS conflict after Provider without reporting success", async () => {
    const contexts: LearningSuggestionMockContext[] = [];
    const service = createExamReportService(
      createRepository({
        async findExamReportByPublicId() {
          return createLearningSuggestionReadyReportRow();
        },
        async updateExamReportLearningSuggestionSnapshot() {
          throw new Error("revision conflict");
        },
      }),
      clock,
      createIdFactory(),
      createLearningSuggestionOptions(contexts),
    );

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).rejects.toThrow("revision conflict");
    expect(contexts).toHaveLength(1);
  });

  it("does not generate report for terminated or unknown mock_exam attempts", async () => {
    const terminatedService = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return createMockExamRow({
            exam_status: "terminated",
            submitted_at: null,
          });
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      terminatedService.generateExamReport(userContext, {
        mockExamPublicId: "mock_exam_public_terminated",
      }),
    ).resolves.toEqual({
      code: 409321,
      message: "Terminated mock exam cannot generate exam report.",
      data: null,
    });

    const missingService = createExamReportService(
      createRepository({
        async findSubmittedMockExamByPublicId() {
          return null;
        },
      }),
      clock,
      createIdFactory(),
    );

    await expect(
      missingService.generateExamReport(userContext, {
        mockExamPublicId: "missing_mock_exam",
      }),
    ).resolves.toEqual({
      code: 404322,
      message: "Mock exam does not exist.",
      data: null,
    });
  });

  it("returns documented not-available response for Phase 5 learning suggestion retry", async () => {
    const service = createExamReportService(createRepository(), clock);

    await expect(
      service.retryLearningSuggestion(userContext, "exam_report_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 422321,
      message: "Learning suggestion retry is not available in Phase 4.",
      data: null,
    });
  });
});
