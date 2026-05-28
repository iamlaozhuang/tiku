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
import { useEffect, useMemo, useState } from "react";

import {
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type {
  ExamReportDetailDto,
  ExamReportListResultDto,
  ExamReportResultDto,
  ExamReportSummaryDto,
  ExamReportSnapshotDto,
} from "@/server/contracts/exam-report-contract";
import type {
  MockExamAnswerRecordResultDto,
  MockExamDto,
  MockExamResultDto,
  MockExamRetryScoringResultDto,
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
  savedFromClientAt: string;
  queuedAt: string;
};

type MockExamPendingAnswerQueuePayload = {
  queuedAt: string;
  answers: Record<string, MockExamPendingAnswer>;
};

const mockExamCacheStorageKeyPrefix = "tiku.mockExam.cache.";
const mockExamAnswerQueueStorageKeyPrefix = "tiku.mockExam.answerQueue.";

function createMockExamCacheStorageKey(input: {
  paperPublicId?: string;
  mockExamPublicId: string;
}): string {
  return `${mockExamCacheStorageKeyPrefix}${
    input.paperPublicId ?? input.mockExamPublicId
  }`;
}

function readCachedMockExam(cacheStorageKey: string): MockExamDto | null {
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
  cacheStorageKey: string,
  mockExam: MockExamDto,
): void {
  try {
    localStorage.setItem(
      cacheStorageKey,
      JSON.stringify({
        cachedAt: new Date().toISOString(),
        mockExam,
      } satisfies MockExamCachePayload),
    );
  } catch {
    // Local cache is a recovery supplement; runtime loading must not depend on it.
  }
}

function createMockExamAnswerQueueStorageKey(mockExamPublicId: string): string {
  return `${mockExamAnswerQueueStorageKeyPrefix}${mockExamPublicId}`;
}

function readPendingMockExamAnswers(
  mockExamPublicId: string,
): Record<string, MockExamPendingAnswer> {
  try {
    const queueStorageKey =
      createMockExamAnswerQueueStorageKey(mockExamPublicId);
    const queuedValue = localStorage.getItem(queueStorageKey);

    if (queuedValue === null) {
      return {};
    }

    const parsedValue = JSON.parse(
      queuedValue,
    ) as Partial<MockExamPendingAnswerQueuePayload>;

    return parsedValue.answers ?? {};
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
  stemRichText: string;
  questionOptions: MockExamQuestionOption[];
  score: string;
};

type MockExamQuestionOption = {
  label: string;
  content: string;
};

type MockExamPaperSection = {
  paperQuestions?: unknown;
};

type ReportQuestionResult = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: MockExamQuestionType | null;
  scoringMethod: string | null;
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

type ParsedReportSnapshot = {
  totalScoreText: string;
  accuracyText: string;
  scoreSummaryText: string;
  questionTypeSummaryText: string | null;
  paperSectionSummaryText: string | null;
  knowledgeNodeSummaryText: string | null;
  questionResults: ReportQuestionResult[];
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
    stemRichText,
    questionOptions: getQuestionOptions(getQuestionOptionSource(value)),
    score: getStringField(value, "score") ?? "0.0",
  };
}

function extractMockExamQuestions(
  paperSnapshot: Record<string, unknown>,
): MockExamPaperQuestion[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.flatMap((paperSection): MockExamPaperQuestion[] => {
    if (!isRecord(paperSection)) {
      return [];
    }

    const typedPaperSection = paperSection as MockExamPaperSection;
    const paperSectionTitle =
      getStringField(paperSection, "paperSectionTitle") ??
      getStringField(paperSection, "title");
    const paperQuestions = Array.isArray(typedPaperSection.paperQuestions)
      ? typedPaperSection.paperQuestions
      : [];

    return paperQuestions
      .map((paperQuestion) =>
        mapMockExamQuestion(paperQuestion, paperSectionTitle),
      )
      .filter(
        (question): question is MockExamPaperQuestion => question !== null,
      );
  });
}

function getPaperName(mockExam: MockExamDto): string {
  const paperName = mockExam.paperSnapshot.name;

  return typeof paperName === "string" ? paperName : "模拟考试";
}

function getRemainingMinute(mockExam: MockExamDto): number | null {
  if (mockExam.serverDeadlineAt === null) {
    return null;
  }

  const deadlineTime = new Date(mockExam.serverDeadlineAt).getTime();
  const serverTime = new Date(mockExam.serverNow).getTime();
  const remainingMillisecond = deadlineTime - serverTime;

  return Math.max(Math.ceil(remainingMillisecond / 60000), 0);
}

function formatDate(value: string | null): string {
  return value === null ? "未记录" : value.slice(0, 10);
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
    knowledgeNodeSummaryText:
      typeof reportSnapshot.knowledgeNodeSummaryText === "string"
        ? reportSnapshot.knowledgeNodeSummaryText
        : null,
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
  onRefresh,
  onRetryScoring,
}: {
  publicId: string;
  paperName: string;
  mockExamPublicId: string;
  status: ScoringProgressStatus | "completed";
  failedScoringCount: number | null;
  completedReportPublicId?: string | null;
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
          <p className="text-text-secondary text-sm break-all">{publicId}</p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <Clock3 className="size-5" aria-hidden="true" />
        </div>
      </div>

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
  mockExamPublicId = "mock-exam-marketing-theory-001",
  mockExams,
}: StudentMockExamPageProps) {
  const isRuntimeMode = mockExams === undefined;
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
      : mockExamPublicId;
  const selectedMockExamFixture =
    displayMockExams.find(
      (mockExamFixture) =>
        mockExamFixture.mockExam.publicId === selectedMockExamPublicId,
    ) ?? null;
  const mockExam = selectedMockExamFixture?.mockExam ?? null;
  const questions = useMemo(
    () =>
      mockExam === null ? [] : extractMockExamQuestions(mockExam.paperSnapshot),
    [mockExam],
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
  const pendingAnswerCount = Object.keys(pendingAnswerByQuestion).length;

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadMockExam() {
      const token = getStoredStudentSessionToken();
      const cacheStorageKey = createMockExamCacheStorageKey({
        paperPublicId,
        mockExamPublicId,
      });

      if (token === null) {
        if (isActive) {
          setRuntimeState("authorization_expired");
        }
        return;
      }

      try {
        const mockExamPayload =
          paperPublicId === undefined
            ? await fetchStudentApi<MockExamResultDto>(
                `/api/v1/mock-exams/${mockExamPublicId}`,
                token,
              )
            : await fetchStudentApi<MockExamResultDto>(
                "/api/v1/mock-exams",
                token,
                {
                  method: "POST",
                  body: JSON.stringify({ paperPublicId }),
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

        setRuntimeMockExams([
          {
            mockExam: mockExamPayload.data.mockExam,
            examReportPublicId: "",
          },
        ]);
        setPendingAnswerByQuestion(
          readPendingMockExamAnswers(mockExamPayload.data.mockExam.publicId),
        );
        writeCachedMockExam(cacheStorageKey, mockExamPayload.data.mockExam);
        setIsOfflineRecovered(false);
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          const cachedMockExam = readCachedMockExam(cacheStorageKey);

          if (cachedMockExam !== null) {
            setRuntimeMockExams([
              {
                mockExam: cachedMockExam,
                examReportPublicId: "",
              },
            ]);
            setPendingAnswerByQuestion(
              readPendingMockExamAnswers(cachedMockExam.publicId),
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
  }, [isRuntimeMode, mockExamPublicId, paperPublicId, state]);

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

  const currentQuestion = questions[currentQuestionIndex] ?? questions[0];
  const selectedLabels =
    selectedLabelsByQuestion[currentQuestion.paperQuestionPublicId] ?? [];
  const textAnswer =
    textAnswerByQuestion[currentQuestion.paperQuestionPublicId] ?? "";
  const isCurrentQuestionSaved =
    savedAnswerByQuestion[currentQuestion.paperQuestionPublicId] !== undefined;
  const answeredCount = Object.keys(savedAnswerByQuestion).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const remainingMinute = getRemainingMinute(mockExam);

  function handleToggleLabel(label: string) {
    const nextSelectedLabels =
      currentQuestion.questionType === "multi_choice"
        ? includesLabel(selectedLabels, label)
          ? selectedLabels.filter((selectedLabel) => selectedLabel !== label)
          : [...selectedLabels, label]
        : includesLabel(selectedLabels, label)
          ? []
          : [label];

    setSelectedLabelsByQuestion({
      ...selectedLabelsByQuestion,
      [currentQuestion.paperQuestionPublicId]: nextSelectedLabels,
    });
  }

  function handleChangeTextAnswer(textAnswerValue: string) {
    setTextAnswerByQuestion({
      ...textAnswerByQuestion,
      [currentQuestion.paperQuestionPublicId]: textAnswerValue,
    });
  }

  function createPendingAnswer(
    mockExamPublicId: string,
    question: MockExamPaperQuestion,
  ) {
    return {
      mockExamPublicId,
      paperQuestionPublicId: question.paperQuestionPublicId,
      selectedLabels: isOptionMockExamQuestion(question.questionType)
        ? selectedLabels
        : [],
      textAnswer: isTextMockExamQuestion(question.questionType)
        ? textAnswer
        : null,
      savedFromClientAt: new Date().toISOString(),
      queuedAt: new Date().toISOString(),
    } satisfies MockExamPendingAnswer;
  }

  async function sendMockExamAnswer(
    token: string,
    pendingAnswer: MockExamPendingAnswer,
  ) {
    return await fetchStudentApi<MockExamAnswerRecordResultDto>(
      `/api/v1/mock-exams/${pendingAnswer.mockExamPublicId}/answers`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          paperQuestionPublicId: pendingAnswer.paperQuestionPublicId,
          selectedLabels: pendingAnswer.selectedLabels,
          textAnswer: pendingAnswer.textAnswer,
          savedFromClientAt: pendingAnswer.savedFromClientAt,
        }),
      },
    );
  }

  function markAnswerSaved(pendingAnswer: MockExamPendingAnswer) {
    setSavedAnswerByQuestion({
      ...savedAnswerByQuestion,
      [pendingAnswer.paperQuestionPublicId]:
        pendingAnswer.selectedLabels.length > 0
          ? pendingAnswer.selectedLabels
          : [pendingAnswer.textAnswer ?? ""],
    });
  }

  function queuePendingAnswer(pendingAnswer: MockExamPendingAnswer) {
    const nextPendingAnswerByQuestion = {
      ...pendingAnswerByQuestion,
      [pendingAnswer.paperQuestionPublicId]: pendingAnswer,
    };

    setPendingAnswerByQuestion(nextPendingAnswerByQuestion);
    writePendingMockExamAnswers(
      pendingAnswer.mockExamPublicId,
      nextPendingAnswerByQuestion,
    );
    markAnswerSaved(pendingAnswer);
  }

  async function handleSaveAnswer() {
    if (mockExam === null) {
      return;
    }

    if (isRuntimeMode) {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        setRuntimeState("authorization_expired");
        return;
      }

      try {
        const pendingAnswer = createPendingAnswer(
          mockExam.publicId,
          currentQuestion,
        );
        const answerPayload = await sendMockExamAnswer(token, pendingAnswer);

        if (isStudentUnauthorizedResponse(answerPayload)) {
          setIsRetryingPendingAnswers(false);
          setRuntimeState("authorization_expired");
          return;
        }

        if (answerPayload.code !== 0 || answerPayload.data === null) {
          setRuntimeState("error");
          return;
        }
      } catch {
        queuePendingAnswer(
          createPendingAnswer(mockExam.publicId, currentQuestion),
        );
        return;
      }
    }

    setSavedAnswerByQuestion({
      ...savedAnswerByQuestion,
      [currentQuestion.paperQuestionPublicId]: isOptionMockExamQuestion(
        currentQuestion.questionType,
      )
        ? selectedLabels
        : [textAnswer],
    });
  }

  async function handleRetryPendingAnswers() {
    if (mockExam === null || pendingAnswerCount === 0) {
      return;
    }

    const token = getStoredStudentSessionToken();

    if (token === null) {
      setRuntimeState("authorization_expired");
      return;
    }

    setIsRetryingPendingAnswers(true);

    const remainingPendingAnswers: Record<string, MockExamPendingAnswer> = {};

    for (const pendingAnswer of Object.values(pendingAnswerByQuestion)) {
      try {
        const answerPayload = await sendMockExamAnswer(token, pendingAnswer);

        if (isStudentUnauthorizedResponse(answerPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (answerPayload.code !== 0 || answerPayload.data === null) {
          remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
            pendingAnswer;
          continue;
        }
      } catch {
        remainingPendingAnswers[pendingAnswer.paperQuestionPublicId] =
          pendingAnswer;
      }
    }

    setPendingAnswerByQuestion(remainingPendingAnswers);
    writePendingMockExamAnswers(mockExam.publicId, remainingPendingAnswers);
    setIsRetryingPendingAnswers(false);
  }

  async function generateRuntimeExamReport(
    token: string,
    targetMockExamPublicId: string,
  ): Promise<string | null> {
    const reportPayload = await fetchStudentApi<ExamReportResultDto>(
      "/api/v1/exam-reports",
      token,
      {
        method: "POST",
        body: JSON.stringify({ mockExamPublicId: targetMockExamPublicId }),
      },
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

    const token = getStoredStudentSessionToken();

    if (token === null) {
      setRuntimeState("authorization_expired");
      return;
    }

    try {
      const mockExamPayload = await fetchStudentApi<MockExamResultDto>(
        `/api/v1/mock-exams/${runtimeScoringProgress.mockExamPublicId}`,
        token,
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
          token,
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

    const token = getStoredStudentSessionToken();

    if (token === null) {
      setRuntimeState("authorization_expired");
      return;
    }

    try {
      const retryPayload = await fetchStudentApi<MockExamRetryScoringResultDto>(
        `/api/v1/mock-exams/${runtimeScoringProgress.mockExamPublicId}/retry-scoring`,
        token,
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
          token,
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
      const token = getStoredStudentSessionToken();

      if (token === null) {
        setRuntimeState("authorization_expired");
        return;
      }

      try {
        const submitPayload = await fetchStudentApi<MockExamSubmitResultDto>(
          `/api/v1/mock-exams/${mockExam.publicId}/submit`,
          token,
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
          token,
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
          <p className="text-text-secondary text-sm break-all">
            {mockExam.publicId}
          </p>
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
          Offline recovery: showing cached mock exam.
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
            第 {currentQuestionIndex + 1} / {questions.length} 题
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">已保存</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {answeredCount} / {questions.length}
          </p>
        </div>
      </div>

      <article className="bg-surface ring-border space-y-5 rounded-xl p-4 shadow-sm ring-1">
        <div className="space-y-2">
          <div className="text-text-secondary flex items-center gap-2 text-xs">
            <FileText className="size-3.5" aria-hidden="true" />
            <span>{currentQuestion.paperSectionTitle}</span>
          </div>
          <p className="font-heading text-text-primary text-lg leading-7 font-semibold">
            {currentQuestion.stemRichText}
          </p>
          <p className="text-text-secondary text-sm">
            本题 {currentQuestion.score} 分
          </p>
        </div>

        {isOptionMockExamQuestion(currentQuestion.questionType) ? (
          <MockExamQuestionPanel
            question={currentQuestion}
            selectedLabels={selectedLabels}
            isSaved={isCurrentQuestionSaved}
            onToggleLabel={handleToggleLabel}
            onSaveAnswer={() => void handleSaveAnswer()}
          />
        ) : (
          <MockExamTextAnswerPanel
            textAnswer={textAnswer}
            isSaved={isCurrentQuestionSaved}
            onChangeTextAnswer={handleChangeTextAnswer}
            onSaveAnswer={() => void handleSaveAnswer()}
          />
        )}
      </article>

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
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {questions.map((question, questionIndex) => {
            const isSaved =
              savedAnswerByQuestion[question.paperQuestionPublicId] !==
              undefined;
            const isCurrent = questionIndex === currentQuestionIndex;

            return (
              <button
                key={question.paperQuestionPublicId}
                type="button"
                onClick={() => setCurrentQuestionIndex(questionIndex)}
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

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={currentQuestionIndex === questions.length - 1}
          onClick={() =>
            setCurrentQuestionIndex(
              Math.min(currentQuestionIndex + 1, questions.length - 1),
            )
          }
          className="border-border text-text-primary flex h-10 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一题
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
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayExamReports = examReports ?? runtimeExamReports;

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadExamReport() {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        if (isActive) {
          setRuntimeState("authorization_expired");
        }
        return;
      }

      try {
        const reportPayload = await fetchStudentApi<ExamReportResultDto>(
          `/api/v1/exam-reports/${examReportPublicId}`,
          token,
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

  async function handleRetryScoring() {
    if (!isRuntimeMode) {
      return;
    }

    const targetMockExamPublicId = examReport?.mockExamPublicId;

    if (targetMockExamPublicId === undefined) {
      return;
    }

    const token = getStoredStudentSessionToken();

    if (token === null) {
      setRuntimeState("authorization_expired");
      return;
    }

    try {
      const retryPayload = await fetchStudentApi<MockExamRetryScoringResultDto>(
        `/api/v1/mock-exams/${targetMockExamPublicId}/retry-scoring`,
        token,
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
          <p className="text-text-secondary text-sm break-all">
            {examReport.publicId}
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <BarChart3 className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-surface ring-border grid grid-cols-1 gap-2 rounded-xl p-3 text-center shadow-sm ring-1 sm:grid-cols-4">
        <div>
          <p className="text-text-secondary text-xs">状态</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {examStatusLabels[examReport.examStatus]}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">总分</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {parsedReportSnapshot.totalScoreText}
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
      parsedReportSnapshot.knowledgeNodeSummaryText === null ? null : (
        <div className="bg-surface ring-border grid gap-2 rounded-xl p-3 text-sm shadow-sm ring-1 sm:grid-cols-3">
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
          {parsedReportSnapshot.knowledgeNodeSummaryText === null ? null : (
            <p className="text-text-secondary">
              {parsedReportSnapshot.knowledgeNodeSummaryText}
            </p>
          )}
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
        {parsedReportSnapshot.questionResults.length === 0 ? (
          <p className="text-text-secondary text-sm">题目结果生成中</p>
        ) : (
          <div className="space-y-3">
            {parsedReportSnapshot.questionResults.map((questionResult) => (
              <article
                key={questionResult.paperQuestionPublicId}
                className="border-border bg-background space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    {questionResult.questionType === null ? null : (
                      <p className="text-text-muted text-xs">
                        {questionTypeLabels[questionResult.questionType]}
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
                    {questionResult.score ?? "待评分"} /{" "}
                    {questionResult.maxScore}
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
                  <p className="text-warning text-sm font-medium">
                    已加入错题本：{questionResult.mistakeBookPublicId}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface ring-border space-y-2 rounded-xl p-4 shadow-sm ring-1">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          学习建议
        </h2>
        <p className="text-text-secondary text-sm">
          {examReport.learningSuggestionSnapshot === null
            ? "学习建议：生成中"
            : "学习建议：已生成"}
        </p>
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ExamStatus | "all">(
    "all",
  );
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayExamReports = examReports ?? runtimeExamReports;
  const filteredExamReports = displayExamReports.filter((examReport) => {
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
      const token = getStoredStudentSessionToken();

      if (token === null) {
        if (isActive) {
          setRuntimeState("authorization_expired");
        }
        return;
      }

      try {
        const reportPayload = await fetchStudentApi<ExamReportListResultDto>(
          "/api/v1/exam-reports?page=1&pageSize=20&sortBy=startedAt",
          token,
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
  }, [isRuntimeMode, state]);

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
            onChange={(event) => setSearchKeyword(event.target.value)}
            className="border-border bg-background text-text-primary focus:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
            placeholder="输入试卷名称"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span className="text-text-primary">按状态筛选</span>
          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as ExamStatus | "all")
            }
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
                  得分：{examReport.totalScore ?? "--"}
                </span>
                <span className="bg-background rounded-lg px-3 py-2">
                  客观题：{examReport.objectiveScore ?? "--"}
                </span>
                <span className="bg-background rounded-lg px-3 py-2">
                  用时：{Math.round(examReport.durationSecond / 60)} 分钟
                </span>
              </div>
              {examReport.examStatus === "terminated" ? (
                <p className="text-warning text-sm">
                  已终止考试不生成报告，仅保留后台作答记录。
                </p>
              ) : (
                <Link
                  href={`/exam-report?examReportPublicId=${examReport.examReportPublicId ?? examReport.publicId}`}
                  className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
                >
                  查看报告
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
