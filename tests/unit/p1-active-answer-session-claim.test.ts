import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID = "p1-remediation-rc-08-active-answer-session-claim-2026-07-23";
const BASE_SHA = "b6fdab26fde7213f547d579e9fa18b0d34bd243c";
const BRANCH = "fix/active-answer-session-claim";
const APPROVAL_ID = "guardian-f0026-active-answer-session-claim-2026-07-23";
const MIGRATION_TAG = "20260723013000_p1_rc_08_active_answer_session_claim";

type ValidationCommand = {
  name: string;
  kind: string;
  executable: string;
  arguments: string[];
};

type TaskSafetyContract = {
  taskId: string;
  baseSha: string;
  branch: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  validationCommands: ValidationCommand[];
  approvalSources: { database: string | null; permission: string | null };
  conditionalCloseout: boolean;
};

type DrizzleJournal = {
  version: string;
  entries: Array<{
    idx: number;
    version: string;
    when: number;
    tag: string;
    breakpoints: boolean;
  }>;
};

type DrizzleSnapshot = {
  id: string;
  prevId: string;
  version: string;
  dialect: string;
  tables: Record<
    string,
    {
      indexes: Record<
        string,
        {
          isUnique: boolean;
          where?: string;
          columns: Array<{ expression: string }>;
        }
      >;
    }
  >;
};

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseRepositoryJson<T>(path: string): T {
  return JSON.parse(readRepositoryFile(path)) as T;
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

function normalizeSql(statement: string): string {
  return statement
    .replace(/--[^\r\n]*/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

describe("F-0026 active answer session claim", () => {
  it("strictly parses the F-0026 task contract and WIP state", () => {
    const contract = parseRepositoryJson<TaskSafetyContract>(
      "docs/04-agent-system/state/task-safety.json",
    );
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string };
      p1RemediationSerialProgram: { currentTaskId: string };
    };
    const queue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as { activeTasks: Array<{ id: string; status: string }> };

    expect(contract).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      branch: BRANCH,
      approvalSources: { database: APPROVAL_ID, permission: null },
      conditionalCloseout: true,
    });
    expect(contract.allowedFiles).toHaveLength(18);
    expect(contract.coreFiles).toHaveLength(16);
    expect(contract.contingencyFiles).toHaveLength(2);
    expect(projectState.currentTask.id).toBe(TASK_ID);
    expect(projectState.p1RemediationSerialProgram.currentTaskId).toBe(TASK_ID);
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expect.objectContaining({ id: TASK_ID })]);

    for (const command of contract.validationCommands) {
      expect(command.executable).not.toMatch(/[<>]/u);
      expect(command.arguments.join(" ")).not.toMatch(/<[^>]+>/u);
    }
  });

  it("allows only the two additive active-session partial unique indexes", () => {
    const migration = readRepositoryFile(`drizzle/${MIGRATION_TAG}.sql`);
    const statements = migration
      .split("--> statement-breakpoint")
      .map(normalizeSql)
      .filter(Boolean);

    expect(statements).toHaveLength(2);
    expect(new Set(statements)).toEqual(
      new Set([
        'CREATE UNIQUE INDEX "udx_practice_user_id_paper_id_active" ON "practice" USING btree ("user_id","paper_id") WHERE "practice"."practice_status" = \'in_progress\';',
        'CREATE UNIQUE INDEX "udx_mock_exam_user_id_paper_id_active" ON "mock_exam" USING btree ("user_id","paper_id") WHERE "mock_exam"."exam_status" = \'in_progress\';',
      ]),
    );
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT)\b|ALTER\s+(?:TABLE|COLUMN)|\b(?:backfill|apply)\b/iu,
    );

    const journal = parseRepositoryJson<DrizzleJournal>(
      "drizzle/meta/_journal.json",
    );
    const currentEntry = journal.entries.at(-1);
    const previousEntry = journal.entries.at(-2);
    const currentSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260723013000_snapshot.json",
    );
    const previousSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260723003000_snapshot.json",
    );

    expect(currentEntry).toEqual({
      idx: previousEntry!.idx + 1,
      version: journal.version,
      when: expect.any(Number),
      tag: MIGRATION_TAG,
      breakpoints: true,
    });
    expect(currentEntry!.when).toBeGreaterThan(previousEntry!.when);
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(
      currentSnapshot.tables["public.practice"]?.indexes
        .udx_practice_user_id_paper_id_active,
    ).toMatchObject({
      isUnique: true,
      columns: [{ expression: "user_id" }, { expression: "paper_id" }],
      where: '"practice"."practice_status" = \'in_progress\'',
    });
    expect(
      currentSnapshot.tables["public.mock_exam"]?.indexes
        .udx_mock_exam_user_id_paper_id_active,
    ).toMatchObject({
      isUnique: true,
      columns: [{ expression: "user_id" }, { expression: "paper_id" }],
      where: '"mock_exam"."exam_status" = \'in_progress\'',
    });
  });

  it("serializes both create paths and rechecks every active row inside the transaction", () => {
    const repository = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const practiceCreate = repository.slice(
      repository.indexOf("async createPractice(input)"),
      repository.indexOf("async expirePractice(input)"),
    );
    const mockCreate = repository.slice(
      repository.indexOf("async createMockExam(input)"),
      repository.indexOf("async saveMockExamAnswerRecord(input)"),
    );

    for (const source of [practiceCreate, mockCreate]) {
      expect(source).toContain("validateAndLockAuthorizationLineageForStart");
      expect(source).toContain("lockActiveAnswerSessionClaim");
      expect(
        source.indexOf("validateAndLockAuthorizationLineageForStart"),
      ).toBeLessThan(source.indexOf("lockActiveAnswerSessionClaim"));
      expect(source).toContain('.for("update")');
      expect(source).toContain("activeRows.length > 1");
      expect(source).toContain("replaceActivePublicId");
      expect(source).toContain(".onConflictDoNothing()");
      expect(source).not.toContain(".limit(1)");
    }
    expect(mockCreate).toContain("mockExamDeadlineTask");
    expect(mockCreate.indexOf("mockExamDeadlineTask")).toBeLessThan(
      mockCreate.lastIndexOf("return mapMockExamRow"),
    );
    expect(repository).toContain("ACTIVE_ANSWER_SESSION_CLAIM_LOCK_NAMESPACE");
    expect(repository).toContain("pg_advisory_xact_lock");
    expect(repository).toContain('mode: "practice" | "mock_exam"');
  });
});
