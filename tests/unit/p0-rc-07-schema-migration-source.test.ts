import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  answerRecord,
  examReport,
  mockExamDeadlineTask,
  mockExamDeadlineTaskStatusValues,
} from "../../src/db/schema/student-experience";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function readRc07Migration(): { name: string; source: string } {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const names = readdirSync(drizzleDirectory).filter((name) =>
    name.endsWith("_p0_rc_07_answer_mock_scoring_report.sql"),
  );

  expect(names).toHaveLength(1);

  return {
    name: names[0]!,
    source: readFileSync(resolve(drizzleDirectory, names[0]!), "utf8"),
  };
}

describe("P0 RC-07 answer, deadline and report migration source", () => {
  it("adds monotonic answer synchronization facts", () => {
    expect(getColumnNames(answerRecord)).toEqual(
      expect.arrayContaining([
        "answer_revision",
        "client_operation_id",
        "client_saved_at",
      ]),
    );
    expect(getIndexNames(answerRecord)).toContain(
      "udx_answer_record_mock_exam_id_client_operation_id",
    );
  });

  it("defines one durable deadline owner per mock_exam", () => {
    expect(getTableName(mockExamDeadlineTask)).toBe("mock_exam_deadline_task");
    expect(mockExamDeadlineTaskStatusValues).toEqual([
      "pending",
      "running",
      "completed",
      "failed",
      "cancelled",
    ]);
    expect(getIndexNames(mockExamDeadlineTask)).toEqual(
      expect.arrayContaining([
        "udx_mock_exam_deadline_task_public_id",
        "udx_mock_exam_deadline_task_mock_exam_id",
        "idx_mock_exam_deadline_task_task_status_scheduled_at",
        "idx_mock_exam_deadline_task_lease_expires_at",
      ]),
    );
  });

  it("versions report rebuilds without changing report identity", () => {
    expect(getColumnNames(examReport)).toContain("report_revision");
    expect(getIndexNames(examReport)).toContain("udx_exam_report_mock_exam_id");
  });

  it("materializes additive constraints and the snapshot journal chain", () => {
    const migration = readRc07Migration();

    expect(migration.source).toContain(
      'CREATE TYPE "public"."mock_exam_deadline_task_status"',
    );
    expect(migration.source).toContain(
      'CREATE TABLE "mock_exam_deadline_task"',
    );
    expect(migration.source).toContain(
      'ALTER TABLE "answer_record" ADD COLUMN "answer_revision" integer DEFAULT 1 NOT NULL',
    );
    expect(migration.source).toContain(
      'CREATE UNIQUE INDEX "udx_answer_record_mock_exam_id_client_operation_id"',
    );
    expect(migration.source).toContain(
      'CREATE UNIQUE INDEX "udx_mock_exam_deadline_task_mock_exam_id"',
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
      candidate.tag.endsWith("_p0_rc_07_answer_mock_scoring_report"),
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
