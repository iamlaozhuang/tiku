import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  createLocalModelConfigRuntimeCatalog,
  createModelConfigRuntimeResolver,
  createPersistedModelConfigRuntimeCatalog,
  createRedactedModelConfigRuntimeSnapshot,
} from "@/server/services/model-config-runtime";
import type {
  ModelConfigSummaryDto,
  PromptTemplateSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { createPostgresAiScoringTaskRepository } from "@/server/repositories/ai-scoring-task-repository";
import type { RuntimeDatabase } from "@/server/repositories/runtime-database";
import { createDefaultAiScoringTaskPreparer } from "@/server/services/student-flow-runtime";

type CapturedSql = SQL & { queryChunks?: unknown[] };

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

const promptTemplate: PromptTemplateSummaryDto = {
  publicId: "prompt-template-public-001",
  promptTemplateKey: "ai_scoring_v1",
  aiFuncType: "ai_scoring",
  version: 7,
  title: "AI scoring v7",
  description: null,
  bodyDigest: "sha256:prompt-v7",
  bodyPreviewMasked: "[redacted]",
  bodyFullText: null,
  status: "active",
  isActive: true,
  registrationSource: "runtime_registry",
  catalogGapStatus: "registered",
  canViewFullText: false,
  requiredVariables: ["question", "studentAnswer", "scoringPoints"],
  updatedAt: "2026-07-15T12:00:00.000Z",
};

const modelConfig: ModelConfigSummaryDto = {
  publicId: "model-config-public-001",
  providerPublicId: "model-provider-public-001",
  providerDisplayName: "Governed Provider",
  providerKey: "qwen",
  modelName: "qwen-plus",
  modelAlias: "qwen-plus",
  displayName: "Governed scoring",
  aiFuncType: "ai_scoring",
  apiKeyDisplay: "****3456",
  secretStatus: "configured",
  maskedSecret: "****3456",
  fallbackModelConfigPublicId: null,
  isEnabled: true,
  status: "enabled",
  fallbackPriority: 0,
  snapshotPolicy: "redacted_metadata",
  configVersion: 3,
  timeoutSecond: 60,
  maxRetryCount: 3,
  updatedAt: "2026-07-15T12:00:00.000Z",
};

describe("P0 RC-06 governed model execution provenance", () => {
  it("marks persisted config as governed and locks the registered prompt version", () => {
    const catalog = createPersistedModelConfigRuntimeCatalog({
      modelConfigs: [modelConfig],
      promptTemplates: [promptTemplate],
    });
    const selection = createModelConfigRuntimeResolver(catalog).resolve({
      aiFuncType: "scoring",
      allowFallback: false,
    });

    expect(selection).toMatchObject({
      status: "selected",
      executionMode: "governed_provider",
      promptTemplate: {
        promptTemplateKey: "ai_scoring_v1",
        version: 7,
        templateHash: "sha256:prompt-v7",
      },
      redactedModelConfigMetadata: {
        providerMode: "governed_provider",
      },
    });
    if (selection.status !== "selected") {
      throw new Error("Expected governed model_config selection.");
    }
    expect(
      createRedactedModelConfigRuntimeSnapshot(selection.modelConfigSnapshot),
    ).toMatchObject({ providerMode: "governed_provider" });
  });

  it("uses atomic idempotent enqueue and FIFO skip-locked claiming SQL", async () => {
    const capturedQueries: CapturedSql[] = [];
    const taskRow = {
      public_id: "ai_scoring_task_public_001",
      answer_record_public_id: "answer_record_public_001",
      mock_exam_public_id: "mock_exam_public_001",
      actor_public_id: "user_public_001",
      idempotency_key_hash: "a".repeat(64),
      task_status: "pending",
      attempt_count: 0,
      max_attempt_count: 3,
      timeout_second: 60,
      model_config_snapshot: { modelConfigPublicId: "model_config_public_001" },
      prompt_template_key: "ai_scoring_v1",
      prompt_template_version: 7,
      prompt_template_hash: "sha256:prompt-v7",
      input_snapshot: { questionPublicId: "question_public_001" },
      authorization_snapshot: { effectiveEdition: "advanced" },
      rag_snapshot: null,
      result_snapshot: null,
      ai_call_log_public_id: null,
      failure_code: null,
      failure_message_digest: null,
      scheduled_at: new Date("2026-07-15T20:20:00.000Z"),
      claimed_at: null,
      lease_expires_at: null,
      worker_public_id: null,
      completed_at: null,
    };
    let executionCount = 0;
    const repository = createPostgresAiScoringTaskRepository({
      createDatabase: () =>
        ({
          async execute(query: CapturedSql) {
            capturedQueries.push(query);
            executionCount += 1;

            if (executionCount === 2) {
              return [{ recovered_count: 1 }];
            }

            return [taskRow];
          },
        }) as unknown as RuntimeDatabase,
    });

    await repository.enqueueAiScoringTask({
      publicId: taskRow.public_id,
      answerRecordPublicId: taskRow.answer_record_public_id,
      mockExamPublicId: taskRow.mock_exam_public_id,
      actorPublicId: taskRow.actor_public_id,
      idempotencyKeyHash: taskRow.idempotency_key_hash,
      maxAttemptCount: 3,
      timeoutSecond: 60,
      modelConfigSnapshot: taskRow.model_config_snapshot,
      promptTemplateKey: taskRow.prompt_template_key,
      promptTemplateVersion: taskRow.prompt_template_version,
      promptTemplateHash: taskRow.prompt_template_hash,
      inputSnapshot: taskRow.input_snapshot,
      authorizationSnapshot: taskRow.authorization_snapshot,
      ragSnapshot: null,
      scheduledAt: taskRow.scheduled_at,
    });
    await repository.recoverExpiredAiScoringTasks({
      recoveredAt: taskRow.scheduled_at,
    });
    await repository.claimNextAiScoringTask({
      workerPublicId: "worker_public_001",
      claimedAt: taskRow.scheduled_at,
      leaseExpiresAt: new Date("2026-07-15T20:21:00.000Z"),
    });
    await repository.failAiScoringTaskAttempt({
      taskPublicId: taskRow.public_id,
      workerPublicId: "worker_public_001",
      failureCode: "synthetic_failure",
      failureMessageDigest: "b".repeat(64),
      retryable: true,
      failedAt: new Date("2026-07-15T20:20:30.000Z"),
      retryAfterAt: new Date("2026-07-15T20:20:31.000Z"),
    });

    const enqueueSql = flattenSqlQuery(capturedQueries[0]!);
    const recoverySql = flattenSqlQuery(capturedQueries[1]!);
    const claimSql = flattenSqlQuery(capturedQueries[2]!);
    const failureSql = flattenSqlQuery(capturedQueries[3]!);

    expect(enqueueSql).toContain(
      "on conflict (answer_record_id, idempotency_key_hash) do nothing",
    );
    expect(enqueueSql).toContain(
      "join mock_exam on mock_exam.id = answer_record.mock_exam_id",
    );
    expect(enqueueSql).toContain(
      "join user_account on user_account.id = answer_record.user_id",
    );
    expect(enqueueSql).toContain("mock_exam.public_id = mock_exam_public_001");
    expect(enqueueSql).toContain("user_account.public_id = user_public_001");
    expect(enqueueSql).toContain(
      "and not exists (select 1 from inserted_task)",
    );
    expect(claimSql).toContain("order by scheduled_at asc, id asc");
    expect(claimSql).toContain("for update skip locked");
    expect(claimSql).toContain("attempt_count = task.attempt_count + 1");
    expect(claimSql).not.toContain(
      "or (task_status = 'running'::ai_scoring_task_status",
    );
    expect(claimSql).not.toContain("lease_expires_at <=");
    expect(recoverySql).toContain("scoring_lease_expired");
    expect(recoverySql).toContain("insert into ai_scoring_attempt");
    expect(recoverySql).toContain("'timeout'::ai_scoring_attempt_status");
    expect(recoverySql).toContain("update answer_record");
    expect(recoverySql).toContain(
      "recovered_task.attempt_count < recovered_task.max_attempt_count",
    );
    expect(claimSql.indexOf("for update skip locked")).toBeLessThan(
      claimSql.indexOf("limit 1"),
    );
    expect(failureSql).toContain("leased_task as");
    expect(failureSql).toContain(
      "leased_task.scheduled_at as attempt_scheduled_at",
    );
    expect(failureSql).toContain("failed_task.attempt_scheduled_at");
    expect(failureSql).toContain(
      "task_status = 'failed'::ai_scoring_task_status",
    );
    expect(failureSql).not.toContain("then 'pending'::ai_scoring_task_status");
    expect(recoverySql).not.toContain("then 'pending'::ai_scoring_task_status");
  });

  it("updates answer state and appends an attempt in the same completion statement", async () => {
    const capturedQueries: CapturedSql[] = [];
    const repository = createPostgresAiScoringTaskRepository({
      createDatabase: () =>
        ({
          async execute(query: CapturedSql) {
            capturedQueries.push(query);
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
                prompt_template_version: 7,
                prompt_template_hash: "sha256:prompt-v7",
                input_snapshot: {},
                authorization_snapshot: {},
                rag_snapshot: null,
                result_snapshot: { scoringStatus: "scored" },
                ai_call_log_public_id: "ai_call_log_public_001",
                failure_code: null,
                failure_message_digest: null,
                scheduled_at: new Date("2026-07-15T20:20:00.000Z"),
                claimed_at: new Date("2026-07-15T20:20:01.000Z"),
                lease_expires_at: null,
                worker_public_id: "worker_public_001",
                completed_at: new Date("2026-07-15T20:20:02.000Z"),
              },
            ];
          },
        }) as unknown as RuntimeDatabase,
    });

    await repository.completeAiScoringTask({
      taskPublicId: "ai_scoring_task_public_001",
      workerPublicId: "worker_public_001",
      score: "4.0",
      resultSnapshot: { scoringStatus: "scored" },
      aiCallLogPublicId: "ai_call_log_public_001",
      completedAt: new Date("2026-07-15T20:20:02.000Z"),
    });

    const completionSql = flattenSqlQuery(capturedQueries[0]!);

    expect(completionSql).toContain("update ai_scoring_task task");
    expect(completionSql).toContain("update answer_record");
    expect(completionSql).toContain("insert into ai_scoring_attempt");
    expect(completionSql).toContain("exists ( select 1 from ai_call_log_link");
    expect(completionSql).toContain("call_status = 'success'::ai_call_status");
    expect(completionSql).toContain("ai_func_type = 'scoring'::ai_func_type");
    expect(completionSql).toContain(
      "ai_call_log_link.user_public_id = task.actor_public_id",
    );
    expect(completionSql).toContain(
      "ai_call_log_link.mock_exam_public_id = task.mock_exam_public_id",
    );
    expect(completionSql).toContain(
      "ai_call_log_link.answer_record_public_id = answer_record.public_id",
    );
    expect(completionSql).toContain(
      "ai_call_log_link.prompt_template_key = task.prompt_template_key",
    );
    expect(completionSql).toContain(
      "ai_call_log_link.prompt_template_version = task.prompt_template_version",
    );
    expect(completionSql).toContain(
      "ai_call_log_link.model_config_public_id = (task.model_config_snapshot ->> 'modelConfigPublicId')",
    );
    expect(completionSql).toContain(
      "task.worker_public_id = worker_public_001",
    );
    expect(completionSql).toContain("'succeeded'::ai_scoring_attempt_status");
  });

  it("keeps production defaults free of fixture scoring, fixed AI prose, and env-secret reads", () => {
    const practiceSource = readFileSync(
      resolve(process.cwd(), "src/server/services/practice-service.ts"),
      "utf8",
    );
    const studentFlowSource = readFileSync(
      resolve(process.cwd(), "src/server/services/student-flow-runtime.ts"),
      "utf8",
    );
    const mistakeRuntimeSource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/services/student-mistake-book-runtime.ts",
      ),
      "utf8",
    );
    const ownerPreviewSource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts",
      ),
      "utf8",
    );
    const studentFlowRepositorySource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );

    expect(practiceSource).not.toContain("answerLengthRatio");
    expect(practiceSource).not.toContain("AI 提示：");
    expect(studentFlowSource).not.toContain("mock-ai-scoring-request");
    expect(studentFlowSource).not.toContain("local deterministic scoring");
    expect(mistakeRuntimeSource).not.toContain(
      "createLocalModelConfigRuntimeCatalog",
    );
    expect(mistakeRuntimeSource).not.toContain("本地确定性 AI");
    expect(ownerPreviewSource).not.toContain("process.env");
    expect(ownerPreviewSource).not.toContain("ALIBABA_API_KEY");
    expect(studentFlowRepositorySource).toContain(
      "async retryFailedAiScoringTasks(input)",
    );
    expect(studentFlowRepositorySource).toContain(
      "eq(aiScoringTask.actor_public_id, input.userPublicId)",
    );
    expect(studentFlowRepositorySource).toContain(
      'eq(answerRecord.answer_record_status, "scoring_failed")',
    );
    expect(studentFlowRepositorySource).toContain('.for("update")');
    expect(studentFlowRepositorySource).toContain('task_status: "pending"');
    expect(studentFlowRepositorySource).toContain('exam_status: "scoring"');
  });

  it("rejects a local fixture unless the caller explicitly enables fixture mode", () => {
    const resolver = createModelConfigRuntimeResolver(
      createLocalModelConfigRuntimeCatalog(),
    );

    expect(
      resolver.resolve({
        aiFuncType: "scoring",
        allowFallback: false,
      }),
    ).toMatchObject({
      status: "unavailable",
      reason: "fixture_not_allowed",
    });

    expect(
      resolver.resolve({
        aiFuncType: "scoring",
        allowFallback: false,
        allowFixture: true,
      }),
    ).toMatchObject({
      status: "selected",
      executionMode: "local_fixture",
    });
  });

  it("freezes governed model, prompt, input, authorization and RAG facts before submit", async () => {
    const catalog = createPersistedModelConfigRuntimeCatalog({
      modelConfigs: [modelConfig],
      promptTemplates: [promptTemplate],
    });
    const preparer = createDefaultAiScoringTaskPreparer(
      catalog,
      {
        async retrieveForAiScoring() {
          return {
            evidenceStatus: "none",
            citations: [],
            evidenceSummary: {
              evidenceStatus: "none",
              citationCount: 0,
              resourcePublicIds: [],
              chunkPublicIds: [],
              generationPublicIds: [],
              chunkIndexes: [],
              textHashes: [],
              queryHash: "query_hash_001",
              maxScore: null,
              retrievalMode: "fusion_sort",
            },
          };
        },
      },
      async () => null,
      () => new Date("2026-07-15T20:30:00.000Z"),
    );

    const task = await preparer.prepareTask({
      userPublicId: "user_public_001",
      mockExamPublicId: "mock_exam_public_001",
      profession: "marketing",
      level: 3,
      subject: "theory",
      answerRecordPublicId: "answer_record_public_001",
      paperQuestionPublicId: "paper_question_public_001",
      questionPublicId: "question_public_001",
      questionSnapshot: { profession: "marketing", level: 3 },
      answerSnapshot: {
        selectedLabels: [],
        textAnswer: "immutable answer",
        savedFromClientAt: null,
      },
      questionText: "question text",
      standardAnswer: "standard answer",
      studentAnswer: "immutable answer",
      maxScore: "5.0",
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_001",
          label: "complete",
          maxScore: 5,
        },
      ],
    });

    expect(task).toMatchObject({
      answerRecordPublicId: "answer_record_public_001",
      maxAttemptCount: 3,
      timeoutSecond: 60,
      modelConfigSnapshot: {
        modelConfigPublicId: "model-config-public-001",
        executionMode: "governed_provider",
      },
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 7,
      promptTemplateHash: "sha256:prompt-v7",
      inputSnapshot: {
        questionPublicId: "question_public_001",
        studentAnswer: "immutable answer",
      },
      authorizationSnapshot: {
        actorPublicId: "user_public_001",
        mockExamPublicId: "mock_exam_public_001",
        profession: "marketing",
        level: 3,
        subject: "theory",
        authorizationBoundary: "mock_exam_submit_guard",
      },
      ragSnapshot: { evidenceStatus: "none" },
    });
    expect(task.idempotencyKeyHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(JSON.stringify(task)).not.toContain("****3456");
  });
});
