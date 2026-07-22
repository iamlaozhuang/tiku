import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

import * as paperSchema from "./paper";

import {
  paper,
  paperCommand,
  paperSection,
  paperScoringPoint,
  question,
  questionGroup,
  questionKnowledgeNode,
  questionTag,
  questionTypeValues,
  tag,
} from "./paper";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

describe("paper_attachment_usage contract", () => {
  it("separates the seven persisted values from the six creatable values", () => {
    expect(paperSchema.paperAttachmentUsageValues).toEqual([
      "paper_source",
      "answer_analysis",
      "answer_sheet",
      "other",
      "material_paper",
      "answer_paper",
      "source_material",
    ]);
    expect(paperSchema.paperAttachmentCreatableUsageValues).toEqual([
      "paper_source",
      "material_paper",
      "answer_sheet",
      "answer_paper",
      "answer_analysis",
      "source_material",
    ]);
  });

  it("registers the canonical database column and labels in the glossary", () => {
    const glossarySource = readFileSync(
      resolve(process.cwd(), "docs/03-standards/glossary.yaml"),
      "utf8",
    );
    const usageContractStart = glossarySource.lastIndexOf(
      "  paper_attachment_usage:\n",
    );
    const usageContractEnd = glossarySource.indexOf(
      "\n  exam_mode:",
      usageContractStart,
    );
    const usageContract = glossarySource.slice(
      usageContractStart,
      usageContractEnd,
    );

    expect(usageContract).toContain("db_column: paper_attachment_usage");
    expect(usageContract).toContain("key: paper_source, chinese: 试卷文件");
    expect(usageContract).toContain("key: material_paper, chinese: 材料卷");
    expect(usageContract).toContain("key: answer_sheet, chinese: 答题卷");
    expect(usageContract).toContain("key: answer_paper, chinese: 答案卷");
    expect(usageContract).toContain("key: answer_analysis, chinese: 解析文件");
    expect(usageContract).toContain(
      "key: source_material, chinese: 来源教材或课件",
    );
    expect(usageContract).toContain("key: other, chinese: 其他（历史）");
  });

  it("generates only the three additive enum values with a monotonic snapshot", () => {
    const migrationSource = readFileSync(
      resolve(
        process.cwd(),
        "drizzle/20260722033000_p1_rc_05_paper_asset_usage_contract.sql",
      ),
      "utf8",
    );
    const previousSnapshot = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/20260722023000_snapshot.json"),
        "utf8",
      ),
    ) as { id: string };
    const snapshot = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/20260722033000_snapshot.json"),
        "utf8",
      ),
    ) as {
      prevId: string;
      enums: Record<string, { values: string[] }>;
    };
    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as { entries: Array<{ idx: number; tag: string; when: number }> };

    expect(
      migrationSource.match(
        /ALTER TYPE "public"\."paper_attachment_usage" ADD VALUE/g,
      ),
    ).toHaveLength(3);
    expect(migrationSource).toContain("ADD VALUE 'material_paper'");
    expect(migrationSource).toContain("ADD VALUE 'answer_paper'");
    expect(migrationSource).toContain("ADD VALUE 'source_material'");
    expect(migrationSource).not.toMatch(
      /\b(?:DROP|RENAME|CREATE TYPE|ALTER TABLE|UPDATE|DELETE|INSERT)\b/u,
    );
    expect(snapshot.prevId).toBe(previousSnapshot.id);
    expect(snapshot.enums["public.paper_attachment_usage"]?.values).toEqual([
      "paper_source",
      "answer_analysis",
      "answer_sheet",
      "other",
      "material_paper",
      "answer_paper",
      "source_material",
    ]);
    const usageEntry = journal.entries.find(
      (entry) =>
        entry.tag === "20260722033000_p1_rc_05_paper_asset_usage_contract",
    );
    const usageEntryIndex = journal.entries.indexOf(usageEntry as never);

    expect(usageEntry).toEqual({
      idx: 43,
      version: "7",
      when: 1784691000000,
      tag: "20260722033000_p1_rc_05_paper_asset_usage_contract",
      breakpoints: true,
    });
    expect(journal.entries[usageEntryIndex - 1]?.when).toBeLessThan(
      usageEntry?.when ?? 0,
    );
  });

  it("adds only the durable paper_asset cleanup job schema source", () => {
    const cleanupJob = paperSchema.paperAssetCleanupJob;
    const migrationSource = readFileSync(
      resolve(
        process.cwd(),
        "drizzle/20260722043000_p1_rc_05_paper_asset_file_lifecycle.sql",
      ),
      "utf8",
    );
    const previousSnapshot = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/20260722033000_snapshot.json"),
        "utf8",
      ),
    ) as { id: string };
    const snapshot = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/20260722043000_snapshot.json"),
        "utf8",
      ),
    ) as { prevId: string };

    expect(cleanupJob).toBeDefined();
    expect(getTableName(cleanupJob as never)).toBe("paper_asset_cleanup_job");
    expect(getColumnNames(cleanupJob as never)).toEqual(
      expect.arrayContaining([
        "public_id",
        "source_paper_asset_public_id",
        "profession",
        "object_key",
        "file_name",
        "file_size_byte",
        "file_hash",
        "cleanup_status",
        "attempt_count",
        "last_failure_message_digest",
        "claimed_at",
        "completed_at",
      ]),
    );
    expect(getIndexNames(cleanupJob as never)).toEqual(
      expect.arrayContaining([
        "udx_paper_asset_cleanup_job_public_id",
        "udx_paper_asset_cleanup_job_source_paper_asset_public_id",
        "idx_paper_asset_cleanup_job_object_key",
        "idx_paper_asset_cleanup_job_status_updated_at",
      ]),
    );
    expect(migrationSource).toContain(
      'CREATE TYPE "public"."paper_asset_cleanup_job_status"',
    );
    expect(migrationSource).toContain('CREATE TABLE "paper_asset_cleanup_job"');
    expect(migrationSource).not.toMatch(
      /(?:^|\n)(?:DROP|TRUNCATE|UPDATE|DELETE|ALTER TABLE)\s/u,
    );
    expect(snapshot.prevId).toBe(previousSnapshot.id);
  });
});

describe("paper schema question_type enum", () => {
  it("persists managed content_image metadata and its resumable upload operation independently from paper_asset", () => {
    const schema = paperSchema as unknown as Record<string, unknown>;
    const contentImage = schema.contentImage;
    const uploadOperation = schema.contentImageUploadOperation;

    expect(contentImage).toBeDefined();
    expect(uploadOperation).toBeDefined();
    expect(schema.contentImageUploadOperationStatusValues).toEqual([
      "pending",
      "file_stored",
      "completed",
      "failed",
    ]);
    expect(getTableName(contentImage as never)).toBe("content_image");
    expect(getColumnNames(contentImage as never)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "object_key",
        "content_type",
        "file_size_byte",
        "file_hash",
        "created_by_admin_id",
        "created_at",
      ]),
    );
    expect(getIndexNames(contentImage as never)).toEqual(
      expect.arrayContaining([
        "udx_content_image_public_id",
        "idx_content_image_file_hash",
      ]),
    );
    expect(getTableName(uploadOperation as never)).toBe(
      "content_image_upload_operation",
    );
    expect(getColumnNames(uploadOperation as never)).toEqual(
      expect.arrayContaining([
        "content_image_id",
        "content_image_public_id",
        "idempotency_key_hash",
        "request_fingerprint",
        "operation_status",
        "last_failure_message_digest",
        "file_stored_at",
        "completed_at",
      ]),
    );
  });

  it("persists a resumable paper_asset upload operation", () => {
    const uploadOperation = (paperSchema as unknown as Record<string, unknown>)
      .paperAssetUploadOperation;

    expect(uploadOperation).toBeDefined();
    expect(paperSchema.paperAssetUploadOperationStatusValues).toEqual([
      "pending",
      "file_stored",
      "completed",
      "failed",
    ]);
    expect(getTableName(uploadOperation as never)).toBe(
      "paper_asset_upload_operation",
    );
    expect(getColumnNames(uploadOperation as never)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "actor_admin_id",
        "paper_id",
        "paper_asset_id",
        "paper_asset_public_id",
        "idempotency_key_hash",
        "request_fingerprint",
        "object_key",
        "operation_status",
        "last_failure_message_digest",
        "file_stored_at",
        "completed_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getIndexNames(uploadOperation as never)).toEqual(
      expect.arrayContaining([
        "udx_paper_asset_upload_operation_public_id",
        "udx_paper_asset_upload_operation_idempotency_key_hash",
        "udx_paper_asset_upload_operation_paper_asset_public_id",
        "udx_paper_asset_upload_operation_paper_asset_id",
        "idx_paper_asset_upload_operation_status_updated_at",
      ]),
    );
  });

  it("registers all MVP question types", () => {
    expect(questionTypeValues).toEqual([
      "single_choice",
      "multi_choice",
      "true_false",
      "fill_blank",
      "short_answer",
      "case_analysis",
      "calculation",
    ]);
  });

  it("persists question knowledge_node and tag bindings with approved association tables", () => {
    expect([
      getTableName(tag),
      getTableName(questionKnowledgeNode),
      getTableName(questionTag),
    ]).toEqual(["tag", "question_knowledge_node", "question_tag"]);

    expect(getColumnNames(tag)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "name",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(questionKnowledgeNode)).toEqual(
      expect.arrayContaining([
        "id",
        "question_id",
        "knowledge_node_id",
        "created_at",
      ]),
    );
    expect(getColumnNames(questionTag)).toEqual(
      expect.arrayContaining(["id", "question_id", "tag_id", "created_at"]),
    );
    expect(getIndexNames(questionKnowledgeNode)).toEqual(
      expect.arrayContaining([
        "udx_question_knowledge_node_question_id_knowledge_node_id",
        "idx_question_knowledge_node_question_id",
        "idx_question_knowledge_node_knowledge_node_id",
      ]),
    );
    expect(getIndexNames(questionTag)).toEqual(
      expect.arrayContaining([
        "udx_question_tag_question_id_tag_id",
        "idx_question_tag_question_id",
        "idx_question_tag_tag_id",
      ]),
    );
  });

  it("stores fill_blank per-blank answer scoring details on source questions", () => {
    expect(getColumnNames(question)).toEqual(
      expect.arrayContaining(["fill_blank_answers"]),
    );
  });

  it("persists paper aggregate concurrency and stable child identities", () => {
    expect(getColumnNames(paper)).toEqual(expect.arrayContaining(["revision"]));
    expect(getColumnNames(questionGroup)).toEqual(
      expect.arrayContaining(["public_id"]),
    );
    expect(getColumnNames(paperSection)).toEqual(
      expect.arrayContaining(["public_id"]),
    );
    expect(getColumnNames(paperScoringPoint)).toEqual(
      expect.arrayContaining(["public_id"]),
    );
    expect(getIndexNames(questionGroup)).toContain(
      "udx_question_group_public_id",
    );
    expect(getIndexNames(paperSection)).toEqual(
      expect.arrayContaining([
        "udx_paper_section_public_id",
        "udx_paper_section_paper_id_sort_order",
      ]),
    );
    expect(getIndexNames(questionGroup)).toContain(
      "udx_question_group_paper_section_id_sort_order",
    );
    expect(getIndexNames(paperScoringPoint)).toContain(
      "udx_paper_scoring_point_public_id",
    );
  });

  it("safely backfills paper_section identity and normalizes order before constraints", () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        "drizzle/20260722023000_p1_rc_05_paper_structure_identity.sql",
      ),
      "utf8",
    );
    expect(migration).toContain(
      'ALTER TABLE "paper_section" ADD COLUMN "public_id" text;',
    );
    expect(migration).toContain('UPDATE "paper_section"');
    expect(migration.indexOf('UPDATE "paper_section"')).toBeLessThan(
      migration.indexOf('ALTER COLUMN "public_id" SET NOT NULL'),
    );
    expect(migration).toContain("ranked_paper_section");
    expect(migration).toContain("ranked_question_group");
    expect(migration).not.toMatch(/DROP|TRUNCATE/iu);
  });

  it("persists paper command idempotency keys without exposing internal IDs", () => {
    expect(getTableName(paperCommand)).toBe("paper_command");
    expect(getColumnNames(paperCommand)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "actor_admin_id",
        "paper_id",
        "command_kind",
        "request_hash",
        "result_public_id",
        "created_at",
      ]),
    );
    expect(getIndexNames(paperCommand)).toEqual(
      expect.arrayContaining([
        "udx_paper_command_public_id",
        "idx_paper_command_actor_admin_id_command_kind",
        "idx_paper_command_paper_id",
      ]),
    );
  });
});
