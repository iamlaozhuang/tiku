import { randomUUID } from "node:crypto";

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
  resourceChunk,
  resourceIndexGeneration,
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
  resourceStatus: Extract<ResourceStatus, "draft" | "conversion_failed">;
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

export type RagResourceRuntimeRepository = {
  createResourceFromUpload?(
    input: CreateResourceFromUploadInput,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  listResources(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ResourceKnowledgePage<AdminResourceOpsListDto>>;
  findResourceDetail?(publicId: string): Promise<{
    resource: AdminResourceOpsListDto["resources"][number];
    markdownContent: string | null;
  } | null>;
  updateResourceMarkdown?(
    publicId: string,
    markdownContent: string,
    markdownContentHash: string,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  disableResource?(
    publicId: string,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  enableResource?(
    publicId: string,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
  publishResourceMarkdown(
    publicId: string,
  ): Promise<ResourcePublishMarkdownResult>;
  findResourceForIndexing(
    publicId: string,
  ): Promise<ResourceIndexingSource | null>;
  requestResourceIndexRebuild?(
    resourcePublicId: string,
    requestPublicId: string,
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
    async createResourceFromUpload(input) {
      return createResourceFromUpload(getDatabase(), input);
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
      };
    },
    async updateResourceMarkdown(
      publicId,
      markdownContent,
      markdownContentHash,
    ) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const resourceQuery = scopedDatabase
          .select({
            id: resource.id,
            resource_status: resource.resource_status,
          })
          .from(resource)
          .where(eq(resource.public_id, publicId))
          .limit(1);
        const [resourceRow] = await resourceQuery.for("update");

        if (resourceRow === undefined) {
          return null;
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
        const nextStatus: ResourceStatus =
          resourceRow.resource_status === "disabled"
            ? "disabled"
            : hasActiveGeneration
              ? "rag_ready"
              : "draft";
        const [row] = await scopedDatabase
          .update(resource)
          .set({
            markdown_content: markdownContent,
            markdown_content_hash: markdownContentHash,
            resource_status: nextStatus,
            is_vector_stale: hasActiveGeneration,
            indexing_error_message: null,
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
        return mapResourceOpsRow(row, knowledgeNodePublicIds);
      });
    },
    async disableResource(publicId) {
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
        return mapResourceOpsRow(row, knowledgeNodePublicIds);
      });
    },
    async enableResource(publicId) {
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
        return mapResourceOpsRow(row, knowledgeNodePublicIds);
      });
    },
    async publishResourceMarkdown(publicId) {
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
    async requestResourceIndexRebuild(resourcePublicId, requestPublicId) {
      return requestResourceIndexRebuild(
        getDatabase(),
        resourcePublicId,
        requestPublicId,
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

async function createResourceFromUpload(
  database: RuntimeDatabase,
  input: CreateResourceFromUploadInput,
): Promise<AdminResourceOpsListDto["resources"][number] | null> {
  const levelList =
    input.levelList ?? (typeof input.level === "number" ? [input.level] : null);

  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
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
            .where(
              inArray(knowledgeNode.public_id, input.knowledgeNodePublicIds),
            )
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
      ...mapResourceOpsRow(resourceRow),
      knowledgeNodePublicIds: [...input.knowledgeNodePublicIds],
    };
  });
}

async function requestResourceIndexRebuild(
  database: RuntimeDatabase,
  resourcePublicId: string,
  requestPublicId: string,
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

    return {
      status: "accepted",
      generationPublicId,
      resourcePublicId: resourceRow.public_id,
      resourceStatus: nextResourceStatus,
      replayed: false,
    };
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

      return {
        knowledgeNodes: rows.map((row) =>
          mapKnowledgeNodeRow(row, parentPublicIds),
        ),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async createKnowledgeNode(input, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
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
        );
      });
    },
    async updateKnowledgeNode(publicId, input, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const currentNode = await findKnowledgeNodeByPublicId(
          scopedDatabase,
          publicId,
          true,
        );

        if (currentNode === null) {
          return null;
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
        const parentNode =
          nextParentPublicId === null
            ? null
            : await findKnowledgeNodeByPublicId(
                scopedDatabase,
                nextParentPublicId,
                true,
              );

        if (nextParentPublicId !== null && parentNode === null) {
          return null;
        }

        const parentScope = validateKnowledgeNodeParentScope({
          current: {
            id: currentNode.id,
            knowledgeBaseId: currentNode.knowledge_base_id,
            profession: currentNode.profession,
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

        if (
          parentScope.status === "invalid" ||
          (parentNode !== null &&
            (await isKnowledgeNodeDescendant(
              scopedDatabase,
              parentNode.id,
              currentNode.id,
            )))
        ) {
          return null;
        }

        const nextName = input.name ?? currentNode.name;
        const depth = (parentNode?.depth ?? 0) + 1;
        assertKnowledgeNodeDepth(depth);
        const [row] = await scopedDatabase
          .update(knowledgeNode)
          .set({
            parent_knowledge_node_id: parentNode?.id ?? null,
            level_list: input.levelList ?? currentNode.level_list,
            name: nextName,
            path_name:
              parentNode === null
                ? nextName
                : `${parentNode.path_name}/${nextName}`,
            depth,
            sort_order: input.sortOrder ?? currentNode.sort_order,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(knowledgeNode.id, currentNode.id),
              eq(
                knowledgeNode.knowledge_base_id,
                currentNode.knowledge_base_id,
              ),
              eq(knowledgeNode.profession, currentNode.profession),
            ),
          )
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
        );
      });
    },
    async disableKnowledgeNode(publicId, mutationContext) {
      const database = getDatabase();
      return database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
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
        return mapKnowledgeNodeRow(row, parentPublicIds);
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
    downloadAvailable: row.object_storage_path !== null,
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
    questionCount: 0,
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
};

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
  };
}

async function isKnowledgeNodeDescendant(
  database: RuntimeDatabase,
  candidateNodeId: number,
  ancestorNodeId: number,
): Promise<boolean> {
  let nextNodeId: number | null = candidateNodeId;

  for (let depth = 0; depth < maxKnowledgeNodeDepth; depth += 1) {
    if (nextNodeId === ancestorNodeId) {
      return true;
    }

    const [row] = await database
      .select({
        parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
      })
      .from(knowledgeNode)
      .where(eq(knowledgeNode.id, nextNodeId))
      .limit(1);

    if (row === undefined || row.parent_knowledge_node_id === null) {
      return false;
    }

    nextNodeId = row.parent_knowledge_node_id;
  }

  return false;
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
