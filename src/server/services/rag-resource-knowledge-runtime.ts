import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES,
  ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS,
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeStatus,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
  type AdminContentKnowledgeSortField,
  type AdminResourceOpsSummaryDto,
  type AdminKnowledgeNodeOpsSummaryDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type {
  RagRetrievalResultDto,
  ResourceVectorRebuildResultDto,
} from "../contracts/ai-rag-contract";
import type { ResourceStatus, ResourceType } from "../models/ai-rag";
import { canTransitionResourceStatus } from "../models/ai-rag";
import type { Profession } from "../models/auth";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresRagResourceKnowledgeRuntimeRepositories,
  type RagKnowledgeNodeRuntimeRepository,
  type RagResourceKnowledgeRuntimeRepositories,
  type RagResourceRuntimeRepository,
} from "../repositories/rag-resource-knowledge-runtime-repository";
import {
  parseKnowledgeNodeMutationInput,
  parseKnowledgeNodeUpdateInput,
} from "../validators/rag-resource-knowledge";
import {
  defaultLocalUploadStorageRoot,
  storeLocalResourceFile,
  type StoredLocalResourceMetadata,
} from "./local-paper-asset-storage";
import {
  parseLocalTextDocumentAsset,
  type LocalTextDocumentEvidenceSummary,
} from "./local-text-document-parser";
import { buildResourceChunks } from "./rag-chunking-service";
import { buildRagRetrievalContextFromChunks } from "./rag-retrieval-service";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type ContentAdminRole = "super_admin" | "ops_admin" | "content_admin";

type ContentAdminActor = {
  userPublicId: string;
  publicId: string;
  roles: [ContentAdminRole, ...ContentAdminRole[]];
};

export type RagResourceKnowledgeAuditLogRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
};

export type RagResourceKnowledgeRuntimeRepositoriesWithAudit =
  RagResourceKnowledgeRuntimeRepositories & {
    auditLogRepository: RagResourceKnowledgeAuditLogRepository;
  };

export type RagResourceKnowledgeRuntimeOptions = {
  localResourceStorageRoot?: string;
  repositories?: RagResourceKnowledgeRuntimeRepositoriesWithAudit;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type LocalResourceCatalogEntry = {
  publicId: string;
  title: string;
  resourceType: ResourceType;
  resourceStatus: ResourceStatus;
  profession: Profession;
  level: number | null;
  originalFileName: string;
  objectKey: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
  markdownContent: string | null;
  markdownContentHash: string | null;
  indexingErrorMessage: string | null;
  isVectorStale: boolean;
  publishedAt: string | null;
  uploadedAt: string;
  updatedAt: string;
  disabledFromStatus: ResourceStatus | null;
  chunkCount: number;
  textHashes: string[];
  headingPaths: string[][];
  knowledgeNodePublicIds: string[];
  activeMarkdownContentHash: string | null;
  activeChunkSnapshot: LocalResourceVectorChunkSnapshot[];
};

type LocalResourceVectorChunkSnapshot = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  profession: Profession;
  level: number | null;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
};

type LocalResourceCatalog = {
  resources: LocalResourceCatalogEntry[];
};

type LocalResourceUploadSummary = {
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

export const localResourceMaxFileSizeByte = 50 * 1024 * 1024;

export type LocalResourceRagRetrievalInput = {
  storageRoot?: string;
  query: string;
  profession: Profession;
  level: number | null;
  authorizedResourcePublicIds?: string[];
  knowledgeNodePublicIds?: string[];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const resourceNotFoundResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.resourceNotFound,
  "Resource does not exist.",
);
const knowledgeNodeNotFoundResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.resourceNotFound,
  "Knowledge node does not exist.",
);
const validationFailedResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
  "Request validation failed.",
);
const resourcePublishConflictResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
  "Resource cannot be published from its current state.",
);
const resourceEnableConflictResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
  "Resource cannot be enabled from its current state.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isContentAdminRole(role: string): role is ContentAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function canManageContent(actor: ContentAdminActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}

function getContentAdminAuthorization(request: Request): string | null {
  return getRequestAuthorization(request);
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<ContentAdminActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getContentAdminAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isContentAdminRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    userPublicId: sessionResponse.data.user.publicId,
    publicId: adminPublicId,
    roles: adminRoles as [ContentAdminRole, ...ContentAdminRole[]],
  };
}

function readListQuery(request: Request): AdminContentKnowledgeListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const level = Number(searchParams.get("level"));
  const sortBy = searchParams.get("sortBy");

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (pageSize === 50 || pageSize === 100
      ? pageSize
      : 20) as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
    status: parseContentKnowledgeStatus(searchParams.get("status")),
    profession: parseProfessionFilter(searchParams.get("profession")),
    level: Number.isFinite(level) && level > 0 ? level : null,
    sortBy: ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS.includes(
      sortBy as AdminContentKnowledgeSortField,
    )
      ? (sortBy as AdminContentKnowledgeSortField)
      : "updatedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  });
}

function parseContentKnowledgeStatus(
  value: string | null,
): AdminContentKnowledgeStatus {
  return value === "available" ||
    value === "disabled" ||
    value === "draft" ||
    value === "published" ||
    value === "archived" ||
    value === "uploaded" ||
    value === "converting" ||
    value === "conversion_failed" ||
    value === "indexing" ||
    value === "index_failed" ||
    value === "rag_ready" ||
    value === "active"
    ? value
    : "all";
}

function parseProfessionFilter(value: string | null): Profession | "all" {
  return value === "monopoly" || value === "marketing" || value === "logistics"
    ? value
    : "all";
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function resolveInsideStorageRoot(storageRoot: string, relativePath: string) {
  const resolvedRoot = resolve(storageRoot);
  const targetPath = resolve(resolvedRoot, ...relativePath.split("/"));
  const rootPrefix = resolvedRoot.endsWith(sep)
    ? resolvedRoot
    : `${resolvedRoot}${sep}`;

  if (targetPath !== resolvedRoot && !targetPath.startsWith(rootPrefix)) {
    throw new Error("Local resource catalog target escaped storage root.");
  }

  return targetPath;
}

function getLocalResourceCatalogPath(storageRoot: string) {
  return resolveInsideStorageRoot(storageRoot, "dev/resource/catalog.json");
}

async function readLocalResourceCatalog(
  storageRoot: string,
): Promise<LocalResourceCatalog> {
  try {
    const parsedValue = JSON.parse(
      await readFile(getLocalResourceCatalogPath(storageRoot), "utf8"),
    ) as Partial<LocalResourceCatalog>;

    return {
      resources: Array.isArray(parsedValue.resources)
        ? parsedValue.resources
            .map(normalizeLocalResourceCatalogEntry)
            .filter(
              (resource): resource is LocalResourceCatalogEntry =>
                resource !== null,
            )
        : [],
    };
  } catch {
    return { resources: [] };
  }
}

async function writeLocalResourceCatalog(
  storageRoot: string,
  catalog: LocalResourceCatalog,
) {
  const catalogPath = getLocalResourceCatalogPath(storageRoot);

  await mkdir(dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
}

function normalizeLocalResourceCatalogEntry(
  value: unknown,
): LocalResourceCatalogEntry | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const entry = value as Partial<LocalResourceCatalogEntry>;

  const isBaseEntry =
    typeof entry.publicId === "string" &&
    typeof entry.title === "string" &&
    isResourceType(entry.resourceType) &&
    isResourceStatus(entry.resourceStatus) &&
    isProfession(entry.profession) &&
    (typeof entry.level === "number" || entry.level === null) &&
    typeof entry.originalFileName === "string" &&
    typeof entry.objectKey === "string" &&
    typeof entry.contentType === "string" &&
    typeof entry.fileSizeByte === "number" &&
    typeof entry.fileHash === "string" &&
    (typeof entry.markdownContent === "string" ||
      entry.markdownContent === null) &&
    (typeof entry.markdownContentHash === "string" ||
      entry.markdownContentHash === null) &&
    (typeof entry.indexingErrorMessage === "string" ||
      entry.indexingErrorMessage === null) &&
    typeof entry.isVectorStale === "boolean" &&
    (typeof entry.publishedAt === "string" || entry.publishedAt === null) &&
    typeof entry.uploadedAt === "string" &&
    typeof entry.updatedAt === "string" &&
    (isResourceStatus(entry.disabledFromStatus) ||
      entry.disabledFromStatus === null) &&
    typeof entry.chunkCount === "number" &&
    Array.isArray(entry.textHashes) &&
    Array.isArray(entry.headingPaths);

  if (!isBaseEntry) {
    return null;
  }

  return {
    ...entry,
    knowledgeNodePublicIds: normalizeStringArray(entry.knowledgeNodePublicIds),
    activeMarkdownContentHash:
      typeof entry.activeMarkdownContentHash === "string"
        ? entry.activeMarkdownContentHash
        : null,
    activeChunkSnapshot: Array.isArray(entry.activeChunkSnapshot)
      ? entry.activeChunkSnapshot.filter(isLocalResourceVectorChunkSnapshot)
      : [],
  } as LocalResourceCatalogEntry;
}

function isLocalResourceVectorChunkSnapshot(
  value: unknown,
): value is LocalResourceVectorChunkSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const chunk = value as Partial<LocalResourceVectorChunkSnapshot>;

  return (
    typeof chunk.chunkPublicId === "string" &&
    typeof chunk.resourcePublicId === "string" &&
    typeof chunk.resourceTitle === "string" &&
    isProfession(chunk.profession) &&
    (typeof chunk.level === "number" || chunk.level === null) &&
    Array.isArray(chunk.headingPath) &&
    chunk.headingPath.every((heading) => typeof heading === "string") &&
    typeof chunk.chunkIndex === "number" &&
    typeof chunk.text === "string" &&
    typeof chunk.textHash === "string"
  );
}

function isProfession(value: unknown): value is Profession {
  return value === "monopoly" || value === "marketing" || value === "logistics";
}

function isResourceType(value: unknown): value is ResourceType {
  return (
    value === "textbook" ||
    value === "courseware" ||
    value === "knowledge_doc" ||
    value === "lecture_note" ||
    value === "other"
  );
}

function isResourceStatus(value: unknown): value is ResourceStatus {
  return (
    value === "uploaded" ||
    value === "converting" ||
    value === "conversion_failed" ||
    value === "draft" ||
    value === "published" ||
    value === "indexing" ||
    value === "index_failed" ||
    value === "rag_ready" ||
    value === "disabled"
  );
}

function isUploadFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string" &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    typeof (value as { size?: unknown }).size === "number"
  );
}

function createMarkdownContentHash(markdownContent: string) {
  return createHash("sha256").update(markdownContent).digest("hex");
}

function createLocalResourcePublicId(metadata: StoredLocalResourceMetadata) {
  return `resource-local-${metadata.fileHash.slice(0, 12)}`;
}

function normalizeLocalResourceTitle(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function parseLocalResourceLevel(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const level = Number(value);

  return Number.isInteger(level) && level > 0 ? level : null;
}

function parseLocalResourceKnowledgeNodePublicIds(formData: FormData) {
  return normalizeStringArray(
    formData
      .getAll("knowledgeNodePublicIds")
      .flatMap((value) =>
        typeof value === "string" ? value.split(/[,\s]+/u) : [],
      ),
  );
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    ),
  );
}

function mapLocalResourceEntry(
  entry: LocalResourceCatalogEntry,
): AdminResourceOpsSummaryDto {
  return {
    publicId: entry.publicId,
    title: entry.title,
    resourceType: entry.resourceType,
    resourceStatus: entry.resourceStatus,
    profession: entry.profession,
    level: entry.level,
    originalFileName: entry.originalFileName,
    downloadAvailable: true,
    markdownPreviewAvailable: entry.markdownContentHash !== null,
    isVectorStale: entry.isVectorStale,
    publishedAt: entry.publishedAt,
    indexingErrorSummary: createLocalIndexingErrorSummary(
      entry.indexingErrorMessage,
    ),
    uploadedAt: entry.uploadedAt,
    updatedAt: entry.updatedAt,
  };
}

function createLocalIndexingErrorSummary(message: string | null) {
  if (message === null) {
    return null;
  }

  return message === "unsupported_extension" ||
    message === "file_too_large" ||
    message === "converter_unavailable" ||
    message === "missing_markdown_content" ||
    message === "resource_status_not_chunkable"
    ? message
    : "redacted_indexing_error";
}

function matchesLocalResourceQuery(
  resourceSummary: AdminResourceOpsSummaryDto,
  query: AdminContentKnowledgeListQuery,
) {
  const searchableText = [
    resourceSummary.publicId,
    resourceSummary.title,
    resourceSummary.originalFileName,
    resourceSummary.resourceStatus,
    resourceSummary.resourceType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    (query.keyword === null ||
      searchableText.includes(query.keyword.toLowerCase())) &&
    (query.status === "all" ||
      resourceSummary.resourceStatus === query.status) &&
    (query.profession === "all" ||
      resourceSummary.profession === query.profession) &&
    (query.level === null || resourceSummary.level === query.level)
  );
}

function createLocalUploadSummary(
  parseSummary: LocalTextDocumentEvidenceSummary | null,
  skippedReason: string | null,
): LocalResourceUploadSummary {
  return {
    parserMode: "local_only",
    markdownContentHash: parseSummary?.markdownContentHash ?? null,
    charLength: parseSummary?.charLength ?? 0,
    lineCount: parseSummary?.lineCount ?? 0,
    chunkCandidateCount: parseSummary?.chunkCandidateCount ?? 0,
    headingPaths: parseSummary?.headingPaths ?? [],
    redactedPreview: parseSummary?.redactedPreview ?? null,
    skippedReason,
  };
}

function createDefaultRepositories(): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  const adminFlowRepositories = createPostgresAdminFlowRuntimeRepositories();

  return {
    ...createPostgresRagResourceKnowledgeRuntimeRepositories(),
    auditLogRepository: adminFlowRepositories.auditLogRepository,
  };
}

async function appendAuditLog(
  repository: RagResourceKnowledgeAuditLogRepository,
  request: Request,
  actor: ContentAdminActor,
  input: Omit<AppendAuditLogInput, "actorPublicId" | "actorRole" | "requestIp">,
): Promise<void> {
  await repository.appendAuditLog({
    actorPublicId: actor.publicId,
    actorRole: actor.roles[0],
    requestIp: readRequestIp(request),
    ...input,
  });
}

function createResourceVectorResult(
  resourcePublicId: string,
  resourceStatus: ResourceVectorRebuildResultDto["resourceVector"]["resourceStatus"],
  chunkingResult: ReturnType<typeof buildResourceChunks>,
): ResourceVectorRebuildResultDto {
  return {
    resourceVector: {
      resourcePublicId,
      resourceStatus,
      chunkCount: chunkingResult.chunks.length,
      evidenceSummary: chunkingResult.evidenceSummary,
    },
  };
}

function createLocalVectorChunkSnapshot(
  chunkingResult: ReturnType<typeof buildResourceChunks>,
): LocalResourceVectorChunkSnapshot[] {
  return chunkingResult.chunks.map((chunk) => ({
    chunkPublicId: chunk.chunkPublicId,
    resourcePublicId: chunk.resourcePublicId,
    resourceTitle: chunk.resourceTitle,
    profession: chunk.profession,
    level: chunk.level,
    headingPath: [...chunk.headingPath],
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    textHash: chunk.textHash,
  }));
}

async function rebuildResourceVector(input: {
  localResourceStorageRoot: string;
  resourceRepository: RagResourceRuntimeRepository;
  publicId: string;
}): Promise<ApiResponse<ResourceVectorRebuildResultDto | null>> {
  const resourceForIndexing =
    await input.resourceRepository.findResourceForIndexing(input.publicId);

  if (resourceForIndexing === null) {
    return rebuildLocalResourceVector({
      publicId: input.publicId,
      storageRoot: input.localResourceStorageRoot,
    });
  }

  const chunkingResult = buildResourceChunks({
    resourcePublicId: resourceForIndexing.publicId,
    resourceTitle: resourceForIndexing.title,
    resourceStatus: resourceForIndexing.resourceStatus,
    profession: resourceForIndexing.profession,
    level: resourceForIndexing.level,
    markdownContent: resourceForIndexing.markdownContent,
    markdownContentHash: resourceForIndexing.markdownContentHash,
  });

  if (chunkingResult.status === "skipped") {
    await input.resourceRepository.saveResourceIndexingResult({
      resourcePublicId: input.publicId,
      status: "failed",
      chunkCount: 0,
      textHashes: [],
      indexingErrorMessage: chunkingResult.skippedReason,
    });

    return createErrorResponse(
      ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
      "Resource is not ready for vector rebuild.",
    );
  }

  await input.resourceRepository.markResourceIndexingStarted(input.publicId);

  const savedResource =
    await input.resourceRepository.saveResourceIndexingResult({
      resourcePublicId: input.publicId,
      status: "success",
      chunkCount: chunkingResult.chunks.length,
      textHashes: chunkingResult.chunks.map((chunk) => chunk.textHash),
      indexingErrorMessage: null,
    });

  return createSuccessResponse(
    createResourceVectorResult(
      resourceForIndexing.publicId,
      savedResource?.resourceStatus ?? "rag_ready",
      chunkingResult,
    ),
  );
}

async function publishResourceMarkdown(input: {
  localResourceStorageRoot: string;
  resourceRepository: RagResourceRuntimeRepository;
  publicId: string;
}): Promise<ApiResponse<{ resource: AdminResourceOpsSummaryDto } | null>> {
  const publishResult = await input.resourceRepository.publishResourceMarkdown(
    input.publicId,
  );

  if (publishResult.status === "not_found") {
    return publishLocalResourceMarkdown({
      publicId: input.publicId,
      storageRoot: input.localResourceStorageRoot,
    });
  }

  if (publishResult.status === "conflict") {
    void publishResult.currentStatus;
    void publishResult.reason;
    return resourcePublishConflictResponse;
  }

  return createSuccessResponse({ resource: publishResult.resource });
}

async function uploadLocalResource(input: {
  request: Request;
  storageRoot: string;
}): Promise<
  ApiResponse<{
    resource: AdminResourceOpsSummaryDto;
    localResource: LocalResourceUploadSummary;
  } | null>
> {
  const formData = await input.request.formData();
  const fileValue = formData.get("file");
  const professionValue = formData.get("profession");
  const resourceTypeValue = formData.get("resourceType");
  const title = normalizeLocalResourceTitle(formData.get("title"));

  if (
    !isUploadFile(fileValue) ||
    !isProfession(professionValue) ||
    !isResourceType(resourceTypeValue)
  ) {
    return validationFailedResponse;
  }

  const uploadedAt = new Date();
  const storedResource = await storeLocalResourceFile({
    file: fileValue,
    fileName:
      typeof formData.get("fileName") === "string"
        ? (formData.get("fileName") as string)
        : undefined,
    profession: professionValue,
    resourceType: resourceTypeValue,
    storageRoot: input.storageRoot,
    uploadedAt,
  });
  const parseResult = await parseLocalTextDocumentAsset({
    fileName: storedResource.fileName,
    objectKey: storedResource.objectKey,
    storageRoot: input.storageRoot,
    maxFileSizeByte: localResourceMaxFileSizeByte,
  });
  const now = uploadedAt.toISOString();
  const publicId = createLocalResourcePublicId(storedResource);
  const catalog = await readLocalResourceCatalog(input.storageRoot);
  const parsedResource = parseResult.status === "parsed" ? parseResult : null;
  const entry: LocalResourceCatalogEntry = {
    publicId,
    title: title ?? storedResource.fileName.replace(/\.[^.]+$/u, ""),
    resourceType: storedResource.resourceType,
    resourceStatus: parsedResource === null ? "conversion_failed" : "draft",
    profession: storedResource.profession,
    level: parseLocalResourceLevel(formData.get("level")),
    originalFileName: storedResource.fileName,
    objectKey: storedResource.objectKey,
    contentType: storedResource.contentType,
    fileSizeByte: storedResource.fileSizeByte,
    fileHash: storedResource.fileHash,
    markdownContent: parsedResource?.markdownContent ?? null,
    markdownContentHash: parsedResource?.markdownContentHash ?? null,
    indexingErrorMessage:
      parseResult.status === "skipped" ? parseResult.skippedReason : null,
    isVectorStale: false,
    publishedAt: null,
    uploadedAt: now,
    updatedAt: now,
    disabledFromStatus: null,
    chunkCount: 0,
    textHashes: [],
    headingPaths: parsedResource?.headingPaths ?? [],
    knowledgeNodePublicIds: parseLocalResourceKnowledgeNodePublicIds(formData),
    activeMarkdownContentHash: null,
    activeChunkSnapshot: [],
  };
  const nextCatalog = {
    resources: [
      entry,
      ...catalog.resources.filter((resource) => resource.publicId !== publicId),
    ],
  };

  await writeLocalResourceCatalog(input.storageRoot, nextCatalog);

  return createSuccessResponse({
    resource: mapLocalResourceEntry(entry),
    localResource: createLocalUploadSummary(
      parsedResource?.evidenceSummary ?? null,
      parseResult.status === "skipped" ? parseResult.skippedReason : null,
    ),
  });
}

async function findLocalResource(input: {
  publicId: string;
  storageRoot: string;
}): Promise<LocalResourceCatalogEntry | null> {
  const catalog = await readLocalResourceCatalog(input.storageRoot);

  return (
    catalog.resources.find(
      (resource) => resource.publicId === input.publicId,
    ) ?? null
  );
}

async function saveLocalResource(input: {
  resource: LocalResourceCatalogEntry;
  storageRoot: string;
}) {
  const catalog = await readLocalResourceCatalog(input.storageRoot);

  await writeLocalResourceCatalog(input.storageRoot, {
    resources: catalog.resources.map((resource) =>
      resource.publicId === input.resource.publicId ? input.resource : resource,
    ),
  });
}

async function getLocalResourceDetail(input: {
  publicId: string;
  storageRoot: string;
}): Promise<ApiResponse<LocalResourceDetailDto | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  return createSuccessResponse({
    resource: mapLocalResourceEntry(resource),
    localOnly: true,
    markdownContent: resource.markdownContent,
  });
}

async function updateLocalResourceMarkdown(input: {
  publicId: string;
  request: Request;
  storageRoot: string;
}): Promise<ApiResponse<{ resource: AdminResourceOpsSummaryDto } | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  const requestBody = await readRequestJson(input.request);

  if (
    typeof requestBody !== "object" ||
    requestBody === null ||
    typeof (requestBody as { markdownContent?: unknown }).markdownContent !==
      "string"
  ) {
    return validationFailedResponse;
  }

  const markdownContent = (
    requestBody as { markdownContent: string }
  ).markdownContent.trim();

  if (markdownContent.length === 0) {
    return validationFailedResponse;
  }

  const markdownContentHash = createMarkdownContentHash(markdownContent);
  const now = new Date().toISOString();
  const hasActiveChunkSnapshot = resource.activeChunkSnapshot.length > 0;
  const nextResource: LocalResourceCatalogEntry = {
    ...resource,
    resourceStatus:
      resource.resourceStatus === "disabled"
        ? "disabled"
        : resource.resourceStatus === "rag_ready" && hasActiveChunkSnapshot
          ? "rag_ready"
          : "draft",
    markdownContent,
    markdownContentHash,
    indexingErrorMessage: null,
    isVectorStale:
      resource.isVectorStale ||
      (resource.resourceStatus === "rag_ready" && hasActiveChunkSnapshot),
    updatedAt: now,
    headingPaths: markdownContent
      .split("\n")
      .filter((line) => line.startsWith("#"))
      .map((line) => [line.replace(/^#+\s*/u, "").trim()]),
  };

  await saveLocalResource({
    resource: nextResource,
    storageRoot: input.storageRoot,
  });

  return createSuccessResponse({
    resource: mapLocalResourceEntry(nextResource),
  });
}

async function publishLocalResourceMarkdown(input: {
  publicId: string;
  storageRoot: string;
}): Promise<ApiResponse<{ resource: AdminResourceOpsSummaryDto } | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  if (
    resource.markdownContent === null ||
    resource.markdownContentHash === null
  ) {
    return resourcePublishConflictResponse;
  }

  if (!canTransitionResourceStatus(resource.resourceStatus, "published")) {
    return resourcePublishConflictResponse;
  }

  const now = new Date().toISOString();
  const nextResource: LocalResourceCatalogEntry = {
    ...resource,
    resourceStatus: "published",
    indexingErrorMessage: null,
    isVectorStale: true,
    publishedAt: now,
    updatedAt: now,
  };

  await saveLocalResource({
    resource: nextResource,
    storageRoot: input.storageRoot,
  });

  return createSuccessResponse({
    resource: mapLocalResourceEntry(nextResource),
  });
}

async function rebuildLocalResourceVector(input: {
  publicId: string;
  storageRoot: string;
}): Promise<ApiResponse<ResourceVectorRebuildResultDto | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  const chunkingResult = buildResourceChunks({
    resourcePublicId: resource.publicId,
    resourceTitle: resource.title,
    resourceStatus: resource.resourceStatus,
    profession: resource.profession,
    level: resource.level,
    markdownContent: resource.markdownContent,
    markdownContentHash: resource.markdownContentHash,
  });

  const now = new Date().toISOString();

  if (chunkingResult.status === "skipped") {
    const hasActiveChunkSnapshot = resource.activeChunkSnapshot.length > 0;
    const failedResource: LocalResourceCatalogEntry = {
      ...resource,
      resourceStatus: hasActiveChunkSnapshot ? "rag_ready" : "index_failed",
      indexingErrorMessage: chunkingResult.skippedReason,
      isVectorStale: hasActiveChunkSnapshot,
      updatedAt: now,
    };

    await saveLocalResource({
      resource: failedResource,
      storageRoot: input.storageRoot,
    });

    return createErrorResponse(
      ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
      "Resource is not ready for vector rebuild.",
    );
  }

  const readyResource: LocalResourceCatalogEntry = {
    ...resource,
    resourceStatus: "rag_ready",
    indexingErrorMessage: null,
    isVectorStale: false,
    updatedAt: now,
    chunkCount: chunkingResult.chunks.length,
    textHashes: chunkingResult.chunks.map((chunk) => chunk.textHash),
    headingPaths: chunkingResult.evidenceSummary.headingPaths,
    activeMarkdownContentHash: resource.markdownContentHash,
    activeChunkSnapshot: createLocalVectorChunkSnapshot(chunkingResult),
  };

  await saveLocalResource({
    resource: readyResource,
    storageRoot: input.storageRoot,
  });

  return createSuccessResponse(
    createResourceVectorResult(
      readyResource.publicId,
      readyResource.resourceStatus,
      chunkingResult,
    ),
  );
}

async function disableLocalResource(input: {
  publicId: string;
  storageRoot: string;
}): Promise<ApiResponse<{ resource: AdminResourceOpsSummaryDto } | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  const now = new Date().toISOString();
  const nextResource: LocalResourceCatalogEntry = {
    ...resource,
    resourceStatus: "disabled",
    disabledFromStatus:
      resource.resourceStatus === "disabled"
        ? resource.disabledFromStatus
        : resource.resourceStatus,
    updatedAt: now,
  };

  await saveLocalResource({
    resource: nextResource,
    storageRoot: input.storageRoot,
  });

  return createSuccessResponse({
    resource: mapLocalResourceEntry(nextResource),
  });
}

function canRestoreLocalResource(resource: LocalResourceCatalogEntry) {
  const targetStatus = resource.disabledFromStatus;

  if (
    resource.resourceStatus !== "disabled" ||
    targetStatus === null ||
    !canTransitionResourceStatus("disabled", targetStatus)
  ) {
    return false;
  }

  if (targetStatus === "published") {
    return (
      resource.markdownContent !== null && resource.markdownContentHash !== null
    );
  }

  return (
    resource.markdownContent !== null &&
    resource.markdownContentHash !== null &&
    resource.chunkCount > 0 &&
    resource.textHashes.length > 0
  );
}

async function enableLocalResource(input: {
  publicId: string;
  storageRoot: string;
}): Promise<ApiResponse<{ resource: AdminResourceOpsSummaryDto } | null>> {
  const resource = await findLocalResource(input);

  if (resource === null) {
    return resourceNotFoundResponse;
  }

  const restoredStatus = resource.disabledFromStatus;

  if (restoredStatus === null || !canRestoreLocalResource(resource)) {
    return resourceEnableConflictResponse;
  }

  const now = new Date().toISOString();
  const nextResource: LocalResourceCatalogEntry = {
    ...resource,
    resourceStatus: restoredStatus,
    disabledFromStatus: null,
    updatedAt: now,
  };

  await saveLocalResource({
    resource: nextResource,
    storageRoot: input.storageRoot,
  });

  return createSuccessResponse({
    resource: mapLocalResourceEntry(nextResource),
  });
}

export async function buildLocalResourceRagRetrievalResult({
  authorizedResourcePublicIds,
  knowledgeNodePublicIds,
  level,
  profession,
  query,
  storageRoot = defaultLocalUploadStorageRoot,
}: LocalResourceRagRetrievalInput): Promise<RagRetrievalResultDto> {
  const catalog = await readLocalResourceCatalog(storageRoot);
  const knowledgeNodePublicIdScope = new Set(knowledgeNodePublicIds ?? []);
  const eligibleResources = catalog.resources.filter(
    (resource) =>
      resource.resourceStatus === "rag_ready" &&
      (resource.activeChunkSnapshot.length > 0 ||
        (resource.markdownContent !== null &&
          resource.markdownContentHash !== null)) &&
      resource.profession === profession &&
      (level === null || resource.level === null || resource.level === level) &&
      matchesLocalResourceKnowledgeNodeScope(
        resource,
        knowledgeNodePublicIdScope,
      ),
  );
  const authorizedPublicIds =
    authorizedResourcePublicIds ??
    eligibleResources.map((resource) => resource.publicId);
  const chunks = eligibleResources.flatMap((resource) =>
    createLocalRetrievalChunks(resource),
  );

  return buildRagRetrievalContextFromChunks({
    query,
    profession,
    level,
    authorizedResourcePublicIds: authorizedPublicIds,
    chunks,
  });
}

function matchesLocalResourceKnowledgeNodeScope(
  resource: LocalResourceCatalogEntry,
  knowledgeNodePublicIdScope: ReadonlySet<string>,
) {
  if (knowledgeNodePublicIdScope.size === 0) {
    return true;
  }

  return resource.knowledgeNodePublicIds.some((knowledgeNodePublicId) =>
    knowledgeNodePublicIdScope.has(knowledgeNodePublicId),
  );
}

function createLocalRetrievalChunks(resource: LocalResourceCatalogEntry) {
  const isStale = resource.isVectorStale;

  if (resource.activeChunkSnapshot.length > 0) {
    return resource.activeChunkSnapshot.map((chunk) => ({
      ...chunk,
      resourceStatus: resource.resourceStatus,
      isStale,
    }));
  }

  const chunkingResult = buildResourceChunks({
    resourcePublicId: resource.publicId,
    resourceTitle: resource.title,
    resourceStatus: resource.resourceStatus,
    profession: resource.profession,
    level: resource.level,
    markdownContent: resource.markdownContent,
    markdownContentHash: resource.markdownContentHash,
  });

  return chunkingResult.status === "chunked"
    ? chunkingResult.chunks.map((chunk) => ({
        ...chunk,
        resourceStatus: resource.resourceStatus,
        isStale,
      }))
    : [];
}

function mapKnowledgeNodeResult(
  knowledgeNode: Awaited<
    ReturnType<RagKnowledgeNodeRuntimeRepository["createKnowledgeNode"]>
  >,
): { knowledgeNode: AdminKnowledgeNodeOpsSummaryDto } | null {
  return knowledgeNode === null ? null : { knowledgeNode };
}

export function createRagResourceKnowledgeRuntimeRouteHandlers(
  options: RagResourceKnowledgeRuntimeOptions = {},
) {
  const repositories = options.repositories ?? createDefaultRepositories();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const localResourceStorageRoot =
    options.localResourceStorageRoot ?? defaultLocalUploadStorageRoot;

  async function requireContentAdminActor(
    request: Request,
    auditInput?: Pick<
      AppendAuditLogInput,
      "actionType" | "targetResourceType" | "targetPublicId"
    >,
  ): Promise<ContentAdminActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageContent(actor)) {
      if (auditInput !== undefined) {
        await appendAuditLog(repositories.auditLogRepository, request, actor, {
          ...auditInput,
          resultStatus: "failed",
          metadataSummary: "redacted RAG permission denial metadata",
        });
      }

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  return createRouteHandlersWithErrorEnvelope({
    resources: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          void actorOrError;
          const listQuery = readListQuery(request);
          const [result, localCatalog] = await Promise.all([
            repositories.resourceRepository.listResources(listQuery),
            readLocalResourceCatalog(localResourceStorageRoot),
          ]);
          const localResources = localCatalog.resources
            .map(mapLocalResourceEntry)
            .filter((resource) =>
              matchesLocalResourceQuery(resource, listQuery),
            );
          const resources = [...localResources, ...result.resources];

          return createJsonResponse(
            createPaginatedResponse(
              { resources },
              {
                ...result.pagination,
                total: result.pagination.total + localResources.length,
              },
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.upload",
            targetResourceType: "resource",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await uploadLocalResource({
            request,
            storageRoot: localResourceStorageRoot,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.upload",
              targetResourceType: "resource",
              targetPublicId: response.data?.resource.publicId ?? null,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted local resource upload metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      detail: {
        async GET(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          void actorOrError;

          return createJsonResponse(
            await getLocalResourceDetail({
              publicId,
              storageRoot: localResourceStorageRoot,
            }),
          );
        },
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.update_markdown",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await updateLocalResourceMarkdown({
            publicId,
            request,
            storageRoot: localResourceStorageRoot,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.update_markdown",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted local resource markdown metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      publish: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.publish_markdown",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await publishResourceMarkdown({
            localResourceStorageRoot,
            resourceRepository: repositories.resourceRepository,
            publicId,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.publish_markdown",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted resource publish metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      rebuildVector: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.rebuild_vector",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await rebuildResourceVector({
            localResourceStorageRoot,
            resourceRepository: repositories.resourceRepository,
            publicId,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.rebuild_vector",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted resource vector rebuild metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.disable",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await disableLocalResource({
            publicId,
            storageRoot: localResourceStorageRoot,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.disable",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted local resource disable metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.enable",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await enableLocalResource({
            publicId,
            storageRoot: localResourceStorageRoot,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.enable",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted local resource enable metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
    },
    knowledgeNodes: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          void actorOrError;
          const result =
            await repositories.knowledgeNodeRepository.listKnowledgeNodes(
              readListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { knowledgeNodes: result.knowledgeNodes },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.create",
            targetResourceType: "knowledge_node",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const mutationInput = parseKnowledgeNodeMutationInput(
            await readRequestJson(request),
          );

          if (mutationInput === null) {
            return createJsonResponse(validationFailedResponse);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.createKnowledgeNode(
              mutationInput,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.create",
              targetResourceType: "knowledge_node",
              targetPublicId: knowledgeNode?.publicId ?? null,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node create metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      detail: {
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.update",
            targetResourceType: "knowledge_node",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const mutationInput = parseKnowledgeNodeUpdateInput(
            await readRequestJson(request),
          );

          if (mutationInput === null) {
            return createJsonResponse(validationFailedResponse);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.updateKnowledgeNode(
              publicId,
              mutationInput,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.update",
              targetResourceType: "knowledge_node",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node update metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.disable",
            targetResourceType: "knowledge_node",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.disableKnowledgeNode(
              publicId,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.disable",
              targetResourceType: "knowledge_node",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node disable metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
    },
  });
}
