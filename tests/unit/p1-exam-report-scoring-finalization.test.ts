import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createPostgresAiScoringTaskRepository } from "@/server/repositories/ai-scoring-task-repository";
import type { RuntimeDatabase } from "@/server/repositories/runtime-database";

const TASK_ID =
  "p1-remediation-rc-08-exam-report-scoring-finalization-2026-07-23";
const BASE_SHA = "770daa8dac130931f8faddb57a2d25082bb2b77b";
const BRANCH = "fix/exam-report-scoring-finalization";
const APPROVAL_ID =
  "guardian-f0067-exam-report-scoring-finalization-2026-07-23";

type TaskSafetyContract = {
  taskId: string;
  baseSha: string;
  branch: string;
  status: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  validationCommands: Array<{ executable: string; arguments: string[] }>;
  approvalSources: { database: string | null };
  conditionalCloseout: boolean;
};

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

type CapturedSql = SQL & { queryChunks?: unknown[] };

type TransactionalSqlExecutor = {
  execute(query: CapturedSql): Promise<Record<string, unknown>[]>;
  transaction<T>(
    callback: (transaction: TransactionalSqlExecutor) => Promise<T>,
  ): Promise<T>;
};

function flattenSqlQuery(query: CapturedSql): string {
  return (query.queryChunks ?? [])
    .map((chunk) => {
      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "queryChunks" in chunk &&
        Array.isArray((chunk as { queryChunks?: unknown }).queryChunks)
      ) {
        return flattenSqlQuery(chunk as CapturedSql);
      }

      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "value" in chunk &&
        Array.isArray((chunk as { value?: unknown }).value)
      ) {
        return (chunk as { value: unknown[] }).value.join("");
      }

      if (typeof chunk === "object" && chunk !== null && "value" in chunk) {
        return String((chunk as { value: unknown }).value);
      }

      return String(chunk);
    })
    .join("")
    .replace(/\s+/gu, " ")
    .trim();
}

function parseRepositoryYaml(path: string): unknown {
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

describe("F-0067 exam report scoring finalization", () => {
  it("strictly parses the F-0067 contract and WIP state", () => {
    const contract = JSON.parse(
      readRepositoryFile("docs/04-agent-system/state/task-safety.json"),
    ) as TaskSafetyContract;
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string; status: string; executionStage: string };
      p1RemediationSerialProgram: { currentTaskId: string };
    };
    const queue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as { activeTasks: Array<{ id: string; status: string }> };

    expect(contract).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      branch: BRANCH,
      status: "validated_reviewed_conditional_closeout_ready",
      approvalSources: { database: APPROVAL_ID },
      conditionalCloseout: true,
    });
    expect(contract.allowedFiles).toHaveLength(15);
    expect(contract.coreFiles).toHaveLength(10);
    expect(contract.contingencyFiles).toHaveLength(5);
    expect(projectState.currentTask).toMatchObject({
      id: TASK_ID,
      status: "in_progress",
      executionStage: "validated_reviewed_conditional_closeout_ready",
    });
    expect(projectState.p1RemediationSerialProgram.currentTaskId).toBe(TASK_ID);
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expect.objectContaining({ id: TASK_ID })]);

    for (const command of contract.validationCommands) {
      expect(command.executable).not.toMatch(/[<>]/u);
      expect(command.arguments.join(" ")).not.toMatch(/<[^>]+>/u);
    }
  });

  it("uses one low-level canonical projector without a repository to service dependency", () => {
    const repositoryContractSource = readRepositoryFile(
      "src/server/repositories/exam-report-repository.ts",
    );
    const reportServiceSource = readRepositoryFile(
      "src/server/services/exam-report-service.ts",
    );
    const scoringRepositorySource = readRepositoryFile(
      "src/server/repositories/ai-scoring-task-repository.ts",
    );
    const allProductionSources = [
      repositoryContractSource,
      reportServiceSource,
      scoringRepositorySource,
    ].join("\n");

    expect(repositoryContractSource).toContain(
      "export function buildExamReportSnapshot",
    );
    expect(reportServiceSource).toContain(
      'buildExamReportSnapshot } from "../repositories/exam-report-repository"',
    );
    expect(reportServiceSource).not.toContain(
      "export function buildExamReportSnapshot",
    );
    expect(scoringRepositorySource).toContain(
      'from "./exam-report-repository"',
    );
    expect(scoringRepositorySource).not.toContain("exam-report-service");
    expect(
      allProductionSources.match(/export function buildExamReportSnapshot/gu),
    ).toHaveLength(1);
  });

  it("serializes explicit generation and leased completion on the same mock boundary", () => {
    const studentRepositorySource = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const scoringRepositorySource = readRepositoryFile(
      "src/server/repositories/ai-scoring-task-repository.ts",
    );
    const explicitCreateSource = studentRepositorySource.slice(
      studentRepositorySource.indexOf("async createExamReport"),
      studentRepositorySource.indexOf(
        "async updateExamReportLearningSuggestionSnapshot",
      ),
    );
    const completionSource = scoringRepositorySource.slice(
      scoringRepositorySource.indexOf("async completeAiScoringTask"),
      scoringRepositorySource.indexOf("async failAiScoringTaskAttempt"),
    );

    expect(explicitCreateSource).toContain("database.transaction");
    expect(explicitCreateSource).toContain("lockExamReportScoringFinalization");
    expect(explicitCreateSource).toContain("listMockExamAnswerRecords(");
    expect(explicitCreateSource).toContain("buildExamReportSnapshot(");
    expect(completionSource).toContain("lockExamReportScoringFinalization");
    expect(completionSource).toContain("finalizeExistingExamReport");
    expect(completionSource).not.toContain("insert into exam_report");
  });

  it("requires exact post-update evidence and conditional report revision inside completion", () => {
    const source = readRepositoryFile(
      "src/server/repositories/ai-scoring-task-repository.ts",
    );
    const completionSource = source.slice(
      source.indexOf("async completeAiScoringTask"),
      source.indexOf("async failAiScoringTaskAttempt"),
    );

    expect(completionSource).toContain("loadExamReportProjectionFacts");
    expect(completionSource).toContain("assertCompleteAiScoringEvidenceSet");
    expect(completionSource).toContain("buildExamReportSnapshot");
    expect(source).toContain("report_revision = report_revision + 1");
    expect(source).toContain("learning_suggestion_snapshot = null");
    expect(source).toContain("updatedReportRows.length !== 1");
    expect(completionSource).toContain("existingReportRows.length > 1");
  });

  it("atomically advances an existing partial report from post-update durable facts", async () => {
    const capturedQueries: CapturedSql[] = [];
    const taskRow = {
      public_id: "ai_scoring_task_public_001",
      answer_record_public_id: "answer_record_public_001",
      mock_exam_public_id: "mock_exam_public_001",
      actor_public_id: "user_public_001",
      idempotency_key_hash: "a".repeat(64),
      task_status: "succeeded",
      attempt_count: 1,
      max_attempt_count: 3,
      timeout_second: 60,
      model_config_snapshot: { modelConfigPublicId: "model_config_public_001" },
      prompt_template_key: "ai_scoring_v1",
      prompt_template_version: 1,
      prompt_template_hash: "sha256:prompt-v1",
      input_snapshot: {},
      authorization_snapshot: {},
      rag_snapshot: null,
      result_snapshot: {
        scoringStatus: "scored",
        scoringPoints: [],
        citations: [],
      },
      ai_call_log_public_id: "ai_call_log_public_001",
      failure_code: null,
      failure_message_digest: null,
      scheduled_at: new Date("2026-07-23T12:00:00.000Z"),
      claimed_at: new Date("2026-07-23T12:00:01.000Z"),
      lease_expires_at: null,
      worker_public_id: "worker_public_001",
      completed_at: new Date("2026-07-23T12:00:02.000Z"),
    };
    const existingReport = {
      id: 99,
      public_id: "exam_report_public_001",
      actor_public_id: "user_public_001",
      mock_exam_public_id: "mock_exam_public_001",
      paper_public_id: "paper_public_001",
      exam_status: "scoring_partial_failed",
      report_snapshot: { examStatus: "scoring_partial_failed" },
      objective_score: "0.0",
      subjective_score: null,
      total_score: "0.0",
      duration_second: 3600,
    };
    const database: TransactionalSqlExecutor = {
      async execute(query) {
        capturedQueries.push(query);
        const queryText = flattenSqlQuery(query);

        if (queryText.includes("select mock_exam_public_id")) {
          return [{ mock_exam_public_id: taskRow.mock_exam_public_id }];
        }
        if (queryText.includes("pg_advisory_xact_lock")) {
          return [];
        }
        if (
          queryText.includes("select owned_mock_exam.id") &&
          queryText.includes("join ai_scoring_task task")
        ) {
          return [{ id: 1, public_id: taskRow.mock_exam_public_id }];
        }
        if (queryText.includes("attempt_call_log.public_id")) {
          return [
            {
              ...taskRow,
              task_status: "running",
              result_snapshot: null,
              ai_call_log_public_id: null,
              completed_at: null,
              answer_record_status: "pending_scoring",
              answer_score: null,
              attempt_status: null,
              attempt_ai_call_log_public_id: null,
            },
          ];
        }
        if (queryText.includes("from exam_report report")) {
          return [existingReport];
        }
        if (queryText.includes("with ai_call_log_link as")) {
          return [taskRow];
        }
        if (queryText.includes("from mock_exam owned_mock_exam")) {
          return [
            {
              id: 1,
              public_id: taskRow.mock_exam_public_id,
              paper_public_id: "paper_public_001",
              paper_snapshot: {
                name: "Paper",
                paperSections: [
                  {
                    paperQuestions: [
                      {
                        paperQuestionPublicId: "paper_question_public_001",
                        questionPublicId: "question_public_001",
                        questionType: "short_answer",
                        score: "5.0",
                      },
                    ],
                  },
                ],
              },
              profession: "monopoly",
              level: 3,
              subject: "theory",
              exam_status: "completed",
              started_at: new Date("2026-07-23T11:00:00.000Z"),
              submitted_at: new Date("2026-07-23T12:00:00.000Z"),
              objective_score: "0.0",
              subjective_score: "4.0",
              total_score: "4.0",
              actor_public_id: taskRow.actor_public_id,
            },
          ];
        }
        if (queryText.includes("from answer_record left join")) {
          return [
            {
              id: 1,
              public_id: taskRow.answer_record_public_id,
              paper_question_public_id: "paper_question_public_001",
              question_public_id: "question_public_001",
              question_snapshot: { score: "5.0" },
              answer_snapshot: {
                selectedLabels: [],
                textAnswer: "answer",
                savedFromClientAt: null,
              },
              answer_record_status: "scored",
              is_correct: null,
              score: "4.0",
              max_score: "5.0",
              answered_at: new Date("2026-07-23T11:30:00.000Z"),
              submitted_at: new Date("2026-07-23T12:00:00.000Z"),
              task_public_id: taskRow.public_id,
              task_status: taskRow.task_status,
              attempt_number: taskRow.attempt_count,
              attempt_status: "succeeded",
              model_config_snapshot: taskRow.model_config_snapshot,
              prompt_template_key: taskRow.prompt_template_key,
              prompt_template_version: taskRow.prompt_template_version,
              prompt_template_hash: taskRow.prompt_template_hash,
              result_snapshot: taskRow.result_snapshot,
            },
          ];
        }
        if (queryText.includes("update exam_report")) {
          return [{ id: existingReport.id }];
        }

        return [];
      },
      async transaction<T>(
        callback: (transaction: TransactionalSqlExecutor) => Promise<T>,
      ): Promise<T> {
        return callback(database);
      },
    };
    const repository = createPostgresAiScoringTaskRepository({
      createDatabase: () => database as unknown as RuntimeDatabase,
    });

    await expect(
      repository.completeAiScoringTask({
        taskPublicId: taskRow.public_id,
        workerPublicId: taskRow.worker_public_id,
        score: "4.0",
        resultSnapshot: taskRow.result_snapshot,
        aiCallLogPublicId: taskRow.ai_call_log_public_id,
        completedAt: taskRow.completed_at,
      }),
    ).resolves.toMatchObject({ taskStatus: "succeeded" });

    const queries = capturedQueries.map(flattenSqlQuery);
    const advisoryIndex = queries.findIndex((query) =>
      query.includes("pg_advisory_xact_lock"),
    );
    const completionIndex = queries.findIndex((query) =>
      query.includes("with ai_call_log_link as"),
    );
    const reportUpdateIndex = queries.findIndex((query) =>
      query.includes("update exam_report"),
    );
    const reportUpdate = queries[reportUpdateIndex]!;

    expect(advisoryIndex).toBeGreaterThanOrEqual(0);
    expect(completionIndex).toBeGreaterThan(advisoryIndex);
    expect(reportUpdateIndex).toBeGreaterThan(completionIndex);
    expect(reportUpdate).toContain("report_revision = report_revision + 1");
    expect(reportUpdate).toContain("learning_suggestion_snapshot = null");
    expect(reportUpdate).not.toContain("insert into exam_report");
  });

  it("rejects a mismatched terminal replay without another completion or report write", async () => {
    const capturedQueries: CapturedSql[] = [];
    const database: TransactionalSqlExecutor = {
      async execute(query) {
        capturedQueries.push(query);
        const queryText = flattenSqlQuery(query);

        if (queryText.includes("select mock_exam_public_id")) {
          return [{ mock_exam_public_id: "mock_exam_public_001" }];
        }
        if (queryText.includes("pg_advisory_xact_lock")) {
          return [];
        }
        if (
          queryText.includes("select owned_mock_exam.id") &&
          queryText.includes("join ai_scoring_task task")
        ) {
          return [{ id: 1, public_id: "mock_exam_public_001" }];
        }
        if (queryText.includes("attempt_call_log.public_id")) {
          return [
            {
              public_id: "ai_scoring_task_public_001",
              answer_record_public_id: "answer_record_public_001",
              mock_exam_public_id: "mock_exam_public_001",
              actor_public_id: "user_public_001",
              idempotency_key_hash: "a".repeat(64),
              task_status: "succeeded",
              attempt_count: 1,
              max_attempt_count: 3,
              timeout_second: 60,
              model_config_snapshot: {},
              prompt_template_key: "ai_scoring_v1",
              prompt_template_version: 1,
              prompt_template_hash: "sha256:prompt-v1",
              input_snapshot: {},
              authorization_snapshot: {},
              rag_snapshot: null,
              result_snapshot: { scoringStatus: "scored" },
              ai_call_log_public_id: "ai_call_log_public_001",
              failure_code: null,
              failure_message_digest: null,
              scheduled_at: new Date("2026-07-23T12:00:00.000Z"),
              claimed_at: new Date("2026-07-23T12:00:01.000Z"),
              lease_expires_at: null,
              worker_public_id: "worker_public_001",
              completed_at: new Date("2026-07-23T12:00:02.000Z"),
              answer_record_status: "scored",
              answer_score: "3.0",
              attempt_status: "succeeded",
              attempt_ai_call_log_public_id: "ai_call_log_public_001",
            },
          ];
        }

        return [];
      },
      async transaction<T>(
        callback: (transaction: TransactionalSqlExecutor) => Promise<T>,
      ): Promise<T> {
        return callback(database);
      },
    };
    const repository = createPostgresAiScoringTaskRepository({
      createDatabase: () => database as unknown as RuntimeDatabase,
    });

    await expect(
      repository.completeAiScoringTask({
        taskPublicId: "ai_scoring_task_public_001",
        workerPublicId: "worker_public_001",
        score: "4.0",
        resultSnapshot: { scoringStatus: "scored" },
        aiCallLogPublicId: "ai_call_log_public_001",
        completedAt: new Date("2026-07-23T12:00:02.000Z"),
      }),
    ).rejects.toThrow("completion replay does not match");

    const queries = capturedQueries.map(flattenSqlQuery);
    expect(
      queries.some((query) => query.includes("with ai_call_log_link as")),
    ).toBe(false);
    expect(queries.some((query) => query.includes("update exam_report"))).toBe(
      false,
    );
  });
});
