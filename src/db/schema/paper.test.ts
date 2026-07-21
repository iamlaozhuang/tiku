import { describe, expect, it } from "vitest";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

import * as paperSchema from "./paper";

import {
  paper,
  paperCommand,
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
    expect(getColumnNames(paperScoringPoint)).toEqual(
      expect.arrayContaining(["public_id"]),
    );
    expect(getIndexNames(questionGroup)).toContain(
      "udx_question_group_public_id",
    );
    expect(getIndexNames(paperScoringPoint)).toContain(
      "udx_paper_scoring_point_public_id",
    );
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
