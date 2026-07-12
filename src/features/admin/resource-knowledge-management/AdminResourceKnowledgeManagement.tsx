"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DatabaseZap,
  Eye,
  FileText,
  RotateCcw,
  Search,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
  adminListControlClassName,
  adminListFilterLabelClassName,
} from "@/components/admin/AdminList";
import type { ResourceVectorRebuildResultDto } from "@/server/contracts/ai-rag-contract";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
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
  isAdminContext,
  isUnauthorizedResponse,
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

function createResourceListQueryString(queryState: ResourceListQueryState) {
  const searchParams = new URLSearchParams({
    page: String(queryState.page),
    pageSize: String(queryState.pageSize),
    sortBy: queryState.sortBy,
    sortOrder: queryState.sortOrder,
  });

  if (queryState.keyword.trim().length > 0) {
    searchParams.set("keyword", queryState.keyword.trim());
  }
  if (queryState.profession !== "all") {
    searchParams.set("profession", queryState.profession);
  }
  if (queryState.level !== "all") {
    searchParams.set("level", queryState.level);
  }
  if (queryState.status !== "all") {
    searchParams.set("status", queryState.status);
  }
  if (queryState.resourceType !== "all") {
    searchParams.set("resourceType", queryState.resourceType);
  }

  return searchParams.toString();
}

function hasResourcePublicId(value: string) {
  return value.length > 0;
}

function createResourcePath(
  resourcePublicId: string,
  action?: "disable" | "enable" | "publish" | "rebuild-vector",
) {
  const resourcePath = `/api/v1/resources/${encodeURIComponent(resourcePublicId)}`;

  return action === undefined ? resourcePath : `${resourcePath}/${action}`;
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
    createResourcePath(resourcePublicId, "rebuild-vector"),
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
    createResourcePath(resourcePublicId, "publish"),
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
  const response = await fetch(createResourcePath(resourcePublicId), {
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
  const response = await fetch(createResourcePath(resourcePublicId), {
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
    createResourcePath(resourcePublicId, "disable"),
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
  const response = await fetch(createResourcePath(resourcePublicId, "enable"), {
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

function useResourceData(queryState: ResourceListQueryState) {
  const [loadState, setLoadState] = useState<ResourceLoadState>("loading");
  const [resources, setResources] = useState<AdminResourceOpsSummaryDto[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>({
    page: queryState.page,
    pageSize: queryState.pageSize,
    sortBy: queryState.sortBy,
    sortOrder: queryState.sortOrder,
    total: 0,
  });
  const queryString = createResourceListQueryString(queryState);

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
          `/api/v1/resources?${queryString}`,
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
        setPagination(
          resourceResponse.pagination ?? {
            page: queryState.page,
            pageSize: queryState.pageSize,
            sortBy: queryState.sortBy,
            sortOrder: queryState.sortOrder,
            total: resourceResponse.data.resources.length,
          },
        );
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
  }, [
    queryState.page,
    queryState.pageSize,
    queryState.sortBy,
    queryState.sortOrder,
    queryString,
  ]);

  return { loadState, pagination, resources, setResources };
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [resourceDetail, setResourceDetail] = useState<
    | { status: "idle" }
    | { status: "loading"; resource: AdminResourceOpsSummaryDto }
    | {
        status: "ready";
        resource: AdminResourceOpsSummaryDto;
        markdownContent: string | null;
      }
    | { status: "error"; resource: AdminResourceOpsSummaryDto }
  >({ status: "idle" });
  const queryState = useMemo<ResourceListQueryState>(
    () => ({
      keyword,
      level,
      page,
      pageSize,
      profession,
      resourceType,
      sortBy,
      sortOrder,
      status,
    }),
    [
      keyword,
      level,
      page,
      pageSize,
      profession,
      resourceType,
      sortBy,
      sortOrder,
      status,
    ],
  );
  const { loadState, pagination, resources, setResources } =
    useResourceData(queryState);
  const currentPage = pagination.page;
  const totalRows = pagination.total;

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

  async function handleOpenResourceDetail(
    resource: AdminResourceOpsSummaryDto,
  ) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || !hasResourcePublicId(resource.publicId)) {
      setResourceDetail({ status: "error", resource });
      return;
    }

    setResourceDetail({ status: "loading", resource });

    try {
      const detail = await getLocalResourceDetail(
        resource.publicId,
        sessionToken,
      );

      setResourceDetail({
        status: "ready",
        resource: detail?.resource ?? resource,
        markdownContent: detail?.markdownContent ?? null,
      });
    } catch {
      setResourceDetail({ status: "error", resource });
    }
  }

  async function handleConfirmRebuild() {
    if (rebuildState.status !== "confirming") {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (
      sessionToken === null ||
      !hasResourcePublicId(rebuildState.resource.publicId)
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
      !hasResourcePublicId(publishState.resource.publicId)
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

    if (sessionToken === null || !hasResourcePublicId(resource.publicId)) {
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
      !hasResourcePublicId(markdownReviewState.resource.publicId)
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
      !hasResourcePublicId(disableState.resource.publicId)
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
      !hasResourcePublicId(enableState.resource.publicId)
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

  return (
    <section className="space-y-6">
      <ResourcePageHeader
        isUploadOpen={isUploadOpen}
        onToggleUpload={() => setIsUploadOpen((isOpen) => !isOpen)}
      />

      {isUploadOpen ? (
        <ResourceUploadPanel
          uploadState={uploadState}
          onChange={setUploadState}
          onSubmit={handleUploadResource}
        />
      ) : null}
      <ResourceStateMachineContextBand resources={resources} />

      <AdminListToolbar
        description="按条件查找资料；筛选、排序和每页条数变化后自动回到第一页。"
        resultLabel={`共 ${totalRows} 份资料`}
        title="资料列表"
      >
        <label className={`${adminListFilterLabelClassName} min-w-64 flex-1`}>
          <span className="text-text-secondary">关键词</span>
          <span className="relative">
            <Search
              aria-hidden="true"
              className="text-text-muted pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
            />
            <Input
              aria-label="关键词"
              className={`${adminListControlClassName} pl-8`}
              placeholder="资料名称或文件名"
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
        <label className={`${adminListFilterLabelClassName} min-w-32`}>
          <span>排序</span>
          <select
            aria-label="排序字段"
            className={`${adminListControlClassName} border-input bg-surface rounded-lg border px-2.5 text-sm`}
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as ResourceSortField);
              setPage(1);
            }}
          >
            {Object.entries(resourceSortFieldLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={`${adminListFilterLabelClassName} min-w-28`}>
          <span>每页条数</span>
          <select
            aria-label="每页条数"
            className={`${adminListControlClassName} border-input bg-surface rounded-lg border px-2.5 text-sm`}
            value={String(pageSize)}
            onChange={(event) => {
              setPageSize(
                Number(
                  event.target.value,
                ) as ResourceListQueryState["pageSize"],
              );
              setPage(1);
            }}
          >
            {ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <Button
          aria-label={sortOrder === "desc" ? "切换为升序" : "切换为降序"}
          variant="outline"
          onClick={() => {
            setSortOrder((current) => (current === "desc" ? "asc" : "desc"));
            setPage(1);
          }}
        >
          {sortOrder === "desc" ? "降序" : "升序"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setKeyword("");
            setProfession("all");
            setLevel("all");
            setStatus("all");
            setResourceType("all");
            setSortBy("updatedAt");
            setSortOrder("desc");
            setPageSize(20);
            setPage(1);
          }}
        >
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
          重置筛选
        </Button>
      </AdminListToolbar>

      {resources.length > 0 ? (
        <ResourceList
          rows={resources}
          onRequestDetail={(resource) =>
            void handleOpenResourceDetail(resource)
          }
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
      ) : loadState === "empty" ? (
        <AdminEmptyState
          description={
            keyword === "" &&
            profession === "all" &&
            level === "all" &&
            status === "all" &&
            resourceType === "all"
              ? "当前还没有资料。可使用页面上方的“上传资料”创建解析草稿。"
              : "调整关键词或筛选条件后再试。"
          }
          title={
            keyword === "" &&
            profession === "all" &&
            level === "all" &&
            status === "all" &&
            resourceType === "all"
              ? "暂无资料与知识库数据"
              : "没有匹配的资料"
          }
        />
      ) : null}

      <AdminPagination
        itemLabel="份资料"
        page={currentPage}
        pageSize={pageSize}
        total={totalRows}
        onPageChange={setPage}
      />

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

      {resourceDetail.status === "idle" ? null : (
        <ResourceDetailDialog
          detail={resourceDetail}
          onClose={() => setResourceDetail({ status: "idle" })}
        />
      )}

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
          <p className="text-brand-primary text-xs font-medium">
            当前页资料状态
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            上传、解析、发布与检索新鲜度
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            当前页仅展示资料生命周期摘要；检索新鲜度用于提示是否需要重建索引，不展示原文片段。
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

function ResourcePageHeader({
  isUploadOpen,
  onToggleUpload,
}: {
  isUploadOpen: boolean;
  onToggleUpload: () => void;
}) {
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
      <Button onClick={onToggleUpload}>
        <Upload aria-hidden="true" data-icon="inline-start" />
        {isUploadOpen ? "收起上传" : "上传资料"}
      </Button>
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
  onRequestDetail,
  onRequestDisable,
  onRequestEnable,
  onRequestMarkdownReview,
  onRequestPublish,
  onRequestRebuild,
  rows,
}: {
  onRequestDetail: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestDisable: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestEnable: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestMarkdownReview: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestPublish: (resource: AdminResourceOpsSummaryDto) => void;
  onRequestRebuild: (resource: AdminResourceOpsSummaryDto) => void;
  rows: AdminResourceOpsSummaryDto[];
}) {
  return (
    <AdminTableFrame ariaLabel="资料列表" minWidthClassName="min-w-[1120px]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium">资料</th>
            <th className="px-4 py-3 font-medium">适用范围</th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">检索与绑定</th>
            <th className="px-4 py-3 font-medium">更新时间</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((resource) => (
            <tr
              className="border-border border-t align-top"
              data-public-id={resource.publicId}
              data-testid={`resource-row-${createTestId(resource.publicId)}`}
              key={resource.publicId}
            >
              <td className="px-4 py-3">
                <p className="text-text-primary font-medium">
                  {resource.title}
                </p>
                <p className="text-text-muted mt-1 text-xs">
                  {resourceTypeLabels[resource.resourceType]} /{" "}
                  {resource.originalFileName ?? "未记录文件名"}
                </p>
              </td>
              <td className="text-text-secondary px-4 py-3">
                {formatResourceScope(resource)}
              </td>
              <td className="px-4 py-3">
                <span className="bg-secondary text-secondary-foreground inline-flex rounded-md px-2 py-1 text-xs font-medium">
                  {resourceStatusLabels[resource.resourceStatus]}
                </span>
                <p className="text-text-muted mt-2 text-xs">
                  解析草稿{" "}
                  {resource.markdownPreviewAvailable ? "可校对" : "未生成"}
                </p>
              </td>
              <td className="text-text-secondary px-4 py-3">
                <p>检索索引 {resource.isVectorStale ? "待重建" : "已同步"}</p>
                <p className="text-text-muted mt-1 text-xs">
                  绑定知识点 {resource.knowledgeNodePublicIds.length} 个
                </p>
              </td>
              <td className="text-text-secondary px-4 py-3">
                {formatDateTime(resource.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    disabled={!hasResourcePublicId(resource.publicId)}
                    variant="outline"
                    onClick={() => onRequestDetail(resource)}
                  >
                    <Eye aria-hidden="true" data-icon="inline-start" />
                    查看资料
                  </Button>
                  <Button
                    disabled={
                      !hasResourcePublicId(resource.publicId) ||
                      !resource.markdownPreviewAvailable
                    }
                    variant="outline"
                    onClick={() => onRequestMarkdownReview(resource)}
                  >
                    <FileText aria-hidden="true" data-icon="inline-start" />
                    校对内容
                  </Button>
                  {resource.resourceStatus === "draft" ||
                  resource.resourceStatus === "rag_ready" ? (
                    <Button
                      disabled={
                        !hasResourcePublicId(resource.publicId) ||
                        !resource.markdownPreviewAvailable
                      }
                      variant="outline"
                      onClick={() => onRequestPublish(resource)}
                    >
                      发布资料
                    </Button>
                  ) : null}
                  <Button
                    disabled={!hasResourcePublicId(resource.publicId)}
                    variant={
                      resource.resourceStatus === "published" ||
                      resource.isVectorStale
                        ? "destructive"
                        : "outline"
                    }
                    onClick={() => onRequestRebuild(resource)}
                  >
                    {hasResourcePublicId(resource.publicId) ? (
                      <>
                        <DatabaseZap
                          aria-hidden="true"
                          data-icon="inline-start"
                        />
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
                      disabled={!hasResourcePublicId(resource.publicId)}
                      variant="outline"
                      onClick={() => onRequestEnable(resource)}
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        data-icon="inline-start"
                      />
                      启用资料
                    </Button>
                  ) : (
                    <Button
                      disabled={!hasResourcePublicId(resource.publicId)}
                      variant="destructive"
                      onClick={() => onRequestDisable(resource)}
                    >
                      <XCircle aria-hidden="true" data-icon="inline-start" />
                      停用资料
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function ResourceDetailDialog({
  detail,
  onClose,
}: {
  detail: Exclude<
    | { status: "idle" }
    | { status: "loading"; resource: AdminResourceOpsSummaryDto }
    | {
        status: "ready";
        resource: AdminResourceOpsSummaryDto;
        markdownContent: string | null;
      }
    | { status: "error"; resource: AdminResourceOpsSummaryDto },
    { status: "idle" }
  >;
  onClose: () => void;
}) {
  const headings =
    detail.status === "ready" && detail.markdownContent !== null
      ? collectMarkdownHeadingReviewItems(detail.markdownContent)
      : [];
  const preview =
    detail.status === "ready" && detail.markdownContent !== null
      ? detail.markdownContent.slice(0, 4000)
      : null;

  return (
    <div
      aria-label="资料详情"
      aria-modal="true"
      className="border-border bg-surface fixed top-16 right-4 bottom-4 z-50 w-[min(720px,calc(100vw-2rem))] overflow-y-auto rounded-md border p-5 shadow-lg"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-brand-primary text-xs font-medium">资料详情</p>
          <h2 className="text-text-primary mt-1 text-lg font-semibold">
            {detail.resource.title}
          </h2>
        </div>
        <Button aria-label="关闭资料详情" variant="outline" onClick={onClose}>
          关闭
        </Button>
      </div>

      {detail.status === "loading" ? (
        <p className="text-text-secondary mt-6 text-sm">正在加载资料详情</p>
      ) : detail.status === "error" ? (
        <p className="text-destructive mt-6 text-sm">
          资料详情加载失败，请稍后重试。
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailMetric
              label="资料类型"
              value={resourceTypeLabels[detail.resource.resourceType]}
            />
            <DetailMetric
              label="适用范围"
              value={formatResourceScope(detail.resource)}
            />
            <DetailMetric
              label="处理进度"
              value={resourceStatusLabels[detail.resource.resourceStatus]}
            />
            <DetailMetric
              label="检索状态"
              value={
                detail.resource.isVectorStale
                  ? "内容已更新，需重建检索索引"
                  : "检索内容已同步"
              }
            />
            <DetailMetric
              label="发布时间"
              value={
                detail.resource.publishedAt === null
                  ? "尚未发布"
                  : formatDateTime(detail.resource.publishedAt)
              }
            />
            <DetailMetric
              label="绑定知识点"
              value={`${detail.resource.knowledgeNodePublicIds.length} 个`}
            />
          </dl>

          <section aria-label="章节目录">
            <h3 className="text-text-primary font-semibold">章节目录</h3>
            {headings.length === 0 ? (
              <p className="text-text-muted mt-2 text-sm">
                当前资料没有可识别的章节标题。
              </p>
            ) : (
              <ol className="text-text-secondary mt-2 space-y-1 text-sm">
                {headings.map((heading) => (
                  <li key={`${heading.lineNumber}-${heading.title}`}>
                    {heading.path.join(" / ")}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-label="内容预览">
            <h3 className="text-text-primary font-semibold">内容预览</h3>
            {preview === null ? (
              <p className="text-text-muted mt-2 text-sm">
                当前资料暂无可读内容预览。
              </p>
            ) : (
              <pre className="bg-muted/40 text-text-secondary mt-2 max-h-80 overflow-auto rounded-md p-4 text-sm leading-6 whitespace-pre-wrap">
                {preview}
              </pre>
            )}
          </section>

          <section aria-label="安全时间线">
            <h3 className="text-text-primary font-semibold">处理时间线</h3>
            <ul className="text-text-secondary mt-2 space-y-1 text-sm">
              <li>上传：{formatDateTime(detail.resource.uploadedAt)}</li>
              <li>最近更新：{formatDateTime(detail.resource.updatedAt)}</li>
              <li>
                发布：
                {detail.resource.publishedAt === null
                  ? "尚未发布"
                  : formatDateTime(detail.resource.publishedAt)}
              </li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-md border p-3">
      <dt className="text-text-muted text-xs">{label}</dt>
      <dd className="text-text-primary mt-1 text-sm font-medium">{value}</dd>
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
