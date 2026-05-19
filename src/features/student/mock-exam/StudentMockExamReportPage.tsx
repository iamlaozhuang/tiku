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
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  ExamReportDetailDto,
  ExamReportSnapshotDto,
} from "@/server/contracts/exam-report-contract";
import type { MockExamDto } from "@/server/contracts/mock-exam-contract";
import type { ExamStatus } from "@/server/models/student-experience";

type StudentPageState = "ready" | "loading" | "error" | "authorization_expired";

type StudentMockExamPageProps = {
  state?: StudentPageState;
  mockExamPublicId?: string;
  mockExams?: StudentMockExamFixture[];
};

type StudentExamReportPageProps = {
  state?: StudentPageState;
  examReportPublicId?: string;
  examReports?: ExamReportDetailDto[];
};

type StudentMockExamFixture = {
  mockExam: MockExamDto;
  examReportPublicId: string;
};

type MockExamPaperQuestion = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: "single_choice" | "true_false" | "subjective";
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
  title: string;
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  selectedAnswer: string | null;
  standardAnswer: string | null;
  mistakeBookPublicId: string | null;
};

type ParsedReportSnapshot = {
  totalScoreText: string;
  accuracyText: string;
  scoreSummaryText: string;
  questionResults: ReportQuestionResult[];
};

const examStatusLabels: Record<ExamStatus, string> = {
  completed: "已完成",
  in_progress: "进行中",
  scoring: "评分中",
  scoring_partial_failed: "评分部分失败",
  terminated: "已终止",
};

const emptyAnswerSelections: Record<string, string[]> = {};

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

  return value.filter(
    (questionOption): questionOption is MockExamQuestionOption =>
      isRecord(questionOption) &&
      typeof questionOption.label === "string" &&
      typeof questionOption.content === "string",
  );
}

function mapMockExamQuestion(value: unknown): MockExamPaperQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperQuestionPublicId = getStringField(value, "paperQuestionPublicId");
  const questionPublicId = getStringField(value, "questionPublicId");
  const questionType = getStringField(value, "questionType");
  const paperSectionTitle = getStringField(value, "paperSectionTitle");
  const stemRichText = getStringField(value, "stemRichText");

  if (
    paperQuestionPublicId === null ||
    questionPublicId === null ||
    paperSectionTitle === null ||
    stemRichText === null ||
    (questionType !== "single_choice" &&
      questionType !== "true_false" &&
      questionType !== "subjective")
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    questionPublicId,
    questionType,
    paperSectionTitle,
    stemRichText,
    questionOptions: getQuestionOptions(value.questionOptions),
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
    const paperQuestions = Array.isArray(typedPaperSection.paperQuestions)
      ? typedPaperSection.paperQuestions
      : [];

    return paperQuestions
      .map(mapMockExamQuestion)
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
    questionResults: questionResults.filter(
      (questionResult): questionResult is ReportQuestionResult =>
        isRecord(questionResult) &&
        typeof questionResult.paperQuestionPublicId === "string" &&
        typeof questionResult.questionPublicId === "string" &&
        typeof questionResult.title === "string" &&
        (typeof questionResult.isCorrect === "boolean" ||
          questionResult.isCorrect === null) &&
        (typeof questionResult.score === "string" ||
          questionResult.score === null) &&
        typeof questionResult.maxScore === "string" &&
        (typeof questionResult.selectedAnswer === "string" ||
          questionResult.selectedAnswer === null) &&
        (typeof questionResult.standardAnswer === "string" ||
          questionResult.standardAnswer === null) &&
        (typeof questionResult.mistakeBookPublicId === "string" ||
          questionResult.mistakeBookPublicId === null),
    ),
  };
}

export function StudentMockExamPage({
  state = "ready",
  mockExamPublicId = "mock-exam-marketing-theory-001",
  mockExams = studentMockExamFixture.mockExams,
}: StudentMockExamPageProps) {
  const selectedMockExamFixture =
    mockExams.find(
      (mockExamFixture) =>
        mockExamFixture.mockExam.publicId === mockExamPublicId,
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
  const [savedAnswerByQuestion, setSavedAnswerByQuestion] = useState(
    emptyAnswerSelections,
  );
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (state === "loading") {
    return <StudentMockExamLoading />;
  }

  if (state === "error") {
    return (
      <StudentStatusMessage
        title="模拟考试加载失败"
        description="请稍后刷新页面，或从学员首页重新进入模拟考试。"
      />
    );
  }

  if (state === "authorization_expired") {
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

  if (
    selectedMockExamFixture === null ||
    mockExam === null ||
    questions.length === 0
  ) {
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
  const isCurrentQuestionSaved =
    savedAnswerByQuestion[currentQuestion.paperQuestionPublicId] !== undefined;
  const answeredCount = Object.keys(savedAnswerByQuestion).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const remainingMinute = getRemainingMinute(mockExam);

  function handleToggleLabel(label: string) {
    const nextSelectedLabels = includesLabel(selectedLabels, label)
      ? []
      : [label];

    setSelectedLabelsByQuestion({
      ...selectedLabelsByQuestion,
      [currentQuestion.paperQuestionPublicId]: nextSelectedLabels,
    });
  }

  function handleSaveAnswer() {
    setSavedAnswerByQuestion({
      ...savedAnswerByQuestion,
      [currentQuestion.paperQuestionPublicId]: selectedLabels,
    });
  }

  if (isSubmitted) {
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
          href={`/exam-report?examReportPublicId=${selectedMockExamFixture.examReportPublicId}`}
          className="bg-primary text-primary-foreground flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          查看考试报告
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

        <MockExamQuestionPanel
          question={currentQuestion}
          selectedLabels={selectedLabels}
          isSaved={isCurrentQuestionSaved}
          onToggleLabel={handleToggleLabel}
          onSaveAnswer={handleSaveAnswer}
        />
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
            onClick={() => setIsSubmitted(true)}
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
  examReports = studentExamReportFixture.examReports,
}: StudentExamReportPageProps) {
  if (state === "loading") {
    return <StudentExamReportLoading />;
  }

  if (state === "error") {
    return (
      <StudentStatusMessage
        title="考试报告加载失败"
        description="请稍后刷新页面，或从学员首页重新进入考试报告。"
      />
    );
  }

  if (state === "authorization_expired") {
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

  const examReport =
    examReports.find((report) => report.publicId === examReportPublicId) ??
    null;

  if (examReport === null) {
    return (
      <StudentStatusMessage
        title="暂无考试报告"
        description="该模拟考试暂未生成可展示的考试报告。"
        testId="exam-report-empty-state"
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

  const parsedReportSnapshot = parseReportSnapshot(examReport.reportSnapshot);

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
                  <p className="text-text-primary text-sm font-semibold">
                    {questionResult.title}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {questionResult.score ?? "待评分"} /{" "}
                    {questionResult.maxScore}
                  </p>
                </div>
                <p className="text-text-secondary text-sm">
                  作答：{questionResult.selectedAnswer ?? "未作答"}；标准答案：
                  {questionResult.standardAnswer ?? "生成中"}
                </p>
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
