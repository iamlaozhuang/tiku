"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpenCheck,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import {
  StudentRichText,
  getStudentRichTextPlainText,
} from "@/components/StudentRichText/StudentRichText";
import type {
  PracticeAnswerFeedbackDto,
  PracticeAnswerFeedbackResultDto,
  PracticeDto,
  PracticeQuestionFavoriteResultDto,
  PracticeResultDto,
} from "@/server/contracts/practice-contract";
import type { Profession, Subject } from "@/server/models/paper";
import { listPublishedPaperSnapshotQuestionEntries } from "@/lib/published-paper-snapshot";

type StudentPracticePageState =
  | "ready"
  | "loading"
  | "error"
  | "not_found"
  | "authorization_expired";

type StudentPracticePageProps = {
  state?: StudentPracticePageState;
  paperPublicId?: string;
  authorizationSource?: string;
  authorizationPublicId?: string;
  practices?: StudentPracticeFixture[];
};

type StudentPracticeFixture = {
  practice: PracticeDto;
  feedbackByPaperQuestionPublicId: Record<string, PracticeAnswerFeedbackDto>;
};

type PracticeQuestionType =
  | "single_choice"
  | "multi_choice"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "case_analysis"
  | "calculation";

type PracticePaperQuestion = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: PracticeQuestionType;
  paperSectionTitle: string;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  materialPublicId: string | null;
  materialTitle: string | null;
  materialRichText: string | null;
  stemRichText: string;
  questionOptions: PracticeQuestionOption[];
  standardAnswerRichText: string | null;
  analysisRichText: string | null;
  score: string;
};

type PracticeQuestionOption = {
  label: string;
  content: string;
};

type PracticeQuestionPage = {
  pageKey: string;
  firstQuestionIndex: number;
  paperSectionTitle: string;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  materialPublicId: string | null;
  materialTitle: string | null;
  materialRichText: string | null;
  questions: PracticePaperQuestion[];
};

const professionLabels: Record<Profession, string> = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
};

const subjectLabels: Record<Subject, string> = {
  skill: "技能",
  theory: "理论",
};

const emptyAnswerSelections: Record<string, string[]> = {};
const emptyTextAnswers: Record<string, string> = {};
const emptyFeedback: Record<string, PracticeAnswerFeedbackDto> = {};

function isStudentResourceNotFoundResponse(payload: { code: number }): boolean {
  return payload.code === 404001;
}

function createPracticeDto(
  practice: Omit<PracticeDto, "questionCount">,
): PracticeDto {
  const questionCount = extractPracticeQuestionPages(
    practice.paperSnapshot,
  ).reduce((total, page) => total + page.questions.length, 0);

  return {
    ...practice,
    questionCount,
  };
}

const marketingTheoryPractice = createPracticeDto({
  publicId: "practice-marketing-theory-001",
  paperPublicId: "paper-marketing-theory-002",
  profession: "marketing",
  level: 3,
  subject: "theory",
  practiceStatus: "in_progress",
  startedAt: "2026-05-19T08:00:00.000Z",
  lastAnsweredAt: null,
  expiresAt: "2026-06-03T08:00:00.000Z",
  currentQuestionIndex: 0,
  paperSnapshot: {
    paperPublicId: "paper-marketing-theory-002",
    name: "营销理论冲刺卷 B",
    profession: "marketing",
    level: 3,
    subject: "theory",
    paperType: "past_paper",
    durationMinute: 120,
    totalScore: "100",
    publishedAt: "2026-05-18T08:00:00Z",
    paperSections: [
      {
        title: "一、单项选择题",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper-question-marketing-001",
            questionPublicId: "question-marketing-001",
            questionType: "single_choice",
            paperSectionTitle: "一、单项选择题",
            questionGroupTitle: null,
            materialTitle: null,
            materialRichText: null,
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
            paperQuestionPublicId: "paper-question-marketing-002",
            questionPublicId: "question-marketing-002",
            questionType: "single_choice",
            paperSectionTitle: "一、单项选择题",
            questionGroupTitle: null,
            materialTitle: null,
            materialRichText: null,
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
        ],
      },
    ],
  },
});

const marketingSkillPractice = createPracticeDto({
  publicId: "practice-marketing-skill-001",
  paperPublicId: "paper-marketing-skill-001",
  profession: "marketing",
  level: 3,
  subject: "skill",
  practiceStatus: "in_progress",
  startedAt: "2026-05-19T08:10:00.000Z",
  lastAnsweredAt: null,
  expiresAt: "2026-06-03T08:10:00.000Z",
  currentQuestionIndex: 0,
  paperSnapshot: {
    paperPublicId: "paper-marketing-skill-001",
    name: "营销技能案例卷",
    profession: "marketing",
    level: 3,
    subject: "skill",
    paperType: "mock_paper",
    durationMinute: null,
    totalScore: "100",
    publishedAt: "2026-05-12T08:00:00Z",
    paperSections: [
      {
        title: "客户异议处理案例",
        paperQuestions: [
          {
            paperQuestionPublicId: "paper-question-skill-001",
            questionPublicId: "question-skill-001",
            questionType: "subjective",
            paperSectionTitle: "客户异议处理案例",
            questionGroupTitle: "客户异议处理案例",
            materialTitle: "客户异议处理案例",
            materialRichText: "材料：客户连续两次反馈配送延迟。",
            stemRichText: "请写出你的沟通处理步骤。",
            questionOptions: [],
            standardAnswerRichText: null,
            analysisRichText: null,
            score: "10.0",
          },
        ],
      },
    ],
  },
});

export const studentPracticeFixture: {
  practices: StudentPracticeFixture[];
} = {
  practices: [
    {
      practice: marketingTheoryPractice,
      feedbackByPaperQuestionPublicId: {
        "paper-question-marketing-001": {
          answerRecordPublicId: "answer-record-marketing-001",
          isCorrect: false,
          score: "0.0",
          maxScore: "2.0",
          standardAnswerRichText: "正确答案：B. 客户需求分析",
          analysisRichText: "解析：客户需求分析用于识别客户真实购买动机。",
          mistakeBookPublicId: "mistake-book-marketing-001",
          aiExplanationStatus: null,
          aiExplanationText: null,
          aiExplanationLearningSuggestion: null,
          aiExplanationEvidenceStatus: null,
          aiExplanationCitations: [],
          aiHintStatus: null,
          aiHintText: null,
          aiHintImprovementDirections: [],
          aiHintEvidenceStatus: null,
          aiHintCitations: [],
          retryRemainingCount: 0,
          answeredAt: "2026-05-19T08:12:00.000Z",
        },
        "paper-question-marketing-002": {
          answerRecordPublicId: "answer-record-marketing-002",
          isCorrect: true,
          score: "2.0",
          maxScore: "2.0",
          standardAnswerRichText: "正确答案：A. 记录客户反馈并形成改进清单",
          analysisRichText: "解析：复盘需要沉淀问题、责任和改进动作。",
          mistakeBookPublicId: null,
          aiExplanationStatus: null,
          aiExplanationText: null,
          aiExplanationLearningSuggestion: null,
          aiExplanationEvidenceStatus: null,
          aiExplanationCitations: [],
          aiHintStatus: null,
          aiHintText: null,
          aiHintImprovementDirections: [],
          aiHintEvidenceStatus: null,
          aiHintCitations: [],
          retryRemainingCount: 0,
          answeredAt: "2026-05-19T08:15:00.000Z",
        },
      },
    },
    {
      practice: marketingSkillPractice,
      feedbackByPaperQuestionPublicId: {
        "paper-question-skill-001": {
          answerRecordPublicId: "answer-record-skill-001",
          isCorrect: null,
          score: null,
          maxScore: "10.0",
          standardAnswerRichText: null,
          analysisRichText: null,
          mistakeBookPublicId: null,
          aiExplanationStatus: null,
          aiExplanationText: null,
          aiExplanationLearningSuggestion: null,
          aiExplanationEvidenceStatus: null,
          aiExplanationCitations: [],
          aiHintStatus: null,
          aiHintText: null,
          aiHintImprovementDirections: [],
          aiHintEvidenceStatus: null,
          aiHintCitations: [],
          retryRemainingCount: 0,
          answeredAt: "2026-05-19T08:18:00.000Z",
        },
      },
    },
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

function getQuestionOptions(value: unknown): PracticeQuestionOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((option): PracticeQuestionOption[] => {
    if (!isRecord(option) || typeof option.label !== "string") {
      return [];
    }

    const content =
      getStringField(option, "content") ??
      getStringField(option, "contentRichText");

    return content === null ? [] : [{ label: option.label, content }];
  });
}

function getQuestionOptionSource(value: Record<string, unknown>): unknown {
  return Array.isArray(value.questionOptions)
    ? value.questionOptions
    : value.options;
}

function normalizePracticeQuestionType(
  value: string | null,
): PracticeQuestionType | null {
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

function isOptionPracticeQuestion(questionType: PracticeQuestionType): boolean {
  return (
    questionType === "single_choice" ||
    questionType === "multi_choice" ||
    questionType === "true_false"
  );
}

function isFillBlankPracticeQuestion(
  questionType: PracticeQuestionType,
): boolean {
  return questionType === "fill_blank";
}

function isSubjectivePracticeQuestion(
  questionType: PracticeQuestionType,
): boolean {
  return (
    questionType === "short_answer" ||
    questionType === "case_analysis" ||
    questionType === "calculation"
  );
}

function mapPracticeQuestion(
  value: unknown,
  fallbackPaperSectionTitle: string | null,
  questionGroup: Record<string, unknown> | null,
): PracticePaperQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperQuestionPublicId = getStringField(value, "paperQuestionPublicId");
  const questionPublicId = getStringField(value, "questionPublicId");
  const questionType = normalizePracticeQuestionType(
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
    materialPublicId:
      materialSnapshot === null
        ? null
        : getStringField(materialSnapshot, "materialPublicId"),
    materialTitle:
      getStringField(value, "materialTitle") ??
      (materialSnapshot === null
        ? null
        : getStringField(materialSnapshot, "title")),
    materialRichText:
      getStringField(value, "materialRichText") ??
      (materialSnapshot === null
        ? null
        : getStringField(materialSnapshot, "contentRichText")),
    stemRichText,
    questionOptions: getQuestionOptions(getQuestionOptionSource(value)),
    standardAnswerRichText: getStringField(value, "standardAnswerRichText"),
    analysisRichText: getStringField(value, "analysisRichText"),
    score: getStringField(value, "score") ?? "0.0",
  };
}

function extractPracticeQuestionPages(
  paperSnapshot: Record<string, unknown>,
): PracticeQuestionPage[] {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).reduce<
    PracticeQuestionPage[]
  >((pages, { paperSection, questionGroup, paperQuestion }) => {
    const question = mapPracticeQuestion(
      paperQuestion,
      getStringField(paperSection, "paperSectionTitle") ??
        getStringField(paperSection, "title"),
      questionGroup,
    );

    if (question === null) {
      return pages;
    }

    const pageKey =
      question.questionGroupPublicId === null
        ? `paper_question:${question.paperQuestionPublicId}`
        : `question_group:${question.questionGroupPublicId}`;
    const nextQuestionIndex = pages.reduce(
      (questionCount, page) => questionCount + page.questions.length,
      0,
    );
    const existingPageIndex = pages.findIndex(
      (page) => page.pageKey === pageKey,
    );

    if (existingPageIndex === -1) {
      return [
        ...pages,
        {
          pageKey,
          firstQuestionIndex: nextQuestionIndex,
          paperSectionTitle: question.paperSectionTitle,
          questionGroupPublicId: question.questionGroupPublicId,
          questionGroupTitle: question.questionGroupTitle,
          materialPublicId: question.materialPublicId,
          materialTitle: question.materialTitle,
          materialRichText: question.materialRichText,
          questions: [question],
        },
      ];
    }

    return pages.map((page, pageIndex) =>
      pageIndex === existingPageIndex
        ? { ...page, questions: [...page.questions, question] }
        : page,
    );
  }, []);
}

function extractPracticeQuestions(
  paperSnapshot: Record<string, unknown>,
): PracticePaperQuestion[] {
  return extractPracticeQuestionPages(paperSnapshot).flatMap(
    (page) => page.questions,
  );
}

function getPaperName(practice: PracticeDto): string {
  const paperName = practice.paperSnapshot.name;

  return typeof paperName === "string" ? paperName : "练习";
}

function getPracticeScopeLabel(practice: PracticeDto): string {
  return `${professionLabels[practice.profession]} ${practice.level}级 · ${
    subjectLabels[practice.subject]
  }`;
}

function hasPracticeResumeProgress(
  practice: PracticeDto,
  answerRecordCount: number,
): boolean {
  return (
    answerRecordCount > 0 ||
    practice.currentQuestionIndex > 0 ||
    practice.lastAnsweredAt !== null
  );
}

function includesLabel(selectedLabels: string[], label: string): boolean {
  return selectedLabels.includes(label);
}

function isPracticeQuestionFeedbackTerminal(
  question: PracticePaperQuestion,
  feedback: PracticeAnswerFeedbackDto | null,
): boolean {
  if (feedback === null) {
    return false;
  }

  return !isSubjectivePracticeQuestion(question.questionType)
    ? true
    : feedback.score !== null || feedback.aiHintStatus === "unavailable";
}

function StudentPracticeStatusMessage({
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

function PracticeResumeChoicePanel({
  practice,
  isRestarting,
  isRestartConfirmationVisible,
  onContinuePractice,
  onCancelRestartPractice,
  onConfirmRestartPractice,
  onRequestRestartPractice,
}: {
  practice: PracticeDto;
  isRestarting: boolean;
  isRestartConfirmationVisible: boolean;
  onContinuePractice: () => void;
  onCancelRestartPractice: () => void;
  onConfirmRestartPractice: () => void;
  onRequestRestartPractice: () => void;
}) {
  return (
    <section
      data-testid="practice-resume-choice"
      data-public-id={practice.publicId}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20 lg:max-w-5xl"
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
            {getPaperName(practice)}
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            {getPracticeScopeLabel(practice)}
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            检测到未完成的练习
          </p>
          <h2 className="font-heading text-text-primary text-xl font-semibold">
            继续上次进度或重新开始
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            当前进度保留到第 {practice.currentQuestionIndex + 1} 题，有效期至{" "}
            {practice.expiresAt.slice(0, 10)}。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            data-testid="practice-resume-continue-button"
            onClick={onContinuePractice}
            className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            继续练习
          </button>
          <button
            type="button"
            data-testid="practice-resume-restart-button"
            disabled={isRestarting}
            onClick={onRequestRestartPractice}
            className="border-border text-text-primary flex h-10 items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            重新开始
          </button>
        </div>

        {isRestartConfirmationVisible ? (
          <div
            className="bg-warning/10 ring-warning/20 space-y-3 rounded-xl p-3 ring-1"
            data-testid="practice-restart-confirmation"
          >
            <p className="text-text-primary text-sm font-medium">
              重新开始会清空当前未完成进度
            </p>
            <p className="text-text-secondary text-sm leading-6">
              已提交的作答记录仍保留在历史记录中，当前未完成练习会从第 1
              题重新开始。
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onCancelRestartPractice}
                className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isRestarting}
                onClick={onConfirmRestartPractice}
                className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                确认重新开始练习
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StudentPracticeLoading() {
  return (
    <section className="space-y-4 p-4" aria-busy="true">
      <div>
        <p className="text-text-secondary text-sm">正在加载练习进度</p>
        <div className="bg-border mt-3 h-9 w-40 animate-pulse rounded-lg" />
      </div>
      <div className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="bg-border h-5 w-3/4 animate-pulse rounded" />
        <div className="bg-border h-20 w-full animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-border h-10 animate-pulse rounded-lg" />
          <div className="bg-border h-10 animate-pulse rounded-lg" />
        </div>
      </div>
    </section>
  );
}

function ObjectiveQuestionPanel({
  question,
  selectedLabels,
  feedback,
  onToggleLabel,
  onSubmitAnswer,
  onFavoriteQuestion,
  onRequestAiExplanation,
  onNextQuestion,
  hasNextQuestion,
  showNavigation,
  isFavoriteSubmitting,
}: {
  question: PracticePaperQuestion;
  selectedLabels: string[];
  feedback: PracticeAnswerFeedbackDto | null;
  onToggleLabel(label: string): void;
  onSubmitAnswer(): void;
  onFavoriteQuestion(): void;
  onRequestAiExplanation(): void;
  onNextQuestion(): void;
  hasNextQuestion: boolean;
  showNavigation: boolean;
  isFavoriteSubmitting: boolean;
}) {
  const hasFeedback = feedback !== null;

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
              aria-label={`${questionOption.label}. ${getStudentRichTextPlainText(
                questionOption.content,
              )}`}
              disabled={hasFeedback}
              onClick={() => onToggleLabel(questionOption.label)}
              className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-primary border"
              }`}
            >
              <span className="flex items-center gap-1">
                <span>{questionOption.label}.</span>
                <span> </span>
                <StudentRichText
                  as="span"
                  mode="inline"
                  value={questionOption.content}
                />
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
        disabled={selectedLabels.length === 0 || hasFeedback}
        onClick={onSubmitAnswer}
        className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        提交答案
      </button>

      {feedback === null ? null : (
        <div className="bg-background ring-border space-y-3 rounded-xl p-4 ring-1">
          <div className="flex items-center gap-2">
            {feedback.isCorrect ? (
              <CheckCircle2
                className="text-success size-5"
                aria-hidden="true"
              />
            ) : (
              <XCircle className="text-error size-5" aria-hidden="true" />
            )}
            <p className="font-heading text-text-primary text-base font-semibold">
              {feedback.isCorrect ? "回答正确" : "回答错误"}
            </p>
          </div>
          {feedback.standardAnswerRichText === null ? null : (
            <StudentRichText
              className="text-text-primary space-y-2 text-sm leading-6"
              value={feedback.standardAnswerRichText}
            />
          )}
          {feedback.analysisRichText === null ? null : (
            <StudentRichText
              className="text-text-secondary space-y-2 text-sm leading-6"
              value={feedback.analysisRichText}
            />
          )}
          {feedback.mistakeBookPublicId === null ? null : (
            <p className="text-warning text-sm font-medium">
              已加入错题本：{feedback.mistakeBookPublicId}
            </p>
          )}
          {feedback.mistakeBookPublicId !== null ? null : (
            <button
              type="button"
              disabled={isFavoriteSubmitting}
              onClick={onFavoriteQuestion}
              className="border-border text-text-primary flex h-9 w-full items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Bookmark className="size-4" aria-hidden="true" />
              收藏到错题本
            </button>
          )}
          <AiExplanationFeedback
            feedback={feedback}
            onRequestAiExplanation={onRequestAiExplanation}
          />
          {showNavigation ? (
            <button
              type="button"
              onClick={onNextQuestion}
              disabled={!hasNextQuestion}
              className="border-border text-text-primary flex h-9 w-full items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasNextQuestion ? "下一题" : "已到最后一题"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function FillBlankQuestionPanel({
  textAnswer,
  feedback,
  onChangeTextAnswer,
  onSubmitAnswer,
  onFavoriteQuestion,
  onRequestAiExplanation,
  onNextQuestion,
  hasNextQuestion,
  showNavigation,
  isFavoriteSubmitting,
}: {
  textAnswer: string;
  feedback: PracticeAnswerFeedbackDto | null;
  onChangeTextAnswer(value: string): void;
  onSubmitAnswer(): void;
  onFavoriteQuestion(): void;
  onRequestAiExplanation(): void;
  onNextQuestion(): void;
  hasNextQuestion: boolean;
  showNavigation: boolean;
  isFavoriteSubmitting: boolean;
}) {
  const hasFeedback = feedback !== null;

  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">填空题答案</span>
        <input
          aria-label="填空题答案"
          disabled={hasFeedback}
          value={textAnswer}
          onChange={(event) => onChangeTextAnswer(event.target.value)}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-10 rounded-lg border px-3 text-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <button
        type="button"
        disabled={textAnswer.trim().length === 0 || hasFeedback}
        onClick={onSubmitAnswer}
        className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        提交答案
      </button>

      {feedback === null ? null : (
        <div className="bg-background ring-border space-y-3 rounded-xl p-4 ring-1">
          <div className="flex items-center gap-2">
            {feedback.isCorrect ? (
              <CheckCircle2
                className="text-success size-5"
                aria-hidden="true"
              />
            ) : (
              <XCircle className="text-error size-5" aria-hidden="true" />
            )}
            <p className="text-text-primary text-sm font-semibold">
              {feedback.isCorrect ? "回答正确" : "回答错误"}
            </p>
          </div>
          {feedback.standardAnswerRichText === null ? null : (
            <div className="text-text-secondary space-y-1 text-sm">
              <p>正确答案：</p>
              <StudentRichText value={feedback.standardAnswerRichText} />
            </div>
          )}
          {feedback.analysisRichText === null ? null : (
            <div className="text-text-secondary space-y-1 text-sm">
              <p>解析：</p>
              <StudentRichText value={feedback.analysisRichText} />
            </div>
          )}
          {feedback.mistakeBookPublicId === null ? (
            <button
              type="button"
              disabled={isFavoriteSubmitting}
              onClick={onFavoriteQuestion}
              className="border-border text-text-primary flex h-9 w-full items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Bookmark className="size-4" aria-hidden="true" />
              收藏到错题本
            </button>
          ) : (
            <p className="text-warning text-sm font-medium">
              已加入错题本：{feedback.mistakeBookPublicId}
            </p>
          )}
          <AiExplanationFeedback
            feedback={feedback}
            onRequestAiExplanation={onRequestAiExplanation}
          />
          {showNavigation && hasNextQuestion ? (
            <button
              type="button"
              onClick={onNextQuestion}
              className="border-border text-text-primary flex h-9 w-full items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
            >
              下一题
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function AiExplanationFeedback({
  feedback,
  onRequestAiExplanation,
}: {
  feedback: PracticeAnswerFeedbackDto;
  onRequestAiExplanation(): void;
}) {
  if (feedback.aiExplanationStatus === "unavailable") {
    return (
      <p className="text-text-secondary text-sm">
        AI 讲解暂不可用，老师解析仍可正常查看。
      </p>
    );
  }

  if (
    feedback.aiExplanationStatus !== "explained" &&
    feedback.aiExplanationStatus !== "available"
  ) {
    return null;
  }

  if (feedback.aiExplanationStatus === "available") {
    return (
      <button
        type="button"
        onClick={onRequestAiExplanation}
        className="border-border text-text-primary flex h-9 w-full items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
      >
        Need AI explanation
      </button>
    );
  }

  return (
    <section className="border-border space-y-2 border-t pt-3">
      <p className="text-text-primary text-sm font-semibold">AI explanation</p>
      {feedback.aiExplanationText === null ? null : (
        <p className="text-text-secondary text-sm leading-6">
          {feedback.aiExplanationText}
        </p>
      )}
      {feedback.aiExplanationLearningSuggestion === null ? null : (
        <p className="text-text-secondary text-sm leading-6">
          {feedback.aiExplanationLearningSuggestion}
        </p>
      )}
      <p className="text-text-muted text-xs">
        Evidence status: {feedback.aiExplanationEvidenceStatus ?? "none"}
      </p>
    </section>
  );
}

function SubjectiveQuestionPanel({
  question,
  textAnswer,
  feedback,
  isMaterialOpen,
  showMaterial,
  showNavigation,
  hasNextQuestion,
  nextActionLabel,
  onToggleMaterial,
  onChangeTextAnswer,
  onSubmitAnswer,
  onRetryWithHint,
  onRequestAiScoring,
  onNextQuestion,
}: {
  question: PracticePaperQuestion;
  textAnswer: string;
  feedback: PracticeAnswerFeedbackDto | null;
  isMaterialOpen: boolean;
  showMaterial: boolean;
  showNavigation: boolean;
  hasNextQuestion: boolean;
  nextActionLabel: string;
  onToggleMaterial(): void;
  onChangeTextAnswer(value: string): void;
  onSubmitAnswer(): void;
  onRetryWithHint(): void;
  onRequestAiScoring(): void;
  onNextQuestion(): void;
}) {
  const canRetryWithHint =
    feedback !== null && feedback.retryRemainingCount > 0;
  const hasFinalScore = feedback !== null && feedback.score !== null;
  const hasTerminalFeedback =
    hasFinalScore || feedback?.aiHintStatus === "unavailable";

  return (
    <div className="space-y-4">
      {showMaterial ? (
        <div className="border-border bg-background rounded-xl border p-3">
          <button
            type="button"
            onClick={onToggleMaterial}
            className="text-text-primary flex w-full items-center justify-between text-left text-sm font-semibold transition-transform active:scale-[0.98]"
          >
            <span>{question.materialTitle ?? "材料"}</span>
            {isMaterialOpen ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4" aria-hidden="true" />
            )}
          </button>
          {isMaterialOpen && question.materialRichText !== null ? (
            <StudentRichText
              className="text-text-secondary mt-3 space-y-2 text-sm leading-6"
              value={question.materialRichText}
            />
          ) : null}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-text-primary text-sm font-medium">
          主观题答案
        </span>
        <textarea
          value={textAnswer}
          onChange={(event) => onChangeTextAnswer(event.target.value)}
          disabled={feedback !== null}
          rows={5}
          className="border-border bg-surface text-text-primary placeholder:text-text-muted focus:ring-primary/20 w-full resize-none rounded-lg border px-3 py-2 text-sm leading-6 transition-shadow outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="请输入你的处理步骤"
        />
      </label>

      <button
        type="button"
        disabled={textAnswer.trim().length === 0 || feedback !== null}
        onClick={onSubmitAnswer}
        className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        提交答案
      </button>

      {feedback === null ? null : (
        <div className="bg-background ring-border space-y-3 rounded-xl p-4 ring-1">
          <p className="font-heading text-text-primary text-base font-semibold">
            主观题答案已保存
          </p>
          {hasFinalScore ? (
            <p className="text-text-primary text-sm font-semibold">
              Final score: {feedback.score} / {feedback.maxScore}
            </p>
          ) : feedback.aiHintStatus === "unavailable" ? (
            <p className="text-text-secondary text-sm">
              AI 提示与评分暂不可用，答案已安全保存。
            </p>
          ) : feedback.aiHintText === null ? (
            <p className="text-text-secondary text-sm">AI 提示生成中</p>
          ) : (
            <div className="space-y-2">
              <p className="text-text-secondary text-sm leading-6">
                {feedback.aiHintText}
              </p>
              <p className="text-text-muted text-xs">
                证据状态：{feedback.aiHintEvidenceStatus ?? "none"}
              </p>
              {feedback.aiHintImprovementDirections.length === 0 ? null : (
                <ul className="text-text-secondary list-disc space-y-1 pl-5 text-xs leading-5">
                  {feedback.aiHintImprovementDirections.map((direction) => (
                    <li key={direction}>{direction}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={
                !canRetryWithHint || feedback.aiHintStatus === "unavailable"
              }
              onClick={onRetryWithHint}
              className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              AI 提示并重答一次
            </button>
            <button
              type="button"
              onClick={onRequestAiScoring}
              disabled={
                hasFinalScore || feedback.aiHintStatus === "unavailable"
              }
              className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
            >
              直接查看评分
            </button>
          </div>
          {showNavigation && hasTerminalFeedback ? (
            hasNextQuestion ? (
              <button
                type="button"
                onClick={onNextQuestion}
                className="border-border text-text-primary flex h-9 w-full items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
              >
                {nextActionLabel}
              </button>
            ) : (
              <Link
                href="/home"
                className="bg-primary text-primary-foreground flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
              >
                完成练习
              </Link>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

export function StudentPracticePage({
  state = "ready",
  paperPublicId,
  authorizationSource,
  authorizationPublicId,
  practices,
}: StudentPracticePageProps) {
  const isRuntimeMode = practices === undefined;
  const selectedPaperPublicId =
    paperPublicId ?? (isRuntimeMode ? null : "paper-marketing-theory-002");
  const [runtimeState, setRuntimeState] =
    useState<StudentPracticePageState>("loading");
  const [runtimePractices, setRuntimePractices] = useState<
    StudentPracticeFixture[]
  >([]);
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayPractices = practices ?? runtimePractices;
  const selectedPracticeFixture =
    selectedPaperPublicId === null
      ? null
      : (displayPractices.find(
          (practiceFixture) =>
            practiceFixture.practice.paperPublicId === selectedPaperPublicId,
        ) ?? null);
  const practice = selectedPracticeFixture?.practice ?? null;
  const questionPages = useMemo(
    () =>
      practice === null
        ? []
        : extractPracticeQuestionPages(practice.paperSnapshot),
    [practice],
  );
  const questions = useMemo(
    () => questionPages.flatMap((page) => page.questions),
    [questionPages],
  );
  const initialQuestionIndex =
    practice === null
      ? 0
      : Math.min(
          practice.currentQuestionIndex,
          Math.max(questions.length - 1, 0),
        );
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);
  const [selectedLabelsByQuestion, setSelectedLabelsByQuestion] = useState(
    emptyAnswerSelections,
  );
  const [textAnswerByQuestion, setTextAnswerByQuestion] =
    useState(emptyTextAnswers);
  const [feedbackByQuestion, setFeedbackByQuestion] = useState(emptyFeedback);
  const [isMaterialOpen, setIsMaterialOpen] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRestartConfirmationVisible, setIsRestartConfirmationVisible] =
    useState(false);
  const [
    favoriteSubmittingQuestionPublicId,
    setFavoriteSubmittingQuestionPublicId,
  ] = useState<string | null>(null);
  const [isResumeChoiceVisible, setIsResumeChoiceVisible] = useState(false);

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready" || selectedPaperPublicId === null) {
      return;
    }

    let isActive = true;

    async function loadPractice() {
      const storedSessionValue = getStoredStudentSessionToken();

      try {
        const practicePayload = await fetchStudentApi<PracticeResultDto>(
          "/api/v1/practices",
          storedSessionValue,
          {
            method: "POST",
            body: JSON.stringify({
              paperPublicId: selectedPaperPublicId,
              authorizationSource,
              authorizationPublicId,
            }),
          },
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(practicePayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (isStudentResourceNotFoundResponse(practicePayload)) {
          setRuntimeState("not_found");
          return;
        }

        if (practicePayload.code !== 0 || practicePayload.data === null) {
          setRuntimeState("error");
          return;
        }

        setRuntimePractices([
          {
            practice: practicePayload.data.practice,
            feedbackByPaperQuestionPublicId: {},
          },
        ]);
        setIsResumeChoiceVisible(
          hasPracticeResumeProgress(
            practicePayload.data.practice,
            practicePayload.data.answerRecords.length,
          ),
        );
        setCurrentQuestionIndex(
          Math.min(
            practicePayload.data.practice.currentQuestionIndex,
            Math.max(
              extractPracticeQuestions(
                practicePayload.data.practice.paperSnapshot,
              ).length - 1,
              0,
            ),
          ),
        );
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          setRuntimeState("error");
        }
      }
    }

    void loadPractice();

    return () => {
      isActive = false;
    };
  }, [
    authorizationPublicId,
    authorizationSource,
    isRuntimeMode,
    selectedPaperPublicId,
    state,
  ]);

  if (isRuntimeMode && state === "ready" && selectedPaperPublicId === null) {
    return (
      <StudentPracticeStatusMessage
        title="请选择练习入口"
        description="请先从学员首页选择试卷后再进入普通练习。"
        testId="practice-empty-state"
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
    return <StudentPracticeLoading />;
  }

  if (displayState === "error") {
    return (
      <StudentPracticeStatusMessage
        title="练习加载失败"
        description="请稍后刷新页面，或从学员首页重新进入练习。"
      />
    );
  }

  if (displayState === "authorization_expired") {
    return (
      <StudentPracticeStatusMessage
        title="授权已失效"
        description="当前专业或等级授权不可用，系统已停止展示练习内容。"
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

  if (displayState === "not_found" || selectedPracticeFixture === null) {
    return (
      <StudentPracticeStatusMessage
        title="未找到练习"
        description="该练习入口不存在或已不可用，请从学员首页重新进入。"
        testId="practice-empty-state"
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

  if (practice === null || questions.length === 0) {
    return (
      <StudentPracticeStatusMessage
        title="暂无可继续的练习"
        description="该试卷暂未创建练习进度，或练习快照为空。"
        testId="practice-empty-state"
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
  const hasNextQuestion = currentPageIndex < questionPages.length - 1;
  const isQuestionGroupPage = currentPage.questionGroupPublicId !== null;
  const isCurrentPageComplete = currentPage.questions.every((question) =>
    isPracticeQuestionFeedbackTerminal(
      question,
      feedbackByQuestion[question.paperQuestionPublicId] ?? null,
    ),
  );

  function handleToggleLabel(question: PracticePaperQuestion, label: string) {
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
    question: PracticePaperQuestion,
    textAnswerValue: string,
  ) {
    setTextAnswerByQuestion({
      ...textAnswerByQuestion,
      [question.paperQuestionPublicId]: textAnswerValue,
    });
  }

  async function handleSubmitAnswer(question: PracticePaperQuestion) {
    if (practice === null) {
      return;
    }

    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    let nextFeedback =
      selectedPracticeFixture?.feedbackByPaperQuestionPublicId[
        question.paperQuestionPublicId
      ] ?? null;

    if (isRuntimeMode) {
      const storedSessionValue = getStoredStudentSessionToken();

      try {
        const answerPayload =
          await fetchStudentApi<PracticeAnswerFeedbackResultDto>(
            `/api/v1/practices/${practice.publicId}/answers`,
            storedSessionValue,
            {
              method: "POST",
              body: JSON.stringify({
                paperQuestionPublicId: question.paperQuestionPublicId,
                selectedLabels: isOptionPracticeQuestion(question.questionType)
                  ? questionSelectedLabels
                  : [],
                textAnswer:
                  isFillBlankPracticeQuestion(question.questionType) ||
                  isSubjectivePracticeQuestion(question.questionType)
                    ? questionTextAnswer
                    : null,
                savedFromClientAt: new Date().toISOString(),
              }),
            },
          );

        if (isStudentUnauthorizedResponse(answerPayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (answerPayload.code !== 0 || answerPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        nextFeedback = answerPayload.data.feedback;
      } catch {
        setRuntimeState("error");
        return;
      }
    }

    if (nextFeedback === null) {
      return;
    }

    setFeedbackByQuestion((currentFeedbackByQuestion) => ({
      ...currentFeedbackByQuestion,
      [question.paperQuestionPublicId]: nextFeedback,
    }));
  }

  async function handleFavoriteQuestion(question: PracticePaperQuestion) {
    const questionFeedback =
      feedbackByQuestion[question.paperQuestionPublicId] ?? null;

    if (practice === null || questionFeedback === null) {
      return;
    }

    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    setFavoriteSubmittingQuestionPublicId(question.paperQuestionPublicId);

    try {
      let mistakeBookPublicId = `mistake-book-${question.paperQuestionPublicId}`;

      if (isRuntimeMode) {
        const storedSessionValue = getStoredStudentSessionToken();

        const favoritePayload =
          await fetchStudentApi<PracticeQuestionFavoriteResultDto>(
            `/api/v1/practices/${practice.publicId}/favorite-question`,
            storedSessionValue,
            {
              method: "POST",
              body: JSON.stringify({
                paperQuestionPublicId: question.paperQuestionPublicId,
                selectedLabels: isOptionPracticeQuestion(question.questionType)
                  ? questionSelectedLabels
                  : [],
                textAnswer: isFillBlankPracticeQuestion(question.questionType)
                  ? questionTextAnswer
                  : null,
                savedFromClientAt: new Date().toISOString(),
              }),
            },
          );

        if (isStudentUnauthorizedResponse(favoritePayload)) {
          setRuntimeState("authorization_expired");
          return;
        }

        if (favoritePayload.code !== 0 || favoritePayload.data === null) {
          setRuntimeState("error");
          return;
        }

        mistakeBookPublicId = favoritePayload.data.mistakeBookPublicId;
      }

      setFeedbackByQuestion((currentFeedbackByQuestion) => ({
        ...currentFeedbackByQuestion,
        [question.paperQuestionPublicId]: {
          ...questionFeedback,
          mistakeBookPublicId,
        },
      }));
    } catch {
      setRuntimeState("error");
    } finally {
      setFavoriteSubmittingQuestionPublicId(null);
    }
  }

  async function handleRequestAiExplanation(question: PracticePaperQuestion) {
    const questionFeedback =
      feedbackByQuestion[question.paperQuestionPublicId] ?? null;

    if (practice === null || questionFeedback === null || !isRuntimeMode) {
      return;
    }

    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    const storedSessionValue = getStoredStudentSessionToken();

    try {
      const explanationPayload =
        await fetchStudentApi<PracticeAnswerFeedbackResultDto>(
          `/api/v1/practices/${practice.publicId}/answers`,
          storedSessionValue,
          {
            method: "POST",
            body: JSON.stringify({
              paperQuestionPublicId: question.paperQuestionPublicId,
              selectedLabels: isOptionPracticeQuestion(question.questionType)
                ? questionSelectedLabels
                : [],
              textAnswer: isFillBlankPracticeQuestion(question.questionType)
                ? questionTextAnswer
                : null,
              aiExplanationTrigger: "manual_request",
              savedFromClientAt: new Date().toISOString(),
            }),
          },
        );

      if (isStudentUnauthorizedResponse(explanationPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (explanationPayload.code !== 0 || explanationPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      const explanationFeedback = explanationPayload.data.feedback;

      setFeedbackByQuestion((currentFeedbackByQuestion) => ({
        ...currentFeedbackByQuestion,
        [question.paperQuestionPublicId]: explanationFeedback,
      }));
    } catch {
      setRuntimeState("error");
    }
  }

  async function handleRequestAiScoring(question: PracticePaperQuestion) {
    const questionFeedback =
      feedbackByQuestion[question.paperQuestionPublicId] ?? null;

    if (practice === null || questionFeedback === null || !isRuntimeMode) {
      return;
    }

    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";

    const storedSessionValue = getStoredStudentSessionToken();

    try {
      const scoringPayload =
        await fetchStudentApi<PracticeAnswerFeedbackResultDto>(
          `/api/v1/practices/${practice.publicId}/answers`,
          storedSessionValue,
          {
            method: "POST",
            body: JSON.stringify({
              paperQuestionPublicId: question.paperQuestionPublicId,
              selectedLabels: [],
              textAnswer: questionTextAnswer,
              aiScoringTrigger: "manual_request",
              savedFromClientAt: new Date().toISOString(),
            }),
          },
        );

      if (isStudentUnauthorizedResponse(scoringPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (scoringPayload.code !== 0 || scoringPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      const scoringFeedback = scoringPayload.data.feedback;

      setFeedbackByQuestion((currentFeedbackByQuestion) => ({
        ...currentFeedbackByQuestion,
        [question.paperQuestionPublicId]: scoringFeedback,
      }));
    } catch {
      setRuntimeState("error");
    }
  }

  function handleNextQuestion() {
    const nextPage = questionPages[currentPageIndex + 1];

    if (nextPage !== undefined) {
      setCurrentQuestionIndex(nextPage.firstQuestionIndex);
      setIsMaterialOpen(true);
    }
  }

  function handleRetryWithHint(question: PracticePaperQuestion) {
    setFeedbackByQuestion((currentFeedbackByQuestion) => {
      const {
        [question.paperQuestionPublicId]: _removedFeedback,
        ...remainingFeedbackByQuestion
      } = currentFeedbackByQuestion;

      void _removedFeedback;

      return remainingFeedbackByQuestion;
    });
  }

  async function handleRestartPractice() {
    if (practice === null) {
      return;
    }

    if (!isRuntimeMode) {
      setCurrentQuestionIndex(0);
      setSelectedLabelsByQuestion(emptyAnswerSelections);
      setTextAnswerByQuestion(emptyTextAnswers);
      setFeedbackByQuestion(emptyFeedback);
      setIsMaterialOpen(true);
      setIsResumeChoiceVisible(false);
      setIsRestartConfirmationVisible(false);
      return;
    }

    const storedSessionValue = getStoredStudentSessionToken();

    setIsRestarting(true);

    try {
      const restartPayload = await fetchStudentApi<PracticeResultDto>(
        `/api/v1/practices/${practice.publicId}/restart`,
        storedSessionValue,
        {
          method: "POST",
        },
      );

      if (isStudentUnauthorizedResponse(restartPayload)) {
        setRuntimeState("authorization_expired");
        return;
      }

      if (restartPayload.code !== 0 || restartPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      const restartedPractice = restartPayload.data.practice;

      setRuntimePractices([
        {
          practice: restartedPractice,
          feedbackByPaperQuestionPublicId: {},
        },
      ]);
      setCurrentQuestionIndex(
        Math.min(
          restartedPractice.currentQuestionIndex,
          Math.max(
            extractPracticeQuestions(restartedPractice.paperSnapshot).length -
              1,
            0,
          ),
        ),
      );
      setSelectedLabelsByQuestion(emptyAnswerSelections);
      setTextAnswerByQuestion(emptyTextAnswers);
      setFeedbackByQuestion(emptyFeedback);
      setIsMaterialOpen(true);
      setIsResumeChoiceVisible(false);
      setIsRestartConfirmationVisible(false);
      setRuntimeState("ready");
    } catch {
      setRuntimeState("error");
    } finally {
      setIsRestarting(false);
    }
  }

  function renderQuestionPanel(
    question: PracticePaperQuestion,
    options: { showMaterial: boolean; showNavigation: boolean },
  ) {
    const questionSelectedLabels =
      selectedLabelsByQuestion[question.paperQuestionPublicId] ?? [];
    const questionTextAnswer =
      textAnswerByQuestion[question.paperQuestionPublicId] ?? "";
    const questionFeedback =
      feedbackByQuestion[question.paperQuestionPublicId] ?? null;

    if (isOptionPracticeQuestion(question.questionType)) {
      return (
        <ObjectiveQuestionPanel
          question={question}
          selectedLabels={questionSelectedLabels}
          feedback={questionFeedback}
          onToggleLabel={(label) => handleToggleLabel(question, label)}
          onSubmitAnswer={() => void handleSubmitAnswer(question)}
          onFavoriteQuestion={() => void handleFavoriteQuestion(question)}
          onRequestAiExplanation={() =>
            void handleRequestAiExplanation(question)
          }
          onNextQuestion={handleNextQuestion}
          hasNextQuestion={hasNextQuestion}
          showNavigation={options.showNavigation}
          isFavoriteSubmitting={
            favoriteSubmittingQuestionPublicId ===
            question.paperQuestionPublicId
          }
        />
      );
    }

    if (isFillBlankPracticeQuestion(question.questionType)) {
      return (
        <FillBlankQuestionPanel
          textAnswer={questionTextAnswer}
          feedback={questionFeedback}
          onChangeTextAnswer={(value) =>
            handleChangeTextAnswer(question, value)
          }
          onSubmitAnswer={() => void handleSubmitAnswer(question)}
          onFavoriteQuestion={() => void handleFavoriteQuestion(question)}
          onRequestAiExplanation={() =>
            void handleRequestAiExplanation(question)
          }
          onNextQuestion={handleNextQuestion}
          hasNextQuestion={hasNextQuestion}
          showNavigation={options.showNavigation}
          isFavoriteSubmitting={
            favoriteSubmittingQuestionPublicId ===
            question.paperQuestionPublicId
          }
        />
      );
    }

    return (
      <SubjectiveQuestionPanel
        question={question}
        textAnswer={questionTextAnswer}
        feedback={questionFeedback}
        isMaterialOpen={isMaterialOpen}
        showMaterial={options.showMaterial}
        showNavigation={options.showNavigation}
        hasNextQuestion={hasNextQuestion}
        nextActionLabel={practice?.subject === "skill" ? "下一组" : "下一题"}
        onToggleMaterial={() => setIsMaterialOpen(!isMaterialOpen)}
        onChangeTextAnswer={(value) => handleChangeTextAnswer(question, value)}
        onSubmitAnswer={() => void handleSubmitAnswer(question)}
        onRetryWithHint={() => handleRetryWithHint(question)}
        onRequestAiScoring={() => void handleRequestAiScoring(question)}
        onNextQuestion={handleNextQuestion}
      />
    );
  }

  if (isRuntimeMode && isResumeChoiceVisible) {
    return (
      <PracticeResumeChoicePanel
        practice={practice}
        isRestarting={isRestarting}
        isRestartConfirmationVisible={isRestartConfirmationVisible}
        onContinuePractice={() => setIsResumeChoiceVisible(false)}
        onCancelRestartPractice={() => setIsRestartConfirmationVisible(false)}
        onConfirmRestartPractice={() => void handleRestartPractice()}
        onRequestRestartPractice={() => setIsRestartConfirmationVisible(true)}
      />
    );
  }

  return (
    <section
      data-testid={`practice-surface-${practice.publicId}`}
      data-public-id={practice.publicId}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20 lg:max-w-5xl"
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
            {getPaperName(practice)}
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            {getPracticeScopeLabel(practice)}
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="bg-surface ring-border grid grid-cols-3 gap-2 rounded-xl p-3 text-center shadow-sm ring-1">
        <div>
          <p className="text-text-secondary text-xs">进度</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {practice.subject === "skill"
              ? `第 ${currentPageIndex + 1} / ${questionPages.length} 组`
              : `第 ${currentQuestionIndex + 1} / ${questions.length} 题`}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">练习</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            练习模式
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">有效期</p>
          <p className="text-text-primary mt-1 text-sm font-semibold">
            {practice.expiresAt.slice(0, 10)}
          </p>
        </div>
      </div>

      {isQuestionGroupPage ? (
        <article
          data-testid={`practice-question-group-${currentPage.questionGroupPublicId}`}
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
          </div>

          {currentPage.materialRichText === null ? null : (
            <div className="border-border bg-background rounded-xl border p-3">
              <button
                type="button"
                onClick={() => setIsMaterialOpen(!isMaterialOpen)}
                className="text-text-primary flex w-full items-center justify-between text-left text-sm font-semibold transition-transform active:scale-[0.98]"
              >
                <span>{currentPage.materialTitle ?? "材料"}</span>
                {isMaterialOpen ? (
                  <ChevronDown className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="size-4" aria-hidden="true" />
                )}
              </button>
              {isMaterialOpen ? (
                <StudentRichText
                  className="text-text-secondary mt-3 space-y-2 text-sm leading-6"
                  value={currentPage.materialRichText}
                />
              ) : null}
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
                  <StudentRichText
                    className="font-heading text-text-primary space-y-2 text-lg leading-7 font-semibold"
                    value={question.stemRichText}
                  />
                  <p className="text-text-secondary text-sm">
                    本题 {question.score} 分
                  </p>
                </div>
                {renderQuestionPanel(question, {
                  showMaterial: false,
                  showNavigation: false,
                })}
              </section>
            ))}
          </div>

          {isCurrentPageComplete ? (
            hasNextQuestion ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
              >
                下一组
              </button>
            ) : (
              <Link
                href="/home"
                className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
              >
                完成练习
              </Link>
            )
          ) : null}
        </article>
      ) : (
        <article className="bg-surface ring-border space-y-5 rounded-xl p-4 shadow-sm ring-1">
          <div className="space-y-2">
            <div className="text-text-secondary flex items-center gap-2 text-xs">
              <FileText className="size-3.5" aria-hidden="true" />
              <span>{currentQuestion.paperSectionTitle}</span>
              {currentQuestion.questionGroupTitle === null ? null : (
                <span>{currentQuestion.questionGroupTitle}</span>
              )}
            </div>
            <StudentRichText
              className="font-heading text-text-primary space-y-2 text-lg leading-7 font-semibold"
              value={currentQuestion.stemRichText}
            />
            <p className="text-text-secondary text-sm">
              本题 {currentQuestion.score} 分
            </p>
          </div>
          {renderQuestionPanel(currentQuestion, {
            showMaterial: true,
            showNavigation: true,
          })}
        </article>
      )}

      {isRestartConfirmationVisible ? (
        <div
          className="bg-warning/10 ring-warning/20 space-y-3 rounded-xl p-4 ring-1"
          data-testid="practice-restart-confirmation"
        >
          <p className="text-text-primary text-sm font-medium">
            重新开始会清空当前未完成进度
          </p>
          <p className="text-text-secondary text-sm leading-6">
            已提交的作答记录仍保留在历史记录中，当前未完成练习会从第 1
            题重新开始。
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsRestartConfirmationVisible(false)}
              className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isRestarting}
              onClick={() => void handleRestartPractice()}
              className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              确认重新开始练习
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        data-testid="practice-restart-button"
        disabled={isRestarting}
        onClick={() => setIsRestartConfirmationVisible(true)}
        className="border-border text-text-primary flex h-10 items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        重新开始练习
      </button>
    </section>
  );
}
