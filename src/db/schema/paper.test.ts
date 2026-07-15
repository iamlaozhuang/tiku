import { describe, expect, it } from "vitest";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

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
