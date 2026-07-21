import { createHash, randomUUID } from "node:crypto";
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
import {
  canRequestResourceIndexRebuild,
  canTransitionResourceStatus,
  isResourceLevelEligible,
  normalizeResourceLevelList,
  type ResourceLevelList,
  type ResourceStatus,
  type ResourceType,
} from "../models/ai-rag";
import type { Profession } from "../models/auth";
import type { Subject } from "../models/paper";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresRagResourceKnowledgeRuntimeRepositories,
  type KnowledgeNodeMutationContext,
  type RagKnowledgeNodeRuntimeRepository,
  type RagResourceKnowledgeRuntimeRepositories,
  type RagResourceRuntimeRepository,
  type ResourceMutationContext,
} from "../repositories/rag-resource-knowledge-runtime-repository";
import {
  parseKnowledgeNodeMutationInput,
  parseKnowledgeNodeUpdateInput,
} from "../validators/rag-resource-knowledge";
import {
  defaultLocalUploadStorageRoot,
  prepareLocalResourceFile,
  storePreparedLocalResourceFile,
  type StoredLocalResourceMetadata,
} from "./local-paper-asset-storage";
import {
  parseLocalTextDocumentAsset,
  type LocalTextDocumentEvidenceSummary,
} from "./local-text-document-parser";
import { buildResourceChunks } from "./rag-chunking-service";
import {
  buildRagRetrievalContextFromChunks,
  buildRagRetrievalContextFromPersistedChunks,
} from "./rag-retrieval-service";
import type { SessionService } from "./session-service";
import {
  createRouteHandlersWithErrorEnvelope,
  UNEXPECTED_RUNTIME_ERROR_CODE,
  UNEXPECTED_RUNTIME_ERROR_MESSAGE,
} from "./route-error-response";

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
  useLocalResourceAdapter?: boolean;
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
  levelList: ResourceLevelList;
  subject: Subject | null;
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
  knowledgeNodeAncestorPublicIds: string[];
  activeMarkdownContentHash: string | null;
  activeChunkSnapshot: LocalResourceVectorChunkSnapshot[];
};

type LocalResourceVectorChunkSnapshot = {
  chunkPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  profession: Profession;
  level: number | null;
  levelList: ResourceLevelList;
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
  subject?: Subject | null;
  authorizedResourcePublicIds?: string[];
  knowledgeNodePublicIds?: string[];
  includeDescendants?: boolean;
};

export type ResourceRagRetrievalInput = Omit<
  LocalResourceRagRetrievalInput,
  "storageRoot"
> & {
  queryEmbedding?: number[] | null;
  resourceRepository?: RagResourceRuntimeRepository;
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

function readResourceIndexRequestPublicId(request: Request): string {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  return idempotencyKey !== undefined &&
    idempotencyKey.length > 0 &&
    idempotencyKey.length <= 128
    ? idempotencyKey
    : `resource-index-request-${randomUUID()}`;
}

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function readResourceUploadIdempotencyKey(request: Request): string | null {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  return idempotencyKey !== undefined && uuidV4Pattern.test(idempotencyKey)
    ? idempotencyKey.toLowerCase()
    : null;
}

function createSha256Digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
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
  const levelValue = searchParams.get("level");
  const level = Number(levelValue);
  const sortBy = searchParams.get("sortBy");

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (pageSize === 50 || pageSize === 100
      ? pageSize
      : 20) as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
    status: parseContentKnowledgeStatus(searchParams.get("status")),
    profession: parseProfessionFilter(searchParams.get("profession")),
    resourceType: parseResourceTypeFilter(searchParams.get("resourceType")),
    level: Number.isFinite(level) && level > 0 ? level : null,
    resourceLevel:
      levelValue === "general"
        ? "general"
        : Number.isFinite(level) && level > 0
          ? level
          : null,
    sortBy: ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS.includes(
      sortBy as AdminContentKnowledgeSortField,
    )
      ? (sortBy as AdminContentKnowledgeSortField)
      : "updatedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  });
}

function parseResourceTypeFilter(value: string | null): ResourceType | "all" {
  return isResourceType(value) ? value : "all";
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
  const levelList = normalizeStoredResourceLevelList(
    entry.levelList,
    entry.level,
  );

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
    level: levelList?.length === 1 ? levelList[0] : null,
    levelList,
    subject: isSubject(entry.subject) ? entry.subject : null,
    knowledgeNodePublicIds: normalizeStringArray(entry.knowledgeNodePublicIds),
    knowledgeNodeAncestorPublicIds: normalizeStringArray(
      entry.knowledgeNodeAncestorPublicIds,
    ),
    activeMarkdownContentHash:
      typeof entry.activeMarkdownContentHash === "string"
        ? entry.activeMarkdownContentHash
        : null,
    activeChunkSnapshot: Array.isArray(entry.activeChunkSnapshot)
      ? entry.activeChunkSnapshot
          .map(normalizeLocalResourceVectorChunkSnapshot)
          .filter(
            (chunk): chunk is LocalResourceVectorChunkSnapshot =>
              chunk !== null,
          )
      : [],
  } as LocalResourceCatalogEntry;
}

function normalizeLocalResourceVectorChunkSnapshot(
  value: unknown,
): LocalResourceVectorChunkSnapshot | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const chunk = value as Partial<LocalResourceVectorChunkSnapshot>;

  if (
    !(
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
    )
  ) {
    return null;
  }

  const levelList = normalizeStoredResourceLevelList(
    chunk.levelList,
    chunk.level,
  );

  return {
    ...(chunk as LocalResourceVectorChunkSnapshot),
    level: levelList?.length === 1 ? levelList[0] : null,
    levelList,
  };
}

function normalizeStoredResourceLevelList(
  levelList: unknown,
  legacyLevel: unknown,
): ResourceLevelList {
  if (Array.isArray(levelList)) {
    if (
      !levelList.every(
        (level) =>
          typeof level === "number" &&
          Number.isInteger(level) &&
          level >= 1 &&
          level <= 5,
      )
    ) {
      return null;
    }

    try {
      return normalizeResourceLevelList(levelList as number[]);
    } catch {
      return null;
    }
  }

  return typeof legacyLevel === "number" &&
    Number.isInteger(legacyLevel) &&
    legacyLevel >= 1 &&
    legacyLevel <= 5
    ? [legacyLevel]
    : null;
}

function isProfession(value: unknown): value is Profession {
  return value === "monopoly" || value === "marketing" || value === "logistics";
}

function isSubject(value: unknown): value is Subject {
  return value === "theory" || value === "skill";
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

function parseLocalResourceLevelList(formData: FormData): number[] | null {
  const coverageMode = formData.get("coverageMode");
  const rawLevelList = formData.getAll("levelList");
  const legacyLevel = formData.get("level");
  const hasLegacyLevel =
    typeof legacyLevel === "string" && legacyLevel.trim().length > 0;

  if (
    coverageMode === "profession_general" &&
    rawLevelList.length === 0 &&
    !hasLegacyLevel
  ) {
    return [];
  }

  const specifiedLevelList = rawLevelList.flatMap((value) => {
    if (typeof value !== "string" || !/^\d+$/u.test(value.trim())) {
      return [];
    }

    const level = Number(value);
    return Number.isInteger(level) && level >= 1 && level <= 5 ? [level] : [];
  });

  if (
    coverageMode === "specified_levels" &&
    !hasLegacyLevel &&
    specifiedLevelList.length === rawLevelList.length &&
    specifiedLevelList.length > 0
  ) {
    return normalizeResourceLevelList(specifiedLevelList);
  }

  if (
    coverageMode === null &&
    typeof legacyLevel === "string" &&
    /^\d+$/u.test(legacyLevel.trim())
  ) {
    const level = Number(legacyLevel);
    return Number.isInteger(level) && level >= 1 && level <= 5 ? [level] : null;
  }

  return null;
}

function toLegacySingletonLevel(levelList: ResourceLevelList) {
  if (levelList === null || levelList.length !== 1) {
    return null;
  }

  return levelList[0];
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

function createResourceUploadRequestFingerprint(input: {
  fileHash: string;
  fileSizeByte: number;
  fileName: string;
  profession: Profession;
  resourceType: ResourceType;
  title: string | null;
  levelList: number[];
  knowledgeNodePublicIds: string[];
}): string {
  return createSha256Digest(
    JSON.stringify({
      fileHash: input.fileHash,
      fileSizeByte: input.fileSizeByte,
      fileName: input.fileName,
      profession: input.profession,
      resourceType: input.resourceType,
      title: input.title,
      levelList: [...input.levelList].sort((left, right) => left - right),
      knowledgeNodePublicIds: [...input.knowledgeNodePublicIds].sort(),
    }),
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
    levelList: entry.levelList === null ? null : [...entry.levelList],
    knowledgeNodePublicIds: [...entry.knowledgeNodePublicIds],
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
    (query.resourceType === "all" ||
      resourceSummary.resourceType === query.resourceType) &&
    (query.resourceLevel === null ||
      (query.resourceLevel === "general"
        ? resourceSummary.levelList?.length === 0
        : resourceSummary.levelList?.includes(query.resourceLevel) === true))
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

function createKnowledgeNodeMutationContext(
  request: Request,
  actor: ContentAdminActor,
  actionType: KnowledgeNodeMutationContext["auditLog"]["actionType"],
  metadataSummary: string,
): KnowledgeNodeMutationContext {
  return {
    actorPublicId: actor.publicId,
    auditLog: {
      actorRole: actor.roles[0],
      actionType,
      metadataSummary,
      requestIp: readRequestIp(request),
    },
  };
}

function createResourceMutationContext(
  request: Request,
  actor: ContentAdminActor,
  actionType: ResourceMutationContext["auditLog"]["actionType"],
  metadataSummary: string,
): ResourceMutationContext {
  return {
    actorPublicId: actor.publicId,
    auditLog: {
      actorRole: actor.roles[0],
      actionType,
      metadataSummary,
      requestIp: readRequestIp(request),
    },
  };
}

type ResourceMutationExecution<TData> = {
  response: ApiResponse<TData>;
  successAuditLocation: "database" | "external";
};

function createResourceVectorResult(
  resourcePublicId: string,
  resourceStatus: ResourceVectorRebuildResultDto["resourceVector"]["resourceStatus"],
  chunkingResult: ReturnType<typeof buildResourceChunks>,
  generationPublicId: string | null,
  requestReplayed: boolean,
): ResourceVectorRebuildResultDto {
  return {
    resourceVector: {
      resourcePublicId,
      resourceStatus,
      generationPublicId,
      requestReplayed,
      chunkCount: chunkingResult.chunks.length,
      evidenceSummary: chunkingResult.evidenceSummary,
    },
  };
}

function createPendingResourceVectorResult(
  resourcePublicId: string,
  resourceStatus: ResourceVectorRebuildResultDto["resourceVector"]["resourceStatus"],
  generationPublicId: string,
  requestReplayed: boolean,
): ResourceVectorRebuildResultDto {
  return {
    resourceVector: {
      resourcePublicId,
      resourceStatus,
      generationPublicId,
      requestReplayed,
      chunkCount: 0,
      evidenceSummary: {
        chunkCount: 0,
        resourcePublicIds: [],
        chunkIndexes: [],
        textHashes: [],
        totalCharLength: 0,
        headingPaths: [],
      },
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
    level: chunk.level ?? toLegacySingletonLevel(chunk.levelList),
    levelList: chunk.levelList === null ? null : [...chunk.levelList],
    headingPath: [...chunk.headingPath],
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    textHash: chunk.textHash,
  }));
}

async function rebuildResourceVector(input: {
  allowLocalResourceAdapter: boolean;
  localResourceStorageRoot: string;
  resourceRepository: RagResourceRuntimeRepository;
  publicId: string;
  requestPublicId: string;
  mutationContext: ResourceMutationContext;
}): Promise<ResourceMutationExecution<ResourceVectorRebuildResultDto | null>> {
  const resourceForIndexing =
    await input.resourceRepository.findResourceForIndexing(input.publicId);

  if (resourceForIndexing === null) {
    return {
      response: input.allowLocalResourceAdapter
        ? await rebuildLocalResourceVector({
            publicId: input.publicId,
            storageRoot: input.localResourceStorageRoot,
          })
        : resourceNotFoundResponse,
      successAuditLocation: "external",
    };
  }

  if (!canRequestResourceIndexRebuild(resourceForIndexing.resourceStatus)) {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
        "Resource status does not allow index rebuild.",
      ),
      successAuditLocation: "external",
    };
  }

  const chunkingResult = buildResourceChunks({
    resourcePublicId: resourceForIndexing.publicId,
    resourceTitle: resourceForIndexing.title,
    resourceStatus: resourceForIndexing.resourceStatus,
    profession: resourceForIndexing.profession,
    level: resourceForIndexing.level,
    levelList:
      resourceForIndexing.levelList !== undefined
        ? resourceForIndexing.levelList
        : typeof resourceForIndexing.level === "number"
          ? [resourceForIndexing.level]
          : null,
    markdownContent: resourceForIndexing.markdownContent,
    markdownContentHash: resourceForIndexing.markdownContentHash,
  });

  if (chunkingResult.status === "skipped") {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
        "Resource is not ready for vector rebuild.",
      ),
      successAuditLocation: "external",
    };
  }

  if (input.resourceRepository.requestResourceIndexRebuild === undefined) {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
        "Durable resource index generation is unavailable.",
      ),
      successAuditLocation: "external",
    };
  }

  const generationRequest =
    await input.resourceRepository.requestResourceIndexRebuild(
      input.publicId,
      input.requestPublicId,
      input.mutationContext,
    );

  if (generationRequest.status === "not_found") {
    return {
      response: resourceNotFoundResponse,
      successAuditLocation: "external",
    };
  }

  if (generationRequest.status === "conflict") {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
        "Resource index generation request conflicts with current state.",
      ),
      successAuditLocation: "external",
    };
  }

  return {
    response: createSuccessResponse(
      createPendingResourceVectorResult(
        resourceForIndexing.publicId,
        generationRequest.resourceStatus,
        generationRequest.generationPublicId,
        generationRequest.replayed,
      ),
    ),
    successAuditLocation: "database",
  };
}

async function publishResourceMarkdown(input: {
  allowLocalResourceAdapter: boolean;
  localResourceStorageRoot: string;
  resourceRepository: RagResourceRuntimeRepository;
  publicId: string;
  mutationContext: ResourceMutationContext;
}): Promise<
  ResourceMutationExecution<{ resource: AdminResourceOpsSummaryDto } | null>
> {
  const publishResult = await input.resourceRepository.publishResourceMarkdown(
    input.publicId,
    input.mutationContext,
  );

  if (publishResult.status === "not_found") {
    return {
      response: input.allowLocalResourceAdapter
        ? await publishLocalResourceMarkdown({
            publicId: input.publicId,
            storageRoot: input.localResourceStorageRoot,
          })
        : resourceNotFoundResponse,
      successAuditLocation: "external",
    };
  }

  if (publishResult.status === "conflict") {
    void publishResult.currentStatus;
    void publishResult.reason;
    return {
      response: resourcePublishConflictResponse,
      successAuditLocation: "external",
    };
  }

  return {
    response: createSuccessResponse({ resource: publishResult.resource }),
    successAuditLocation: "database",
  };
}

async function getResourceDetail(input: {
  allowLocalResourceAdapter: boolean;
  publicId: string;
  resourceRepository: RagResourceRuntimeRepository;
  storageRoot: string;
}): Promise<ApiResponse<LocalResourceDetailDto | null>> {
  if (input.resourceRepository.findResourceDetail !== undefined) {
    const detail = await input.resourceRepository.findResourceDetail(
      input.publicId,
    );

    if (detail !== null) {
      return createSuccessResponse({
        resource: detail.resource,
        localOnly: false,
        markdownContent: detail.markdownContent,
      });
    }
  }

  return input.allowLocalResourceAdapter
    ? getLocalResourceDetail(input)
    : resourceNotFoundResponse;
}

async function updateResourceMarkdown(input: {
  allowLocalResourceAdapter: boolean;
  publicId: string;
  request: Request;
  resourceRepository: RagResourceRuntimeRepository;
  storageRoot: string;
  mutationContext: ResourceMutationContext;
}): Promise<
  ResourceMutationExecution<{ resource: AdminResourceOpsSummaryDto } | null>
> {
  const requestBody = await readRequestJson(input.request);
  const markdownContent =
    typeof requestBody === "object" &&
    requestBody !== null &&
    typeof (requestBody as { markdownContent?: unknown }).markdownContent ===
      "string"
      ? (requestBody as { markdownContent: string }).markdownContent.trim()
      : "";

  if (markdownContent.length === 0) {
    return {
      response: validationFailedResponse,
      successAuditLocation: "external",
    };
  }

  if (input.resourceRepository.updateResourceMarkdown !== undefined) {
    const resourceSummary =
      await input.resourceRepository.updateResourceMarkdown(
        input.publicId,
        markdownContent,
        createMarkdownContentHash(markdownContent),
        input.mutationContext,
      );

    if (resourceSummary !== null) {
      return {
        response: createSuccessResponse({ resource: resourceSummary }),
        successAuditLocation: "database",
      };
    }
  }

  return {
    response: input.allowLocalResourceAdapter
      ? await updateLocalResourceMarkdown({
          publicId: input.publicId,
          request: new Request(input.request.url, {
            method: input.request.method,
            headers: input.request.headers,
            body: JSON.stringify({ markdownContent }),
          }),
          storageRoot: input.storageRoot,
        })
      : resourceNotFoundResponse,
    successAuditLocation: "external",
  };
}

async function disableResource(input: {
  allowLocalResourceAdapter: boolean;
  publicId: string;
  resourceRepository: RagResourceRuntimeRepository;
  storageRoot: string;
  mutationContext: ResourceMutationContext;
}): Promise<
  ResourceMutationExecution<{ resource: AdminResourceOpsSummaryDto } | null>
> {
  if (input.resourceRepository.disableResource !== undefined) {
    const resourceSummary = await input.resourceRepository.disableResource(
      input.publicId,
      input.mutationContext,
    );

    if (resourceSummary !== null) {
      return {
        response: createSuccessResponse({ resource: resourceSummary }),
        successAuditLocation: "database",
      };
    }
  }

  return {
    response: input.allowLocalResourceAdapter
      ? await disableLocalResource(input)
      : resourceNotFoundResponse,
    successAuditLocation: "external",
  };
}

async function enableResource(input: {
  allowLocalResourceAdapter: boolean;
  publicId: string;
  resourceRepository: RagResourceRuntimeRepository;
  storageRoot: string;
  mutationContext: ResourceMutationContext;
}): Promise<
  ResourceMutationExecution<{ resource: AdminResourceOpsSummaryDto } | null>
> {
  if (input.resourceRepository.enableResource !== undefined) {
    const resourceSummary = await input.resourceRepository.enableResource(
      input.publicId,
      input.mutationContext,
    );

    if (resourceSummary !== null) {
      return {
        response: createSuccessResponse({ resource: resourceSummary }),
        successAuditLocation: "database",
      };
    }
  }

  return {
    response: input.allowLocalResourceAdapter
      ? await enableLocalResource(input)
      : resourceEnableConflictResponse,
    successAuditLocation: "external",
  };
}

function createResourceUploadEntry(input: {
  publicId: string;
  title: string | null;
  levelList: number[];
  storedResource: StoredLocalResourceMetadata;
  parseResult: Awaited<ReturnType<typeof parseLocalTextDocumentAsset>>;
  knowledgeNodePublicIds: string[];
  uploadedAt: Date;
}): LocalResourceCatalogEntry {
  const parsedResource =
    input.parseResult.status === "parsed" ? input.parseResult : null;
  const now = input.uploadedAt.toISOString();

  return {
    publicId: input.publicId,
    title:
      input.title ?? input.storedResource.fileName.replace(/\.[^.]+$/u, ""),
    resourceType: input.storedResource.resourceType,
    resourceStatus: parsedResource === null ? "conversion_failed" : "draft",
    profession: input.storedResource.profession,
    level: toLegacySingletonLevel(input.levelList),
    levelList: [...input.levelList],
    subject: null,
    originalFileName: input.storedResource.fileName,
    objectKey: input.storedResource.objectKey,
    contentType: input.storedResource.contentType,
    fileSizeByte: input.storedResource.fileSizeByte,
    fileHash: input.storedResource.fileHash,
    markdownContent: parsedResource?.markdownContent ?? null,
    markdownContentHash: parsedResource?.markdownContentHash ?? null,
    indexingErrorMessage:
      input.parseResult.status === "skipped"
        ? input.parseResult.skippedReason
        : null,
    isVectorStale: false,
    publishedAt: null,
    uploadedAt: now,
    updatedAt: now,
    disabledFromStatus: null,
    chunkCount: 0,
    textHashes: [],
    headingPaths: parsedResource?.headingPaths ?? [],
    knowledgeNodePublicIds: [...input.knowledgeNodePublicIds],
    knowledgeNodeAncestorPublicIds: [],
    activeMarkdownContentHash: null,
    activeChunkSnapshot: [],
  };
}

async function uploadLocalResource(input: {
  allowLocalResourceAdapter: boolean;
  request: Request;
  resourceRepository: RagResourceRuntimeRepository;
  storageRoot: string;
  mutationContext: ResourceMutationContext;
}): Promise<
  ResourceMutationExecution<{
    resource: AdminResourceOpsSummaryDto;
    localResource: LocalResourceUploadSummary;
  } | null>
> {
  const formData = await input.request.formData();
  const fileValue = formData.get("file");
  const professionValue = formData.get("profession");
  const resourceTypeValue = formData.get("resourceType");
  const title = normalizeLocalResourceTitle(formData.get("title"));
  const levelList = parseLocalResourceLevelList(formData);

  if (
    !isUploadFile(fileValue) ||
    !isProfession(professionValue) ||
    !isResourceType(resourceTypeValue) ||
    levelList === null
  ) {
    return {
      response: validationFailedResponse,
      successAuditLocation: "external",
    };
  }

  const idempotencyKey = input.allowLocalResourceAdapter
    ? null
    : readResourceUploadIdempotencyKey(input.request);

  if (!input.allowLocalResourceAdapter && idempotencyKey === null) {
    return {
      response: validationFailedResponse,
      successAuditLocation: "external",
    };
  }

  const uploadedAt = new Date();
  const knowledgeNodePublicIds =
    parseLocalResourceKnowledgeNodePublicIds(formData);
  const preparedFile = await prepareLocalResourceFile({
    file: fileValue,
    fileName:
      typeof formData.get("fileName") === "string"
        ? (formData.get("fileName") as string)
        : undefined,
    profession: professionValue,
    resourceType: resourceTypeValue,
    uploadedAt,
  });

  if (input.allowLocalResourceAdapter) {
    const storedResource = await storePreparedLocalResourceFile({
      preparedFile,
      storageRoot: input.storageRoot,
    });
    const parseResult = await parseLocalTextDocumentAsset({
      fileName: storedResource.fileName,
      objectKey: storedResource.objectKey,
      storageRoot: input.storageRoot,
      maxFileSizeByte: localResourceMaxFileSizeByte,
    });
    const entry = createResourceUploadEntry({
      publicId: createLocalResourcePublicId(storedResource),
      title,
      levelList,
      storedResource,
      parseResult,
      knowledgeNodePublicIds,
      uploadedAt,
    });
    const catalog = await readLocalResourceCatalog(input.storageRoot);
    const nextCatalog = {
      resources: [
        entry,
        ...catalog.resources.filter(
          (resource) => resource.publicId !== entry.publicId,
        ),
      ],
    };

    await writeLocalResourceCatalog(input.storageRoot, nextCatalog);
    return {
      response: createSuccessResponse({
        resource: mapLocalResourceEntry(entry),
        localResource: createLocalUploadSummary(
          parseResult.status === "parsed" ? parseResult.evidenceSummary : null,
          parseResult.status === "skipped" ? parseResult.skippedReason : null,
        ),
      }),
      successAuditLocation: "external",
    };
  }

  if (
    input.resourceRepository.prepareResourceUpload === undefined ||
    input.resourceRepository.markResourceUploadFileStored === undefined ||
    input.resourceRepository.completeResourceUpload === undefined ||
    input.resourceRepository.recordResourceUploadFailure === undefined
  ) {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
        "Durable resource storage is unavailable.",
      ),
      successAuditLocation: "external",
    };
  }

  if (idempotencyKey === null) {
    return {
      response: validationFailedResponse,
      successAuditLocation: "external",
    };
  }

  const idempotencyKeyHash = createSha256Digest(idempotencyKey);
  const requestFingerprint = createResourceUploadRequestFingerprint({
    fileHash: preparedFile.fileHash,
    fileSizeByte: preparedFile.fileSizeByte,
    fileName: preparedFile.fileName,
    profession: professionValue,
    resourceType: resourceTypeValue,
    title,
    levelList,
    knowledgeNodePublicIds,
  });
  let preparation;

  try {
    preparation = await input.resourceRepository.prepareResourceUpload({
      operationPublicId: `resource-upload-operation-${randomUUID()}`,
      resourcePublicId: `resource-${randomUUID()}`,
      actorPublicId: input.mutationContext.actorPublicId,
      idempotencyKeyHash,
      requestFingerprint,
      objectStoragePath: preparedFile.objectKey,
      fileHash: preparedFile.fileHash,
      fileSizeByte: preparedFile.fileSizeByte,
    });
  } catch {
    return {
      response: createErrorResponse(
        UNEXPECTED_RUNTIME_ERROR_CODE,
        UNEXPECTED_RUNTIME_ERROR_MESSAGE,
      ),
      successAuditLocation: "external",
    };
  }

  if (preparation.status === "conflict") {
    return {
      response: createErrorResponse(
        ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
        "Resource upload idempotency conflict.",
      ),
      successAuditLocation: "external",
    };
  }

  if (preparation.status === "completed") {
    return {
      response: createSuccessResponse({
        resource: preparation.resource,
        localResource: createLocalUploadSummary(null, null),
      }),
      successAuditLocation: "database",
    };
  }

  const operation = preparation.operation;

  try {
    const persistedFile = await storePreparedLocalResourceFile({
      preparedFile,
      objectKey: operation.objectStoragePath,
      storageRoot: input.storageRoot,
    });
    const fileStored =
      await input.resourceRepository.markResourceUploadFileStored(
        operation.publicId,
      );

    if (!fileStored) {
      throw new Error("Resource upload operation state changed.");
    }

    const persistedParseResult = await parseLocalTextDocumentAsset({
      fileName: persistedFile.fileName,
      objectKey: persistedFile.objectKey,
      storageRoot: input.storageRoot,
      maxFileSizeByte: localResourceMaxFileSizeByte,
    });
    const persistedParsedResource =
      persistedParseResult.status === "parsed" ? persistedParseResult : null;
    const entry = createResourceUploadEntry({
      publicId: operation.resourcePublicId,
      title,
      levelList,
      storedResource: persistedFile,
      parseResult: persistedParseResult,
      knowledgeNodePublicIds,
      uploadedAt,
    });

    const completion = await input.resourceRepository.completeResourceUpload({
      operationPublicId: operation.publicId,
      requestFingerprint,
      mutationContext: input.mutationContext,
      publicId: entry.publicId,
      resourceType: entry.resourceType,
      resourceStatus:
        entry.resourceStatus === "draft" ? "draft" : "conversion_failed",
      title: entry.title,
      originalFileName: entry.originalFileName,
      objectStoragePath: entry.objectKey,
      contentHash: entry.fileHash,
      fileSizeByte: entry.fileSizeByte,
      profession: entry.profession,
      level: entry.level,
      levelList: entry.levelList,
      markdownContent: entry.markdownContent,
      markdownContentHash: entry.markdownContentHash,
      conversionErrorMessage: entry.indexingErrorMessage,
      knowledgeNodePublicIds: entry.knowledgeNodePublicIds,
    });

    if (completion.status === "invalid_scope") {
      return {
        response: createErrorResponse(
          ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
          "Resource scope validation failed.",
        ),
        successAuditLocation: "external",
      };
    }

    if (completion.status === "conflict") {
      return {
        response: createErrorResponse(
          ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
          "Resource upload operation conflict.",
        ),
        successAuditLocation: "external",
      };
    }

    return {
      response: createSuccessResponse({
        resource: completion.resource,
        localResource: createLocalUploadSummary(
          persistedParsedResource?.evidenceSummary ?? null,
          persistedParseResult.status === "skipped"
            ? persistedParseResult.skippedReason
            : null,
        ),
      }),
      successAuditLocation: "database",
    };
  } catch (error) {
    try {
      await input.resourceRepository.recordResourceUploadFailure({
        operationPublicId: operation.publicId,
        failureMessageDigest: createSha256Digest(
          error instanceof Error ? error.name : "unknown_upload_failure",
        ),
      });
    } catch {
      // The persisted pending/file_stored state remains safely replayable.
    }

    return {
      response: createErrorResponse(
        UNEXPECTED_RUNTIME_ERROR_CODE,
        UNEXPECTED_RUNTIME_ERROR_MESSAGE,
      ),
      successAuditLocation: "external",
    };
  }
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
    levelList: resource.levelList,
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
      null,
      false,
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

export async function buildResourceRagRetrievalResult({
  authorizedResourcePublicIds,
  includeDescendants = false,
  knowledgeNodePublicIds = [],
  level,
  profession,
  query,
  queryEmbedding = null,
  resourceRepository = createPostgresRagResourceKnowledgeRuntimeRepositories()
    .resourceRepository,
}: ResourceRagRetrievalInput): Promise<RagRetrievalResultDto> {
  if (resourceRepository.retrieveResourceChunks === undefined) {
    return buildRagRetrievalContextFromPersistedChunks({
      query,
      profession,
      level,
      authorizedResourcePublicIds: authorizedResourcePublicIds ?? [],
      chunks: [],
      retrievalMode: "keyword_only",
    });
  }

  const chunks = await resourceRepository.retrieveResourceChunks({
    query,
    queryEmbedding,
    profession,
    level,
    authorizedResourcePublicIds: authorizedResourcePublicIds ?? null,
    knowledgeNodePublicIds,
    includeDescendants,
  });
  const authorizedPublicIds = authorizedResourcePublicIds ?? [
    ...new Set(chunks.map((chunk) => chunk.resourcePublicId)),
  ];

  return buildRagRetrievalContextFromPersistedChunks({
    query,
    profession,
    level,
    authorizedResourcePublicIds: authorizedPublicIds,
    chunks,
  });
}

export async function buildLocalResourceRagRetrievalResult({
  authorizedResourcePublicIds,
  includeDescendants = false,
  knowledgeNodePublicIds,
  level,
  profession,
  query,
  subject = null,
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
      isResourceLevelEligible(resource.levelList, level) &&
      matchesLocalResourceSubjectScope(resource, subject) &&
      matchesLocalResourceKnowledgeNodeScope(
        resource,
        knowledgeNodePublicIdScope,
        includeDescendants,
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
  includeDescendants: boolean,
) {
  if (knowledgeNodePublicIdScope.size === 0) {
    return true;
  }

  const resourceKnowledgeNodePublicIds = includeDescendants
    ? [
        ...resource.knowledgeNodePublicIds,
        ...resource.knowledgeNodeAncestorPublicIds,
      ]
    : resource.knowledgeNodePublicIds;

  return resourceKnowledgeNodePublicIds.some((knowledgeNodePublicId) =>
    knowledgeNodePublicIdScope.has(knowledgeNodePublicId),
  );
}

function matchesLocalResourceSubjectScope(
  resource: LocalResourceCatalogEntry,
  subject: Subject | null,
) {
  return (
    subject === null ||
    resource.subject === null ||
    resource.subject === subject
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
    levelList: resource.levelList,
    markdownContent: resource.markdownContent,
    markdownContentHash: resource.markdownContentHash,
  });

  return chunkingResult.status === "chunked"
    ? chunkingResult.chunks.map((chunk) => ({
        ...chunk,
        level: chunk.level ?? toLegacySingletonLevel(chunk.levelList),
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
  const allowLocalResourceAdapter =
    options.useLocalResourceAdapter ??
    options.localResourceStorageRoot !== undefined;
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
          const result = allowLocalResourceAdapter
            ? await listMergedResourcePage({
                localResources: (
                  await readLocalResourceCatalog(localResourceStorageRoot)
                ).resources
                  .map(mapLocalResourceEntry)
                  .filter((resource) =>
                    matchesLocalResourceQuery(resource, listQuery),
                  ),
                query: listQuery,
                repository: repositories.resourceRepository,
              })
            : await repositories.resourceRepository.listResources(listQuery);

          return createJsonResponse(
            createPaginatedResponse(
              { resources: result.resources },
              result.pagination,
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

          const result = await uploadLocalResource({
            allowLocalResourceAdapter,
            request,
            resourceRepository: repositories.resourceRepository,
            storageRoot: localResourceStorageRoot,
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.upload",
              "redacted resource upload metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.upload",
                targetResourceType: "resource",
                targetPublicId: result.response.data?.resource.publicId ?? null,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted resource upload metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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
            await getResourceDetail({
              allowLocalResourceAdapter,
              publicId,
              resourceRepository: repositories.resourceRepository,
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

          const result = await updateResourceMarkdown({
            allowLocalResourceAdapter,
            publicId,
            request,
            resourceRepository: repositories.resourceRepository,
            storageRoot: localResourceStorageRoot,
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.update_markdown",
              "redacted local resource markdown metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.update_markdown",
                targetResourceType: "resource",
                targetPublicId: publicId,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted local resource markdown metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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

          const result = await publishResourceMarkdown({
            allowLocalResourceAdapter,
            localResourceStorageRoot,
            resourceRepository: repositories.resourceRepository,
            publicId,
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.publish_markdown",
              "redacted resource publish metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.publish_markdown",
                targetResourceType: "resource",
                targetPublicId: publicId,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted resource publish metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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

          const result = await rebuildResourceVector({
            allowLocalResourceAdapter,
            localResourceStorageRoot,
            resourceRepository: repositories.resourceRepository,
            publicId,
            requestPublicId: readResourceIndexRequestPublicId(request),
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.rebuild_vector",
              "redacted resource vector rebuild metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.rebuild_vector",
                targetResourceType: "resource",
                targetPublicId: publicId,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted resource vector rebuild metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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

          const result = await disableResource({
            allowLocalResourceAdapter,
            publicId,
            resourceRepository: repositories.resourceRepository,
            storageRoot: localResourceStorageRoot,
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.disable",
              "redacted local resource disable metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.disable",
                targetResourceType: "resource",
                targetPublicId: publicId,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted local resource disable metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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

          const result = await enableResource({
            allowLocalResourceAdapter,
            publicId,
            resourceRepository: repositories.resourceRepository,
            storageRoot: localResourceStorageRoot,
            mutationContext: createResourceMutationContext(
              request,
              actorOrError,
              "resource.enable",
              "redacted local resource enable metadata",
            ),
          });

          if (
            result.response.code !== 0 ||
            result.successAuditLocation === "external"
          ) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "resource.enable",
                targetResourceType: "resource",
                targetPublicId: publicId,
                resultStatus: result.response.code === 0 ? "success" : "failed",
                metadataSummary: "redacted local resource enable metadata",
              },
            );
          }

          return createJsonResponse(result.response);
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
              createKnowledgeNodeMutationContext(
                request,
                actorOrError,
                "knowledge_node.create",
                "redacted knowledge_node create metadata",
              ),
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          if (response.code !== 0) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "knowledge_node.create",
                targetResourceType: "knowledge_node",
                targetPublicId: null,
                resultStatus: "failed",
                metadataSummary: "redacted knowledge_node create metadata",
              },
            );
          }

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
              createKnowledgeNodeMutationContext(
                request,
                actorOrError,
                "knowledge_node.update",
                "redacted knowledge_node update metadata",
              ),
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          if (response.code !== 0) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "knowledge_node.update",
                targetResourceType: "knowledge_node",
                targetPublicId: publicId,
                resultStatus: "failed",
                metadataSummary: "redacted knowledge_node update metadata",
              },
            );
          }

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
              createKnowledgeNodeMutationContext(
                request,
                actorOrError,
                "knowledge_node.disable",
                "redacted knowledge_node disable metadata",
              ),
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          if (response.code !== 0) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "knowledge_node.disable",
                targetResourceType: "knowledge_node",
                targetPublicId: publicId,
                resultStatus: "failed",
                metadataSummary: "redacted knowledge_node disable metadata",
              },
            );
          }

          return createJsonResponse(response);
        },
      },
    },
  });
}

async function listMergedResourcePage({
  localResources,
  query,
  repository,
}: {
  localResources: AdminResourceOpsSummaryDto[];
  query: AdminContentKnowledgeListQuery;
  repository: RagResourceRuntimeRepository;
}) {
  if (localResources.length === 0) {
    return repository.listResources(query);
  }

  const sortedLocalResources = [...localResources].sort((left, right) => {
    const leftValue = readResourceSortValue(left, query.sortBy);
    const rightValue = readResourceSortValue(right, query.sortBy);
    const comparison = leftValue.localeCompare(rightValue);

    return query.sortOrder === "asc" ? comparison : -comparison;
  });
  const pageStart = (query.page - 1) * query.pageSize;
  const pageEnd = pageStart + query.pageSize;
  const localPage = sortedLocalResources.slice(pageStart, pageEnd);
  const databaseStart = Math.max(0, pageStart - sortedLocalResources.length);
  const neededDatabaseRows = query.pageSize - localPage.length;
  const databasePage = Math.floor(databaseStart / query.pageSize) + 1;
  const databaseOffset = databaseStart % query.pageSize;
  const firstDatabaseResult = await repository.listResources({
    ...query,
    page: databasePage,
  });
  let databaseRows = firstDatabaseResult.resources.slice(
    databaseOffset,
    databaseOffset + neededDatabaseRows,
  );

  if (
    databaseRows.length < neededDatabaseRows &&
    databasePage * query.pageSize < firstDatabaseResult.pagination.total
  ) {
    const secondDatabaseResult = await repository.listResources({
      ...query,
      page: databasePage + 1,
    });
    databaseRows = [
      ...databaseRows,
      ...secondDatabaseResult.resources.slice(
        0,
        neededDatabaseRows - databaseRows.length,
      ),
    ];
  }

  return {
    resources: [...localPage, ...databaseRows],
    pagination: {
      ...firstDatabaseResult.pagination,
      page: query.page,
      total: firstDatabaseResult.pagination.total + sortedLocalResources.length,
    },
  };
}

function readResourceSortValue(
  resourceSummary: AdminResourceOpsSummaryDto,
  sortBy: AdminContentKnowledgeSortField,
) {
  if (sortBy === "createdAt") {
    return resourceSummary.uploadedAt;
  }

  if (sortBy === "publishedAt") {
    return resourceSummary.publishedAt ?? "";
  }

  return resourceSummary.updatedAt;
}
