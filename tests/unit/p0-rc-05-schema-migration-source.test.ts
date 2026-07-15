import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  knowledgeBase,
  knowledgeNode,
  knRecommendationCandidate,
  knRecommendationReviewStatusValues,
  knRecommendationTask,
  knRecommendationTaskStatusValues,
  resource,
  resourceChunk,
  resourceIndexGeneration,
  resourceIndexGenerationStatusValues,
} from "@/db/schema/ai-rag";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((index) =>
    index.config.name ? [index.config.name] : [],
  );
}

function getForeignKeyNames(
  table: Parameters<typeof getTableConfig>[0],
): string[] {
  return getTableConfig(table).foreignKeys.map((foreignKey) =>
    foreignKey.getName(),
  );
}

describe("P0 RC-05 durable knowledge and RAG facts", () => {
  it("defines immutable index generations and vector-backed chunks", () => {
    expect(resourceIndexGenerationStatusValues).toEqual([
      "pending",
      "indexing",
      "ready",
      "failed",
      "superseded",
    ]);
    expect(getTableName(resourceIndexGeneration)).toBe(
      "resource_index_generation",
    );
    expect(getColumnNames(resourceIndexGeneration)).toEqual(
      expect.arrayContaining([
        "public_id",
        "request_public_id",
        "resource_id",
        "source_content_hash",
        "generation_status",
        "embedding_model_config_id",
        "embedding_dimension",
        "chunk_count",
        "is_active",
        "failure_message_digest",
        "started_at",
        "completed_at",
      ]),
    );
    expect(getIndexNames(resourceIndexGeneration)).toEqual(
      expect.arrayContaining([
        "udx_resource_index_generation_public_id",
        "udx_resource_index_generation_request_public_id",
        "udx_resource_index_generation_active_resource",
      ]),
    );

    expect(getTableName(resourceChunk)).toBe("resource_chunk");
    expect(getColumnNames(resourceChunk)).toEqual(
      expect.arrayContaining([
        "public_id",
        "resource_index_generation_id",
        "resource_id",
        "chunk_index",
        "heading_path",
        "content",
        "content_hash",
        "keyword_token_list",
        "embedding",
      ]),
    );
    expect(getIndexNames(resourceChunk)).toEqual(
      expect.arrayContaining([
        "udx_resource_chunk_public_id",
        "udx_resource_chunk_generation_chunk_index",
        "idx_resource_chunk_keyword_token_list",
        "idx_resource_chunk_embedding_cosine",
      ]),
    );
  });

  it("persists question-revision recommendation and review facts", () => {
    expect(knRecommendationTaskStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "superseded",
    ]);
    expect(knRecommendationReviewStatusValues).toEqual([
      "pending",
      "confirmed",
      "ignored",
    ]);
    expect(getTableName(knRecommendationTask)).toBe("kn_recommendation_task");
    expect(getColumnNames(knRecommendationTask)).toEqual(
      expect.arrayContaining([
        "public_id",
        "request_public_id",
        "question_id",
        "question_revision_at",
        "task_status",
        "evidence_status",
        "model_config_id",
        "prompt_template_id",
        "requested_by_user_public_id",
        "failure_code",
      ]),
    );
    expect(getIndexNames(knRecommendationTask)).toEqual(
      expect.arrayContaining([
        "udx_kn_recommendation_task_public_id",
        "udx_kn_recommendation_task_request_public_id",
        "udx_kn_recommendation_task_question_revision",
      ]),
    );

    expect(getTableName(knRecommendationCandidate)).toBe(
      "kn_recommendation_candidate",
    );
    expect(getColumnNames(knRecommendationCandidate)).toEqual(
      expect.arrayContaining([
        "public_id",
        "kn_recommendation_task_id",
        "knowledge_node_id",
        "rank",
        "confidence_basis_point",
        "reason_summary",
        "citation_snapshot",
        "review_status",
        "reviewed_by_user_public_id",
        "reviewed_at",
      ]),
    );
  });

  it("backstops knowledge base, resource, node and parent scope in schema", () => {
    expect(getIndexNames(knowledgeBase)).toContain(
      "udx_knowledge_base_id_profession",
    );
    expect(getIndexNames(resource)).toContain(
      "udx_resource_id_knowledge_base_id_profession",
    );
    expect(getIndexNames(knowledgeNode)).toContain(
      "udx_knowledge_node_id_knowledge_base_id_profession",
    );
    expect(getForeignKeyNames(resource)).toContain(
      "fk_resource_knowledge_base_scope",
    );
    expect(getForeignKeyNames(knowledgeNode)).toEqual(
      expect.arrayContaining([
        "fk_knowledge_node_knowledge_base_scope",
        "fk_knowledge_node_parent_scope",
      ]),
    );
  });
});

describe("P0 RC-05 generated migration source", () => {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const migrationNames = readdirSync(drizzleDirectory).filter((name) =>
    name.includes("_p0_rc_05_"),
  );
  const migrationName = migrationNames.find((name) =>
    name.endsWith("_p0_rc_05_knowledge_resource_rag_citation.sql"),
  );

  it("creates facts and constraints without fabricated backfill", () => {
    expect(migrationName).toBeDefined();
    const migrationSource = migrationNames
      .map((name) => readFileSync(resolve(drizzleDirectory, name), "utf8"))
      .join("\n");
    const normalized = migrationSource.toLowerCase();

    expect(migrationSource).toContain(
      'CREATE TABLE "resource_index_generation"',
    );
    expect(migrationSource).toContain('CREATE TABLE "resource_chunk"');
    expect(migrationSource).toContain('CREATE TABLE "kn_recommendation_task"');
    expect(migrationSource).toContain(
      'CREATE TABLE "kn_recommendation_candidate"',
    );
    expect(migrationSource).toContain('"embedding" vector(1536)');
    expect(migrationSource).toContain(
      'CREATE INDEX "idx_resource_chunk_keyword_token_list"',
    );
    expect(migrationSource).toContain(
      'CREATE INDEX "idx_resource_chunk_embedding_cosine"',
    );
    expect(migrationSource).toContain(
      'CONSTRAINT "fk_knowledge_node_parent_scope"',
    );
    expect(normalized).not.toMatch(/^\s*(?:drop|truncate|update|insert)\b/imu);
  });

  it("keeps the generated snapshot and journal entry in the chain", () => {
    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as { entries: { idx: number; tag: string }[] };
    const entry = journal.entries.find((candidate) =>
      candidate.tag.endsWith("_p0_rc_05_knowledge_resource_rag_citation"),
    );
    const indexEntry = journal.entries.find((candidate) =>
      candidate.tag.endsWith("_p0_rc_05_rag_retrieval_indexes"),
    );

    expect(entry).toEqual(expect.objectContaining({ idx: 25 }));
    const timestamp = entry?.tag.slice(0, 14) ?? "missing";
    expect(
      existsSync(
        resolve(process.cwd(), `drizzle/meta/${timestamp}_snapshot.json`),
      ),
    ).toBe(true);
    expect(indexEntry).toEqual(expect.objectContaining({ idx: 26 }));
    const indexTimestamp = indexEntry?.tag.slice(0, 14) ?? "missing";
    expect(
      existsSync(
        resolve(process.cwd(), `drizzle/meta/${indexTimestamp}_snapshot.json`),
      ),
    ).toBe(true);
  });
});
