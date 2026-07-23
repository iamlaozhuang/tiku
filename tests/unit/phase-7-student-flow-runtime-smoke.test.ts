import { describe, expect, it } from "vitest";

import { createStudentFlowRuntimeRouteHandlers } from "@/server/services/student-flow-runtime";
import type { SessionService } from "@/server/services/session-service";
import type { StudentPaperRepository } from "@/server/repositories/student-paper-repository";
import type { PracticeRepository } from "@/server/repositories/practice-repository";
import type { MockExamRepository } from "@/server/repositories/mock-exam-repository";
import type { ExamReportRepository } from "@/server/repositories/exam-report-repository";

const now = new Date("2026-05-21T08:00:00.000Z");
const expiresAt = new Date("2027-05-21T08:00:00.000Z");
const bearerScheme = "Bearer";
const sessionCredential = "student-session-token";
const paperSnapshot = {
  name: "Phase 7 student smoke paper",
  paperSections: [
    {
      title: "Objective",
      paperQuestions: [
        {
          analysisRichText: "Choose A.",
          paperQuestionPublicId: "paper-question-dev-single-choice",
          questionPublicId: "question-dev-single-choice",
          questionType: "single_choice",
          score: "5.0",
          multiChoiceRule: "all_correct_only",
          scoringMethod: "auto_match",
          standardAnswerLabels: ["A"],
          standardAnswerRichText: "A",
        },
      ],
    },
  ],
};

function createSessionService(): SessionService {
  return {
    async login() {
      throw new Error("login should not be called by student flow routes");
    },
    async getCurrentSession(input) {
      if (input.authorization !== `${bearerScheme} ${sessionCredential}`) {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "OK",
        data: {
          session: {
            expiresAt: expiresAt.toISOString(),
          },
          user: {
            publicId: "user-dev-student",
            phone: "13900000002",
            name: "Dev Student",
            userType: "personal",
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: null,
            adminRoles: [],
          },
        },
      };
    },
  };
}

function createRequestAuthHeaders() {
  return {
    authorization: `${bearerScheme} ${sessionCredential}`,
  };
}

function createSessionCookieHeaders() {
  return {
    cookie: `theme=light; tiku_session=${encodeURIComponent(
      sessionCredential,
    )}`,
  };
}

function createStudentPaperRepository(): StudentPaperRepository {
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
    async listPublishedPapers() {
      return {
        rows: [
          {
            public_id: "paper-dev-theory",
            name: "Phase 7 student smoke paper",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            paper_type: "mock_paper",
            duration_minute: 30,
            total_score: "5.0",
            published_at: now,
            question_count: 1,
            paper_snapshot: paperSnapshot,
          },
        ],
        total: 1,
      };
    },
    async findPublishedPaperByPublicId() {
      return {
        public_id: "paper-dev-theory",
        name: "Phase 7 student smoke paper",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paper_type: "mock_paper",
        duration_minute: 30,
        total_score: "5.0",
        published_at: now,
        question_count: 1,
        paper_snapshot: paperSnapshot,
      };
    },
  };
}

function createPracticeRepository(): PracticeRepository {
  const practice = {
    id: 1001,
    public_id: "practice-dev-smoke",
    paper_public_id: "paper-dev-theory",
    profession: "monopoly" as const,
    level: 3,
    subject: "theory" as const,
    practice_status: "in_progress" as const,
    started_at: now,
    last_answered_at: null,
    expires_at: expiresAt,
    authorization_source: "personal_auth" as const,
    authorization_public_id: "personal_auth-dev-smoke",
    authorization_organization_public_id: null,
    quota_owner_type: "personal" as const,
    quota_owner_public_id: "user-dev-smoke",
    paper_snapshot: paperSnapshot,
  };

  return {
    async listEffectiveAuthorizationScopes() {
      return [
        {
          profession: "monopoly",
          level: 3,
          authorization_types: ["personal_auth"],
          expires_at: expiresAt,
          authorization_source: "personal_auth",
          authorization_public_id: "personal_auth-dev-smoke",
          organization_public_id: null,
          quota_owner_type: "personal",
          quota_owner_public_id: "user-dev-smoke",
        },
      ];
    },
    async findPublishedPaperByPublicId() {
      return {
        public_id: "paper-dev-theory",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paper_snapshot: paperSnapshot,
      };
    },
    async findActivePracticeByPaper() {
      return null;
    },
    async findPracticeByPublicId() {
      return practice;
    },
    async createPractice() {
      return practice;
    },
    async expirePractice() {},
    async terminatePractice() {
      return null;
    },
    async findAnswerRecordByPracticeAndQuestion() {
      return null;
    },
    async listAnswerRecordsByPractice() {
      return [];
    },
    async createPracticeAnswerRecord(input) {
      return {
        public_id: input.publicId,
        exam_mode: "practice",
        paper_question_public_id: input.paperQuestionPublicId,
        question_public_id: input.questionPublicId,
        answer_snapshot: input.answerSnapshot,
        answer_record_status: "scored",
        is_correct: true,
        score: "5.0",
        max_score: "5.0",
        answered_at: input.answeredAt,
        submitted_at: input.submittedAt,
      };
    },
    async updatePracticeLastAnsweredAt() {},
    async upsertMistakeBookFromWrongAnswer() {
      return { public_id: "mistake-book-dev-smoke" };
    },
    async upsertMistakeBookFromFavorite() {
      return { public_id: "mistake-book-dev-smoke-favorite" };
    },
  };
}

function createMockExamRepository(): MockExamRepository {
  const mockExam = {
    id: 2001,
    public_id: "mock-exam-dev-smoke",
    paper_public_id: "paper-dev-theory",
    profession: "monopoly" as const,
    level: 3,
    subject: "theory" as const,
    exam_status: "in_progress" as const,
    started_at: now,
    submitted_at: null,
    server_deadline_at: new Date("2026-05-21T08:30:00.000Z"),
    duration_minute: 30,
    terminated_at: null,
    termination_reason: null,
    objective_score: null,
    subjective_score: null,
    total_score: null,
    paper_snapshot: paperSnapshot,
    answered_count: 0,
    authorization_source: "personal_auth" as const,
    authorization_public_id: "personal_auth-dev-smoke",
    authorization_organization_public_id: null,
    quota_owner_type: "personal" as const,
    quota_owner_public_id: "user-dev-smoke",
  };

  return {
    async listEffectiveAuthorizationScopes() {
      return [
        {
          profession: "monopoly",
          level: 3,
          authorization_types: ["personal_auth"],
          expires_at: expiresAt,
          authorization_source: "personal_auth",
          authorization_public_id: "personal_auth-dev-smoke",
          organization_public_id: null,
          quota_owner_type: "personal",
          quota_owner_public_id: "user-dev-smoke",
        },
      ];
    },
    async findPublishedPaperByPublicId() {
      return {
        public_id: "paper-dev-theory",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        duration_minute: 30,
        paper_snapshot: paperSnapshot,
      };
    },
    async findActiveMockExamByPaper() {
      return null;
    },
    async findMockExamByPublicId() {
      return mockExam;
    },
    async createMockExam() {
      return mockExam;
    },
    async saveMockExamAnswerRecord(input) {
      return {
        status: "saved",
        answerRecord: {
          public_id: input.publicId,
          exam_mode: "mock_exam",
          paper_question_public_id: input.paperQuestionPublicId,
          question_public_id: input.questionPublicId,
          question_snapshot: input.questionSnapshot,
          answer_snapshot: input.answerSnapshot,
          answer_revision: input.expectedRevision + 1,
          client_operation_id: input.operationId,
          client_saved_at: input.answeredAt,
          answer_record_status: "saved",
          is_correct: null,
          score: null,
          max_score: "5.0",
          answered_at: input.answeredAt,
          submitted_at: null,
        },
      };
    },
    async listMockExamAnswerRecords() {
      return [
        {
          public_id: "answer-record-dev-smoke",
          exam_mode: "mock_exam",
          paper_question_public_id: "paper-question-dev-single-choice",
          question_public_id: "question-dev-single-choice",
          answer_snapshot: {
            selectedLabels: ["A"],
            textAnswer: null,
            savedFromClientAt: null,
          },
          answer_revision: 1,
          client_operation_id: null,
          client_saved_at: null,
          answer_record_status: "saved",
          is_correct: null,
          score: null,
          max_score: "5.0",
          answered_at: now,
          submitted_at: null,
        },
      ];
    },
    async supplementMissingMockExamAnswers() {
      return null;
    },
    async rebuildExistingExamReport() {
      return null;
    },
    async submitMockExam(input) {
      return {
        ...mockExam,
        exam_status: input.examStatus,
        submitted_at: input.submittedAt,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
        answered_count: 1,
      };
    },
    async applyMockExamScoringResults(input) {
      return {
        ...mockExam,
        exam_status: input.examStatus,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
        answered_count: 1,
      };
    },
    async terminateMockExam() {
      return null;
    },
  };
}

function createExamReportRepository(): ExamReportRepository {
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
        public_id: "exam-report-dev-smoke",
        exam_report_public_id: "exam-report-dev-smoke",
        mock_exam_public_id: "mock-exam-dev-smoke",
        paper_public_id: "paper-dev-theory",
        paper_name: "Phase 7 student smoke paper",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        exam_status: "completed",
        objective_score: "5.0",
        subjective_score: null,
        total_score: "5.0",
        duration_second: 300,
        report_snapshot: { paperPublicId: "paper-dev-theory" },
        learning_suggestion_snapshot: null,
        generated_at: now,
        started_at: new Date("2026-05-21T07:55:00.000Z"),
        created_at: now,
        updated_at: now,
      };
    },
    async findExamReportByMockExamPublicId() {
      return null;
    },
    async findSubmittedMockExamByPublicId() {
      return {
        public_id: "mock-exam-dev-smoke",
        paper_public_id: "paper-dev-theory",
        paper_snapshot: paperSnapshot,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        exam_status: "completed",
        started_at: new Date("2026-05-21T07:55:00.000Z"),
        submitted_at: now,
        objective_score: "5.0",
        subjective_score: null,
        total_score: "5.0",
      };
    },
    async listMockExamAnswerRecords() {
      return [
        {
          public_id: "answer-record-dev-smoke",
          paper_question_public_id: "paper-question-dev-single-choice",
          question_public_id: "question-dev-single-choice",
          question_snapshot: {
            paperQuestionPublicId: "paper-question-dev-single-choice",
          },
          answer_snapshot: {
            selectedLabels: ["A"],
            textAnswer: null,
            savedFromClientAt: null,
          },
          ai_scoring_evidence: null,
          answer_record_status: "saved",
          is_correct: true,
          score: "5.0",
          max_score: "5.0",
          answered_at: now,
          submitted_at: now,
        },
      ];
    },
    async createExamReport(input) {
      return {
        id: 3001,
        public_id: input.publicId,
        exam_report_public_id: input.publicId,
        mock_exam_public_id: input.mockExamPublicId,
        paper_public_id: input.paperPublicId,
        paper_name: input.paperName,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        exam_status: input.examStatus,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
        duration_second: input.durationSecond,
        report_snapshot: input.reportSnapshot,
        learning_suggestion_snapshot: input.learningSuggestionSnapshot,
        generated_at: input.generatedAt,
        started_at: new Date("2026-05-21T07:55:00.000Z"),
        created_at: input.generatedAt,
        updated_at: input.generatedAt,
      };
    },
    async rebuildExamReport(input) {
      return {
        id: 3001,
        public_id: input.publicId,
        exam_report_public_id: input.publicId,
        mock_exam_public_id: input.mockExamPublicId,
        paper_public_id: input.paperPublicId,
        paper_name: input.paperName,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        exam_status: input.examStatus,
        objective_score: input.objectiveScore,
        subjective_score: input.subjectiveScore,
        total_score: input.totalScore,
        duration_second: input.durationSecond,
        report_snapshot: input.reportSnapshot,
        learning_suggestion_snapshot: input.learningSuggestionSnapshot,
        generated_at: input.generatedAt,
        started_at: new Date("2026-05-21T07:55:00.000Z"),
        created_at: input.generatedAt,
        updated_at: input.generatedAt,
      };
    },
    async updateExamReportLearningSuggestionSnapshot() {},
  };
}

describe("phase 7 student flow runtime smoke", () => {
  it("requires an authenticated student session before returning student data", async () => {
    const handlers = createStudentFlowRuntimeRouteHandlers({
      sessionService: createSessionService(),
      studentPaperRepository: createStudentPaperRepository(),
      practiceRepository: createPracticeRepository(),
      mockExamRepository: createMockExamRepository(),
      examReportRepository: createExamReportRepository(),
      now: () => now,
      createPublicId: (prefix) => `${prefix}-dev-smoke`,
    });

    const response = await handlers.studentPapers.collection.GET(
      new Request("http://localhost/api/v1/student-papers"),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("uses the session cookie when listing student authorization scopes without a request auth value", async () => {
    const handlers = createStudentFlowRuntimeRouteHandlers({
      sessionService: createSessionService(),
      studentPaperRepository: createStudentPaperRepository(),
      practiceRepository: createPracticeRepository(),
      mockExamRepository: createMockExamRepository(),
      examReportRepository: createExamReportRepository(),
      now: () => now,
      createPublicId: (prefix) => `${prefix}-dev-smoke`,
    });

    const response = await handlers.studentPapers.scopes.GET(
      new Request("http://localhost/api/v1/student-papers/scopes", {
        headers: createSessionCookieHeaders(),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: [
        {
          profession: "monopoly",
          level: 3,
          authorizationTypes: ["personal_auth"],
        },
      ],
    });
  });

  it("runs the narrow paper, practice, mock_exam, and exam_report path with public ids", async () => {
    const handlers = createStudentFlowRuntimeRouteHandlers({
      sessionService: createSessionService(),
      studentPaperRepository: createStudentPaperRepository(),
      practiceRepository: createPracticeRepository(),
      mockExamRepository: createMockExamRepository(),
      examReportRepository: createExamReportRepository(),
      now: () => now,
      createPublicId: (prefix) => `${prefix}-dev-smoke`,
    });
    const authorizedHeaders = createRequestAuthHeaders();

    const paperResponse = await handlers.studentPapers.collection.GET(
      new Request(
        "http://localhost/api/v1/student-papers?profession=monopoly&level=3",
        { headers: authorizedHeaders },
      ),
    );
    const paperPayload = await paperResponse.json();
    expect(paperPayload.code).toBe(0);
    expect(paperPayload.data[0]).toMatchObject({
      publicId: "paper-dev-theory",
      profession: "monopoly",
      level: 3,
    });
    expect(paperPayload.data[0]).not.toHaveProperty("id");

    const practiceResponse = await handlers.practices.collection.POST(
      new Request("http://localhost/api/v1/practices", {
        method: "POST",
        headers: authorizedHeaders,
        body: JSON.stringify({ paperPublicId: "paper-dev-theory" }),
      }),
    );
    const practicePayload = await practiceResponse.json();
    expect(practicePayload.data.practice).toMatchObject({
      publicId: "practice-dev-smoke",
      paperPublicId: "paper-dev-theory",
    });

    const answerResponse = await handlers.practices.answers.POST(
      new Request(
        "http://localhost/api/v1/practices/practice-dev-smoke/answers",
        {
          method: "POST",
          headers: authorizedHeaders,
          body: JSON.stringify({
            paperQuestionPublicId: "paper-question-dev-single-choice",
            selectedLabels: ["A"],
            textAnswer: null,
            savedFromClientAt: null,
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "practice-dev-smoke" }) },
    );
    const answerPayload = await answerResponse.json();
    expect(answerPayload.data.feedback).toMatchObject({
      answerRecordPublicId: "answer_record-dev-smoke",
      isCorrect: true,
      score: "5.0",
    });

    const mockExamResponse = await handlers.mockExams.collection.POST(
      new Request("http://localhost/api/v1/mock-exams", {
        method: "POST",
        headers: authorizedHeaders,
        body: JSON.stringify({ paperPublicId: "paper-dev-theory" }),
      }),
    );
    const mockExamPayload = await mockExamResponse.json();
    expect(mockExamPayload.data.mockExam).toMatchObject({
      publicId: "mock-exam-dev-smoke",
      paperPublicId: "paper-dev-theory",
    });

    await handlers.mockExams.answers.POST(
      new Request(
        "http://localhost/api/v1/mock-exams/mock-exam-dev-smoke/answers",
        {
          method: "POST",
          headers: authorizedHeaders,
          body: JSON.stringify({
            paperQuestionPublicId: "paper-question-dev-single-choice",
            selectedLabels: ["A"],
            textAnswer: null,
            savedFromClientAt: null,
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "mock-exam-dev-smoke" }) },
    );

    const submitResponse = await handlers.mockExams.submit.POST(
      new Request(
        "http://localhost/api/v1/mock-exams/mock-exam-dev-smoke/submit",
        {
          method: "POST",
          headers: authorizedHeaders,
          body: JSON.stringify({ submittedFromClientAt: now.toISOString() }),
        },
      ),
      { params: Promise.resolve({ publicId: "mock-exam-dev-smoke" }) },
    );
    const submitPayload = await submitResponse.json();
    expect(submitPayload.data.mockExam).toMatchObject({
      publicId: "mock-exam-dev-smoke",
      examStatus: "completed",
    });

    const reportResponse = await handlers.examReports.generation.POST(
      new Request("http://localhost/api/v1/exam-reports", {
        method: "POST",
        headers: authorizedHeaders,
        body: JSON.stringify({ mockExamPublicId: "mock-exam-dev-smoke" }),
      }),
    );
    const reportPayload = await reportResponse.json();
    expect(reportPayload.data.examReport).toMatchObject({
      publicId: "exam_report-dev-smoke",
      mockExamPublicId: "mock-exam-dev-smoke",
      paperPublicId: "paper-dev-theory",
    });

    const reportDetailResponse = await handlers.examReports.detail.GET(
      new Request(
        "http://localhost/api/v1/exam-reports/exam-report-dev-smoke",
        {
          headers: authorizedHeaders,
        },
      ),
      { params: Promise.resolve({ publicId: "exam-report-dev-smoke" }) },
    );
    const reportDetailPayload = await reportDetailResponse.json();
    expect(reportDetailPayload.data.examReport).not.toHaveProperty("id");
    expect(JSON.stringify(reportDetailPayload)).not.toContain("3001");
  });
});
