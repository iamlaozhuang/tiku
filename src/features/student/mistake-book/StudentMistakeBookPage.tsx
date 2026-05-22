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

import type { ApiResponse } from "@/server/contracts/api-response";
import type {
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
  fill_blank: "填空题",
  multi_choice: "多选题",
  single_choice: "单选题",
  true_false: "判断题",
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

function StudentMistakeBookCard({
  actionState,
  mistakeBook,
  onFavorite,
  onMarkMastered,
  onRemove,
}: {
  actionState: ActionState;
  mistakeBook: MistakeBookItemDto;
  onFavorite: (mistakeBook: MistakeBookItemDto) => void;
  onMarkMastered: (mistakeBook: MistakeBookItemDto) => void;
  onRemove: (mistakeBook: MistakeBookItemDto) => void;
}) {
  const questionType = readQuestionType(mistakeBook.questionSnapshot);
  const isSubmitting = actionState === "submitting";
  const isMastered = mistakeBook.mistakeBookStatus === "mastered";
  const favoriteLabel = mistakeBook.isFavorite ? "取消收藏" : "收藏";

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
          className="border-border text-text-secondary flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
          disabled
        >
          <Brain className="size-4" aria-hidden="true" />
          AI讲解暂不可用
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
    </article>
  );
}

export function StudentMistakeBookPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [mistakeBooks, setMistakeBooks] = useState<MistakeBookItemDto[]>([]);
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
          "/api/v1/mistake-books?page=1&pageSize=20",
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
  }, []);

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
    } catch {
      setFeedbackMessage("操作失败，请稍后重试");
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
            共 {activeMistakeBooks.length} 题
          </span>
        </div>
      </section>

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
              mistakeBook={mistakeBook}
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
    </main>
  );
}
