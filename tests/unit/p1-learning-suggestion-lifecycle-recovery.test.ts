import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS,
  EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS,
  EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS,
  projectExamReportLearningSuggestionLifecycle,
} from "@/server/mappers/exam-report-mapper";
import type { ExamReportRow } from "@/server/repositories/exam-report-repository";

const TASK_ID =
  "p1-remediation-rc-08-learning-suggestion-lifecycle-recovery-2026-07-23";
const BASE_SHA = "b91ee5d3ae1982198b945e50cea521392c74c9cd";
const APPROVAL_ID =
  "guardian-f0065-learning-suggestion-lifecycle-recovery-2026-07-23";
const NOW = new Date("2026-07-23T12:00:00.000Z");

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseYamlStrictly(path: string): unknown {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readRepositoryFile(path), {
    strict: true,
    uniqueKeys: true,
  });
  expect(document.errors).toEqual([]);
  return document.toJS();
}

function createReportRow(
  overrides: Partial<ExamReportRow> = {},
): ExamReportRow {
  return {
    id: 1,
    public_id: "exam_report_public_1",
    exam_report_public_id: "exam_report_public_1",
    mock_exam_public_id: "mock_exam_public_1",
    paper_public_id: "paper_public_1",
    paper_name: "Mock paper",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    objective_score: "10.0",
    subjective_score: "20.0",
    total_score: "30.0",
    duration_second: 1800,
    report_revision: 1,
    report_snapshot: {},
    learning_suggestion_snapshot: null,
    learning_suggestion_status: null,
    learning_suggestion_attempt_count: null,
    learning_suggestion_input_digest: null,
    learning_suggestion_claimed_at: null,
    learning_suggestion_completed_at: null,
    learning_suggestion_failure_category: null,
    generated_at: NOW,
    started_at: NOW,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

describe("F-0065 learning suggestion lifecycle recovery", () => {
  it("validates the F-0065 task state and additive migration source", () => {
    const contract = JSON.parse(
      readRepositoryFile("docs/04-agent-system/state/task-safety.json"),
    ) as {
      taskId: string;
      baseSha: string;
      status: string;
      approvalId: string;
      allowedFiles: string[];
      coreFiles: string[];
      contingencyFiles: string[];
      approvalSources: { database: string; provider: string };
      conditionalCloseout: boolean;
    };

    expect(contract).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      status: "implemented_verified_static_pending_closeout",
      approvalId: APPROVAL_ID,
      approvalSources: {
        database: APPROVAL_ID,
        provider: APPROVAL_ID,
      },
      conditionalCloseout: true,
    });
    expect(contract.allowedFiles).toHaveLength(39);
    expect(contract.coreFiles).toHaveLength(30);
    expect(contract.contingencyFiles).toHaveLength(9);
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as { currentTask: { id: string; executionStage: string } };
    const queue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as { activeTasks: Array<{ id: string; status: string }> };
    expect(projectState.currentTask).toMatchObject({
      id: TASK_ID,
      executionStage: "implemented_verified_static_pending_closeout",
    });
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expect.objectContaining({ id: TASK_ID })]);

    const migrationPath =
      "drizzle/20260723043000_p1_rc_08_learning_suggestion_lifecycle.sql";
    expect(contract.allowedFiles).toContain(migrationPath);
    const sql = readRepositoryFile(migrationPath).trim();
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/--.*$/gmu, ""))
      .map((statement) => statement.trim())
      .filter(Boolean);
    expect(statements).toHaveLength(9);
    expect(statements[0]).toMatch(
      /^CREATE TYPE "public"\."learning_suggestion_status" AS ENUM\('pending', 'running', 'succeeded', 'failed'\);$/u,
    );
    expect(statements.slice(1, 7)).toEqual([
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_status" "learning_suggestion_status";',
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_attempt_count" integer;',
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_input_digest" text;',
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_claimed_at" timestamp with time zone;',
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_completed_at" timestamp with time zone;',
      'ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_failure_category" text;',
    ]);
    expect(statements[7]).toBe(
      'CREATE INDEX "idx_exam_report_learning_suggestion_status_updated_at" ON "exam_report" USING btree ("learning_suggestion_status","updated_at");',
    );
    expect(statements[8]).toMatch(
      /^ALTER TABLE "exam_report" ADD CONSTRAINT "chk_exam_report_learning_suggestion_lifecycle" CHECK \([\s\S]+\);$/u,
    );
    expect(statements[8].match(/;/gu)).toHaveLength(1);
    expect(sql).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|ALTER\s+COLUMN|CREATE\s+TABLE|INSERT|COPY)\b/iu,
    );

    const previousSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723033000_snapshot.json"),
    ) as { id: string };
    const snapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723043000_snapshot.json"),
    ) as { id: string; prevId: string };
    const journal = JSON.parse(
      readRepositoryFile("drizzle/meta/_journal.json"),
    ) as { entries: Array<{ idx: number; tag: string }> };
    expect(snapshot.id).not.toBe(previousSnapshot.id);
    expect(snapshot.prevId).toBe(previousSnapshot.id);
    expect(journal.entries.at(-1)).toEqual(
      expect.objectContaining({
        idx: 56,
        tag: "20260723043000_p1_rc_08_learning_suggestion_lifecycle",
      }),
    );
  });

  it("projects legacy, overdue pending, stale running, failed and succeeded truthfully", () => {
    expect(
      projectExamReportLearningSuggestionLifecycle(createReportRow(), NOW),
    ).toEqual({
      status: "unavailable",
      failureCategory: null,
      canRetry: false,
    });

    const pendingAt = new Date(
      NOW.getTime() - EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS,
    );
    expect(
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "pending",
          learning_suggestion_attempt_count: 0,
          updated_at: pendingAt,
        }),
        NOW,
      ),
    ).toEqual({ status: "pending", failureCategory: null, canRetry: true });

    const claimedAt = new Date(
      NOW.getTime() - EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS,
    );
    expect(
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "running",
          learning_suggestion_attempt_count: 1,
          learning_suggestion_input_digest: "a".repeat(64),
          learning_suggestion_claimed_at: claimedAt,
        }),
        NOW,
      ),
    ).toEqual({ status: "running", failureCategory: null, canRetry: true });

    expect(
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "failed",
          learning_suggestion_attempt_count:
            EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS - 1,
          learning_suggestion_input_digest: "b".repeat(64),
          learning_suggestion_claimed_at: NOW,
          learning_suggestion_completed_at: NOW,
          learning_suggestion_failure_category: "provider_failed",
        }),
        NOW,
      ),
    ).toEqual({
      status: "failed",
      failureCategory: "provider_failed",
      canRetry: true,
    });

    expect(
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "succeeded",
          learning_suggestion_attempt_count: 1,
          learning_suggestion_input_digest: "c".repeat(64),
          learning_suggestion_claimed_at: NOW,
          learning_suggestion_completed_at: NOW,
          learning_suggestion_snapshot: { status: "generated" },
        }),
        NOW,
      ),
    ).toEqual({
      status: "succeeded",
      failureCategory: null,
      canRetry: false,
    });
  });

  it("fails closed on partial or contradictory lifecycle facts", () => {
    expect(() =>
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "running",
          learning_suggestion_attempt_count: 1,
          learning_suggestion_input_digest: null,
          learning_suggestion_claimed_at: NOW,
        }),
        NOW,
      ),
    ).toThrow(/lifecycle/iu);

    expect(() =>
      projectExamReportLearningSuggestionLifecycle(
        createReportRow({
          learning_suggestion_status: "pending",
          learning_suggestion_attempt_count: 0,
          learning_suggestion_snapshot: { status: "generated" },
        }),
        NOW,
      ),
    ).toThrow(/lifecycle/iu);
  });

  it("keeps Provider execution outside report and claim transactions", () => {
    const serviceSource = readRepositoryFile(
      "src/server/services/exam-report-service.ts",
    );
    const repositorySource = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const providerRuntimeSource = readRepositoryFile(
      "src/server/services/ai-mock-provider-runtime.ts",
    );
    const scoringRuntimeSource = readRepositoryFile(
      "src/server/services/ai-scoring-task-runtime.ts",
    );

    expect(serviceSource).toContain("claimExamReportLearningSuggestion");
    expect(serviceSource).toContain("finalizeExamReportLearningSuggestion");
    expect(serviceSource).toContain("failExamReportLearningSuggestion");
    expect(repositorySource).not.toContain("generateLearningSuggestion(");
    expect(providerRuntimeSource.indexOf("Promise.race")).toBeLessThan(
      providerRuntimeSource.indexOf("appendAiCallLog(aiCallLogInput)"),
    );
    expect(
      scoringRuntimeSource.indexOf("completeAiScoringTask({"),
    ).toBeLessThan(scoringRuntimeSource.indexOf("onCompletedScoringReport({"));
  });
});
