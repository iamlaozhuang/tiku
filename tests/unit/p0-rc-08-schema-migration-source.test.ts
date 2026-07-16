import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  organizationTrainingAnswer,
  organizationTrainingAnswerStatusValues,
  organizationTrainingDraft,
  organizationTrainingDraftStatusValues,
  organizationTrainingScoringTask,
  organizationTrainingVersion,
} from "../../src/db/schema/organization-training";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function readRc08Migration(): { name: string; source: string } {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const names = readdirSync(drizzleDirectory).filter((name) =>
    name.endsWith("_p0_rc_08_organization_training_integrity.sql"),
  );

  expect(names).toHaveLength(1);

  return {
    name: names[0]!,
    source: readFileSync(resolve(drizzleDirectory, names[0]!), "utf8"),
  };
}

describe("P0 RC-08 organization training integrity migration source", () => {
  it("persists one revisioned canonical draft aggregate", () => {
    expect(organizationTrainingDraftStatusValues).toEqual([
      "draft",
      "consumed",
      "discarded",
    ]);
    expect(getColumnNames(organizationTrainingDraft)).toEqual(
      expect.arrayContaining([
        "draft_status",
        "revision",
        "question_snapshot",
        "last_operation_id",
        "last_payload_digest",
        "consumed_at",
        "discarded_at",
      ]),
    );
    expect(getIndexNames(organizationTrainingDraft)).toContain(
      "idx_organization_training_draft_status",
    );
  });

  it("binds one idempotent published version to one canonical draft", () => {
    expect(getColumnNames(organizationTrainingVersion)).toEqual(
      expect.arrayContaining([
        "organization_training_draft_id",
        "publish_operation_id",
        "publish_payload_digest",
      ]),
    );
    expect(getIndexNames(organizationTrainingVersion)).toContain(
      "udx_organization_training_version_draft_id",
    );
  });

  it("persists monotonic answer commands and non-terminal scoring", () => {
    expect(organizationTrainingAnswerStatusValues).toEqual([
      "in_progress",
      "scoring",
      "submitted",
      "scoring_failed",
      "read_only",
    ]);
    expect(getColumnNames(organizationTrainingAnswer)).toEqual(
      expect.arrayContaining([
        "revision",
        "last_operation_id",
        "last_payload_digest",
        "submit_operation_id",
        "submit_payload_digest",
      ]),
    );
  });

  it("defines one durable scoring task owner with bounded execution facts", () => {
    expect(getTableName(organizationTrainingScoringTask)).toBe(
      "organization_training_scoring_task",
    );
    expect(getColumnNames(organizationTrainingScoringTask)).toEqual(
      expect.arrayContaining([
        "organization_training_answer_id",
        "idempotency_key_hash",
        "task_status",
        "attempt_count",
        "max_attempt_count",
        "timeout_second",
        "model_config_snapshot",
        "prompt_template_key",
        "prompt_template_version",
        "prompt_template_hash",
        "input_snapshot",
        "authorization_snapshot",
        "rag_snapshot",
        "result_snapshot",
        "scheduled_at",
        "lease_expires_at",
      ]),
    );
    expect(getIndexNames(organizationTrainingScoringTask)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_scoring_task_public_id",
        "udx_organization_training_scoring_task_answer_id",
        "idx_organization_training_scoring_task_status_scheduled_at",
        "idx_organization_training_scoring_task_lease_expires_at",
      ]),
    );
  });

  it("materializes only additive SQL and a linear snapshot journal entry", () => {
    const migration = readRc08Migration();

    expect(migration.name).toBe(
      "20260715231500_p0_rc_08_organization_training_integrity.sql",
    );
    expect(migration.source).toContain(
      'CREATE TABLE "organization_training_scoring_task"',
    );
    expect(migration.source).toContain(
      'ALTER TABLE "organization_training_draft" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL',
    );
    expect(migration.source).toContain(
      'CREATE UNIQUE INDEX "udx_organization_training_version_draft_id"',
    );
    expect(migration.source.toLowerCase()).not.toMatch(
      /^\s*(?:drop|truncate)\b/imu,
    );

    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as { entries: { idx: number; tag: string }[] };
    const entry = journal.entries.find((candidate) =>
      candidate.tag.endsWith("_p0_rc_08_organization_training_integrity"),
    );

    expect(entry).toBeDefined();
    expect(
      existsSync(
        resolve(
          process.cwd(),
          `drizzle/meta/${entry?.tag.slice(0, 14) ?? "missing"}_snapshot.json`,
        ),
      ),
    ).toBe(true);
  });
});
