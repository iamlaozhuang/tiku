"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import type {
  AdminAiGenerationLocalContractDto,
  AdminAiGenerationTaskHistoryDto,
  AdminAiGenerationTaskHistoryItemDto,
} from "@/server/contracts/admin-ai-generation-local-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";

import {
  AdminLoadingState,
  AdminSurfaceStatus,
  AdminUnauthorizedState,
  AdminUpgradeRequiredState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import { resolveOrganizationWorkspacePageAccess } from "../organization-workspace/admin-organization-workspace-access";

type AdminAiGenerationEntryLoadState =
  | "loading"
  | "ready"
  | "standard-unavailable"
  | "unauthorized"
  | "error";
type AdminAiGenerationWorkspace = "content" | "organization";
type AdminAiGenerationKind = "question" | "paper";
type AdminAiGenerationRequestState =
  | "idle"
  | "submitting"
  | "accepted"
  | "error";
type AdminAiGenerationHistoryState = "loading" | "ready" | "empty" | "error";

function hasAnyRole(adminRoles: readonly string[], expectedRoles: string[]) {
  return expectedRoles.some((expectedRole) =>
    adminRoles.includes(expectedRole),
  );
}

function getOrganizationAiGenerationPath(
  generationKind: AdminAiGenerationKind,
) {
  return generationKind === "question"
    ? "/organization/ai-question-generation"
    : "/organization/ai-paper-generation";
}

function resolveLoadState(
  authContext: AuthContextDto,
  workspace: AdminAiGenerationWorkspace,
  generationKind: AdminAiGenerationKind,
): AdminAiGenerationEntryLoadState {
  const adminRoles = (authContext.user.adminRoles ?? []) as readonly string[];

  if (workspace === "content") {
    return hasAnyRole(adminRoles, ["super_admin", "content_admin"])
      ? "ready"
      : "unauthorized";
  }

  return resolveOrganizationWorkspacePageAccess(
    authContext,
    getOrganizationAiGenerationPath(generationKind),
  ).loadState;
}

function getPageCopy(
  workspace: AdminAiGenerationWorkspace,
  generationKind: AdminAiGenerationKind,
) {
  const isQuestionGeneration = generationKind === "question";

  if (workspace === "content") {
    return {
      eyebrow: "内容 AI 草稿/评审",
      title: isQuestionGeneration ? "内容 AI出题" : "内容 AI组卷",
      description:
        "生成结果只进入内容 AI 草稿/评审池，正式题目或试卷写入仍需评审、编辑、校验和审计日志。",
      actionLabel: isQuestionGeneration ? "AI出题" : "AI组卷",
      boundaryLabel: "不直接写入正式题目或试卷",
    };
  }

  return {
    eyebrow: "组织高级 AI 草稿",
    title: isQuestionGeneration ? "组织 AI出题" : "组织 AI组卷",
    description:
      "生成结果归属当前组织，保留在组织内容草稿池，不进入平台正式题库或试卷库。",
    actionLabel: isQuestionGeneration ? "AI出题" : "AI组卷",
    boundaryLabel: "仅创建组织草稿",
  };
}

function getAdminAiGenerationRequestPath(
  workspace: AdminAiGenerationWorkspace,
): string {
  return workspace === "content"
    ? "/api/v1/content-ai-generation-requests"
    : "/api/v1/organization-ai-generation-requests";
}

function getGenerationKindLabel(generationKind: AdminAiGenerationKind): string {
  return generationKind === "question" ? "AI出题" : "AI组卷";
}

function getTaskStatusLabel(
  status: AdminAiGenerationTaskHistoryItemDto["status"],
): string {
  const labels = {
    pending: "等待生成",
    running: "生成中",
    succeeded: "已完成",
    failed: "失败",
    cancelled: "已取消",
  } satisfies Record<AdminAiGenerationTaskHistoryItemDto["status"], string>;

  return labels[status];
}

function getVisibilityLabel(
  visibility: AdminAiGenerationTaskHistoryItemDto["contentVisibility"],
): string {
  return visibility === "summary_only" ? "仅摘要" : visibility;
}

function formatRequestedAt(requestedAt: string): string {
  return requestedAt.slice(0, 16).replace("T", " ");
}

const contentAdminReviewLocalValidationItems = [
  {
    boundaryStatus: "batch_adoption_mutation:not_executed",
    contractStatus: "batch_selection_preview",
    validationMode: "preview_only",
  },
  {
    boundaryStatus: "retry_mutation:not_executed",
    contractStatus: "failed_retry_state",
    validationMode: "request_only",
  },
  {
    boundaryStatus: "raw_payload_exposure:not_executed",
    contractStatus: "result_diff_read_model",
    validationMode: "read_only",
  },
  {
    boundaryStatus: "history_mutation:not_executed",
    contractStatus: "adoption_history_read_model",
    validationMode: "read_only",
  },
] as const;

function AdminAiGenerationTaskHistoryPanel({
  state,
  taskHistory,
  workspace,
}: {
  state: AdminAiGenerationHistoryState;
  taskHistory: AdminAiGenerationTaskHistoryDto | null;
  workspace: AdminAiGenerationWorkspace;
}) {
  const items = taskHistory?.items ?? [];
  const historyCopy =
    workspace === "organization"
      ? {
          eyebrow: "组织草稿池",
          empty:
            "组织草稿池暂无任务记录。Provider 仍保持阻断，不会生成正式 question 或 paper。",
        }
      : {
          eyebrow: "Provider-disabled 状态",
          empty:
            "暂无任务记录。提交后将显示等待生成、Provider 阻断和正式写入阻断状态。",
        };

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="admin-ai-generation-task-history"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            {historyCopy.eyebrow}
          </p>
          <h2 className="text-text-primary mt-1 text-base font-semibold">
            最近任务
          </h2>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          元数据历史
        </span>
      </div>

      {state === "loading" ? (
        <div
          className="text-text-secondary mt-4 flex items-center gap-2 text-sm"
          role="status"
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          正在加载任务历史
        </div>
      ) : null}

      {state === "error" ? (
        <div
          className="border-destructive/40 bg-destructive/5 mt-4 rounded-md border p-3"
          data-testid="admin-ai-generation-task-history-error"
          role="alert"
        >
          <h3 className="text-text-primary text-sm font-semibold">
            任务历史暂不可用
          </h3>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            当前仅显示入口状态。历史接口失败不会启用
            Provider，也不会写入正式题目或试卷。
          </p>
        </div>
      ) : null}

      {state === "empty" ? (
        <div
          className="bg-muted text-text-secondary mt-4 rounded-md p-3 text-sm leading-6"
          role="status"
        >
          {historyCopy.empty}
        </div>
      ) : null}

      {state === "ready" ? (
        <div className="mt-4 space-y-3">
          {items.map((taskItem) => (
            <article
              className="border-border bg-background rounded-md border p-3"
              key={taskItem.taskPublicId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-text-primary text-sm font-semibold">
                    {getGenerationKindLabel(taskItem.generationKind)}
                  </h3>
                  <p className="text-text-secondary mt-1 text-xs">
                    {formatRequestedAt(taskItem.requestedAt)}
                  </p>
                </div>
                <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
                  {getTaskStatusLabel(taskItem.status)}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-text-secondary">内容可见性</dt>
                  <dd className="text-text-primary mt-1">
                    {getVisibilityLabel(taskItem.contentVisibility)}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Provider</dt>
                  <dd className="text-text-primary mt-1">Provider 已阻断</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">成本校准</dt>
                  <dd className="text-text-primary mt-1">
                    Cost Calibration 已阻断
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">正式内容</dt>
                  <dd className="text-text-primary mt-1">正式写入已阻断</dd>
                </div>
              </dl>

              {taskItem.generatedResult !== null ? (
                <div className="border-border bg-muted/40 mt-3 rounded-md border p-3">
                  <p className="text-brand-primary text-xs font-medium">
                    已持久化脱敏生成摘要
                  </p>
                  <p className="text-text-primary mt-2 text-sm leading-6">
                    {taskItem.generatedResult.contentPreviewMasked}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-text-secondary">结果可见性</dt>
                      <dd className="text-text-primary mt-1">
                        {taskItem.generatedResult.contentVisibility}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-secondary">证据状态</dt>
                      <dd className="text-text-primary mt-1">
                        {taskItem.generatedResult.evidenceStatus}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-secondary">引用数量</dt>
                      <dd className="text-text-primary mt-1">
                        {taskItem.generatedResult.citationCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-secondary">正式采用</dt>
                      <dd className="text-text-primary mt-1">
                        {taskItem.generatedResult.formalAdoptionStatus ===
                        "blocked"
                          ? "已阻断"
                          : taskItem.generatedResult.formalAdoptionStatus}
                      </dd>
                    </div>
                  </dl>
                  {workspace === "content" ? (
                    <ContentAdminReviewTraceabilityPanel />
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ContentAdminReviewTraceabilityPanel() {
  return (
    <section
      className="border-border bg-background mt-3 rounded-md border p-3"
      data-testid="content-admin-review-traceability"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            content_admin_review_traceability
          </p>
          <h4 className="text-text-primary mt-1 text-sm font-semibold">
            single_result_traceable
          </h4>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          blocked_requires_fresh_publish_task
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-secondary">review_state</dt>
          <dd className="text-text-primary mt-1">awaiting_metadata_review</dd>
        </div>
        <div>
          <dt className="text-text-secondary">result_scope</dt>
          <dd className="text-text-primary mt-1">redacted</dd>
        </div>
        <div>
          <dt className="text-text-secondary">adoption_mutation</dt>
          <dd className="text-text-primary mt-1">not_executed</dd>
        </div>
        <div>
          <dt className="text-text-secondary">student_visible_runtime</dt>
          <dd className="text-text-primary mt-1">not_executed</dd>
        </div>
      </dl>

      <section
        className="border-border bg-muted/40 mt-3 rounded-md border p-3"
        data-testid="content-admin-review-batch-retry-diff-history-local-validation"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-brand-primary text-xs font-medium">
              batch_retry_diff_history_local_validation
            </p>
            <h5 className="text-text-primary mt-1 text-sm font-semibold">
              source_contracts_ready
            </h5>
          </div>
          <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
            browser_e2e_dev_server:not_executed
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {contentAdminReviewLocalValidationItems.map((item) => (
            <dl
              className="border-border bg-background rounded-md border p-2 text-xs"
              key={item.contractStatus}
            >
              <div>
                <dt className="text-text-secondary">contract</dt>
                <dd className="text-text-primary mt-1">
                  {item.contractStatus}
                </dd>
              </div>
              <div className="mt-2">
                <dt className="text-text-secondary">validation_mode</dt>
                <dd className="text-text-primary mt-1">
                  {item.validationMode}
                </dd>
              </div>
              <div className="mt-2">
                <dt className="text-text-secondary">boundary</dt>
                <dd className="text-text-primary mt-1">
                  {item.boundaryStatus}
                </dd>
              </div>
            </dl>
          ))}
        </div>
      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="content-admin-review-adopt-action"
          disabled
          type="button"
        >
          采用需后续任务
        </button>
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="content-admin-review-reject-action"
          disabled
          type="button"
        >
          驳回需后续任务
        </button>
      </div>
    </section>
  );
}

export function AdminAiGenerationEntryPage({
  generationKind,
  workspace,
}: {
  generationKind: AdminAiGenerationKind;
  workspace: AdminAiGenerationWorkspace;
}) {
  const [loadState, setLoadState] =
    useState<AdminAiGenerationEntryLoadState>("loading");
  const [requestState, setRequestState] =
    useState<AdminAiGenerationRequestState>("idle");
  const [historyState, setHistoryState] =
    useState<AdminAiGenerationHistoryState>("loading");
  const [localContractSummary, setLocalContractSummary] =
    useState<AdminAiGenerationLocalContractDto | null>(null);
  const [taskHistory, setTaskHistory] =
    useState<AdminAiGenerationTaskHistoryDto | null>(null);
  const pageCopy = getPageCopy(workspace, generationKind);

  const refreshTaskHistory = useCallback(
    async (sessionToken: string | null) => {
      setHistoryState("loading");

      const historyResponse =
        await fetchAdminApi<AdminAiGenerationTaskHistoryDto>(
          getAdminAiGenerationRequestPath(workspace),
          sessionToken,
        );

      if (isUnauthorizedResponse(historyResponse)) {
        setLoadState("unauthorized");
        return "unauthorized";
      }

      if (historyResponse.code !== 0 || historyResponse.data === null) {
        setTaskHistory(null);
        setHistoryState("error");
        return "ready";
      }

      setTaskHistory(historyResponse.data);
      setHistoryState(
        historyResponse.data.items.length === 0 ? "empty" : "ready",
      );
      return "ready";
    },
    [workspace],
  );

  useEffect(() => {
    let isActive = true;

    async function loadAdminSession() {
      const sessionToken = getStoredSessionToken();

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const nextLoadState = resolveLoadState(
          sessionResponse.data,
          workspace,
          generationKind,
        );

        if (nextLoadState !== "ready") {
          setLoadState(nextLoadState);
          return;
        }

        const historyLoadState = await refreshTaskHistory(sessionToken);

        if (isActive && historyLoadState === "ready") {
          setLoadState("ready");
        }
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminSession();

    return () => {
      isActive = false;
    };
  }, [generationKind, refreshTaskHistory, workspace]);

  async function handleSubmitLocalContractRequest() {
    const sessionToken = getStoredSessionToken();

    setRequestState("submitting");
    setLocalContractSummary(null);

    try {
      const requestResponse =
        await fetchAdminApi<AdminAiGenerationLocalContractDto>(
          getAdminAiGenerationRequestPath(workspace),
          sessionToken,
          {
            body: JSON.stringify({ generationKind }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          },
        );

      if (isUnauthorizedResponse(requestResponse)) {
        setLoadState("unauthorized");
        return;
      }

      if (requestResponse.code !== 0 || requestResponse.data === null) {
        setRequestState("error");
        return;
      }

      setLocalContractSummary(requestResponse.data);
      setRequestState("accepted");
      await refreshTaskHistory(sessionToken);
    } catch {
      setRequestState("error");
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载 AI 入口" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminUpgradeRequiredState
        description="标准版组织后台不开放 AI出题 或 AI组卷。升级需由运营管理员维护高级版企业授权。"
        returnHref="/organization/portal"
        returnLabel="返回组织概览"
        title="标准版暂不可用"
      />
    );
  }

  if (loadState === "error") {
    return (
      <AdminSurfaceStatus
        description="请刷新页面，或重新登录后再进入 AI 草稿入口。"
        icon={<AlertCircle aria-hidden="true" className="size-5" />}
        state="error"
        title="AI 入口加载失败"
      />
    );
  }

  return (
    <section className="space-y-6" data-testid="admin-ai-generation-entry">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            {pageCopy.eyebrow}
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {pageCopy.title}
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            {pageCopy.description}
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <WandSparkles aria-hidden="true" className="size-4" />
            <h2>{pageCopy.actionLabel}</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            本地入口已就绪，模型服务执行仍由后续任务审批。
          </p>
          <button
            className="bg-primary text-primary-foreground mt-4 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="admin-ai-generation-submit"
            disabled={requestState === "submitting"}
            type="button"
            onClick={handleSubmitLocalContractRequest}
          >
            {requestState === "submitting" ? "提交中" : pageCopy.actionLabel}
          </button>
        </section>

        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <FileText aria-hidden="true" className="size-4" />
            <h2>草稿评审</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            {pageCopy.boundaryLabel}
          </p>
        </section>

        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4" />
            <h2>脱敏证据</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            仅记录入口、状态、角色和脱敏摘要。
          </p>
        </section>
      </div>

      <AdminAiGenerationTaskHistoryPanel
        state={historyState}
        taskHistory={taskHistory}
        workspace={workspace}
      />

      {requestState === "error" ? (
        <section
          className="border-destructive/40 bg-destructive/5 rounded-md border p-4"
          data-testid="admin-ai-generation-local-contract-error"
          role="alert"
        >
          <h2 className="text-text-primary text-sm font-semibold">
            本地合约请求暂不可用
          </h2>
          <p className="text-text-secondary mt-2 text-sm leading-6">
            请求未执行
            Provider，也未写入正式题目或试卷。请稍后重试或查看本地验证证据。
          </p>
        </section>
      ) : null}

      {localContractSummary !== null ? (
        <section
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-testid="admin-ai-generation-local-contract-summary"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-brand-primary text-xs font-medium">
                本地合约摘要
              </p>
              <h2 className="text-text-primary mt-1 text-base font-semibold">
                {localContractSummary.flowStatus}
              </h2>
            </div>
            <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono text-xs">
              {localContractSummary.runtimeStatus}
            </code>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-text-secondary">任务状态</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.resultState.status}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">结果内容</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.resultState.resultPublicId === null
                  ? "暂无生成结果"
                  : "已产生结果引用"}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">可见性</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.resultState.contentVisibility}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Provider</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.runtimeBridge.providerCallExecuted
                  ? "已执行"
                  : "已阻断"}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </section>
  );
}
