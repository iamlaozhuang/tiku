"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DatabaseZap,
  FileText,
  Search,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResourceVectorRebuildResultDto } from "@/server/contracts/ai-rag-contract";
import type { ApiResponse } from "@/server/contracts/api-response";
import {
  ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS,
  type AdminResourceOpsSummaryDto,
} from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { ResourceStatus, ResourceType } from "@/server/models/ai-rag";
import type { Profession } from "@/server/models/paper";

import {
  AdminEmptyState,
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

type ResourceLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";
type ResourceStatusFilter = "all" | ResourceStatus;
type ResourceTypeFilter = "all" | ResourceType;
type ProfessionFilter = "all" | Profession;
type LevelFilter = "all" | "general" | "1" | "2" | "3" | "4" | "5";
type ResourceSortField = "uploadedAt" | "updatedAt" | "publishedAt";
type ResourceSortOrder = "asc" | "desc";

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

type EnableState =
  | {
      status: "idle";
    }
  | {
      resource: AdminResourceOpsSummaryDto;
      status: "confirming" | "submitting";
    };

type UploadState = {
  file: File | null;
  knowledgeNodePublicIdsText: string;
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
  conversion_failed: "文件解析失败",
  converting: "文件解析中",
  disabled: "已停用",
  draft: "解析草稿待校对",
  index_failed: "检索索引重建失败",
  indexing: "检索索引重建中",
  published: "已发布，待重建检索索引",
  rag_ready: "检索可用",
  uploaded: "已上传待解析",
};

const resourceTypeLabels: Record<ResourceType, string> = {
  courseware: "课件",
  knowledge_doc: "知识点文档",
  lecture_note: "讲义",
  other: "其他",
  textbook: "教材",
};

const RESOURCE_LIST_FETCH_QUERY =
  "page=1&pageSize=100&sortBy=updatedAt&sortOrder=desc";

const resourceSortFieldLabels: Record<ResourceSortField, string> = {
  publishedAt: "发布时间",
  updatedAt: "更新时间",
  uploadedAt: "上传时间",
};

const levelFilterOptions: [LevelFilter, string][] = [
  ["all", "全部等级"],
  ["general", "专业通用资料"],
  ["1", "1级"],
  ["2", "2级"],
  ["3", "3级"],
  ["4", "4级"],
  ["5", "5级"],
];

type ResourceListQueryState = {
  keyword: string;
  level: LevelFilter;
  page: number;
  pageSize: (typeof ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS)[number];
  profession: ProfessionFilter;
  resourceType: ResourceTypeFilter;
  sortBy: ResourceSortField;
  sortOrder: ResourceSortOrder;
  status: ResourceStatusFilter;
};

const defaultResourceListQueryState: ResourceListQueryState = {
  keyword: "",
  level: "all",
  page: 1,
  pageSize: 20,
  profession: "all",
  resourceType: "all",
  sortBy: "updatedAt",
  sortOrder: "desc",
  status: "all",
};

function parsePositivePage(value: string | null) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parsePageSize(
  value: string | null,
): ResourceListQueryState["pageSize"] {
  const pageSize = Number(value);

  return ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS.includes(
    pageSize as ResourceListQueryState["pageSize"],
  )
    ? (pageSize as ResourceListQueryState["pageSize"])
    : 20;
}

function parseResourceSortField(value: string | null): ResourceSortField {
  return value === "uploadedAt" || value === "publishedAt"
    ? value
    : "updatedAt";
}

function parseResourceSortOrder(value: string | null): ResourceSortOrder {
  return value === "asc" ? "asc" : "desc";
}

function parseResourceLevelFilter(value: string | null): LevelFilter {
  return levelFilterOptions.some(([optionValue]) => optionValue === value)
    ? (value as LevelFilter)
    : "all";
}

function parseResourceProfessionFilter(value: string | null): ProfessionFilter {
  return value === "marketing" || value === "logistics" || value === "monopoly"
    ? value
    : "all";
}

function parseResourceStatusFilter(value: string | null): ResourceStatusFilter {
  return value !== null && value in resourceStatusLabels
    ? (value as ResourceStatusFilter)
    : "all";
}

function parseResourceTypeFilter(value: string | null): ResourceTypeFilter {
  return value !== null && value in resourceTypeLabels
    ? (value as ResourceTypeFilter)
    : "all";
}

function readResourceListQueryState(): ResourceListQueryState {
  if (typeof window === "undefined") {
    return defaultResourceListQueryState;
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    keyword: searchParams.get("keyword") ?? "",
    level: parseResourceLevelFilter(searchParams.get("level")),
    page: parsePositivePage(searchParams.get("page")),
    pageSize: parsePageSize(searchParams.get("pageSize")),
    profession: parseResourceProfessionFilter(searchParams.get("profession")),
    resourceType: parseResourceTypeFilter(searchParams.get("resourceType")),
    sortBy: parseResourceSortField(searchParams.get("sortBy")),
    sortOrder: parseResourceSortOrder(searchParams.get("sortOrder")),
    status: parseResourceStatusFilter(searchParams.get("status")),
  };
}

function writeResourceListQueryState(queryState: ResourceListQueryState) {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams();

  if (queryState.keyword.trim().length > 0) {
    searchParams.set("keyword", queryState.keyword.trim());
  }

  if (queryState.profession !== "all") {
    searchParams.set("profession", queryState.profession);
  }

  if (queryState.status !== "all") {
    searchParams.set("status", queryState.status);
  }

  if (queryState.resourceType !== "all") {
    searchParams.set("resourceType", queryState.resourceType);
  }

  if (queryState.level !== "all") {
    searchParams.set("level", queryState.level);
  }

  if (queryState.page !== 1) {
    searchParams.set("page", String(queryState.page));
  }

  if (queryState.pageSize !== 20) {
    searchParams.set("pageSize", String(queryState.pageSize));
  }

  if (queryState.sortBy !== "updatedAt") {
    searchParams.set("sortBy", queryState.sortBy);
  }

  if (queryState.sortOrder !== "desc") {
    searchParams.set("sortOrder", queryState.sortOrder);
  }

  const queryString = searchParams.toString();
  const nextUrl = `${window.location.pathname}${
    queryString.length > 0 ? `?${queryString}` : ""
  }${window.location.hash}`;

  window.history.replaceState(window.history.state, "", nextUrl);
}

function isSafePublicId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function createTestId(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-");
}

function formatLevel(value: number | null) {
  return value === null ? "专业通用资料" : `${value}级`;
}

function formatResourceScope(resource: AdminResourceOpsSummaryDto) {
  return `${professionLabels[resource.profession]} ${formatLevel(resource.level)}`;
}

function matchesLevelFilter(value: number | null, expected: LevelFilter) {
  if (expected === "all") {
    return true;
  }

  if (expected === "general") {
    return value === null;
  }

  return value === Number(expected);
}

function parseKnowledgeNodePublicIdsText(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\s]+/u)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function readResourceDateValue(
  resource: AdminResourceOpsSummaryDto,
  sortBy: ResourceSortField,
) {
  const value = resource[sortBy];

  return value === null ? 0 : new Date(value).getTime();
}

function sortResources(
  resources: AdminResourceOpsSummaryDto[],
  sortBy: ResourceSortField,
  sortOrder: ResourceSortOrder,
) {
  return [...resources].sort((leftResource, rightResource) => {
    const leftValue = readResourceDateValue(leftResource, sortBy);
    const rightValue = readResourceDateValue(rightResource, sortBy);
    const result = leftValue - rightValue;

    return sortOrder === "asc" ? result : -result;
  });
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
  parseKnowledgeNodePublicIdsText(
    uploadState.knowledgeNodePublicIdsText,
  ).forEach((knowledgeNodePublicId) => {
    formData.append("knowledgeNodePublicIds", knowledgeNodePublicId);
  });

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

async function postLocalResourceEnable(
  resourcePublicId: string,
  sessionToken: string,
): Promise<AdminResourceOpsSummaryDto | null> {
  const response = await fetch(`/api/v1/resources/${resourcePublicId}/enable`, {
    headers: createAdminAuthHeaders(sessionToken),
    method: "POST",
  });
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
          `/api/v1/resources?${RESOURCE_LIST_FETCH_QUERY}`,
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
  const initialQueryState = useMemo(() => readResourceListQueryState(), []);
  const [keyword, setKeyword] = useState(initialQueryState.keyword);
  const [profession, setProfession] = useState<ProfessionFilter>(
    initialQueryState.profession,
  );
  const [status, setStatus] = useState<ResourceStatusFilter>(
    initialQueryState.status,
  );
  const [resourceType, setResourceType] = useState<ResourceTypeFilter>(
    initialQueryState.resourceType,
  );
  const [level, setLevel] = useState<LevelFilter>(initialQueryState.level);
  const [page, setPage] = useState(initialQueryState.page);
  const [pageSize, setPageSize] = useState(initialQueryState.pageSize);
  const [sortBy, setSortBy] = useState<ResourceSortField>(
    initialQueryState.sortBy,
  );
  const [sortOrder, setSortOrder] = useState<ResourceSortOrder>(
    initialQueryState.sortOrder,
  );
  const [rebuildState, setRebuildState] = useState<RebuildState>({
    status: "idle",
  });
  const [publishState, setPublishState] = useState<PublishState>({
    status: "idle",
  });
  const [disableState, setDisableState] = useState<DisableState>({
    status: "idle",
  });
  const [enableState, setEnableState] = useState<EnableState>({
    status: "idle",
  });
  const [markdownReviewState, setMarkdownReviewState] =
    useState<MarkdownReviewState>({
      status: "idle",
    });
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    knowledgeNodePublicIdsText: "",
    level: "3",
    profession: "marketing",
    resourceType: "knowledge_doc",
    status: "idle",
    title: "资料校对示例",
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
          matchesFilter(resource.resourceType, resourceType) &&
          matchesLevelFilter(resource.level, level)
        );
      }),
    [keyword, level, profession, resourceType, resources, status],
  );
  const sortedResources = useMemo(
    () => sortResources(filteredResources, sortBy, sortOrder),
    [filteredResources, sortBy, sortOrder],
  );
  const totalPages = Math.max(1, Math.ceil(sortedResources.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return sortedResources.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, sortedResources]);

  useEffect(() => {
    writeResourceListQueryState({
      keyword,
      level,
      page: currentPage,
      pageSize,
      profession,
      resourceType,
      sortBy,
      sortOrder,
      status,
    });
  }, [
    currentPage,
    keyword,
    level,
    pageSize,
    profession,
    resourceType,
    sortBy,
    sortOrder,
    status,
  ]);

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
        message: "资料编号异常，请刷新后重试",
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
          message: "检索索引重建失败，请刷新后重试",
          tone: "error",
        });
        return;
      }

      setToastMessage({
        message: `检索索引重建完成，已生成 ${rebuildResult.resourceVector.chunkCount} 段可检索内容`,
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "检索索引重建失败，请刷新后重试",
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
        message: "资料编号异常，请刷新后重试",
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
          message: "资料发布失败，请刷新后重试",
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
        message: "资料已发布，待重建检索索引",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "资料发布失败，请刷新后重试",
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
        message: "请选择资料文件",
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
          message: "资料上传失败，请确认格式和大小",
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
            ? "资料上传完成，已生成解析草稿"
            : "资料上传完成，但文件解析失败",
        tone:
          uploadResult.localResource.skippedReason === null
            ? "success"
            : "error",
      });
    } catch {
      setToastMessage({
        message: "资料上传失败，请稍后重试",
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
        message: "资料编号异常，请刷新后重试",
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
        message: "解析草稿不可用",
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
        message: "资料编号异常，请刷新后重试",
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
          message: "解析草稿保存失败",
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
        message: "解析草稿已保存",
        tone: "success",
      });
      setMarkdownReviewState({ status: "idle" });
    } catch {
      setToastMessage({
        message: "解析草稿保存失败",
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
        message: "资料编号异常，请刷新后重试",
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
          message: "资料停用失败",
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
        message: "资料已停用",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "资料停用失败",
        tone: "error",
      });
    } finally {
      setDisableState({ status: "idle" });
    }
  }

  async function handleConfirmEnable() {
    if (enableState.status !== "confirming") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !isSafePublicId(enableState.resource.publicId)
    ) {
      setEnableState({ status: "idle" });
      setToastMessage({
        message: "资料编号异常，请刷新后重试",
        tone: "error",
      });
      return;
    }

    setEnableState({ resource: enableState.resource, status: "submitting" });

    try {
      const enabledResource = await postLocalResourceEnable(
        enableState.resource.publicId,
        sessionToken,
      );

      if (enabledResource === null) {
        setToastMessage({
          message: "资料启用失败",
          tone: "error",
        });
        return;
      }

      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.publicId === enabledResource.publicId
            ? enabledResource
            : resource,
        ),
      );
      setToastMessage({
        message: "资料已启用",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "资料启用失败",
        tone: "error",
      });
    } finally {
      setEnableState({ status: "idle" });
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载资料与知识库" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看资料与知识库。"
        title="资料与知识库加载失败"
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
        <ResourceStateMachineContextBand resources={resources} />
        <AdminEmptyState
          description="当前还没有资料。可先上传 Markdown 或文本文件生成解析草稿。"
          title="暂无资料与知识库数据"
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
      <ResourceStateMachineContextBand resources={resources} />

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
                placeholder="资料名称、文件名或资料编号"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
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
            onChange={(value) => {
              setProfession(value as ProfessionFilter);
              setPage(1);
            }}
          />
          <FilterSelect
            label="等级"
            options={levelFilterOptions}
            value={level}
            onChange={(value) => {
              setLevel(value as LevelFilter);
              setPage(1);
            }}
          />
          <FilterSelect
            label="状态"
            options={[
              ["all", "全部状态"],
              ["uploaded", "已上传"],
              ["draft", "解析草稿待校对"],
              ["published", "已发布"],
              ["indexing", "索引重建中"],
              ["rag_ready", "检索可用"],
              ["index_failed", "索引重建失败"],
              ["disabled", "已停用"],
            ]}
            value={status}
            onChange={(value) => {
              setStatus(value as ResourceStatusFilter);
              setPage(1);
            }}
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
            onChange={(value) => {
              setResourceType(value as ResourceTypeFilter);
              setPage(1);
            }}
          />
        </div>
        <ResourceListControls
          currentPage={currentPage}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
          totalPages={totalPages}
          totalRows={sortedResources.length}
          onChangePage={setPage}
          onChangePageSize={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
          onChangeSortBy={(nextSortBy) => {
            setSortBy(nextSortBy);
            setPage(1);
          }}
          onToggleSortOrder={() => {
            setSortOrder((currentSortOrder) =>
              currentSortOrder === "desc" ? "asc" : "desc",
            );
            setPage(1);
          }}
        />
      </div>

      <section className="grid gap-3 md:grid-cols-3" aria-label="资料摘要">
        <SummaryItem label="当前结果" value={`${sortedResources.length} 个`} />
        <SummaryItem
          label="检索可用"
          value={`${
            sortedResources.filter(
              (resource) => resource.resourceStatus === "rag_ready",
            ).length
          } 个`}
        />
        <SummaryItem
          label="待重建检索索引"
          value={`${
            sortedResources.filter((resource) => resource.isVectorStale).length
          } 个`}
        />
      </section>

      {paginatedResources.length > 0 ? (
        <ResourceList
          rows={paginatedResources}
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
          onRequestEnable={(resource) => {
            setToastMessage(null);
            setEnableState({ resource, status: "confirming" });
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

      {enableState.status === "confirming" ||
      enableState.status === "submitting" ? (
        <EnableConfirmationDialog
          isSubmitting={enableState.status === "submitting"}
          resource={enableState.resource}
          onCancel={() => setEnableState({ status: "idle" })}
          onConfirm={handleConfirmEnable}
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

function ResourceStateMachineContextBand({
  resources,
}: {
  resources: AdminResourceOpsSummaryDto[];
}) {
  const countByStatus = (status: ResourceStatus) =>
    resources.filter((resource) => resource.resourceStatus === status).length;
  const staleResourceCount = resources.filter(
    (resource) => resource.isVectorStale,
  ).length;

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="resource-state-machine-context-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">资源状态机</p>
          <h2 className="text-text-primary text-base font-semibold">
            上传、解析、发布与检索新鲜度
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            内容后台只展示资料生命周期摘要；检索新鲜度用于提示是否需要重建索引，不展示原文片段。
          </p>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-6">
          <ResourceLifecycleMetric
            label="上传待解析"
            value={countByStatus("uploaded") + countByStatus("converting")}
          />
          <ResourceLifecycleMetric
            label="解析草稿"
            value={countByStatus("draft")}
          />
          <ResourceLifecycleMetric
            label="已发布待索引"
            value={countByStatus("published") + countByStatus("indexing")}
          />
          <ResourceLifecycleMetric
            label="检索可用"
            value={countByStatus("rag_ready")}
          />
          <ResourceLifecycleMetric
            label="索引失败"
            value={
              countByStatus("index_failed") + countByStatus("conversion_failed")
            }
          />
          <ResourceLifecycleMetric
            label="检索新鲜度"
            value={staleResourceCount}
          />
        </dl>
      </div>
    </section>
  );
}

function ResourcePageHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <p className="text-brand-primary text-sm font-medium">内容后台</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          资料与知识库管理
        </h1>
        <p className="text-text-secondary max-w-3xl text-sm">
          上传教材、讲义和课件资料，校对解析草稿，发布后手动重建检索索引。
          学员端只会看到允许展示的引用标题和章节路径。
        </p>
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px] lg:items-end">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">资料名称</span>
          <Input
            aria-label="资料名称"
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
          <select
            aria-label="等级"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={uploadState.level}
            onChange={(event) =>
              onChange({ ...uploadState, level: event.target.value })
            }
          >
            <option value="">专业通用资料</option>
            <option value="1">1级</option>
            <option value="2">2级</option>
            <option value="3">3级</option>
            <option value="4">4级</option>
            <option value="5">5级</option>
          </select>
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
        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-3">
          <span className="text-text-secondary">知识点业务标识</span>
          <textarea
            aria-label="知识点业务标识"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-20 rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-3"
            placeholder="多个 public id 可用空格、逗号或换行分隔"
            value={uploadState.knowledgeNodePublicIdsText}
            onChange={(event) =>
              onChange({
                ...uploadState,
                knowledgeNodePublicIdsText: event.target.value,
              })
            }
          />
        </label>
        <div className="flex flex-col gap-2">
          <label className="text-text-secondary text-sm font-medium">
            资料文件
            <input
              aria-label="资料文件"
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
            {uploadState.status === "submitting"
              ? "上传中"
              : "上传资料并生成草稿"}
          </Button>
        </div>
      </div>
      <p className="text-text-muted mt-3 text-xs">
        支持 Markdown 或文本文件生成解析草稿，单个文件上限 50MB。DOCX、PPTX
        和可抽取文本 PDF 的解析接入由后续任务落地；扫描型 PDF 不在首期范围。
      </p>
    </section>
  );
}

function ResourceListControls({
  currentPage,
  onChangePage,
  onChangePageSize,
  onChangeSortBy,
  onToggleSortOrder,
  pageSize,
  sortBy,
  sortOrder,
  totalPages,
  totalRows,
}: {
  currentPage: number;
  onChangePage: (page: number) => void;
  onChangePageSize: (pageSize: ResourceListQueryState["pageSize"]) => void;
  onChangeSortBy: (sortBy: ResourceSortField) => void;
  onToggleSortOrder: () => void;
  pageSize: ResourceListQueryState["pageSize"];
  sortBy: ResourceSortField;
  sortOrder: ResourceSortOrder;
  totalPages: number;
  totalRows: number;
}) {
  return (
    <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap gap-3">
        <label className="flex min-w-32 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">每页条数</span>
          <select
            aria-label="每页条数"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={String(pageSize)}
            onChange={(event) =>
              onChangePageSize(
                Number(
                  event.target.value,
                ) as ResourceListQueryState["pageSize"],
              )
            }
          >
            {ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-36 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">排序字段</span>
          <select
            aria-label="排序字段"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={sortBy}
            onChange={(event) =>
              onChangeSortBy(event.target.value as ResourceSortField)
            }
          >
            {Object.entries(resourceSortFieldLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={onToggleSortOrder}>
          {sortOrder === "desc" ? "降序" : "升序"}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text-secondary">
          第 {currentPage} / {totalPages} 页，共 {totalRows} 条
        </span>
        <Button
          disabled={currentPage <= 1}
          variant="outline"
          onClick={() => onChangePage(currentPage - 1)}
        >
          上一页
        </Button>
        <Button
          disabled={currentPage >= totalPages}
          variant="outline"
          onClick={() => onChangePage(currentPage + 1)}
        >
          下一页
        </Button>
      </div>
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

function ResourceLifecycleMetric({
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

function ResourceList({
  onRequestDisable,
  onRequestEnable,
  onRequestMarkdownReview,
  onRequestPublish,
  onRequestRebuild,
  rows,
}: {
  onRequestDisable: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestEnable: (resource: AdminResourceOpsSummaryDto) => void;
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
                  label="解析草稿"
                  value={
                    resource.markdownPreviewAvailable ? "可校对" : "未生成"
                  }
                />
                <MetricBadge
                  label="原始文件"
                  value={resource.downloadAvailable ? "可申请下载" : "不可下载"}
                />
                <MetricBadge
                  label="检索索引"
                  value={resource.isVectorStale ? "待重建" : "已同步"}
                />
                <MetricBadge
                  label="知识点绑定"
                  value={`${resource.knowledgeNodePublicIds.length} 个`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 xl:items-end">
              <ResourceReference value={resource.publicId} />
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
                  发布解析草稿
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
                校对解析草稿
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
                    重建检索索引
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      aria-hidden="true"
                      data-icon="inline-start"
                    />
                    资料编号异常
                  </>
                )}
              </Button>
              {resource.resourceStatus === "disabled" ? (
                <Button
                  disabled={!isSafePublicId(resource.publicId)}
                  variant="outline"
                  onClick={() => onRequestEnable(resource)}
                >
                  <CheckCircle2 aria-hidden="true" data-icon="inline-start" />
                  启用资料
                </Button>
              ) : (
                <Button
                  disabled={!isSafePublicId(resource.publicId)}
                  variant="destructive"
                  onClick={() => onRequestDisable(resource)}
                >
                  <XCircle aria-hidden="true" data-icon="inline-start" />
                  停用资料
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

function ResourceReference({ value }: { value: string }) {
  return (
    <span className="text-text-muted inline-flex items-center gap-2 text-xs">
      <span>资料编号</span>
      <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono">
        {value}
      </code>
    </span>
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
      <p className="text-text-primary font-medium">没有匹配的资料</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function AdminResourceModalShell({ children }: { children: ReactNode }) {
  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      {children}
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
    <AdminResourceModalShell>
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认发布{resource.title}的解析草稿？
        </h2>
        <p className="text-text-secondary text-sm">
          发布后资料进入待重建检索索引状态，知识库会在索引重建完成后使用新内容。
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
    </AdminResourceModalShell>
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
    <AdminResourceModalShell>
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认重建{resource.title}的检索索引？
        </h2>
        <p className="text-text-secondary text-sm">
          重建期间旧索引如仍可用会继续服务检索；结果只展示安全摘要，不展示原文内容段。
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
    </AdminResourceModalShell>
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
    <AdminResourceModalShell>
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认停用{resource.title}？
        </h2>
        <p className="text-text-secondary text-sm">
          停用后该资料不参与新的知识库检索。
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
    </AdminResourceModalShell>
  );
}

function EnableConfirmationDialog({
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
    <AdminResourceModalShell>
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认启用{resource.title}？
        </h2>
        <p className="text-text-secondary text-sm">
          启用后该资料将恢复到停用前的可用状态。
        </p>
        <div className="flex gap-2">
          <Button disabled={isSubmitting} onClick={onConfirm}>
            确认启用
          </Button>
          <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </AdminResourceModalShell>
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
          校对{resource.title}的解析草稿
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">
              解析草稿原文（Markdown）
            </span>
            <textarea
              aria-label="解析草稿原文"
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
                调整标题级别会同步更新草稿标题符号。
              </p>
            </div>
            {headingReviewItems.length === 0 ? (
              <p className="text-text-secondary mt-4 text-sm">
                当前草稿没有可识别的标题。
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
