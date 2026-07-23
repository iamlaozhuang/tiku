import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { promptTemplateDefinitions } from "@/ai/prompts/templates";

import {
  buildLearningSuggestionInput,
  LearningSuggestionInputIntegrityError,
  serializeLearningSuggestionProviderVariables,
  validatePersistedLearningSuggestionSnapshot,
} from "./learning-suggestion-input";

type SourceOverrides = {
  report?: Record<string, unknown>;
  reportSnapshot?: Record<string, unknown>;
};

function parseYamlStrictly(path: string): Record<string, unknown> {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readFileSync(path, "utf8"), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS() as Record<string, unknown>;
}

function createSource(overrides: SourceOverrides = {}) {
  const reportSnapshot = {
    paperPublicId: "paper_public_001",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    examStatus: "completed",
    scoreSummary: {
      objectiveScore: "4.0",
      subjectiveScore: "2.0",
      totalScore: "6.0",
    },
    questionResults: [
      {
        paperQuestionPublicId: "paper_question_public_b",
        questionPublicId: "question_public_b",
        questionType: "short_answer",
        paperSectionTitle: "业务分析",
        questionGroupPublicId: null,
        questionGroupTitle: null,
        isCorrect: null,
        score: "2.0",
        maxScore: "5.0",
        selectedAnswer: "RAW_STUDENT_ANSWER_MUST_NOT_LEAVE",
        standardAnswer: "RAW_STANDARD_ANSWER_MUST_NOT_LEAVE",
        aiScoringEvidence: {
          resultSnapshot: {
            scoringStatus: "scored",
            evidenceStatus: "weak",
            citations: [{ chunkText: "RAW_CITATION_MUST_NOT_LEAVE" }],
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_2",
                isHit: false,
                score: 0,
                reason: "论证不足",
              },
              {
                scoringPointPublicId: "scoring_point_public_1",
                isHit: true,
                score: 2,
                reason: "概念正确",
              },
            ],
          },
        },
      },
      {
        paperQuestionPublicId: "paper_question_public_a",
        questionPublicId: "question_public_a",
        questionType: "single_choice",
        paperSectionTitle: "基础知识",
        questionGroupPublicId: null,
        questionGroupTitle: null,
        isCorrect: false,
        score: "0.0",
        maxScore: "4.0",
        selectedAnswer: "A",
        standardAnswer: "B",
        aiScoringEvidence: null,
      },
      {
        paperQuestionPublicId: "paper_question_public_c",
        questionPublicId: "question_public_c",
        questionType: "true_false",
        paperSectionTitle: "基础知识",
        questionGroupPublicId: null,
        questionGroupTitle: null,
        isCorrect: true,
        score: "4.0",
        maxScore: "4.0",
        selectedAnswer: "true",
        standardAnswer: "true",
        aiScoringEvidence: null,
      },
    ],
    knowledgeNodeAnalyticsStatus: "available",
    knowledgeNodeAnalysis: [
      {
        knowledgeNodePublicId: "knowledge_node_public_weak",
        name: "行政处罚裁量",
        pathName: "行政执法/行政处罚裁量",
        confirmationStatus: "confirmed",
        bindingSource: "formal_question_binding",
        questionCount: 2,
        answeredCount: 2,
        correctCount: 0,
        score: "2.0",
        maxScore: "9.0",
        scoreRate: 22,
        accuracyRate: 0,
        weaknessRank: 1,
        questionPublicIds: ["question_public_a", "question_public_b"],
      },
    ],
    untrustedExtra: "RAW_REPORT_EXTRA_MUST_NOT_LEAVE",
    ...(overrides.reportSnapshot ?? {}),
  };

  return {
    report: {
      publicId: "exam_report_public_001",
      reportRevision: 3,
      mockExamPublicId: "mock_exam_public_001",
      paperPublicId: "paper_public_001",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "completed",
      objectiveScore: "4.0",
      subjectiveScore: "2.0",
      totalScore: "6.0",
      durationSecond: 900,
      reportSnapshot,
      ...(overrides.report ?? {}),
    },
  };
}

describe("F-0176 learning suggestion whole-report input", () => {
  it("builds one deterministic minimized input from every finalized report fact", () => {
    const result = buildLearningSuggestionInput(createSource());

    expect(result).toMatchObject({
      schemaVersion: 1,
      reportPublicId: "exam_report_public_001",
      reportRevision: 3,
      variables: {
        examReport: {
          profession: "monopoly",
          level: 3,
          subject: "theory",
          examStatus: "completed",
          objectiveScore: "4.0",
          subjectiveScore: "2.0",
          totalScore: "6.0",
          durationSecond: 900,
        },
        answerRecordSummary: {
          questionCount: 3,
          wrongQuestionCount: 2,
          questionTypeSummaries: expect.arrayContaining([
            expect.objectContaining({
              questionType: "single_choice",
              questionCount: 1,
              wrongQuestionCount: 1,
            }),
            expect.objectContaining({
              questionType: "short_answer",
              questionCount: 1,
              wrongQuestionCount: 1,
            }),
          ]),
          paperSectionSummaries: expect.arrayContaining([
            expect.objectContaining({
              paperSectionTitle: "基础知识",
              questionCount: 2,
              wrongQuestionCount: 1,
            }),
          ]),
          errorSummaries: [
            expect.objectContaining({
              questionOrdinal: 1,
              questionType: "single_choice",
              paperSectionTitle: "基础知识",
            }),
            expect.objectContaining({
              questionOrdinal: 2,
              questionType: "short_answer",
              missedScoringPoints: [
                {
                  scoringPointOrdinal: 2,
                  score: "0.0",
                  reason: "论证不足",
                },
              ],
              evidenceStatus: "weak",
            }),
          ],
        },
        knowledgeNodeSnapshot: {
          status: "available",
          weaknesses: [
            expect.objectContaining({
              weaknessRank: 1,
              name: "行政处罚裁量",
              pathName: "行政执法/行政处罚裁量",
              scoreRate: 22,
            }),
          ],
        },
      },
      inputDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
    });

    const serialized = JSON.stringify(result);
    for (const blockedValue of [
      "exam_report_public_001",
      "mock_exam_public_001",
      "paper_public_001",
      "question_public_a",
      "scoring_point_public_2",
      "knowledge_node_public_weak",
      "RAW_STUDENT_ANSWER_MUST_NOT_LEAVE",
      "RAW_STANDARD_ANSWER_MUST_NOT_LEAVE",
      "RAW_CITATION_MUST_NOT_LEAVE",
      "RAW_REPORT_EXTRA_MUST_NOT_LEAVE",
    ]) {
      if (blockedValue === "exam_report_public_001") {
        continue;
      }
      expect(serialized).not.toContain(blockedValue);
    }
  });

  it("binds the digest to report identity/revision and all three canonical variables", () => {
    const baseline = buildLearningSuggestionInput(createSource());
    const changedWeakness = buildLearningSuggestionInput(
      createSource({
        reportSnapshot: {
          knowledgeNodeAnalyticsStatus: "available",
          knowledgeNodeAnalysis: [
            {
              knowledgeNodePublicId: "knowledge_node_public_other",
              name: "行政许可",
              pathName: "行政执法/行政许可",
              confirmationStatus: "confirmed",
              bindingSource: "formal_question_binding",
              questionCount: 2,
              answeredCount: 2,
              correctCount: 0,
              score: "2.0",
              maxScore: "9.0",
              scoreRate: 22,
              accuracyRate: 0,
              weaknessRank: 1,
              questionPublicIds: ["question_public_a", "question_public_b"],
            },
          ],
        },
      }),
    );
    const changedRevision = buildLearningSuggestionInput(
      createSource({ report: { reportRevision: 4 } }),
    );

    expect(changedWeakness.variables.examReport.totalScore).toBe(
      baseline.variables.examReport.totalScore,
    );
    expect(changedWeakness.inputDigest).not.toBe(baseline.inputDigest);
    expect(changedRevision.inputDigest).not.toBe(baseline.inputDigest);

    const expectedDigest = createHash("sha256")
      .update(
        JSON.stringify({
          schemaVersion: baseline.schemaVersion,
          reportPublicId: baseline.reportPublicId,
          reportRevision: baseline.reportRevision,
          variables: baseline.variables,
        }),
      )
      .digest("hex");
    expect(baseline.inputDigest).toBe(expectedDigest);
  });

  it("is independent of source question ordering and returns detached facts", () => {
    const original = createSource();
    const reportSnapshot = original.report.reportSnapshot as Record<
      string,
      unknown
    >;
    const reversed = [
      ...(reportSnapshot.questionResults as unknown[]),
    ].reverse();
    const reordered = createSource({
      reportSnapshot: { questionResults: reversed },
    });
    const first = buildLearningSuggestionInput(original);
    const second = buildLearningSuggestionInput(reordered);

    expect(second).toEqual(first);
    reversed[0] = { malicious: true };
    expect(second).toEqual(first);
    second.variables.answerRecordSummary.errorSummaries[0]!.paperSectionTitle =
      "mutated output";
    expect(
      (reordered.report.reportSnapshot as Record<string, unknown>)
        .questionResults,
    ).not.toEqual(second.variables.answerRecordSummary.errorSummaries);
  });

  it.each([
    ["partial report", { report: { examStatus: "scoring_partial_failed" } }],
    ["invalid revision", { report: { reportRevision: 0 } }],
    [
      "row snapshot score mismatch",
      {
        reportSnapshot: {
          scoreSummary: {
            objectiveScore: "4.0",
            subjectiveScore: "2.0",
            totalScore: "5.0",
          },
        },
      },
    ],
    [
      "sparse questions",
      {
        reportSnapshot: {
          questionResults: Array(2),
        },
      },
    ],
    [
      "non-finite score",
      {
        reportSnapshot: {
          scoreSummary: {
            objectiveScore: "4.0",
            subjectiveScore: "2.0",
            totalScore: "Infinity",
          },
        },
      },
    ],
  ])("fails closed for %s", (_label, overrides) => {
    expect(() => buildLearningSuggestionInput(createSource(overrides))).toThrow(
      LearningSuggestionInputIntegrityError,
    );
  });

  it("rejects duplicate and case-conflicting source identities without leaking them", () => {
    const source = createSource();
    const snapshot = source.report.reportSnapshot as Record<string, unknown>;
    const questions = snapshot.questionResults as Record<string, unknown>[];

    expect(() =>
      buildLearningSuggestionInput(
        createSource({
          reportSnapshot: {
            questionResults: [questions[0], { ...questions[0] }],
          },
        }),
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
    expect(() =>
      buildLearningSuggestionInput(
        createSource({
          reportSnapshot: {
            questionResults: [
              questions[0],
              {
                ...questions[0],
                paperQuestionPublicId: "PAPER_QUESTION_PUBLIC_B",
              },
            ],
          },
        }),
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
  });

  it("accepts a completed report with no errors and an explicitly empty knowledge snapshot", () => {
    const source = createSource();
    const snapshot = source.report.reportSnapshot as Record<string, unknown>;
    const questions = (
      snapshot.questionResults as Record<string, unknown>[]
    ).map((question) => ({
      ...question,
      isCorrect: true,
      score: question.maxScore,
      aiScoringEvidence: null,
    }));
    const input = buildLearningSuggestionInput(
      createSource({
        report: {
          objectiveScore: "8.0",
          subjectiveScore: "5.0",
          totalScore: "13.0",
        },
        reportSnapshot: {
          scoreSummary: {
            objectiveScore: "8.0",
            subjectiveScore: "5.0",
            totalScore: "13.0",
          },
          questionResults: questions,
          knowledgeNodeAnalyticsStatus: "available",
          knowledgeNodeAnalysis: [],
        },
      }),
    );

    expect(input.variables.answerRecordSummary.wrongQuestionCount).toBe(0);
    expect(input.variables.answerRecordSummary.errorSummaries).toEqual([]);
    expect(input.variables.knowledgeNodeSnapshot).toEqual({
      status: "available",
      weaknesses: [],
    });
  });

  it("rejects missing, over-limit and cross-report analytical facts as a whole", () => {
    const source = createSource();
    const snapshot = source.report.reportSnapshot as Record<string, unknown>;

    expect(() =>
      buildLearningSuggestionInput(
        createSource({ reportSnapshot: { questionResults: undefined } }),
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
    expect(() =>
      buildLearningSuggestionInput(
        createSource({
          reportSnapshot: {
            questionResults: Array.from({ length: 501 }, (_, index) => ({
              ...(snapshot.questionResults as Record<string, unknown>[])[0],
              paperQuestionPublicId: `paper_question_public_${index}`,
              questionPublicId: `question_public_${index}`,
            })),
          },
        }),
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
    expect(() =>
      buildLearningSuggestionInput(
        createSource({
          reportSnapshot: {
            knowledgeNodeAnalyticsStatus: "available",
            knowledgeNodeAnalysis: [
              {
                ...(
                  snapshot.knowledgeNodeAnalysis as Record<string, unknown>[]
                )[0],
                questionPublicIds: ["question_public_outside_report"],
              },
            ],
          },
        }),
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
  });

  it("serializes only the existing three Prompt Registry variables as untrusted JSON data", () => {
    const input = buildLearningSuggestionInput(createSource());
    const learningSuggestionTemplate = promptTemplateDefinitions.find(
      (definition) => definition.aiFuncType === "learning_suggestion",
    );
    const serialized = serializeLearningSuggestionProviderVariables(input);

    expect(learningSuggestionTemplate).toMatchObject({
      promptTemplateKey: "learning_suggestion_v1",
      version: 1,
      templateHash: "learning_suggestion_v1_baseline",
      requiredVariables: [
        "examReport",
        "answerRecordSummary",
        "knowledgeNodeSnapshot",
      ],
    });
    expect(Object.keys(JSON.parse(serialized))).toEqual([
      "examReport",
      "answerRecordSummary",
      "knowledgeNodeSnapshot",
    ]);
    expect(serialized).not.toContain(input.reportPublicId);
    expect(serialized).not.toContain("reportRevision");
    expect(serialized).not.toContain("PublicId");

    input.variables.examReport.totalScore = "999.0";
    expect(() => serializeLearningSuggestionProviderVariables(input)).toThrow(
      LearningSuggestionInputIntegrityError,
    );
  });

  it("accepts only a complete same-revision same-digest persisted success replay", () => {
    const input = buildLearningSuggestionInput(createSource());
    const snapshot = {
      status: "generated",
      inputSchemaVersion: 1,
      inputDigest: input.inputDigest,
      reportRevision: input.reportRevision,
      learningSuggestion: "按薄弱知识点复习。",
      evidenceStatus: "none",
      generatedAt: "2026-07-23T00:00:00.000Z",
      modelConfigSnapshot: {
        modelConfigPublicId: "model_config_public_001",
        aiFuncType: "learning_suggestion",
        modelName: "model",
        providerDisplayName: "provider",
        configVersion: 1,
      },
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
        version: 1,
        templateHash: "learning_suggestion_v1_baseline",
      },
    };

    expect(
      validatePersistedLearningSuggestionSnapshot(snapshot, input),
    ).toEqual(snapshot);
    expect(() =>
      validatePersistedLearningSuggestionSnapshot(
        { ...snapshot, reportRevision: 2 },
        input,
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
    expect(() =>
      validatePersistedLearningSuggestionSnapshot(
        { ...snapshot, inputDigest: "0".repeat(64) },
        input,
      ),
    ).toThrow(LearningSuggestionInputIntegrityError);
  });

  it("validates the F-0176 task state and single production input contract", () => {
    const taskSafety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as Record<string, unknown>;
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );
    const serviceSource = readFileSync(
      "src/server/services/exam-report-service.ts",
      "utf8",
    );
    const runtimeSource = readFileSync(
      "src/server/services/ai-mock-provider-runtime.ts",
      "utf8",
    );
    const repositorySource = readFileSync(
      "src/server/repositories/student-flow-runtime-repository.ts",
      "utf8",
    );

    expect(taskSafety).toMatchObject({
      taskId:
        "p1-remediation-rc-08-learning-suggestion-whole-report-input-2026-07-23",
      baseSha: "9ac24c0363fbe6bbaea9bcc4386275ddc5a7b148",
      branch: "fix/learning-suggestion-whole-report-input",
      approvalId:
        "guardian-f0176-learning-suggestion-whole-report-input-2026-07-23",
      riskCategory:
        "database_application_logic_and_provider_adapter_pure_logic",
      conditionalCloseout: true,
    });
    expect((projectState.currentTask as Record<string, unknown>).id).toBe(
      taskSafety.taskId,
    );
    expect(
      (taskQueue.p1RemediationSerialProgram as Record<string, unknown>)
        .currentTaskId,
    ).toBe(taskSafety.taskId);
    expect(serviceSource).not.toContain("selectLearningSuggestionAnswerRecord");
    expect(serviceSource).not.toContain("buildLearningSuggestionRawAnswer");
    expect(runtimeSource).toContain(
      "serializeLearningSuggestionProviderVariables",
    );
    expect(runtimeSource).not.toContain(
      "options.provider.generateLearningSuggestion(context)",
    );
    expect(repositorySource).toContain(
      "eq(examReport.report_revision, input.expectedReportRevision)",
    );
    expect(repositorySource).toContain(
      "isNull(examReport.learning_suggestion_snapshot)",
    );
    expect(repositorySource).toContain("updatedRows.length !== 1");
  });
});
