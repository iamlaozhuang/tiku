import { createHash, randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  auditLog,
  knowledgeBase,
  knowledgeNode,
  knowledgeNodeResource,
  modelConfig,
  resource,
  resourceCleanupJob,
  resourceChunk,
  resourceIndexGeneration,
  resourceUploadOperation,
} from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminContentKnowledgeListQuery,
  AdminKnowledgeNodeOpsListDto,
  AdminResourceOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type { ResourceStatus } from "../models/ai-rag";
import {
  assertKnowledgeNodeDepth,
  canRequestResourceIndexRebuild,
  canTransitionResourceStatus,
  maxKnowledgeNodeDepth,
  resolveResourceStatusAfterIndexFailure,
} from "../models/ai-rag";
import type {
  KnowledgeNodeMutationInput,
  KnowledgeNodeUpdateInput,
} from "../validators/rag-resource-knowledge";
import {
  validateKnowledgeNodeParentScope,
  validateResourceKnowledgeNodeScope,
} from "../validators/rag-resource-knowledge";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import { listKnowledgeNodeQuestionCounts } from "./knowledge-node-reference-count";

const RESOURCE_OBJECT_LOCK_NAMESPACE = 200114;
const RESOURCE_CLEANUP_FAILURE_DIGEST = createHash("sha256")
  .update("resource_cleanup_failed")
  .digest("hex");
const resourceCleanupExtensions = new Set([
  "bin",
  "csv",
  "doc",
  "docx",
  "md",
  "markdown",
  "pdf",
  "ppt",
  "pptx",
  "txt",
  "xls",
  "xlsx",
]);

export type ResourceIndexingSource = {
  publicId: string;
  title: string;
  resourceStatus: ResourceStatus;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  level?: number | null;
  levelList?: number[] | null;
  markdownContent: string | null;
  markdownContentHash: string | null;
  originalFileName: string | null;
  resourceType: AdminResourceOpsListDto["resources"][number]["resourceType"];
  isVectorStale: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ResourceIndexChunkFactInput = {
  publicId: string;
  chunkIndex: number;
  headingPath: string[];
  content: string;
  contentHash: string;
  keywordTokenList: string[];
  embedding: number[];
};

export type CreateResourceFromUploadInput = {
  publicId: string;
  resourceType: AdminResourceOpsListDto["resources"][number]["resourceType"];
  resourceStatus: Extract<
    ResourceStatus,
    "uploaded" | "draft" | "conversion_failed"
  >;
  title: string;
  originalFileName: string;
  objectStoragePath: string;
  contentHash: string;
  fileSizeByte: number;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  level?: number | null;
  levelList?: number[] | null;
  markdownContent: string | null;
  markdownContentHash: string | null;
  conversionErrorMessage: string | null;
  knowledgeNodePublicIds: string[];
};

export type PrepareResourceUploadInput = {
  operationPublicId: string;
  resourcePublicId: string;
  actorPublicId: string;
  idempotencyKeyHash: string;
  requestFingerprint: string;
  objectStoragePath: string;
  fileHash: string;
  fileSizeByte: number;
};

export type ResourceUploadOperationReference = {
  publicId: string;
  resourcePublicId: string;
  objectStoragePath: string;
};

export type PrepareResourceUploadResult =
  | { status: "prepared"; operation: ResourceUploadOperationReference }
  | {
      status: "completed";
      resource: AdminResourceOpsListDto["resources"][number];
    }
  | { status: "conflict"; reason: "request_mismatch" | "invalid_state" };

export type CompleteResourceUploadReceiptInput = Omit<
  CreateResourceFromUploadInput,
  | "resourceStatus"
  | "markdownContent"
  | "markdownContentHash"
  | "conversionErrorMessage"
> & {
  operationPublicId: string;
  requestFingerprint: string;
  mutationContext: ResourceMutationContext;
};

export type CompleteResourceUploadReceiptResult =
  | {
      status: "completed";
      resource: AdminResourceOpsListDto["resources"][number];
      replayed: boolean;
    }
  | { status: "invalid_scope" }
  | { status: "conflict" };

export type ResourceConversionClaim = {
  publicId: string;
  claimVersion: string;
  objectStoragePath: string;
  originalFileName: string;
  contentHash: string;
  fileSizeByte: number;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
};

export type ClaimResourceConversionResult =
  | { status: "claimed"; claim: ResourceConversionClaim }
  | { status: "not_found" }
  | {
      status: "conflict";
      reason: "conversion_active" | "invalid_identity" | "invalid_state";
    };

export type FinalizeResourceConversionInput = {
  publicId: string;
  claimVersion: string;
  objectStoragePath: string;
  originalFileName: string;
  contentHash: string;
  fileSizeByte: number;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  resourceStatus: Extract<ResourceStatus, "draft" | "conversion_failed">;
  markdownContent: string | null;
  markdownContentHash: string | null;
  conversionErrorMessage: string | null;
  mutationContext: ResourceMutationContext;
};

export type FinalizeResourceConversionResult =
  | {
      status: "completed";
      resource: AdminResourceOpsListDto["resources"][number];
    }
  | { status: "conflict" };

export type ResourceIndexGenerationRequestResult =
  | { status: "not_found" }
  | {
      status: "conflict";
      reason:
        | "resource_status_not_indexable"
        | "missing_markdown_content_hash"
        | "request_public_id_conflict";
      currentStatus: ResourceStatus;
    }
  | {
      status: "accepted";
      generationPublicId: string;
      resourcePublicId: string;
      resourceStatus: ResourceStatus;
      replayed: boolean;
    };

export type CompleteResourceIndexGenerationInput = {
  generationPublicId: string;
  status: "success" | "failed";
  chunks: ResourceIndexChunkFactInput[];
  embeddingModelConfigPublicId: string | null;
  failureMessageDigest: string | null;
};

export type PersistedResourceRetrievalChunk = {
  chunkPublicId: string;
  generationPublicId: string;
  resourcePublicId: string;
  resourceTitle: string;
  resourceStatus: ResourceStatus;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  levelList: number[] | null;
  headingPath: string[];
  chunkIndex: number;
  text: string;
  textHash: string;
  keywordScore: number;
  semanticScore: number | null;
  isStale: boolean;
};

export type ResourcePublishMarkdownResult =
  | {
      status: "published";
      resource: AdminResourceOpsListDto["resources"][number];
    }
  | {
      status: "not_found";
    }
  | {
      status: "conflict";
      currentStatus: ResourceStatus;
      reason: "resource_not_publishable" | "missing_markdown_content";
    };

export type UpdateResourceMarkdownInput = {
  publicId: string;
  markdownContent: string;
  markdownContentHash: string;
  expectedSourceContentHash: string;
  expectedMarkdownContentHash: string;
  expectedUpdatedAt: string;
  mutationContext: ResourceMutationContext;
};

export type UpdateResourceMarkdownResult =
  | {
      status: "updated";
      resource: AdminResourceOpsListDto["resources"][number];
    }
  | { status: "not_found" }
  | {
      status: "conflict";
      reason:
        | "resource_not_editable"
        | "resource_lineage_mismatch"
        | "resource_stale_revision";
    };

export type ResourceDownloadIdentity = {
  contentHash: string;
  fileSizeByte: number;
  objectStoragePath: string;
  originalFileName: string;
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
};

export type ResourceCleanupIdentity = ResourceDownloadIdentity;

export type DeleteResourceLocalFile = (
  identity: ResourceCleanupIdentity,
) => Promise<"deleted" | "missing">;

export type ResourceDeleteResult =
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "retryable" }
  | { status: "not_found" }
  | { status: "conflict" };

export type RagResourceRuntimeRepository = {
  prepareResourceUpload?(
    input: PrepareResourceUploadInput,
  ): Promise<PrepareResourceUploadResult>;
  markResourceUploadFileStored?(operationPublicId: string): Promise<boolean>;
  completeResourceUploadReceipt?(
    input: CompleteResourceUploadReceiptInput,
  ): Promise<CompleteResourceUploadReceiptResult>;
  claimResourceConversion?(input: {
    publicId: string;
    staleBefore: Date;
  }): Promise<ClaimResourceConversionResult>;
  finalizeResourceConversion?(
    input: FinalizeResourceConversionInput,
  ): Promise<FinalizeResourceConversionResult>;
  recordResourceUploadFailure?(input: {
    operationPublicId: string;
    failureMessageDigest: string;
  }): Promise<void>;
  listResources(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ResourceKnowledgePage<AdminResourceOpsListDto>>;
  findResourceDetail?(publicId: string): Promise<{
    resource: AdminResourceOpsListDto["resources"][number];
    markdownContent: string | null;
    sourceContentHash: string | null;
    markdownContentHash: string | null;
  } | null>;
  findResourceDownload?(
    publicId: string,
  ): Promise<ResourceDownloadIdentity | null>;
  deleteConversionFailedResource?(
    publicId: string,
    mutationContext: ResourceMutationContext,
    deleteLocalFile: DeleteResourceLocalFile,
  ): Promise<ResourceDeleteResult>;
  updateResourceMarkdown?(
    input: UpdateResourceMarkdownInput,
  ): Promise<UpdateResourceMarkdownResult>;
  disableResource?(
    publicId: string,
    mutationContext: ResourceMutationContext,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  enableResource?(
    publicId: string,
    mutationContext: ResourceMutationContext,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  publishResourceMarkdown(
    publicId: string,
    mutationContext: ResourceMutationContext,
  ): Promise<ResourcePublishMarkdownResult>;
  findResourceForIndexing(
    publicId: string,
  ): Promise<ResourceIndexingSource | null>;
  requestResourceIndexRebuild?(
    resourcePublicId: string,
    requestPublicId: string,
    mutationContext: ResourceMutationContext,
  ): Promise<ResourceIndexGenerationRequestResult>;
  completeResourceIndexGeneration?(
    input: CompleteResourceIndexGenerationInput,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  replaceResourceKnowledgeNodes?(
    resourcePublicId: string,
    knowledgeNodePublicIds: string[],
  ): Promise<boolean>;
  retrieveResourceChunks?(input: {
    query: string;
    queryEmbedding: number[] | null;
    profession: AdminResourceOpsListDto["resources"][number]["profession"];
    level: number | null;
    authorizedResourcePublicIds: string[] | null;
    knowledgeNodePublicIds: string[];
    includeDescendants: boolean;
  }): Promise<PersistedResourceRetrievalChunk[]>;
};

export type ResourceMutationContext = {
  actorPublicId: string;
  auditLog: {
    actorRole: string;
    actionType:
      | "resource.update_markdown"
      | "resource.upload"
      | "resource.convert"
      | "resource.retry_conversion"
      | "resource.publish_markdown"
      | "resource.rebuild_vector"
      | "resource.disable"
      | "resource.enable"
      | "resource.delete";
    metadataSummary: string;
    requestIp: string | null;
    resultStatus?: "success" | "failed";
  };
};

export type RagKnowledgeNodeRuntimeRepository = {
  listKnowledgeNodes(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ResourceKnowledgePage<AdminKnowledgeNodeOpsListDto>>;
  createKnowledgeNode(
    input: KnowledgeNodeMutationInput,
    mutationContext: KnowledgeNodeMutationContext,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
  updateKnowledgeNode(
    publicId: string,
    input: KnowledgeNodeUpdateInput,
    mutationContext: KnowledgeNodeMutationContext,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
  disableKnowledgeNode(
    publicId: string,
    mutationContext: KnowledgeNodeMutationContext,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
};

export type KnowledgeNodeMutationContext = {
  actorPublicId: string;
  auditLog: {
    actorRole: string;
    actionType:
      | "knowledge_node.create"
      | "knowledge_node.update"
      | "knowledge_node.disable";
    metadataSummary: string;
    requestIp: string | null;
  };
};

export type ResourceKnowledgePage<TData> = TData & {
  pagination: ApiPagination;
};

export type RagResourceKnowledgeRuntimeRepositories = {
  resourceRepository: RagResourceRuntimeRepository;
  knowledgeNodeRepository: RagKnowledgeNodeRuntimeRepository;
};

function createSha256Digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export type KnowledgeNodeMutationConflictReason =
  | "knowledge_node_stale_version"
  | "knowledge_node_cycle"
  | "knowledge_node_path_conflict"
  | "knowledge_node_subtree_depth_exceeded"
  | "knowledge_node_subtree_identity_mismatch";

export class KnowledgeNodeMutationConflictError extends Error {
  constructor(public readonly reason: KnowledgeNodeMutationConflictReason) {
    super(reason);
    this.name = "KnowledgeNodeMutationConflictError";
  }
}

type KnowledgeNodeSubtreePlanRow = {
  id: number;
  parentKnowledgeNodeId: number | null;
  depth: number;
  pathName: string;
};

export function buildKnowledgeNodeSubtreeMutationPlan(input: {
  current: Pick<KnowledgeNodeSubtreePlanRow, "id" | "depth" | "pathName">;
  nextName: string;
  nextParent: Pick<
    KnowledgeNodeSubtreePlanRow,
    "id" | "depth" | "pathName"
  > | null;
  subtree: KnowledgeNodeSubtreePlanRow[];
}): {
  depthDelta: number;
  rootDepth: number;
  rootPathName: string;
  rows: Array<{ id: number; depth: number; pathName: string }>;
} {
  const subtreeIds = new Set(input.subtree.map((row) => row.id));
  const subtreeById = new Map(input.subtree.map((row) => [row.id, row]));
  const rootRow = input.subtree.find((row) => row.id === input.current.id);

  if (
    rootRow === undefined ||
    rootRow.depth !== input.current.depth ||
    rootRow.pathName !== input.current.pathName ||
    subtreeIds.size !== input.subtree.length
  ) {
    throw new KnowledgeNodeMutationConflictError(
      "knowledge_node_subtree_identity_mismatch",
    );
  }

  if (input.nextParent !== null && subtreeIds.has(input.nextParent.id)) {
    throw new KnowledgeNodeMutationConflictError("knowledge_node_cycle");
  }

  const rootDepth = (input.nextParent?.depth ?? 0) + 1;
  const rootPathName =
    input.nextParent === null
      ? input.nextName
      : `${input.nextParent.pathName}/${input.nextName}`;
  const depthDelta = rootDepth - input.current.depth;
  const rows = input.subtree.map((row) => {
    const relativeDepth = row.depth - input.current.depth;
    const pathSuffix = row.pathName.slice(input.current.pathName.length);
    const isRoot = row.id === input.current.id;

    if (
      relativeDepth < 0 ||
      (isRoot && (relativeDepth !== 0 || pathSuffix !== "")) ||
      (!isRoot &&
        (relativeDepth === 0 ||
          !row.pathName.startsWith(`${input.current.pathName}/`) ||
          !pathSuffix.startsWith("/")))
    ) {
      throw new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      );
    }

    if (!isRoot) {
      const parent =
        row.parentKnowledgeNodeId === null
          ? undefined
          : subtreeById.get(row.parentKnowledgeNodeId);
      const directPathSuffix =
        parent === undefined
          ? ""
          : row.pathName.slice(parent.pathName.length + 1);

      if (
        parent === undefined ||
        row.depth !== parent.depth + 1 ||
        !row.pathName.startsWith(`${parent.pathName}/`) ||
        directPathSuffix.length === 0 ||
        directPathSuffix.includes("/")
      ) {
        throw new KnowledgeNodeMutationConflictError(
          "knowledge_node_subtree_identity_mismatch",
        );
      }
    }

    const depth = rootDepth + relativeDepth;
    if (depth > maxKnowledgeNodeDepth) {
      throw new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_depth_exceeded",
      );
    }

    return {
      id: row.id,
      depth,
      pathName: `${rootPathName}${pathSuffix}`,
    };
  });

  if (new Set(rows.map((row) => row.pathName)).size !== rows.length) {
    throw new KnowledgeNodeMutationConflictError(
      "knowledge_node_path_conflict",
    );
  }

  return { depthDelta, rootDepth, rootPathName, rows };
}

type KnowledgeNodeRowForMapping = {
  id: number;
  public_id: string;
  parent_knowledge_node_id: number | null;
  profession: AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number]["profession"];
  level_list: unknown;
  name: string;
  path_name: string;
  sort_order: number;
  kn_status: AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number]["knStatus"];
  is_recommendable: boolean;
  updated_at: Date;
};

type ResourceOpsRowForMapping = {
  id?: number;
  public_id: string;
  title: string;
  resource_type: AdminResourceOpsListDto["resources"][number]["resourceType"];
  resource_status: AdminResourceOpsListDto["resources"][number]["resourceStatus"];
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  level: number | null;
  level_list: number[] | null;
  original_file_name: string | null;
  object_storage_path: string | null;
  content_hash: string | null;
  file_size_byte: number | null;
  markdown_content_hash: string | null;
  indexing_error_message: string | null;
  is_vector_stale: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export function createPostgresRagResourceKnowledgeRuntimeRepositories(
  options: RuntimeDatabaseOptions = {},
): RagResourceKnowledgeRuntimeRepositories {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for RAG resource knowledge runtime.",
  );

  return {
    resourceRepository: createPostgresRagResourceRuntimeRepository(getDatabase),
    knowledgeNodeRepository:
      createPostgresRagKnowledgeNodeRuntimeRepository(getDatabase),
  };
}

function createPostgresRagResourceRuntimeRepository(
  getDatabase: () => RuntimeDatabase,
): RagResourceRuntimeRepository {
  return {
    async prepareResourceUpload(input) {
      return prepareResourceUpload(getDatabase(), input);
    },
    async markResourceUploadFileStored(operationPublicId) {
      return markResourceUploadFileStored(getDatabase(), operationPublicId);
    },
    async completeResourceUploadReceipt(input) {
      return completeResourceUploadReceipt(getDatabase(), input);
    },
    async claimResourceConversion(input) {
      return claimResourceConversion(getDatabase(), input);
    },
    async finalizeResourceConversion(input) {
      return finalizeResourceConversion(getDatabase(), input);
    },
    async recordResourceUploadFailure(input) {
      await recordResourceUploadFailure(getDatabase(), input);
    },
    async deleteConversionFailedResource(
      publicId,
      mutationContext,
      deleteLocalFile,
    ) {
      return deleteConversionFailedResourceWithCleanup(
        getDatabase(),
        publicId,
        mutationContext,
        deleteLocalFile,
      );
    },
    async listResources(queryInput) {
      const database = getDatabase();
      const conditions = createResourceConditions(queryInput);
      const rows = await database
        .select({
          id: resource.id,
          public_id: resource.public_id,
          title: resource.title,
          resource_type: resource.resource_type,
          resource_status: resource.resource_status,
          profession: resource.profession,
          level: resource.level,
          level_list: resource.level_list,
          original_file_name: resource.original_file_name,
          object_storage_path: resource.object_storage_path,
          content_hash: resource.content_hash,
          file_size_byte: resource.file_size_byte,
          markdown_content_hash: resource.markdown_content_hash,
          indexing_error_message: resource.indexing_error_message,
          is_vector_stale: resource.is_vector_stale,
          published_at: resource.published_at,
          created_at: resource.created_at,
          updated_at: resource.updated_at,
        })
        .from(resource)
        .where(and(...conditions))
        .orderBy(createResourceOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(resource)
        .where(and(...conditions));
      const knowledgeNodePublicIdsByResourceId =
        await listResourceKnowledgeNodePublicIds(
          database,
          rows.map((row) => row.id),
        );

      return {
        resources: rows.map((row) =>
          mapResourceOpsRow(
            row,
            knowledgeNodePublicIdsByResourceId.get(row.id) ?? [],
          ),
        ),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async findResourceDetail(publicId) {
      const database = getDatabase();
      const [row] = await database
        .select({
          id: resource.id,
          ...createResourceOpsReturningSelection(),
          markdown_content: resource.markdown_content,
        })
        .from(resource)
        .where(eq(resource.public_id, publicId))
        .limit(1);

      if (row === undefined) {
        return null;
      }

      const knowledgeNodePublicIds =
        (await listResourceKnowledgeNodePublicIds(database, [row.id])).get(
          row.id,
        ) ?? [];

      return {
        resource: mapResourceOpsRow(row, knowledgeNodePublicIds),
        markdownContent: row.markdown_content,
        sourceContentHash: row.content_hash,
        markdownContentHash: row.markdown_content_hash,
      };
    },
    async findResourceDownload(publicId) {
      const database = getDatabase();
      const [row] = await database
        .select({
          profession: resource.profession,
          object_storage_path: resource.object_storage_path,
          original_file_name: resource.original_file_name,
          content_hash: resource.content_hash,
          file_size_byte: resource.file_size_byte,
        })
        .from(resource)
        .where(eq(resource.public_id, publicId))
        .limit(1);

      return row === undefined ||
        row.object_storage_path === null ||
        row.original_file_name === null ||
        row.content_hash === null ||
        row.file_size_byte === null
        ? null
        : {
            profession: row.profession,
            objectStoragePath: row.object_storage_path,
            originalFileName: row.original_file_name,
            contentHash: row.content_hash,
            fileSizeByte: row.file_size_byte,
          };
    },
    async updateResourceMarkdown(input) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const expectedUpdatedAt = new Date(input.expectedUpdatedAt);
        const resourceQuery = scopedDatabase
          .select({
            id: resource.id,
            resource_status: resource.resource_status,
            content_hash: resource.content_hash,
            markdown_content_hash: resource.markdown_content_hash,
            updated_at: resource.updated_at,
          })
          .from(resource)
          .where(eq(resource.public_id, input.publicId))
          .limit(1);
        const [resourceRow] = await resourceQuery.for("update");

        if (resourceRow === undefined) {
          return { status: "not_found" };
        }

        if (
          resourceRow.resource_status !== "draft" &&
          resourceRow.resource_status !== "rag_ready"
        ) {
          return {
            status: "conflict",
            reason: "resource_not_editable",
          };
        }

        if (
          resourceRow.content_hash === null ||
          resourceRow.markdown_content_hash === null ||
          resourceRow.content_hash !== input.expectedSourceContentHash ||
          resourceRow.markdown_content_hash !==
            input.expectedMarkdownContentHash
        ) {
          return {
            status: "conflict",
            reason: "resource_lineage_mismatch",
          };
        }

        if (resourceRow.updated_at.getTime() !== expectedUpdatedAt.getTime()) {
          return {
            status: "conflict",
            reason: "resource_stale_revision",
          };
        }

        const [activeGeneration] = await scopedDatabase
          .select({ id: resourceIndexGeneration.id })
          .from(resourceIndexGeneration)
          .where(
            and(
              eq(resourceIndexGeneration.resource_id, resourceRow.id),
              eq(resourceIndexGeneration.is_active, true),
              eq(resourceIndexGeneration.generation_status, "ready"),
            ),
          )
          .limit(1);
        const hasActiveGeneration = activeGeneration !== undefined;
        const now = new Date(
          Math.max(Date.now(), resourceRow.updated_at.getTime() + 1),
        );
        const nextStatus: ResourceStatus =
          resourceRow.resource_status === "rag_ready" ? "rag_ready" : "draft";
        const [row] = await scopedDatabase
          .update(resource)
          .set({
            markdown_content: input.markdownContent,
            markdown_content_hash: input.markdownContentHash,
            resource_status: nextStatus,
            is_vector_stale: hasActiveGeneration,
            indexing_error_message: null,
            updated_at: now,
          })
          .where(
            and(
              eq(resource.id, resourceRow.id),
              inArray(resource.resource_status, ["draft", "rag_ready"]),
              eq(resource.content_hash, input.expectedSourceContentHash),
              eq(
                resource.markdown_content_hash,
                input.expectedMarkdownContentHash,
              ),
              eq(resource.updated_at, expectedUpdatedAt),
            ),
          )
          .returning({
            id: resource.id,
            ...createResourceOpsReturningSelection(),
          });

        if (row === undefined) {
          return {
            status: "conflict",
            reason: "resource_stale_revision",
          };
        }

        await scopedDatabase
          .update(resourceIndexGeneration)
          .set({
            generation_status: "superseded",
            completed_at: now,
            updated_at: now,
          })
          .where(
            and(
              eq(resourceIndexGeneration.resource_id, resourceRow.id),
              eq(resourceIndexGeneration.is_active, false),
              inArray(resourceIndexGeneration.generation_status, [
                "pending",
                "indexing",
              ]),
            ),
          );

        const knowledgeNodePublicIds =
          (
            await listResourceKnowledgeNodePublicIds(scopedDatabase, [row.id])
          ).get(row.id) ?? [];
        await appendResourceMutationAuditLog(
          scopedDatabase,
          input.mutationContext,
          row.public_id,
        );
        return {
          status: "updated",
          resource: mapResourceOpsRow(row, knowledgeNodePublicIds),
        };
      });
    },
    async disableResource(publicId, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const resourceQuery = scopedDatabase
          .select({ id: resource.id })
          .from(resource)
          .where(eq(resource.public_id, publicId))
          .limit(1);
        const [resourceRow] = await resourceQuery.for("update");

        if (resourceRow === undefined) {
          return null;
        }

        const now = new Date();
        await scopedDatabase
          .update(resourceIndexGeneration)
          .set({
            generation_status: "superseded",
            completed_at: now,
            updated_at: now,
          })
          .where(
            and(
              eq(resourceIndexGeneration.resource_id, resourceRow.id),
              eq(resourceIndexGeneration.is_active, false),
              inArray(resourceIndexGeneration.generation_status, [
                "pending",
                "indexing",
              ]),
            ),
          );
        const [row] = await scopedDatabase
          .update(resource)
          .set({
            resource_status: "disabled",
            disabled_at: now,
            updated_at: now,
          })
          .where(eq(resource.id, resourceRow.id))
          .returning({
            id: resource.id,
            ...createResourceOpsReturningSelection(),
          });

        if (row === undefined) {
          return null;
        }

        const knowledgeNodePublicIds =
          (
            await listResourceKnowledgeNodePublicIds(scopedDatabase, [row.id])
          ).get(row.id) ?? [];
        await appendResourceMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        return mapResourceOpsRow(row, knowledgeNodePublicIds);
      });
    },
    async enableResource(publicId, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const resourceQuery = scopedDatabase
          .select({
            id: resource.id,
            resource_status: resource.resource_status,
            markdown_content_hash: resource.markdown_content_hash,
            published_at: resource.published_at,
          })
          .from(resource)
          .where(eq(resource.public_id, publicId))
          .limit(1);
        const [resourceRow] = await resourceQuery.for("update");

        if (
          resourceRow === undefined ||
          resourceRow.resource_status !== "disabled"
        ) {
          return null;
        }

        const [activeGeneration] = await scopedDatabase
          .select({
            source_content_hash: resourceIndexGeneration.source_content_hash,
          })
          .from(resourceIndexGeneration)
          .where(
            and(
              eq(resourceIndexGeneration.resource_id, resourceRow.id),
              eq(resourceIndexGeneration.is_active, true),
              eq(resourceIndexGeneration.generation_status, "ready"),
            ),
          )
          .limit(1);
        const hasCurrentActiveGeneration =
          activeGeneration?.source_content_hash ===
          resourceRow.markdown_content_hash;
        const nextStatus: ResourceStatus = hasCurrentActiveGeneration
          ? "rag_ready"
          : resourceRow.published_at === null
            ? "draft"
            : "published";
        const [row] = await scopedDatabase
          .update(resource)
          .set({
            resource_status: nextStatus,
            disabled_at: null,
            is_vector_stale:
              activeGeneration !== undefined && !hasCurrentActiveGeneration,
            updated_at: new Date(),
          })
          .where(eq(resource.id, resourceRow.id))
          .returning({
            id: resource.id,
            ...createResourceOpsReturningSelection(),
          });

        if (row === undefined) {
          return null;
        }

        const knowledgeNodePublicIds =
          (
            await listResourceKnowledgeNodePublicIds(scopedDatabase, [row.id])
          ).get(row.id) ?? [];
        await appendResourceMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        return mapResourceOpsRow(row, knowledgeNodePublicIds);
      });
    },
    async publishResourceMarkdown(publicId, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const currentQuery = scopedDatabase
          .select({
            id: resource.id,
            resource_status: resource.resource_status,
            markdown_content: resource.markdown_content,
            markdown_content_hash: resource.markdown_content_hash,
          })
          .from(resource)
          .where(eq(resource.public_id, publicId))
          .limit(1);
        const [currentRow] = await currentQuery.for("update");

        if (currentRow === undefined) {
          return { status: "not_found" };
        }

        const hasMarkdownContent =
          (currentRow.markdown_content?.trim().length ?? 0) > 0 &&
          currentRow.markdown_content_hash !== null;

        if (!hasMarkdownContent) {
          return {
            status: "conflict",
            currentStatus: currentRow.resource_status,
            reason: "missing_markdown_content",
          };
        }

        if (
          !canTransitionResourceStatus(currentRow.resource_status, "published")
        ) {
          return {
            status: "conflict",
            currentStatus: currentRow.resource_status,
            reason: "resource_not_publishable",
          };
        }

        const now = new Date();
        const [row] = await scopedDatabase
          .update(resource)
          .set({
            resource_status: "published",
            indexing_error_message: null,
            is_vector_stale: true,
            published_at: now,
            disabled_at: null,
            updated_at: now,
          })
          .where(eq(resource.id, currentRow.id))
          .returning({
            id: resource.id,
            ...createResourceOpsReturningSelection(),
          });

        if (row === undefined) {
          return { status: "not_found" };
        }

        const knowledgeNodePublicIds =
          (
            await listResourceKnowledgeNodePublicIds(scopedDatabase, [row.id])
          ).get(row.id) ?? [];
        await appendResourceMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        return {
          status: "published",
          resource: mapResourceOpsRow(row, knowledgeNodePublicIds),
        };
      });
    },
    async findResourceForIndexing(publicId) {
      const database = getDatabase();
      const [row] = await database
        .select({
          public_id: resource.public_id,
          title: resource.title,
          resource_type: resource.resource_type,
          resource_status: resource.resource_status,
          profession: resource.profession,
          level_list: resource.level_list,
          markdown_content: resource.markdown_content,
          markdown_content_hash: resource.markdown_content_hash,
          original_file_name: resource.original_file_name,
          is_vector_stale: resource.is_vector_stale,
          created_at: resource.created_at,
          updated_at: resource.updated_at,
        })
        .from(resource)
        .where(eq(resource.public_id, publicId))
        .limit(1);

      return row === undefined
        ? null
        : {
            publicId: row.public_id,
            title: row.title,
            resourceStatus: row.resource_status,
            profession: row.profession,
            levelList: row.level_list,
            markdownContent: row.markdown_content,
            markdownContentHash: row.markdown_content_hash,
            originalFileName: row.original_file_name,
            resourceType: row.resource_type,
            isVectorStale: row.is_vector_stale,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
    },
    async requestResourceIndexRebuild(
      resourcePublicId,
      requestPublicId,
      mutationContext,
    ) {
      return requestResourceIndexRebuild(
        getDatabase(),
        resourcePublicId,
        requestPublicId,
        mutationContext,
      );
    },
    async completeResourceIndexGeneration(input) {
      return completeResourceIndexGeneration(getDatabase(), input);
    },
    async replaceResourceKnowledgeNodes(
      resourcePublicId,
      knowledgeNodePublicIds,
    ) {
      return replaceResourceKnowledgeNodes(
        getDatabase(),
        resourcePublicId,
        knowledgeNodePublicIds,
      );
    },
    async retrieveResourceChunks(input) {
      return retrieveResourceChunks(getDatabase(), input);
    },
  };
}

async function lockResourceObjectIdentity(
  database: RuntimeDatabase,
  objectStoragePath: string,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(${RESOURCE_OBJECT_LOCK_NAMESPACE}, hashtext(${objectStoragePath})) as resource_object_lock`,
  );
}

async function prepareResourceUpload(
  database: RuntimeDatabase,
  input: PrepareResourceUploadInput,
): Promise<PrepareResourceUploadResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedOperation] = await scopedDatabase
      .select({
        object_storage_path: resourceUploadOperation.object_storage_path,
      })
      .from(resourceUploadOperation)
      .where(
        eq(
          resourceUploadOperation.idempotency_key_hash,
          input.idempotencyKeyHash,
        ),
      )
      .limit(1);
    const lockedObjectStoragePath =
      unlockedOperation?.object_storage_path ?? input.objectStoragePath;

    await lockResourceObjectIdentity(scopedDatabase, lockedObjectStoragePath);
    const [insertedOperation] = await scopedDatabase
      .insert(resourceUploadOperation)
      .values({
        public_id: input.operationPublicId,
        actor_public_id: input.actorPublicId,
        idempotency_key_hash: input.idempotencyKeyHash,
        request_fingerprint: input.requestFingerprint,
        resource_public_id: input.resourcePublicId,
        object_storage_path: input.objectStoragePath,
        file_hash: input.fileHash,
        file_size_byte: input.fileSizeByte,
        operation_status: "pending",
      })
      .onConflictDoNothing({
        target: resourceUploadOperation.idempotency_key_hash,
      })
      .returning({
        public_id: resourceUploadOperation.public_id,
        actor_public_id: resourceUploadOperation.actor_public_id,
        request_fingerprint: resourceUploadOperation.request_fingerprint,
        resource_public_id: resourceUploadOperation.resource_public_id,
        object_storage_path: resourceUploadOperation.object_storage_path,
        file_hash: resourceUploadOperation.file_hash,
        file_size_byte: resourceUploadOperation.file_size_byte,
        operation_status: resourceUploadOperation.operation_status,
        resource_id: resourceUploadOperation.resource_id,
      });
    const operationRow =
      insertedOperation ??
      (
        await scopedDatabase
          .select({
            public_id: resourceUploadOperation.public_id,
            actor_public_id: resourceUploadOperation.actor_public_id,
            request_fingerprint: resourceUploadOperation.request_fingerprint,
            resource_public_id: resourceUploadOperation.resource_public_id,
            object_storage_path: resourceUploadOperation.object_storage_path,
            file_hash: resourceUploadOperation.file_hash,
            file_size_byte: resourceUploadOperation.file_size_byte,
            operation_status: resourceUploadOperation.operation_status,
            resource_id: resourceUploadOperation.resource_id,
          })
          .from(resourceUploadOperation)
          .where(
            eq(
              resourceUploadOperation.idempotency_key_hash,
              input.idempotencyKeyHash,
            ),
          )
          .limit(1)
          .for("update")
      )[0];

    if (
      operationRow === undefined ||
      operationRow.actor_public_id !== input.actorPublicId ||
      operationRow.request_fingerprint !== input.requestFingerprint ||
      operationRow.resource_public_id !== input.resourcePublicId ||
      operationRow.object_storage_path !== lockedObjectStoragePath ||
      operationRow.object_storage_path !== input.objectStoragePath ||
      operationRow.file_hash !== input.fileHash ||
      operationRow.file_size_byte !== input.fileSizeByte
    ) {
      return { status: "conflict", reason: "request_mismatch" };
    }

    if (operationRow.operation_status === "completed") {
      if (operationRow.resource_id === null) {
        return { status: "conflict", reason: "invalid_state" };
      }

      const completedResource = await findResourceSummaryById(
        scopedDatabase,
        operationRow.resource_id,
      );

      return completedResource === null
        ? { status: "conflict", reason: "invalid_state" }
        : { status: "completed", resource: completedResource };
    }

    if (operationRow.operation_status === "failed") {
      await scopedDatabase
        .update(resourceUploadOperation)
        .set({
          operation_status: "pending",
          file_stored_at: null,
          last_failure_message_digest: null,
          updated_at: new Date(),
        })
        .where(eq(resourceUploadOperation.public_id, operationRow.public_id));
    }

    return {
      status: "prepared",
      operation: {
        publicId: operationRow.public_id,
        resourcePublicId: operationRow.resource_public_id,
        objectStoragePath: operationRow.object_storage_path,
      },
    };
  });
}

async function markResourceUploadFileStored(
  database: RuntimeDatabase,
  operationPublicId: string,
): Promise<boolean> {
  const [operationRow] = await database
    .update(resourceUploadOperation)
    .set({
      operation_status: "file_stored",
      file_stored_at: new Date(),
      last_failure_message_digest: null,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(resourceUploadOperation.public_id, operationPublicId),
        inArray(resourceUploadOperation.operation_status, [
          "pending",
          "file_stored",
        ]),
      ),
    )
    .returning({ public_id: resourceUploadOperation.public_id });

  if (operationRow !== undefined) {
    return true;
  }

  const [completedOperation] = await database
    .select({ operation_status: resourceUploadOperation.operation_status })
    .from(resourceUploadOperation)
    .where(eq(resourceUploadOperation.public_id, operationPublicId))
    .limit(1);

  return completedOperation?.operation_status === "completed";
}

async function recordResourceUploadFailure(
  database: RuntimeDatabase,
  input: {
    operationPublicId: string;
    failureMessageDigest: string;
  },
): Promise<void> {
  await database
    .update(resourceUploadOperation)
    .set({
      operation_status: "failed",
      last_failure_message_digest: input.failureMessageDigest,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(resourceUploadOperation.public_id, input.operationPublicId),
        inArray(resourceUploadOperation.operation_status, [
          "pending",
          "file_stored",
          "failed",
        ]),
      ),
    );
}

async function completeResourceUploadReceipt(
  database: RuntimeDatabase,
  input: CompleteResourceUploadReceiptInput,
): Promise<CompleteResourceUploadReceiptResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedOperation] = await scopedDatabase
      .select({
        object_storage_path: resourceUploadOperation.object_storage_path,
      })
      .from(resourceUploadOperation)
      .where(eq(resourceUploadOperation.public_id, input.operationPublicId))
      .limit(1);

    if (unlockedOperation === undefined) {
      return { status: "conflict" };
    }

    await lockResourceObjectIdentity(
      scopedDatabase,
      unlockedOperation.object_storage_path,
    );
    const [operationRow] = await scopedDatabase
      .select({
        id: resourceUploadOperation.id,
        actor_public_id: resourceUploadOperation.actor_public_id,
        request_fingerprint: resourceUploadOperation.request_fingerprint,
        resource_public_id: resourceUploadOperation.resource_public_id,
        object_storage_path: resourceUploadOperation.object_storage_path,
        file_hash: resourceUploadOperation.file_hash,
        file_size_byte: resourceUploadOperation.file_size_byte,
        operation_status: resourceUploadOperation.operation_status,
        resource_id: resourceUploadOperation.resource_id,
      })
      .from(resourceUploadOperation)
      .where(eq(resourceUploadOperation.public_id, input.operationPublicId))
      .limit(1)
      .for("update");

    if (
      operationRow === undefined ||
      operationRow.actor_public_id !== input.mutationContext.actorPublicId ||
      input.mutationContext.auditLog.actionType !== "resource.upload" ||
      operationRow.request_fingerprint !== input.requestFingerprint ||
      operationRow.resource_public_id !== input.publicId ||
      operationRow.object_storage_path !== input.objectStoragePath ||
      operationRow.file_hash !== input.contentHash ||
      operationRow.file_size_byte !== input.fileSizeByte
    ) {
      return { status: "conflict" };
    }

    if (operationRow.operation_status === "completed") {
      const completedResource =
        operationRow.resource_id === null
          ? null
          : await findResourceSummaryById(
              scopedDatabase,
              operationRow.resource_id,
            );

      return completedResource === null
        ? { status: "conflict" }
        : { status: "completed", resource: completedResource, replayed: true };
    }

    if (operationRow.operation_status !== "file_stored") {
      return { status: "conflict" };
    }

    const insertedResource = await insertResourceFromUpload(scopedDatabase, {
      ...input,
      resourceStatus: "uploaded",
      markdownContent: null,
      markdownContentHash: null,
      conversionErrorMessage: null,
    });

    if (insertedResource === null) {
      await scopedDatabase
        .update(resourceUploadOperation)
        .set({
          operation_status: "failed",
          last_failure_message_digest: createSha256Digest(
            "scope_validation_failed",
          ),
          updated_at: new Date(),
        })
        .where(eq(resourceUploadOperation.id, operationRow.id));
      return { status: "invalid_scope" };
    }

    await appendResourceMutationAuditLog(
      scopedDatabase,
      {
        ...input.mutationContext,
        auditLog: {
          ...input.mutationContext.auditLog,
          metadataSummary: "redacted resource upload metadata",
        },
      },
      insertedResource.resource.publicId,
    );
    await scopedDatabase
      .update(resourceUploadOperation)
      .set({
        operation_status: "completed",
        resource_id: insertedResource.resourceId,
        completed_at: new Date(),
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(resourceUploadOperation.id, operationRow.id));

    return {
      status: "completed",
      resource: insertedResource.resource,
      replayed: false,
    };
  });
}

async function claimResourceConversion(
  database: RuntimeDatabase,
  input: { publicId: string; staleBefore: Date },
): Promise<ClaimResourceConversionResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedResource] = await scopedDatabase
      .select({ object_storage_path: resource.object_storage_path })
      .from(resource)
      .where(eq(resource.public_id, input.publicId))
      .limit(1);

    if (unlockedResource === undefined) {
      return { status: "not_found" };
    }
    if (unlockedResource.object_storage_path === null) {
      return { status: "conflict", reason: "invalid_identity" };
    }

    await lockResourceObjectIdentity(
      scopedDatabase,
      unlockedResource.object_storage_path,
    );
    const [resourceRow] = await scopedDatabase
      .select({
        id: resource.id,
        public_id: resource.public_id,
        resource_status: resource.resource_status,
        object_storage_path: resource.object_storage_path,
        original_file_name: resource.original_file_name,
        content_hash: resource.content_hash,
        file_size_byte: resource.file_size_byte,
        profession: resource.profession,
        updated_at: resource.updated_at,
      })
      .from(resource)
      .where(eq(resource.public_id, input.publicId))
      .limit(1)
      .for("update");

    if (resourceRow === undefined) {
      return { status: "not_found" };
    }

    if (
      resourceRow.object_storage_path === null ||
      resourceRow.object_storage_path !==
        unlockedResource.object_storage_path ||
      resourceRow.original_file_name === null ||
      resourceRow.content_hash === null ||
      resourceRow.file_size_byte === null ||
      !/^[a-f0-9]{64}$/u.test(resourceRow.content_hash) ||
      !Number.isSafeInteger(resourceRow.file_size_byte) ||
      resourceRow.file_size_byte < 0
    ) {
      return { status: "conflict", reason: "invalid_identity" };
    }

    if (
      resourceRow.resource_status === "converting" &&
      resourceRow.updated_at.getTime() >= input.staleBefore.getTime()
    ) {
      return { status: "conflict", reason: "conversion_active" };
    }

    if (
      resourceRow.resource_status !== "uploaded" &&
      resourceRow.resource_status !== "conversion_failed" &&
      resourceRow.resource_status !== "converting"
    ) {
      return { status: "conflict", reason: "invalid_state" };
    }

    const claimedAt = new Date(
      Math.max(Date.now(), resourceRow.updated_at.getTime() + 1),
    );
    const [claimedRow] = await scopedDatabase
      .update(resource)
      .set({
        resource_status: "converting",
        conversion_error_message: null,
        indexing_error_message: null,
        updated_at: claimedAt,
      })
      .where(
        and(
          eq(resource.id, resourceRow.id),
          eq(resource.resource_status, resourceRow.resource_status),
          eq(resource.updated_at, resourceRow.updated_at),
        ),
      )
      .returning({ updated_at: resource.updated_at });

    if (claimedRow === undefined) {
      return { status: "conflict", reason: "conversion_active" };
    }

    return {
      status: "claimed",
      claim: {
        publicId: resourceRow.public_id,
        claimVersion: claimedRow.updated_at.toISOString(),
        objectStoragePath: resourceRow.object_storage_path,
        originalFileName: resourceRow.original_file_name,
        contentHash: resourceRow.content_hash,
        fileSizeByte: resourceRow.file_size_byte,
        profession: resourceRow.profession,
      },
    };
  });
}

async function finalizeResourceConversion(
  database: RuntimeDatabase,
  input: FinalizeResourceConversionInput,
): Promise<FinalizeResourceConversionResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const claimVersion = new Date(input.claimVersion);

    if (Number.isNaN(claimVersion.getTime())) {
      return { status: "conflict" };
    }

    const [unlockedResource] = await scopedDatabase
      .select({ object_storage_path: resource.object_storage_path })
      .from(resource)
      .where(eq(resource.public_id, input.publicId))
      .limit(1);

    if (
      unlockedResource === undefined ||
      unlockedResource.object_storage_path === null
    ) {
      return { status: "conflict" };
    }

    await lockResourceObjectIdentity(
      scopedDatabase,
      unlockedResource.object_storage_path,
    );

    const [resourceRow] = await scopedDatabase
      .select({
        id: resource.id,
        resource_status: resource.resource_status,
        object_storage_path: resource.object_storage_path,
        original_file_name: resource.original_file_name,
        content_hash: resource.content_hash,
        file_size_byte: resource.file_size_byte,
        profession: resource.profession,
        updated_at: resource.updated_at,
      })
      .from(resource)
      .where(eq(resource.public_id, input.publicId))
      .limit(1)
      .for("update");

    if (
      resourceRow === undefined ||
      resourceRow.resource_status !== "converting" ||
      resourceRow.object_storage_path !==
        unlockedResource.object_storage_path ||
      resourceRow.updated_at.getTime() !== claimVersion.getTime() ||
      resourceRow.object_storage_path !== input.objectStoragePath ||
      resourceRow.original_file_name !== input.originalFileName ||
      resourceRow.content_hash !== input.contentHash ||
      resourceRow.file_size_byte !== input.fileSizeByte ||
      resourceRow.profession !== input.profession
    ) {
      return { status: "conflict" };
    }

    const succeeded = input.resourceStatus === "draft";
    if (
      (succeeded &&
        (input.markdownContent === null ||
          input.markdownContentHash === null ||
          input.conversionErrorMessage !== null)) ||
      (!succeeded &&
        (input.markdownContent !== null ||
          input.markdownContentHash !== null ||
          input.conversionErrorMessage === null))
    ) {
      return { status: "conflict" };
    }

    const finalizedAt = new Date(
      Math.max(Date.now(), resourceRow.updated_at.getTime() + 1),
    );
    const [finalizedRow] = await scopedDatabase
      .update(resource)
      .set({
        resource_status: input.resourceStatus,
        markdown_content: input.markdownContent,
        markdown_content_hash: input.markdownContentHash,
        conversion_error_message: input.conversionErrorMessage,
        indexing_error_message:
          input.resourceStatus === "conversion_failed"
            ? input.conversionErrorMessage
            : null,
        is_vector_stale: false,
        updated_at: finalizedAt,
      })
      .where(
        and(
          eq(resource.id, resourceRow.id),
          eq(resource.resource_status, "converting"),
          eq(resource.updated_at, claimVersion),
          eq(resource.object_storage_path, input.objectStoragePath),
          eq(resource.original_file_name, input.originalFileName),
          eq(resource.content_hash, input.contentHash),
          eq(resource.file_size_byte, input.fileSizeByte),
          eq(resource.profession, input.profession),
        ),
      )
      .returning({
        id: resource.id,
        ...createResourceOpsReturningSelection(),
      });

    if (finalizedRow === undefined) {
      return { status: "conflict" };
    }

    await appendResourceMutationAuditLog(
      scopedDatabase,
      {
        ...input.mutationContext,
        auditLog: {
          ...input.mutationContext.auditLog,
          metadataSummary: "redacted resource conversion metadata",
          resultStatus: succeeded ? "success" : "failed",
        },
      },
      input.publicId,
    );
    const knowledgeNodePublicIds =
      (
        await listResourceKnowledgeNodePublicIds(scopedDatabase, [
          finalizedRow.id,
        ])
      ).get(finalizedRow.id) ?? [];

    return {
      status: "completed",
      resource: mapResourceOpsRow(finalizedRow, knowledgeNodePublicIds),
    };
  });
}

type ResourceDeleteMetadataResult =
  | { status: "ready" }
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "not_found" }
  | { status: "conflict" };

type ResourceCleanupJobRow = {
  id: number;
  source_resource_public_id: string;
  profession: ResourceCleanupIdentity["profession"];
  object_storage_path: string;
  original_file_name: string;
  file_size_byte: number;
  content_hash: string;
  cleanup_status:
    | "pending"
    | "processing"
    | "failed"
    | "completed"
    | "cancelled";
  claimed_at: Date | null;
};

function resourceCleanupJobSelection() {
  return {
    id: resourceCleanupJob.id,
    source_resource_public_id: resourceCleanupJob.source_resource_public_id,
    profession: resourceCleanupJob.profession,
    object_storage_path: resourceCleanupJob.object_storage_path,
    original_file_name: resourceCleanupJob.original_file_name,
    file_size_byte: resourceCleanupJob.file_size_byte,
    content_hash: resourceCleanupJob.content_hash,
    cleanup_status: resourceCleanupJob.cleanup_status,
    claimed_at: resourceCleanupJob.claimed_at,
  };
}

function mapResourceCleanupIdentity(
  row: Pick<
    ResourceCleanupJobRow,
    | "profession"
    | "object_storage_path"
    | "original_file_name"
    | "file_size_byte"
    | "content_hash"
  >,
): ResourceCleanupIdentity {
  return {
    profession: row.profession,
    objectStoragePath: row.object_storage_path,
    originalFileName: row.original_file_name,
    fileSizeByte: row.file_size_byte,
    contentHash: row.content_hash,
  };
}

function hasMatchingResourceCleanupIdentity(
  expected: ResourceCleanupIdentity,
  actual: ResourceCleanupIdentity,
): boolean {
  return (
    actual.profession === expected.profession &&
    actual.objectStoragePath === expected.objectStoragePath &&
    actual.originalFileName === expected.originalFileName &&
    actual.fileSizeByte === expected.fileSizeByte &&
    actual.contentHash === expected.contentHash
  );
}

function hasCompleteResourceCleanupIdentity(
  identity: ResourceCleanupIdentity,
): boolean {
  const extensionIndex = identity.originalFileName.lastIndexOf(".");
  const extension =
    extensionIndex < 0
      ? ""
      : identity.originalFileName.slice(extensionIndex + 1).toLowerCase();
  return (
    /^[a-f0-9]{64}$/u.test(identity.contentHash) &&
    Number.isSafeInteger(identity.fileSizeByte) &&
    identity.fileSizeByte >= 0 &&
    resourceCleanupExtensions.has(extension) &&
    identity.objectStoragePath ===
      `dev/resource/${identity.profession}/${identity.objectStoragePath.split("/")[3] ?? ""}/${identity.contentHash}.${extension}` &&
    /^dev\/resource\/(?:marketing|logistics|monopoly)\/\d{4}(?:0[1-9]|1[0-2])\/[a-f0-9]{64}\.[a-z0-9]+$/u.test(
      identity.objectStoragePath,
    )
  );
}

async function deleteConversionFailedResourceMetadata(
  database: RuntimeDatabase,
  publicId: string,
  mutationContext: ResourceMutationContext,
): Promise<ResourceDeleteMetadataResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedResource] = await scopedDatabase
      .select({
        id: resource.id,
        public_id: resource.public_id,
        resource_status: resource.resource_status,
        profession: resource.profession,
        object_storage_path: resource.object_storage_path,
        original_file_name: resource.original_file_name,
        file_size_byte: resource.file_size_byte,
        content_hash: resource.content_hash,
      })
      .from(resource)
      .where(eq(resource.public_id, publicId))
      .limit(1);

    if (unlockedResource === undefined) {
      const [existingJob] = await scopedDatabase
        .select({ cleanup_status: resourceCleanupJob.cleanup_status })
        .from(resourceCleanupJob)
        .where(eq(resourceCleanupJob.source_resource_public_id, publicId))
        .limit(1);
      if (existingJob === undefined) {
        return { status: "not_found" };
      }
      if (existingJob.cleanup_status === "completed") {
        return { status: "completed" };
      }
      if (existingJob.cleanup_status === "cancelled") {
        return { status: "cancelled" };
      }
      return { status: "ready" };
    }

    if (
      unlockedResource.object_storage_path === null ||
      unlockedResource.original_file_name === null ||
      unlockedResource.file_size_byte === null ||
      unlockedResource.content_hash === null
    ) {
      return { status: "conflict" };
    }
    const unlockedIdentity: ResourceCleanupIdentity = {
      profession: unlockedResource.profession,
      objectStoragePath: unlockedResource.object_storage_path,
      originalFileName: unlockedResource.original_file_name,
      fileSizeByte: unlockedResource.file_size_byte,
      contentHash: unlockedResource.content_hash,
    };
    if (!hasCompleteResourceCleanupIdentity(unlockedIdentity)) {
      return { status: "conflict" };
    }

    await lockResourceObjectIdentity(
      scopedDatabase,
      unlockedIdentity.objectStoragePath,
    );
    const [lockedResource] = await scopedDatabase
      .select({
        id: resource.id,
        public_id: resource.public_id,
        resource_status: resource.resource_status,
        profession: resource.profession,
        object_storage_path: resource.object_storage_path,
        original_file_name: resource.original_file_name,
        file_size_byte: resource.file_size_byte,
        content_hash: resource.content_hash,
      })
      .from(resource)
      .where(eq(resource.id, unlockedResource.id))
      .limit(1)
      .for("update");

    if (
      lockedResource === undefined ||
      lockedResource.object_storage_path === null ||
      lockedResource.original_file_name === null ||
      lockedResource.file_size_byte === null ||
      lockedResource.content_hash === null ||
      lockedResource.resource_status !== "conversion_failed" ||
      !hasMatchingResourceCleanupIdentity(unlockedIdentity, {
        profession: lockedResource.profession,
        objectStoragePath: lockedResource.object_storage_path,
        originalFileName: lockedResource.original_file_name,
        fileSizeByte: lockedResource.file_size_byte,
        contentHash: lockedResource.content_hash,
      })
    ) {
      return { status: "conflict" };
    }

    const [knowledgeNodeRelation] = await scopedDatabase
      .select({ id: knowledgeNodeResource.id })
      .from(knowledgeNodeResource)
      .where(eq(knowledgeNodeResource.resource_id, lockedResource.id))
      .limit(1);
    const [indexGenerationRelation] = await scopedDatabase
      .select({ id: resourceIndexGeneration.id })
      .from(resourceIndexGeneration)
      .where(eq(resourceIndexGeneration.resource_id, lockedResource.id))
      .limit(1);
    const [chunkRelation] = await scopedDatabase
      .select({ id: resourceChunk.id })
      .from(resourceChunk)
      .where(eq(resourceChunk.resource_id, lockedResource.id))
      .limit(1);
    if (
      knowledgeNodeRelation !== undefined ||
      indexGenerationRelation !== undefined ||
      chunkRelation !== undefined
    ) {
      return { status: "conflict" };
    }

    const operationRows = await scopedDatabase
      .select({
        id: resourceUploadOperation.id,
        resource_public_id: resourceUploadOperation.resource_public_id,
        object_storage_path: resourceUploadOperation.object_storage_path,
        file_hash: resourceUploadOperation.file_hash,
        file_size_byte: resourceUploadOperation.file_size_byte,
        operation_status: resourceUploadOperation.operation_status,
        resource_id: resourceUploadOperation.resource_id,
      })
      .from(resourceUploadOperation)
      .where(
        or(
          eq(resourceUploadOperation.resource_id, lockedResource.id),
          eq(resourceUploadOperation.resource_public_id, publicId),
        ),
      )
      .for("update");
    const operationRow = operationRows[0];
    if (
      operationRows.length !== 1 ||
      operationRow === undefined ||
      operationRow.resource_public_id !== publicId ||
      operationRow.resource_id !== lockedResource.id ||
      operationRow.operation_status !== "completed" ||
      operationRow.object_storage_path !== unlockedIdentity.objectStoragePath ||
      operationRow.file_hash !== unlockedIdentity.contentHash ||
      operationRow.file_size_byte !== unlockedIdentity.fileSizeByte
    ) {
      return { status: "conflict" };
    }

    const [tombstonedOperation] = await scopedDatabase
      .update(resourceUploadOperation)
      .set({
        resource_id: null,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(resourceUploadOperation.id, operationRow.id),
          eq(resourceUploadOperation.operation_status, "completed"),
          eq(resourceUploadOperation.resource_id, lockedResource.id),
        ),
      )
      .returning({ id: resourceUploadOperation.id });
    if (tombstonedOperation === undefined) {
      return { status: "conflict" };
    }
    const [deletedResource] = await scopedDatabase
      .delete(resource)
      .where(
        and(
          eq(resource.id, lockedResource.id),
          eq(resource.resource_status, "conversion_failed"),
          eq(resource.object_storage_path, unlockedIdentity.objectStoragePath),
          eq(resource.content_hash, unlockedIdentity.contentHash),
        ),
      )
      .returning({ public_id: resource.public_id });
    if (deletedResource === undefined) {
      return { status: "conflict" };
    }

    await appendResourceMutationAuditLog(
      scopedDatabase,
      {
        ...mutationContext,
        auditLog: {
          ...mutationContext.auditLog,
          actionType: "resource.delete",
          metadataSummary: "redacted resource delete metadata",
        },
      },
      deletedResource.public_id,
    );
    const [insertedJob] = await scopedDatabase
      .insert(resourceCleanupJob)
      .values({
        public_id: `resource-cleanup-job-${randomUUID()}`,
        source_resource_public_id: deletedResource.public_id,
        profession: unlockedIdentity.profession,
        object_storage_path: unlockedIdentity.objectStoragePath,
        original_file_name: unlockedIdentity.originalFileName,
        file_size_byte: unlockedIdentity.fileSizeByte,
        content_hash: unlockedIdentity.contentHash,
        cleanup_status: "pending",
      })
      .returning({ id: resourceCleanupJob.id });
    if (insertedJob === undefined) {
      throw new Error("Resource cleanup job was not enqueued.");
    }
    return { status: "ready" };
  });
}

async function markResourceCleanupFailed(
  database: RuntimeDatabase,
  jobId: number,
): Promise<ResourceDeleteResult> {
  await database
    .update(resourceCleanupJob)
    .set({
      cleanup_status: "failed",
      last_failure_message_digest: RESOURCE_CLEANUP_FAILURE_DIGEST,
      updated_at: new Date(),
    })
    .where(eq(resourceCleanupJob.id, jobId));
  return { status: "retryable" };
}

async function processResourceCleanupJob(
  database: RuntimeDatabase,
  sourceResourcePublicId: string,
  deleteLocalFile: DeleteResourceLocalFile,
  staleBefore = new Date(Date.now() - 5 * 60 * 1000),
): Promise<ResourceDeleteResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [unlockedJob] = await scopedDatabase
      .select(resourceCleanupJobSelection())
      .from(resourceCleanupJob)
      .where(
        eq(
          resourceCleanupJob.source_resource_public_id,
          sourceResourcePublicId,
        ),
      )
      .limit(1);
    if (unlockedJob === undefined) {
      return { status: "not_found" };
    }

    await lockResourceObjectIdentity(
      scopedDatabase,
      unlockedJob.object_storage_path,
    );
    const [job] = await scopedDatabase
      .select(resourceCleanupJobSelection())
      .from(resourceCleanupJob)
      .where(eq(resourceCleanupJob.id, unlockedJob.id))
      .limit(1)
      .for("update");
    const unlockedIdentity = mapResourceCleanupIdentity(unlockedJob);
    if (job === undefined) {
      return { status: "not_found" };
    }
    if (
      job.source_resource_public_id !== sourceResourcePublicId ||
      !hasMatchingResourceCleanupIdentity(
        unlockedIdentity,
        mapResourceCleanupIdentity(job),
      ) ||
      !hasCompleteResourceCleanupIdentity(unlockedIdentity)
    ) {
      return markResourceCleanupFailed(scopedDatabase, job.id);
    }
    if (job.cleanup_status === "completed") {
      return { status: "completed" };
    }
    if (job.cleanup_status === "cancelled") {
      return { status: "cancelled" };
    }
    if (
      job.cleanup_status === "processing" &&
      job.claimed_at !== null &&
      job.claimed_at.getTime() >= staleBefore.getTime()
    ) {
      return { status: "retryable" };
    }

    await scopedDatabase
      .update(resourceCleanupJob)
      .set({
        cleanup_status: "processing",
        attempt_count: sql`${resourceCleanupJob.attempt_count} + 1`,
        claimed_at: new Date(),
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(resourceCleanupJob.id, job.id));

    const resourceReferences = await scopedDatabase
      .select({
        profession: resource.profession,
        object_storage_path: resource.object_storage_path,
        original_file_name: resource.original_file_name,
        file_size_byte: resource.file_size_byte,
        content_hash: resource.content_hash,
      })
      .from(resource)
      .where(eq(resource.object_storage_path, job.object_storage_path));
    if (
      resourceReferences.some(
        (reference) =>
          reference.object_storage_path === null ||
          reference.original_file_name === null ||
          reference.file_size_byte === null ||
          reference.content_hash === null ||
          !hasMatchingResourceCleanupIdentity(unlockedIdentity, {
            profession: reference.profession,
            objectStoragePath: reference.object_storage_path,
            originalFileName: reference.original_file_name,
            fileSizeByte: reference.file_size_byte,
            contentHash: reference.content_hash,
          }),
      )
    ) {
      return markResourceCleanupFailed(scopedDatabase, job.id);
    }
    if (resourceReferences.length > 0) {
      await scopedDatabase
        .update(resourceCleanupJob)
        .set({
          cleanup_status: "cancelled",
          completed_at: new Date(),
          last_failure_message_digest: null,
          updated_at: new Date(),
        })
        .where(eq(resourceCleanupJob.id, job.id));
      return { status: "cancelled" };
    }

    const liveUploadRows = await scopedDatabase
      .select({
        object_storage_path: resourceUploadOperation.object_storage_path,
        file_hash: resourceUploadOperation.file_hash,
        file_size_byte: resourceUploadOperation.file_size_byte,
      })
      .from(resourceUploadOperation)
      .where(
        and(
          eq(
            resourceUploadOperation.object_storage_path,
            job.object_storage_path,
          ),
          inArray(resourceUploadOperation.operation_status, [
            "pending",
            "file_stored",
          ]),
        ),
      );
    if (
      liveUploadRows.some(
        (operation) =>
          operation.object_storage_path !==
            unlockedIdentity.objectStoragePath ||
          operation.file_hash !== unlockedIdentity.contentHash ||
          operation.file_size_byte !== unlockedIdentity.fileSizeByte,
      )
    ) {
      return markResourceCleanupFailed(scopedDatabase, job.id);
    }
    if (liveUploadRows.length > 0) {
      await scopedDatabase
        .update(resourceCleanupJob)
        .set({
          cleanup_status: "pending",
          claimed_at: null,
          last_failure_message_digest: null,
          updated_at: new Date(),
        })
        .where(eq(resourceCleanupJob.id, job.id));
      return { status: "retryable" };
    }

    try {
      await deleteLocalFile(unlockedIdentity);
    } catch {
      return markResourceCleanupFailed(scopedDatabase, job.id);
    }
    await scopedDatabase
      .update(resourceCleanupJob)
      .set({
        cleanup_status: "completed",
        completed_at: new Date(),
        last_failure_message_digest: null,
        updated_at: new Date(),
      })
      .where(eq(resourceCleanupJob.id, job.id));
    return { status: "completed" };
  });
}

async function deleteConversionFailedResourceWithCleanup(
  database: RuntimeDatabase,
  publicId: string,
  mutationContext: ResourceMutationContext,
  deleteLocalFile: DeleteResourceLocalFile,
): Promise<ResourceDeleteResult> {
  const metadataResult = await deleteConversionFailedResourceMetadata(
    database,
    publicId,
    mutationContext,
  );
  if (metadataResult.status !== "ready") {
    return metadataResult;
  }
  return processResourceCleanupJob(database, publicId, deleteLocalFile);
}

async function insertResourceFromUpload(
  scopedDatabase: RuntimeDatabase,
  input: CreateResourceFromUploadInput,
): Promise<{
  resourceId: number;
  resource: AdminResourceOpsListDto["resources"][number];
} | null> {
  const levelList =
    input.levelList ?? (typeof input.level === "number" ? [input.level] : null);
  const knowledgeBaseRow = await findKnowledgeBaseByProfession(
    scopedDatabase,
    input.profession,
    true,
  );

  if (knowledgeBaseRow === null || !knowledgeBaseRow.isEnabled) {
    return null;
  }

  const knowledgeNodeRows =
    input.knowledgeNodePublicIds.length === 0
      ? []
      : await scopedDatabase
          .select({
            id: knowledgeNode.id,
            public_id: knowledgeNode.public_id,
            knowledge_base_id: knowledgeNode.knowledge_base_id,
            profession: knowledgeNode.profession,
            kn_status: knowledgeNode.kn_status,
          })
          .from(knowledgeNode)
          .where(inArray(knowledgeNode.public_id, input.knowledgeNodePublicIds))
          .for("share");
  const validation = validateResourceKnowledgeNodeScope({
    resource: {
      knowledgeBaseId: knowledgeBaseRow.id,
      profession: input.profession,
    },
    requestedKnowledgeNodePublicIds: input.knowledgeNodePublicIds,
    knowledgeNodes: knowledgeNodeRows.map((row) => ({
      id: row.id,
      publicId: row.public_id,
      knowledgeBaseId: row.knowledge_base_id,
      profession: row.profession,
      knStatus: row.kn_status,
    })),
  });

  if (validation.status === "invalid") {
    return null;
  }

  const [resourceRow] = await scopedDatabase
    .insert(resource)
    .values({
      public_id: input.publicId,
      knowledge_base_id: knowledgeBaseRow.id,
      resource_type: input.resourceType,
      resource_status: input.resourceStatus,
      title: input.title,
      original_file_name: input.originalFileName,
      object_storage_path: input.objectStoragePath,
      content_hash: input.contentHash,
      file_size_byte: input.fileSizeByte,
      profession: input.profession,
      level: levelList?.length === 1 ? levelList[0] : null,
      level_list: levelList,
      markdown_content: input.markdownContent,
      markdown_content_hash: input.markdownContentHash,
      conversion_error_message: input.conversionErrorMessage,
      is_vector_stale: false,
    })
    .returning({
      ...createResourceOpsReturningSelection(),
      id: resource.id,
    });

  if (resourceRow === undefined) {
    return null;
  }

  if (validation.knowledgeNodeIds.length > 0) {
    await scopedDatabase.insert(knowledgeNodeResource).values(
      validation.knowledgeNodeIds.map((knowledgeNodeId) => ({
        knowledge_node_id: knowledgeNodeId,
        resource_id: resourceRow.id,
      })),
    );
  }

  return {
    resourceId: resourceRow.id,
    resource: {
      ...mapResourceOpsRow(resourceRow),
      knowledgeNodePublicIds: [...input.knowledgeNodePublicIds],
    },
  };
}

async function requestResourceIndexRebuild(
  database: RuntimeDatabase,
  resourcePublicId: string,
  requestPublicId: string,
  mutationContext: ResourceMutationContext,
): Promise<ResourceIndexGenerationRequestResult> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const resourceQuery = scopedDatabase
      .select({
        id: resource.id,
        public_id: resource.public_id,
        resource_status: resource.resource_status,
        markdown_content_hash: resource.markdown_content_hash,
      })
      .from(resource)
      .where(eq(resource.public_id, resourcePublicId))
      .limit(1);
    const [resourceRow] = await resourceQuery.for("update");

    if (resourceRow === undefined) {
      return { status: "not_found" };
    }

    if (!canRequestResourceIndexRebuild(resourceRow.resource_status)) {
      return {
        status: "conflict",
        reason: "resource_status_not_indexable",
        currentStatus: resourceRow.resource_status,
      };
    }

    if (resourceRow.markdown_content_hash === null) {
      return {
        status: "conflict",
        reason: "missing_markdown_content_hash",
        currentStatus: resourceRow.resource_status,
      };
    }

    const [existingRequest] = await scopedDatabase
      .select({
        public_id: resourceIndexGeneration.public_id,
        resource_id: resourceIndexGeneration.resource_id,
        source_content_hash: resourceIndexGeneration.source_content_hash,
      })
      .from(resourceIndexGeneration)
      .where(eq(resourceIndexGeneration.request_public_id, requestPublicId))
      .limit(1);

    if (existingRequest !== undefined) {
      if (
        existingRequest.resource_id !== resourceRow.id ||
        existingRequest.source_content_hash !==
          resourceRow.markdown_content_hash
      ) {
        return {
          status: "conflict",
          reason: "request_public_id_conflict",
          currentStatus: resourceRow.resource_status,
        };
      }

      await appendResourceMutationAuditLog(
        scopedDatabase,
        mutationContext,
        resourceRow.public_id,
      );
      return {
        status: "accepted",
        generationPublicId: existingRequest.public_id,
        resourcePublicId: resourceRow.public_id,
        resourceStatus: resourceRow.resource_status,
        replayed: true,
      };
    }

    const [activeGeneration] = await scopedDatabase
      .select({ id: resourceIndexGeneration.id })
      .from(resourceIndexGeneration)
      .where(
        and(
          eq(resourceIndexGeneration.resource_id, resourceRow.id),
          eq(resourceIndexGeneration.is_active, true),
          eq(resourceIndexGeneration.generation_status, "ready"),
        ),
      )
      .limit(1);

    await scopedDatabase
      .update(resourceIndexGeneration)
      .set({
        generation_status: "superseded",
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(resourceIndexGeneration.resource_id, resourceRow.id),
          eq(resourceIndexGeneration.is_active, false),
          inArray(resourceIndexGeneration.generation_status, [
            "pending",
            "indexing",
          ]),
        ),
      );

    const generationPublicId = `resource-index-generation-${randomUUID()}`;
    await scopedDatabase.insert(resourceIndexGeneration).values({
      public_id: generationPublicId,
      request_public_id: requestPublicId,
      resource_id: resourceRow.id,
      source_content_hash: resourceRow.markdown_content_hash,
      generation_status: "pending",
      is_active: false,
    });

    const nextResourceStatus: ResourceStatus =
      activeGeneration === undefined ? "indexing" : "rag_ready";
    await scopedDatabase
      .update(resource)
      .set({
        resource_status: nextResourceStatus,
        indexing_error_message: null,
        is_vector_stale: true,
        updated_at: new Date(),
      })
      .where(eq(resource.id, resourceRow.id));

    await appendResourceMutationAuditLog(
      scopedDatabase,
      mutationContext,
      resourceRow.public_id,
    );

    return {
      status: "accepted",
      generationPublicId,
      resourcePublicId: resourceRow.public_id,
      resourceStatus: nextResourceStatus,
      replayed: false,
    };
  });
}

async function appendResourceMutationAuditLog(
  database: RuntimeDatabase,
  mutationContext: ResourceMutationContext,
  targetPublicId: string,
): Promise<void> {
  await database.insert(auditLog).values({
    public_id: `audit-log-${randomUUID()}`,
    actor_public_id: mutationContext.actorPublicId,
    actor_role: mutationContext.auditLog.actorRole,
    action_type: mutationContext.auditLog.actionType,
    target_resource_type: "resource",
    target_public_id: targetPublicId,
    result_status: mutationContext.auditLog.resultStatus ?? "success",
    metadata_summary: mutationContext.auditLog.metadataSummary,
    request_ip: mutationContext.auditLog.requestIp,
  });
}

async function completeResourceIndexGeneration(
  database: RuntimeDatabase,
  input: CompleteResourceIndexGenerationInput,
): Promise<AdminResourceOpsListDto["resources"][number] | null> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [generationReference] = await scopedDatabase
      .select({ resource_id: resourceIndexGeneration.resource_id })
      .from(resourceIndexGeneration)
      .where(eq(resourceIndexGeneration.public_id, input.generationPublicId))
      .limit(1);

    if (generationReference === undefined) {
      return null;
    }

    const resourceQuery = scopedDatabase
      .select({
        id: resource.id,
        resource_status: resource.resource_status,
        markdown_content_hash: resource.markdown_content_hash,
      })
      .from(resource)
      .where(eq(resource.id, generationReference.resource_id))
      .limit(1);
    const [resourceRow] = await resourceQuery.for("update");

    if (resourceRow === undefined) {
      return null;
    }

    const generationQuery = scopedDatabase
      .select({
        id: resourceIndexGeneration.id,
        resource_id: resourceIndexGeneration.resource_id,
        source_content_hash: resourceIndexGeneration.source_content_hash,
        generation_status: resourceIndexGeneration.generation_status,
      })
      .from(resourceIndexGeneration)
      .where(eq(resourceIndexGeneration.public_id, input.generationPublicId))
      .limit(1);
    const [generationRow] = await generationQuery.for("update");

    if (
      generationRow === undefined ||
      generationRow.resource_id !== resourceRow.id ||
      (generationRow.generation_status !== "pending" &&
        generationRow.generation_status !== "indexing")
    ) {
      return null;
    }

    const [priorActiveGeneration] = await scopedDatabase
      .select({ id: resourceIndexGeneration.id })
      .from(resourceIndexGeneration)
      .where(
        and(
          eq(resourceIndexGeneration.resource_id, resourceRow.id),
          eq(resourceIndexGeneration.is_active, true),
          eq(resourceIndexGeneration.generation_status, "ready"),
        ),
      )
      .limit(1);
    const hasPriorActiveGeneration = priorActiveGeneration !== undefined;

    if (
      resourceRow.resource_status === "disabled" ||
      resourceRow.markdown_content_hash !== generationRow.source_content_hash
    ) {
      await scopedDatabase
        .update(resourceIndexGeneration)
        .set({
          generation_status: "superseded",
          completed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(resourceIndexGeneration.id, generationRow.id));
      return null;
    }

    const hasValidSuccessFacts =
      input.status === "success" &&
      isCompleteResourceIndexChunkSet(input.chunks);

    if (!hasValidSuccessFacts) {
      const nextStatus = resolveResourceStatusAfterIndexFailure(
        hasPriorActiveGeneration,
      );
      await scopedDatabase
        .update(resourceIndexGeneration)
        .set({
          generation_status: "failed",
          chunk_count: 0,
          failure_message_digest:
            input.failureMessageDigest ?? "invalid_index_generation_facts",
          completed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(resourceIndexGeneration.id, generationRow.id));
      const [failedResource] = await scopedDatabase
        .update(resource)
        .set({
          resource_status: nextStatus,
          indexing_error_message: "resource_index_generation_failed",
          is_vector_stale: hasPriorActiveGeneration,
          updated_at: new Date(),
        })
        .where(eq(resource.id, resourceRow.id))
        .returning(createResourceOpsReturningSelection());

      return failedResource === undefined
        ? null
        : mapResourceOpsRow(failedResource);
    }

    const embeddingModelConfigId =
      input.embeddingModelConfigPublicId === null
        ? null
        : await findModelConfigIdByPublicId(
            scopedDatabase,
            input.embeddingModelConfigPublicId,
          );

    if (embeddingModelConfigId === null) {
      return null;
    }

    await scopedDatabase.insert(resourceChunk).values(
      input.chunks.map((chunk) => ({
        public_id: chunk.publicId,
        resource_index_generation_id: generationRow.id,
        resource_id: resourceRow.id,
        chunk_index: chunk.chunkIndex,
        heading_path: chunk.headingPath,
        content: chunk.content,
        content_hash: chunk.contentHash,
        keyword_token_list: chunk.keywordTokenList,
        embedding: chunk.embedding,
      })),
    );
    await scopedDatabase
      .update(resourceIndexGeneration)
      .set({
        is_active: false,
        generation_status: "superseded",
        updated_at: new Date(),
      })
      .where(
        and(
          eq(resourceIndexGeneration.resource_id, resourceRow.id),
          eq(resourceIndexGeneration.is_active, true),
        ),
      );
    await scopedDatabase
      .update(resourceIndexGeneration)
      .set({
        generation_status: "ready",
        embedding_model_config_id: embeddingModelConfigId,
        embedding_dimension: 1536,
        chunk_count: input.chunks.length,
        is_active: true,
        failure_message_digest: null,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(resourceIndexGeneration.id, generationRow.id));
    const [readyResource] = await scopedDatabase
      .update(resource)
      .set({
        resource_status: "rag_ready",
        indexing_error_message: null,
        is_vector_stale: false,
        updated_at: new Date(),
      })
      .where(eq(resource.id, resourceRow.id))
      .returning(createResourceOpsReturningSelection());

    return readyResource === undefined
      ? null
      : mapResourceOpsRow(readyResource);
  });
}

function isCompleteResourceIndexChunkSet(
  chunks: ResourceIndexChunkFactInput[],
): boolean {
  return (
    chunks.length > 0 &&
    chunks.every(
      (chunk, index) =>
        chunk.chunkIndex === index &&
        chunk.publicId.length > 0 &&
        chunk.content.length > 0 &&
        chunk.contentHash.length > 0 &&
        chunk.keywordTokenList.length > 0 &&
        chunk.keywordTokenList.every((token) => token.trim().length > 0) &&
        chunk.embedding.length === 1536 &&
        chunk.embedding.every(Number.isFinite),
    )
  );
}

async function findModelConfigIdByPublicId(
  database: RuntimeDatabase,
  publicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: modelConfig.id })
    .from(modelConfig)
    .where(
      and(
        eq(modelConfig.public_id, publicId),
        eq(modelConfig.is_enabled, true),
      ),
    )
    .limit(1);

  return row?.id ?? null;
}

async function replaceResourceKnowledgeNodes(
  database: RuntimeDatabase,
  resourcePublicId: string,
  knowledgeNodePublicIds: string[],
): Promise<boolean> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const resourceQuery = scopedDatabase
      .select({
        id: resource.id,
        knowledge_base_id: resource.knowledge_base_id,
        profession: resource.profession,
      })
      .from(resource)
      .where(eq(resource.public_id, resourcePublicId))
      .limit(1);
    const [resourceRow] = await resourceQuery.for("update");

    if (resourceRow === undefined) {
      return false;
    }

    const knowledgeNodeRows =
      knowledgeNodePublicIds.length === 0
        ? []
        : await scopedDatabase
            .select({
              id: knowledgeNode.id,
              public_id: knowledgeNode.public_id,
              knowledge_base_id: knowledgeNode.knowledge_base_id,
              profession: knowledgeNode.profession,
              kn_status: knowledgeNode.kn_status,
            })
            .from(knowledgeNode)
            .where(inArray(knowledgeNode.public_id, knowledgeNodePublicIds))
            .for("share");
    const validation = validateResourceKnowledgeNodeScope({
      resource: {
        knowledgeBaseId: resourceRow.knowledge_base_id,
        profession: resourceRow.profession,
      },
      requestedKnowledgeNodePublicIds: knowledgeNodePublicIds,
      knowledgeNodes: knowledgeNodeRows.map((row) => ({
        id: row.id,
        publicId: row.public_id,
        knowledgeBaseId: row.knowledge_base_id,
        profession: row.profession,
        knStatus: row.kn_status,
      })),
    });

    if (validation.status === "invalid") {
      return false;
    }

    await scopedDatabase
      .delete(knowledgeNodeResource)
      .where(eq(knowledgeNodeResource.resource_id, resourceRow.id));

    if (validation.knowledgeNodeIds.length > 0) {
      await scopedDatabase.insert(knowledgeNodeResource).values(
        validation.knowledgeNodeIds.map((knowledgeNodeId) => ({
          knowledge_node_id: knowledgeNodeId,
          resource_id: resourceRow.id,
        })),
      );
    }

    return true;
  });
}

async function retrieveResourceChunks(
  database: RuntimeDatabase,
  input: Parameters<
    NonNullable<RagResourceRuntimeRepository["retrieveResourceChunks"]>
  >[0],
): Promise<PersistedResourceRetrievalChunk[]> {
  if (input.authorizedResourcePublicIds?.length === 0) {
    return [];
  }

  const scopedKnowledgeNodeIds = await resolveKnowledgeNodeScopeIds(
    database,
    input.knowledgeNodePublicIds,
    input.includeDescendants,
  );
  let scopedResourceIds: number[] | null = null;

  if (input.knowledgeNodePublicIds.length > 0) {
    if (scopedKnowledgeNodeIds.length === 0) {
      return [];
    }

    const relationRows = await database
      .select({ resource_id: knowledgeNodeResource.resource_id })
      .from(knowledgeNodeResource)
      .where(
        inArray(
          knowledgeNodeResource.knowledge_node_id,
          scopedKnowledgeNodeIds,
        ),
      );
    scopedResourceIds = [
      ...new Set(relationRows.map((row) => row.resource_id)),
    ];

    if (scopedResourceIds.length === 0) {
      return [];
    }
  }

  const conditions: SQL[] = [
    eq(resource.resource_status, "rag_ready"),
    eq(resource.profession, input.profession),
    eq(resourceIndexGeneration.is_active, true),
    eq(resourceIndexGeneration.generation_status, "ready"),
  ];

  if (input.authorizedResourcePublicIds !== null) {
    conditions.push(
      inArray(resource.public_id, input.authorizedResourcePublicIds),
    );
  }

  conditions.push(
    input.level === null
      ? sql`cardinality(${resource.level_list}) = 0`
      : or(
          sql`cardinality(${resource.level_list}) = 0`,
          sql`${resource.level_list} @> ARRAY[${input.level}]::integer[]`,
        )!,
  );

  if (scopedResourceIds !== null) {
    conditions.push(inArray(resource.id, scopedResourceIds));
  }

  const rows = await database
    .select({
      chunk_public_id: resourceChunk.public_id,
      generation_public_id: resourceIndexGeneration.public_id,
      resource_public_id: resource.public_id,
      resource_title: resource.title,
      resource_status: resource.resource_status,
      profession: resource.profession,
      level_list: resource.level_list,
      heading_path: resourceChunk.heading_path,
      chunk_index: resourceChunk.chunk_index,
      content: resourceChunk.content,
      content_hash: resourceChunk.content_hash,
      keyword_token_list: resourceChunk.keyword_token_list,
      embedding: resourceChunk.embedding,
      is_vector_stale: resource.is_vector_stale,
    })
    .from(resourceChunk)
    .innerJoin(
      resourceIndexGeneration,
      eq(
        resourceIndexGeneration.id,
        resourceChunk.resource_index_generation_id,
      ),
    )
    .innerJoin(resource, eq(resource.id, resourceChunk.resource_id))
    .where(and(...conditions))
    .orderBy(asc(resource.public_id), asc(resourceChunk.chunk_index));
  const queryTokens = tokenizeRetrievalText(input.query);

  return rows.map((row) => {
    const keywordTokenList = Array.isArray(row.keyword_token_list)
      ? row.keyword_token_list.filter(
          (token): token is string => typeof token === "string",
        )
      : [];

    return {
      chunkPublicId: row.chunk_public_id,
      generationPublicId: row.generation_public_id,
      resourcePublicId: row.resource_public_id,
      resourceTitle: row.resource_title,
      resourceStatus: row.resource_status,
      profession: row.profession,
      levelList: row.level_list,
      headingPath: Array.isArray(row.heading_path)
        ? row.heading_path.filter(
            (path): path is string => typeof path === "string",
          )
        : [],
      chunkIndex: row.chunk_index,
      text: row.content,
      textHash: row.content_hash,
      keywordScore: calculateKeywordFactScore(queryTokens, keywordTokenList),
      semanticScore: calculateCosineSimilarity(
        input.queryEmbedding,
        row.embedding,
      ),
      isStale: row.is_vector_stale,
    };
  });
}

async function resolveKnowledgeNodeScopeIds(
  database: RuntimeDatabase,
  publicIds: string[],
  includeDescendants: boolean,
): Promise<number[]> {
  if (publicIds.length === 0) {
    return [];
  }

  const initialRows = await database
    .select({ id: knowledgeNode.id })
    .from(knowledgeNode)
    .where(
      and(
        inArray(knowledgeNode.public_id, publicIds),
        eq(knowledgeNode.kn_status, "active"),
      ),
    );
  const resolvedIds = new Set(initialRows.map((row) => row.id));

  if (!includeDescendants) {
    return [...resolvedIds];
  }

  let frontier = [...resolvedIds];

  for (
    let depth = 1;
    depth < maxKnowledgeNodeDepth && frontier.length > 0;
    depth += 1
  ) {
    const childRows = await database
      .select({ id: knowledgeNode.id })
      .from(knowledgeNode)
      .where(
        and(
          inArray(knowledgeNode.parent_knowledge_node_id, frontier),
          eq(knowledgeNode.kn_status, "active"),
        ),
      );
    frontier = childRows
      .map((row) => row.id)
      .filter((id) => !resolvedIds.has(id));
    frontier.forEach((id) => resolvedIds.add(id));
  }

  return [...resolvedIds];
}

function tokenizeRetrievalText(value: string): string[] {
  return [
    ...new Set(
      value
        .toLowerCase()
        .split(/[^\p{Letter}\p{Number}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length > 0),
    ),
  ];
}

function calculateKeywordFactScore(
  queryTokens: string[],
  keywordTokenList: string[],
): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  const keywordTokens = new Set(keywordTokenList);
  return (
    queryTokens.filter((token) => keywordTokens.has(token)).length /
    queryTokens.length
  );
}

function calculateCosineSimilarity(
  queryEmbedding: number[] | null,
  chunkEmbedding: number[] | null,
): number | null {
  if (
    queryEmbedding === null ||
    chunkEmbedding === null ||
    queryEmbedding.length === 0 ||
    queryEmbedding.length !== chunkEmbedding.length
  ) {
    return null;
  }

  let dotProduct = 0;
  let queryMagnitude = 0;
  let chunkMagnitude = 0;

  for (let index = 0; index < queryEmbedding.length; index += 1) {
    const queryValue = queryEmbedding[index];
    const chunkValue = chunkEmbedding[index];

    if (
      queryValue === undefined ||
      chunkValue === undefined ||
      !Number.isFinite(queryValue) ||
      !Number.isFinite(chunkValue)
    ) {
      return null;
    }

    dotProduct += queryValue * chunkValue;
    queryMagnitude += queryValue * queryValue;
    chunkMagnitude += chunkValue * chunkValue;
  }

  if (queryMagnitude === 0 || chunkMagnitude === 0) {
    return null;
  }

  return Math.max(
    0,
    Math.min(1, dotProduct / Math.sqrt(queryMagnitude * chunkMagnitude)),
  );
}

function createPostgresRagKnowledgeNodeRuntimeRepository(
  getDatabase: () => RuntimeDatabase,
): RagKnowledgeNodeRuntimeRepository {
  return {
    async listKnowledgeNodes(queryInput) {
      const database = getDatabase();
      const conditions = createKnowledgeNodeConditions(queryInput);
      const rows = await database
        .select({
          id: knowledgeNode.id,
          public_id: knowledgeNode.public_id,
          parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
          profession: knowledgeNode.profession,
          level_list: knowledgeNode.level_list,
          name: knowledgeNode.name,
          path_name: knowledgeNode.path_name,
          sort_order: knowledgeNode.sort_order,
          kn_status: knowledgeNode.kn_status,
          is_recommendable: knowledgeNode.is_recommendable,
          updated_at: knowledgeNode.updated_at,
        })
        .from(knowledgeNode)
        .where(and(...conditions))
        .orderBy(createKnowledgeNodeOrderBy(queryInput))
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(knowledgeNode)
        .where(and(...conditions));
      const parentPublicIds = await listParentKnowledgeNodePublicIds(
        database,
        rows
          .map((row) => row.parent_knowledge_node_id)
          .filter((id): id is number => id !== null),
      );
      const questionCounts = await listKnowledgeNodeQuestionCounts(
        database,
        rows.map((row) => row.id),
      );

      return {
        knowledgeNodes: rows.map((row) =>
          mapKnowledgeNodeRow(
            row,
            parentPublicIds,
            questionCounts.get(row.id) ?? 0,
          ),
        ),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async createKnowledgeNode(input, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const knowledgeBaseReference = await findKnowledgeBaseByProfession(
          scopedDatabase,
          input.profession,
        );

        if (knowledgeBaseReference === null) {
          return null;
        }

        await lockKnowledgeTreeMutation(
          scopedDatabase,
          knowledgeBaseReference.id,
        );
        const knowledgeBaseRow = await findKnowledgeBaseByProfession(
          scopedDatabase,
          input.profession,
          true,
        );

        if (knowledgeBaseRow === null || !knowledgeBaseRow.isEnabled) {
          return null;
        }

        const parentNode =
          input.parentKnowledgeNodePublicId === null
            ? null
            : await findKnowledgeNodeByPublicId(
                scopedDatabase,
                input.parentKnowledgeNodePublicId,
                true,
              );

        if (input.parentKnowledgeNodePublicId !== null && parentNode === null) {
          return null;
        }

        const parentScope = validateKnowledgeNodeParentScope({
          current: {
            id: -1,
            knowledgeBaseId: knowledgeBaseRow.id,
            profession: input.profession,
          },
          parent:
            parentNode === null
              ? null
              : {
                  id: parentNode.id,
                  knowledgeBaseId: parentNode.knowledge_base_id,
                  profession: parentNode.profession,
                },
        });

        if (parentScope.status === "invalid") {
          return null;
        }

        const depth = (parentNode?.depth ?? 0) + 1;
        assertKnowledgeNodeDepth(depth);
        const [row] = await scopedDatabase
          .insert(knowledgeNode)
          .values({
            public_id: `knowledge-node-${randomUUID()}`,
            knowledge_base_id: knowledgeBaseRow.id,
            parent_knowledge_node_id: parentNode?.id ?? null,
            profession: input.profession,
            level_list: input.levelList,
            name: input.name,
            path_name:
              parentNode === null
                ? input.name
                : `${parentNode.path_name}/${input.name}`,
            depth,
            sort_order: input.sortOrder,
            kn_status: "active",
            is_recommendable: true,
          })
          .returning(createKnowledgeNodeReturningSelection());

        if (row === undefined) {
          return null;
        }

        await appendKnowledgeNodeMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        return mapKnowledgeNodeRow(
          row,
          new Map(
            parentNode === null ? [] : [[parentNode.id, parentNode.public_id]],
          ),
          0,
        );
      });
    },
    async updateKnowledgeNode(publicId, input, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const currentReference = await findKnowledgeNodeByPublicId(
          scopedDatabase,
          publicId,
        );

        if (currentReference === null) {
          return null;
        }

        await lockKnowledgeTreeMutation(
          scopedDatabase,
          currentReference.knowledge_base_id,
        );
        const currentNode = await findKnowledgeNodeByPublicId(
          scopedDatabase,
          publicId,
          true,
        );

        if (currentNode === null) {
          return null;
        }

        if (currentNode.updated_at.toISOString() !== input.expectedUpdatedAt) {
          throw new KnowledgeNodeMutationConflictError(
            "knowledge_node_stale_version",
          );
        }

        if (
          input.profession !== undefined &&
          input.profession !== currentNode.profession
        ) {
          return null;
        }

        const nextParentPublicId =
          input.parentKnowledgeNodePublicId === undefined
            ? currentNode.parent_public_id
            : input.parentKnowledgeNodePublicId;
        const parentReference =
          nextParentPublicId === null
            ? null
            : await findKnowledgeNodeByPublicId(
                scopedDatabase,
                nextParentPublicId,
              );

        if (nextParentPublicId !== null && parentReference === null) {
          return null;
        }

        const parentScope = validateKnowledgeNodeParentScope({
          current: {
            id: currentNode.id,
            knowledgeBaseId: currentNode.knowledge_base_id,
            profession: currentNode.profession,
          },
          parent:
            parentReference === null
              ? null
              : {
                  id: parentReference.id,
                  knowledgeBaseId: parentReference.knowledge_base_id,
                  profession: parentReference.profession,
                },
        });

        if (parentScope.status === "invalid") {
          return null;
        }

        const parentNode =
          parentReference === null
            ? null
            : await lockKnowledgeNodeParentChainForUpdate(
                scopedDatabase,
                parentReference.public_id,
                currentNode,
              );

        if (parentReference !== null && parentNode === null) {
          return null;
        }

        const nextName = input.name ?? currentNode.name;
        const subtree = await listKnowledgeNodeSubtreeForUpdate(
          scopedDatabase,
          currentNode,
        );
        const mutationPlan = buildKnowledgeNodeSubtreeMutationPlan({
          current: {
            id: currentNode.id,
            depth: currentNode.depth,
            pathName: currentNode.path_name,
          },
          nextName,
          nextParent:
            parentNode === null
              ? null
              : {
                  id: parentNode.id,
                  depth: parentNode.depth,
                  pathName: parentNode.path_name,
                },
          subtree: subtree.map((row) => ({
            id: row.id,
            parentKnowledgeNodeId: row.parent_knowledge_node_id,
            depth: row.depth,
            pathName: row.path_name,
          })),
        });
        await assertKnowledgeNodeDestinationAvailable(
          scopedDatabase,
          currentNode,
          parentNode?.id ?? null,
          nextName,
          mutationPlan.rows,
        );
        const now = new Date();
        const [row] = await scopedDatabase
          .update(knowledgeNode)
          .set({
            parent_knowledge_node_id: parentNode?.id ?? null,
            level_list: input.levelList ?? currentNode.level_list,
            name: nextName,
            path_name: mutationPlan.rootPathName,
            depth: mutationPlan.rootDepth,
            sort_order: input.sortOrder ?? currentNode.sort_order,
            updated_at: now,
          })
          .where(
            and(
              eq(knowledgeNode.id, currentNode.id),
              eq(
                knowledgeNode.knowledge_base_id,
                currentNode.knowledge_base_id,
              ),
              eq(knowledgeNode.profession, currentNode.profession),
              eq(knowledgeNode.updated_at, new Date(input.expectedUpdatedAt)),
            ),
          )
          .returning(createKnowledgeNodeReturningSelection());

        if (row === undefined) {
          throw new KnowledgeNodeMutationConflictError(
            "knowledge_node_stale_version",
          );
        }

        const subtreeIds = mutationPlan.rows
          .map((subtreeRow) => subtreeRow.id)
          .filter((id) => id !== currentNode.id);
        if (subtreeIds.length > 0) {
          const updatedDescendants = await scopedDatabase
            .update(knowledgeNode)
            .set({
              path_name: sql`${mutationPlan.rootPathName} || substring(${knowledgeNode.path_name} from ${currentNode.path_name.length + 1})`,
              depth: sql`${knowledgeNode.depth} + ${mutationPlan.depthDelta}`,
              updated_at: now,
            })
            .where(
              and(
                inArray(knowledgeNode.id, subtreeIds),
                eq(
                  knowledgeNode.knowledge_base_id,
                  currentNode.knowledge_base_id,
                ),
                eq(knowledgeNode.profession, currentNode.profession),
              ),
            )
            .returning({ id: knowledgeNode.id });
          const updatedDescendantIds = new Set(
            updatedDescendants.map((descendant) => descendant.id),
          );

          if (
            updatedDescendantIds.size !== subtreeIds.length ||
            subtreeIds.some((id) => !updatedDescendantIds.has(id))
          ) {
            throw new KnowledgeNodeMutationConflictError(
              "knowledge_node_subtree_identity_mismatch",
            );
          }
        }

        await appendKnowledgeNodeMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        const questionCounts = await listKnowledgeNodeQuestionCounts(
          scopedDatabase,
          [row.id],
        );
        return mapKnowledgeNodeRow(
          row,
          new Map(
            parentNode === null ? [] : [[parentNode.id, parentNode.public_id]],
          ),
          questionCounts.get(row.id) ?? 0,
        );
      });
    },
    async disableKnowledgeNode(publicId, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const currentReference = await findKnowledgeNodeByPublicId(
          scopedDatabase,
          publicId,
        );

        if (currentReference === null) {
          return null;
        }

        await lockKnowledgeTreeMutation(
          scopedDatabase,
          currentReference.knowledge_base_id,
        );
        const [row] = await scopedDatabase
          .update(knowledgeNode)
          .set({
            kn_status: "disabled",
            is_recommendable: false,
            disabled_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(knowledgeNode.public_id, publicId))
          .returning(createKnowledgeNodeReturningSelection());

        if (row === undefined) {
          return null;
        }

        const parentPublicIds = await listParentKnowledgeNodePublicIds(
          scopedDatabase,
          row.parent_knowledge_node_id === null
            ? []
            : [row.parent_knowledge_node_id],
        );
        await appendKnowledgeNodeMutationAuditLog(
          scopedDatabase,
          mutationContext,
          row.public_id,
        );
        const questionCounts = await listKnowledgeNodeQuestionCounts(
          scopedDatabase,
          [row.id],
        );
        return mapKnowledgeNodeRow(
          row,
          parentPublicIds,
          questionCounts.get(row.id) ?? 0,
        );
      });
    },
  };
}

async function appendKnowledgeNodeMutationAuditLog(
  database: RuntimeDatabase,
  mutationContext: KnowledgeNodeMutationContext,
  targetPublicId: string,
): Promise<void> {
  await database.insert(auditLog).values({
    public_id: `audit-log-${randomUUID()}`,
    actor_public_id: mutationContext.actorPublicId,
    actor_role: mutationContext.auditLog.actorRole,
    action_type: mutationContext.auditLog.actionType,
    target_resource_type: "knowledge_node",
    target_public_id: targetPublicId,
    result_status: "success",
    metadata_summary: mutationContext.auditLog.metadataSummary,
    request_ip: mutationContext.auditLog.requestIp,
  });
}

function createResourceConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(
      or(
        ilike(resource.title, `%${queryInput.keyword}%`),
        ilike(resource.original_file_name, `%${queryInput.keyword}%`),
      )!,
    );
  }

  if (isResourceStatus(queryInput.status)) {
    conditions.push(eq(resource.resource_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(resource.profession, queryInput.profession));
  }

  if (queryInput.resourceType !== "all") {
    conditions.push(eq(resource.resource_type, queryInput.resourceType));
  }

  if (queryInput.resourceLevel === "general") {
    conditions.push(sql`cardinality(${resource.level_list}) = 0`);
  } else if (queryInput.resourceLevel !== null) {
    conditions.push(
      sql`${resource.level_list} @> ARRAY[${queryInput.resourceLevel}]::integer[]`,
    );
  }

  return conditions;
}

function createKnowledgeNodeConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(knowledgeNode.path_name, `%${queryInput.keyword}%`));
  }

  if (queryInput.status === "active" || queryInput.status === "disabled") {
    conditions.push(eq(knowledgeNode.kn_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(knowledgeNode.profession, queryInput.profession));
  }

  return conditions;
}

function createResourceOrderBy(
  queryInput: AdminContentKnowledgeListQuery,
): SQL {
  if (queryInput.sortBy === "createdAt") {
    return queryInput.sortOrder === "asc"
      ? asc(resource.created_at)
      : desc(resource.created_at);
  }

  if (queryInput.sortBy === "publishedAt") {
    return queryInput.sortOrder === "asc"
      ? asc(resource.published_at)
      : desc(resource.published_at);
  }

  return queryInput.sortOrder === "asc"
    ? asc(resource.updated_at)
    : desc(resource.updated_at);
}

function createKnowledgeNodeOrderBy(
  queryInput: AdminContentKnowledgeListQuery,
): SQL {
  if (queryInput.sortBy === "sortOrder") {
    return queryInput.sortOrder === "asc"
      ? asc(knowledgeNode.sort_order)
      : desc(knowledgeNode.sort_order);
  }

  if (queryInput.sortBy === "createdAt") {
    return queryInput.sortOrder === "asc"
      ? asc(knowledgeNode.created_at)
      : desc(knowledgeNode.created_at);
  }

  return queryInput.sortOrder === "asc"
    ? asc(knowledgeNode.updated_at)
    : desc(knowledgeNode.updated_at);
}

function createPagination(
  query: Pick<
    AdminContentKnowledgeListQuery,
    "page" | "pageSize" | "sortBy" | "sortOrder"
  >,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

async function listResourceKnowledgeNodePublicIds(
  database: RuntimeDatabase,
  resourceIds: number[],
): Promise<Map<number, string[]>> {
  if (resourceIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      resource_id: knowledgeNodeResource.resource_id,
      knowledge_node_public_id: knowledgeNode.public_id,
    })
    .from(knowledgeNodeResource)
    .innerJoin(
      knowledgeNode,
      eq(knowledgeNode.id, knowledgeNodeResource.knowledge_node_id),
    )
    .where(inArray(knowledgeNodeResource.resource_id, resourceIds))
    .orderBy(
      asc(knowledgeNodeResource.resource_id),
      asc(knowledgeNode.public_id),
    );

  return rows.reduce<Map<number, string[]>>((result, row) => {
    const publicIds = result.get(row.resource_id) ?? [];
    publicIds.push(row.knowledge_node_public_id);
    result.set(row.resource_id, publicIds);
    return result;
  }, new Map());
}

async function findResourceSummaryById(
  database: RuntimeDatabase,
  resourceId: number,
): Promise<AdminResourceOpsListDto["resources"][number] | null> {
  const [resourceRow] = await database
    .select({
      id: resource.id,
      ...createResourceOpsReturningSelection(),
    })
    .from(resource)
    .where(eq(resource.id, resourceId))
    .limit(1);

  if (resourceRow === undefined) {
    return null;
  }

  const knowledgeNodePublicIds =
    (await listResourceKnowledgeNodePublicIds(database, [resourceRow.id])).get(
      resourceRow.id,
    ) ?? [];

  return mapResourceOpsRow(resourceRow, knowledgeNodePublicIds);
}

function mapResourceOpsRow(
  row: ResourceOpsRowForMapping,
  knowledgeNodePublicIds: string[] = [],
): AdminResourceOpsListDto["resources"][number] {
  return {
    publicId: row.public_id,
    title: row.title,
    resourceType: row.resource_type,
    resourceStatus: row.resource_status,
    profession: row.profession,
    level: row.level,
    levelList: row.level_list === null ? null : [...row.level_list],
    knowledgeNodePublicIds,
    originalFileName: row.original_file_name,
    downloadAvailable: hasValidResourceDownloadIdentity(row),
    markdownPreviewAvailable: row.markdown_content_hash !== null,
    isVectorStale: row.is_vector_stale,
    publishedAt: row.published_at?.toISOString() ?? null,
    indexingErrorSummary: createIndexingErrorSummary(
      row.indexing_error_message,
    ),
    uploadedAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const downloadableResourceExtensions = new Set([
  "bin",
  "csv",
  "doc",
  "docx",
  "md",
  "markdown",
  "pdf",
  "ppt",
  "pptx",
  "txt",
  "xls",
  "xlsx",
]);

function hasValidResourceDownloadIdentity(
  row: ResourceOpsRowForMapping,
): boolean {
  if (
    row.object_storage_path === null ||
    row.original_file_name === null ||
    row.content_hash === null ||
    row.file_size_byte === null ||
    !/^[a-f0-9]{64}$/u.test(row.content_hash) ||
    !Number.isSafeInteger(row.file_size_byte) ||
    row.file_size_byte < 0
  ) {
    return false;
  }

  const lastDotIndex = row.original_file_name.lastIndexOf(".");
  const extension =
    lastDotIndex < 0
      ? ""
      : row.original_file_name.slice(lastDotIndex + 1).toLowerCase();

  return (
    downloadableResourceExtensions.has(extension) &&
    new RegExp(
      `^dev/resource/${row.profession}/\\d{4}(?:0[1-9]|1[0-2])/${row.content_hash}\\.${extension}$`,
      "u",
    ).test(row.object_storage_path)
  );
}

function createIndexingErrorSummary(message: string | null): string | null {
  if (message === null) {
    return null;
  }

  return message === "resource_status_not_chunkable" ||
    message === "missing_markdown_content"
    ? message
    : "redacted_indexing_error";
}

function mapKnowledgeNodeRow(
  row: KnowledgeNodeRowForMapping,
  parentPublicIds: ReadonlyMap<number, string>,
  questionCount: number,
): AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] {
  return {
    publicId: row.public_id,
    parentKnowledgeNodePublicId:
      row.parent_knowledge_node_id === null
        ? null
        : (parentPublicIds.get(row.parent_knowledge_node_id) ?? null),
    profession: row.profession,
    levelList: Array.isArray(row.level_list)
      ? (row.level_list as number[])
      : [],
    name: row.name,
    pathName: row.path_name,
    sortOrder: row.sort_order,
    knStatus: row.kn_status,
    questionCount,
    isRecommendable: row.is_recommendable,
    updatedAt: row.updated_at.toISOString(),
  };
}

async function listParentKnowledgeNodePublicIds(
  database: RuntimeDatabase,
  parentKnowledgeNodeIds: number[],
): Promise<Map<number, string>> {
  if (parentKnowledgeNodeIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      id: knowledgeNode.id,
      public_id: knowledgeNode.public_id,
    })
    .from(knowledgeNode)
    .where(inArray(knowledgeNode.id, parentKnowledgeNodeIds));

  return new Map(rows.map((row) => [row.id, row.public_id]));
}

async function findKnowledgeBaseByProfession(
  database: RuntimeDatabase,
  profession: AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number]["profession"],
  lockForUpdate = false,
): Promise<{ id: number; isEnabled: boolean } | null> {
  const query = database
    .select({ id: knowledgeBase.id, is_enabled: knowledgeBase.is_enabled })
    .from(knowledgeBase)
    .where(eq(knowledgeBase.profession, profession))
    .limit(1);
  const rows = lockForUpdate ? await query.for("update") : await query;
  const [row] = rows;

  return row === undefined ? null : { id: row.id, isEnabled: row.is_enabled };
}

async function lockKnowledgeTreeMutation(
  database: RuntimeDatabase,
  knowledgeBaseId: number,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${`knowledge_node_tree:${knowledgeBaseId}`}, 0))`,
  );
}

type KnowledgeNodeLookup = {
  id: number;
  public_id: string;
  parent_public_id: string | null;
  parent_knowledge_node_id: number | null;
  knowledge_base_id: number;
  profession: AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number]["profession"];
  level_list: number[];
  name: string;
  path_name: string;
  depth: number;
  sort_order: number;
  updated_at: Date;
};

async function listKnowledgeNodeSubtreeForUpdate(
  database: RuntimeDatabase,
  current: KnowledgeNodeLookup,
): Promise<
  Array<{
    id: number;
    parent_knowledge_node_id: number | null;
    path_name: string;
    depth: number;
  }>
> {
  const subtree = [
    {
      id: current.id,
      parent_knowledge_node_id: current.parent_knowledge_node_id,
      path_name: current.path_name,
      depth: current.depth,
    },
  ];
  const seenIds = new Set([current.id]);
  let frontier = [current.id];

  while (frontier.length > 0) {
    const query = database
      .select({
        id: knowledgeNode.id,
        parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
        path_name: knowledgeNode.path_name,
        depth: knowledgeNode.depth,
      })
      .from(knowledgeNode)
      .where(inArray(knowledgeNode.parent_knowledge_node_id, frontier))
      .orderBy(asc(knowledgeNode.id));
    const children = await query.for("update");

    for (const child of children) {
      if (seenIds.has(child.id)) {
        throw new KnowledgeNodeMutationConflictError(
          "knowledge_node_subtree_identity_mismatch",
        );
      }

      seenIds.add(child.id);
      subtree.push(child);
    }

    frontier = children.map((child) => child.id);
  }

  return subtree;
}

async function lockKnowledgeNodeParentChainForUpdate(
  database: RuntimeDatabase,
  parentPublicId: string,
  current: KnowledgeNodeLookup,
): Promise<KnowledgeNodeLookup | null> {
  const parent = await findKnowledgeNodeByPublicId(
    database,
    parentPublicId,
    true,
  );
  if (parent === null) {
    return null;
  }

  const seenIds = new Set([current.id]);
  let child: Pick<
    KnowledgeNodeLookup,
    | "id"
    | "parent_knowledge_node_id"
    | "knowledge_base_id"
    | "profession"
    | "path_name"
    | "depth"
  > = parent;

  while (true) {
    if (
      seenIds.has(child.id) ||
      child.knowledge_base_id !== current.knowledge_base_id ||
      child.profession !== current.profession
    ) {
      throw new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      );
    }
    seenIds.add(child.id);

    if (child.parent_knowledge_node_id === null) {
      if (child.depth !== 1 || child.path_name.includes("/")) {
        throw new KnowledgeNodeMutationConflictError(
          "knowledge_node_subtree_identity_mismatch",
        );
      }
      return parent;
    }

    const ancestor = await findKnowledgeNodeByIdForUpdate(
      database,
      child.parent_knowledge_node_id,
    );
    const directPathSuffix =
      ancestor === null
        ? ""
        : child.path_name.slice(ancestor.path_name.length + 1);
    if (
      ancestor === null ||
      child.depth !== ancestor.depth + 1 ||
      !child.path_name.startsWith(`${ancestor.path_name}/`) ||
      directPathSuffix.length === 0 ||
      directPathSuffix.includes("/")
    ) {
      throw new KnowledgeNodeMutationConflictError(
        "knowledge_node_subtree_identity_mismatch",
      );
    }

    child = ancestor;
  }
}

async function assertKnowledgeNodeDestinationAvailable(
  database: RuntimeDatabase,
  current: KnowledgeNodeLookup,
  nextParentKnowledgeNodeId: number | null,
  nextName: string,
  projectedRows: Array<{ id: number; pathName: string }>,
): Promise<void> {
  const projectedIds = new Set(projectedRows.map((row) => row.id));
  const conflicts = await database
    .select({ id: knowledgeNode.id })
    .from(knowledgeNode)
    .where(
      and(
        eq(knowledgeNode.knowledge_base_id, current.knowledge_base_id),
        eq(knowledgeNode.profession, current.profession),
        or(
          and(
            sql`${knowledgeNode.parent_knowledge_node_id} is not distinct from ${nextParentKnowledgeNodeId}`,
            eq(knowledgeNode.name, nextName),
          ),
          inArray(
            knowledgeNode.path_name,
            projectedRows.map((row) => row.pathName),
          ),
        ),
      ),
    )
    .for("update");

  if (conflicts.some((row) => !projectedIds.has(row.id))) {
    throw new KnowledgeNodeMutationConflictError(
      "knowledge_node_path_conflict",
    );
  }
}

async function findKnowledgeNodeByIdForUpdate(
  database: RuntimeDatabase,
  id: number,
): Promise<Pick<
  KnowledgeNodeLookup,
  | "id"
  | "parent_knowledge_node_id"
  | "knowledge_base_id"
  | "profession"
  | "path_name"
  | "depth"
> | null> {
  const [row] = await database
    .select({
      id: knowledgeNode.id,
      parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
      knowledge_base_id: knowledgeNode.knowledge_base_id,
      profession: knowledgeNode.profession,
      path_name: knowledgeNode.path_name,
      depth: knowledgeNode.depth,
    })
    .from(knowledgeNode)
    .where(eq(knowledgeNode.id, id))
    .limit(1)
    .for("update");

  return row ?? null;
}

async function findKnowledgeNodeByPublicId(
  database: RuntimeDatabase,
  publicId: string,
  lockForUpdate = false,
): Promise<KnowledgeNodeLookup | null> {
  const query = database
    .select({
      id: knowledgeNode.id,
      public_id: knowledgeNode.public_id,
      parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
      knowledge_base_id: knowledgeNode.knowledge_base_id,
      profession: knowledgeNode.profession,
      level_list: knowledgeNode.level_list,
      name: knowledgeNode.name,
      path_name: knowledgeNode.path_name,
      depth: knowledgeNode.depth,
      sort_order: knowledgeNode.sort_order,
      updated_at: knowledgeNode.updated_at,
    })
    .from(knowledgeNode)
    .where(eq(knowledgeNode.public_id, publicId))
    .limit(1);
  const rows = lockForUpdate ? await query.for("update") : await query;
  const [row] = rows;

  if (row === undefined) {
    return null;
  }

  const parentPublicIds = await listParentKnowledgeNodePublicIds(
    database,
    row.parent_knowledge_node_id === null ? [] : [row.parent_knowledge_node_id],
  );

  return {
    id: row.id,
    public_id: row.public_id,
    parent_public_id:
      row.parent_knowledge_node_id === null
        ? null
        : (parentPublicIds.get(row.parent_knowledge_node_id) ?? null),
    parent_knowledge_node_id: row.parent_knowledge_node_id,
    knowledge_base_id: row.knowledge_base_id,
    profession: row.profession,
    level_list: Array.isArray(row.level_list)
      ? (row.level_list as number[])
      : [],
    name: row.name,
    path_name: row.path_name,
    depth: row.depth,
    sort_order: row.sort_order,
    updated_at: row.updated_at,
  };
}

function createResourceOpsReturningSelection() {
  return {
    public_id: resource.public_id,
    title: resource.title,
    resource_type: resource.resource_type,
    resource_status: resource.resource_status,
    profession: resource.profession,
    level: resource.level,
    level_list: resource.level_list,
    original_file_name: resource.original_file_name,
    object_storage_path: resource.object_storage_path,
    content_hash: resource.content_hash,
    file_size_byte: resource.file_size_byte,
    markdown_content_hash: resource.markdown_content_hash,
    indexing_error_message: resource.indexing_error_message,
    is_vector_stale: resource.is_vector_stale,
    published_at: resource.published_at,
    created_at: resource.created_at,
    updated_at: resource.updated_at,
  };
}

function createKnowledgeNodeReturningSelection() {
  return {
    id: knowledgeNode.id,
    public_id: knowledgeNode.public_id,
    parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
    profession: knowledgeNode.profession,
    level_list: knowledgeNode.level_list,
    name: knowledgeNode.name,
    path_name: knowledgeNode.path_name,
    sort_order: knowledgeNode.sort_order,
    kn_status: knowledgeNode.kn_status,
    is_recommendable: knowledgeNode.is_recommendable,
    updated_at: knowledgeNode.updated_at,
  };
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
