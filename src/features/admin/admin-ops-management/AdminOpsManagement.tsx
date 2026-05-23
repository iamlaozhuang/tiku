"use client";

import Link from "next/link";
import { AlertCircle, KeyRound, RotateCcwKey, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  FilterSelect,
  PublicId,
  fetchAdminApi,
  formatProfessionLevel,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "@/features/admin/content-admin-runtime";
import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  AiCallLogListDto,
  AiCallLogSummaryListDto,
  AuditLogListDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { ADMIN_CONFLICT_MESSAGE } from "@/server/contracts/admin-interaction-contract";
import type {
  EmployeeListDto,
  OrganizationListDto,
  RedeemCodeListDto,
  AdminUserListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { OrgAuthListDto } from "@/server/contracts/organization-auth-contract";
import type {
  AuthStatus,
  RedeemCodeStatus,
  UserStatus,
  UserType,
} from "@/server/models/auth";

type AdminOpsLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";

type AdminOpsData = {
  users: AdminUserListDto["users"];
  organizations: OrganizationListDto["organizations"];
  employees: EmployeeListDto["employees"];
  orgAuths: OrgAuthListDto["orgAuths"];
  redeemCodes: RedeemCodeListDto["redeemCodes"];
  auditLogs: AuditLogListDto["auditLogs"];
  aiCallLogs: AiCallLogListDto["aiCallLogs"];
  dailySummaries: AiCallLogSummaryListDto["dailySummaries"];
};

type ConfirmationState =
  | {
      kind: "resetPassword";
      publicId: string;
    }
  | {
      kind: "generateRedeemCode";
    }
  | null;

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

type AdminOpsLoadResult =
  | {
      data: AdminOpsData;
      loadState: "ready" | "empty";
    }
  | {
      data: AdminOpsData;
      loadState: "unauthorized" | "error";
    };

const DEFAULT_PAGE_SIZE = "20";
const DEFAULT_SORT_ORDER = "desc";

const userStatusOptions = [
  ["all", "全部状态"],
  ["active", "正常"],
  ["disabled", "已停用"],
] satisfies [UserStatus | "all", string][];

const userTypeOptions = [
  ["all", "全部类型"],
  ["personal", "个人"],
  ["employee", "企业员工"],
] satisfies [UserType | "all", string][];

const userStatusLabels = {
  active: "正常",
  disabled: "已停用",
} satisfies Record<UserStatus, string>;

const userTypeLabels = {
  employee: "企业员工",
  personal: "个人",
} satisfies Record<UserType, string>;

const authStatusLabels = {
  active: "生效中",
  cancelled: "已取消",
  expired: "已过期",
} satisfies Record<AuthStatus, string>;

const redeemCodeStatusLabels = {
  expired: "已过期",
  unused: "未使用",
  used: "已使用",
} satisfies Record<RedeemCodeStatus, string>;

const emptyAdminOpsData: AdminOpsData = {
  aiCallLogs: [],
  auditLogs: [],
  dailySummaries: [],
  employees: [],
  orgAuths: [],
  organizations: [],
  redeemCodes: [],
  users: [],
};

const adminOpsLoadCache = new Map<string, Promise<AdminOpsLoadResult>>();

function createListSearchParams(input: {
  sortBy: string;
  sortOrder: string;
  userStatus: string;
  userType: string;
}) {
  const searchParams = new URLSearchParams({
    page: "1",
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: input.sortBy,
    sortOrder: input.sortOrder,
  });

  if (input.userStatus !== "all") {
    searchParams.set("status", input.userStatus);
  }

  if (input.userType !== "all") {
    searchParams.set("userType", input.userType);
  }

  return searchParams.toString();
}

function hasAdminOpsData(data: AdminOpsData): boolean {
  return (
    data.users.length > 0 ||
    data.organizations.length > 0 ||
    data.employees.length > 0 ||
    data.orgAuths.length > 0 ||
    data.redeemCodes.length > 0 ||
    data.auditLogs.length > 0 ||
    data.aiCallLogs.length > 0 ||
    data.dailySummaries.length > 0
  );
}

async function postAdminApi(
  path: string,
  sessionToken: string,
): Promise<ApiResponse<null>> {
  const response = await fetch(path, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<null>;
}

function getCachedAdminOpsLoadResult(listQuery: string) {
  const sessionToken = getStoredSessionToken();
  const cacheKey = `${sessionToken ?? "anonymous"}:${listQuery}`;
  const cachedResult = adminOpsLoadCache.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const loadResult = loadAdminOpsData(listQuery, sessionToken);

  adminOpsLoadCache.set(cacheKey, loadResult);

  return loadResult;
}

async function loadAdminOpsData(
  listQuery: string,
  sessionToken: string | null,
): Promise<AdminOpsLoadResult> {
  if (sessionToken === null) {
    return {
      data: emptyAdminOpsData,
      loadState: "unauthorized",
    };
  }

  try {
    const sessionResponse = await fetchAdminApi<AuthContextDto>(
      "/api/v1/sessions",
      sessionToken,
    );

    if (
      isUnauthorizedResponse(sessionResponse) ||
      sessionResponse.code !== 0 ||
      sessionResponse.data === null ||
      !isAdminContext(sessionResponse.data)
    ) {
      return {
        data: emptyAdminOpsData,
        loadState: "unauthorized",
      };
    }

    const [
      userResponse,
      organizationResponse,
      employeeResponse,
      orgAuthResponse,
      redeemCodeResponse,
      auditLogResponse,
      aiCallLogResponse,
      aiCallLogSummaryResponse,
    ] = await Promise.all([
      fetchAdminApi<AdminUserListDto>(
        `/api/v1/users?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<OrganizationListDto>(
        `/api/v1/organizations?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<EmployeeListDto>(
        `/api/v1/employees?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<OrgAuthListDto>(
        `/api/v1/org-auths?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<RedeemCodeListDto>(
        `/api/v1/redeem-codes?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<AuditLogListDto>(
        `/api/v1/audit-logs?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<AiCallLogListDto>(
        `/api/v1/ai-call-logs?${listQuery}`,
        sessionToken,
      ),
      fetchAdminApi<AiCallLogSummaryListDto>(
        `/api/v1/ai-call-logs/summary?${listQuery}`,
        sessionToken,
      ),
    ]);

    if (
      userResponse.code !== 0 ||
      userResponse.data === null ||
      organizationResponse.code !== 0 ||
      organizationResponse.data === null ||
      employeeResponse.code !== 0 ||
      employeeResponse.data === null ||
      orgAuthResponse.code !== 0 ||
      orgAuthResponse.data === null ||
      redeemCodeResponse.code !== 0 ||
      redeemCodeResponse.data === null ||
      auditLogResponse.code !== 0 ||
      auditLogResponse.data === null ||
      aiCallLogResponse.code !== 0 ||
      aiCallLogResponse.data === null ||
      aiCallLogSummaryResponse.code !== 0 ||
      aiCallLogSummaryResponse.data === null
    ) {
      return {
        data: emptyAdminOpsData,
        loadState: "error",
      };
    }

    const data = {
      aiCallLogs: aiCallLogResponse.data.aiCallLogs,
      auditLogs: auditLogResponse.data.auditLogs,
      dailySummaries: aiCallLogSummaryResponse.data.dailySummaries,
      employees: employeeResponse.data.employees,
      orgAuths: orgAuthResponse.data.orgAuths,
      organizations: organizationResponse.data.organizations,
      redeemCodes: redeemCodeResponse.data.redeemCodes,
      users: userResponse.data.users,
    };

    return {
      data,
      loadState: hasAdminOpsData(data) ? "ready" : "empty",
    };
  } catch {
    return {
      data: emptyAdminOpsData,
      loadState: "error",
    };
  }
}

export function AdminOpsManagement() {
  const [loadState, setLoadState] = useState<AdminOpsLoadState>("loading");
  const [data, setData] = useState<AdminOpsData>(emptyAdminOpsData);
  const [userStatus, setUserStatus] = useState<UserStatus | "all">("all");
  const [userType, setUserType] = useState<UserType | "all">("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState(DEFAULT_SORT_ORDER);
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const listQuery = useMemo(
    () =>
      createListSearchParams({
        sortBy,
        sortOrder,
        userStatus,
        userType,
      }),
    [sortBy, sortOrder, userStatus, userType],
  );

  useEffect(() => {
    let isActive = true;

    const loadTimer = window.setTimeout(() => {
      void getCachedAdminOpsLoadResult(listQuery).then((result) => {
        if (!isActive) {
          return;
        }

        setData(result.data);
        setLoadState(result.loadState);
      });
    }, 50);

    return () => {
      isActive = false;
      window.clearTimeout(loadTimer);
    };
  }, [listQuery]);

  async function handleConfirmAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (confirmationState.kind === "generateRedeemCode") {
      setConfirmationState(null);
      setToastMessage({
        message: ADMIN_CONFLICT_MESSAGE,
        tone: "error",
      });
      return;
    }

    const resetResponse = await postAdminApi(
      `/api/v1/users/${confirmationState.publicId}/reset-password`,
      sessionToken,
    );

    setConfirmationState(null);
    setToastMessage(
      resetResponse.code === 0
        ? {
            message: "密码已重置，未返回明文密码",
            tone: "success",
          }
        : {
            message: resetResponse.message,
            tone: "error",
          },
    );
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载运营后台数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看运营后台数据。"
        title="运营后台数据加载失败"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        description="当前没有可展示的用户、企业、卡密、审计日志或 AI 调用日志。"
        title="暂无运营后台数据"
      />
    );
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">Admin Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            运营后台闭环
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            用户、企业、员工、企业授权、卡密、审计日志和 AI
            调用日志均通过受保护的 runtime API 加载，页面只使用 publicId。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
            href="/ops/organizations"
          >
            企业授权页
          </Link>
          <Button
            variant="destructive"
            onClick={() => setConfirmationState({ kind: "generateRedeemCode" })}
          >
            生成卡密
          </Button>
        </div>
      </header>

      <section
        aria-label="运营筛选"
        className="bg-surface border-border flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-sm"
      >
        <FilterSelect
          label="用户状态"
          options={userStatusOptions}
          value={userStatus}
          onChange={(value) => setUserStatus(value as UserStatus | "all")}
        />
        <FilterSelect
          label="用户类型"
          options={userTypeOptions}
          value={userType}
          onChange={(value) => setUserType(value as UserType | "all")}
        />
        <Button
          variant="outline"
          onClick={() => {
            setSortBy("registeredAt");
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
          }}
        >
          注册时间排序
        </Button>
        <p className="text-text-muted text-sm">
          筛选变化自动刷新；关键写操作使用二次确认。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-4" aria-label="运营摘要">
        <SummaryTile
          icon={<ShieldCheck aria-hidden="true" className="size-4" />}
          label="用户"
          value={`${data.users.length}`}
        />
        <SummaryTile
          icon={<ShieldCheck aria-hidden="true" className="size-4" />}
          label="企业授权"
          value={`${data.orgAuths.length}`}
        />
        <SummaryTile
          icon={<KeyRound aria-hidden="true" className="size-4" />}
          label="卡密"
          value={`${data.redeemCodes.length}`}
        />
        <SummaryTile
          icon={<RotateCcwKey aria-hidden="true" className="size-4" />}
          label="AI 调用"
          value={`${data.aiCallLogs.length}`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AdminPanel title="用户管理">
          {data.users.map((user) => (
            <AdminRow
              key={user.publicId}
              publicId={user.publicId}
              testId={`admin-user-row-${user.publicId}`}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {user.name} / {user.phone}
                </p>
                <p className="text-text-muted text-xs">
                  {userTypeLabels[user.userType]} /{" "}
                  {userStatusLabels[user.status]} /{" "}
                  {user.organizationName ?? "未绑定企业"} /{" "}
                  {user.authStatus === null
                    ? "无授权"
                    : authStatusLabels[user.authStatus]}
                </p>
                <PublicId value={user.publicId} />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmationState({
                    kind: "resetPassword",
                    publicId: user.publicId,
                  })
                }
              >
                重置密码
              </Button>
            </AdminRow>
          ))}
        </AdminPanel>

        <AdminPanel title="企业组织与员工">
          {data.organizations.map((organization) => (
            <AdminRow
              key={organization.publicId}
              publicId={organization.publicId}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {organization.name}
                </p>
                <p className="text-text-muted text-xs">
                  {organization.orgTier} / {organization.employeeCount} 名员工 /{" "}
                  {organization.authSummary ?? "暂无授权摘要"}
                </p>
              </div>
            </AdminRow>
          ))}
          {data.employees.map((employee) => (
            <AdminRow key={employee.publicId} publicId={employee.publicId}>
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {employee.name} / {employee.phone}
                </p>
                <p className="text-text-muted text-xs">
                  用户 {employee.userPublicId} / 企业{" "}
                  {employee.organizationPublicId}
                </p>
              </div>
            </AdminRow>
          ))}
        </AdminPanel>

        <AdminPanel title="企业授权">
          {data.orgAuths.map((orgAuth) => (
            <AdminRow key={orgAuth.publicId} publicId={orgAuth.publicId}>
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {orgAuth.name}
                </p>
                <p className="text-text-muted text-xs">
                  {formatProfessionLevel(orgAuth)} / {orgAuth.usedQuota} /{" "}
                  {orgAuth.accountQuota} / {authStatusLabels[orgAuth.status]}
                </p>
              </div>
            </AdminRow>
          ))}
        </AdminPanel>

        <AdminPanel title="卡密管理">
          {data.redeemCodes.map((redeemCode) => (
            <AdminRow key={redeemCode.publicId} publicId={redeemCode.publicId}>
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary font-mono text-sm font-semibold">
                  {redeemCode.codeDisplay}
                </p>
                <p className="text-text-muted text-xs">
                  {formatProfessionLevel(redeemCode)} /{" "}
                  {redeemCodeStatusLabels[redeemCode.status]} / 兑换用户{" "}
                  {redeemCode.redeemedUserPublicId ?? "无"}
                </p>
              </div>
            </AdminRow>
          ))}
        </AdminPanel>

        <AdminPanel title="审计日志">
          <p className="text-text-muted mb-2 text-xs">审计日志只读</p>
          {data.auditLogs.map((auditLog) => (
            <AdminRow key={auditLog.publicId} publicId={auditLog.publicId}>
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {auditLog.actionType}
                </p>
                <p className="text-text-muted text-xs">
                  {auditLog.actorRole} / {auditLog.targetResourceType} /{" "}
                  {auditLog.resultStatus} / {auditLog.metadataSummary}
                </p>
              </div>
            </AdminRow>
          ))}
        </AdminPanel>

        <AdminPanel title="AI 调用日志">
          <p className="text-text-muted mb-2 text-xs">AI 调用日志只读</p>
          {data.aiCallLogs.map((aiCallLog) => (
            <AdminRow key={aiCallLog.publicId} publicId={aiCallLog.publicId}>
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {aiCallLog.aiFuncType} / {aiCallLog.callStatus}
                </p>
                <p className="text-text-muted text-xs">
                  {aiCallLog.providerDisplayName} / {aiCallLog.modelAlias} /{" "}
                  {aiCallLog.totalTokenCount ?? 0} tokens /{" "}
                  {aiCallLog.promptSummary ?? "已脱敏"}
                </p>
              </div>
            </AdminRow>
          ))}
          {data.dailySummaries.map((summary) => (
            <AdminRow
              key={`${summary.bucket}-${summary.aiFuncType}-${summary.modelAlias}`}
              publicId={`${summary.bucket}-${summary.aiFuncType}-${summary.modelAlias}`}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {summary.bucket} / {summary.aiFuncType}
                </p>
                <p className="text-text-muted text-xs">
                  {summary.callCount} 次 / {summary.estimatedCostCny} CNY
                </p>
              </div>
            </AdminRow>
          ))}
        </AdminPanel>
      </section>

      {confirmationState === null ? null : (
        <AdminOpsConfirmationDialog
          confirmationState={confirmationState}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmAction()}
        />
      )}

      {toastMessage === null ? null : <AdminOpsToast message={toastMessage} />}
    </main>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        {icon}
        {label}
      </div>
      <p className="font-heading text-text-primary mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function AdminPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function AdminRow({
  children,
  publicId,
  testId,
}: {
  children: React.ReactNode;
  publicId: string;
  testId?: string;
}) {
  return (
    <article
      className="border-border flex flex-col gap-3 border-t pt-3 first:border-t-0 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
      data-public-id={publicId}
      data-testid={testId}
    >
      {children}
    </article>
  );
}

function AdminOpsConfirmationDialog({
  confirmationState,
  onCancel,
  onConfirm,
}: {
  confirmationState: Exclude<ConfirmationState, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isResetPassword = confirmationState.kind === "resetPassword";
  const title = isResetPassword ? "确认重置用户密码？" : "卡密生成需要二次确认";
  const confirmLabel = isResetPassword ? "确认重置" : "确认生成";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            aria-hidden="true"
            className="text-brand-primary size-4"
          />
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
        </div>
        <p className="text-text-muted text-sm">
          {isResetPassword
            ? "重置只提交用户 publicId，响应不会返回明文密码。"
            : "批量生成卡密必须由后端原子操作保护；当前提示并发冲突以防止重复生成。"}
        </p>
        <div className="flex gap-2">
          <Button
            variant={isResetPassword ? "default" : "destructive"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminOpsToast({ message }: { message: ToastMessage }) {
  return (
    <div
      className={
        message.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={message.tone === "success" ? "status" : "alert"}
    >
      {message.message}
    </div>
  );
}
