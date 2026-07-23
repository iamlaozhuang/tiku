"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  BrainCircuit,
  Building2,
  ClipboardList,
  Clock3,
  History,
  PlayCircle,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  fetchStudentApi,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type {
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationListDto,
} from "@/server/contracts/effective-authorization-contract";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type {
  StudentPaperListDto,
  StudentPaperScopeDto,
  StudentPaperScopesDto,
  StudentPaperSummaryDto,
} from "@/server/contracts/student-paper-contract";
import type { Profession, Subject } from "@/server/models/paper";

type StudentHomeScopeSelection = {
  profession: Profession;
  level: number;
};

type StudentHomePageState = "ready" | "loading" | "error" | "unauthorized";

type StudentHomePageProps = {
  state?: StudentHomePageState;
  scopes?: StudentPaperScopeDto[];
  papers?: StudentPaperSummaryDto[];
  authorizationContexts?: EffectiveAuthorizationContextDto[];
  rememberedScope?: StudentHomeScopeSelection;
};

type SubjectGroup = {
  subject: Subject;
  papers: StudentPaperSummaryDto[];
};

type StudentPaperScopePayload = StudentPaperScopesDto | StudentPaperScopeDto[];
type StudentPaperListPayload = StudentPaperListDto | StudentPaperSummaryDto[];
type StudentAuthorizationListPayload = EffectiveAuthorizationListDto;

type StudentPaperPageResult = {
  payload: ApiResponse<StudentPaperListPayload | null>;
  papers: StudentPaperSummaryDto[];
  pagination: ApiPagination;
};

type AuthExpiryReminder = {
  scope: StudentPaperScopeDto;
  daysUntilExpiry: number;
  expiresAtDate: string;
  reminderKey: string;
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

const subjectOrder: Subject[] = ["theory", "skill"];

const selectedScopeSeparator = ":";
const studentHomeSelectedScopeStorageKey = "tiku.studentHome.selectedScope";
const studentPaperPageSize = 20;
const authExpiryReminderWindowDays = 15;
const millisecondsPerDay = 24 * 60 * 60 * 1000;
const authExpiryReminderDismissalStorageKey =
  "tiku.studentHome.authExpiryReminder.dismissedDates";

export const studentHomeFixture = {
  scopes: [
    {
      profession: "monopoly",
      level: 3,
      authorizationTypes: ["personal_auth"],
      expiresAt: "2026-08-31T15:59:59Z",
      status: "active",
    },
    {
      profession: "marketing",
      level: 3,
      authorizationTypes: ["org_auth"],
      expiresAt: "2026-09-30T15:59:59Z",
      status: "active",
    },
  ] satisfies StudentPaperScopeDto[],
  papers: [
    {
      publicId: "paper-marketing-theory-001",
      name: "营销理论冲刺卷 A",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      durationMinute: 90,
      totalScore: "100",
      publishedAt: "2026-05-10T08:00:00Z",
      questionCount: 40,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-marketing-theory-002",
      name: "营销理论冲刺卷 B",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100",
      publishedAt: "2026-05-18T08:00:00Z",
      questionCount: 42,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-marketing-skill-001",
      name: "营销技能案例卷",
      profession: "marketing",
      level: 3,
      subject: "skill",
      paperType: "mock_paper",
      durationMinute: null,
      totalScore: "100",
      publishedAt: "2026-05-12T08:00:00Z",
      questionCount: 8,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-monopoly-theory-001",
      name: "专卖理论真题卷",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100",
      publishedAt: "2026-05-16T08:00:00Z",
      questionCount: 50,
      canPractice: true,
      canMockExam: true,
    },
  ] satisfies StudentPaperSummaryDto[],
};

function createScopeKey(scope: StudentHomeScopeSelection): string {
  return `${scope.profession}${selectedScopeSeparator}${scope.level}`;
}

function isProfession(value: unknown): value is Profession {
  return value === "logistics" || value === "marketing" || value === "monopoly";
}

function readStudentHomeSelectedScope(): StudentHomeScopeSelection | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedValue = window.localStorage.getItem(
    studentHomeSelectedScopeStorageKey,
  );

  if (storedValue === null) {
    return undefined;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (parsedValue === null || typeof parsedValue !== "object") {
      return undefined;
    }

    const selectedScope = parsedValue as Partial<StudentHomeScopeSelection>;
    const level = selectedScope.level;

    if (
      !isProfession(selectedScope.profession) ||
      typeof level !== "number" ||
      !Number.isInteger(level)
    ) {
      return undefined;
    }

    return {
      profession: selectedScope.profession,
      level,
    };
  } catch {
    return undefined;
  }
}

function writeStudentHomeSelectedScope(scope: StudentHomeScopeSelection) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    studentHomeSelectedScopeStorageKey,
    JSON.stringify({
      profession: scope.profession,
      level: scope.level,
    }),
  );
}

function findInitialScope(
  scopes: StudentPaperScopeDto[],
  rememberedScope: StudentHomeScopeSelection | undefined,
): StudentPaperScopeDto | null {
  if (scopes.length === 0) {
    return null;
  }

  if (rememberedScope === undefined) {
    return scopes[0];
  }

  return (
    scopes.find(
      (scope) =>
        scope.profession === rememberedScope.profession &&
        scope.level === rememberedScope.level,
    ) ?? scopes[0]
  );
}

function formatScopeLabel(scope: StudentHomeScopeSelection): string {
  return `${professionLabels[scope.profession]} ${scope.level}级`;
}

function formatAuthorizationSourceLabel(
  authorizationSource: EffectiveAuthorizationContextDto["authorizationSource"],
): string {
  return authorizationSource === "org_auth" ? "组织授权" : "个人授权";
}

function formatEffectiveEditionLabel(
  effectiveEdition: EffectiveAuthorizationContextDto["effectiveEdition"],
): string {
  return effectiveEdition === "advanced" ? "高级版" : "标准版";
}

function formatQuotaOwnerLabel(
  quotaOwnerType: EffectiveAuthorizationContextDto["quotaOwnerType"],
): string {
  if (quotaOwnerType === "organization") {
    return "组织额度";
  }

  if (quotaOwnerType === "platform") {
    return "平台额度";
  }

  return "个人额度";
}

function formatPublishedAt(publishedAt: string | null): string {
  if (publishedAt === null) {
    return "发布时间待定";
  }

  return `${publishedAt.slice(0, 10)} 发布`;
}

function formatDuration(durationMinute: number | null): string {
  return durationMinute === null ? "不限时" : `${durationMinute} 分钟`;
}

function createAuthExpiryReminderKey(scope: StudentPaperScopeDto): string {
  return `${scope.profession}:${scope.level}:${scope.expiresAt}`;
}

function formatLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function readAuthExpiryReminderDismissals(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const storedValue = window.localStorage.getItem(
    authExpiryReminderDismissalStorageKey,
  );

  if (storedValue === null) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (parsedValue === null || typeof parsedValue !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function writeAuthExpiryReminderDismissals(
  dismissalDatesByKey: Record<string, string>,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    authExpiryReminderDismissalStorageKey,
    JSON.stringify(dismissalDatesByKey),
  );
}

function getDaysUntilExpiry(expiresAt: string, now: Date): number | null {
  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime())) {
    return null;
  }

  return Math.ceil(
    (expiresAtDate.getTime() - now.getTime()) / millisecondsPerDay,
  );
}

function selectAuthExpiryReminder(
  scopes: StudentPaperScopeDto[],
  dismissalDatesByKey: Record<string, string>,
  now = new Date(),
): AuthExpiryReminder | null {
  const todayKey = formatLocalDateKey(now);

  return (
    scopes
      .map((scope) => {
        const daysUntilExpiry = getDaysUntilExpiry(scope.expiresAt, now);

        if (
          daysUntilExpiry === null ||
          daysUntilExpiry < 0 ||
          daysUntilExpiry > authExpiryReminderWindowDays
        ) {
          return null;
        }

        const reminderKey = createAuthExpiryReminderKey(scope);

        if (dismissalDatesByKey[reminderKey] === todayKey) {
          return null;
        }

        return {
          scope,
          daysUntilExpiry,
          expiresAtDate: scope.expiresAt.slice(0, 10),
          reminderKey,
        } satisfies AuthExpiryReminder;
      })
      .filter((reminder): reminder is AuthExpiryReminder => reminder !== null)
      .toSorted(
        (leftReminder, rightReminder) =>
          leftReminder.daysUntilExpiry - rightReminder.daysUntilExpiry,
      )[0] ?? null
  );
}

function selectSubjectGroups(
  papers: StudentPaperSummaryDto[],
  selectedScope: StudentPaperScopeDto | null,
): SubjectGroup[] {
  if (selectedScope === null) {
    return [];
  }

  return subjectOrder.map((subject) => ({
    subject,
    papers: papers
      .filter(
        (paper) =>
          paper.profession === selectedScope.profession &&
          paper.level === selectedScope.level &&
          paper.subject === subject,
      )
      .toSorted((leftPaper, rightPaper) =>
        (rightPaper.publishedAt ?? "").localeCompare(
          leftPaper.publishedAt ?? "",
        ),
      ),
  }));
}

function createStudentPaperListPath(
  scope: StudentHomeScopeSelection,
  page = 1,
): string {
  const searchParams = new URLSearchParams({
    profession: scope.profession,
    level: String(scope.level),
    page: String(page),
    pageSize: String(studentPaperPageSize),
  });

  return `/api/v1/student-papers?${searchParams.toString()}`;
}

function readStudentPaperScopes(
  payload: StudentPaperScopePayload,
): StudentPaperScopeDto[] {
  return Array.isArray(payload) ? payload : payload.scopes;
}

function readStudentPapers(
  payload: StudentPaperListPayload,
): StudentPaperSummaryDto[] {
  return Array.isArray(payload) ? payload : payload.papers;
}

async function fetchStudentPaperPage(
  scope: StudentHomeScopeSelection,
  requestedPage: number,
  allowEmptyPageFallback = true,
): Promise<StudentPaperPageResult> {
  const payload = await fetchStudentApi<StudentPaperListPayload>(
    createStudentPaperListPath(scope, requestedPage),
  );
  const papers =
    payload.code === 0 && payload.data !== null
      ? readStudentPapers(payload.data)
      : [];
  const pagination = payload.pagination ?? {
    page: requestedPage,
    pageSize: studentPaperPageSize,
    total: papers.length,
    sortBy: "publishedAt",
    sortOrder: "desc",
  };
  const lastPage = Math.max(
    1,
    Math.ceil(pagination.total / pagination.pageSize),
  );

  if (
    allowEmptyPageFallback &&
    payload.code === 0 &&
    payload.data !== null &&
    papers.length === 0 &&
    requestedPage > 1
  ) {
    return fetchStudentPaperPage(
      scope,
      Math.min(requestedPage - 1, lastPage),
      false,
    );
  }

  return { payload, papers, pagination };
}

function readAuthorizationContexts(
  payload: StudentAuthorizationListPayload,
): EffectiveAuthorizationContextDto[] {
  return payload.authorizationContexts ?? [];
}

async function fetchAuthorizationContextsFailClosed(): Promise<
  EffectiveAuthorizationContextDto[]
> {
  try {
    const authorizationPayload =
      await fetchStudentApi<StudentAuthorizationListPayload>(
        "/api/v1/authorizations",
      );

    if (
      isStudentUnauthorizedResponse(authorizationPayload) ||
      authorizationPayload.code !== 0 ||
      authorizationPayload.data === null
    ) {
      return [];
    }

    return readAuthorizationContexts(authorizationPayload.data);
  } catch {
    return [];
  }
}

function canShowAiTraining(
  authorizationContext: EffectiveAuthorizationContextDto | null,
): boolean {
  return (
    authorizationContext !== null &&
    authorizationContext.effectiveEdition === "advanced" &&
    (authorizationContext.capabilities.canGenerateAiQuestion ||
      authorizationContext.capabilities.canGenerateAiPaper)
  );
}

function canShowOrganizationTraining(
  authorizationContext: EffectiveAuthorizationContextDto | null,
): boolean {
  return (
    authorizationContext !== null &&
    authorizationContext.effectiveEdition === "advanced" &&
    authorizationContext.capabilities.canAnswerOrganizationTraining
  );
}

function selectAuthorizationContextsForScope(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  selectedScope: StudentPaperScopeDto | null,
): EffectiveAuthorizationContextDto[] {
  if (selectedScope === null) {
    return [];
  }

  return authorizationContexts.filter(
    (authorizationContext) =>
      authorizationContext.profession === selectedScope.profession &&
      authorizationContext.level === selectedScope.level,
  );
}

function selectAuthorizationContextForScope(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  selectedScope: StudentPaperScopeDto | null,
  selectedAuthorizationPublicId: string | null,
): EffectiveAuthorizationContextDto | null {
  const scopeAuthorizationContexts = selectAuthorizationContextsForScope(
    authorizationContexts,
    selectedScope,
  );

  if (selectedAuthorizationPublicId !== null) {
    return (
      scopeAuthorizationContexts.find(
        (authorizationContext) =>
          authorizationContext.authorizationPublicId ===
          selectedAuthorizationPublicId,
      ) ?? null
    );
  }

  return scopeAuthorizationContexts.length === 1
    ? scopeAuthorizationContexts[0]
    : null;
}

function createAuthorizationContextPath(
  pathname: string,
  authorizationPublicId: string,
): string {
  return `${pathname}?${new URLSearchParams({ authorizationPublicId }).toString()}`;
}

function StudentHomeStatusMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <h2 className="font-heading text-text-primary text-lg font-semibold">
        {title}
      </h2>
      <p className="text-text-secondary text-sm leading-6">{description}</p>
    </section>
  );
}

function StudentHomeLoading() {
  return (
    <section className="space-y-4 p-4" aria-busy="true">
      <div>
        <p className="text-text-secondary text-sm">正在加载授权范围</p>
        <div className="bg-border mt-3 h-9 w-44 animate-pulse rounded-lg" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((itemIndex) => (
          <div
            key={itemIndex}
            className="bg-surface ring-border flex flex-col gap-3 rounded-xl p-4 shadow-sm ring-1"
          >
            <div className="bg-border h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-border h-3 w-1/2 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-border h-8 flex-1 animate-pulse rounded-lg" />
              <div className="bg-border h-8 flex-1 animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function createAnswerSessionPath(
  pathname: "/practice" | "/mock-exam",
  paperPublicId: string,
  authorizationContext: EffectiveAuthorizationContextDto | null,
): string {
  const searchParameters = new URLSearchParams({ paperPublicId });
  if (authorizationContext !== null) {
    searchParameters.set(
      "authorizationSource",
      authorizationContext.authorizationSource,
    );
    searchParameters.set(
      "authorizationPublicId",
      authorizationContext.authorizationPublicId,
    );
  }
  return `${pathname}?${searchParameters.toString()}`;
}

function StudentPaperCard({
  authorizationContext,
  paper,
}: {
  authorizationContext: EffectiveAuthorizationContextDto | null;
  paper: StudentPaperSummaryDto;
}) {
  return (
    <article
      data-testid={`paper-card-${paper.publicId}`}
      data-public-id={paper.publicId}
      className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-text-primary text-base leading-6 font-semibold">
            {paper.name}
          </h3>
          <p className="text-text-secondary text-sm">
            {formatPublishedAt(paper.publishedAt)}
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground shrink-0 rounded-lg px-2 py-1 text-xs font-medium">
          {paper.paperType === "past_paper" ? "真题" : "模拟"}
        </span>
      </div>

      <div className="text-text-secondary grid grid-cols-3 gap-2 text-xs">
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <ClipboardList className="size-3.5" aria-hidden="true" />
          {paper.questionCount} 题
        </span>
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {formatDuration(paper.durationMinute)}
        </span>
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {paper.totalScore === null ? "总分待定" : `总分 ${paper.totalScore}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={createAnswerSessionPath(
            "/practice",
            paper.publicId,
            authorizationContext,
          )}
          aria-disabled={!paper.canPractice || authorizationContext === null}
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-transform active:scale-[0.98] aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <PlayCircle className="size-4" aria-hidden="true" />
          练习
        </Link>
        <Link
          href={createAnswerSessionPath(
            "/mock-exam",
            paper.publicId,
            authorizationContext,
          )}
          aria-disabled={!paper.canMockExam || authorizationContext === null}
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          模拟考试
        </Link>
      </div>
    </article>
  );
}

function AuthExpiryReminderBanner({
  reminder,
  onDismiss,
}: {
  reminder: AuthExpiryReminder;
  onDismiss: (reminderKey: string) => void;
}) {
  return (
    <section
      data-testid="auth-expiry-reminder"
      className="bg-warning/10 ring-warning/20 flex flex-col gap-3 rounded-xl p-4 ring-1 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex min-w-0 gap-3">
        <div className="bg-warning/15 text-warning flex size-9 shrink-0 items-center justify-center rounded-lg">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            {"\u6388\u6743\u5373\u5c06\u5230\u671f"}
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            {formatScopeLabel(reminder.scope)}
            {"\u6388\u6743\u8fd8\u5269 "}
            <span className="text-warning font-semibold">
              {reminder.daysUntilExpiry}
            </span>
            {" \u5929\uff0c\u5230\u671f\u65e5 "}
            {reminder.expiresAtDate}
            {"\u3002"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href="/redeem-code"
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          <Ticket className="size-4" aria-hidden="true" />
          {"\u53bb\u5151\u6362\u5361\u5bc6"}
        </Link>
        <button
          type="button"
          data-testid="dismiss-auth-expiry-reminder"
          aria-label="\u4eca\u65e5\u4e0d\u518d\u63d0\u9192"
          onClick={() => onDismiss(reminder.reminderKey)}
          className="border-border text-text-secondary hover:bg-muted flex size-9 items-center justify-center rounded-lg border bg-transparent transition-transform active:scale-[0.98]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function StudentHomeContextBand({
  selectedScope,
  authorizationContext,
}: {
  selectedScope: StudentPaperScopeDto | null;
  authorizationContext: EffectiveAuthorizationContextDto | null;
}) {
  const scopeLabel =
    selectedScope === null ? "未选择授权范围" : formatScopeLabel(selectedScope);

  return (
    <section
      data-testid="student-home-context-band"
      aria-label="当前学习上下文"
      className="bg-surface ring-border grid gap-3 rounded-xl p-4 shadow-sm ring-1 sm:grid-cols-5"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-text-muted text-xs font-medium">当前学习上下文</p>
        <p className="text-text-primary text-sm font-semibold">{scopeLabel}</p>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-text-muted text-xs font-medium">授权来源</p>
        <p className="text-text-primary text-sm font-semibold">
          {authorizationContext === null
            ? "请选择具体授权"
            : formatAuthorizationSourceLabel(
                authorizationContext.authorizationSource,
              )}
        </p>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-text-muted text-xs font-medium">版本</p>
        <p className="text-text-primary text-sm font-semibold">
          {authorizationContext === null
            ? "版本待确认"
            : formatEffectiveEditionLabel(
                authorizationContext.effectiveEdition,
              )}
        </p>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-text-muted text-xs font-medium">额度归属</p>
        <p className="text-text-primary text-sm font-semibold">
          {authorizationContext === null
            ? "额度待确认"
            : formatQuotaOwnerLabel(authorizationContext.quotaOwnerType)}
        </p>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-text-muted text-xs font-medium">有效期</p>
        {authorizationContext === null ? (
          <p className="text-text-primary text-sm font-semibold">待选择</p>
        ) : (
          <Link
            className="text-brand-primary inline-flex text-sm font-semibold transition-transform active:scale-[0.98]"
            href={createAuthorizationContextPath(
              "/profile",
              authorizationContext.authorizationPublicId,
            )}
          >
            {authorizationContext.expiresAt == null
              ? "长期有效"
              : authorizationContext.expiresAt.slice(0, 10)}
            {" · 查看权益"}
          </Link>
        )}
      </div>
    </section>
  );
}

function StudentHomeAuthorizationContextSelector({
  authorizationContexts,
  onSelect,
  selectedAuthorizationPublicId,
}: {
  authorizationContexts: EffectiveAuthorizationContextDto[];
  onSelect: (authorizationPublicId: string) => void;
  selectedAuthorizationPublicId: string | null;
}) {
  if (authorizationContexts.length === 0) {
    return null;
  }

  return (
    <fieldset
      aria-label="当前范围授权上下文"
      className="grid gap-2 sm:grid-cols-2"
    >
      <legend className="text-text-secondary mb-2 text-sm font-medium">
        {authorizationContexts.length === 1
          ? "当前范围授权"
          : "请选择当前范围使用的具体授权"}
      </legend>
      {authorizationContexts.map((authorizationContext) => {
        const contextLabel = [
          formatAuthorizationSourceLabel(
            authorizationContext.authorizationSource,
          ),
          formatEffectiveEditionLabel(authorizationContext.effectiveEdition),
          formatScopeLabel(authorizationContext),
        ].join(" · ");

        return (
          <label
            className="border-border bg-surface flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
            key={authorizationContext.authorizationPublicId}
          >
            <input
              aria-label={contextLabel}
              checked={
                selectedAuthorizationPublicId ===
                authorizationContext.authorizationPublicId
              }
              className="mt-1 size-4 accent-current"
              name="student-home-authorization-context"
              onChange={() =>
                onSelect(authorizationContext.authorizationPublicId)
              }
              type="radio"
            />
            <span className="min-w-0 space-y-1">
              <span className="text-text-primary block font-medium">
                {contextLabel}
              </span>
              <span className="text-text-secondary block text-xs">
                到期：
                {authorizationContext.expiresAt == null
                  ? "长期有效"
                  : authorizationContext.expiresAt.slice(0, 10)}
                {" · "}
                {formatQuotaOwnerLabel(authorizationContext.quotaOwnerType)}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function StudentHomePage({
  state = "ready",
  scopes,
  papers,
  authorizationContexts,
  rememberedScope,
}: StudentHomePageProps) {
  const router = useRouter();
  const isRuntimeMode = scopes === undefined || papers === undefined;
  const [runtimeState, setRuntimeState] =
    useState<StudentHomePageState>("loading");
  const [runtimeScopes, setRuntimeScopes] = useState<StudentPaperScopeDto[]>(
    [],
  );
  const [runtimePapers, setRuntimePapers] = useState<StudentPaperSummaryDto[]>(
    [],
  );
  const [runtimePaperPagination, setRuntimePaperPagination] =
    useState<ApiPagination>({
      page: 1,
      pageSize: studentPaperPageSize,
      total: 0,
      sortBy: "publishedAt",
      sortOrder: "desc",
    });
  const [runtimeAuthorizationContexts, setRuntimeAuthorizationContexts] =
    useState<EffectiveAuthorizationContextDto[]>([]);
  const [authExpiryReminderDismissals, setAuthExpiryReminderDismissals] =
    useState(readAuthExpiryReminderDismissals);
  const [storedRememberedScope] = useState(readStudentHomeSelectedScope);
  const effectiveRememberedScope = rememberedScope ?? storedRememberedScope;
  const displayState =
    isRuntimeMode && state === "ready" ? runtimeState : state;
  const displayScopes = scopes ?? runtimeScopes;
  const displayPapers = papers ?? runtimePapers;
  const displayAuthorizationContexts =
    authorizationContexts ?? runtimeAuthorizationContexts;
  const initialScope = findInitialScope(
    displayScopes,
    effectiveRememberedScope,
  );
  const [selectedScopeKey, setSelectedScopeKey] = useState(
    initialScope === null ? "" : createScopeKey(initialScope),
  );
  const selectedScope =
    displayScopes.find((scope) => createScopeKey(scope) === selectedScopeKey) ??
    initialScope;
  const [selectedAuthorizationPublicId, setSelectedAuthorizationPublicId] =
    useState<string | null>(
      () =>
        selectAuthorizationContextForScope(
          displayAuthorizationContexts,
          initialScope,
          null,
        )?.authorizationPublicId ?? null,
    );
  const scopeAuthorizationContexts = useMemo(
    () =>
      selectAuthorizationContextsForScope(
        displayAuthorizationContexts,
        selectedScope,
      ),
    [displayAuthorizationContexts, selectedScope],
  );
  const selectedAuthorizationContext = useMemo(
    () =>
      selectAuthorizationContextForScope(
        displayAuthorizationContexts,
        selectedScope,
        selectedAuthorizationPublicId,
      ),
    [
      displayAuthorizationContexts,
      selectedAuthorizationPublicId,
      selectedScope,
    ],
  );
  const showAiTraining = canShowAiTraining(selectedAuthorizationContext);
  const showOrganizationTraining = canShowOrganizationTraining(
    selectedAuthorizationContext,
  );
  const aiTrainingPath =
    showAiTraining && selectedAuthorizationContext !== null
      ? createAuthorizationContextPath(
          "/ai-generation",
          selectedAuthorizationContext.authorizationPublicId,
        )
      : null;
  const organizationTrainingPath =
    showOrganizationTraining && selectedAuthorizationContext !== null
      ? createAuthorizationContextPath(
          "/organization-training",
          selectedAuthorizationContext.authorizationPublicId,
        )
      : null;
  const subjectGroups = useMemo(
    () => selectSubjectGroups(displayPapers, selectedScope),
    [displayPapers, selectedScope],
  );
  const visiblePaperCount = subjectGroups.reduce(
    (paperCount, group) => paperCount + group.papers.length,
    0,
  );
  const totalPaperPages = Math.max(
    1,
    Math.ceil(runtimePaperPagination.total / runtimePaperPagination.pageSize),
  );
  const authExpiryReminder = selectAuthExpiryReminder(
    displayScopes,
    authExpiryReminderDismissals,
  );
  useEffect(() => {
    if (!isRuntimeMode || state !== "ready") {
      return;
    }

    let isActive = true;

    async function loadStudentHome() {
      try {
        const scopePayload = await fetchStudentApi<StudentPaperScopePayload>(
          "/api/v1/student-papers/scopes",
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(scopePayload)) {
          setRuntimeState("unauthorized");
          return;
        }

        if (scopePayload.code !== 0 || scopePayload.data === null) {
          setRuntimeState("error");
          return;
        }

        const nextScopes = readStudentPaperScopes(scopePayload.data);
        const nextScope = findInitialScope(
          nextScopes,
          effectiveRememberedScope,
        );
        const nextAuthorizationContexts =
          await fetchAuthorizationContextsFailClosed();

        if (!isActive) {
          return;
        }

        setRuntimeAuthorizationContexts(nextAuthorizationContexts);
        setRuntimeScopes(nextScopes);
        setSelectedScopeKey(
          nextScope === null ? "" : createScopeKey(nextScope),
        );
        setSelectedAuthorizationPublicId(
          selectAuthorizationContextForScope(
            nextAuthorizationContexts,
            nextScope,
            null,
          )?.authorizationPublicId ?? null,
        );

        if (nextScope === null) {
          setRuntimePapers([]);
          setRuntimeState("ready");
          return;
        }

        const paperPage = await fetchStudentPaperPage(nextScope, 1);
        const paperPayload = paperPage.payload;

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(paperPayload)) {
          setRuntimeState("unauthorized");
          return;
        }

        if (paperPayload.code !== 0 || paperPayload.data === null) {
          setRuntimeState("error");
          return;
        }

        setRuntimePapers(paperPage.papers);
        setRuntimePaperPagination(paperPage.pagination);
        setRuntimeState("ready");
      } catch {
        if (isActive) {
          setRuntimeState("error");
        }
      }
    }

    void loadStudentHome();

    return () => {
      isActive = false;
    };
  }, [effectiveRememberedScope, isRuntimeMode, state]);

  useEffect(() => {
    if (displayState === "ready" && displayScopes.length === 0) {
      router.replace("/redeem-code");
    }
  }, [displayScopes.length, displayState, router]);

  async function handleSelectScope(scope: StudentPaperScopeDto) {
    const scopeKey = createScopeKey(scope);
    const nextAuthorizationContexts = selectAuthorizationContextsForScope(
      displayAuthorizationContexts,
      scope,
    );

    writeStudentHomeSelectedScope(scope);
    setSelectedScopeKey(scopeKey);
    setSelectedAuthorizationPublicId(
      nextAuthorizationContexts.length === 1
        ? nextAuthorizationContexts[0].authorizationPublicId
        : null,
    );

    if (!isRuntimeMode) {
      return;
    }

    setRuntimeState("loading");

    try {
      const paperPage = await fetchStudentPaperPage(scope, 1);
      const paperPayload = paperPage.payload;

      if (isStudentUnauthorizedResponse(paperPayload)) {
        setRuntimeState("unauthorized");
        return;
      }

      if (paperPayload.code !== 0 || paperPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      setRuntimePapers(paperPage.papers);
      setRuntimePaperPagination(paperPage.pagination);
      setRuntimeState("ready");
    } catch {
      setRuntimeState("error");
    }
  }

  async function handleSelectPaperPage(nextPage: number) {
    if (!isRuntimeMode || selectedScope === null) {
      return;
    }

    setRuntimeState("loading");

    try {
      const paperPage = await fetchStudentPaperPage(selectedScope, nextPage);
      const paperPayload = paperPage.payload;

      if (isStudentUnauthorizedResponse(paperPayload)) {
        setRuntimeState("unauthorized");
        return;
      }

      if (paperPayload.code !== 0 || paperPayload.data === null) {
        setRuntimeState("error");
        return;
      }

      setRuntimePapers(paperPage.papers);
      setRuntimePaperPagination(paperPage.pagination);
      setRuntimeState("ready");
    } catch {
      setRuntimeState("error");
    }
  }

  function handleSelectAuthorizationContext(authorizationPublicId: string) {
    if (
      !scopeAuthorizationContexts.some(
        (authorizationContext) =>
          authorizationContext.authorizationPublicId === authorizationPublicId,
      )
    ) {
      return;
    }

    setSelectedAuthorizationPublicId(authorizationPublicId);
  }

  function handleDismissAuthExpiryReminder(reminderKey: string) {
    const nextDismissals = {
      ...authExpiryReminderDismissals,
      [reminderKey]: formatLocalDateKey(new Date()),
    };

    writeAuthExpiryReminderDismissals(nextDismissals);
    setAuthExpiryReminderDismissals(nextDismissals);
  }

  if (displayState === "loading") {
    return <StudentHomeLoading />;
  }

  if (displayState === "unauthorized") {
    return (
      <StudentHomeStatusMessage
        title="请先登录"
        description="学员首页需要有效的学员会话，请登录后再查看授权范围。"
      />
    );
  }

  if (displayState === "error") {
    return (
      <StudentHomeStatusMessage
        title="学员首页加载失败"
        description="请稍后刷新页面，或重新登录后再查看授权范围。"
      />
    );
  }

  if (displayScopes.length === 0) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-text-primary text-lg font-semibold">
            暂无有效授权
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            兑换卡密或联系企业管理员开通授权后，即可查看对应专业和等级的试卷。
          </p>
        </div>
        <Link
          href="/redeem-code"
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          前往兑换卡密
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20 lg:max-w-5xl">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">继续学习</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            学员首页
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            先选择专业和等级，再选择试卷开始练习或模拟考试。
          </p>
        </div>
        <nav
          className="grid grid-cols-2 gap-2 lg:grid-cols-4"
          aria-label="学员导航"
        >
          <Link
            href="/redeem-code"
            className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <Ticket className="size-4" aria-hidden="true" />
            兑换卡密
          </Link>
          {aiTrainingPath !== null ? (
            <Link
              href={aiTrainingPath}
              className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
            >
              <BrainCircuit className="size-4" aria-hidden="true" />
              AI训练
            </Link>
          ) : null}
          {organizationTrainingPath !== null ? (
            <Link
              href={organizationTrainingPath}
              className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
            >
              <Building2 className="size-4" aria-hidden="true" />
              企业训练
            </Link>
          ) : null}
          <Link
            href="/exam-report"
            className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <History className="size-4" aria-hidden="true" />
            考试记录
          </Link>
        </nav>
      </div>

      <StudentHomeContextBand
        selectedScope={selectedScope}
        authorizationContext={selectedAuthorizationContext}
      />

      {authExpiryReminder === null ? null : (
        <AuthExpiryReminderBanner
          reminder={authExpiryReminder}
          onDismiss={handleDismissAuthExpiryReminder}
        />
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="授权范围">
        {displayScopes.map((scope) => {
          const scopeKey = createScopeKey(scope);
          const isSelected = scopeKey === selectedScopeKey;

          return (
            <button
              key={scopeKey}
              type="button"
              aria-pressed={isSelected}
              onClick={() => void handleSelectScope(scope)}
              className={`h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-secondary border"
              }`}
            >
              {formatScopeLabel(scope)}
            </button>
          );
        })}
      </div>

      <StudentHomeAuthorizationContextSelector
        authorizationContexts={scopeAuthorizationContexts}
        onSelect={handleSelectAuthorizationContext}
        selectedAuthorizationPublicId={
          selectedAuthorizationContext?.authorizationPublicId ?? null
        }
      />

      {visiblePaperCount === 0 ? (
        <StudentHomeStatusMessage
          title="当前范围暂无试卷"
          description="该授权范围下暂未发布可学习试卷，请稍后查看。"
        />
      ) : (
        <div className="space-y-5">
          {subjectGroups.map((group) => (
            <section
              key={group.subject}
              data-testid={`subject-group-${group.subject}`}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-text-primary text-lg font-semibold">
                  {subjectLabels[group.subject]}
                </h2>
                <span className="text-text-secondary text-sm">
                  {group.papers.length} 套试卷
                </span>
              </div>
              {group.papers.length === 0 ? (
                <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
                  暂无{subjectLabels[group.subject]}试卷
                </div>
              ) : (
                <div className="space-y-3">
                  {group.papers.map((paper) => (
                    <StudentPaperCard
                      key={paper.publicId}
                      authorizationContext={selectedAuthorizationContext}
                      paper={paper}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {isRuntimeMode &&
      (runtimePaperPagination.total > studentPaperPageSize ||
        runtimePaperPagination.page > 1) ? (
        <div className="border-border bg-surface flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
          <button
            type="button"
            disabled={runtimePaperPagination.page <= 1}
            onClick={() =>
              void handleSelectPaperPage(runtimePaperPagination.page - 1)
            }
            className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border px-3 font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          <div className="text-text-secondary text-center">
            <span>
              第 {runtimePaperPagination.page} / {totalPaperPages} 页
            </span>
            <span className="ml-2">共 {runtimePaperPagination.total} 套</span>
          </div>
          <button
            type="button"
            disabled={runtimePaperPagination.page >= totalPaperPages}
            onClick={() =>
              void handleSelectPaperPage(runtimePaperPagination.page + 1)
            }
            className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border px-3 font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      ) : null}
    </section>
  );
}
