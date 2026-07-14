"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch, Move, Pencil, Plus, Search, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminToast } from "@/components/admin/AdminToast/AdminToast";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AdminKnowledgeNodeOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { KnStatus } from "@/server/models/ai-rag";
import type { Profession } from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  FilterSelect,
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

type KnowledgeNodeFormValues = {
  levelListText: string;
  name: string;
  parentKnowledgeNodePublicId: string;
  profession: Profession;
  sortOrder: string;
};

type KnowledgeNodeMoveValues = {
  parentKnowledgeNodePublicId: string;
  sortOrder: string;
};

type KnowledgeNodeAction =
  | {
      status: "idle";
    }
  | {
      formValues: KnowledgeNodeFormValues;
      status: "create" | "edit";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
    }
  | {
      status: "disable";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
    }
  | {
      parentTarget: AdminKnowledgeNodeOpsSummaryDto | null;
      status: "move";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
      values: KnowledgeNodeMoveValues;
    }
  | {
      formValues?: KnowledgeNodeFormValues;
      parentTarget?: AdminKnowledgeNodeOpsSummaryDto | null;
      status: "submitting";
      target: AdminKnowledgeNodeOpsSummaryDto | null;
      type: "create" | "edit" | "disable" | "move";
      values?: KnowledgeNodeMoveValues;
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

const durableRecommendationBindingMode = "durable_question_binding";

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
          "/api/v1/knowledge-nodes?page=1&pageSize=100&sortBy=sortOrder&sortOrder=asc",
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

        const loadedKnowledgeNodes = [
          ...knowledgeNodeResponse.data.knowledgeNodes,
        ];
        const total =
          knowledgeNodeResponse.pagination?.total ??
          loadedKnowledgeNodes.length;
        let nextPage = 2;

        while (loadedKnowledgeNodes.length < total) {
          const nextResponse = await fetchAdminApi<KnowledgeNodeListDto>(
            `/api/v1/knowledge-nodes?page=${nextPage}&pageSize=100&sortBy=sortOrder&sortOrder=asc`,
            sessionToken,
          );

          if (
            nextResponse.code !== 0 ||
            nextResponse.data === null ||
            nextResponse.data.knowledgeNodes.length === 0
          ) {
            break;
          }

          loadedKnowledgeNodes.push(...nextResponse.data.knowledgeNodes);
          nextPage += 1;
        }

        setKnowledgeNodes(loadedKnowledgeNodes);
        setLoadState(loadedKnowledgeNodes.length === 0 ? "empty" : "ready");
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
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
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
  const activeKnowledgeNode =
    filteredKnowledgeNodes.find(
      (knowledgeNode) => knowledgeNode.publicId === selectedPublicId,
    ) ?? null;
  const displayedKnowledgeNodes = useMemo(
    () => sortKnowledgeNodesByTreeOrder(filteredKnowledgeNodes),
    [filteredKnowledgeNodes],
  );
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
  const suggestedMoveSortOrder =
    activeKnowledgeNode === null || moveParentCandidate === null
      ? "10"
      : String(
          Math.max(
            activeKnowledgeNode.sortOrder,
            moveParentCandidate.sortOrder,
          ) + 10,
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
      formValues:
        action.status === "create" || action.status === "edit"
          ? action.formValues
          : undefined,
      parentTarget: action.status === "move" ? action.parentTarget : undefined,
      status: "submitting",
      target: action.target,
      type: action.status,
      values: action.status === "move" ? action.values : undefined,
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
        setSelectedPublicId(response.publicId);
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
      setSelectedPublicId(response.publicId);
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
          <p className="text-brand-primary text-sm font-medium">内容后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            知识点树维护
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            按专业维护知识点层级、适用等级、显示顺序与使用状态。先在树中选择节点，再进行编辑、移动或停用。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setToastMessage(null);
              setAction({
                formValues: createDefaultKnowledgeNodeFormValues(),
                status: "create",
                target: null,
              });
            }}
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            新增节点
          </Button>
          <Button
            disabled={activeKnowledgeNode === null}
            variant="outline"
            onClick={() => {
              setToastMessage(null);
              setAction({
                formValues:
                  createDefaultKnowledgeNodeFormValues(activeKnowledgeNode),
                status: "edit",
                target: activeKnowledgeNode,
              });
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
                values: {
                  parentKnowledgeNodePublicId:
                    moveParentCandidate?.publicId ?? "",
                  sortOrder: suggestedMoveSortOrder,
                },
              });
            }}
          >
            <Move aria-hidden="true" data-icon="inline-start" />
            移动节点
          </Button>
          <Button
            disabled={
              activeKnowledgeNode === null ||
              activeKnowledgeNode.knStatus === "disabled"
            }
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

      <KnowledgeNodeLifecycleContextBand knowledgeNodes={knowledgeNodes} />

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
                placeholder="节点名称或完整路径"
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

      <section
        className="grid min-h-[520px] gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.4fr)]"
        aria-label="知识点树工作区"
      >
        <div className="border-border bg-surface rounded-md border p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-text-primary font-semibold">知识点树</h2>
              <p className="text-text-muted mt-1 text-xs">
                共 {displayedKnowledgeNodes.length} 个节点
              </p>
            </div>
          </div>
          {displayedKnowledgeNodes.length > 0 ? (
            <KnowledgeNodeList
              rows={displayedKnowledgeNodes}
              selectedPublicId={selectedPublicId}
              onSelect={setSelectedPublicId}
            />
          ) : (
            <FilteredEmptyState />
          )}
        </div>
        <KnowledgeNodeDetailPanel knowledgeNode={activeKnowledgeNode} />
      </section>

      {action.status === "create" ||
      action.status === "edit" ||
      action.status === "move" ||
      action.status === "disable" ||
      action.status === "submitting" ? (
        <KnowledgeNodeActionDialog
          action={action}
          knowledgeNodes={knowledgeNodes}
          onCancel={() => setAction({ status: "idle" })}
          onConfirm={handleConfirmAction}
          onUpdateFormValues={(formValues) => {
            setAction((currentAction) =>
              currentAction.status === "create" ||
              currentAction.status === "edit"
                ? { ...currentAction, formValues }
                : currentAction,
            );
          }}
          onUpdateMoveValues={(values) => {
            setAction((currentAction) =>
              currentAction.status === "move"
                ? { ...currentAction, values }
                : currentAction,
            );
          }}
        />
      ) : null}

      {toastMessage === null ? null : (
        <AdminToast
          feedback={{
            message: toastMessage.message,
            title:
              toastMessage.tone === "success"
                ? "知识点操作成功"
                : "知识点操作失败",
            tone: toastMessage.tone,
          }}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </section>
  );
}

function KnowledgeNodeLifecycleContextBand({
  knowledgeNodes,
}: {
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
}) {
  const activeCount = knowledgeNodes.filter(
    (knowledgeNode) => knowledgeNode.knStatus === "active",
  ).length;
  const disabledCount = knowledgeNodes.filter(
    (knowledgeNode) => knowledgeNode.knStatus === "disabled",
  ).length;
  const recommendableCount = knowledgeNodes.filter(
    (knowledgeNode) => knowledgeNode.isRecommendable,
  ).length;
  const linkedQuestionCount = knowledgeNodes.reduce(
    (questionCount, knowledgeNode) =>
      questionCount + knowledgeNode.questionCount,
    0,
  );

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="knowledge-node-lifecycle-context-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            知识点生命周期
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            路径、推荐绑定与检索新鲜度
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            路径变更需复核题目绑定和推荐绑定；检索新鲜度由资料状态页承接，本页按知识点名称和完整路径展示。
          </p>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <KnowledgeLifecycleMetric label="可用" value={activeCount} />
          <KnowledgeLifecycleMetric label="已停用" value={disabledCount} />
          <KnowledgeLifecycleMetric
            label="推荐绑定"
            value={recommendableCount}
          />
          <KnowledgeLifecycleMetric
            label="绑定题目"
            value={linkedQuestionCount}
          />
        </dl>
      </div>
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
    const parentKnowledgeNodePublicId = normalizeOptionalPublicId(
      action.formValues.parentKnowledgeNodePublicId,
    );

    if (parentKnowledgeNodePublicId === undefined) {
      return null;
    }

    return requestKnowledgeNode("/api/v1/knowledge-nodes", {
      body: JSON.stringify({
        parentKnowledgeNodePublicId,
        profession: action.formValues.profession,
        levelList: parseLevelList(action.formValues.levelListText),
        name: action.formValues.name.trim(),
        sortOrder: parseSortOrder(action.formValues.sortOrder),
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
        body: JSON.stringify({
          levelList: parseLevelList(action.formValues.levelListText),
          name: action.formValues.name.trim(),
          sortOrder: parseSortOrder(action.formValues.sortOrder),
        }),
        headers,
        method: "PATCH",
      },
    );
  }

  if (action.status === "move") {
    const parentKnowledgeNodePublicId = normalizeOptionalPublicId(
      action.values.parentKnowledgeNodePublicId,
    );

    if (parentKnowledgeNodePublicId === undefined) {
      return null;
    }

    if (
      action.parentTarget !== null &&
      !isSafePublicId(action.parentTarget.publicId)
    ) {
      return null;
    }

    return requestKnowledgeNode(
      `/api/v1/knowledge-nodes/${action.target.publicId}`,
      {
        body: JSON.stringify({
          parentKnowledgeNodePublicId,
          sortOrder: parseSortOrder(action.values.sortOrder),
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

function createDefaultKnowledgeNodeFormValues(
  knowledgeNode?: AdminKnowledgeNodeOpsSummaryDto | null,
): KnowledgeNodeFormValues {
  return {
    levelListText: knowledgeNode?.levelList.join(",") ?? "3",
    name: knowledgeNode?.name ?? "新增知识点",
    parentKnowledgeNodePublicId:
      knowledgeNode?.parentKnowledgeNodePublicId ?? "",
    profession: knowledgeNode?.profession ?? "marketing",
    sortOrder: String(knowledgeNode?.sortOrder ?? 30),
  };
}

function normalizeOptionalPublicId(value: string): string | null | undefined {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  return isSafePublicId(trimmedValue) ? trimmedValue : undefined;
}

function parseLevelList(value: string) {
  return value
    .split(",")
    .map((levelText) => Number.parseInt(levelText.trim(), 10))
    .filter((level) => Number.isInteger(level) && level > 0);
}

function parseSortOrder(value: string) {
  const sortOrder = Number.parseInt(value.trim(), 10);

  return Number.isInteger(sortOrder) ? sortOrder : 0;
}

function sortKnowledgeNodesByTreeOrder(
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[],
) {
  return [...knowledgeNodes].sort((leftNode, rightNode) => {
    const professionOrder = leftNode.profession.localeCompare(
      rightNode.profession,
    );

    if (professionOrder !== 0) {
      return professionOrder;
    }

    const leftParentPath = leftNode.pathName.split("/").slice(0, -1).join("/");
    const rightParentPath = rightNode.pathName
      .split("/")
      .slice(0, -1)
      .join("/");
    const parentOrder = leftParentPath.localeCompare(rightParentPath, "zh-CN");

    if (parentOrder !== 0) {
      return parentOrder;
    }

    return leftNode.sortOrder - rightNode.sortOrder;
  });
}

function KnowledgeNodeActionDialog({
  action,
  knowledgeNodes,
  onCancel,
  onConfirm,
  onUpdateFormValues,
  onUpdateMoveValues,
}: {
  action: Exclude<KnowledgeNodeAction, { status: "idle" }>;
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
  onCancel: () => void;
  onConfirm: () => void;
  onUpdateFormValues: (formValues: KnowledgeNodeFormValues) => void;
  onUpdateMoveValues: (values: KnowledgeNodeMoveValues) => void;
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
  const formValues =
    action.status === "create" || action.status === "edit"
      ? action.formValues
      : action.status === "submitting"
        ? action.formValues
        : undefined;
  const moveValues =
    action.status === "move"
      ? action.values
      : action.status === "submitting"
        ? action.values
        : undefined;
  const parentOptions = knowledgeNodes.filter((knowledgeNode) => {
    if (action.target === null) {
      return true;
    }

    return (
      knowledgeNode.publicId !== action.target.publicId &&
      !knowledgeNode.pathName.startsWith(`${action.target.pathName}/`)
    );
  });

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
            ? "按专业、父级、等级和显示顺序创建知识点节点。"
            : actionType === "move"
              ? "选择新的父级知识点并设置同级显示顺序。"
              : "修改节点名称、适用等级和显示顺序；路径变更仍由服务端校验。"}
        </p>
        {formValues === undefined ? null : (
          <KnowledgeNodeForm
            disabled={isSubmitting}
            parentOptions={parentOptions}
            values={formValues}
            onChange={onUpdateFormValues}
          />
        )}
        {moveValues === undefined ? null : (
          <KnowledgeNodeMoveForm
            disabled={isSubmitting}
            parentOptions={parentOptions}
            values={moveValues}
            onChange={onUpdateMoveValues}
          />
        )}
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

function KnowledgeNodeForm({
  disabled,
  onChange,
  parentOptions,
  values,
}: {
  disabled: boolean;
  onChange: (values: KnowledgeNodeFormValues) => void;
  parentOptions: AdminKnowledgeNodeOpsSummaryDto[];
  values: KnowledgeNodeFormValues;
}) {
  return (
    <div className="grid gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">节点名称</span>
        <Input
          aria-label="节点名称"
          disabled={disabled}
          value={values.name}
          onChange={(event) =>
            onChange({ ...values, name: event.target.value })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">专业</span>
        <select
          aria-label="专业"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          disabled={disabled}
          value={values.profession}
          onChange={(event) =>
            onChange({
              ...values,
              profession: event.target.value as Profession,
            })
          }
        >
          <option value="marketing">营销</option>
          <option value="logistics">物流</option>
          <option value="monopoly">专卖</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">适用等级</span>
        <Input
          aria-label="适用等级"
          disabled={disabled}
          placeholder="例如 2,3"
          value={values.levelListText}
          onChange={(event) =>
            onChange({ ...values, levelListText: event.target.value })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">父级知识点</span>
        <select
          aria-label="父级知识点"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          disabled={disabled}
          value={values.parentKnowledgeNodePublicId}
          onChange={(event) =>
            onChange({
              ...values,
              parentKnowledgeNodePublicId: event.target.value,
            })
          }
        >
          <option value="">作为专业根节点</option>
          {parentOptions
            .filter(
              (knowledgeNode) => knowledgeNode.profession === values.profession,
            )
            .map((knowledgeNode) => (
              <option
                key={knowledgeNode.publicId}
                value={knowledgeNode.publicId}
              >
                {knowledgeNode.pathName}
              </option>
            ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">显示顺序</span>
        <Input
          aria-label="显示顺序"
          disabled={disabled}
          inputMode="numeric"
          value={values.sortOrder}
          onChange={(event) =>
            onChange({ ...values, sortOrder: event.target.value })
          }
        />
      </label>
    </div>
  );
}

function KnowledgeNodeMoveForm({
  disabled,
  onChange,
  parentOptions,
  values,
}: {
  disabled: boolean;
  onChange: (values: KnowledgeNodeMoveValues) => void;
  parentOptions: AdminKnowledgeNodeOpsSummaryDto[];
  values: KnowledgeNodeMoveValues;
}) {
  return (
    <div className="grid gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">新父级知识点</span>
        <select
          aria-label="新父级知识点"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          disabled={disabled}
          value={values.parentKnowledgeNodePublicId}
          onChange={(event) =>
            onChange({
              ...values,
              parentKnowledgeNodePublicId: event.target.value,
            })
          }
        >
          <option value="">移到专业根层级</option>
          {parentOptions.map((knowledgeNode) => (
            <option key={knowledgeNode.publicId} value={knowledgeNode.publicId}>
              {knowledgeNode.pathName}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span className="text-text-secondary">显示顺序</span>
        <Input
          aria-label="显示顺序"
          disabled={disabled}
          inputMode="numeric"
          value={values.sortOrder}
          onChange={(event) =>
            onChange({ ...values, sortOrder: event.target.value })
          }
        />
      </label>
    </div>
  );
}

function KnowledgeLifecycleMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-muted/40 border-border rounded-md border px-3 py-2">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary mt-1 font-semibold">
        {label} {value}
      </dd>
    </div>
  );
}

function KnowledgeNodeList({
  onSelect,
  rows,
  selectedPublicId,
}: {
  onSelect: (publicId: string) => void;
  rows: AdminKnowledgeNodeOpsSummaryDto[];
  selectedPublicId: string | null;
}) {
  const groupedRows = Object.entries(professionLabels)
    .map(([profession, label]) => ({
      label,
      profession: profession as Profession,
      rows: rows.filter(
        (knowledgeNode) => knowledgeNode.profession === profession,
      ),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <div className="grid gap-4">
      {groupedRows.map((group) => (
        <section
          aria-label={`${group.label}知识点树`}
          className="grid gap-3"
          key={group.profession}
          role="tree"
        >
          <h2 className="text-text-primary text-base font-semibold">
            {group.label}知识点树
          </h2>
          <div className="space-y-1">
            {group.rows.map((knowledgeNode) => {
              const depth = getKnowledgeNodeDepth(knowledgeNode);
              const isSelected = knowledgeNode.publicId === selectedPublicId;

              return (
                <button
                  aria-selected={isSelected}
                  className={`border-border hover:bg-muted/40 focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-left focus-visible:ring-2 ${
                    isSelected
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-surface"
                  } ${depth === 1 ? "ml-0" : depth === 2 ? "ml-4 w-[calc(100%-1rem)]" : "ml-8 w-[calc(100%-2rem)]"}`}
                  data-depth={String(getKnowledgeNodeDepth(knowledgeNode))}
                  data-public-id={knowledgeNode.publicId}
                  data-testid={`knowledge-node-row-${knowledgeNode.publicId}`}
                  key={knowledgeNode.publicId}
                  role="treeitem"
                  type="button"
                  onClick={() => onSelect(knowledgeNode.publicId)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <GitBranch
                        aria-hidden="true"
                        className="size-4 shrink-0"
                      />
                      <span className="truncate font-medium">
                        {knowledgeNode.name}
                      </span>
                    </span>
                    <span className="text-text-muted shrink-0 text-xs">
                      {knStatusLabels[knowledgeNode.knStatus]}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 truncate text-xs">
                    {knowledgeNode.pathName}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function KnowledgeNodeDetailPanel({
  knowledgeNode,
}: {
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto | null;
}) {
  if (knowledgeNode === null) {
    return (
      <section className="border-border bg-surface flex min-h-72 items-center justify-center rounded-md border p-8 text-center shadow-sm">
        <div>
          <h2 className="text-text-primary font-semibold">请选择一个知识点</h2>
          <p className="text-text-secondary mt-2 text-sm">
            选择左侧节点后查看完整路径、适用范围和关联摘要。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="border-border bg-surface rounded-md border p-5 shadow-sm"
      aria-label="知识点详情"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">知识点详情</p>
          <h2 className="text-text-primary mt-1 text-lg font-semibold">
            {knowledgeNode.name}
          </h2>
        </div>
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
          {knStatusLabels[knowledgeNode.knStatus]}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailItem label="完整路径" value={knowledgeNode.pathName} />
        <DetailItem
          label="专业"
          value={professionLabels[knowledgeNode.profession]}
        />
        <DetailItem
          label="适用等级"
          value={formatLevelList(knowledgeNode.levelList)}
        />
        <DetailItem label="显示顺序" value={String(knowledgeNode.sortOrder)} />
        <DetailItem
          label="绑定题目"
          value={`${knowledgeNode.questionCount} 题`}
        />
        <DetailItem
          label="推荐状态"
          value={
            knowledgeNode.isRecommendable
              ? "可用于知识点推荐"
              : "当前不参与推荐"
          }
        />
        <DetailItem label="关联资源" value="通过资料管理维护知识点绑定" />
        <DetailItem
          label="最近更新"
          value={formatDateTime(knowledgeNode.updatedAt)}
        />
      </dl>

      {knowledgeNode.isRecommendable ? (
        <a
          aria-label={`查看 ${knowledgeNode.name} 的知识点推荐绑定`}
          className="border-border text-text-secondary hover:bg-muted hover:text-foreground mt-5 inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium"
          href={createRecommendationBindingReviewHref(knowledgeNode.publicId)}
        >
          <GitBranch aria-hidden="true" className="size-4" />
          复核推荐绑定
        </a>
      ) : null}
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-md border p-3">
      <dt className="text-text-muted text-xs">{label}</dt>
      <dd className="text-text-primary mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function createRecommendationBindingReviewHref(knowledgeNodePublicId: string) {
  const searchParams = new URLSearchParams({
    knowledgeNodePublicId,
    recommendationMode: durableRecommendationBindingMode,
  });

  return `/content/questions?${searchParams.toString()}`;
}

function getKnowledgeNodeDepth(knowledgeNode: AdminKnowledgeNodeOpsSummaryDto) {
  return Math.max(knowledgeNode.pathName.split("/").length - 1, 1);
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
