"use client";

import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  ListChecks,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { StudentRichText } from "@/components/StudentRichText/StudentRichText";
import { projectPaperSnapshotForLearner } from "@/lib/learner-content-projection";
import { listPublishedPaperSnapshotQuestionEntries } from "@/lib/published-paper-snapshot";
import {
  STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX,
  STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
  createStudentUserScopedStorageKey,
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type { ApiPagination } from "@/server/contracts/api-response";
import type {
  ExamReportDetailDto,
  ExamReportListResultDto,
  ExamReportResultDto,
  ExamReportSummaryDto,
  ExamReportSnapshotDto,
} from "@/server/contracts/exam-report-contract";
import type {
  MockExamAnswerRecordDto,
  MockExamAnswerRecordResultDto,
  MockExamDto,
  MockExamResultDto,
  MockExamRetryScoringResultDto,
  MockExamSupplementResultDto,
  MockExamSubmitResultDto,
} from "@/server/contracts/mock-exam-contract";
import type { ExamStatus } from "@/server/models/student-experience";

type StudentPageState =
  | "ready"
  | "loading"
  | "error"
  | "not_found"
  | "authorization_expired";

type StudentMockExamPageProps = {
  state?: StudentPageState;
  paperPublicId?: string;
  mockExamPublicId?: string;
  authorizationSource?: string;
  authorizationPublicId?: string;
  mockExams?: StudentMockExamFixture[];
};

type StudentExamReportPageProps = {
  state?: StudentPageState;
  examReportPublicId?: string;
  examReports?: ExamReportDetailDto[];
};

type StudentExamReportListPageProps = {
  state?: StudentPageState;
  examReports?: ExamReportSummaryDto[];
};

type StudentMockExamFixture = {
  mockExam: MockExamDto;
  examReportPublicId: string;
};

type MockExamCachePayload = {
  cachedAt: string;
  mockExam: MockExamDto;
};

type MockExamPendingAnswer = {
  mockExamPublicId: string;
  paperQuestionPublicId: string;
  selectedLabels: string[];
  textAnswer: string | null;
  operationId: string;
  expectedRevision: number;
  savedFromClientAt: string;
  queuedAt: string;
};

type MockExamPendingAnswerQueuePayload = {
  queuedAt: string;
  answers: Record<string, MockExamPendingAnswer>;
};

const examReportPageSize = 20;
const emptyExamReportPagination: ApiPagination = {
  page: 1,
  pageSize: examReportPageSize,
  total: 0,
  sortBy: "startedAt",
  sortOrder: "desc",
};

function createMockExamCacheStorageKey(input: {
  paperPublicId?: string;
  mockExamPublicId: string;
}): string | null {
  try {
    return createStudentUserScopedStorageKey(
      STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
      input.paperPublicId ?? input.mockExamPublicId,
    );
  } catch {
    return null;
  }
}

function readCachedMockExam(
  cacheStorageKey: string | null,
): MockExamDto | null {
  if (cacheStorageKey === null) {
    return null;
  }

  try {
    const cachedValue = localStorage.getItem(cacheStorageKey);

    if (cachedValue === null) {
      return null;
    }

    const parsedValue = JSON.parse(
      cachedValue,
    ) as Partial<MockExamCachePayload>;

    return parsedValue.mockExam === undefined ? null : parsedValue.mockExam;
  } catch {
    return null;
  }
}

function writeCachedMockExam(
  cacheStorageKey: string | null,
  mockExam: MockExamDto,
): void {
  if (cacheStorageKey === null) {
    return;
  }

  try {
    localStorage.setItem(
      cacheStorageKey,
      JSON.stringify({
        cachedAt: new Date().toISOString(),
        mockExam: {
          ...mockExam,
          paperSnapshot: projectPaperSnapshotForLearner(mockExam.paperSnapshot),
        },
      } satisfies MockExamCachePayload),
    );
  } catch {
    // Local cache is a recovery supplement; runtime loading must not depend on it.
  }
}

function clearMockExamRuntimeStorage(input: {
  paperPublicId?: string;
  mockExamPublicId: string;
}): void {
  const cacheStorageKey = createMockExamCacheStorageKey(input);
  const answerQueueStorageKey = createMockExamAnswerQueueStorageKey(
    input.mockExamPublicId,
  );

  try {
    if (cacheStorageKey !== null) {
      localStorage.removeItem(cacheStorageKey);
    }

    if (answerQueueStorageKey !== null) {
      localStorage.removeItem(answerQueueStorageKey);
    }
  } catch {
    // Terminal server state is authoritative even when local cleanup is unavailable.
  }
}

function createMockExamAnswerQueueStorageKey(
  mockExamPublicId: string,
): string | null {
  try {
    return createStudentUserScopedStorageKey(
      STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX,
      mockExamPublicId,
    );
  } catch {
    return null;
  }
}

function readPendingMockExamAnswers(
  mockExamPublicId: string,
): Record<string, MockExamPendingAnswer> {
  try {
    const queueStorageKey =
      createMockExamAnswerQueueStorageKey(mockExamPublicId);

    if (queueStorageKey === null) {
      return {};
    }

    const queuedValue = localStorage.getItem(queueStorageKey);

    if (queuedValue === null) {
      return {};
    }

    const parsedValue = JSON.parse(
      queuedValue,
    ) as Partial<MockExamPendingAnswerQueuePayload>;

    return Object.fromEntries(
      Object.entries(parsedValue.answers ?? {}).filter(
        ([, answer]) =>
          typeof answer.operationId === "string" &&
          Number.isInteger(answer.expectedRevision) &&
          answer.expectedRevision >= 0,
      ),
    );
  } catch {
    return {};
  }
}

function writePendingMockExamAnswers(
  mockExamPublicId: string,
  answers: Record<string, MockExamPendingAnswer>,
): void {
  const queueStorageKey = createMockExamAnswerQueueStorageKey(mockExamPublicId);
  const answerEntries = Object.entries(answers);

  if (queueStorageKey === null) {
    return;
  }

  try {
    if (answerEntries.length === 0) {
      localStorage.removeItem(queueStorageKey);
      return;
    }

    localStorage.setItem(
      queueStorageKey,
      JSON.stringify({
        queuedAt: new Date().toISOString(),
        answers: Object.fromEntries(answerEntries),
      } satisfies MockExamPendingAnswerQueuePayload),
    );
  } catch {
    // Pending answer sync must not make the mock exam page unusable.
  }
}

async function sendMockExamAnswer(
  storedSessionValue: string | null,
  pendingAnswer: MockExamPendingAnswer,
) {
  return await fetchStudentApi<MockExamAnswerRecordResultDto>(
    `/api/v1/mock-exams/${pendingAnswer.mockExamPublicId}/answers`,
    storedSessionValue,
    {
      method: "POST",
      body: JSON.stringify({
        paperQuestionPublicId: pendingAnswer.paperQuestionPublicId,
        selectedLabels: pendingAnswer.selectedLabels,
        textAnswer: pendingAnswer.textAnswer,
        operationId: pendingAnswer.operationId,
        expectedRevision: pendingAnswer.expectedRevision,
        savedFromClientAt: pendingAnswer.savedFromClientAt,
      }),
    },
  );
}

async function sendMockExamAnswerSupplement(
  storedSessionValue: string | null,
  mockExamPublicId: string,
  pendingAnswers: MockExamPendingAnswer[],
) {
  return await fetchStudentApi<MockExamSupplementResultDto>(
    `/api/v1/mock-exams/${mockExamPublicId}/answers/supplement`,
    storedSessionValue,
    {
      method: "POST",
      body: JSON.stringify({
        answers: pendingAnswers.map((pendingAnswer) => ({
          paperQuestionPublicId: pendingAnswer.paperQuestionPublicId,
          selectedLabels: pendingAnswer.selectedLabels,
          textAnswer: pendingAnswer.textAnswer,
          operationId: pendingAnswer.operationId,
          expectedRevision: pendingAnswer.expectedRevision,
          savedFromClientAt: pendingAnswer.savedFromClientAt,
        })),
      }),
    },
  );
}

async function requestRuntimeExamReport(
  storedSessionValue: string | null,
  mockExamPublicId: string,
) {
  return await fetchStudentApi<ExamReportResultDto>(
    "/api/v1/exam-reports",
    storedSessionValue,
    {
      method: "POST",
      body: JSON.stringify({ mockExamPublicId }),
    },
  );
}

function canSupplementTerminalMockExam(mockExam: MockExamDto): boolean {
  return (
    ["completed", "scoring", "scoring_partial_failed"].includes(
      mockExam.examStatus,
    ) &&
    mockExam.submittedAt !== null &&
    mockExam.serverDeadlineAt !== null &&
    new Date(mockExam.submittedAt).getTime() >=
      new Date(mockExam.serverDeadlineAt).getTime()
  );
}

function getSavedAnswerSelection(
  pendingAnswer: MockExamPendingAnswer,
): string[] {
  return pendingAnswer.selectedLabels.length > 0
    ? pendingAnswer.selectedLabels
    : [pendingAnswer.textAnswer ?? ""];
}

function areAnswerSelectionsEqual(
  left: string[] | undefined,
  right: string[],
): boolean {
  return (
    left !== undefined &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function buildResumedMockExamAnswerState(
  answerRecords: MockExamAnswerRecordDto[],
  pendingAnswerByQuestion: Record<string, MockExamPendingAnswer>,
) {
  const selectedLabelsByQuestion: Record<string, string[]> = {};
  const textAnswerByQuestion: Record<string, string> = {};
  const savedAnswerByQuestion: Record<string, string[]> = {};
  const answerRevisionByQuestion: Record<string, number> = {};

  for (const answerRecord of answerRecords) {
    const paperQuestionPublicId = answerRecord.paperQuestionPublicId;
    const savedAnswer =
      answerRecord.answerSnapshot.selectedLabels.length > 0
        ? answerRecord.answerSnapshot.selectedLabels
        : [answerRecord.answerSnapshot.textAnswer ?? ""];

    selectedLabelsByQuestion[paperQuestionPublicId] =
      answerRecord.answerSnapshot.selectedLabels;
    textAnswerByQuestion[paperQuestionPublicId] =
      answerRecord.answerSnapshot.textAnswer ?? "";
    savedAnswerByQuestion[paperQuestionPublicId] = savedAnswer;
    answerRevisionByQuestion[paperQuestionPublicId] =
      answerRecord.answerRevision;
  }

  for (const pendingAnswer of Object.values(pendingAnswerByQuestion)) {
    selectedLabelsByQuestion[pendingAnswer.paperQuestionPublicId] =
      pendingAnswer.selectedLabels;
    textAnswerByQuestion[pendingAnswer.paperQuestionPublicId] =
      pendingAnswer.textAnswer ?? "";
    savedAnswerByQuestion[pendingAnswer.paperQuestionPublicId] =
      getSavedAnswerSelection(pendingAnswer);
    answerRevisionByQuestion[pendingAnswer.paperQuestionPublicId] = Math.max(
      answerRevisionByQuestion[pendingAnswer.paperQuestionPublicId] ?? 0,
      pendingAnswer.expectedRevision,
    );
  }

  return {
    selectedLabelsByQuestion,
    textAnswerByQuestion,
    savedAnswerByQuestion,
    answerRevisionByQuestion,
  };
}

type MockExamQuestionType =
  | "single_choice"
  | "multi_choice"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "case_analysis"
  | "calculation";

type MockExamPaperQuestion = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: MockExamQuestionType;
  paperSectionTitle: string;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  questionGroupTotalScore: string | null;
  materialTitle: string | null;
  materialRichText: string | null;
  stemRichText: string;
  questionOptions: MockExamQuestionOption[];
  score: string;
};

type MockExamQuestionOption = {
  label: string;
  content: string;
};

type MockExamQuestionPage = {
  pageKey: string;
  firstQuestionIndex: number;
  paperSectionTitle: string;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  questionGroupTotalScore: string | null;
  materialTitle: string | null;
  materialRichText: string | null;
  questions: MockExamPaperQuestion[];
};

type ReportQuestionResult = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: MockExamQuestionType | null;
  scoringMethod: string | null;
  paperSectionTitle: string | null;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  title: string;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  selectedAnswer: string | null;
  standardAnswer: string | null;
  fillBlankAnswers: FillBlankReportAnswer[];
  mistakeBookPublicId: string | null;
};

type FillBlankReportAnswer = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

type KnowledgeNodeAnalysisResult = {
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  confirmationStatus: "confirmed";
  bindingSource: "formal_question_binding";
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  score: string;
  maxScore: string;
  scoreRate: number;
  accuracyRate: number;
  weaknessRank: number;
  questionPublicIds: string[];
};

type ParsedReportSnapshot = {
  totalScoreText: string;
  accuracyText: string;
  scoreSummaryText: string;
  questionTypeSummaryText: string | null;
  paperSectionSummaryText: string | null;
  questionGroupSummaryText: string | null;
  knowledgeNodeSummaryText: string | null;
  knowledgeNodeWeaknessSummaryText: string | null;
  knowledgeNodeAnalysis: KnowledgeNodeAnalysisResult[];
  knowledgeNodeAnalyticsStatus: "available" | "unavailable";
  questionResults: ReportQuestionResult[];
};

type ReportQuestionResultGroup = {
  groupKey: string;
  paperSectionTitle: string | null;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  questionResults: ReportQuestionResult[];
};

type ParsedLearningSuggestion = {
  summaryText: string | null;
  suggestionItems: ParsedLearningSuggestionItem[];
  citations: ParsedLearningSuggestionCitation[];
};

type ParsedLearningSuggestionItem = {
  title: string | null;
  detail: string;
};

type ParsedLearningSuggestionCitation = {
  title: string;
  headingPath: string | null;
};

type ScoringProgressStatus = Extract<
  ExamStatus,
  "scoring" | "scoring_partial_failed"
>;

const examStatusLabels: Record<ExamStatus, string> = {
  completed: "已完成",
  in_progress: "进行中",
  scoring: "评分中",
  scoring_partial_failed: "评分部分失败",
  terminated: "已终止",
};

const questionTypeLabels: Partial<Record<MockExamQuestionType, string>> = {
  case_analysis: "案例分析题",
  calculation: "计算题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

const scoringMethodLabels: Record<string, string> = {
  ai_scoring: "AI 评分",
  auto_match: "自动匹配",
};

const emptyAnswerSelections: Record<string, string[]> = {};
const emptyTextAnswers: Record<string, string> = {};

function isStudentResourceNotFoundResponse(payload: { code: number }): boolean {
  return payload.code === 404001;
}

function createMockExamDto(
  mockExam: Omit<MockExamDto, "questionCount">,
): MockExamDto {
  return {
    ...mockExam,
    questionCount: extractMockExamQuestions(mockExam.paperSnapshot).length,
  };
}

const marketingTheoryMockExam = createMockExamDto({
  publicId: "mock-exam-marketing-theory-001",
  paperPublicId: "paper-marketing-theory-mock-001",
  profession: "marketing",
  level: 3,
  subject: "theory",
  examStatus: "in_progress",
  startedAt: "2026-05-20T00:00:00.000Z",
  submittedAt: null,
  serverNow: "2026-05-20T00:15:00.000Z",
  serverDeadlineAt: "2026-05-20T01:30:00.000Z",
  durationMinute: 90,
  answeredCount: 0,
  paperSnapshot: {
    paperPublicId: "paper-marketing-theory-mock-001",
    name: "营销理论模考卷 A",
    totalScore: "100",
    paperSections: [
      {
        title: "一、单项选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper-question-mock-marketing-001",
            questionPublicId: "question-mock-marketing-001",
            questionType: "single_choice",
            paperSectionTitle: "一、单项选择题",
            stemRichText: "识别客户真实购买动机时，最应优先开展哪项工作？",
            questionOptions: [
              { label: "A", content: "市场细分" },
              { label: "B", content: "客户需求分析" },
              { label: "C", content: "渠道库存盘点" },
              { label: "D", content: "品牌陈列调整" },
            ],
            standardAnswerRichText: "正确答案：B. 客户需求分析",
            analysisRichText: "解析：客户需求分析用于识别客户真实购买动机。",
            score: "2.0",
          },
          {
            paperQuestionPublicId: "paper-question-mock-marketing-002",
            questionPublicId: "question-mock-marketing-002",
            questionType: "single_choice",
            paperSectionTitle: "一、单项选择题",
            stemRichText: "以下哪项属于服务复盘动作？",
            questionOptions: [
              { label: "A", content: "记录客户反馈并形成改进清单" },
              { label: "B", content: "临时增加促销费用" },
              { label: "C", content: "删除异常订单" },
              { label: "D", content: "忽略配送时效" },
            ],
            standardAnswerRichText: "正确答案：A. 记录客户反馈并形成改进清单",
            analysisRichText: "解析：复盘需要沉淀问题、责任和改进动作。",
            score: "2.0",
          },
          {
            paperQuestionPublicId: "paper-question-mock-marketing-003",
            questionPublicId: "question-mock-marketing-003",
            questionType: "true_false",
            paperSectionTitle: "二、判断题",
            stemRichText: "判断：客户画像应定期复核。",
            questionOptions: [
              { label: "A", content: "正确" },
              { label: "B", content: "错误" },
            ],
            standardAnswerRichText: "正确答案：A. 正确",
            analysisRichText: "解析：客户信息变化会影响服务策略。",
            score: "1.0",
          },
        ],
      },
    ],
  },
});

const completedMarketingReport: ExamReportDetailDto = {
  publicId: "exam-report-marketing-theory-001",
  examReportPublicId: "exam-report-marketing-theory-001",
  mockExamPublicId: "mock-exam-marketing-theory-001",
  paperPublicId: "paper-marketing-theory-mock-001",
  paperName: "营销理论模考卷 A",
  profession: "marketing",
  level: 3,
  subject: "theory",
  examStatus: "completed",
  objectiveScore: "86.0",
  subjectiveScore: null,
  totalScore: "86.0",
  durationSecond: 2700,
  startedAt: "2026-05-20T00:00:00.000Z",
  generatedAt: "2026-05-20T01:35:00.000Z",
  reportSnapshot: {
    totalScoreText: "总分 86.0",
    accuracyText: "正确率 67%",
    scoreSummaryText: "得分 86.0 / 100",
    questionResults: [
      {
        paperQuestionPublicId: "paper-question-mock-marketing-001",
        questionPublicId: "question-mock-marketing-001",
        title: "客户需求分析",
        isCorrect: false,
        score: "0.0",
        maxScore: "2.0",
        selectedAnswer: "A",
        standardAnswer: "B",
        mistakeBookPublicId: "mistake-book-marketing-101",
      },
      {
        paperQuestionPublicId: "paper-question-mock-marketing-002",
        questionPublicId: "question-mock-marketing-002",
        title: "服务复盘动作",
        isCorrect: true,
        score: "2.0",
        maxScore: "2.0",
        selectedAnswer: "A",
        standardAnswer: "A",
        mistakeBookPublicId: null,
      },
    ],
  },
  learningSuggestionSnapshot: null,
  learningSuggestionLifecycle: {
    status: "pending",
    failureCategory: null,
    canRetry: false,
  },
};

const scoringMarketingReport: ExamReportDetailDto = {
  ...completedMarketingReport,
  publicId: "exam-report-marketing-scoring-001",
  mockExamPublicId: "mock-exam-marketing-scoring-001",
  examStatus: "scoring",
  objectiveScore: null,
  totalScore: null,
  reportSnapshot: {
    totalScoreText: "总分生成中",
    accuracyText: "正确率生成中",
    scoreSummaryText: "得分生成中",
    questionResults: [],
  },
};

const partialMarketingReport: ExamReportDetailDto = {
  ...completedMarketingReport,
  publicId: "exam-report-marketing-partial-001",
  mockExamPublicId: "mock-exam-marketing-partial-001",
  examStatus: "scoring_partial_failed",
  reportSnapshot: {
    ...completedMarketingReport.reportSnapshot,
    scoreSummaryText: "得分 76.0 / 100",
  },
};

export const studentMockExamFixture: {
  mockExams: StudentMockExamFixture[];
} = {
  mockExams: [
    {
      mockExam: marketingTheoryMockExam,
      examReportPublicId: "exam-report-marketing-theory-001",
    },
  ],
};

export const studentExamReportFixture: {
  examReports: ExamReportDetailDto[];
} = {
  examReports: [
    completedMarketingReport,
    scoringMarketingReport,
    partialMarketingReport,
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringField(
  sourceRecord: Record<string, unknown>,
  key: string,
): string | null {
  return typeof sourceRecord[key] === "string" ? sourceRecord[key] : null;
}

function getNonNegativeDecimalField(
  sourceRecord: Record<string, unknown>,
  key: string,
): string | null {
  const value = getStringField(sourceRecord, key);

  return value !== null && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)
    ? value
    : null;
}

function getQuestionOptions(value: unknown): MockExamQuestionOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((questionOption): MockExamQuestionOption[] => {
    if (!isRecord(questionOption) || typeof questionOption.label !== "string") {
      return [];
    }

    const content =
      getStringField(questionOption, "content") ??
      getStringField(questionOption, "contentRichText");

    return content === null ? [] : [{ label: questionOption.label, content }];
  });
}

function getQuestionOptionSource(value: Record<string, unknown>): unknown {
  return Array.isArray(value.questionOptions)
    ? value.questionOptions
    : value.options;
}

function normalizeMockExamQuestionType(
  value: string | null,
): MockExamQuestionType | null {
  switch (value) {
    case "single_choice":
    case "multi_choice":
    case "true_false":
    case "fill_blank":
    case "short_answer":
    case "case_analysis":
    case "calculation":
      return value;
    case "multiple_choice":
      return "multi_choice";
    case "subjective":
      return "short_answer";
    default:
      return null;
  }
}

function getFillBlankReportAnswers(value: unknown): FillBlankReportAnswer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((fillBlankAnswer): FillBlankReportAnswer[] => {
      if (
        !isRecord(fillBlankAnswer) ||
        typeof fillBlankAnswer.blankKey !== "string" ||
        !Array.isArray(fillBlankAnswer.standardAnswers) ||
        typeof fillBlankAnswer.score !== "string" ||
        typeof fillBlankAnswer.sortOrder !== "number"
      ) {
        return [];
      }

      const standardAnswers = fillBlankAnswer.standardAnswers.filter(
        (standardAnswer): standardAnswer is string =>
          typeof standardAnswer === "string" && standardAnswer.length > 0,
      );

      return standardAnswers.length === 0
        ? []
        : [
            {
              blankKey: fillBlankAnswer.blankKey,
              standardAnswers,
              score: fillBlankAnswer.score,
              sortOrder: fillBlankAnswer.sortOrder,
            },
          ];
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function formatKnowledgeNodeWeaknessLabel(
  analysisItem: KnowledgeNodeAnalysisResult,
): string {
  return analysisItem.pathName;
}

function formatKnowledgeNodeWeaknessSummaryText(
  summaryText: string | null,
): string | null {
  if (summaryText === null) {
    return null;
  }

  return /knowledge[_-]?node|public[_-]?/iu.test(summaryText)
    ? "按得分率和正确率排序展示薄弱知识点。"
    : summaryText;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function getKnowledgeNodeAnalysis(
  value: unknown,
): KnowledgeNodeAnalysisResult[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const analysisItems: KnowledgeNodeAnalysisResult[] = [];
  for (const analysisItem of value) {
    if (
      !isRecord(analysisItem) ||
      typeof analysisItem.knowledgeNodePublicId !== "string" ||
      typeof analysisItem.name !== "string" ||
      typeof analysisItem.pathName !== "string" ||
      analysisItem.confirmationStatus !== "confirmed" ||
      analysisItem.bindingSource !== "formal_question_binding" ||
      typeof analysisItem.questionCount !== "number" ||
      typeof analysisItem.answeredCount !== "number" ||
      typeof analysisItem.correctCount !== "number" ||
      typeof analysisItem.score !== "string" ||
      typeof analysisItem.maxScore !== "string" ||
      typeof analysisItem.scoreRate !== "number" ||
      typeof analysisItem.accuracyRate !== "number" ||
      typeof analysisItem.weaknessRank !== "number" ||
      !Array.isArray(analysisItem.questionPublicIds) ||
      !analysisItem.questionPublicIds.every(
        (publicId): publicId is string =>
          typeof publicId === "string" && publicId.length > 0,
      )
    ) {
      return null;
    }

    analysisItems.push({
      knowledgeNodePublicId: analysisItem.knowledgeNodePublicId,
      name: analysisItem.name,
      pathName: analysisItem.pathName,
      confirmationStatus: analysisItem.confirmationStatus,
      bindingSource: analysisItem.bindingSource,
      questionCount: analysisItem.questionCount,
      answeredCount: analysisItem.answeredCount,
      correctCount: analysisItem.correctCount,
      score: analysisItem.score,
      maxScore: analysisItem.maxScore,
      scoreRate: analysisItem.scoreRate,
      accuracyRate: analysisItem.accuracyRate,
      weaknessRank: analysisItem.weaknessRank,
      questionPublicIds: analysisItem.questionPublicIds,
    });
  }

  return analysisItems;
}

function isOptionMockExamQuestion(questionType: MockExamQuestionType): boolean {
  return (
    questionType === "single_choice" ||
    questionType === "multi_choice" ||
    questionType === "true_false"
  );
}

function isTextMockExamQuestion(questionType: MockExamQuestionType): boolean {
  return (
    questionType === "fill_blank" ||
    questionType === "short_answer" ||
    questionType === "case_analysis" ||
    questionType === "calculation"
  );
}

function mapMockExamQuestion(
  value: unknown,
  fallbackPaperSectionTitle: string | null,
  questionGroup: Record<string, unknown> | null,
): MockExamPaperQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperQuestionPublicId = getStringField(value, "paperQuestionPublicId");
  const questionPublicId = getStringField(value, "questionPublicId");
  const questionType = normalizeMockExamQuestionType(
    getStringField(value, "questionType"),
  );
  const paperSectionTitle =
    getStringField(value, "paperSectionTitle") ?? fallbackPaperSectionTitle;
  const stemRichText = getStringField(value, "stemRichText");
  const materialSnapshot =
    questionGroup !== null && isRecord(questionGroup.materialSnapshot)
      ? questionGroup.materialSnapshot
      : isRecord(value.materialSnapshot)
        ? value.materialSnapshot
        : null;

  if (
    paperQuestionPublicId === null ||
    questionPublicId === null ||
    paperSectionTitle === null ||
    stemRichText === null ||
    questionType === null
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    questionPublicId,
    questionType,
    paperSectionTitle,
    questionGroupPublicId:
      questionGroup === null
        ? getStringField(value, "questionGroupPublicId")
        : getStringField(questionGroup, "publicId"),
    questionGroupTitle:
      questionGroup === null
        ? getStringField(value, "questionGroupTitle")
        : getStringField(questionGroup, "title"),
    questionGroupTotalScore:
      questionGroup === null
        ? getNonNegativeDecimalField(value, "questionGroupTotalScore")
        : getNonNegativeDecimalField(questionGroup, "totalScore"),
    materialTitle:
      materialSnapshot === null
        ? null
        : getStringField(materialSnapshot, "title"),
    materialRichText:
      materialSnapshot === null
        ? null
        : getStringField(materialSnapshot, "contentRichText"),
    stemRichText,
    questionOptions: getQuestionOptions(getQuestionOptionSource(value)),
    score: getStringField(value, "score") ?? "0.0",
  };
}

function extractMockExamQuestionPages(
  paperSnapshot: Record<string, unknown>,
): MockExamQuestionPage[] {
  const questions = listPublishedPaperSnapshotQuestionEntries(paperSnapshot)
    .map(({ paperSection, questionGroup, paperQuestion }) =>
      mapMockExamQuestion(
        paperQuestion,
        getStringField(paperSection, "paperSectionTitle") ??
          getStringField(paperSection, "title"),
        questionGroup,
      ),
    )
    .filter((question): question is MockExamPaperQuestion => question !== null);

  const groupMetadataByPublicId = new Map<
    string,
    {
      paperSectionTitle: string;
      questionGroupTitle: string;
      questionGroupTotalScore: string | null;
      materialTitle: string | null;
      materialRichText: string | null;
    }
  >();
  const invalidGroupPublicIds = new Set<string>();
  const completedGroupPublicIds = new Set<string>();
  let activeGroupPublicId: string | null = null;

  for (const question of questions) {
    const questionGroupPublicId = question.questionGroupPublicId;

    if (questionGroupPublicId !== activeGroupPublicId) {
      if (activeGroupPublicId !== null) {
        completedGroupPublicIds.add(activeGroupPublicId);
      }

      if (
        questionGroupPublicId !== null &&
        completedGroupPublicIds.has(questionGroupPublicId)
      ) {
        invalidGroupPublicIds.add(questionGroupPublicId);
      }

      activeGroupPublicId = questionGroupPublicId;
    }

    if (
      questionGroupPublicId === null ||
      question.questionGroupTitle === null
    ) {
      if (questionGroupPublicId !== null) {
        invalidGroupPublicIds.add(questionGroupPublicId);
      }
      continue;
    }

    const previousMetadata = groupMetadataByPublicId.get(questionGroupPublicId);

    if (
      previousMetadata !== undefined &&
      (previousMetadata.paperSectionTitle !== question.paperSectionTitle ||
        previousMetadata.questionGroupTitle !== question.questionGroupTitle ||
        previousMetadata.questionGroupTotalScore !==
          question.questionGroupTotalScore ||
        previousMetadata.materialTitle !== question.materialTitle ||
        previousMetadata.materialRichText !== question.materialRichText)
    ) {
      invalidGroupPublicIds.add(questionGroupPublicId);
      continue;
    }

    groupMetadataByPublicId.set(questionGroupPublicId, {
      paperSectionTitle: question.paperSectionTitle,
      questionGroupTitle: question.questionGroupTitle,
      questionGroupTotalScore: question.questionGroupTotalScore,
      materialTitle: question.materialTitle,
      materialRichText: question.materialRichText,
    });
  }

  return questions.reduce<MockExamQuestionPage[]>((pages, question) => {
    const previousPage = pages.at(-1);
    const firstQuestionIndex =
      previousPage === undefined
        ? 0
        : previousPage.firstQuestionIndex + previousPage.questions.length;
    const canGroup =
      question.questionGroupPublicId !== null &&
      question.questionGroupTitle !== null &&
      !invalidGroupPublicIds.has(question.questionGroupPublicId);

    if (!canGroup) {
      return [
        ...pages,
        {
          pageKey: `paper_question:${question.paperQuestionPublicId}`,
          firstQuestionIndex,
          paperSectionTitle: question.paperSectionTitle,
          questionGroupPublicId: null,
          questionGroupTitle: null,
          questionGroupTotalScore: null,
          materialTitle: question.materialTitle,
          materialRichText: question.materialRichText,
          questions: [question],
        },
      ];
    }

    const pageKey = `question_group:${question.questionGroupPublicId}`;

    if (previousPage?.pageKey === pageKey) {
      return [
        ...pages.slice(0, -1),
        {
          ...previousPage,
          questions: [...previousPage.questions, question],
        },
      ];
    }

    return [
      ...pages,
      {
        pageKey,
        firstQuestionIndex,
        paperSectionTitle: question.paperSectionTitle,
        questionGroupPublicId: question.questionGroupPublicId,
        questionGroupTitle: question.questionGroupTitle,
        questionGroupTotalScore: question.questionGroupTotalScore,
        materialTitle: question.materialTitle,
        materialRichText: question.materialRichText,
        questions: [question],
      },
    ];
  }, []);
}

function extractMockExamQuestions(
  paperSnapshot: Record<string, unknown>,
): MockExamPaperQuestion[] {
  return extractMockExamQuestionPages(paperSnapshot).flatMap(
    (page) => page.questions,
  );
}

function getPaperName(mockExam: MockExamDto): string {
  const paperName = mockExam.paperSnapshot.name;

  return typeof paperName === "string" ? paperName : "模拟考试";
}

function getRemainingMinute(
  mockExam: MockExamDto,
  currentServerTimeMillisecond: number,
): number | null {
  if (mockExam.serverDeadlineAt === null) {
    return null;
  }

  const deadlineTime = new Date(mockExam.serverDeadlineAt).getTime();
  const remainingMillisecond = deadlineTime - currentServerTimeMillisecond;

  return Math.max(Math.ceil(remainingMillisecond / 60000), 0);
}

function formatDate(value: string | null): string {
  return value === null ? "未记录" : value.slice(0, 10);
}

function formatDurationSecond(durationSecond: number): string {
  const normalizedDurationSecond = Math.max(Math.floor(durationSecond), 0);

  if (normalizedDurationSecond === 0) {
    return "0 秒";
  }

  const hour = Math.floor(normalizedDurationSecond / 3600);
  const minute = Math.floor((normalizedDurationSecond % 3600) / 60);
  const second = normalizedDurationSecond % 60;
  const durationParts: string[] = [];

  if (hour > 0) {
    durationParts.push(`${hour} 小时`);
  }

  if (minute > 0) {
    durationParts.push(`${minute} 分`);
  }

  if (second > 0) {
    durationParts.push(`${second} 秒`);
  }

  return durationParts.join(" ");
}

function includesLabel(selectedLabels: string[], label: string): boolean {
  return selectedLabels.includes(label);
}

function StudentStatusMessage({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  testId?: string;
}) {
  return (
    <section
      data-testid={testId}
      className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-text-primary text-lg font-semibold">
          {title}
        </h2>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
      </div>
      {action}
    </section>
  );
}

function StudentMockExamLoading() {
  return (
    <section className="space-y-4 p-4" aria-busy="true">
      <p className="text-text-secondary text-sm">正在加载模拟考试</p>
      <div className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="bg-border h-6 w-2/3 animate-pulse rounded" />
        <div className="bg-border h-24 w-full animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-border h-10 animate-pulse rounded-lg" />
          <div className="bg-border h-10 animate-pulse rounded-lg" />
          <div className="bg-border h-10 animate-pulse rounded-lg" />
        </div>
      </div>
    </section>
  );
}

function StudentExamReportLoading() {
  return (
    <section className="space-y-4 p-4" aria-busy="true">
      <p className="text-text-secondary text-sm">正在加载考试报告</p>
      <div className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="bg-border h-8 w-1/2 animate-pulse rounded" />
        <div className="bg-border h-20 w-full animate-pulse rounded-lg" />
      </div>
    </section>
  );
}

function MockExamQuestionPanel({
  question,
  selectedLabels,
  isSaved,
  onToggleLabel,
  onSaveAnswer,
}: {
  question: MockExamPaperQuestion;
  selectedLabels: string[];
  isSaved: boolean;
  onToggleLabel(label: string): void;
  onSaveAnswer(): void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {question.questionOptions.map((questionOption) => {
          const isSelected = includesLabel(
            selectedLabels,
            questionOption.label,
          );

          return (
            <button
              key={questionOption.label}
              type="button"
              onClick={() => onToggleLabel(questionOption.label)}
              className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-transform active:scale-[0.98] ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-primary border"
              }`}
            >
              <span>
                {questionOption.label}. {questionOption.content}
              </span>
              {isSelected ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selectedLabels.length === 0}
        onClick={onSaveAnswer}
        className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        保存本题作答
      </button>

      {isSaved ? (
        <p className="text-success bg-success/10 rounded-lg px-3 py-2 text-sm font-medium">
          本题作答已保存
        </p>
      ) : null}
    </div>
  );
}

function MockExamTextAnswerPanel({
  textAnswer,
  isSaved,
  onChangeTextAnswer,
  onSaveAnswer,
}: {
  textAnswer: string;
  isSaved: boolean;
  onChangeTextAnswer(value: string): void;
  onSaveAnswer(): void;
}) {
  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">文字答案</span>
        <textarea
          aria-label="文字答案"
          value={textAnswer}
          onChange={(event) => onChangeTextAnswer(event.target.value)}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-28 rounded-lg border px-3 py-2 text-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-3"
        />
      </label>

      <button
        type="button"
        disabled={textAnswer.trim().length === 0}
        onClick={onSaveAnswer}
        className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        保存本题作答
      </button>

      {isSaved ? (
        <p className="text-success bg-success/10 rounded-lg px-3 py-2 text-sm font-medium">
          本题作答已保存
        </p>
      ) : null}
    </div>
  );
}

function parseReportSnapshot(
  reportSnapshot: ExamReportSnapshotDto,
): ParsedReportSnapshot {
  const questionResults = Array.isArray(reportSnapshot.questionResults)
    ? reportSnapshot.questionResults
    : [];
  const parsedKnowledgeNodeAnalysis = getKnowledgeNodeAnalysis(
    reportSnapshot.knowledgeNodeAnalysis,
  );
  const knowledgeNodeAnalyticsStatus =
    reportSnapshot.knowledgeNodeAnalyticsStatus === "available" &&
    parsedKnowledgeNodeAnalysis !== null
      ? "available"
      : "unavailable";

  return {
    totalScoreText:
      typeof reportSnapshot.totalScoreText === "string"
        ? reportSnapshot.totalScoreText
        : "总分生成中",
    accuracyText:
      typeof reportSnapshot.accuracyText === "string"
        ? reportSnapshot.accuracyText
        : "正确率生成中",
    scoreSummaryText:
      typeof reportSnapshot.scoreSummaryText === "string"
        ? reportSnapshot.scoreSummaryText
        : "得分生成中",
    questionTypeSummaryText:
      typeof reportSnapshot.questionTypeSummaryText === "string"
        ? reportSnapshot.questionTypeSummaryText
        : null,
    paperSectionSummaryText:
      typeof reportSnapshot.paperSectionSummaryText === "string"
        ? reportSnapshot.paperSectionSummaryText
        : null,
    questionGroupSummaryText:
      typeof reportSnapshot.questionGroupSummaryText === "string"
        ? reportSnapshot.questionGroupSummaryText
        : null,
    knowledgeNodeSummaryText:
      typeof reportSnapshot.knowledgeNodeSummaryText === "string"
        ? reportSnapshot.knowledgeNodeSummaryText
        : null,
    knowledgeNodeWeaknessSummaryText:
      typeof reportSnapshot.knowledgeNodeWeaknessSummaryText === "string"
        ? reportSnapshot.knowledgeNodeWeaknessSummaryText
        : null,
    knowledgeNodeAnalyticsStatus,
    knowledgeNodeAnalysis:
      knowledgeNodeAnalyticsStatus === "available"
        ? (parsedKnowledgeNodeAnalysis ?? [])
        : [],
    questionResults: questionResults.flatMap(
      (questionResult): ReportQuestionResult[] => {
        if (
          !isRecord(questionResult) ||
          typeof questionResult.paperQuestionPublicId !== "string" ||
          typeof questionResult.questionPublicId !== "string" ||
          typeof questionResult.title !== "string" ||
          !(
            typeof questionResult.isCorrect === "boolean" ||
            questionResult.isCorrect === null
          ) ||
          !(
            typeof questionResult.score === "string" ||
            questionResult.score === null
          ) ||
          typeof questionResult.maxScore !== "string" ||
          !(
            typeof questionResult.selectedAnswer === "string" ||
            questionResult.selectedAnswer === null
          ) ||
          !(
            typeof questionResult.standardAnswer === "string" ||
            questionResult.standardAnswer === null
          ) ||
          !(
            typeof questionResult.mistakeBookPublicId === "string" ||
            questionResult.mistakeBookPublicId === null
          )
        ) {
          return [];
        }

        return [
          {
            paperQuestionPublicId: questionResult.paperQuestionPublicId,
            questionPublicId: questionResult.questionPublicId,
            questionType: normalizeMockExamQuestionType(
              getStringField(questionResult, "questionType"),
            ),
            scoringMethod: getStringField(questionResult, "scoringMethod"),
            paperSectionTitle: getStringField(
              questionResult,
              "paperSectionTitle",
            ),
            questionGroupPublicId: getStringField(
              questionResult,
              "questionGroupPublicId",
            ),
            questionGroupTitle: getStringField(
              questionResult,
              "questionGroupTitle",
            ),
            title: questionResult.title,
            isCorrect: questionResult.isCorrect,
            score: questionResult.score,
            maxScore: questionResult.maxScore,
            selectedAnswer: questionResult.selectedAnswer,
            standardAnswer: questionResult.standardAnswer,
            fillBlankAnswers: getFillBlankReportAnswers(
              questionResult.fillBlankAnswers,
            ),
            mistakeBookPublicId: questionResult.mistakeBookPublicId,
          },
        ];
      },
    ),
  };
}

function parseReportScore(value: string | null): number | null {
  if (value === null || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    return null;
  }

  const score = Number(value);

  return Number.isFinite(score) && score >= 0 ? score : null;
}

function formatReportScoreTotal(value: number): string {
  return value.toFixed(1);
}

function getReportQuestionGroupScoreText(
  questionResults: ReportQuestionResult[],
): string {
  let score = 0;
  let maxScore = 0;
  let hasPendingScore = false;

  for (const questionResult of questionResults) {
    const questionMaxScore = parseReportScore(questionResult.maxScore);
    const questionScore = parseReportScore(questionResult.score);

    if (
      questionMaxScore === null ||
      (questionResult.score !== null && questionScore === null) ||
      (questionScore !== null && questionScore > questionMaxScore)
    ) {
      return "题组小计生成中";
    }

    maxScore += questionMaxScore;

    if (questionScore === null) {
      hasPendingScore = true;
    } else {
      score += questionScore;
    }
  }

  if (hasPendingScore) {
    return `题组小计 待评分 / ${formatReportScoreTotal(maxScore)}`;
  }

  return `题组小计 ${formatReportScoreTotal(score)} / ${formatReportScoreTotal(maxScore)}`;
}

function groupReportQuestionResults(
  questionResults: ReportQuestionResult[],
): ReportQuestionResultGroup[] {
  const groupMetadataByPublicId = new Map<
    string,
    { paperSectionTitle: string; questionGroupTitle: string }
  >();
  const invalidGroupPublicIds = new Set<string>();
  const completedGroupPublicIds = new Set<string>();
  let activeGroupPublicId: string | null = null;

  questionResults.forEach((questionResult) => {
    const questionGroupPublicId = questionResult.questionGroupPublicId;

    if (questionGroupPublicId !== activeGroupPublicId) {
      if (activeGroupPublicId !== null) {
        completedGroupPublicIds.add(activeGroupPublicId);
      }

      if (
        questionGroupPublicId !== null &&
        completedGroupPublicIds.has(questionGroupPublicId)
      ) {
        invalidGroupPublicIds.add(questionGroupPublicId);
      }

      activeGroupPublicId = questionGroupPublicId;
    }

    if (questionResult.questionGroupPublicId === null) {
      return;
    }

    if (
      questionResult.paperSectionTitle === null ||
      questionResult.questionGroupTitle === null
    ) {
      invalidGroupPublicIds.add(questionResult.questionGroupPublicId);
      return;
    }

    const previousMetadata = groupMetadataByPublicId.get(
      questionResult.questionGroupPublicId,
    );

    if (
      previousMetadata !== undefined &&
      (previousMetadata.paperSectionTitle !==
        questionResult.paperSectionTitle ||
        previousMetadata.questionGroupTitle !==
          questionResult.questionGroupTitle)
    ) {
      invalidGroupPublicIds.add(questionResult.questionGroupPublicId);
      return;
    }

    groupMetadataByPublicId.set(questionResult.questionGroupPublicId, {
      paperSectionTitle: questionResult.paperSectionTitle,
      questionGroupTitle: questionResult.questionGroupTitle,
    });
  });

  return questionResults.reduce<ReportQuestionResultGroup[]>(
    (groups, questionResult) => {
      const canGroup =
        questionResult.questionGroupPublicId !== null &&
        questionResult.questionGroupTitle !== null &&
        questionResult.paperSectionTitle !== null &&
        !invalidGroupPublicIds.has(questionResult.questionGroupPublicId);

      if (!canGroup) {
        return [
          ...groups,
          {
            groupKey: `paper_question:${questionResult.paperQuestionPublicId}`,
            paperSectionTitle: questionResult.paperSectionTitle,
            questionGroupPublicId: null,
            questionGroupTitle: null,
            questionResults: [questionResult],
          },
        ];
      }

      const groupKey = `question_group:${questionResult.questionGroupPublicId}`;
      const existingGroupIndex = groups.findIndex(
        (group) => group.groupKey === groupKey,
      );

      if (existingGroupIndex === -1) {
        return [
          ...groups,
          {
            groupKey,
            paperSectionTitle: questionResult.paperSectionTitle,
            questionGroupPublicId: questionResult.questionGroupPublicId,
            questionGroupTitle: questionResult.questionGroupTitle,
            questionResults: [questionResult],
          },
        ];
      }

      return groups.map((group, groupIndex) =>
        groupIndex === existingGroupIndex
          ? {
              ...group,
              questionResults: [...group.questionResults, questionResult],
            }
          : group,
      );
    },
    [],
  );
}

function ReportQuestionResultCard({
  questionResult,
  showStructureLabel,
}: {
  questionResult: ReportQuestionResult;
  showStructureLabel: boolean;
}) {
  return (
    <article className="border-border bg-background space-y-2 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {questionResult.questionType === null ? null : (
            <p className="text-text-muted text-xs">
              {questionTypeLabels[questionResult.questionType]}
            </p>
          )}
          {!showStructureLabel ||
          questionResult.paperSectionTitle === null ? null : (
            <p className="text-text-muted text-xs">
              {questionResult.paperSectionTitle}
            </p>
          )}
          <p className="text-text-primary text-sm font-semibold">
            {questionResult.title}
          </p>
          {questionResult.scoringMethod === null ? null : (
            <p className="text-text-secondary text-xs">
              计分方式：
              {scoringMethodLabels[questionResult.scoringMethod] ??
                questionResult.scoringMethod}
            </p>
          )}
        </div>
        <p className="text-text-secondary text-xs">
          {questionResult.score ?? "待评分"} / {questionResult.maxScore}
        </p>
      </div>
      <p className="text-text-secondary text-sm">
        作答：{questionResult.selectedAnswer ?? "未作答"}；标准答案：
        {questionResult.standardAnswer ?? "生成中"}
      </p>
      {questionResult.fillBlankAnswers.length === 0 ? null : (
        <ul className="text-text-secondary space-y-1 text-xs">
          {questionResult.fillBlankAnswers.map((fillBlankAnswer) => (
            <li key={fillBlankAnswer.blankKey}>
              {fillBlankAnswer.blankKey}：
              {fillBlankAnswer.standardAnswers.join(" / ")}（
              {fillBlankAnswer.score} 分）
            </li>
          ))}
        </ul>
      )}
      {questionResult.mistakeBookPublicId === null ? null : (
        <p className="text-warning text-sm font-medium">已加入错题本</p>
      )}
    </article>
  );
}

function parseLearningSuggestion(
  value: Record<string, unknown> | null,
): ParsedLearningSuggestion | null {
  if (value === null) {
    return null;
  }

  const summaryText =
    getStringField(value, "summaryText") ??
    getStringField(value, "learningSuggestionText") ??
    getStringField(value, "suggestionText");
  const rawSuggestionItems = Array.isArray(value.suggestionItems)
    ? value.suggestionItems
    : Array.isArray(value.suggestions)
      ? value.suggestions
      : [];
  const suggestionItems = rawSuggestionItems.flatMap(
    (item): ParsedLearningSuggestionItem[] => {
      if (typeof item === "string") {
        return [{ title: null, detail: item }];
      }

      if (!isRecord(item)) {
        return [];
      }

      const detail =
        getStringField(item, "detail") ??
        getStringField(item, "text") ??
        getStringField(item, "description");

      if (detail === null) {
        return [];
      }

      return [
        {
          title: getStringField(item, "title"),
          detail,
        },
      ];
    },
  );
  const rawCitations = Array.isArray(value.citations) ? value.citations : [];
  const citations = rawCitations.flatMap(
    (citation): ParsedLearningSuggestionCitation[] => {
      if (!isRecord(citation)) {
        return [];
      }

      const title = getStringField(citation, "title");

      if (title === null) {
        return [];
      }

      const headingPath = getStringArray(citation.headingPath);

      return [
        {
          title,
          headingPath:
            headingPath.length === 0 ? null : headingPath.join(" > "),
        },
      ];
    },
  );

  return {
    summaryText,
    suggestionItems,
    citations,
  };
}

function countFailedQuestionDetails(value: unknown): number | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter(
    (questionDetail) =>
      isRecord(questionDetail) &&
      questionDetail.answerRecordStatus === "scoring_failed",
  ).length;
}

function getFailedScoringCount(
  reportSnapshot: ExamReportSnapshotDto,
): number | null {
  const failedScoringCount = reportSnapshot.failedScoringCount;

  if (
    typeof failedScoringCount === "number" &&
    Number.isInteger(failedScoringCount) &&
    failedScoringCount >= 0
  ) {
    return failedScoringCount;
  }

  return countFailedQuestionDetails(reportSnapshot.questionDetails);
}

function StudentScoringProgressPanel({
  publicId,
  paperName,
  mockExamPublicId,
  status,
  failedScoringCount,
  completedReportPublicId,
  didSupplementTerminalAnswers,
  onRefresh,
  onRetryScoring,
}: {
  publicId: string;
  paperName: string;
  mockExamPublicId: string;
  status: ScoringProgressStatus | "completed";
  failedScoringCount: number | null;
  completedReportPublicId?: string | null;
  didSupplementTerminalAnswers?: boolean;
  onRefresh(): void;
  onRetryScoring?(): void;
}) {
  const isPartialFailed = status === "scoring_partial_failed";
  const isCompleted = status === "completed" && completedReportPublicId != null;

  return (
    <section
      data-testid="exam-scoring-progress-surface"
      data-public-id={publicId}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/exam-report"
            className="text-brand-primary text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回模拟考试记录
          </Link>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {paperName}
          </h1>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <Clock3 className="size-5" aria-hidden="true" />
        </div>
      </div>

      {didSupplementTerminalAnswers ? (
        <div className="border-success/30 bg-success/10 text-text-primary rounded-lg border px-3 py-2 text-sm leading-6">
          考试已自动交卷，未保存的作答已补充提交
        </div>
      ) : null}

      <div className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="flex items-center gap-2">
          <Clock3 className="text-brand-primary size-4" aria-hidden="true" />
          <h2 className="font-heading text-text-primary text-base font-semibold">
            {isPartialFailed
              ? examStatusLabels.scoring_partial_failed
              : isCompleted
                ? "评分已完成"
                : examStatusLabels.scoring}
          </h2>
        </div>
        <p className="text-text-secondary text-sm leading-6">
          评分可能需要几分钟，请耐心等待或稍后查看
        </p>
        {isPartialFailed ? (
          <p className="text-warning bg-warning/10 rounded-lg px-3 py-2 text-sm font-medium">
            {failedScoringCount === null
              ? "评分失败题目数量待确认"
              : `${failedScoringCount} 道题评分失败`}
          </p>
        ) : null}
        {isCompleted ? (
          <Link
            href={`/exam-report?examReportPublicId=${completedReportPublicId}`}
            className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <FileCheck2 className="size-4" aria-hidden="true" />
            查看考试报告
          </Link>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onRefresh}
              className="border-border text-text-primary flex h-10 items-center justify-center gap-2 rounded-lg border bg-transparent px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              刷新结果
            </button>
            {isPartialFailed ? (
              <button
                type="button"
                onClick={onRetryScoring}
                className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                重试评分
              </button>
            ) : null}
          </div>
        )}
      </div>

      <Link
        href={`/mock-exam?mockExamPublicId=${mockExamPublicId}`}
        className="text-brand-primary text-center text-sm font-medium transition-transform active:scale-[0.98]"
      >
        离开页面，稍后从记录列表进入
      </Link>
    </section>
  );
}

export function StudentMockExamPage({
  state = "ready",
  paperPublicId,
  mockExamPublicId,
  authorizationSource,
  authorizationPublicId,
  mockExams,
}: StudentMockExamPageProps) {
  const isRuntimeMode = mockExams === undefined;
  const selectedRouteMockExamPublicId =
    mockExamPublicId ??
    (isRuntimeMode ? null : "mock-exam-marketing-theory-001");
  const [runtimeState, setRuntimeState] = useState<StudentPageState>("loading");
  const [runtimeMockExams, setRuntimeMockExams] = useState<
    StudentMockExamFixture[]
  >([]);
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayMockExams = mockExams ?? runtimeMockExams;
  const selectedMockExamPublicId =
    isRuntimeMode && runtimeMockExams.length > 0
      ? runtimeMockExams[0].mockExam.publicId
      : selectedRouteMockExamPublicId;
  const selectedMockExamFixture =
    selectedMockExamPublicId === null
      ? null
      : (displayMockExams.find(
          (mockExamFixture) =>
            mockExamFixture.mockExam.publicId === selectedMockExamPublicId,
        ) ?? null);
  const mockExam = selectedMockExamFixture?.mockExam ?? null;
  const questionPages = useMemo(
    () =>
      mockExam === null
        ? []
        : extractMockExamQuestionPages(mockExam.paperSnapshot),
    [mockExam],
  );
  const questions = useMemo(
    () => questionPages.flatMap((page) => page.questions),
    [questionPages],
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLabelsByQuestion, setSelectedLabelsByQuestion] = useState(
    emptyAnswerSelections,
  );
  const [textAnswerByQuestion, setTextAnswerByQuestion] =
    useState(emptyTextAnswers);
  const [savedAnswerByQuestion, setSavedAnswerByQuestion] = useState(
    emptyAnswerSelections,
  );
  const [answerRevisionByQuestion, setAnswerRevisionByQuestion] = useState<
    Record<string, number>
  >({});
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pendingAnswerByQuestion, setPendingAnswerByQuestion] = useState<
    Record<string, MockExamPendingAnswer>
  >({});
  const [isRetryingPendingAnswers, setIsRetryingPendingAnswers] =
    useState(false);
  const [runtimeExamReportPublicId, setRuntimeExamReportPublicId] = useState<
    string | null
  >(null);
  const [runtimeScoringProgress, setRuntimeScoringProgress] = useState<{
    publicId: string;
    paperName: string;
    mockExamPublicId: string;
    status: ScoringProgressStatus | "completed";
    failedScoringCount: number | null;
    completedReportPublicId: string | null;
  } | null>(null);
  const [isOfflineRecovered, setIsOfflineRecovered] = useState(false);
  const [didSupplementTerminalAnswers, setDidSupplementTerminalAnswers] =
    useState(false);
  const [serverClock, setServerClock] = useState<{
    mockExamPublicId: string;
    currentServerTimeMillisecond: number;
  } | null>(null);
  const deadlineRefreshMockExamPublicIdRef = useRef<string | null>(null);
  const pendingAnswerCount = Object.keys(pendingAnswerByQuestion).length;
  const currentServerTimeMillisecond =
    mockExam === null
      ? null
      : serverClock?.mockExamPublicId === mockExam.publicId
        ? serverClock.currentServerTimeMillisecond
        : new Date(mockExam.serverNow).getTime();

  useEffect(() => {
    if (mockExam === null || mockExam.examStatus !== "in_progress") {
      return;
    }

    const baselineServerTimeMillisecond = new Date(
      mockExam.serverNow,
    ).getTime();
    const baselineClientTimeMillisecond = Date.now();
    const intervalId = window.setInterval(() => {
      setServerClock({
        mockExamPublicId: mockExam.publicId,
        currentServerTimeMillisecond:
          baselineServerTimeMillisecond +
          (Date.now() - baselineClientTimeMillisecond),
      });
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mockExam]);

  useEffect(() => {
    if (
      !isRuntimeMode ||
      state !== "ready" ||
      (paperPublicId === undefined && selectedRouteMockExamPublicId === null)
    ) {
      return;
    }

    let isActive = true;

    async function loadMockExam() {
      const storedSessionValue = getStoredStudentSessionToken();
      const cacheStorageKey = createMockExamCacheStorageKey({
        paperPublicId,
        mockExamPublicId: selectedRouteMockExamPublicId ?? "",
      });

      try {
        const mockExamPayload =
          paperPublicId === undefined
            ? await fetchStudentApi<MockExamResultDto>(
                `/api/v1/mock-exams/${selectedRouteMockExamPublicId}`,
                storedSessionValue,
              )
            : await fetchStudentApi<MockExamResultDto>(
                "/api/v1/mock-exams",
                storedSessionValue,
                {
                  method: "POST",
                  body: JSON.stringify({
                    paperPublicId,
                    authorizationSource,
                    authorizationPublicId,
                  }),
                },
              );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(mockExamPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (isStudentResourceNotFoundResponse(mockExamPayload)) {
          setRuntimeState("not_found");
          return;
        }

        if (mockExamPayload.code !== 0 || mockExamPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        const loadedMockExam = mockExamPayload.data.mockExam;
        let examReportPublicId: string | null = null;

        if (loadedMockExam.examStatus === "completed") {
          const reportPayload = await requestRuntimeExamReport(
            storedSessionValue,
            loadedMockExam.publicId,
          );

          if (!isActive) {
            return;
          }

          if (isStudentUnauthorizedResponse(reportPayload)) {
            setRuntimeState("authorization_expired");
            return;
          }

          if (reportPayload.code !== 0 || reportPayload.data === null) {
            setRuntimeState("error");
            return;
          }

          examReportPublicId = reportPayload.data.examReport.publicId;
        }

        setRuntimeMockExams([
          {
            mockExam: loadedMockExam,
            examReportPublicId: examReportPublicId ?? "",
          },
        ]);

        if (
          loadedMockExam.examStatus === "scoring" ||
          loadedMockExam.examStatus === "scoring_partial_failed"
        ) {
          setRuntimeScoringProgress({
            publicId: loadedMockExam.publicId,
            paperName: getPaperName(loadedMockExam),
            mockExamPublicId: loadedMockExam.publicId,
            status: loadedMockExam.examStatus,
            failedScoringCount: null,
            completedReportPublicId: null,
          });
          setIsSubmitted(true);
        } else if (loadedMockExam.examStatus === "completed") {
          setRuntimeScoringProgress(null);
          setRuntimeExamReportPublicId(examReportPublicId);
          setIsSubmitted(true);
        } else {
          setRuntimeScoringProgress(null);
          setIsSubmitted(false);
        }

        if (loadedMockExam.examStatus === "in_progress") {
          const pendingAnswers = readPendingMockExamAnswers(
            loadedMockExam.publicId,
          );
          const resumedAnswerState = buildResumedMockExamAnswerState(
            mockExamPayload.data.answerRecords ?? [],
            pendingAnswers,
          );

          setPendingAnswerByQuestion(pendingAnswers);
          setSelectedLabelsByQuestion(
            resumedAnswerState.selectedLabelsByQuestion,
          );
          setTextAnswerByQuestion(resumedAnswerState.textAnswerByQuestion);
          setSavedAnswerByQuestion(resumedAnswerState.savedAnswerByQuestion);
          setAnswerRevisionByQuestion(
            resumedAnswerState.answerRevisionByQuestion,
          );
          writeCachedMockExam(cacheStorageKey, loadedMockExam);
        } else {
          setPendingAnswerByQuestion({});
          clearMockExamRuntimeStorage({
            paperPublicId,
            mockExamPublicId: loadedMockExam.publicId,
          });
        }
        setIsOfflineRecovered(false);
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          const cachedMockExam = readCachedMockExam(cacheStorageKey);

          if (cachedMockExam !== null) {
            const pendingAnswers = readPendingMockExamAnswers(
              cachedMockExam.publicId,
            );
            const resumedAnswerState = buildResumedMockExamAnswerState(
              [],
              pendingAnswers,
            );

            setRuntimeMockExams([
              {
                mockExam: cachedMockExam,
                examReportPublicId: "",
              },
            ]);
            setPendingAnswerByQuestion(pendingAnswers);
            setSelectedLabelsByQuestion(
              resumedAnswerState.selectedLabelsByQuestion,
            );
            setTextAnswerByQuestion(resumedAnswerState.textAnswerByQuestion);
            setSavedAnswerByQuestion(resumedAnswerState.savedAnswerByQuestion);
            setAnswerRevisionByQuestion(
              resumedAnswerState.answerRevisionByQuestion,
            );
            setIsOfflineRecovered(true);
            setRuntimeState("ready");
            return;
          }

          setRuntimeState("error");
        }
      }
    }

    void loadMockExam();

    return () => {
      isActive = false;
    };
  }, [
    authorizationPublicId,
    authorizationSource,
    isRuntimeMode,
    paperPublicId,
    selectedRouteMockExamPublicId,
    state,
  ]);

  useEffect(() => {
    if (
      !isRuntimeMode ||
      mockExam === null ||
      mockExam.examStatus !== "in_progress" ||
      currentServerTimeMillisecond === null ||
      mockExam.serverDeadlineAt === null ||
      currentServerTimeMillisecond <
        new Date(mockExam.serverDeadlineAt).getTime() ||
      deadlineRefreshMockExamPublicIdRef.current === mockExam.publicId
    ) {
      return;
    }

    deadlineRefreshMockExamPublicIdRef.current = mockExam.publicId;
    let isActive = true;

    void (async () => {
      const storedSessionValue = getStoredStudentSessionToken();

      try {
        const mockExamPayload = await fetchStudentApi<MockExamResultDto>(
          `/api/v1/mock-exams/${mockExam.publicId}`,
          storedSessionValue,
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(mockExamPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (mockExamPayload.code !== 0 || mockExamPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        const refreshedMockExam = mockExamPayload.data.mockExam;
        let examReportPublicId: string | null = null;

        if (refreshedMockExam.examStatus === "completed") {
          const reportPayload = await requestRuntimeExamReport(
            storedSessionValue,
            refreshedMockExam.publicId,
          );

          if (!isActive) {
            return;
          }

          if (isStudentUnauthorizedResponse(reportPayload)) {
            setRuntimeState("authorization_expired");
            return;
          }

          if (reportPayload.code !== 0 || reportPayload.data === null) {
            setRuntimeState("error");
            return;
          }

          examReportPublicId = reportPayload.data.examReport.publicId;
        }

        setRuntimeMockExams([
          {
            mockExam: refreshedMockExam,
            examReportPublicId: examReportPublicId ?? "",
          },
        ]);
        clearMockExamRuntimeStorage({
          paperPublicId,
          mockExamPublicId: refreshedMockExam.publicId,
        });
        setPendingAnswerByQuestion({});

        if (
          refreshedMockExam.examStatus === "scoring" ||
          refreshedMockExam.examStatus === "scoring_partial_failed"
        ) {
          setRuntimeScoringProgress({
            publicId: refreshedMockExam.publicId,
            paperName: getPaperName(refreshedMockExam),
            mockExamPublicId: refreshedMockExam.publicId,
            status: refreshedMockExam.examStatus,
            failedScoringCount: null,
            completedReportPublicId: null,
          });
          setIsSubmitted(true);
          return;
        }

        if (refreshedMockExam.examStatus === "completed") {
          setRuntimeScoringProgress(null);
          setRuntimeExamReportPublicId(examReportPublicId);
          setIsSubmitted(true);
        }
      } catch {
        if (isActive) {
          setRuntimeState("error");
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [currentServerTimeMillisecond, isRuntimeMode, mockExam, paperPublicId]);

  useEffect(() => {
    if (!isRuntimeMode) {
      return;
    }

    const handleOnline = () => {
      const storedSessionValue = getStoredStudentSessionToken();

      void (async () => {
        const remainingPendingAnswers: Record<string, MockExamPendingAnswer> =
          {};
        let didReachTerminalState = false;

        for (const pendingAnswer of Object.values(pendingAnswerByQuestion)) {
          try {
            const answerPayload = await sendMockExamAnswer(
              storedSessionValue,
              pendingAnswer,
            );

            if (isStudentUnauthorizedResponse(answerPayload)) {
              setRuntimeState("authorization_expired");
              return;
            }

            if (answerPayload.code !== 0 || answerPayload.data === null) {
              if (answerPayload.code === 409311) {
                didReachTerminalState = true;
                break;
              }

              remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
                pendingAnswer;
              continue;
            }

            const answerRevision =
              answerPayload.data.answerRecord.answerRevision;

            setSavedAnswerByQuestion((currentSavedAnswers) => ({
              ...currentSavedAnswers,
              [pendingAnswer.paperQuestionPublicId]:
                getSavedAnswerSelection(pendingAnswer),
            }));
            setAnswerRevisionByQuestion((currentRevisions) => ({
              ...currentRevisions,
              [pendingAnswer.paperQuestionPublicId]: answerRevision,
            }));
          } catch {
            remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
              pendingAnswer;
          }
        }

        if (didReachTerminalState && mockExam !== null) {
          try {
            const currentMockExamPayload =
              await fetchStudentApi<MockExamResultDto>(
                `/api/v1/mock-exams/${mockExam.publicId}`,
                storedSessionValue,
              );

            if (isStudentUnauthorizedResponse(currentMockExamPayload)) {
              setRuntimeState("authorization_expired");
              return;
            }

            if (
              currentMockExamPayload.code === 0 &&
              currentMockExamPayload.data !== null &&
              canSupplementTerminalMockExam(
                currentMockExamPayload.data.mockExam,
              )
            ) {
              const missingOnlyAnswers = Object.values(
                pendingAnswerByQuestion,
              ).filter((pendingAnswer) => pendingAnswer.expectedRevision === 0);
              const supplementPayload =
                missingOnlyAnswers.length === 0
                  ? null
                  : await sendMockExamAnswerSupplement(
                      storedSessionValue,
                      mockExam.publicId,
                      missingOnlyAnswers,
                    );

              if (
                supplementPayload !== null &&
                isStudentUnauthorizedResponse(supplementPayload)
              ) {
                setRuntimeState("authorization_expired");
                return;
              }

              if (
                supplementPayload === null ||
                (supplementPayload.code === 0 &&
                  supplementPayload.data !== null)
              ) {
                const terminalMockExam =
                  supplementPayload?.data?.mockExam ??
                  currentMockExamPayload.data.mockExam;
                let examReportPublicId =
                  supplementPayload?.data?.examReportPublicId ?? null;

                if (
                  terminalMockExam.examStatus === "completed" &&
                  examReportPublicId === null
                ) {
                  const reportPayload = await requestRuntimeExamReport(
                    storedSessionValue,
                    terminalMockExam.publicId,
                  );

                  if (isStudentUnauthorizedResponse(reportPayload)) {
                    setRuntimeState("authorization_expired");
                    return;
                  }

                  if (reportPayload.code !== 0 || reportPayload.data === null) {
                    setRuntimeState("error");
                    return;
                  }

                  examReportPublicId = reportPayload.data.examReport.publicId;
                }

                setRuntimeMockExams([
                  {
                    mockExam: terminalMockExam,
                    examReportPublicId: examReportPublicId ?? "",
                  },
                ]);
                setRuntimeExamReportPublicId(examReportPublicId);
                if (
                  terminalMockExam.examStatus === "scoring" ||
                  terminalMockExam.examStatus === "scoring_partial_failed"
                ) {
                  setRuntimeScoringProgress({
                    publicId: terminalMockExam.publicId,
                    paperName: getPaperName(terminalMockExam),
                    mockExamPublicId: terminalMockExam.publicId,
                    status: terminalMockExam.examStatus,
                    failedScoringCount: null,
                    completedReportPublicId: null,
                  });
                } else {
                  setRuntimeScoringProgress(null);
                }
                setIsSubmitted(true);
                setDidSupplementTerminalAnswers(
                  (supplementPayload?.data?.supplementedCount ?? 0) > 0,
                );
                setPendingAnswerByQuestion({});
                writePendingMockExamAnswers(mockExam.publicId, {});
                return;
              }
            }
          } catch {
            // Keep the durable local queue when authoritative recovery fails.
          }

          Object.assign(remainingPendingAnswers, pendingAnswerByQuestion);
        }

        setPendingAnswerByQuestion(remainingPendingAnswers);

        if (mockExam !== null) {
          writePendingMockExamAnswers(
            mockExam.publicId,
            remainingPendingAnswers,
          );
        }
      })();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [isRuntimeMode, mockExam, pendingAnswerByQuestion]);

  if (
    isRuntimeMode &&
    state === "ready" &&
    paperPublicId === undefined &&
    selectedRouteMockExamPublicId === null
  ) {
    return (
      <StudentStatusMessage
        title="请选择模拟考试入口"
        description="请先从学员首页选择试卷后再进入模拟考试。"
        testId="mock-exam-empty-state"
        action={
          <Link
            href="/home"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回学员首页
          </Link>
        }
      />
    );
  }

  if (displayState === "loading") {
    return <StudentMockExamLoading />;
  }

  if (displayState === "error") {
    return (
      <StudentStatusMessage
        title="模拟考试加载失败"
        description="请稍后刷新页面，或从学员首页重新进入模拟考试。"
      />
    );
  }

  if (displayState === "authorization_expired") {
    return (
      <StudentStatusMessage
        title="授权已失效"
        description="当前专业或等级授权不可用，系统已停止展示模拟考试内容。"
        action={
          <Link
            href="/redeem-code"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            查看授权
          </Link>
        }
      />
    );
  }

  if (displayState === "not_found" || selectedMockExamFixture === null) {
    return (
      <StudentStatusMessage
        title="未找到模拟考试"
        description="该模拟考试入口不存在或已不可用，请从学员首页重新进入。"
        testId="mock-exam-empty-state"
        action={
          <Link
            href="/home"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回学员首页
          </Link>
        }
      />
    );
  }

  if (mockExam?.examStatus === "terminated") {
    return (
      <StudentStatusMessage
        title="模拟考试已终止"
        description="本次模拟考试已由服务端终止，作答入口已关闭且不会生成考试报告。"
        testId="mock-exam-terminated-state"
        action={
          <Link
            href="/exam-report"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            查看模拟考试记录
          </Link>
        }
      />
    );
  }

  if (mockExam === null || questions.length === 0) {
    return (
      <StudentStatusMessage
        title="暂无可进入的模拟考试"
        description="该试卷暂未创建模拟考试进度，或考试快照为空。"
        testId="mock-exam-empty-state"
        action={
          <Link
            href="/home"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回学员首页
          </Link>
        }
      />
    );
  }

  const currentPageIndex = Math.max(
    questionPages.findIndex(
      (page) =>
        currentQuestionIndex >= page.firstQuestionIndex &&
        currentQuestionIndex < page.firstQuestionIndex + page.questions.length,
    ),
    0,
  );
  const currentPage = questionPages[currentPageIndex] ?? questionPages[0];
  const currentQuestion = currentPage.questions[0] ?? questions[0];
  const isQuestionGroupPage = currentPage.questionGroupPublicId !== null;
  const usesGroupedNavigation = questionPages.some(
    (page) => page.questionGroupPublicId !== null,
  );
  const answeredCount = Object.keys(savedAnswerByQuestion).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const remainingMinute = getRemainingMinute(
    mockExam,
    currentServerTimeMillisecond ?? new Date(mockExam.serverNow).getTime(),
  );

  function handleToggleLabel(question: MockExamPaperQuestion, label: string) {
    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const nextSelectedLabels =
      question.questionType === "multi_choice"
        ? includesLabel(questionSelectedLabels, label)
          ? questionSelectedLabels.filter(
              (selectedLabel) => selectedLabel !== label,
            )
          : [...questionSelectedLabels, label]
        : includesLabel(questionSelectedLabels, label)
          ? []
          : [label];

    setSelectedLabelsByQuestion({
      ...selectedLabelsByQuestion,
      [question.paperQuestionPublicId]: nextSelectedLabels,
    });
  }

  function handleChangeTextAnswer(
    question: MockExamPaperQuestion,
    textAnswerValue: string,
  ) {
    setTextAnswerByQuestion({
      ...textAnswerByQuestion,
      [question.paperQuestionPublicId]: textAnswerValue,
    });
  }

  function createPendingAnswer(
    mockExamPublicId: string,
    question: MockExamPaperQuestion,
  ) {
    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    return {
      mockExamPublicId,
      paperQuestionPublicId: question.paperQuestionPublicId,
      selectedLabels: isOptionMockExamQuestion(question.questionType)
        ? questionSelectedLabels
        : [],
      textAnswer: isTextMockExamQuestion(question.questionType)
        ? questionTextAnswer
        : null,
      operationId: `answer_operation_${crypto.randomUUID()}`,
      expectedRevision:
        answerRevisionByQuestion[question.paperQuestionPublicId] ?? 0,
      savedFromClientAt: new Date().toISOString(),
      queuedAt: new Date().toISOString(),
    } satisfies MockExamPendingAnswer;
  }

  function markAnswerSaved(
    pendingAnswer: MockExamPendingAnswer,
    answerRevision?: number,
  ) {
    setSavedAnswerByQuestion((currentSavedAnswers) => ({
      ...currentSavedAnswers,
      [pendingAnswer.paperQuestionPublicId]:
        getSavedAnswerSelection(pendingAnswer),
    }));

    if (answerRevision !== undefined) {
      setAnswerRevisionByQuestion((currentRevisions) => ({
        ...currentRevisions,
        [pendingAnswer.paperQuestionPublicId]: answerRevision,
      }));
    }
  }

  function queuePendingAnswer(pendingAnswer: MockExamPendingAnswer) {
    setPendingAnswerByQuestion((currentPendingAnswers) => {
      const nextPendingAnswerByQuestion = {
        ...currentPendingAnswers,
        [pendingAnswer.paperQuestionPublicId]: pendingAnswer,
      };

      writePendingMockExamAnswers(
        pendingAnswer.mockExamPublicId,
        nextPendingAnswerByQuestion,
      );

      return nextPendingAnswerByQuestion;
    });
    markAnswerSaved(pendingAnswer);
  }

  function removePendingAnswer(
    mockExamPublicId: string,
    paperQuestionPublicId: string,
  ) {
    setPendingAnswerByQuestion((currentPendingAnswers) => {
      if (currentPendingAnswers[paperQuestionPublicId] === undefined) {
        return currentPendingAnswers;
      }

      const nextPendingAnswers = { ...currentPendingAnswers };
      delete nextPendingAnswers[paperQuestionPublicId];
      writePendingMockExamAnswers(mockExamPublicId, nextPendingAnswers);

      return nextPendingAnswers;
    });
  }

  async function handleSaveAnswer(
    question: MockExamPaperQuestion,
  ): Promise<boolean> {
    if (mockExam === null) {
      return false;
    }

    if (isRuntimeMode) {
      const storedSessionValue = getStoredStudentSessionToken();
      const pendingAnswer = createPendingAnswer(mockExam.publicId, question);

      try {
        const answerPayload = await sendMockExamAnswer(
          storedSessionValue,
          pendingAnswer,
        );

        if (isStudentUnauthorizedResponse(answerPayload)) {
          setIsRetryingPendingAnswers(false);
          setRuntimeState("authorization_expired");
          return false;
        }

        if (answerPayload.code !== 0 || answerPayload.data === null) {
          setRuntimeState("error");
          return false;
        }
        markAnswerSaved(
          pendingAnswer,
          answerPayload.data.answerRecord.answerRevision,
        );
        removePendingAnswer(
          mockExam.publicId,
          pendingAnswer.paperQuestionPublicId,
        );
        return true;
      } catch {
        queuePendingAnswer(pendingAnswer);
        return true;
      }
    }

    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    setSavedAnswerByQuestion((currentSavedAnswers) => ({
      ...currentSavedAnswers,
      [question.paperQuestionPublicId]: isOptionMockExamQuestion(
        question.questionType,
      )
        ? questionSelectedLabels
        : [questionTextAnswer],
    }));

    return true;
  }

  async function handleRetryPendingAnswers() {
    if (mockExam === null || pendingAnswerCount === 0) {
      return;
    }

    const storedSessionValue = getStoredStudentSessionToken();

    setIsRetryingPendingAnswers(true);

    const remainingPendingAnswers: Record<string, MockExamPendingAnswer> = {};

    for (const pendingAnswer of Object.values(pendingAnswerByQuestion)) {
      try {
        const answerPayload = await sendMockExamAnswer(
          storedSessionValue,
          pendingAnswer,
        );

        if (isStudentUnauthorizedResponse(answerPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (answerPayload.code !== 0 || answerPayload.data === null) {
          remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
            pendingAnswer;
          continue;
        }
        markAnswerSaved(
          pendingAnswer,
          answerPayload.data.answerRecord.answerRevision,
        );
      } catch {
        remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
          pendingAnswer;
      }
    }

    setPendingAnswerByQuestion(remainingPendingAnswers);
    writePendingMockExamAnswers(mockExam.publicId, remainingPendingAnswers);
    setIsRetryingPendingAnswers(false);
  }

  async function handleNavigateToQuestion(questionIndex: number) {
    for (const question of currentPage.questions) {
      const questionSelectedLabels =
        selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
      const questionTextAnswer =
        textAnswerByQuestion[question.paperQuestionPublicId] ?? "";
      const questionAnswerSelection = isOptionMockExamQuestion(
        question.questionType,
      )
        ? questionSelectedLabels
        : [questionTextAnswer];
      const hasAnswer =
        questionSelectedLabels.length > 0 ||
        questionTextAnswer.trim().length > 0;
      const isQuestionSaved = areAnswerSelectionsEqual(
        savedAnswerByQuestion[question.paperQuestionPublicId],
        questionAnswerSelection,
      );

      if (!hasAnswer || isQuestionSaved) {
        continue;
      }

      const didPersistCurrentAnswer = await handleSaveAnswer(question);

      if (!didPersistCurrentAnswer) {
        return;
      }
    }

    const targetPage = questionPages.find(
      (page) =>
        questionIndex >= page.firstQuestionIndex &&
        questionIndex < page.firstQuestionIndex + page.questions.length,
    );

    if (targetPage !== undefined) {
      setCurrentQuestionIndex(targetPage.firstQuestionIndex);
    }
  }

  function renderMockExamAnswerPanel(question: MockExamPaperQuestion) {
    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";
    const questionAnswerSelection = isOptionMockExamQuestion(
      question.questionType,
    )
      ? questionSelectedLabels
      : [questionTextAnswer];
    const isQuestionSaved = areAnswerSelectionsEqual(
      savedAnswerByQuestion[question.paperQuestionPublicId],
      questionAnswerSelection,
    );

    return isOptionMockExamQuestion(question.questionType) ? (
      <MockExamQuestionPanel
        question={question}
        selectedLabels={questionSelectedLabels}
        isSaved={isQuestionSaved}
        onToggleLabel={(label) => handleToggleLabel(question, label)}
        onSaveAnswer={() => void handleSaveAnswer(question)}
      />
    ) : (
      <MockExamTextAnswerPanel
        textAnswer={questionTextAnswer}
        isSaved={isQuestionSaved}
        onChangeTextAnswer={(textAnswerValue) =>
          handleChangeTextAnswer(question, textAnswerValue)
        }
        onSaveAnswer={() => void handleSaveAnswer(question)}
      />
    );
  }

  async function generateRuntimeExamReport(
    storedSessionValue: string | null,
    targetMockExamPublicId: string,
  ): Promise<string | null> {
    const reportPayload = await requestRuntimeExamReport(
      storedSessionValue,
      targetMockExamPublicId,
    );

    if (isStudentUnauthorizedResponse(reportPayload)) {
      setRuntimeState("authorization_expired");
      return null;
    }

    if (reportPayload.code !== 0 || reportPayload.data === null) {
      setRuntimeState("error");
      return null;
    }

    return reportPayload.data.examReport.publicId;
  }

  async function handleRefreshScoringProgress() {
    if (runtimeScoringProgress === null) {
      return;
    }

    const storedSessionValue = getStoredStudentSessionToken();

    try {
      const mockExamPayload = await fetchStudentApi<MockExamResultDto>(
        `/api/v1/mock-exams/${runtimeScoringProgress.mockExamPublicId}`,
        storedSessionValue,
      );

      if (isStudentUnauthorizedResponse(mockExamPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (mockExamPayload.code !== 0 || mockExamPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      const refreshedMockExam = mockExamPayload.data.mockExam;

      if (refreshedMockExam.examStatus === "completed") {
        const completedReportPublicId = await generateRuntimeExamReport(
          storedSessionValue,
          refreshedMockExam.publicId,
        );

        if (completedReportPublicId === null) {
          return;
        }

        setRuntimeScoringProgress({
          publicId: refreshedMockExam.publicId,
          paperName: getPaperName(refreshedMockExam),
          mockExamPublicId: refreshedMockExam.publicId,
          status: "completed",
          failedScoringCount: null,
          completedReportPublicId,
        });
        return;
      }

      if (
        refreshedMockExam.examStatus === "scoring" ||
        refreshedMockExam.examStatus === "scoring_partial_failed"
      ) {
        setRuntimeScoringProgress({
          publicId: refreshedMockExam.publicId,
          paperName: getPaperName(refreshedMockExam),
          mockExamPublicId: refreshedMockExam.publicId,
          status: refreshedMockExam.examStatus,
          failedScoringCount: null,
          completedReportPublicId: null,
        });
      }
    } catch {
      setRuntimeState("error");
    }
  }

  async function handleRetryRuntimeScoring() {
    if (runtimeScoringProgress === null) {
      return;
    }

    const storedSessionValue = getStoredStudentSessionToken();

    try {
      const retryPayload = await fetchStudentApi<MockExamRetryScoringResultDto>(
        `/api/v1/mock-exams/${runtimeScoringProgress.mockExamPublicId}/retry-scoring`,
        storedSessionValue,
        { method: "POST" },
      );

      if (isStudentUnauthorizedResponse(retryPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (retryPayload.code !== 0 || retryPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      const retriedMockExam = retryPayload.data.mockExam;

      if (retriedMockExam.examStatus === "completed") {
        const completedReportPublicId = await generateRuntimeExamReport(
          storedSessionValue,
          retriedMockExam.publicId,
        );

        if (completedReportPublicId === null) {
          return;
        }

        setRuntimeScoringProgress({
          publicId: retriedMockExam.publicId,
          paperName: getPaperName(retriedMockExam),
          mockExamPublicId: retriedMockExam.publicId,
          status: "completed",
          failedScoringCount: retryPayload.data.failedCount,
          completedReportPublicId,
        });
        return;
      }

      if (
        retriedMockExam.examStatus === "scoring" ||
        retriedMockExam.examStatus === "scoring_partial_failed"
      ) {
        setRuntimeScoringProgress({
          publicId: retriedMockExam.publicId,
          paperName: getPaperName(retriedMockExam),
          mockExamPublicId: retriedMockExam.publicId,
          status: retriedMockExam.examStatus,
          failedScoringCount: retryPayload.data.failedCount,
          completedReportPublicId: null,
        });
        return;
      }

      setRuntimeState("error");
    } catch {
      setRuntimeState("error");
    }
  }

  async function handleSubmitMockExam() {
    if (mockExam === null) {
      return;
    }

    if (isRuntimeMode) {
      const storedSessionValue = getStoredStudentSessionToken();
      const answersToFlush = { ...pendingAnswerByQuestion };

      for (const question of questions) {
        const questionSelectedLabels =
          selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
        const questionTextAnswer =
          textAnswerByQuestion[question.paperQuestionPublicId] ?? "";
        const questionAnswerSelection = isOptionMockExamQuestion(
          question.questionType,
        )
          ? questionSelectedLabels
          : [questionTextAnswer];
        const hasAnswer =
          questionSelectedLabels.length > 0 ||
          questionTextAnswer.trim().length > 0;
        const isQuestionSaved = areAnswerSelectionsEqual(
          savedAnswerByQuestion[question.paperQuestionPublicId],
          questionAnswerSelection,
        );

        if (!hasAnswer || isQuestionSaved) {
          continue;
        }

        const pendingAnswer = createPendingAnswer(mockExam.publicId, question);
        answersToFlush[pendingAnswer.paperQuestionPublicId] = pendingAnswer;
      }

      const remainingPendingAnswers: Record<string, MockExamPendingAnswer> = {};

      for (const pendingAnswer of Object.values(answersToFlush)) {
        try {
          const answerPayload = await sendMockExamAnswer(
            storedSessionValue,
            pendingAnswer,
          );

          if (isStudentUnauthorizedResponse(answerPayload)) {
            setRuntimeState("authorization_expired");
            return;
          }

          if (answerPayload.code !== 0 || answerPayload.data === null) {
            remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
              pendingAnswer;
            continue;
          }

          markAnswerSaved(
            pendingAnswer,
            answerPayload.data.answerRecord.answerRevision,
          );
        } catch {
          remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
            pendingAnswer;
        }
      }

      setPendingAnswerByQuestion(remainingPendingAnswers);
      writePendingMockExamAnswers(mockExam.publicId, remainingPendingAnswers);

      if (Object.keys(remainingPendingAnswers).length > 0) {
        return;
      }

      try {
        const submitPayload = await fetchStudentApi<MockExamSubmitResultDto>(
          `/api/v1/mock-exams/${mockExam.publicId}/submit`,
          storedSessionValue,
          { method: "POST" },
        );

        if (isStudentUnauthorizedResponse(submitPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (submitPayload.code !== 0 || submitPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        clearMockExamRuntimeStorage({
          paperPublicId,
          mockExamPublicId: mockExam.publicId,
        });
        setPendingAnswerByQuestion({});

        if (
          submitPayload.data.mockExam.examStatus === "scoring" ||
          submitPayload.data.mockExam.examStatus === "scoring_partial_failed"
        ) {
          setRuntimeScoringProgress({
            publicId: submitPayload.data.mockExam.publicId,
            paperName: getPaperName(submitPayload.data.mockExam),
            mockExamPublicId: submitPayload.data.mockExam.publicId,
            status: submitPayload.data.mockExam.examStatus,
            failedScoringCount: null,
            completedReportPublicId: null,
          });
          setIsSubmitted(true);
          return;
        }

        const generatedReportPublicId = await generateRuntimeExamReport(
          storedSessionValue,
          mockExam.publicId,
        );

        if (generatedReportPublicId === null) {
          return;
        }

        setRuntimeExamReportPublicId(generatedReportPublicId);
      } catch {
        setRuntimeState("error");
        return;
      }
    }

    setIsSubmitted(true);
  }

  if (isSubmitted) {
    if (runtimeScoringProgress !== null) {
      return (
        <StudentScoringProgressPanel
          publicId={runtimeScoringProgress.publicId}
          paperName={runtimeScoringProgress.paperName}
          mockExamPublicId={runtimeScoringProgress.mockExamPublicId}
          status={runtimeScoringProgress.status}
          failedScoringCount={runtimeScoringProgress.failedScoringCount}
          completedReportPublicId={
            runtimeScoringProgress.completedReportPublicId
          }
          didSupplementTerminalAnswers={didSupplementTerminalAnswers}
          onRefresh={() => void handleRefreshScoringProgress()}
          onRetryScoring={() => void handleRetryRuntimeScoring()}
        />
      );
    }

    const submittedExamReportPublicId =
      runtimeExamReportPublicId ?? selectedMockExamFixture.examReportPublicId;

    return (
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
          <FileCheck2 className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            模考已提交
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            系统正在生成考试报告，客观题结果和错题入口将在报告中展示。
          </p>
        </div>
        {didSupplementTerminalAnswers ? (
          <div className="border-success/30 bg-success/10 text-text-primary rounded-lg border px-3 py-2 text-sm leading-6">
            考试已自动交卷，未保存的作答已补充提交
          </div>
        ) : null}
        <Link
          href={
            submittedExamReportPublicId === ""
              ? "/exam-report"
              : `/exam-report?examReportPublicId=${submittedExamReportPublicId}`
          }
          className="bg-primary text-primary-foreground flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          {submittedExamReportPublicId === ""
            ? "查看模拟考试记录"
            : "查看考试报告"}
        </Link>
      </section>
    );
  }

  return (
    <section
      data-testid={`mock-exam-surface-${mockExam.publicId}`}
      data-public-id={mockExam.publicId}
      className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 pb-20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/home"
            className="text-brand-primary text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回首页
          </Link>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {getPaperName(mockExam)}
          </h1>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <Clock3 className="size-5" aria-hidden="true" />
        </div>
      </div>

      {isOfflineRecovered ? (
        <div
          data-testid="mock-exam-offline-recovery"
          className="border-border bg-background text-text-secondary rounded-lg border px-3 py-2 text-sm leading-6"
        >
          网络暂不可用，已显示本机保存的考试内容。作答会先保存在本机，联网后请按提示重试保存。
        </div>
      ) : null}

      {didSupplementTerminalAnswers ? (
        <div className="border-success/30 bg-success/10 text-text-primary rounded-lg border px-3 py-2 text-sm leading-6">
          考试已自动交卷，未保存的作答已补充提交
        </div>
      ) : null}

      {pendingAnswerCount > 0 ? (
        <div
          data-testid="mock-exam-answer-save-retry"
          className="border-warning/30 bg-warning/10 text-text-primary grid gap-3 rounded-lg border px-3 py-3 text-sm leading-6"
        >
          <div>
            <p className="font-medium">作答已暂存，等待同步</p>
            <p className="text-text-secondary">
              {pendingAnswerCount} 题待重新保存
            </p>
          </div>
          <button
            type="button"
            disabled={isRetryingPendingAnswers}
            onClick={() => void handleRetryPendingAnswers()}
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRetryingPendingAnswers ? "正在重试" : "重试保存"}
          </button>
        </div>
      ) : null}

      <div className="bg-surface ring-border grid grid-cols-3 gap-2 rounded-xl p-3 text-center shadow-sm ring-1">
        <div>
          <p className="text-text-secondary text-xs">剩余时间</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {remainingMinute === null
              ? "不限制"
              : `剩余 ${remainingMinute} 分钟`}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">进度</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {usesGroupedNavigation
              ? `第 ${currentPageIndex + 1} / ${questionPages.length} 组`
              : `第 ${currentQuestionIndex + 1} / ${questions.length} 题`}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">已保存</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {answeredCount} / {questions.length}
          </p>
        </div>
      </div>

      {isQuestionGroupPage ? (
        <article
          data-testid={`mock-exam-question-group-${currentPage.questionGroupPublicId}`}
          data-public-id={currentPage.questionGroupPublicId ?? undefined}
          className="bg-surface ring-border space-y-5 rounded-xl p-4 shadow-sm ring-1"
        >
          <div className="space-y-2">
            <div className="text-text-secondary flex items-center gap-2 text-xs">
              <FileText className="size-3.5" aria-hidden="true" />
              <span>{currentPage.paperSectionTitle}</span>
            </div>
            <h2 className="font-heading text-text-primary text-lg font-semibold">
              {currentPage.questionGroupTitle ?? "材料题组"}
            </h2>
            {currentPage.questionGroupTotalScore === null ? null : (
              <p className="text-text-secondary text-sm">
                题组共 {currentPage.questionGroupTotalScore} 分
              </p>
            )}
          </div>

          {currentPage.materialRichText === null ? null : (
            <div className="border-border bg-background space-y-2 rounded-lg border p-3 text-sm leading-6">
              <p className="text-text-primary font-medium">
                {currentPage.materialTitle ?? "材料"}
              </p>
              <StudentRichText
                value={currentPage.materialRichText}
                className="text-text-secondary"
              />
            </div>
          )}

          <div className="space-y-6">
            {currentPage.questions.map((question, questionIndex) => (
              <section
                key={question.paperQuestionPublicId}
                data-public-id={question.paperQuestionPublicId}
                className="border-border space-y-4 border-t pt-5 first:border-t-0 first:pt-0"
              >
                <div className="space-y-2">
                  <p className="text-brand-primary text-xs font-medium">
                    子题 {questionIndex + 1} / {currentPage.questions.length}
                  </p>
                  <p className="font-heading text-text-primary text-lg leading-7 font-semibold">
                    {question.stemRichText}
                  </p>
                  <p className="text-text-secondary text-sm">
                    本题 {question.score} 分
                  </p>
                </div>
                {renderMockExamAnswerPanel(question)}
              </section>
            ))}
          </div>
        </article>
      ) : (
        <article className="bg-surface ring-border space-y-5 rounded-xl p-4 shadow-sm ring-1">
          <div className="space-y-2">
            <div className="text-text-secondary flex items-center gap-2 text-xs">
              <FileText className="size-3.5" aria-hidden="true" />
              <span>{currentQuestion.paperSectionTitle}</span>
            </div>
            {currentQuestion.materialRichText === null ? null : (
              <div className="border-border bg-background space-y-2 rounded-lg border p-3 text-sm leading-6">
                <p className="text-text-primary font-medium">
                  {currentQuestion.materialTitle ?? "材料"}
                </p>
                <StudentRichText
                  value={currentQuestion.materialRichText}
                  className="text-text-secondary"
                />
              </div>
            )}
            <p className="font-heading text-text-primary text-lg leading-7 font-semibold">
              {currentQuestion.stemRichText}
            </p>
            <p className="text-text-secondary text-sm">
              本题 {currentQuestion.score} 分
            </p>
          </div>
          {renderMockExamAnswerPanel(currentQuestion)}
        </article>
      )}

      <div className="bg-surface ring-border space-y-3 rounded-xl p-4 shadow-sm ring-1">
        <div className="flex items-center gap-2">
          <ListChecks
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="font-heading text-text-primary text-base font-semibold">
            答题卡
          </h2>
        </div>
        <div className="space-y-3">
          {questionPages.map((questionPage, questionPageIndex) => (
            <div key={questionPage.pageKey} className="space-y-2">
              {questionPage.questionGroupTitle === null ? null : (
                <p className="text-text-secondary text-xs font-medium">
                  {questionPage.paperSectionTitle} ·{" "}
                  {questionPage.questionGroupTitle}
                </p>
              )}
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {questionPage.questions.map((question, pageQuestionIndex) => {
                  const questionIndex =
                    questionPage.firstQuestionIndex + pageQuestionIndex;
                  const isSaved =
                    savedAnswerByQuestion[question.paperQuestionPublicId] !==
                    undefined;
                  const isCurrent = questionPageIndex === currentPageIndex;

                  return (
                    <button
                      key={question.paperQuestionPublicId}
                      type="button"
                      onClick={() =>
                        void handleNavigateToQuestion(questionIndex)
                      }
                      className={`h-10 rounded-lg text-sm font-semibold transition-transform active:scale-[0.98] ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isSaved
                            ? "bg-success/10 text-success"
                            : "border-border text-text-primary border bg-transparent"
                      }`}
                    >
                      题号 {questionIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={currentPageIndex === questionPages.length - 1}
          onClick={() =>
            void handleNavigateToQuestion(
              questionPages[
                Math.min(currentPageIndex + 1, questionPages.length - 1)
              ].firstQuestionIndex,
            )
          }
          className="border-border text-text-primary flex h-10 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {usesGroupedNavigation ? "下一组" : "下一题"}
        </button>
        <button
          type="button"
          onClick={() => setIsSubmitConfirmationOpen(true)}
          className="bg-primary text-primary-foreground flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
        >
          交卷
        </button>
      </div>

      {isSubmitConfirmationOpen ? (
        <div
          data-testid="mock-exam-submit-confirmation"
          className="bg-warning/10 ring-warning/20 space-y-3 rounded-xl p-4 ring-1"
        >
          <div className="flex items-center gap-2">
            <CircleAlert className="text-warning size-5" aria-hidden="true" />
            <p className="font-heading text-text-primary text-base font-semibold">
              确认交卷提示
            </p>
          </div>
          <p className="text-text-secondary text-sm">
            仍有 {unansweredCount} 题未保存作答。
          </p>
          <button
            type="button"
            onClick={() => void handleSubmitMockExam()}
            className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            确认交卷
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function StudentExamReportPage({
  state = "ready",
  examReportPublicId = "exam-report-marketing-theory-001",
  examReports,
}: StudentExamReportPageProps) {
  const isRuntimeMode = examReports === undefined;
  const [runtimeState, setRuntimeState] = useState<StudentPageState>("loading");
  const [runtimeExamReports, setRuntimeExamReports] = useState<
    ExamReportDetailDto[]
  >([]);
  const [reloadRequestId, setReloadRequestId] = useState(0);
  const [isLearningSuggestionRetrying, setIsLearningSuggestionRetrying] =
    useState(false);
  const [learningSuggestionRetryError, setLearningSuggestionRetryError] =
    useState<string | null>(null);
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayExamReports = examReports ?? runtimeExamReports;

  async function handleRetryLearningSuggestion(publicId: string) {
    if (!isRuntimeMode || isLearningSuggestionRetrying) {
      return;
    }
    setIsLearningSuggestionRetrying(true);
    setLearningSuggestionRetryError(null);
    try {
      const payload = await fetchStudentApi<null>(
        `/api/v1/exam-reports/${encodeURIComponent(publicId)}/retry-learning-suggestion`,
        getStoredStudentSessionToken(),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        },
      );
      if (payload.code !== 0) {
        setLearningSuggestionRetryError("学习建议恢复失败，请稍后重试。");
        return;
      }
      setReloadRequestId((current) => current + 1);
    } catch {
      setLearningSuggestionRetryError("学习建议恢复失败，请稍后重试。");
    } finally {
      setIsLearningSuggestionRetrying(false);
    }
  }

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadExamReport() {
      const storedSessionValue = getStoredStudentSessionToken();

      try {
        const reportPayload = await fetchStudentApi<ExamReportResultDto>(
          `/api/v1/exam-reports/${examReportPublicId}`,
          storedSessionValue,
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(reportPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (isStudentResourceNotFoundResponse(reportPayload)) {
          setRuntimeState("not_found");
          return;
        }

        if (reportPayload.code !== 0 || reportPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        setRuntimeExamReports([reportPayload.data.examReport]);
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          setRuntimeState("error");
        }
      }
    }

    void loadExamReport();

    return () => {
      isActive = false;
    };
  }, [examReportPublicId, isRuntimeMode, reloadRequestId, state]);

  if (displayState === "loading") {
    return <StudentExamReportLoading />;
  }

  if (displayState === "error") {
    return (
      <StudentStatusMessage
        title="考试报告加载失败"
        description="请稍后刷新页面，或从学员首页重新进入考试报告。"
      />
    );
  }

  if (displayState === "authorization_expired") {
    return (
      <StudentStatusMessage
        title="授权已失效"
        description="当前授权不可用，系统已停止展示考试报告。"
        action={
          <Link
            href="/redeem-code"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            查看授权
          </Link>
        }
      />
    );
  }

  if (displayState === "not_found") {
    return (
      <StudentStatusMessage
        title="未找到考试报告"
        description="该考试报告不存在或已不可用，请从模拟考试记录重新进入。"
        testId="exam-report-empty-state"
        action={
          <Link
            href="/exam-report"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回模拟考试记录
          </Link>
        }
      />
    );
  }

  const examReport =
    displayExamReports.find(
      (report) => report.publicId === examReportPublicId,
    ) ?? null;

  if (examReport === null) {
    return (
      <StudentStatusMessage
        title="未找到考试报告"
        description="该考试报告不存在或已不可用，请从模拟考试记录重新进入。"
        testId="exam-report-empty-state"
        action={
          <Link
            href="/exam-report"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回模拟考试记录
          </Link>
        }
      />
    );
  }

  const parsedReportSnapshot = parseReportSnapshot(examReport.reportSnapshot);
  const questionResultGroups = groupReportQuestionResults(
    parsedReportSnapshot.questionResults,
  );
  const parsedLearningSuggestion = parseLearningSuggestion(
    examReport.learningSuggestionSnapshot,
  );

  async function handleRetryScoring() {
    if (!isRuntimeMode) {
      return;
    }

    const targetMockExamPublicId = examReport?.mockExamPublicId;

    if (targetMockExamPublicId === undefined) {
      return;
    }

    const storedSessionValue = getStoredStudentSessionToken();

    try {
      const retryPayload = await fetchStudentApi<MockExamRetryScoringResultDto>(
        `/api/v1/mock-exams/${targetMockExamPublicId}/retry-scoring`,
        storedSessionValue,
        { method: "POST" },
      );

      if (isStudentUnauthorizedResponse(retryPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (retryPayload.code !== 0 || retryPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      setReloadRequestId(
        (currentReloadRequestId) => currentReloadRequestId + 1,
      );
    } catch {
      setRuntimeState("error");
    }
  }

  if (
    examReport.examStatus === "scoring" ||
    examReport.examStatus === "scoring_partial_failed"
  ) {
    return (
      <StudentScoringProgressPanel
        publicId={examReport.publicId}
        paperName={examReport.paperName}
        mockExamPublicId={examReport.mockExamPublicId}
        status={examReport.examStatus}
        failedScoringCount={getFailedScoringCount(examReport.reportSnapshot)}
        onRefresh={() =>
          setReloadRequestId(
            (currentReloadRequestId) => currentReloadRequestId + 1,
          )
        }
        onRetryScoring={() => void handleRetryScoring()}
      />
    );
  }

  return (
    <section
      data-testid={`exam-report-surface-${examReport.publicId}`}
      data-public-id={examReport.publicId}
      className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 pb-20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={`/mock-exam?mockExamPublicId=${examReport.mockExamPublicId}`}
            className="text-brand-primary text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回模拟考试
          </Link>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {examReport.paperName}
          </h1>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <BarChart3 className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-surface ring-border grid grid-cols-2 gap-2 rounded-xl p-3 text-center shadow-sm ring-1 sm:grid-cols-5">
        <div>
          <p className="text-text-secondary text-xs">状态</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {examStatusLabels[examReport.examStatus]}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">总分</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {examReport.totalScore ?? "--"}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">用时</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {formatDurationSecond(examReport.durationSecond)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">正确率</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {parsedReportSnapshot.accuracyText}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">得分摘要</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {parsedReportSnapshot.scoreSummaryText}
          </p>
        </div>
      </div>

      {parsedReportSnapshot.questionTypeSummaryText === null &&
      parsedReportSnapshot.paperSectionSummaryText === null &&
      parsedReportSnapshot.questionGroupSummaryText === null &&
      parsedReportSnapshot.knowledgeNodeSummaryText === null ? null : (
        <div className="bg-surface ring-border grid gap-2 rounded-xl p-3 text-sm shadow-sm ring-1 sm:grid-cols-2 lg:grid-cols-4">
          {parsedReportSnapshot.questionTypeSummaryText === null ? null : (
            <p className="text-text-secondary">
              {parsedReportSnapshot.questionTypeSummaryText}
            </p>
          )}
          {parsedReportSnapshot.paperSectionSummaryText === null ? null : (
            <p className="text-text-secondary">
              {parsedReportSnapshot.paperSectionSummaryText}
            </p>
          )}
          {parsedReportSnapshot.questionGroupSummaryText === null ? null : (
            <p className="text-text-secondary">
              {parsedReportSnapshot.questionGroupSummaryText}
            </p>
          )}
          {parsedReportSnapshot.knowledgeNodeSummaryText === null ? null : (
            <p className="text-text-secondary">
              {parsedReportSnapshot.knowledgeNodeSummaryText}
            </p>
          )}
        </div>
      )}

      {parsedReportSnapshot.knowledgeNodeAnalyticsStatus === "unavailable" ? (
        <div className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1">
          <p className="text-text-secondary text-sm">知识点分析暂不可用</p>
        </div>
      ) : parsedReportSnapshot.knowledgeNodeAnalysis.length === 0 ? null : (
        <div className="bg-surface ring-border space-y-3 rounded-xl p-4 shadow-sm ring-1">
          <div className="flex items-center gap-2">
            <BarChart3
              className="text-brand-primary size-4"
              aria-hidden="true"
            />
            <h2 className="font-heading text-text-primary text-base font-semibold">
              知识点薄弱项
            </h2>
          </div>
          {formatKnowledgeNodeWeaknessSummaryText(
            parsedReportSnapshot.knowledgeNodeWeaknessSummaryText,
          ) === null ? null : (
            <p className="text-text-muted text-xs">
              {formatKnowledgeNodeWeaknessSummaryText(
                parsedReportSnapshot.knowledgeNodeWeaknessSummaryText,
              )}
            </p>
          )}
          <div className="space-y-2">
            {parsedReportSnapshot.knowledgeNodeAnalysis.map((analysisItem) => (
              <article
                key={analysisItem.knowledgeNodePublicId}
                className="border-border bg-background space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm font-semibold">
                      {formatKnowledgeNodeWeaknessLabel(analysisItem)}
                    </p>
                    <p className="text-text-secondary mt-1 text-xs">
                      覆盖 {analysisItem.questionCount} 题，已答{" "}
                      {analysisItem.answeredCount} 题，正确{" "}
                      {analysisItem.correctCount} 题
                    </p>
                  </div>
                  <p className="text-text-muted text-xs">
                    #{analysisItem.weaknessRank}
                  </p>
                </div>
                <div className="text-text-secondary grid gap-2 text-xs sm:grid-cols-3">
                  <p>得分率 {analysisItem.scoreRate}%</p>
                  <p>正确率 {analysisItem.accuracyRate}%</p>
                  <p>
                    {analysisItem.score} / {analysisItem.maxScore}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface ring-border space-y-3 rounded-xl p-4 shadow-sm ring-1">
        <div className="flex items-center gap-2">
          <FileCheck2
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="font-heading text-text-primary text-base font-semibold">
            题目结果
          </h2>
        </div>
        {questionResultGroups.length === 0 ? (
          <p className="text-text-secondary text-sm">题目结果生成中</p>
        ) : (
          <div className="space-y-3">
            {questionResultGroups.map((questionResultGroup) =>
              questionResultGroup.questionGroupPublicId === null ||
              questionResultGroup.questionGroupTitle === null ? (
                <ReportQuestionResultCard
                  key={questionResultGroup.groupKey}
                  questionResult={questionResultGroup.questionResults[0]}
                  showStructureLabel
                />
              ) : (
                <section
                  key={questionResultGroup.groupKey}
                  className="border-border bg-background space-y-3 rounded-lg border p-3"
                >
                  <div>
                    <h3 className="font-heading text-text-primary text-sm font-semibold">
                      {questionResultGroup.questionGroupTitle}
                    </h3>
                    <p className="text-text-muted mt-1 text-xs">
                      {questionResultGroup.paperSectionTitle} ·{" "}
                      {getReportQuestionGroupScoreText(
                        questionResultGroup.questionResults,
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {questionResultGroup.questionResults.map(
                      (questionResult) => (
                        <ReportQuestionResultCard
                          key={questionResult.paperQuestionPublicId}
                          questionResult={questionResult}
                          showStructureLabel={false}
                        />
                      ),
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
        )}
      </div>

      <div className="bg-surface ring-border space-y-2 rounded-xl p-4 shadow-sm ring-1">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          学习建议
        </h2>
        <p className="text-text-secondary text-sm">
          {examReport.learningSuggestionLifecycle.status === "unavailable"
            ? "学习建议：历史报告暂不可用"
            : examReport.learningSuggestionLifecycle.status === "pending"
              ? "学习建议：等待生成"
              : examReport.learningSuggestionLifecycle.status === "running"
                ? "学习建议：生成中"
                : examReport.learningSuggestionLifecycle.status === "failed"
                  ? "学习建议：生成失败"
                  : "学习建议：已生成"}
        </p>
        {examReport.learningSuggestionLifecycle.canRetry ? (
          <button
            type="button"
            disabled={isLearningSuggestionRetrying}
            onClick={() =>
              void handleRetryLearningSuggestion(examReport.publicId)
            }
            className="bg-primary text-primary-foreground disabled:bg-disabled disabled:text-text-disabled inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium"
          >
            {isLearningSuggestionRetrying ? "正在重试" : "重试生成学习建议"}
          </button>
        ) : null}
        {learningSuggestionRetryError === null ? null : (
          <p className="text-danger text-sm" role="alert">
            {learningSuggestionRetryError}
          </p>
        )}
        {parsedLearningSuggestion === null ? null : (
          <div className="space-y-3 text-sm">
            {parsedLearningSuggestion.summaryText === null ? null : (
              <p className="text-text-primary leading-6">
                {parsedLearningSuggestion.summaryText}
              </p>
            )}
            {parsedLearningSuggestion.suggestionItems.length === 0 ? null : (
              <ul className="text-text-secondary space-y-2">
                {parsedLearningSuggestion.suggestionItems.map(
                  (suggestionItem, index) => (
                    <li
                      key={`${suggestionItem.title ?? "suggestion"}-${index}`}
                      className="border-border bg-background rounded-lg border p-3"
                    >
                      {suggestionItem.title === null ? null : (
                        <p className="text-text-primary mb-1 font-medium">
                          {suggestionItem.title}
                        </p>
                      )}
                      <p>{suggestionItem.detail}</p>
                    </li>
                  ),
                )}
              </ul>
            )}
            {parsedLearningSuggestion.citations.length === 0 ? null : (
              <div className="space-y-2">
                <p className="text-text-primary font-medium">引用来源</p>
                {parsedLearningSuggestion.citations.map((citation) => (
                  <div
                    key={`${citation.title}-${citation.headingPath ?? ""}`}
                    className="border-border bg-background rounded-lg border p-3"
                  >
                    <p className="text-text-primary font-medium">
                      {citation.title}
                    </p>
                    {citation.headingPath === null ? null : (
                      <p className="text-text-secondary mt-1 text-xs">
                        {citation.headingPath}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function StudentExamReportListPage({
  state = "ready",
  examReports,
}: StudentExamReportListPageProps) {
  const isRuntimeMode = examReports === undefined;
  const [runtimeState, setRuntimeState] = useState<StudentPageState>("loading");
  const [runtimeExamReports, setRuntimeExamReports] = useState<
    ExamReportSummaryDto[]
  >([]);
  const [runtimePagination, setRuntimePagination] = useState<ApiPagination>(
    emptyExamReportPagination,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ExamStatus | "all">(
    "all",
  );
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayExamReports = examReports ?? runtimeExamReports;
  const totalPages = Math.max(
    1,
    Math.ceil(runtimePagination.total / examReportPageSize),
  );
  const filteredExamReports = isRuntimeMode
    ? displayExamReports
    : displayExamReports.filter((examReport) => {
        const matchesSearch =
          searchKeyword.trim().length === 0 ||
          examReport.paperName.includes(searchKeyword.trim());
        const matchesStatus =
          selectedStatus === "all" || examReport.examStatus === selectedStatus;

        return matchesSearch && matchesStatus;
      });

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadExamReports() {
      const storedSessionValue = getStoredStudentSessionToken();
      const queryParameters = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(examReportPageSize),
        sortBy: "startedAt",
      });
      const normalizedSearch = searchKeyword.trim();

      if (normalizedSearch.length > 0) {
        queryParameters.set("search", normalizedSearch);
      }

      if (selectedStatus !== "all") {
        queryParameters.set("status", selectedStatus);
      }

      try {
        const reportPayload = await fetchStudentApi<ExamReportListResultDto>(
          `/api/v1/exam-reports?${queryParameters.toString()}`,
          storedSessionValue,
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(reportPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (reportPayload.code !== 0 || reportPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        setRuntimeExamReports(reportPayload.data.examReports);
        setRuntimePagination(
          reportPayload.pagination ?? {
            ...emptyExamReportPagination,
            page: currentPage,
          },
        );
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          setRuntimeState("error");
        }
      }
    }

    void loadExamReports();

    return () => {
      isActive = false;
    };
  }, [currentPage, isRuntimeMode, searchKeyword, selectedStatus, state]);

  if (displayState === "loading") {
    return (
      <section className="space-y-4 p-4" aria-busy="true">
        <p className="text-text-secondary text-sm">正在加载模拟考试记录</p>
        <div className="bg-surface ring-border space-y-3 rounded-xl p-4 shadow-sm ring-1">
          <div className="bg-border h-5 w-2/3 animate-pulse rounded" />
          <div className="bg-border h-4 w-1/2 animate-pulse rounded" />
          <div className="bg-border h-9 w-full animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (displayState === "error") {
    return (
      <StudentStatusMessage
        title="模拟考试记录加载失败"
        description="请稍后刷新页面，或重新登录后再查看记录。"
      />
    );
  }

  if (displayState === "authorization_expired") {
    return (
      <StudentStatusMessage
        title="授权已失效"
        description="当前授权不可用，系统已停止展示模拟考试记录。"
        action={
          <Link
            href="/redeem-code"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            查看授权
          </Link>
        }
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 pb-20">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/home"
            className="text-brand-primary text-sm font-medium transition-transform active:scale-[0.98]"
          >
            返回首页
          </Link>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            模拟考试记录
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            按考试开始时间倒序查看历史模考、评分状态和报告入口。
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <ListChecks className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-surface ring-border grid gap-3 rounded-xl p-4 shadow-sm ring-1 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          <span className="text-text-primary">按试卷名称搜索</span>
          <input
            value={searchKeyword}
            onChange={(event) => {
              setCurrentPage(1);
              setSearchKeyword(event.target.value);
            }}
            className="border-border bg-background text-text-primary focus:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
            placeholder="输入试卷名称"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span className="text-text-primary">按状态筛选</span>
          <select
            value={selectedStatus}
            onChange={(event) => {
              setCurrentPage(1);
              setSelectedStatus(event.target.value as ExamStatus | "all");
            }}
            className="border-border bg-background text-text-primary focus:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          >
            <option value="all">全部状态</option>
            <option value="scoring">评分中</option>
            <option value="scoring_partial_failed">评分未完成</option>
            <option value="completed">已完成</option>
            <option value="terminated">已终止</option>
          </select>
        </label>
      </div>

      {filteredExamReports.length === 0 ? (
        <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
          暂无符合条件的模拟考试记录
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExamReports.map((examReport) => (
            <article
              key={examReport.publicId}
              data-public-id={examReport.publicId}
              className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h2 className="font-heading text-text-primary text-base font-semibold">
                    {examReport.paperName}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    {formatDate(examReport.startedAt)} ·{" "}
                    {examReport.subject === "theory" ? "理论" : "技能"}
                  </p>
                </div>
                <span className="bg-secondary text-secondary-foreground shrink-0 rounded-lg px-2 py-1 text-xs font-medium">
                  {examStatusLabels[examReport.examStatus]}
                </span>
              </div>
              <div className="text-text-secondary grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <span className="bg-background rounded-lg px-3 py-2">
                  总分：{examReport.totalScore ?? "--"}
                </span>
                <span className="bg-background rounded-lg px-3 py-2">
                  客观题：{examReport.objectiveScore ?? "--"}
                </span>
                <span className="bg-background rounded-lg px-3 py-2">
                  用时：{formatDurationSecond(examReport.durationSecond)}
                </span>
              </div>
              {examReport.examStatus === "terminated" ? (
                <p className="text-warning text-sm">
                  已终止考试不生成报告，仅保留后台作答记录。
                </p>
              ) : examReport.examReportPublicId === null ? (
                <Link
                  href={`/mock-exam?mockExamPublicId=${examReport.mockExamPublicId}`}
                  className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
                >
                  {examReport.examStatus === "completed"
                    ? "生成考试报告"
                    : "查看评分进度"}
                </Link>
              ) : (
                <Link
                  href={`/exam-report?examReportPublicId=${examReport.examReportPublicId}`}
                  className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
                >
                  查看报告
                </Link>
              )}
            </article>
          ))}
        </div>
      )}

      {isRuntimeMode ? (
        <div className="border-border bg-surface flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border px-3 font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-text-secondary">
            第 {runtimePagination.page} / {totalPages} 页
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border px-3 font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      ) : null}
    </section>
  );
}
