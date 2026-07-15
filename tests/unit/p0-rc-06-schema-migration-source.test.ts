import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readRc06Migration(): string {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const migrationNames = readdirSync(drizzleDirectory).filter((name) =>
    name.endsWith("_p0_rc_06_ai_scoring_task.sql"),
  );

  expect(migrationNames).toHaveLength(1);

  return readFileSync(resolve(drizzleDirectory, migrationNames[0]!), "utf8");
}

describe("P0 RC-06 durable AI scoring migration source", () => {
  it("creates the task lifecycle and immutable execution snapshots", () => {
    const migration = readRc06Migration();

    expect(migration).toContain(
      'CREATE TYPE "public"."ai_scoring_task_status"',
    );
    expect(migration).toContain('CREATE TABLE "ai_scoring_task"');
    expect(migration).toContain('"model_config_snapshot" jsonb NOT NULL');
    expect(migration).toContain('"prompt_template_hash" text NOT NULL');
    expect(migration).toContain('"input_snapshot" jsonb NOT NULL');
    expect(migration).toContain('"authorization_snapshot" jsonb NOT NULL');
    expect(migration).toContain(
      '"max_attempt_count" integer DEFAULT 3 NOT NULL',
    );
    expect(migration).toContain('"timeout_second" integer DEFAULT 60 NOT NULL');
    expect(migration).toContain('"lease_expires_at" timestamp with time zone');
  });

  it("enforces idempotency, FIFO claiming, bounded retry and answer linkage", () => {
    const migration = readRc06Migration();

    expect(migration).toContain(
      'CONSTRAINT "fk_ai_scoring_task_answer_record" FOREIGN KEY ("answer_record_id")',
    );
    expect(migration).toContain(
      'CONSTRAINT "chk_ai_scoring_task_attempt_count" CHECK',
    );
    expect(migration).toContain(
      'CONSTRAINT "chk_ai_scoring_task_max_attempt_count" CHECK',
    );
    expect(migration).toContain(
      'CONSTRAINT "chk_ai_scoring_task_timeout_second" CHECK',
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "udx_ai_scoring_task_answer_record_id_idempotency_key_hash"',
    );
    expect(migration).toContain(
      'CREATE INDEX "idx_ai_scoring_task_task_status_scheduled_at"',
    );
  });

  it("does not place secrets or raw provider payloads in the task table", () => {
    const taskTableSql =
      readRc06Migration().split("--> statement-breakpoint")[1] ?? "";

    expect(taskTableSql).not.toContain("api_key");
    expect(taskTableSql).not.toContain("secret_ref");
    expect(taskTableSql).not.toContain("provider_request_payload");
    expect(taskTableSql).not.toContain("provider_response_payload");
  });
});
