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

import { knowledgeNode } from "@/db/schema";
import type {
  AdminContentKnowledgeListQuery,
  AdminKnowledgeNodeOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type { ApiPagination } from "../contracts/api-response";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import { listKnowledgeNodeQuestionCounts } from "./knowledge-node-reference-count";

export type ContentKnowledgeNodePage<TData> = TData & {
  pagination: ApiPagination;
};

export type ContentKnowledgeNodeRuntimeRepository = {
  listKnowledgeNodes(
    query: AdminContentKnowledgeListQuery,
  ): Promise<ContentKnowledgeNodePage<AdminKnowledgeNodeOpsListDto>>;
};

export function createPostgresContentKnowledgeNodeRuntimeRepository(
  options: RuntimeDatabaseOptions = {},
): ContentKnowledgeNodeRuntimeRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for knowledge_node runtime.",
  );

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
        knowledgeNodes: rows.map((row) => ({
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
          questionCount: questionCounts.get(row.id) ?? 0,
          isRecommendable: row.is_recommendable,
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
  };
}

function createKnowledgeNodeConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(knowledgeNode.path_name, `%${queryInput.keyword}%`));
  }

  if (queryInput.publicIds.length > 0) {
    conditions.push(inArray(knowledgeNode.public_id, queryInput.publicIds));
  }

  if (queryInput.status === "active" || queryInput.status === "disabled") {
    conditions.push(eq(knowledgeNode.kn_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(knowledgeNode.profession, queryInput.profession));
  }

  return conditions;
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
