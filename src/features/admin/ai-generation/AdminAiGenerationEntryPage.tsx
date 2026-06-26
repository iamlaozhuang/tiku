"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, ShieldCheck, WandSparkles } from "lucide-react";

import type { AdminAiGenerationLocalContractDto } from "@/server/contracts/admin-ai-generation-local-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";

import {
  AdminLoadingState,
  AdminSurfaceStatus,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";

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

const ORGANIZATION_ADVANCED_ROLE = "org_advanced_admin";
const ORGANIZATION_STANDARD_ROLE = "org_standard_admin";

function hasAnyRole(adminRoles: readonly string[], expectedRoles: string[]) {
  return expectedRoles.some((expectedRole) =>
    adminRoles.includes(expectedRole),
  );
}

function resolveLoadState(
  authContext: AuthContextDto,
  workspace: AdminAiGenerationWorkspace,
): AdminAiGenerationEntryLoadState {
  const adminRoles = (authContext.user.adminRoles ?? []) as readonly string[];

  if (workspace === "content") {
    return hasAnyRole(adminRoles, ["super_admin", "content_admin"])
      ? "ready"
      : "unauthorized";
  }

  if (hasAnyRole(adminRoles, ["super_admin", ORGANIZATION_ADVANCED_ROLE])) {
    return "ready";
  }

  if (adminRoles.includes(ORGANIZATION_STANDARD_ROLE)) {
    return "standard-unavailable";
  }

  return "unauthorized";
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
  const [localContractSummary, setLocalContractSummary] =
    useState<AdminAiGenerationLocalContractDto | null>(null);
  const pageCopy = getPageCopy(workspace, generationKind);

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

        setLoadState(resolveLoadState(sessionResponse.data, workspace));
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
  }, [workspace]);

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
      <AdminSurfaceStatus
        description="标准版组织后台不开放 AI出题 或 AI组卷。"
        icon={<AlertCircle aria-hidden="true" className="size-5" />}
        state="permission-denied"
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
              <dt className="text-text-secondary">Task</dt>
              <dd className="text-text-primary mt-1 font-mono text-xs">
                {localContractSummary.taskRequest.taskPublicId}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Result</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.taskRequest.resultReference.resultKind}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Visibility</dt>
              <dd className="text-text-primary mt-1">
                {
                  localContractSummary.taskRequest.resultReference
                    .contentVisibility
                }
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Provider</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.runtimeBridge.providerCallExecuted
                  ? "executed"
                  : "blocked"}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </section>
  );
}
