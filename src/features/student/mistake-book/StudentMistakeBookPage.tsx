"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type {
  AiExplanationDto,
  MistakeBookAiExplanationResultDto,
  MistakeBookItemDto,
  MistakeBookListResultDto,
  MistakeBookResultDto,
} from "@/server/contracts/mistake-book-contract";
import type { QuestionType } from "@/server/models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
} from "@/server/models/student-experience";
import type { Profession, Subject } from "@/server/models/paper";

type LoadState = "loading" | "ready" | "unauthorized" | "error";
type ActionState = "idle" | "submitting";
type AiExplanationByPublicId = Record<string, AiExplanationDto>;
type MistakeBookFilterState = {
  questionType: QuestionType | "all";
  source: MistakeBookSource | "all";
  status: Exclude<MistakeBookStatus, "removed"> | "all";
};

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

const professionLabels: Record<Profession, string> = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
};

const subjectLabels: Record<Subject, string> = {
  skill: "技能",
  theory: "理论",
};

const statusLabels: Record<MistakeBookStatus, string> = {
  mastered: "已掌握",
  removed: "已移除",
  unmastered: "未掌握",
};

const sourceLabels: Record<MistakeBookSource, string> = {
  favorite: "主动收藏",
  wrong_answer: "错题记录",
};

const questionTypeLabels: Partial<Record<QuestionType, string>> = {
  case_analysis: "案例分析题",
  calculation: "计算题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  single_choice: "单选题",
  true_false: "判断题",
};

const pageSize = 20;

const defaultFilters: MistakeBookFilterState = {
  questionType: "all",
  source: "all",
  status: "all",
};

const emptyPagination: ApiPagination = {
  page: 1,
  pageSize,
  total: 0,
  sortBy: "latestWrongAt",
  sortOrder: "desc",
};

function getStoredSessionToken(): string | null {
  const token = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)?.trim();

  return token === "" ? null : (token ?? null);
}

function createAuthHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}

async function fetchApi<TPayload>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<ApiResponse<TPayload | null>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...createAuthHeaders(token),
      ...(init?.headers ?? {}),
    },
  });

  return (await response.json()) as ApiResponse<TPayload | null>;
}

function isUnauthorizedResponse(payload: ApiResponse<unknown>): boolean {
  return payload.code === 401001;
}

function formatScopeLabel(mistakeBook: MistakeBookItemDto): string {
  return `${professionLabels[mistakeBook.profession]} ${mistakeBook.level}级`;
}

function formatDate(value: string | null): string {
  return value === null ? "未记录" : value.slice(0, 10);
}

function formatAnswerLabels(labels: string[]): string {
  return labels.length === 0 ? "未记录" : labels.join("、");
}

function formatLearnerAnswer(mistakeBook: MistakeBookItemDto): string {
  if (mistakeBook.latestAnswerSnapshot.selectedLabels.length > 0) {
    return formatAnswerLabels(mistakeBook.latestAnswerSnapshot.selectedLabels);
  }

  const textAnswer = mistakeBook.latestAnswerSnapshot.textAnswer?.trim();

  return textAnswer === undefined || textAnswer.length === 0
    ? "未记录"
    : textAnswer;
}

function formatCitationHeadingPath(headingPath: string[]): string {
  return headingPath.length === 0 ? "未标注章节" : headingPath.join(" > ");
}

function createMistakeBookListPath(
  filters: MistakeBookFilterState,
  page: number,
): string {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.questionType !== "all") {
    searchParams.set("questionType", filters.questionType);
  }

  if (filters.source !== "all") {
    searchParams.set("source", filters.source);
  }

  if (filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  return `/api/v1/mistake-books?${searchParams.toString()}`;
}

function readQuestionType(
  questionSnapshot: Record<string, unknown>,
): QuestionType | null {
  const questionType = questionSnapshot.questionType;

  return typeof questionType === "string" && questionType in questionTypeLabels
    ? (questionType as QuestionType)
    : null;
}

function stripRichText(value: string): string {
  return value
    .replace(/<[^>]*>/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function readQuestionStem(questionSnapshot: Record<string, unknown>): string {
  const stemText = questionSnapshot.stemText;

  if (typeof stemText === "string" && stemText.trim().length > 0) {
    return stemText.trim();
  }

  const stemRichText = questionSnapshot.stemRichText;

  if (typeof stemRichText === "string" && stemRichText.trim().length > 0) {
    return stripRichText(stemRichText);
  }

  return "题干内容暂不可见";
}

function readSnapshotText(
  questionSnapshot: Record<string, unknown>,
  keys: string[],
  fallback: string,
): string {
  for (const key of keys) {
    const value = questionSnapshot[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return stripRichText(value);
    }
  }

  return fallback;
}

function isSourceQuestionDisabled(
  questionSnapshot: Record<string, unknown>,
): boolean {
  return (
    questionSnapshot.questionStatus === "disabled" ||
    questionSnapshot.status === "disabled" ||
    questionSnapshot.isDisabled === true
  );
}

function StudentMistakeBookStatus({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="bg-background mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-text-primary text-xl font-semibold">
          {title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
      </div>
      {action}
    </main>
  );
}

function StudentMistakeBookLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5"
    >
      <p className="text-text-secondary text-sm">正在加载错题本</p>
      {[0, 1, 2].map((itemIndex) => (
        <div
          key={itemIndex}
          className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
        >
          <div className="bg-border h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-border mt-3 h-3 w-1/2 animate-pulse rounded" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-border h-9 animate-pulse rounded-lg" />
            <div className="bg-border h-9 animate-pulse rounded-lg" />
          </div>
        </div>
      ))}
    </main>
  );
}

function StudentMistakeBookEmpty() {
  return (
    <section className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <ClipboardList className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-text-primary text-lg font-semibold">
          暂无错题记录
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          完成练习或模拟考试后，系统会把需要复盘的题目汇总到这里。
        </p>
      </div>
      <Link
        href="/home"
        className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
      >
        返回首页
      </Link>
    </section>
  );
}

function StudentMistakeBookFilters({
  disabled,
  filters,
  onChangeFilters,
}: {
  disabled: boolean;
  filters: MistakeBookFilterState;
  onChangeFilters: (filters: MistakeBookFilterState) => void;
}) {
  return (
    <section
      aria-label="错题筛选"
      className="border-border bg-surface grid gap-3 rounded-xl border p-3 sm:grid-cols-3"
    >
      <label className="text-text-secondary flex flex-col gap-1 text-xs font-medium">
        题型
        <select
          className="border-border bg-background text-text-primary h-10 rounded-lg border px-3 text-sm"
          disabled={disabled}
          value={filters.questionType}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              questionType: event.target
                .value as MistakeBookFilterState["questionType"],
            })
          }
        >
          <option value="all">全部题型</option>
          <option value="single_choice">单选题</option>
          <option value="multi_choice">多选题</option>
          <option value="true_false">判断题</option>
          <option value="fill_blank">填空题</option>
        </select>
      </label>
      <label className="text-text-secondary flex flex-col gap-1 text-xs font-medium">
        来源
        <select
          className="border-border bg-background text-text-primary h-10 rounded-lg border px-3 text-sm"
          disabled={disabled}
          value={filters.source}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              source: event.target.value as MistakeBookFilterState["source"],
            })
          }
        >
          <option value="all">全部来源</option>
          <option value="wrong_answer">答错记录</option>
          <option value="favorite">主动收藏</option>
        </select>
      </label>
      <label className="text-text-secondary flex flex-col gap-1 text-xs font-medium">
        掌握状态
        <select
          className="border-border bg-background text-text-primary h-10 rounded-lg border px-3 text-sm"
          disabled={disabled}
          value={filters.status}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              status: event.target.value as MistakeBookFilterState["status"],
            })
          }
        >
          <option value="all">全部状态</option>
          <option value="unmastered">未掌握</option>
          <option value="mastered">已掌握</option>
        </select>
      </label>
    </section>
  );
}

function StudentMistakeBookPagination({
  disabled,
  onChangePage,
  pagination,
}: {
  disabled: boolean;
  onChangePage: (page: number) => void;
  pagination: ApiPagination;
}) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < totalPages;

  return (
    <nav
      aria-label="错题分页"
      className="border-border bg-surface flex items-center justify-between gap-3 rounded-xl border p-3"
    >
      <p className="text-text-secondary text-sm">
        第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || !canGoPrevious}
          onClick={() => onChangePage(pagination.page - 1)}
        >
          上一页
        </button>
        <button
          type="button"
          className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || !canGoNext}
          onClick={() => onChangePage(pagination.page + 1)}
        >
          下一页
        </button>
      </div>
    </nav>
  );
}

function StudentMistakeBookCard({
  actionState,
  aiExplanation,
  mistakeBook,
  onAiExplanation,
  onFavorite,
  onMarkMastered,
  onRemove,
}: {
  actionState: ActionState;
  aiExplanation: AiExplanationDto | null;
  mistakeBook: MistakeBookItemDto;
  onAiExplanation: (mistakeBook: MistakeBookItemDto) => void;
  onFavorite: (mistakeBook: MistakeBookItemDto) => void;
  onMarkMastered: (mistakeBook: MistakeBookItemDto) => void;
  onRemove: (mistakeBook: MistakeBookItemDto) => void;
}) {
  const questionType = readQuestionType(mistakeBook.questionSnapshot);
  const isSubmitting = actionState === "submitting";
  const isMastered = mistakeBook.mistakeBookStatus === "mastered";
  const favoriteLabel = mistakeBook.isFavorite ? "取消收藏" : "收藏";
  const isDisabledSourceQuestion = isSourceQuestionDisabled(
    mistakeBook.questionSnapshot,
  );
  const learnerAnswer = formatLearnerAnswer(mistakeBook);
  const standardAnswer = readSnapshotText(
    mistakeBook.questionSnapshot,
    ["standardAnswer", "standardAnswerRichText"],
    "标准答案暂不可见",
  );
  const analysis = readSnapshotText(
    mistakeBook.questionSnapshot,
    ["analysis", "analysisRichText"],
    "老师解析暂不可见",
  );

  return (
    <article
      data-public-id={mistakeBook.publicId}
      data-testid={`mistake-book-item-${mistakeBook.publicId}`}
      className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="text-text-secondary flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-background rounded-lg px-2 py-1">
              {formatScopeLabel(mistakeBook)}
            </span>
            <span className="bg-background rounded-lg px-2 py-1">
              {subjectLabels[mistakeBook.subject]}
            </span>
            <span className="bg-background rounded-lg px-2 py-1">
              {questionType === null
                ? "题型待定"
                : questionTypeLabels[questionType]}
            </span>
          </div>
          <h2 className="font-heading text-text-primary text-base leading-6 font-semibold">
            {readQuestionStem(mistakeBook.questionSnapshot)}
          </h2>
          {isDisabledSourceQuestion ? (
            <p className="text-warning text-xs font-medium">该题目已停用</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
            isMastered
              ? "bg-success/10 text-success"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {statusLabels[mistakeBook.mistakeBookStatus]}
        </span>
      </div>

      <dl className="text-text-secondary grid grid-cols-3 gap-2 text-xs">
        <div className="bg-background rounded-lg px-2 py-2">
          <dt>来源</dt>
          <dd className="text-text-primary mt-1 font-medium">
            {sourceLabels[mistakeBook.mistakeBookSource]}
          </dd>
        </div>
        <div className="bg-background rounded-lg px-2 py-2">
          <dt>次数</dt>
          <dd className="text-text-primary mt-1 font-medium">
            错 {mistakeBook.wrongCount} 次
          </dd>
        </div>
        <div className="bg-background rounded-lg px-2 py-2">
          <dt>最近</dt>
          <dd className="text-text-primary mt-1 font-medium">
            {formatDate(mistakeBook.latestWrongAt)}
          </dd>
        </div>
      </dl>

      <dl className="border-border bg-background grid gap-3 rounded-xl border p-3 text-sm sm:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-text-secondary text-xs font-medium">我的作答</dt>
          <dd className="text-text-primary leading-6">{learnerAnswer}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-text-secondary text-xs font-medium">标准答案</dt>
          <dd className="text-text-primary leading-6">{standardAnswer}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-text-secondary text-xs font-medium">老师解析</dt>
          <dd className="text-text-primary leading-6">{analysis}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => onFavorite(mistakeBook)}
        >
          {mistakeBook.isFavorite ? (
            <BookmarkCheck className="size-4" aria-hidden="true" />
          ) : (
            <Bookmark className="size-4" aria-hidden="true" />
          )}
          {favoriteLabel}
        </button>
        <button
          type="button"
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isMastered}
          onClick={() => onMarkMastered(mistakeBook)}
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          标记已掌握
        </button>
        <button
          type="button"
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => onAiExplanation(mistakeBook)}
        >
          <Brain className="size-4" aria-hidden="true" />
          AI讲解
        </button>
        <button
          type="button"
          className="border-border text-error hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => onRemove(mistakeBook)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          移除
        </button>
      </div>

      {aiExplanation === null ? null : (
        <section className="border-border bg-background space-y-3 rounded-xl border p-3">
          <div className="space-y-1">
            <p className="text-text-primary text-sm font-semibold">AI讲解</p>
            <p className="text-text-secondary text-sm leading-6">
              {aiExplanation.explanationText}
            </p>
          </div>
          {aiExplanation.learningSuggestion === null ? null : (
            <p className="text-text-secondary text-sm leading-6">
              {aiExplanation.learningSuggestion}
            </p>
          )}
          {aiExplanation.insufficientEvidenceMessage === null ? null : (
            <p className="text-warning text-sm leading-6">
              {aiExplanation.insufficientEvidenceMessage}
            </p>
          )}
          {aiExplanation.citations.length === 0 ? null : (
            <div className="space-y-2">
              <p className="text-text-primary text-xs font-semibold">
                参考来源
              </p>
              <ul className="space-y-1">
                {aiExplanation.citations.map((citation) => (
                  <li
                    key={`${citation.resourcePublicId}-${citation.chunkPublicId}`}
                    className="text-text-secondary text-xs leading-5"
                  >
                    <span className="text-text-primary font-medium">
                      {citation.resourceTitle}
                    </span>
                    <span>
                      {" "}
                      · {formatCitationHeadingPath(citation.headingPath)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </article>
  );
}

export function StudentMistakeBookPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [mistakeBooks, setMistakeBooks] = useState<MistakeBookItemDto[]>([]);
  const [filters, setFilters] =
    useState<MistakeBookFilterState>(defaultFilters);
  const [pagination, setPagination] = useState<ApiPagination>(emptyPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [aiExplanationByPublicId, setAiExplanationByPublicId] =
    useState<AiExplanationByPublicId>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const activeMistakeBooks = useMemo(
    () => mistakeBooks.filter((mistakeBook) => !mistakeBook.isRemoved),
    [mistakeBooks],
  );

  useEffect(() => {
    let isActive = true;

    async function loadMistakeBooks() {
      const token = getStoredSessionToken();

      if (token === null) {
        if (isActive) {
          setLoadState("unauthorized");
        }
        return;
      }

      try {
        const listPayload = await fetchApi<MistakeBookListResultDto>(
          createMistakeBookListPath(filters, currentPage),
          token,
        );

        if (!isActive) {
          return;
        }

        if (isUnauthorizedResponse(listPayload)) {
          setLoadState("unauthorized");
          return;
        }

        if (listPayload.code !== 0 || listPayload.data === null) {
          setLoadState("error");
          return;
        }

        setSessionToken(token);
        setMistakeBooks(listPayload.data.mistakeBooks);
        setPagination(listPayload.pagination ?? emptyPagination);
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadMistakeBooks();

    return () => {
      isActive = false;
    };
  }, [currentPage, filters]);

  function handleChangeFilters(nextFilters: MistakeBookFilterState) {
    setFilters(nextFilters);
    setCurrentPage(1);
    setFeedbackMessage(null);
  }

  async function handleMistakeBookAction(
    mistakeBook: MistakeBookItemDto,
    actionPath: "favorite" | "mark-mastered" | "remove" | "unfavorite",
  ) {
    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setActionState("submitting");
    setFeedbackMessage(null);

    try {
      const actionPayload = await fetchApi<MistakeBookResultDto>(
        `/api/v1/mistake-books/${mistakeBook.publicId}/${actionPath}`,
        sessionToken,
        {
          method: "POST",
        },
      );

      if (isUnauthorizedResponse(actionPayload)) {
        setLoadState("unauthorized");
        return;
      }

      if (actionPayload.code !== 0 || actionPayload.data === null) {
        setFeedbackMessage("操作失败，请稍后重试");
        return;
      }

      const updatedMistakeBook = actionPayload.data.mistakeBook;

      setMistakeBooks((currentMistakeBooks) =>
        currentMistakeBooks
          .map((currentMistakeBook) =>
            currentMistakeBook.publicId === updatedMistakeBook.publicId
              ? updatedMistakeBook
              : currentMistakeBook,
          )
          .filter((currentMistakeBook) => !currentMistakeBook.isRemoved),
      );
      setPagination((currentPagination) =>
        updatedMistakeBook.isRemoved
          ? {
              ...currentPagination,
              total: Math.max(0, currentPagination.total - 1),
            }
          : currentPagination,
      );
    } catch {
      setFeedbackMessage("操作失败，请稍后重试");
    } finally {
      setActionState("idle");
    }
  }

  async function handleAiExplanation(mistakeBook: MistakeBookItemDto) {
    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setActionState("submitting");
    setFeedbackMessage(null);

    try {
      const explanationPayload =
        await fetchApi<MistakeBookAiExplanationResultDto>(
          `/api/v1/mistake-books/${mistakeBook.publicId}/ai-explanation`,
          sessionToken,
          {
            method: "POST",
          },
        );

      if (isUnauthorizedResponse(explanationPayload)) {
        setLoadState("unauthorized");
        return;
      }

      if (explanationPayload.code !== 0 || explanationPayload.data === null) {
        setFeedbackMessage("AI讲解生成失败，请稍后重试");
        return;
      }

      const aiExplanation = explanationPayload.data.aiExplanation;

      setAiExplanationByPublicId((currentExplanations) => ({
        ...currentExplanations,
        [mistakeBook.publicId]: aiExplanation,
      }));
    } catch {
      setFeedbackMessage("AI讲解生成失败，请稍后重试");
    } finally {
      setActionState("idle");
    }
  }

  if (loadState === "loading") {
    return <StudentMistakeBookLoading />;
  }

  if (loadState === "unauthorized") {
    return (
      <StudentMistakeBookStatus
        title="请先登录"
        description="错题本需要有效的学员会话，请登录后再查看。"
        action={
          <Link
            href="/login"
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            前往登录
          </Link>
        }
      />
    );
  }

  if (loadState === "error") {
    return (
      <StudentMistakeBookStatus
        title="错题本加载失败"
        description="请稍后刷新页面，或重新登录后再查看错题记录。"
      />
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <section className="space-y-4">
        <Link
          href="/home"
          className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          返回首页
        </Link>
        <div className="bg-surface ring-border flex items-start justify-between gap-4 rounded-xl p-4 shadow-sm ring-1">
          <div className="space-y-1">
            <p className="text-brand-primary text-sm font-medium">复盘练习</p>
            <h1 className="font-heading text-text-primary text-2xl font-semibold">
              错题本
            </h1>
            <p className="text-text-secondary text-sm leading-6">
              仅展示当前登录学员的错题记录，可收藏、标记掌握或移除。
            </p>
          </div>
          <span className="bg-secondary text-secondary-foreground shrink-0 rounded-lg px-3 py-1 text-sm font-medium">
            共 {pagination.total} 题
          </span>
        </div>
      </section>

      <StudentMistakeBookFilters
        disabled={actionState === "submitting"}
        filters={filters}
        onChangeFilters={handleChangeFilters}
      />

      {feedbackMessage === null ? null : (
        <div className="border-border text-error bg-surface rounded-xl border px-4 py-3 text-sm">
          {feedbackMessage}
        </div>
      )}

      {activeMistakeBooks.length === 0 ? (
        <StudentMistakeBookEmpty />
      ) : (
        <section className="space-y-3" aria-label="错题列表">
          {activeMistakeBooks.map((mistakeBook) => (
            <StudentMistakeBookCard
              key={mistakeBook.publicId}
              actionState={actionState}
              aiExplanation={
                aiExplanationByPublicId[mistakeBook.publicId] ?? null
              }
              mistakeBook={mistakeBook}
              onAiExplanation={(selectedMistakeBook) =>
                handleAiExplanation(selectedMistakeBook)
              }
              onFavorite={(selectedMistakeBook) =>
                handleMistakeBookAction(
                  selectedMistakeBook,
                  selectedMistakeBook.isFavorite ? "unfavorite" : "favorite",
                )
              }
              onMarkMastered={(selectedMistakeBook) =>
                handleMistakeBookAction(selectedMistakeBook, "mark-mastered")
              }
              onRemove={(selectedMistakeBook) =>
                handleMistakeBookAction(selectedMistakeBook, "remove")
              }
            />
          ))}
        </section>
      )}

      <StudentMistakeBookPagination
        disabled={actionState === "submitting"}
        pagination={pagination}
        onChangePage={(page) => {
          setCurrentPage(page);
          setFeedbackMessage(null);
        }}
      />
    </main>
  );
}
