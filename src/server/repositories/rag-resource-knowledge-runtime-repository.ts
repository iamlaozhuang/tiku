import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  type SQL,
} from "drizzle-orm";

import { knowledgeBase, knowledgeNode, resource } from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminContentKnowledgeListQuery,
  AdminKnowledgeNodeOpsListDto,
  AdminResourceOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type { ResourceStatus } from "../models/ai-rag";
import {
  assertKnowledgeNodeDepth,
  canTransitionResourceStatus,
  maxKnowledgeNodeDepth,
} from "../models/ai-rag";
import type {
  KnowledgeNodeMutationInput,
  KnowledgeNodeUpdateInput,
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
  level: number | null;
  markdownContent: string | null;
  markdownContentHash: string | null;
  originalFileName: string | null;
  resourceType: AdminResourceOpsListDto["resources"][number]["resourceType"];
  isVectorStale: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveResourceIndexingResultInput = {
  resourcePublicId: string;
  status: "success" | "failed";
  chunkCount: number;
  textHashes: string[];
  indexingErrorMessage: string | null;
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
  listResources(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ResourceKnowledgePage<AdminResourceOpsListDto>>;
  publishResourceMarkdown(
    publicId: string,
  ): Promise<ResourcePublishMarkdownResult>;
  markResourceIndexingStarted(publicId: string): Promise<void>;
  findResourceForIndexing(
    publicId: string,
  ): Promise<ResourceIndexingSource | null>;
  saveResourceIndexingResult(
    input: SaveResourceIndexingResultInput,
  ): Promise<AdminResourceOpsListDto["resources"][number] | null>;
};

export type RagKnowledgeNodeRuntimeRepository = {
  listKnowledgeNodes(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ResourceKnowledgePage<AdminKnowledgeNodeOpsListDto>>;
  createKnowledgeNode(
    input: KnowledgeNodeMutationInput,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
  updateKnowledgeNode(
    publicId: string,
    input: KnowledgeNodeUpdateInput,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
  disableKnowledgeNode(
    publicId: string,
  ): Promise<AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number] | null>;
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
  public_id: string;
  title: string;
  resource_type: AdminResourceOpsListDto["resources"][number]["resourceType"];
  resource_status: AdminResourceOpsListDto["resources"][number]["resourceStatus"];
  profession: AdminResourceOpsListDto["resources"][number]["profession"];
  level: number | null;
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
    async listResources(queryInput) {
      const database = getDatabase();
      const conditions = createResourceConditions(queryInput);
      const rows = await database
        .select({
          public_id: resource.public_id,
          title: resource.title,
          resource_type: resource.resource_type,
          resource_status: resource.resource_status,
          profession: resource.profession,
          level: resource.level,
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

      return {
        resources: rows.map(mapResourceOpsRow),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async publishResourceMarkdown(publicId) {
      const database = getDatabase();
      const [currentRow] = await database
        .select({
          resource_status: resource.resource_status,
          markdown_content: resource.markdown_content,
          markdown_content_hash: resource.markdown_content_hash,
        })
        .from(resource)
        .where(eq(resource.public_id, publicId))
        .limit(1);

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
      const [row] = await database
        .update(resource)
        .set({
          resource_status: "published",
          indexing_error_message: null,
          is_vector_stale: true,
          published_at: now,
          disabled_at: null,
          updated_at: now,
        })
        .where(eq(resource.public_id, publicId))
        .returning(createResourceOpsReturningSelection());

      return row === undefined
        ? { status: "not_found" }
        : { status: "published", resource: mapResourceOpsRow(row) };
    },
    async markResourceIndexingStarted(publicId) {
      const database = getDatabase();

      await database
        .update(resource)
        .set({
          resource_status: "indexing",
          updated_at: new Date(),
        })
        .where(eq(resource.public_id, publicId));
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
          level: resource.level,
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
            level: row.level,
            markdownContent: row.markdown_content,
            markdownContentHash: row.markdown_content_hash,
            originalFileName: row.original_file_name,
            resourceType: row.resource_type,
            isVectorStale: row.is_vector_stale,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
    },
    async saveResourceIndexingResult(input) {
      const database = getDatabase();
      const nextStatus: ResourceStatus =
        input.status === "success" ? "rag_ready" : "index_failed";
      const [row] = await database
        .update(resource)
        .set({
          resource_status: nextStatus,
          indexing_error_message: input.indexingErrorMessage,
          is_vector_stale: false,
          updated_at: new Date(),
        })
        .where(eq(resource.public_id, input.resourcePublicId))
        .returning({
          public_id: resource.public_id,
          title: resource.title,
          resource_type: resource.resource_type,
          resource_status: resource.resource_status,
          profession: resource.profession,
          level: resource.level,
          original_file_name: resource.original_file_name,
          object_storage_path: resource.object_storage_path,
          markdown_content_hash: resource.markdown_content_hash,
          indexing_error_message: resource.indexing_error_message,
          is_vector_stale: resource.is_vector_stale,
          published_at: resource.published_at,
          created_at: resource.created_at,
          updated_at: resource.updated_at,
        });

      return row === undefined ? null : mapResourceOpsRow(row);
    },
  };
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
    async createKnowledgeNode(input) {
      const database = getDatabase();
      const knowledgeBaseId = await findKnowledgeBaseIdByProfession(
        database,
        input.profession,
      );

      if (knowledgeBaseId === null) {
        return null;
      }

      const parentNode =
        input.parentKnowledgeNodePublicId === null
          ? null
          : await findKnowledgeNodeByPublicId(
              database,
              input.parentKnowledgeNodePublicId,
            );

      if (input.parentKnowledgeNodePublicId !== null && parentNode === null) {
        return null;
      }

      const depth = (parentNode?.depth ?? 0) + 1;
      assertKnowledgeNodeDepth(depth);
      const [row] = await database
        .insert(knowledgeNode)
        .values({
          public_id: `knowledge-node-${randomUUID()}`,
          knowledge_base_id: knowledgeBaseId,
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

      return row === undefined
        ? null
        : mapKnowledgeNodeRow(
            row,
            new Map(
              parentNode === null
                ? []
                : [[parentNode.id, parentNode.public_id]],
            ),
          );
    },
    async updateKnowledgeNode(publicId, input) {
      const database = getDatabase();
      const currentNode = await findKnowledgeNodeByPublicId(database, publicId);

      if (currentNode === null) {
        return null;
      }

      const nextParentPublicId =
        input.parentKnowledgeNodePublicId === undefined
          ? currentNode.parent_public_id
          : input.parentKnowledgeNodePublicId;
      const parentNode =
        nextParentPublicId === null
          ? null
          : await findKnowledgeNodeByPublicId(database, nextParentPublicId);

      if (nextParentPublicId !== null && parentNode === null) {
        return null;
      }

      if (
        parentNode !== null &&
        (parentNode.id === currentNode.id ||
          (await isKnowledgeNodeDescendant(
            database,
            parentNode.id,
            currentNode.id,
          )))
      ) {
        return null;
      }

      const nextName = input.name ?? currentNode.name;
      const depth = (parentNode?.depth ?? 0) + 1;
      assertKnowledgeNodeDepth(depth);
      const [row] = await database
        .update(knowledgeNode)
        .set({
          parent_knowledge_node_id: parentNode?.id ?? null,
          profession: input.profession ?? currentNode.profession,
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
        .where(eq(knowledgeNode.public_id, publicId))
        .returning(createKnowledgeNodeReturningSelection());

      return row === undefined
        ? null
        : mapKnowledgeNodeRow(
            row,
            new Map(
              parentNode === null
                ? []
                : [[parentNode.id, parentNode.public_id]],
            ),
          );
    },
    async disableKnowledgeNode(publicId) {
      const database = getDatabase();
      const [row] = await database
        .update(knowledgeNode)
        .set({
          kn_status: "disabled",
          is_recommendable: false,
          disabled_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(knowledgeNode.public_id, publicId))
        .returning(createKnowledgeNodeReturningSelection());
      const parentPublicIds = await listParentKnowledgeNodePublicIds(
        database,
        row?.parent_knowledge_node_id === null ||
          row?.parent_knowledge_node_id === undefined
          ? []
          : [row.parent_knowledge_node_id],
      );

      return row === undefined
        ? null
        : mapKnowledgeNodeRow(row, parentPublicIds);
    },
  };
}

function createResourceConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(resource.title, `%${queryInput.keyword}%`));
  }

  if (isResourceStatus(queryInput.status)) {
    conditions.push(eq(resource.resource_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(resource.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(resource.level, queryInput.level));
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

function mapResourceOpsRow(
  row: ResourceOpsRowForMapping,
): AdminResourceOpsListDto["resources"][number] {
  return {
    publicId: row.public_id,
    title: row.title,
    resourceType: row.resource_type,
    resourceStatus: row.resource_status,
    profession: row.profession,
    level: row.level,
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

async function findKnowledgeBaseIdByProfession(
  database: RuntimeDatabase,
  profession: AdminKnowledgeNodeOpsListDto["knowledgeNodes"][number]["profession"],
): Promise<number | null> {
  const [row] = await database
    .select({ id: knowledgeBase.id })
    .from(knowledgeBase)
    .where(eq(knowledgeBase.profession, profession))
    .limit(1);

  return row?.id ?? null;
}

type KnowledgeNodeLookup = {
  id: number;
  public_id: string;
  parent_public_id: string | null;
  parent_knowledge_node_id: number | null;
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
): Promise<KnowledgeNodeLookup | null> {
  const [row] = await database
    .select({
      id: knowledgeNode.id,
      public_id: knowledgeNode.public_id,
      parent_knowledge_node_id: knowledgeNode.parent_knowledge_node_id,
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
