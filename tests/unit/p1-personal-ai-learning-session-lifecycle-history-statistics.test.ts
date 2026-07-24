import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import {
  createPersonalAiLearningCompletionSummary,
  parsePersonalAiLearningSessionLifecycle,
} from "../../src/server/validators/personal-ai-generation-learning-session";

const lifecycleIdentity = {
  sessionPublicId: "ai_learning_session_lifecycle_001",
  sessionRevision: 2,
  actorPublicId: "user_public_001",
  ownerType: "personal" as const,
  ownerPublicId: "user_public_001",
  authorizationSource: "personal_auth" as const,
  authorizationPublicId: "personal_auth_public_001",
  sourceResultPublicId: "ai_generation_result_001",
  sourceTaskPublicId: "ai_generation_task_001",
  questionSnapshotDigest: "a".repeat(64),
};

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
  const document = parseDocument(readFileSync(path, "utf8"), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS();
}

describe("F-0164 personal AI learning session lifecycle contract", () => {
  it("builds one deterministic detached completion summary bound to private lifecycle identity", () => {
    const input = {
      ...lifecycleIdentity,
      questions: [
        {
          sessionQuestionPublicId: "session_question_002",
          maxScore: "2.0",
        },
        {
          sessionQuestionPublicId: "session_question_001",
          maxScore: "1.0",
        },
      ],
      answerFeedbacks: [
        {
          sessionQuestionPublicId: "session_question_001",
          status: "scored" as const,
          isCorrect: true,
          score: "1.0",
          maxScore: "1.0",
        },
        {
          sessionQuestionPublicId: "session_question_002",
          status: "submitted_review_required" as const,
          isCorrect: null,
          score: null,
          maxScore: "2.0",
        },
      ],
    };

    const first = createPersonalAiLearningCompletionSummary(input);
    const second = createPersonalAiLearningCompletionSummary({
      ...input,
      questions: [...input.questions].reverse(),
      answerFeedbacks: [...input.answerFeedbacks].reverse(),
    });

    expect(first).not.toBeNull();
    expect(second).toEqual(first);
    expect(first).toMatchObject({
      snapshot: {
        schemaVersion: 1,
        questionCount: 2,
        submittedCount: 2,
        correctCount: 1,
        incorrectCount: 0,
        reviewRequiredCount: 1,
        completionRate: 1,
        accuracyRate: 1,
        score: "1.0",
        maxScore: "3.0",
      },
      digest: expect.stringMatching(/^[0-9a-f]{64}$/u),
    });
    expect(JSON.stringify(first)).not.toContain("personal_auth_public_001");
    expect(JSON.stringify(first)).not.toContain("session_question_001");
    input.questions[0]!.maxScore = "99.0";
    expect(first?.snapshot.maxScore).toBe("3.0");
  });

  it("strictly distinguishes legacy, current in-progress, current completed and corrupt lifecycle rows", () => {
    expect(
      parsePersonalAiLearningSessionLifecycle({
        lifecycle_schema_version: null,
        authorization_source: null,
        authorization_public_id: null,
        session_status: null,
        session_revision: null,
        completed_at: null,
        completion_summary_snapshot: null,
        completion_summary_digest: null,
      }),
    ).toEqual({ kind: "legacy" });

    expect(
      parsePersonalAiLearningSessionLifecycle({
        lifecycle_schema_version: 1,
        authorization_source: "org_auth",
        authorization_public_id: "org_auth_public_001",
        session_status: "in_progress",
        session_revision: 1,
        completed_at: null,
        completion_summary_snapshot: null,
        completion_summary_digest: null,
      }),
    ).toMatchObject({
      kind: "current",
      authorizationSource: "org_auth",
      sessionStatus: "in_progress",
      sessionRevision: 1,
    });

    expect(
      parsePersonalAiLearningSessionLifecycle({
        lifecycle_schema_version: 1,
        authorization_source: "personal_auth",
        authorization_public_id: "personal_auth_public_001",
        session_status: "completed",
        session_revision: 2,
        completed_at: new Date("2026-07-24T10:00:00.000Z"),
        completion_summary_snapshot: {
          schemaVersion: 1,
          questionCount: 1,
          submittedCount: 1,
          correctCount: 1,
          incorrectCount: 0,
          reviewRequiredCount: 0,
          completionRate: 1,
          accuracyRate: 1,
          score: "1.0",
          maxScore: "1.0",
        },
        completion_summary_digest: createHash("sha256")
          .update("valid-shape-only")
          .digest("hex"),
      }),
    ).toMatchObject({ kind: "current", sessionStatus: "completed" });

    expect(
      parsePersonalAiLearningSessionLifecycle({
        lifecycle_schema_version: 1,
        authorization_source: "personal_auth",
        authorization_public_id: null,
        session_status: "in_progress",
        session_revision: 1,
        completed_at: null,
        completion_summary_snapshot: null,
        completion_summary_digest: null,
      }),
    ).toEqual({ kind: "corrupt" });
  });

  it.each([
    ["authorization source", { authorization_source: null }],
    ["session status", { session_status: null }],
    ["session revision", { session_revision: null }],
  ])("rejects a current lifecycle row with null %s", (_label, override) => {
    expect(
      parsePersonalAiLearningSessionLifecycle({
        lifecycle_schema_version: 1,
        authorization_source: "personal_auth",
        authorization_public_id: "personal_auth_public_001",
        session_status: "in_progress",
        session_revision: 1,
        completed_at: null,
        completion_summary_snapshot: null,
        completion_summary_digest: null,
        ...override,
      }),
    ).toEqual({ kind: "corrupt" });
  });

  it("keeps task state and additive lifecycle migration source exact", () => {
    const taskSafety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as {
      taskId: string;
      status: string;
      approvalId: string;
      baseSha: string;
      allowedFiles: string[];
      coreFiles: string[];
      contingencyFiles: string[];
      validationCommands: Array<{ name: string; arguments: string[] }>;
    };
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string; executionStage: string };
    };
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as {
      activeTasks: Array<{
        id: string;
        status: string;
        executionStage: string;
      }>;
    };

    expect(taskSafety).toMatchObject({
      taskId:
        "p1-remediation-rc-08-personal-ai-learning-session-lifecycle-history-statistics-2026-07-24",
      approvalId:
        "guardian-f0164-personal-ai-learning-session-lifecycle-history-statistics-2026-07-24",
      baseSha: "b9f1675c102bd504b059562a45e162a412c4c3c8",
    });
    expect(taskSafety.allowedFiles).toHaveLength(38);
    expect(taskSafety.coreFiles).toHaveLength(30);
    expect(taskSafety.contingencyFiles).toHaveLength(8);
    expect(new Set(taskSafety.allowedFiles).size).toBe(38);
    expect(taskSafety.allowedFiles).toEqual([
      ...taskSafety.coreFiles,
      ...taskSafety.contingencyFiles,
    ]);
    expect(projectState.currentTask).toEqual(
      expect.objectContaining({
        id: taskSafety.taskId,
        executionStage: taskSafety.status,
      }),
    );
    expect(
      taskQueue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([
      expect.objectContaining({
        id: taskSafety.taskId,
        executionStage: taskSafety.status,
      }),
    ]);
    const formatCommand = taskSafety.validationCommands.find(
      (command) => command.name === "format",
    );
    expect(formatCommand).toBeDefined();
    expect(
      taskSafety.allowedFiles
        .filter((allowedFile) => !allowedFile.endsWith(".sql"))
        .every((allowedFile) => formatCommand?.arguments.includes(allowedFile)),
    ).toBe(true);

    const migration = readFileSync(
      "drizzle/20260724013000_p1_rc_08_personal_ai_learning_session_lifecycle.sql",
      "utf8",
    );
    const statements = migration
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/\s+/gu, " ").trim())
      .filter((statement) => statement.length > 0);
    const expectedColumnStatements = [
      ["lifecycle_schema_version", "integer"],
      ["authorization_source", "text"],
      ["authorization_public_id", "text"],
      ["session_status", "text"],
      ["session_revision", "integer"],
      ["completed_at", "timestamp with time zone"],
      ["completion_summary_snapshot", "jsonb"],
      ["completion_summary_digest", "text"],
    ].map(
      ([columnName, columnType]) =>
        `ALTER TABLE "personal_ai_learning_session" ADD COLUMN "${columnName}" ${columnType};`,
    );
    const expectedIndexStatement =
      'CREATE INDEX "idx_personal_ai_learning_session_actor_auth_created_at" ON "personal_ai_learning_session" USING btree ("actor_public_id","authorization_source","authorization_public_id","created_at","id");';
    const lifecycleCheck = statements.at(-1) ?? "";

    expect(statements.slice(0, 8)).toEqual(expectedColumnStatements);
    expect(statements[8]).toBe(expectedIndexStatement);
    expect(lifecycleCheck).toMatch(
      /^ALTER TABLE "personal_ai_learning_session" ADD CONSTRAINT "chk_personal_ai_learning_session_lifecycle" CHECK \(\(.+\)\);$/u,
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."lifecycle_schema_version" = 1',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."lifecycle_schema_version" is not null',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."authorization_source" is not null',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."session_status" is not null',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."session_revision" is not null',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."owner_type" = \'personal\' and "personal_ai_learning_session"."authorization_source" = \'personal_auth\'',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."owner_type" = \'organization\' and "personal_ai_learning_session"."authorization_source" = \'org_auth\'',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."session_revision" between 1 and 2147483647',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."completion_summary_digest" ~ \'^[0-9a-f]{64}$\'',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."completion_summary_snapshot" is not null',
    );
    expect(lifecycleCheck).toContain(
      '"personal_ai_learning_session"."completion_summary_digest" is not null',
    );
    expect(statements).toHaveLength(10);
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT|CREATE\s+TABLE|ALTER\s+COLUMN)\b/iu,
    );

    const previousSnapshot = JSON.parse(
      readFileSync("drizzle/meta/20260724003000_snapshot.json", "utf8"),
    ) as { id: string };
    const currentSnapshot = JSON.parse(
      readFileSync("drizzle/meta/20260724013000_snapshot.json", "utf8"),
    ) as { id: string; prevId: string };
    const journal = JSON.parse(
      readFileSync("drizzle/meta/_journal.json", "utf8"),
    ) as { entries: Array<{ idx: number; tag: string }> };

    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(journal.entries.at(-1)).toEqual(
      expect.objectContaining({
        idx: 60,
        tag: "20260724013000_p1_rc_08_personal_ai_learning_session_lifecycle",
      }),
    );
  });

  it("keeps serialization, database pagination and public redaction boundaries explicit", () => {
    const repositorySource = readFileSync(
      "src/server/repositories/personal-ai-generation-learning-session-repository.ts",
      "utf8",
    );
    const contractSource = readFileSync(
      "src/server/contracts/personal-ai-generation-learning-session-contract.ts",
      "utf8",
    );
    const uiSource = readFileSync(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "utf8",
    );
    const routeSource = readFileSync(
      "src/server/services/personal-ai-generation-learning-session-route.ts",
      "utf8",
    );

    expect(repositorySource).toContain('.for("update")');
    expect(repositorySource).toContain(
      "isExactPersonalAiLearningSessionSourceBinding",
    );
    expect(repositorySource).toContain(
      "personalAiLearningHistoryCandidateSelection",
    );
    expect(repositorySource).toContain(
      "hasExactPersonalAiLearningHistoryCandidateBinding",
    );
    expect(repositorySource).toContain(
      "aiGenerationTask.authorization_public_id",
    );
    expect(repositorySource).toContain("aiGenerationTask.result_public_id");
    expect(repositorySource).toContain(
      "personalAiGenerationResult.task_public_id",
    );
    expect(repositorySource).toContain(
      "personalAiGenerationResult.result_status",
    );
    expect(repositorySource).toContain("aiGenerationTask.task_status");
    const authoritativePartition = repositorySource.match(
      /function createHistoryAuthoritativePartitionCondition[\s\S]*?return and\([\s\S]*?\n  \);\n\}/u,
    )?.[0];
    expect(authoritativePartition).toContain(
      "aiGenerationTask.actor_public_id",
    );
    expect(authoritativePartition).toContain(
      "aiGenerationTask.authorization_public_id",
    );
    expect(authoritativePartition).not.toContain("aiGenerationTask.owner_type");
    expect(authoritativePartition).not.toContain(
      "aiGenerationTask.owner_public_id",
    );
    const historyQueryContract = contractSource.match(
      /export type PersonalAiGenerationLearningSessionHistoryQueryDto = \{([^}]+)\};/u,
    )?.[1];
    expect(historyQueryContract).toContain("ownerType");
    expect(historyQueryContract).toContain("ownerPublicId");
    expect(routeSource).toContain("ownerType: authorizationContext.ownerType");
    expect(routeSource).toContain(
      "ownerPublicId: authorizationContext.ownerPublicId",
    );
    expect(repositorySource).toContain('isolationLevel: "repeatable read"');
    expect(repositorySource).toContain('accessMode: "read only"');
    expect(repositorySource).toContain(
      "desc(personalAiLearningSession.created_at)",
    );
    expect(repositorySource).toContain("desc(personalAiLearningSession.id)");
    expect(repositorySource).toContain(".limit(input.pageSize)");
    expect(repositorySource).toContain(
      ".offset((input.page - 1) * input.pageSize)",
    );
    const historyItemContract = contractSource.match(
      /export type PersonalAiGenerationLearningSessionHistoryItemDto = \{([^}]+)\};/u,
    )?.[1];
    const statisticsContract = contractSource.match(
      /export type PersonalAiGenerationLearningSessionAggregateStatisticsDto = \{([^}]+)\};/u,
    )?.[1];

    expect(historyItemContract).toBeDefined();
    expect(statisticsContract).toBeDefined();
    expect(historyItemContract).not.toContain("authorizationPublicId");
    expect(statisticsContract).not.toContain("authorizationPublicId");
    expect(uiSource).toContain("完成本次学习");
    expect(uiSource).toContain("加载学习记录");
    expect(uiSource).toContain("AI学习记录分页");
    expect(uiSource).toContain("session.canResume");
    expect(uiSource).toContain("session.canReview");
    expect(uiSource).toContain("session.canComplete");
    expect(uiSource).toContain("aiLearningLifecycleLoadSequenceRef");
    expect(uiSource).toContain("selectedAuthorizationPublicIdRef");
    expect(uiSource).toContain('result.taskType === "ai_question_generation"');
    expect(repositorySource).toContain("validateCompletedSessionSummary");
    expect(contractSource).toContain(
      "questions: PersonalAiGenerationLearningSessionPublicQuestionDto[]",
    );
    expect(uiSource).not.toContain("answerCommandDigest");
  });
});
