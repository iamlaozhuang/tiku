"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch, Move, Pencil, Plus, Search, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AdminKnowledgeNodeOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { KnStatus } from "@/server/models/ai-rag";
import type { Profession } from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  ContentOpsStagingRoleArrangement,
  DEFAULT_CONTENT_LIST_QUERY,
  FilterSelect,
  PublicId,
  createAdminAuthHeaders,
  fetchAdminApi,
  getStoredSessionToken,
  includesKeyword,
  isAdminContext,
  isUnauthorizedResponse,
  matchesFilter,
  professionLabels,
} from "../content-admin-runtime";

type KnowledgeNodeLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";
type KnowledgeNodeStatusFilter = "all" | KnStatus;
type ProfessionFilter = "all" | Profession;

type KnowledgeNodeListDto = {
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
};

type KnowledgeNodeResultDto = {
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto;
};

type KnowledgeNodeAction =
  | {
      status: "idle";
    }
  | {
      status: "create" | "edit" | "disable";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
    }
  | {
      status: "move";
      parentTarget: AdminKnowledgeNodeOpsSummaryDto | null;
      target: AdminKnowledgeNodeOpsSummaryDto | null;
    }
  | {
      parentTarget?: AdminKnowledgeNodeOpsSummaryDto | null;
      status: "submitting";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
      type: "create" | "edit" | "disable" | "move";
    };

type RunnableKnowledgeNodeAction = Extract<
  KnowledgeNodeAction,
  { status: "create" | "edit" | "disable" | "move" }
>;

type ToastMessage = {
  message: string;
  tone: "success" | "error";
};

const knStatusLabels: Record<KnStatus, string> = {
  active: "可用",
  disabled: "已停用",
};

function useKnowledgeNodeData() {
  const [loadState, setLoadState] = useState<KnowledgeNodeLoadState>("loading");
  const [knowledgeNodes, setKnowledgeNodes] = useState<
    AdminKnowledgeNodeOpsSummaryDto[]
  >([]);

  useEffect(() => {
    let isActive = true;

    async function loadKnowledgeNodes() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

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

        const knowledgeNodeResponse = await fetchAdminApi<KnowledgeNodeListDto>(
          `/api/v1/knowledge-nodes?${DEFAULT_CONTENT_LIST_QUERY}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          knowledgeNodeResponse.code !== 0 ||
          knowledgeNodeResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setKnowledgeNodes(knowledgeNodeResponse.data.knowledgeNodes);
        setLoadState(
          knowledgeNodeResponse.data.knowledgeNodes.length === 0
            ? "empty"
            : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadKnowledgeNodes();

    return () => {
      isActive = false;
    };
  }, []);

  return { knowledgeNodes, loadState, setKnowledgeNodes };
}

export function AdminKnowledgeNodeManagement() {
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [status, setStatus] = useState<KnowledgeNodeStatusFilter>("all");
  const [action, setAction] = useState<KnowledgeNodeAction>({
    status: "idle",
  });
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const { knowledgeNodes, loadState, setKnowledgeNodes } =
    useKnowledgeNodeData();
  const filteredKnowledgeNodes = useMemo(
    () =>
      knowledgeNodes.filter((knowledgeNode) => {
        const searchableText = [
          knowledgeNode.publicId,
          knowledgeNode.name,
          knowledgeNode.pathName,
          knowledgeNode.parentKnowledgeNodePublicId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(knowledgeNode.profession, profession) &&
          matchesFilter(knowledgeNode.knStatus, status)
        );
      }),
    [keyword, knowledgeNodes, profession, status],
  );
  const activeKnowledgeNode = filteredKnowledgeNodes[0] ?? null;
  const moveParentCandidate = useMemo(
    () =>
      activeKnowledgeNode === null
        ? null
        : (filteredKnowledgeNodes.find(
            (knowledgeNode) =>
              knowledgeNode.publicId !== activeKnowledgeNode.publicId,
          ) ?? null),
    [activeKnowledgeNode, filteredKnowledgeNodes],
  );

  async function handleConfirmAction() {
    if (
      action.status !== "create" &&
      action.status !== "edit" &&
      action.status !== "disable" &&
      action.status !== "move"
    ) {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setAction({ status: "idle" });
      setToastMessage({
        message: "管理员会话已失效，请重新登录",
        tone: "error",
      });
      return;
    }

    setAction({
      parentTarget: action.status === "move" ? action.parentTarget : undefined,
      status: "submitting",
      target: action.target,
      type: action.status,
    });

    try {
      const response = await runKnowledgeNodeAction({
        action,
        sessionToken,
      });

      if (response === null) {
        setToastMessage({
          message: "知识点节点操作失败，请刷新后重试",
          tone: "error",
        });
        return;
      }

      if (action.status === "create") {
        setKnowledgeNodes((currentKnowledgeNodes) => [
          ...currentKnowledgeNodes,
          response,
        ]);
        setToastMessage({
          message: "知识点节点已新增",
          tone: "success",
        });
        return;
      }

      setKnowledgeNodes((currentKnowledgeNodes) =>
        currentKnowledgeNodes.map((knowledgeNode) =>
          knowledgeNode.publicId === response.publicId
            ? response
            : knowledgeNode,
        ),
      );
      setToastMessage({
        message:
          action.status === "edit"
            ? "知识点节点已更新"
            : action.status === "move"
              ? "知识点节点已移动"
              : "知识点节点已停用",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "知识点节点操作失败，请刷新后重试",
        tone: "error",
      });
    } finally {
      setAction({ status: "idle" });
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载知识点树" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看知识点树。"
        title="知识点树加载失败"
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Content Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            知识点树维护
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            按专业维护知识点节点、适用等级、排序、停用状态与绑定题目数量；页面只展示
            publicId，不暴露内部自增 id。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setToastMessage(null);
              setAction({ status: "create", target: null });
            }}
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            新增节点
          </Button>
          <Button
            disabled={filteredKnowledgeNodes.length === 0}
            variant="outline"
            onClick={() => {
              setToastMessage(null);
              setAction({ status: "edit", target: activeKnowledgeNode });
            }}
          >
            <Pencil aria-hidden="true" data-icon="inline-start" />
            编辑节点
          </Button>
          <Button
            disabled={
              activeKnowledgeNode === null || moveParentCandidate === null
            }
            variant="outline"
            onClick={() => {
              setToastMessage(null);
              setAction({
                parentTarget: moveParentCandidate,
                status: "move",
                target: activeKnowledgeNode,
              });
            }}
          >
            <Move aria-hidden="true" data-icon="inline-start" />
            移动节点
          </Button>
          <Button
            disabled={filteredKnowledgeNodes.length === 0}
            variant="outline"
            onClick={() => {
              setToastMessage(null);
              setAction({ status: "disable", target: activeKnowledgeNode });
            }}
          >
            <ShieldOff aria-hidden="true" data-icon="inline-start" />
            停用节点
          </Button>
        </div>
      </header>

      <ContentOpsStagingRoleArrangement />

      <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">关键词</span>
            <span className="relative">
              <Search
                aria-hidden="true"
                className="text-text-muted pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
              />
              <Input
                aria-label="关键词"
                className="pl-8"
                placeholder="节点名称、路径或 publicId"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </span>
          </label>
          <FilterSelect
            label="专业"
            options={[
              ["all", "全部专业"],
              ["marketing", "营销"],
              ["logistics", "物流"],
              ["monopoly", "专卖"],
            ]}
            value={profession}
            onChange={(value) => setProfession(value as ProfessionFilter)}
          />
          <FilterSelect
            label="状态"
            options={[
              ["all", "全部状态"],
              ["active", "可用"],
              ["disabled", "已停用"],
            ]}
            value={status}
            onChange={(value) => setStatus(value as KnowledgeNodeStatusFilter)}
          />
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3" aria-label="知识点摘要">
        <SummaryItem
          label="当前结果"
          value={`${filteredKnowledgeNodes.length} 个`}
        />
        <SummaryItem
          label="绑定题目"
          value={`${filteredKnowledgeNodes.reduce(
            (questionCount, knowledgeNode) =>
              questionCount + knowledgeNode.questionCount,
            0,
          )} 题`}
        />
        <SummaryItem
          label="可推荐"
          value={`${
            filteredKnowledgeNodes.filter(
              (knowledgeNode) => knowledgeNode.isRecommendable,
            ).length
          } 个`}
        />
      </section>

      {filteredKnowledgeNodes.length > 0 ? (
        <KnowledgeNodeList rows={filteredKnowledgeNodes} />
      ) : (
        <FilteredEmptyState />
      )}

      {action.status === "create" ||
      action.status === "edit" ||
      action.status === "move" ||
      action.status === "disable" ||
      action.status === "submitting" ? (
        <KnowledgeNodeActionDialog
          action={action}
          onCancel={() => setAction({ status: "idle" })}
          onConfirm={handleConfirmAction}
        />
      ) : null}

      {toastMessage === null ? null : (
        <KnowledgeNodeToast message={toastMessage} />
      )}
    </section>
  );
}

async function runKnowledgeNodeAction({
  action,
  sessionToken,
}: {
  action: RunnableKnowledgeNodeAction;
  sessionToken: string;
}): Promise<AdminKnowledgeNodeOpsSummaryDto | null> {
  const headers = {
    ...createAdminAuthHeaders(sessionToken),
    "content-type": "application/json",
  };

  if (action.status === "create") {
    return requestKnowledgeNode("/api/v1/knowledge-nodes", {
      body: JSON.stringify({
        parentKnowledgeNodePublicId: null,
        profession: "marketing",
        levelList: [3],
        name: "新增知识点",
        sortOrder: 30,
      }),
      headers,
      method: "POST",
    });
  }

  if (action.target === null || !isSafePublicId(action.target.publicId)) {
    return null;
  }

  if (action.status === "edit") {
    return requestKnowledgeNode(
      `/api/v1/knowledge-nodes/${action.target.publicId}`,
      {
        body: JSON.stringify({ name: `${action.target.name}（已更新）` }),
        headers,
        method: "PATCH",
      },
    );
  }

  if (action.status === "move") {
    if (
      action.parentTarget === null ||
      !isSafePublicId(action.parentTarget.publicId)
    ) {
      return null;
    }

    return requestKnowledgeNode(
      `/api/v1/knowledge-nodes/${action.target.publicId}`,
      {
        body: JSON.stringify({
          parentKnowledgeNodePublicId: action.parentTarget.publicId,
          sortOrder:
            Math.max(action.target.sortOrder, action.parentTarget.sortOrder) +
            10,
        }),
        headers,
        method: "PATCH",
      },
    );
  }

  return requestKnowledgeNode(
    `/api/v1/knowledge-nodes/${action.target.publicId}/disable`,
    {
      headers,
      method: "POST",
    },
  );
}

async function requestKnowledgeNode(
  path: string,
  init: RequestInit,
): Promise<AdminKnowledgeNodeOpsSummaryDto | null> {
  const response = await fetch(path, init);
  const payload =
    (await response.json()) as ApiResponse<KnowledgeNodeResultDto | null>;

  if (payload.code !== 0 || payload.data === null) {
    return null;
  }

  return payload.data.knowledgeNode;
}

function isSafePublicId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function KnowledgeNodeActionDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: Exclude<KnowledgeNodeAction, { status: "idle" }>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const actionType =
    action.status === "submitting" ? action.type : action.status;
  const isSubmitting = action.status === "submitting";
  const dialogTitle =
    actionType === "create"
      ? "新增知识点节点"
      : actionType === "edit"
        ? "编辑知识点节点"
        : actionType === "move"
          ? "移动知识点节点"
          : "确认停用知识点节点？";
  const confirmLabel =
    actionType === "create"
      ? "确认新增"
      : actionType === "edit"
        ? "确认更新"
        : actionType === "move"
          ? "确认移动"
          : "确认停用";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          {dialogTitle}
        </h2>
        <p className="text-text-secondary text-sm">
          {actionType === "create"
            ? "将创建一个营销 3级示例节点，用于验证运行时新增边界。"
            : actionType === "move"
              ? "将目标节点移动到当前结果中的另一个 publicId 父节点下，并同步提交排序值。"
              : "操作仅提交 publicId 和允许的 JSON 字段，不提交内部自增 id。"}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={isSubmitting}
            variant={actionType === "disable" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeNodeToast({ message }: { message: ToastMessage }) {
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-surface rounded-md border px-4 py-3 shadow-sm">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function KnowledgeNodeList({
  rows,
}: {
  rows: AdminKnowledgeNodeOpsSummaryDto[];
}) {
  return (
    <div className="grid gap-3">
      {rows.map((knowledgeNode) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={knowledgeNode.publicId}
          data-testid={`knowledge-node-row-${knowledgeNode.publicId}`}
          key={knowledgeNode.publicId}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                  {knStatusLabels[knowledgeNode.knStatus]}
                </span>
                <span className="text-text-muted text-xs">
                  {professionLabels[knowledgeNode.profession]}
                </span>
                <span className="text-text-muted text-xs">
                  等级 {formatLevelList(knowledgeNode.levelList)}
                </span>
              </div>
              <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
                <GitBranch aria-hidden="true" className="size-4" />
                {knowledgeNode.pathName}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <MetricBadge
                  label="绑定题目"
                  value={`${knowledgeNode.questionCount}`}
                />
                <MetricBadge
                  label="排序"
                  value={`${knowledgeNode.sortOrder}`}
                />
                <MetricBadge
                  label="推荐"
                  value={knowledgeNode.isRecommendable ? "可推荐" : "不推荐"}
                />
              </div>
            </div>
            <PublicId value={knowledgeNode.publicId} />
          </div>
          <p className="text-text-muted border-border mt-4 border-t pt-4 text-xs">
            父级 {knowledgeNode.parentKnowledgeNodePublicId ?? "无"} / 更新时间{" "}
            {formatDateTime(knowledgeNode.updatedAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="border-border text-text-secondary rounded-md border px-2 py-1">
      {label} {value}
    </span>
  );
}

function FilteredEmptyState() {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <p className="text-text-primary font-medium">没有匹配的知识点</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function formatLevelList(levelList: number[]) {
  return levelList.length === 0
    ? "通用"
    : levelList.map((level) => `${level}级`).join("、");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
