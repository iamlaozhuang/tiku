"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DatabaseZap,
  Download,
  FileText,
  Search,
  Upload,
  XCircle,
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

type LocalResourceUploadSummaryDto = {
  parserMode: "local_only";
  markdownContentHash: string | null;
  charLength: number;
  lineCount: number;
  chunkCandidateCount: number;
  headingPaths: string[][];
  redactedPreview: string | null;
  skippedReason: string | null;
};

type LocalResourceDetailDto = {
  resource: AdminResourceOpsSummaryDto;
  localOnly: boolean;
  markdownContent: string | null;
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

type MarkdownReviewState =
  | {
      status: "idle";
    }
  | {
      markdownContent: string;
      resource: AdminResourceOpsSummaryDto;
      status: "editing" | "submitting";
    };

type DisableState =
  | {
      status: "idle";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "confirming" | "submitting";
    };

type UploadState = {
  file: File | null;
  level: string;
  profession: Profession;
  resourceType: ResourceType;
  status: "idle" | "submitting";
  title: string;
};

type ToastMessage = {
  message: string;
  tone: "success" | "error";
};

type MarkdownHeadingReviewItem = {
  level: number;
  lineIndex: number;
  lineNumber: number;
  path: string[];
  title: string;
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

function collectMarkdownHeadingReviewItems(
  markdownContent: string,
): MarkdownHeadingReviewItem[] {
  const headingCursor: Array<{ level: number; title: string }> = [];

  return markdownContent.split("\n").flatMap((line, lineIndex) => {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (headingMatch === null) {
      return [];
    }

    const level = headingMatch[1].length;
    const title = headingMatch[2].replace(/#+$/u, "").trim();

    while (
      headingCursor.length > 0 &&
      headingCursor[headingCursor.length - 1].level >= level
    ) {
      headingCursor.pop();
    }

    headingCursor.push({ level, title });

    return [
      {
        level,
        lineIndex,
        lineNumber: lineIndex + 1,
        path: headingCursor.map((heading) => heading.title),
        title,
      },
    ];
  });
}

function updateMarkdownHeadingLevel(
  markdownContent: string,
  lineIndex: number,
  nextLevel: number,
) {
  const lines = markdownContent.split("\n");
  const targetLine = lines[lineIndex];

  if (targetLine === undefined || !/^(#{1,6})\s+/.test(targetLine)) {
    return markdownContent;
  }

  return lines
    .map((line, currentLineIndex) =>
      currentLineIndex === lineIndex
        ? line.replace(/^#{1,6}\s+/u, `${"#".repeat(nextLevel)} `)
        : line,
    )
    .join("\n");
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

async function postLocalResourceUpload(
  uploadState: UploadState,
  sessionToken: string,
): Promise<{
  localResource: LocalResourceUploadSummaryDto;
  resource: AdminResourceOpsSummaryDto;
} | null> {
  if (uploadState.file === null) {
    return null;
  }

  const formData = new FormData();

  formData.set("title", uploadState.title);
  formData.set("profession", uploadState.profession);
  formData.set("level", uploadState.level);
  formData.set("resourceType", uploadState.resourceType);
  formData.set("fileName", uploadState.file.name);
  formData.set("file", uploadState.file);

  const response = await fetch("/api/v1/resources", {
    body: formData,
    headers: createAdminAuthHeaders(sessionToken),
    method: "POST",
  });
  const payload = (await response.json()) as ApiResponse<{
    localResource: LocalResourceUploadSummaryDto;
    resource: AdminResourceOpsSummaryDto;
  } | null>;

  return payload.code === 0 && payload.data !== null ? payload.data : null;
}

async function getLocalResourceDetail(
  resourcePublicId: string,
  sessionToken: string,
): Promise<LocalResourceDetailDto | null> {
  const response = await fetch(`/api/v1/resources/${resourcePublicId}`, {
    headers: createAdminAuthHeaders(sessionToken),
  });
  const payload =
    (await response.json()) as ApiResponse<LocalResourceDetailDto | null>;

  return payload.code === 0 && payload.data !== null ? payload.data : null;
}

async function patchLocalResourceMarkdown(
  resourcePublicId: string,
  markdownContent: string,
  sessionToken: string,
): Promise<AdminResourceOpsSummaryDto | null> {
  const response = await fetch(`/api/v1/resources/${resourcePublicId}`, {
    body: JSON.stringify({ markdownContent }),
    headers: {
      ...createAdminAuthHeaders(sessionToken),
      "content-type": "application/json",
    },
    method: "PATCH",
  });
  const payload = (await response.json()) as ApiResponse<{
    resource: AdminResourceOpsSummaryDto;
  } | null>;

  return payload.code === 0 && payload.data !== null
    ? payload.data.resource
    : null;
}

async function postLocalResourceDisable(
  resourcePublicId: string,
  sessionToken: string,
): Promise<AdminResourceOpsSummaryDto | null> {
  const response = await fetch(
    `/api/v1/resources/${resourcePublicId}/disable`,
    {
      headers: createAdminAuthHeaders(sessionToken),
      method: "POST",
    },
  );
  const payload = (await response.json()) as ApiResponse<{
    resource: AdminResourceOpsSummaryDto;
  } | null>;

  return payload.code === 0 && payload.data !== null
    ? payload.data.resource
    : null;
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
  const [disableState, setDisableState] = useState<DisableState>({
    status: "idle",
  });
  const [markdownReviewState, setMarkdownReviewState] =
    useState<MarkdownReviewState>({
      status: "idle",
    });
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    level: "3",
    profession: "marketing",
    resourceType: "knowledge_doc",
    status: "idle",
    title: "本地资源验证资料",
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

  async function handleUploadResource() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || uploadState.file === null) {
      setToastMessage({
        message: "请选择本地资源文件",
        tone: "error",
      });
      return;
    }

    setUploadState((currentState) => ({
      ...currentState,
      status: "submitting",
    }));

    try {
      const uploadResult = await postLocalResourceUpload(
        uploadState,
        sessionToken,
      );

      if (uploadResult === null) {
        setToastMessage({
          message: "资源上传失败，请确认格式和大小",
          tone: "error",
        });
        return;
      }

      setResources((currentResources) => [
        uploadResult.resource,
        ...currentResources.filter(
          (resource) => resource.publicId !== uploadResult.resource.publicId,
        ),
      ]);
      setToastMessage({
        message:
          uploadResult.localResource.skippedReason === null
            ? "资源上传完成，已生成 Markdown 草稿"
            : "资源上传完成，但本地解析失败",
        tone:
          uploadResult.localResource.skippedReason === null
            ? "success"
            : "error",
      });
    } catch {
      setToastMessage({
        message: "资源上传失败，请稍后重试",
        tone: "error",
      });
    } finally {
      setUploadState((currentState) => ({
        ...currentState,
        status: "idle",
      }));
    }
  }

  async function handleOpenMarkdownReview(
    resource: AdminResourceOpsSummaryDto,
  ) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || !isSafePublicId(resource.publicId)) {
      setToastMessage({
        message: "资源 publicId 异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    const resourceDetail = await getLocalResourceDetail(
      resource.publicId,
      sessionToken,
    );

    if (resourceDetail === null || resourceDetail.markdownContent === null) {
      setToastMessage({
        message: "Markdown 草稿不可用",
        tone: "error",
      });
      return;
    }

    setMarkdownReviewState({
      markdownContent: resourceDetail.markdownContent,
      resource: resourceDetail.resource,
      status: "editing",
    });
  }

  async function handleSaveMarkdownReview() {
    if (markdownReviewState.status !== "editing") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !isSafePublicId(markdownReviewState.resource.publicId)
    ) {
      setMarkdownReviewState({ status: "idle" });
      setToastMessage({
        message: "资源 publicId 异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    setMarkdownReviewState({
      ...markdownReviewState,
      status: "submitting",
    });

    try {
      const savedResource = await patchLocalResourceMarkdown(
        markdownReviewState.resource.publicId,
        markdownReviewState.markdownContent,
        sessionToken,
      );

      if (savedResource === null) {
        setToastMessage({
          message: "Markdown 草稿保存失败",
          tone: "error",
        });
        return;
      }

      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.publicId === savedResource.publicId
            ? savedResource
            : resource,
        ),
      );
      setToastMessage({
        message: "Markdown 草稿已保存",
        tone: "success",
      });
      setMarkdownReviewState({ status: "idle" });
    } catch {
      setToastMessage({
        message: "Markdown 草稿保存失败",
        tone: "error",
      });
    }
  }

  async function handleConfirmDisable() {
    if (disableState.status !== "confirming") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !isSafePublicId(disableState.resource.publicId)
    ) {
      setDisableState({ status: "idle" });
      setToastMessage({
        message: "资源 publicId 异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    setDisableState({ resource: disableState.resource, status: "submitting" });

    try {
      const disabledResource = await postLocalResourceDisable(
        disableState.resource.publicId,
        sessionToken,
      );

      if (disabledResource === null) {
        setToastMessage({
          message: "资源停用失败",
          tone: "error",
        });
        return;
      }

      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.publicId === disabledResource.publicId
            ? disabledResource
            : resource,
        ),
      );
      setToastMessage({
        message: "资源已停用",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "资源停用失败",
        tone: "error",
      });
    } finally {
      setDisableState({ status: "idle" });
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
        <ResourceUploadPanel
          uploadState={uploadState}
          onChange={setUploadState}
          onSubmit={handleUploadResource}
        />
        <AdminEmptyState
          description="当前运行时未返回资源数据。可先上传受控本地 Markdown/txt 文件建立草稿。"
          title="暂无资源与知识库数据"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <ResourcePageHeader />

      <ResourceUploadPanel
        uploadState={uploadState}
        onChange={setUploadState}
        onSubmit={handleUploadResource}
      />

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
          onRequestDisable={(resource) => {
            setToastMessage(null);
            setDisableState({ resource, status: "confirming" });
          }}
          onRequestMarkdownReview={(resource) => {
            setToastMessage(null);
            void handleOpenMarkdownReview(resource);
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

      {disableState.status === "confirming" ||
      disableState.status === "submitting" ? (
        <DisableConfirmationDialog
          isSubmitting={disableState.status === "submitting"}
          resource={disableState.resource}
          onCancel={() => setDisableState({ status: "idle" })}
          onConfirm={handleConfirmDisable}
        />
      ) : null}

      {markdownReviewState.status === "editing" ||
      markdownReviewState.status === "submitting" ? (
        <MarkdownReviewDialog
          isSubmitting={markdownReviewState.status === "submitting"}
          markdownContent={markdownReviewState.markdownContent}
          resource={markdownReviewState.resource}
          onCancel={() => setMarkdownReviewState({ status: "idle" })}
          onChange={(markdownContent) =>
            setMarkdownReviewState((currentState) =>
              currentState.status === "idle"
                ? currentState
                : { ...currentState, markdownContent },
            )
          }
          onConfirm={handleSaveMarkdownReview}
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
          云端上传待资源审批
        </Button>
        <Button disabled variant="outline">
          <FileText aria-hidden="true" data-icon="inline-start" />
          批量校对待规划
        </Button>
        <Button disabled variant="outline">
          <Download aria-hidden="true" data-icon="inline-start" />
          云端下载待资源审批
        </Button>
      </div>
    </header>
  );
}

function ResourceUploadPanel({
  onChange,
  onSubmit,
  uploadState,
}: {
  onChange: (nextState: UploadState) => void;
  onSubmit: () => void;
  uploadState: UploadState;
}) {
  return (
    <section className="border-border bg-surface rounded-md border p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px_auto] lg:items-end">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">本地资源标题</span>
          <Input
            aria-label="本地资源标题"
            value={uploadState.title}
            onChange={(event) =>
              onChange({ ...uploadState, title: event.target.value })
            }
          />
        </label>
        <FilterSelect
          label="专业"
          options={[
            ["marketing", "营销"],
            ["logistics", "物流"],
            ["monopoly", "专卖"],
          ]}
          value={uploadState.profession}
          onChange={(value) =>
            onChange({ ...uploadState, profession: value as Profession })
          }
        />
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">等级</span>
          <Input
            aria-label="等级"
            inputMode="numeric"
            value={uploadState.level}
            onChange={(event) =>
              onChange({ ...uploadState, level: event.target.value })
            }
          />
        </label>
        <FilterSelect
          label="资料类型"
          options={[
            ["textbook", "教材"],
            ["courseware", "课件"],
            ["knowledge_doc", "知识点文档"],
            ["lecture_note", "讲义"],
            ["other", "其他"],
          ]}
          value={uploadState.resourceType}
          onChange={(value) =>
            onChange({ ...uploadState, resourceType: value as ResourceType })
          }
        />
        <div className="flex flex-col gap-2">
          <label className="text-text-secondary text-sm font-medium">
            本地文件
            <input
              aria-label="本地资源文件"
              className="mt-2 block w-full text-sm"
              type="file"
              onChange={(event) =>
                onChange({
                  ...uploadState,
                  file: event.target.files?.[0] ?? null,
                })
              }
            />
          </label>
          <Button
            disabled={uploadState.status === "submitting"}
            onClick={onSubmit}
          >
            <Upload aria-hidden="true" data-icon="inline-start" />
            {uploadState.status === "submitting" ? "上传中" : "上传本地资源"}
          </Button>
        </div>
      </div>
      <p className="text-text-muted mt-3 text-xs">
        本地模式仅写入 ignored `.runtime/`，支持 Markdown/txt
        转草稿；DOCX/PPTX/PDF 云端转换仍需后续资源审批。
      </p>
    </section>
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
  onRequestDisable,
  onRequestMarkdownReview,
  onRequestPublish,
  onRequestRebuild,
  rows,
}: {
  onRequestDisable: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestMarkdownReview: (resource: AdminResourceOpsSummaryDto) => void;
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
                disabled={
                  !isSafePublicId(resource.publicId) ||
                  !resource.markdownPreviewAvailable
                }
                variant="outline"
                onClick={() => onRequestMarkdownReview(resource)}
              >
                <FileText aria-hidden="true" data-icon="inline-start" />
                Markdown 校对
              </Button>
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
              {resource.resourceStatus === "disabled" ? null : (
                <Button
                  disabled={!isSafePublicId(resource.publicId)}
                  variant="destructive"
                  onClick={() => onRequestDisable(resource)}
                >
                  <XCircle aria-hidden="true" data-icon="inline-start" />
                  停用资源
                </Button>
              )}
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

function DisableConfirmationDialog({
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
          确认停用{resource.title}？
        </h2>
        <p className="text-text-secondary text-sm">
          停用后该资源不参与新的本地 RAG 检索。
        </p>
        <div className="flex gap-2">
          <Button
            disabled={isSubmitting}
            variant="destructive"
            onClick={onConfirm}
          >
            确认停用
          </Button>
          <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarkdownReviewDialog({
  isSubmitting,
  markdownContent,
  onCancel,
  onChange,
  onConfirm,
  resource,
}: {
  isSubmitting: boolean;
  markdownContent: string;
  onCancel: () => void;
  onChange: (markdownContent: string) => void;
  onConfirm: () => void;
  resource: AdminResourceOpsSummaryDto;
}) {
  const headingReviewItems = useMemo(
    () => collectMarkdownHeadingReviewItems(markdownContent),
    [markdownContent],
  );

  function handleChangeHeadingLevel(
    headingItem: MarkdownHeadingReviewItem,
    nextLevel: number,
  ) {
    if (nextLevel < 1 || nextLevel > 6) {
      return;
    }

    onChange(
      updateMarkdownHeadingLevel(
        markdownContent,
        headingItem.lineIndex,
        nextLevel,
      ),
    );
  }

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-12 left-1/2 z-50 flex max-h-[80vh] w-[min(960px,calc(100vw-32px))] -translate-x-1/2 flex-col rounded-md border p-4 shadow-lg"
      role="dialog"
    >
      <div className="min-h-0 space-y-3 overflow-y-auto">
        <h2 className="text-text-primary text-base font-semibold">
          校对{resource.title}的 Markdown
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">Markdown 草稿</span>
            <textarea
              aria-label="Markdown 草稿"
              className="border-border bg-surface text-text-primary min-h-80 resize-y rounded-md border p-3 font-mono text-sm"
              value={markdownContent}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
          <section
            aria-label="章节层级校对"
            className="border-border bg-muted/30 rounded-md border p-3"
          >
            <div className="space-y-1">
              <h3 className="text-text-primary text-sm font-semibold">
                章节层级校对
              </h3>
              <p className="text-text-muted text-xs">
                调整标题级别会同步改写 Markdown 标题符号。
              </p>
            </div>
            {headingReviewItems.length === 0 ? (
              <p className="text-text-secondary mt-4 text-sm">
                当前草稿没有可识别的 Markdown 标题。
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {headingReviewItems.map((headingItem) => (
                  <div
                    className="border-border bg-surface rounded-md border p-3"
                    key={`${headingItem.lineNumber}-${headingItem.title}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-text-muted text-xs">
                          第 {headingItem.lineNumber} 行 / {headingItem.level}级
                        </p>
                        <p className="text-text-primary truncate text-sm font-medium">
                          {headingItem.path.join(" > ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          aria-label={`提升 ${headingItem.title} 的章节层级`}
                          disabled={isSubmitting || headingItem.level === 1}
                          size="icon-sm"
                          title="提升章节层级"
                          variant="outline"
                          onClick={() =>
                            handleChangeHeadingLevel(
                              headingItem,
                              headingItem.level - 1,
                            )
                          }
                        >
                          <ChevronUp aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`降低 ${headingItem.title} 的章节层级`}
                          disabled={isSubmitting || headingItem.level === 6}
                          size="icon-sm"
                          title="降低章节层级"
                          variant="outline"
                          onClick={() =>
                            handleChangeHeadingLevel(
                              headingItem,
                              headingItem.level + 1,
                            )
                          }
                        >
                          <ChevronDown aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="flex gap-2">
          <Button disabled={isSubmitting} onClick={onConfirm}>
            保存草稿
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
