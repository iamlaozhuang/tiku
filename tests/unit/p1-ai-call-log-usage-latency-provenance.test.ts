import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const taskId =
  "p1-remediation-rc-08-ai-call-usage-latency-provenance-2026-07-23";
const baseSha = "8a27e66f134d3afeff0f8c03a92c911ae438cb3b";
const approvalId = "guardian-f0177-ai-call-usage-latency-provenance-2026-07-23";
const formatCommandMaterializationApprovalId =
  "guardian-f0177-format-cmd-path-materialization-amendment-08-2026-07-23";
const adminAiAuditLogOpsBaselinePath =
  "src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx";
const adminAiAuditLogOpsBaselineFormatGlob =
  "src/app/**/AdminAiAuditLogOpsBaseline.tsx";

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

describe("F-0177 AI call observation provenance", () => {
  it("validates the F-0177 task state and additive observation migration source", () => {
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
        kind: string;
        executable: string;
        arguments: string[];
      }>;
      approvalSources: Record<string, string | null>;
      conditionalCloseout: boolean;
    };

    expect(taskSafety).toMatchObject({
      taskId,
      baseSha,
      branch: "fix/ai-call-log-usage-provenance",
      approvalId,
      approvalSources: {
        database: approvalId,
        provider: approvalId,
        scopeAmendment:
          "guardian-f0177-legacy-ai-call-row-fixtures-amendment-01-2026-07-23",
        testExpectationAmendment:
          "guardian-f0177-ai-func-type-expectation-amendment-02-2026-07-23",
        directTestCallerAmendment:
          "guardian-f0177-direct-test-callers-amendment-03-2026-07-23",
        baselineFixtureAlignmentAmendment:
          "guardian-f0177-baseline-fixture-alignment-amendment-04-2026-07-23",
        adminPersistenceQuotaHarnessAmendment:
          "guardian-f0177-admin-persistence-quota-harness-amendment-05-2026-07-23",
        governanceAppendLogCallerAmendment:
          "guardian-f0177-governance-append-log-caller-amendment-06-2026-07-23",
        generationLogLifecycleProvenanceAmendment:
          "guardian-f0177-generation-log-lifecycle-provenance-amendment-07-2026-07-23",
        formatCommandMaterializationAmendment:
          formatCommandMaterializationApprovalId,
      },
      conditionalCloseout: true,
    });
    expect(taskSafety.allowedFiles).toHaveLength(72);
    expect(taskSafety.coreFiles).toHaveLength(34);
    expect(taskSafety.contingencyFiles).toHaveLength(38);
    expect(new Set(taskSafety.allowedFiles).size).toBe(72);
    expect(taskSafety.allowedFiles).toEqual([
      ...taskSafety.coreFiles,
      ...taskSafety.contingencyFiles,
    ]);
    for (const command of taskSafety.validationCommands) {
      expect(["test", "lint", "typecheck", "other"]).toContain(command.kind);
      expect(["corepack.cmd", "npm.cmd", "git.exe"]).toContain(
        command.executable,
      );
      expect(command.arguments.join(" ")).not.toMatch(/[<>]/u);
    }

    const formatCommands = taskSafety.validationCommands.filter(
      (command) =>
        command.executable === "corepack.cmd" &&
        command.arguments.includes("prettier"),
    );
    expect(formatCommands).toHaveLength(1);
    const [formatCommand] = formatCommands;
    expect(formatCommand?.arguments).not.toContain(
      adminAiAuditLogOpsBaselinePath,
    );
    expect(formatCommand?.arguments).toContain(
      adminAiAuditLogOpsBaselineFormatGlob,
    );
    expect(
      formatCommand?.arguments.filter(
        (argument) => argument === adminAiAuditLogOpsBaselineFormatGlob,
      ),
    ).toHaveLength(1);
    expect(formatCommand?.arguments).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/[()]/u)]),
    );

    const matchingBasenamePaths: string[] = [];
    const collectMatchingBasenamePaths = (directory: string): void => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          collectMatchingBasenamePaths(entryPath);
        } else if (entry.name === "AdminAiAuditLogOpsBaseline.tsx") {
          matchingBasenamePaths.push(
            path.relative(repositoryRoot, entryPath).replaceAll("\\", "/"),
          );
        }
      }
    };
    collectMatchingBasenamePaths(path.join(repositoryRoot, "src/app"));
    expect(matchingBasenamePaths).toEqual([adminAiAuditLogOpsBaselinePath]);

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
      branch: "fix/ai-call-log-usage-provenance",
      executionStage: taskSafety.status,
      riskBoundary: { requestedBaseSha: baseSha, approvalId },
    });
    expect(
      taskQueue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([
      expect.objectContaining({
        id: taskId,
        branch: "fix/ai-call-log-usage-provenance",
        executionStage: taskSafety.status,
        riskBoundary: expect.objectContaining({
          requestedBaseSha: baseSha,
          approvalId,
        }),
      }),
    ]);

    const migrationPath =
      "drizzle/20260723053000_p1_rc_08_ai_call_observation_provenance.sql";
    expect(taskSafety.allowedFiles).toContain(migrationPath);
    const migration = readRepositoryFile(migrationPath).trim();
    const statements = migration
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/--.*$/gmu, "").trim())
      .filter(Boolean);
    expect(statements).toHaveLength(5);
    expect(statements.slice(0, 4)).toEqual([
      'ALTER TABLE "ai_call_log" ADD COLUMN "observation_schema_version" integer;',
      'ALTER TABLE "ai_call_log" ADD COLUMN "token_count_source" text;',
      'ALTER TABLE "ai_call_log" ADD COLUMN "token_estimation_method" text;',
      'ALTER TABLE "ai_call_log" ADD COLUMN "latency_source" text;',
    ]);
    expect(statements[4]).toMatch(
      /^ALTER TABLE "ai_call_log" ADD CONSTRAINT "chk_ai_call_log_observation_v1" CHECK \([\s\S]+\);$/u,
    );
    expect(statements[4].match(/;/gu)).toHaveLength(1);
    expect(statements[4]).toMatch(
      /"observation_schema_version" is not null[\s\S]+"token_count_source" is not null[\s\S]+"latency_source" is not null/u,
    );
    expect(statements[4]).toMatch(
      /"prompt_token_count" is not null[\s\S]+"completion_token_count" is not null[\s\S]+"total_token_count" is not null/u,
    );
    expect(statements[4]).toMatch(
      /"token_count_source" = 'unavailable'[\s\S]+"estimated_cost_cny" is null/u,
    );
    expect(statements[4]).toMatch(
      /"latency_ms" is not null[\s\S]+"latency_ms" between 0 and 2147483647/u,
    );
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|ALTER\s+COLUMN|INSERT|COPY|CREATE\s+TABLE|CREATE\s+TYPE)\b/iu,
    );
    expect(migration).not.toMatch(/\bDEFAULT\b/iu);

    const previousSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723043000_snapshot.json"),
    ) as { id: string };
    const currentSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723053000_snapshot.json"),
    ) as {
      id: string;
      prevId: string;
      tables: Record<
        string,
        { checkConstraints: Record<string, { value: string }> }
      >;
    };
    const journal = JSON.parse(
      readRepositoryFile("drizzle/meta/_journal.json"),
    ) as { entries: Array<{ idx: number; tag: string }> };
    expect(currentSnapshot.id).not.toBe(previousSnapshot.id);
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(
      currentSnapshot.tables["public.ai_call_log"].checkConstraints[
        "chk_ai_call_log_observation_v1"
      ].value,
    ).toMatch(
      /"token_count_source" = 'unavailable'[\s\S]+"estimated_cost_cny" is null/u,
    );
    expect(journal.entries.at(-1)).toEqual(
      expect.objectContaining({
        idx: 57,
        tag: "20260723053000_p1_rc_08_ai_call_observation_provenance",
      }),
    );
  });

  it("removes fixed and partial metric heuristics from production sinks", () => {
    const productionSources = [
      "src/server/services/ai-scoring-service.ts",
      "src/server/services/student-flow-runtime.ts",
      "src/server/services/ai-explanation-hint-service.ts",
      "src/server/services/knowledge-recommendation-service.ts",
      "src/ai/mock-provider.ts",
      "src/server/services/route-integrated-provider-execution-service.ts",
      "src/server/services/route-integrated-provider-governance-service.ts",
      "src/server/repositories/admin-ai-audit-log-runtime-repository.ts",
      "src/server/repositories/ai-generation-task-lifecycle-repository.ts",
      "src/server/repositories/admin-ai-generation-result-persistence-db-adapter.ts",
      "src/server/repositories/personal-ai-generation-result-repository.ts",
    ].map((relativePath) => readRepositoryFile(relativePath));
    const source = productionSources.join("\n");

    expect(source).not.toContain("latencyMs: 1000");
    expect(source).not.toContain("function estimateTokenCount");
    expect(source).not.toContain("completionTokenCount: 0");
    expect(source).not.toMatch(
      /coalesce\([^)]*total_token_count[^)]*,\s*0\)/iu,
    );
    expect(source).toContain("createProviderReportedAiCallObservation");
    expect(source).toContain("createEstimatedAiCallObservation");
    expect(source).toContain("createUnavailableAiCallObservation");
    expect(source).toContain("measureClientObservedLatency");
    expect(source).toContain("provider_reported_token_count");
    expect(source).toContain("estimated_token_count");
    expect(source).toContain("unavailable_observation_count");
    expect(source).toContain("legacy_observation_count");
    expect(source).toContain(
      "normalizePersistedAiCallLogReservationObservation(existingLogs[0])",
    );
    expect(
      source.match(/createTerminalAiCallObservationCondition\(\),/gu),
    ).toHaveLength(3);
    expect(
      source.match(/createCurrentMeasuredAiCallObservationCondition\(\),/gu),
    ).toHaveLength(2);
    expect(
      source.match(
        /normalizePersistedCurrentMeasuredAiCallObservation\(finalizedLogs\[0\]\)/gu,
      ),
    ).toHaveLength(2);

    const centralContract = readRepositoryFile(
      "src/server/services/ai-call-observation.ts",
    );
    expect(
      centralContract.match(/export function normalizeAiCallObservation\(/gu),
    ).toHaveLength(1);
    expect(centralContract).toContain(
      "providerUsage: CanonicalProviderTokenUsage | null;",
    );
    expect(centralContract).not.toContain("providerUsage: unknown;");
    expect(centralContract).toContain(
      "export function normalizeProviderTokenUsageAtAdapterEdge(",
    );

    for (const relativePath of [
      "src/server/services/ai-scoring-service.ts",
      "src/server/services/ai-explanation-hint-service.ts",
      "src/server/services/route-integrated-provider-execution-service.ts",
    ]) {
      expect(readRepositoryFile(relativePath)).toContain(
        "normalizeProviderTokenUsageAtAdapterEdge(",
      );
    }
  });
});
