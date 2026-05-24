"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  DatabaseZap,
  Download,
  FileText,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResourceVectorRebuildResultDto } from "@/server/contracts/ai-rag-contract";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AdminResourceOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { ResourceStatus, ResourceType } from "@/server/models/ai-rag";
import type { Profession } from "@/server/models/paper";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
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

type ResourceLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";
type ResourceStatusFilter = "all" | ResourceStatus;
type ResourceTypeFilter = "all" | ResourceType;
type ProfessionFilter = "all" | Profession;

type ResourceListDto = {
  resources: AdminResourceOpsSummaryDto[];
};

type RebuildState =
  | {
      status: "idle";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "confirming";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "submitting";
    };

type PublishState =
  | {
      status: "idle";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "confirming";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "submitting";
    };

type ToastMessage = {
  message: string;
  tone: "success" | "error";
};

const resourceStatusLabels: Record<ResourceStatus, string> = {
  conversion_failed: "转换失败",
  converting: "转换中",
  disabled: "已停用",
  draft: "草稿待校对",
  index_failed: "向量构建失败",
  indexing: "向量构建中",
  published: "已发布，待建向量",
  rag_ready: "RAG 可用",
  uploaded: "已上传",
};

const resourceTypeLabels: Record<ResourceType, string> = {
  courseware: "课件",
  knowledge_doc: "知识点文档",
  lecture_note: "讲义",
  other: "其他",
  textbook: "教材",
};

function isSafePublicId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function createTestId(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-");
}

function formatLevel(value: number | null) {
  return value === null ? "通用" : `${value}级`;
}

function formatResourceScope(resource: AdminResourceOpsSummaryDto) {
  return `${professionLabels[resource.profession]} ${formatLevel(resource.level)}`;
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

async function postResourceVectorRebuild(
  resourcePublicId: string,
  sessionToken: string,
): Promise<ResourceVectorRebuildResultDto | null> {
  const response = await fetch(
    `/api/v1/resources/${resourcePublicId}/rebuild-vector`,
    {
      headers: createAdminAuthHeaders(sessionToken),
      method: "POST",
    },
  );
  const payload =
    (await response.json()) as ApiResponse<ResourceVectorRebuildResultDto | null>;

  if (payload.code !== 0 || payload.data === null) {
    return null;
  }

  return payload.data;
}

async function postResourceMarkdownPublish(
  resourcePublicId: string,
  sessionToken: string,
): Promise<AdminResourceOpsSummaryDto | null> {
  const response = await fetch(
    `/api/v1/resources/${resourcePublicId}/publish`,
    {
      headers: createAdminAuthHeaders(sessionToken),
      method: "POST",
    },
  );
  const payload = (await response.json()) as ApiResponse<{
    resource: AdminResourceOpsSummaryDto;
  } | null>;

  if (payload.code !== 0 || payload.data === null) {
    return null;
  }

  return payload.data.resource;
}

function useResourceData() {
  const [loadState, setLoadState] = useState<ResourceLoadState>("loading");
  const [resources, setResources] = useState<AdminResourceOpsSummaryDto[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadResources() {
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

        const resourceResponse = await fetchAdminApi<ResourceListDto>(
          `/api/v1/resources?${DEFAULT_CONTENT_LIST_QUERY}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (resourceResponse.code !== 0 || resourceResponse.data === null) {
          setLoadState("error");
          return;
        }

        setResources(resourceResponse.data.resources);
        setLoadState(
          resourceResponse.data.resources.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadResources();

    return () => {
      isActive = false;
    };
  }, []);

  return { loadState, resources, setResources };
}

export function AdminResourceKnowledgeManagement() {
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [status, setStatus] = useState<ResourceStatusFilter>("all");
  const [resourceType, setResourceType] = useState<ResourceTypeFilter>("all");
  const [rebuildState, setRebuildState] = useState<RebuildState>({
    status: "idle",
  });
  const [publishState, setPublishState] = useState<PublishState>({
    status: "idle",
  });
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const { loadState, resources, setResources } = useResourceData();
  const filteredResources = useMemo(
    () =>
      resources.filter((resource) => {
        const searchableText = [
          resource.publicId,
          resource.title,
          resource.originalFileName,
          resource.resourceStatus,
          resource.resourceType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(resource.profession, profession) &&
          matchesFilter(resource.resourceStatus, status) &&
          matchesFilter(resource.resourceType, resourceType)
        );
      }),
    [keyword, profession, resourceType, resources, status],
  );

  async function handleConfirmRebuild() {
    if (rebuildState.status !== "confirming") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !isSafePublicId(rebuildState.resource.publicId)
    ) {
      setRebuildState({ status: "idle" });
      setToastMessage({
        message: "资源 publicId 异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    setRebuildState({ resource: rebuildState.resource, status: "submitting" });

    try {
      const rebuildResult = await postResourceVectorRebuild(
        rebuildState.resource.publicId,
        sessionToken,
      );

      if (rebuildResult === null) {
        setToastMessage({
          message: "向量重建失败，请刷新后重试",
          tone: "error",
        });
        return;
      }

      setToastMessage({
        message: `向量重建完成：${rebuildResult.resourceVector.chunkCount} 个片段`,
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "向量重建失败，请刷新后重试",
        tone: "error",
      });
    } finally {
      setRebuildState({ status: "idle" });
    }
  }

  async function handleConfirmPublish() {
    if (publishState.status !== "confirming") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !isSafePublicId(publishState.resource.publicId)
    ) {
      setPublishState({ status: "idle" });
      setToastMessage({
        message: "资源 publicId 异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    setPublishState({ resource: publishState.resource, status: "submitting" });

    try {
      const publishedResource = await postResourceMarkdownPublish(
        publishState.resource.publicId,
        sessionToken,
      );

      if (publishedResource === null) {
        setToastMessage({
          message: "资源发布失败，请刷新后重试",
          tone: "error",
        });
        return;
      }

      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.publicId === publishedResource.publicId
            ? publishedResource
            : resource,
        ),
      );
      setToastMessage({
        message: "资源发布完成，向量待重建",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "资源发布失败，请刷新后重试",
        tone: "error",
      });
    } finally {
      setPublishState({ status: "idle" });
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载资源与知识库" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看资源与知识库。"
        title="资源与知识库加载失败"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <section className="space-y-6">
        <ResourcePageHeader />
        <AdminEmptyState
          description="当前运行时未返回资源数据。上传、下载、Markdown 校对与资源停用接口不在本任务允许改动范围内。"
          title="暂无资源与知识库数据"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <ResourcePageHeader />

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
                placeholder="资源名称、文件名或 publicId"
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
              ["uploaded", "已上传"],
              ["draft", "草稿待校对"],
              ["published", "已发布"],
              ["indexing", "构建中"],
              ["rag_ready", "RAG 可用"],
              ["index_failed", "构建失败"],
              ["disabled", "已停用"],
            ]}
            value={status}
            onChange={(value) => setStatus(value as ResourceStatusFilter)}
          />
          <FilterSelect
            label="资料类型"
            options={[
              ["all", "全部类型"],
              ["textbook", "教材"],
              ["courseware", "课件"],
              ["knowledge_doc", "知识点文档"],
              ["lecture_note", "讲义"],
              ["other", "其他"],
            ]}
            value={resourceType}
            onChange={(value) => setResourceType(value as ResourceTypeFilter)}
          />
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3" aria-label="资源摘要">
        <SummaryItem
          label="当前结果"
          value={`${filteredResources.length} 个`}
        />
        <SummaryItem
          label="RAG 可用"
          value={`${
            filteredResources.filter(
              (resource) => resource.resourceStatus === "rag_ready",
            ).length
          } 个`}
        />
        <SummaryItem
          label="待重建"
          value={`${
            filteredResources.filter((resource) => resource.isVectorStale)
              .length
          } 个`}
        />
      </section>

      {filteredResources.length > 0 ? (
        <ResourceList
          rows={filteredResources}
          onRequestPublish={(resource) => {
            setToastMessage(null);
            setPublishState({ resource, status: "confirming" });
          }}
          onRequestRebuild={(resource) => {
            setToastMessage(null);
            setRebuildState({ resource, status: "confirming" });
          }}
        />
      ) : (
        <FilteredEmptyState />
      )}

      {rebuildState.status === "confirming" ||
      rebuildState.status === "submitting" ? (
        <RebuildConfirmationDialog
          isSubmitting={rebuildState.status === "submitting"}
          resource={rebuildState.resource}
          onCancel={() => setRebuildState({ status: "idle" })}
          onConfirm={handleConfirmRebuild}
        />
      ) : null}

      {publishState.status === "confirming" ||
      publishState.status === "submitting" ? (
        <PublishConfirmationDialog
          isSubmitting={publishState.status === "submitting"}
          resource={publishState.resource}
          onCancel={() => setPublishState({ status: "idle" })}
          onConfirm={handleConfirmPublish}
        />
      ) : null}

      {toastMessage === null ? null : (
        <AdminResourceToast message={toastMessage} />
      )}
    </section>
  );
}

function ResourcePageHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <p className="text-brand-primary text-sm font-medium">Ops Admin</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          资源与知识库管理
        </h1>
        <p className="text-text-secondary max-w-3xl text-sm">
          查看 RAG 资源状态、Markdown
          可预览边界和向量构建状态；手动重建向量时仅使用
          publicId，不暴露内部自增 id、对象存储路径或 chunk 原文。
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled variant="outline">
          <Upload aria-hidden="true" data-icon="inline-start" />
          上传资源
        </Button>
        <Button disabled variant="outline">
          <FileText aria-hidden="true" data-icon="inline-start" />
          Markdown 校对
        </Button>
        <Button disabled variant="outline">
          <Download aria-hidden="true" data-icon="inline-start" />
          原始文件下载
        </Button>
      </div>
    </header>
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

function ResourceList({
  onRequestPublish,
  onRequestRebuild,
  rows,
}: {
  onRequestPublish: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestRebuild: (resource: AdminResourceOpsSummaryDto) => void;
  rows: AdminResourceOpsSummaryDto[];
}) {
  return (
    <div className="grid gap-3">
      {rows.map((resource) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={resource.publicId}
          data-testid={`resource-row-${createTestId(resource.publicId)}`}
          key={resource.publicId}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                  {resourceStatusLabels[resource.resourceStatus]}
                </span>
                <span className="text-text-muted text-xs">
                  {formatResourceScope(resource)}
                </span>
                <span className="text-text-muted text-xs">
                  {resourceTypeLabels[resource.resourceType]}
                </span>
              </div>
              <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
                <DatabaseZap aria-hidden="true" className="size-4" />
                {resource.title}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <MetricBadge
                  label="Markdown"
                  value={
                    resource.markdownPreviewAvailable ? "可预览" : "不可预览"
                  }
                />
                <MetricBadge
                  label="原始文件"
                  value={resource.downloadAvailable ? "可申请下载" : "不可下载"}
                />
                <MetricBadge
                  label="向量"
                  value={resource.isVectorStale ? "待重建" : "已同步"}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 xl:items-end">
              <PublicId value={resource.publicId} />
              {resource.resourceStatus === "draft" ||
              resource.resourceStatus === "rag_ready" ? (
                <Button
                  disabled={
                    !isSafePublicId(resource.publicId) ||
                    !resource.markdownPreviewAvailable
                  }
                  variant="outline"
                  onClick={() => onRequestPublish(resource)}
                >
                  <FileText aria-hidden="true" data-icon="inline-start" />
                  发布 Markdown
                </Button>
              ) : null}
              <Button
                disabled={!isSafePublicId(resource.publicId)}
                variant={
                  resource.resourceStatus === "published" ||
                  resource.isVectorStale
                    ? "destructive"
                    : "outline"
                }
                onClick={() => onRequestRebuild(resource)}
              >
                {isSafePublicId(resource.publicId) ? (
                  <>
                    <DatabaseZap aria-hidden="true" data-icon="inline-start" />
                    重建向量
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      aria-hidden="true"
                      data-icon="inline-start"
                    />
                    publicId 异常
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-text-muted border-border mt-4 border-t pt-4 text-xs">
            文件 {resource.originalFileName ?? "未记录"} / 上传时间{" "}
            {formatDateTime(resource.uploadedAt)}
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
      <p className="text-text-primary font-medium">没有匹配的资源</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function PublishConfirmationDialog({
  isSubmitting,
  onCancel,
  onConfirm,
  resource,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  resource: AdminResourceOpsSummaryDto;
}) {
  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认发布{resource.title}的 Markdown？
        </h2>
        <p className="text-text-secondary text-sm">
          发布后资源进入待建向量状态，RAG 仅在重建完成后使用新内容。
        </p>
        <div className="flex gap-2">
          <Button
            disabled={isSubmitting}
            variant="destructive"
            onClick={onConfirm}
          >
            确认发布
          </Button>
          <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function RebuildConfirmationDialog({
  isSubmitting,
  onCancel,
  onConfirm,
  resource,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  resource: AdminResourceOpsSummaryDto;
}) {
  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认重建{resource.title}的向量？
        </h2>
        <p className="text-text-secondary text-sm">
          重建仅提交资源 publicId，结果只展示安全摘要，不展示 chunk 原文。
        </p>
        <div className="flex gap-2">
          <Button
            disabled={isSubmitting}
            variant="destructive"
            onClick={onConfirm}
          >
            确认重建
          </Button>
          <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminResourceToast({ message }: { message: ToastMessage }) {
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
