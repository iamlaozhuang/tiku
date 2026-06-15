"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { Profession, Subject } from "@/server/models/paper";

export type AdminLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";
type AdminUxState = "loading" | "empty" | "error" | "permission-denied";

export const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
export const COOKIE_BACKED_SESSION_TOKEN = "__cookie_backed_session__";
export const DEFAULT_CONTENT_LIST_QUERY =
  "page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc";

export const professionLabels = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
} satisfies Record<Profession, string>;

export const subjectLabels = {
  skill: "技能",
  theory: "理论",
} satisfies Record<Subject, string>;

export function getStoredSessionToken(): string | null {
  const sessionToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)?.trim();

  return sessionToken === "" || sessionToken === undefined
    ? COOKIE_BACKED_SESSION_TOKEN
    : sessionToken;
}

export function createAdminAuthHeaders(
  sessionToken: string | null,
): Record<string, string> {
  if (sessionToken === null || sessionToken === COOKIE_BACKED_SESSION_TOKEN) {
    return {};
  }

  return { authorization: `Bearer ${sessionToken}` };
}

export async function fetchAdminApi<TData>(
  path: string,
  sessionToken: string | null,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: createAdminAuthHeaders(sessionToken),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

export function isAdminContext(payload: AuthContextDto): boolean {
  return (
    payload.user.adminPublicId !== null &&
    (payload.user.adminRoles?.length ?? 0) > 0
  );
}

export function isUnauthorizedResponse(payload: ApiResponse<unknown>): boolean {
  return payload.code === 401001;
}

export function formatScope(input: {
  profession: Profession;
  level: number;
  subject: Subject;
}): string {
  return `${professionLabels[input.profession]} / ${input.level}级 / ${
    subjectLabels[input.subject]
  }`;
}

export function formatProfessionLevel(input: {
  profession: Profession;
  level: number;
}): string {
  return `${professionLabels[input.profession]} ${input.level}级`;
}

export function includesKeyword(text: string, keyword: string) {
  return keyword.trim() === "" || text.includes(keyword.trim().toLowerCase());
}

export function matchesFilter<TValue extends string>(
  actual: TValue,
  expected: "all" | TValue,
) {
  return expected === "all" || actual === expected;
}

export function matchesNullableFilter<TValue extends string>(
  actual: TValue | null,
  expected: "all" | TValue,
) {
  return expected === "all" || actual === expected;
}

export function AdminSurfaceStatus({
  action,
  description,
  icon,
  state,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: ReactNode;
  state: Exclude<AdminUxState, "loading">;
  title: string;
}) {
  const role = state === "empty" ? "status" : "alert";

  return (
    <main
      aria-live={role === "status" ? "polite" : "assertive"}
      className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center"
      data-admin-ux-state={state}
      role={role}
    >
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        {icon}
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

export function AdminUnauthorizedState() {
  return (
    <AdminSurfaceStatus
      action={
        <Link
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          href="/login"
        >
          前往登录
        </Link>
      }
      description="后台数据需要有效的管理员会话，请登录后再查看。"
      icon={<AlertCircle aria-hidden="true" className="size-5" />}
      state="permission-denied"
      title="请先登录后台"
    />
  );
}

export function AdminLoadingState({ label }: { label: string }) {
  return (
    <main
      aria-live="polite"
      className="space-y-4"
      data-admin-ux-state="loading"
      role="status"
    >
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {label}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((itemIndex) => (
          <div
            className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
            key={itemIndex}
          >
            <div className="bg-border h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-border mt-3 h-3 w-1/2 animate-pulse rounded" />
            <div className="bg-border mt-5 h-14 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}

export function AdminErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      description={description}
      icon={<AlertCircle aria-hidden="true" className="size-5" />}
      state="error"
      title={title}
    />
  );
}

export function AdminEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      description={description}
      icon={<CheckCircle2 aria-hidden="true" className="size-5" />}
      state="empty"
      title={title}
    />
  );
}

export function PublicId({ value }: { value: string }) {
  return (
    <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono text-xs">
      {value}
    </code>
  );
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <select
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ContentOpsStagingRoleArrangement() {
  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-testid="content-ops-staging-required-role-arrangement"
    >
      <div className="space-y-2">
        <p className="text-brand-primary text-xs font-medium">
          内容运营本地验收
        </p>
        <h2 className="text-text-primary text-base font-semibold">
          内容运营体验安排
        </h2>
        <div className="grid gap-3 text-sm leading-6 lg:grid-cols-3">
          <p className="text-text-secondary">
            知识点节点新增、编辑、停用作为本轮可写闭环。
          </p>
          <p className="text-text-secondary">
            题目、材料、试卷先验只读筛选和列表可见性。
          </p>
          <p className="text-text-secondary">
            不可用写操作必须显示原因和下一步，避免半成品按钮。
          </p>
        </div>
      </div>
    </section>
  );
}
