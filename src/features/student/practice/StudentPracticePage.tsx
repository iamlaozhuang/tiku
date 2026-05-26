"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpenCheck,
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
  PracticeResultDto,
} from "@/server/contracts/practice-contract";
import type { Profession, Subject } from "@/server/models/paper";

type StudentPracticePageState =
  | "ready"
  | "loading"
  | "error"
  | "not_found"
  | "authorization_expired";

type StudentPracticePageProps = {
  state?: StudentPracticePageState;
  paperPublicId?: string;
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
  questionGroupTitle: string | null;
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

type PracticePaperSection = {
  paperQuestions?: unknown;
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
  const questionCount = extractPracticeQuestions(practice.paperSnapshot).length;

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
    questionGroupTitle: getStringField(value, "questionGroupTitle"),
    materialTitle: getStringField(value, "materialTitle"),
    materialRichText: getStringField(value, "materialRichText"),
    stemRichText,
    questionOptions: getQuestionOptions(getQuestionOptionSource(value)),
    standardAnswerRichText: getStringField(value, "standardAnswerRichText"),
    analysisRichText: getStringField(value, "analysisRichText"),
    score: getStringField(value, "score") ?? "0.0",
  };
}

function extractPracticeQuestions(
  paperSnapshot: Record<string, unknown>,
): PracticePaperQuestion[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.flatMap((paperSection): PracticePaperQuestion[] => {
    if (!isRecord(paperSection)) {
      return [];
    }

    const typedPaperSection = paperSection as PracticePaperSection;
    const paperSectionTitle =
      getStringField(paperSection, "paperSectionTitle") ??
      getStringField(paperSection, "title");
    const paperQuestions = Array.isArray(typedPaperSection.paperQuestions)
      ? typedPaperSection.paperQuestions
      : [];

    return paperQuestions
      .map((paperQuestion) =>
        mapPracticeQuestion(paperQuestion, paperSectionTitle),
      )
      .filter(
        (question): question is PracticePaperQuestion => question !== null,
      );
  });
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

function includesLabel(selectedLabels: string[], label: string): boolean {
  return selectedLabels.includes(label);
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
  onNextQuestion,
  hasNextQuestion,
}: {
  question: PracticePaperQuestion;
  selectedLabels: string[];
  feedback: PracticeAnswerFeedbackDto | null;
  onToggleLabel(label: string): void;
  onSubmitAnswer(): void;
  onNextQuestion(): void;
  hasNextQuestion: boolean;
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
          <button
            type="button"
            onClick={onNextQuestion}
            disabled={!hasNextQuestion}
            className="border-border text-text-primary flex h-9 w-full items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasNextQuestion ? "下一题" : "已到最后一题"}
          </button>
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
  onNextQuestion,
  hasNextQuestion,
}: {
  textAnswer: string;
  feedback: PracticeAnswerFeedbackDto | null;
  onChangeTextAnswer(value: string): void;
  onSubmitAnswer(): void;
  onNextQuestion(): void;
  hasNextQuestion: boolean;
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
          {hasNextQuestion ? (
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

function SubjectiveQuestionPanel({
  question,
  textAnswer,
  feedback,
  isMaterialOpen,
  onToggleMaterial,
  onChangeTextAnswer,
  onSubmitAnswer,
  onRetryWithHint,
}: {
  question: PracticePaperQuestion;
  textAnswer: string;
  feedback: PracticeAnswerFeedbackDto | null;
  isMaterialOpen: boolean;
  onToggleMaterial(): void;
  onChangeTextAnswer(value: string): void;
  onSubmitAnswer(): void;
  onRetryWithHint(): void;
}) {
  const canRetryWithHint =
    feedback !== null && feedback.retryRemainingCount > 0;

  return (
    <div className="space-y-4">
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
          {feedback.aiHintText === null ? (
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
              disabled={!canRetryWithHint}
              onClick={onRetryWithHint}
              className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              AI 提示并重答一次
            </button>
            <button
              type="button"
              className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
            >
              直接查看评分
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StudentPracticePage({
  state = "ready",
  paperPublicId = "paper-marketing-theory-002",
  practices,
}: StudentPracticePageProps) {
  const isRuntimeMode = practices === undefined;
  const [runtimeState, setRuntimeState] =
    useState<StudentPracticePageState>("loading");
  const [runtimePractices, setRuntimePractices] = useState<
    StudentPracticeFixture[]
  >([]);
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayPractices = practices ?? runtimePractices;
  const selectedPracticeFixture =
    displayPractices.find(
      (practiceFixture) =>
        practiceFixture.practice.paperPublicId === paperPublicId,
    ) ?? null;
  const practice = selectedPracticeFixture?.practice ?? null;
  const questions = useMemo(
    () =>
      practice === null ? [] : extractPracticeQuestions(practice.paperSnapshot),
    [practice],
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

  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadPractice() {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        if (isActive) {
          setRuntimeState("authorization_expired");
        }
        return;
      }

      try {
        const practicePayload = await fetchStudentApi<PracticeResultDto>(
          "/api/v1/practices",
          token,
          {
            method: "POST",
            body: JSON.stringify({ paperPublicId }),
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
  }, [isRuntimeMode, paperPublicId, state]);

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

  const currentQuestion = questions[currentQuestionIndex] ?? questions[0];
  const selectedLabels =
    selectedLabelsByQuestion[currentQuestion.paperQuestionPublicId] ?? [];
  const textAnswer =
    textAnswerByQuestion[currentQuestion.paperQuestionPublicId] ?? "";
  const feedback =
    feedbackByQuestion[currentQuestion.paperQuestionPublicId] ?? null;
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;

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

  async function handleSubmitAnswer() {
    if (practice === null) {
      return;
    }

    let nextFeedback =
      selectedPracticeFixture?.feedbackByPaperQuestionPublicId[
        currentQuestion.paperQuestionPublicId
      ] ?? null;

    if (isRuntimeMode) {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        setRuntimeState("authorization_expired");
        return;
      }

      try {
        const answerPayload =
          await fetchStudentApi<PracticeAnswerFeedbackResultDto>(
            `/api/v1/practices/${practice.publicId}/answers`,
            token,
            {
              method: "POST",
              body: JSON.stringify({
                paperQuestionPublicId: currentQuestion.paperQuestionPublicId,
                selectedLabels: isOptionPracticeQuestion(
                  currentQuestion.questionType,
                )
                  ? selectedLabels
                  : [],
                textAnswer:
                  isFillBlankPracticeQuestion(currentQuestion.questionType) ||
                  isSubjectivePracticeQuestion(currentQuestion.questionType)
                    ? textAnswer
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

    setFeedbackByQuestion({
      ...feedbackByQuestion,
      [currentQuestion.paperQuestionPublicId]: nextFeedback,
    });
  }

  function handleNextQuestion() {
    setCurrentQuestionIndex(
      Math.min(currentQuestionIndex + 1, questions.length - 1),
    );
  }

  function handleRetryWithHint() {
    setFeedbackByQuestion((currentFeedbackByQuestion) => {
      const {
        [currentQuestion.paperQuestionPublicId]: _removedFeedback,
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
      return;
    }

    const token = getStoredStudentSessionToken();

    if (token === null) {
      setRuntimeState("authorization_expired");
      return;
    }

    setIsRestarting(true);

    try {
      const restartPayload = await fetchStudentApi<PracticeResultDto>(
        `/api/v1/practices/${practice.publicId}/restart`,
        token,
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
      setRuntimeState("ready");
    } catch {
      setRuntimeState("error");
    } finally {
      setIsRestarting(false);
    }
  }

  return (
    <section
      data-testid={`practice-surface-${practice.publicId}`}
      data-public-id={practice.publicId}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20"
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
            第 {currentQuestionIndex + 1} / {questions.length} 题
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

        {isOptionPracticeQuestion(currentQuestion.questionType) ? (
          <ObjectiveQuestionPanel
            question={currentQuestion}
            selectedLabels={selectedLabels}
            feedback={feedback}
            onToggleLabel={handleToggleLabel}
            onSubmitAnswer={() => void handleSubmitAnswer()}
            onNextQuestion={handleNextQuestion}
            hasNextQuestion={hasNextQuestion}
          />
        ) : isFillBlankPracticeQuestion(currentQuestion.questionType) ? (
          <FillBlankQuestionPanel
            textAnswer={textAnswer}
            feedback={feedback}
            onChangeTextAnswer={handleChangeTextAnswer}
            onSubmitAnswer={() => void handleSubmitAnswer()}
            onNextQuestion={handleNextQuestion}
            hasNextQuestion={hasNextQuestion}
          />
        ) : (
          <SubjectiveQuestionPanel
            question={currentQuestion}
            textAnswer={textAnswer}
            feedback={feedback}
            isMaterialOpen={isMaterialOpen}
            onToggleMaterial={() => setIsMaterialOpen(!isMaterialOpen)}
            onChangeTextAnswer={handleChangeTextAnswer}
            onSubmitAnswer={() => void handleSubmitAnswer()}
            onRetryWithHint={handleRetryWithHint}
          />
        )}
      </article>

      <button
        type="button"
        data-testid="practice-restart-button"
        disabled={isRestarting}
        onClick={() => void handleRestartPractice()}
        className="border-border text-text-primary flex h-10 items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        重新开始练习
      </button>
    </section>
  );
}
