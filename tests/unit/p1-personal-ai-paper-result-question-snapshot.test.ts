import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const taskId =
  "p1-remediation-rc-08-personal-ai-paper-result-question-snapshot-2026-07-23";
const baseSha = "2fa26362377f3099f6d794deacb64be73b220530";
const approvalId =
  "guardian-f0162-personal-ai-paper-result-question-snapshot-2026-07-23";
const migrationPath =
  "drizzle/20260723063000_p1_rc_08_personal_ai_paper_question_snapshot.sql";

function readRepositoryFile(relativePath: string): string {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function parseYamlStrictly(relativePath: string): unknown {
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
  const document = parseDocument(readRepositoryFile(relativePath), {
    strict: true,
    uniqueKeys: true,
  });
  expect(document.errors).toEqual([]);
  return document.toJS();
}

describe("F-0162 private paper question result snapshot", () => {
  it("keeps task state and additive migration source exact", () => {
    const taskSafety = JSON.parse(
      readRepositoryFile("docs/04-agent-system/state/task-safety.json"),
    ) as {
      taskId: string;
      baseSha: string;
      branch: string;
      status: string;
      approvalId: string;
      allowedFiles: string[];
      coreFiles: string[];
      contingencyFiles: string[];
      validationCommands: Array<{
        name: string;
        kind: string;
        executable: string;
        arguments: string[];
      }>;
      approvalSources: Record<string, string | null>;
      conditionalCloseout: { approved: boolean; approvalId: string };
    };

    expect(taskSafety).toMatchObject({
      taskId,
      baseSha,
      branch: "fix/personal-ai-paper-result-question-snapshot",
      approvalId,
      approvalSources: { database: approvalId },
      conditionalCloseout: { approved: true, approvalId },
    });
    expect(taskSafety.allowedFiles).toHaveLength(43);
    expect(taskSafety.coreFiles).toHaveLength(33);
    expect(taskSafety.contingencyFiles).toHaveLength(10);
    expect(new Set(taskSafety.allowedFiles).size).toBe(43);
    expect(taskSafety.allowedFiles).toEqual([
      ...taskSafety.coreFiles,
      ...taskSafety.contingencyFiles,
    ]);
    expect(taskSafety.allowedFiles).toContain(migrationPath);

    for (const command of taskSafety.validationCommands) {
      expect(["test", "lint", "typecheck", "other"]).toContain(command.kind);
      expect(["corepack.cmd", "npm.cmd", "git.exe"]).toContain(
        command.executable,
      );
      expect(command.arguments.join(" ")).not.toMatch(/[<>]/u);
    }

    const nonSqlAllowedFiles = taskSafety.allowedFiles.filter(
      (allowedFile) => !allowedFile.endsWith(".sql"),
    );
    const [formatCommand] = taskSafety.validationCommands.filter(
      (command) => command.name === "format",
    );
    expect(formatCommand).toBeDefined();
    expect(
      nonSqlAllowedFiles.every((file) =>
        formatCommand.arguments.includes(file),
      ),
    ).toBe(true);

    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: {
        id: string;
        branch: string;
        executionStage: string;
        riskBoundary: { requestedBaseSha: string; approvalId: string };
      };
    };
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as {
      activeTasks: Array<{
        id: string;
        branch: string;
        status: string;
        executionStage: string;
        riskBoundary: { requestedBaseSha: string; approvalId: string };
      }>;
    };
    expect(projectState.currentTask).toMatchObject({
      id: taskId,
      branch: taskSafety.branch,
      executionStage: taskSafety.status,
      riskBoundary: { requestedBaseSha: baseSha, approvalId },
    });
    expect(
      taskQueue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([
      expect.objectContaining({
        id: taskId,
        branch: taskSafety.branch,
        executionStage: taskSafety.status,
        riskBoundary: expect.objectContaining({
          requestedBaseSha: baseSha,
          approvalId,
        }),
      }),
    ]);

    const migration = readRepositoryFile(migrationPath).trim();
    const statements = migration
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/--.*$/gmu, "").trim())
      .filter(Boolean);
    expect(statements).toHaveLength(5);
    expect(statements.slice(0, 3)).toEqual([
      'ALTER TABLE "personal_ai_generation_result" ADD COLUMN "paper_question_snapshot_schema_version" text;',
      'ALTER TABLE "personal_ai_generation_result" ADD COLUMN "paper_question_snapshot" jsonb;',
      'ALTER TABLE "personal_ai_generation_result" ADD COLUMN "paper_question_snapshot_digest" text;',
    ]);
    expect(statements[3]).toMatch(
      /^ALTER TABLE "personal_ai_generation_result" ADD CONSTRAINT "personal_ai_generation_result_paper_question_snapshot_coherence_check" CHECK \([\s\S]+\);$/u,
    );
    expect(statements[4]).toMatch(
      /^ALTER TABLE "personal_ai_generation_result" ADD CONSTRAINT "personal_ai_generation_result_paper_question_snapshot_task_type_check" CHECK \([\s\S]+\);$/u,
    );
    for (const statement of statements) {
      expect(statement.match(/;/gu)).toHaveLength(1);
    }
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT|COPY|CREATE\s+TABLE|CREATE\s+TYPE|ALTER\s+COLUMN|DEFAULT)\b/iu,
    );

    const previousSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723053000_snapshot.json"),
    ) as { id: string };
    const currentSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723063000_snapshot.json"),
    ) as { id: string; prevId: string };
    const journal = JSON.parse(
      readRepositoryFile("drizzle/meta/_journal.json"),
    ) as {
      entries: Array<{ idx: number; tag: string }>;
    };
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(currentSnapshot.id).not.toBe(previousSnapshot.id);
    expect(journal.entries.at(-1)).toEqual(
      expect.objectContaining({
        idx: 58,
        tag: "20260723063000_p1_rc_08_personal_ai_paper_question_snapshot",
      }),
    );
  });

  it("keeps private source facts outside learner result and network projections", () => {
    const learningApiSource = readRepositoryFile(
      "src/app/api/v1/personal-ai-generation-learning-sessions/route.ts",
    );
    const learningPaperSnapshotMapperSource = readRepositoryFile(
      "src/server/services/personal-ai-generation-learning-session-paper-source-resolver.ts",
    );
    const resultMapperSource = readRepositoryFile(
      "src/server/mappers/personal-ai-generation-result-mapper.ts",
    );
    const runtimeBridgeSource = readRepositoryFile(
      "src/server/services/personal-ai-generation-runtime-bridge-service.ts",
    );
    const runtimeBridgeContractSource = readRepositoryFile(
      "src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts",
    );
    const planSelectWiringSource = readRepositoryFile(
      "src/server/services/ai-paper-route-plan-select-wiring-service.ts",
    );
    const resultContractSource = readRepositoryFile(
      "src/server/contracts/personal-ai-generation-result-persistence-contract.ts",
    );
    const publicResultContract = resultContractSource.slice(
      resultContractSource.indexOf("export type PersonalAiGenerationResultDto"),
      resultContractSource.indexOf(
        "export type PersonalAiGenerationResultPersistenceDto",
      ),
    );
    const publicResultMapper = resultMapperSource.slice(
      resultMapperSource.indexOf(
        "export function mapPersonalAiGenerationResultRowToDto",
      ),
      resultMapperSource.indexOf(
        "function readPersonalAiGenerationResultPaperAssemblySnapshot",
      ),
    );
    const publicRuntimeBridgeContract = runtimeBridgeContractSource.slice(
      runtimeBridgeContractSource.indexOf(
        "export type PersonalAiGenerationRuntimeBridgeDto",
      ),
    );

    expect(learningApiSource).not.toMatch(
      /QuestionRepository|OrganizationTrainingRepository|PaperSourceResolver/u,
    );
    expect(learningPaperSnapshotMapperSource).not.toMatch(
      /QuestionRepository|OrganizationTrainingRepository|listAvailable|listEmployeeVisible/u,
    );
    expect(publicResultMapper).not.toMatch(
      /paper_question_snapshot|privatePaperQuestionSnapshot/u,
    );
    expect(publicResultContract).not.toMatch(
      /private|standardAnswer|analysis|scoringPoints|fillBlankAnswers/u,
    );
    expect(planSelectWiringSource).toContain(
      'Object.defineProperty(result, "privateSourceQuestions"',
    );
    expect(planSelectWiringSource).toContain("enumerable: false");
    expect(publicRuntimeBridgeContract).not.toMatch(
      /private|standardAnswer|analysis|scoringPoints|fillBlankAnswers/u,
    );
    expect(runtimeBridgeSource).not.toContain("privateQuestionSnapshot:");
  });
});
