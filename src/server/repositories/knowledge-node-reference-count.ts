import { count, inArray } from "drizzle-orm";

import { questionKnowledgeNode } from "@/db/schema";
import type { RuntimeDatabase } from "./runtime-database";

export async function listKnowledgeNodeQuestionCounts(
  database: RuntimeDatabase,
  knowledgeNodeIds: number[],
): Promise<ReadonlyMap<number, number>> {
  if (knowledgeNodeIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      knowledgeNodeId: questionKnowledgeNode.knowledge_node_id,
      value: count(),
    })
    .from(questionKnowledgeNode)
    .where(inArray(questionKnowledgeNode.knowledge_node_id, knowledgeNodeIds))
    .groupBy(questionKnowledgeNode.knowledge_node_id);

  return new Map(
    rows.map((row) => [row.knowledgeNodeId, Number(row.value)] as const),
  );
}
