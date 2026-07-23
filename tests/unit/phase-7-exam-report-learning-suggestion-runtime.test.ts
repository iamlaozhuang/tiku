import { describe, expect, it } from "vitest";

import { createExamReportService } from "@/server/services/exam-report-service";
import { createModelConfigSnapshot } from "@/server/models/ai-rag";
import type {
  ExamReportAnswerRecordRow,
  ExamReportRepository,
} from "@/server/repositories/exam-report-repository";
import type { LearningSuggestionMockContext } from "@/server/services/ai-mock-provider-runtime";

const now = new Date("2026-05-22T00:30:00.000Z");
const startedAt = new Date("2026-05-22T00:25:00.000Z");
const expiresAt = new Date("2027-05-21T00:00:00.000Z");
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

function createAnswerRecord(): ExamReportAnswerRecordRow {
  return {
    public_id: "answer-record-dev-learning-suggestion",
    paper_question_public_id: "paper-question-dev-single-choice",
    question_public_id: "question-dev-single-choice",
    question_snapshot: {
      stemSummary: "Question stem summary",
      standardAnswer: ["A"],
    },
    answer_snapshot: {
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: null,
    },
    ai_scoring_evidence: null,
    answer_record_status: "scored",
    is_correct: false,
    score: "0.0",
    max_score: "5.0",
    answered_at: now,
    submitted_at: now,
  };
}

function createRepository(): ExamReportRepository {
  const answerRecord = createAnswerRecord();

  return {
    async listEffectiveAuthorizationScopes() {
      return [
        {
          profession: "monopoly",
          level: 3,
          authorization_types: ["personal_auth"],
          expires_at: expiresAt,
        },
      ];
    },
    async listExamReports() {
      return { rows: [], total: 0 };
    },
    async findExamReportByPublicId() {
      return {
        id: 3001,
        public_id: "exam-report-dev-learning-suggestion",
        exam_report_public_id: "exam-report-dev-learning-suggestion",
        mock_exam_public_id: "mock-exam-dev-learning-suggestion",
        paper_public_id: "paper-dev-theory",
        paper_name: "Local theory mock paper",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        exam_status: "completed",
        objective_score: "0.0",
        subjective_score: null,
        total_score: "0.0",
        duration_second: 300,
        report_revision: 1,
        report_snapshot: {
          paperPublicId: "paper-dev-theory",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          examStatus: "completed",
          scoreSummary: {
            objectiveScore: "0.0",
            subjectiveScore: "0.0",
            totalScore: "0.0",
          },
          questionResults: [
            {
              paperQuestionPublicId: "paper-question-dev-single-choice",
              questionPublicId: "question-dev-single-choice",
              questionType: "single_choice",
              paperSectionTitle: "Objective questions",
              questionGroupPublicId: null,
              questionGroupTitle: null,
              isCorrect: false,
              score: "0.0",
              maxScore: "5.0",
              aiScoringEvidence: null,
            },
          ],
          knowledgeNodeAnalyticsStatus: "available",
          knowledgeNodeAnalysis: [],
        },
        learning_suggestion_snapshot: null,
        generated_at: now,
        started_at: startedAt,
        created_at: now,
        updated_at: now,
      };
    },
    async findExamReportByMockExamPublicId() {
      return null;
    },
    async findSubmittedMockExamByPublicId() {
      return null;
    },
    async listMockExamAnswerRecords() {
      return [answerRecord];
    },
    async createExamReport() {
      throw new Error("createExamReport should not be called by retry");
    },
    async rebuildExamReport() {
      throw new Error("rebuildExamReport should not be called by retry");
    },
    async updateExamReportLearningSuggestionSnapshot() {},
  };
}

describe("phase 7 exam report learning suggestion runtime", () => {
  it("triggers the local mock AI runtime and keeps raw answer data out of the response", async () => {
    const capturedContexts: LearningSuggestionMockContext[] = [];
    const service = createExamReportService(
      createRepository(),
      { now: () => now },
      { createPublicId: (prefix) => `${prefix}-dev-unused` },
      {
        learningSuggestionRuntime: {
          async generateLearningSuggestion(context) {
            capturedContexts.push(context);

            return {
              learningSuggestion: "Review the missed objective question.",
              aiCallLog: {
                publicId: "ai-call-log-dev-learning-suggestion",
                userPublicId: context.userPublicId,
                organizationPublicId: null,
                profession: null,
                level: null,
                aiFuncType: "learning_suggestion",
                callStatus: "success",
                providerDisplayName:
                  context.modelConfigSnapshot.providerDisplayName,
                modelAlias: context.modelConfigSnapshot.modelName,
                promptSummary: "redacted prompt and answer snapshot",
                outputSummary: "redacted learning suggestion snapshot",
                promptTokenCount: 10,
                completionTokenCount: 5,
                totalTokenCount: 15,
                estimatedCostCny: "0.00",
                latencyMs: 100,
                startedAt: now.toISOString(),
                completedAt: now.toISOString(),
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
      },
    );

    const response = await service.retryLearningSuggestion(
      { userPublicId: "user-dev-student" },
      "exam-report-dev-learning-suggestion",
      { requestedFromClientAt: now.toISOString() },
    );

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(capturedContexts).toHaveLength(1);
    expect(capturedContexts[0]).toMatchObject({
      userPublicId: "user-dev-student",
      mockExamPublicId: "mock-exam-dev-learning-suggestion",
      learningSuggestionInput: {
        schemaVersion: 1,
        reportRevision: 1,
        variables: {
          answerRecordSummary: {
            questionCount: 1,
            wrongQuestionCount: 1,
          },
        },
      },
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-dev-learning-suggestion",
      },
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
      },
    });

    const serializedResponse = JSON.stringify(response);
    expect(serializedResponse).not.toContain("selectedLabels");
    expect(serializedResponse).not.toContain("Question stem summary");
    expect(serializedResponse).not.toContain("RAW_PROMPT");
    expect(serializedResponse).not.toContain("RAW_ANSWER");
    expect(serializedResponse).not.toContain(
      "ai-call-log-dev-learning-suggestion",
    );
  });
});
