import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID =
  "p1-remediation-rc-08-answer-session-authorization-lineage-2026-07-22";
const BASE_SHA = "3c55bcf0b5d0164a2b2bb5543bdce448f75c49a3";
const BRANCH = "fix/answer-session-authorization-lineage";
const PARENT_APPROVAL_ID =
  "guardian-f0008-answer-session-authorization-lineage-2026-07-22";
const AMENDMENT_APPROVAL_ID =
  "guardian-f0008-validation-command-materialization-amendment-2026-07-23";
const MIGRATION_TAG =
  "20260723003000_p1_rc_08_answer_session_authorization_lineage";

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
  validationCommands: ValidationCommand[];
  approvalSources: {
    database: string | null;
    permission: string | null;
  };
  validationCommandMaterializationAmendment: {
    approvalId: string;
    approvalFingerprint: string;
    invalidatedOneShotApprovalId: string;
    startingCandidateTree: string;
    startingStagedDiffHash: string;
    conditionalCloseout: boolean;
  };
};

type DrizzleSnapshot = {
  id: string;
  prevId: string;
  version: string;
  dialect: string;
  tables: Record<
    string,
    {
      columns: Record<string, unknown>;
      indexes: Record<string, unknown>;
      checkConstraints: Record<string, unknown>;
    }
  >;
};

type DrizzleJournal = {
  version: string;
  dialect: string;
  entries: Array<{
    idx: number;
    version: string;
    when: number;
    tag: string;
    breakpoints: boolean;
  }>;
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
    .replace(/--.*$/gmu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/;$/u, "");
}

function buildExpectedLineageMigrationStatements(): string[] {
  const tables = ["mock_exam", "practice"] as const;
  const columns = [
    "authorization_source",
    "authorization_public_id",
    "authorization_organization_public_id",
    "quota_owner_type",
    "quota_owner_public_id",
  ] as const;
  const statements: string[] = [];

  for (const table of tables) {
    for (const column of columns) {
      statements.push(`ALTER TABLE "${table}" ADD COLUMN "${column}" text`);
    }
  }

  statements.push(
    'CREATE INDEX "idx_mock_exam_authorization_source_public_id" ON "mock_exam" USING btree ("authorization_source","authorization_public_id")',
    'CREATE INDEX "idx_mock_exam_authorization_organization_public_id" ON "mock_exam" USING btree ("authorization_organization_public_id")',
    'CREATE INDEX "idx_practice_authorization_source_public_id" ON "practice" USING btree ("authorization_source","authorization_public_id")',
    'CREATE INDEX "idx_practice_authorization_organization_public_id" ON "practice" USING btree ("authorization_organization_public_id")',
  );

  for (const table of tables) {
    statements.push(
      `ALTER TABLE "${table}" ADD CONSTRAINT "chk_${table}_authorization_lineage_completeness" CHECK (("${table}"."authorization_source" is null and "${table}"."authorization_public_id" is null and "${table}"."authorization_organization_public_id" is null and "${table}"."quota_owner_type" is null and "${table}"."quota_owner_public_id" is null) or ("${table}"."authorization_source" is not null and "${table}"."authorization_public_id" is not null and "${table}"."quota_owner_type" is not null and "${table}"."quota_owner_public_id" is not null))`,
      `ALTER TABLE "${table}" ADD CONSTRAINT "chk_${table}_authorization_lineage_source" CHECK ("${table}"."authorization_source" is null or ("${table}"."authorization_source" = 'personal_auth' and "${table}"."authorization_organization_public_id" is null and "${table}"."quota_owner_type" = 'personal') or ("${table}"."authorization_source" = 'org_auth' and "${table}"."authorization_organization_public_id" is not null and "${table}"."quota_owner_type" = 'organization'))`,
    );
  }

  return statements;
}

function findValidationCommand(
  commands: ValidationCommand[],
  name: string,
): ValidationCommand {
  const matches = commands.filter((command) => command.name === name);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

describe("F-0008 answer session authorization lineage", () => {
  it("strictly parses state and validates the frozen task contract", () => {
    const taskSafety = parseRepositoryJson<TaskSafetyContract>(
      "docs/04-agent-system/state/task-safety.json",
    );
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    );

    if (taskSafety.taskId !== TASK_ID) {
      expect(projectState).toMatchObject({
        p1RemediationSerialProgram: {
          taskStatusById: { [TASK_ID]: "closed" },
        },
      });
      expect(taskQueue).toMatchObject({
        p1RemediationSerialProgram: {
          taskStatusById: { [TASK_ID]: "closed" },
        },
        activeTasks: expect.arrayContaining([
          expect.objectContaining({
            id: TASK_ID,
            status: "closed",
            closeoutEvidence: expect.objectContaining({
              commit: "b6fdab26fde7213f547d579e9fa18b0d34bd243c",
            }),
          }),
        ]),
      });
      return;
    }

    expect(taskSafety).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      branch: BRANCH,
      approvalSources: {
        database: PARENT_APPROVAL_ID,
        permission: PARENT_APPROVAL_ID,
      },
      validationCommandMaterializationAmendment: {
        approvalId: AMENDMENT_APPROVAL_ID,
        approvalFingerprint:
          "f0008-validation-command-materialization-amendment-aa3afad2-2026-07-23",
        invalidatedOneShotApprovalId:
          "user-f0008-manual-hook-equivalent-one-shot-2026-07-23",
        startingCandidateTree: "aa3afad242fe24ad8baa2b933e2723dd8538a64e",
        startingStagedDiffHash: "0edf2a7902377e86950ca587fd9c0f2981d14150",
        conditionalCloseout: false,
      },
    });
    expect(projectState).toMatchObject({
      currentPhase: TASK_ID,
      p1RemediationSerialProgram: {
        status: "in_progress",
        currentTaskId: TASK_ID,
        taskStatusById: { [TASK_ID]: "in_progress" },
      },
      currentTask: {
        id: TASK_ID,
        phase: TASK_ID,
        status: "in_progress",
        branch: BRANCH,
        riskBoundary: {
          approvalId: PARENT_APPROVAL_ID,
          approvedBaseSha: BASE_SHA,
        },
      },
    });
    expect(taskQueue).toMatchObject({
      p1RemediationSerialProgram: {
        status: "in_progress",
        currentTaskId: TASK_ID,
        taskStatusById: { [TASK_ID]: "in_progress" },
      },
    });
    const activeTasks = (
      taskQueue as { activeTasks?: Array<Record<string, unknown>> }
    ).activeTasks;
    expect(activeTasks).toBeDefined();
    expect(
      activeTasks!.filter((task) => task.status === "in_progress"),
    ).toEqual([
      expect.objectContaining({
        id: TASK_ID,
        phase: TASK_ID,
        status: "in_progress",
        branch: BRANCH,
        riskBoundary: expect.objectContaining({
          approvalId: PARENT_APPROVAL_ID,
          approvedBaseSha: BASE_SHA,
        }),
      }),
    ]);

    expect(JSON.stringify(taskSafety.validationCommands)).not.toMatch(/[<>]/u);
    expect(
      findValidationCommand(
        taskSafety.validationCommands,
        "answer-session-authorization-lineage-lint",
      ),
    ).toEqual({
      name: "answer-session-authorization-lineage-lint",
      kind: "lint",
      executable: "npm.cmd",
      arguments: ["run", "lint"],
    });

    const formatCommand = findValidationCommand(
      taskSafety.validationCommands,
      "answer-session-authorization-lineage-format",
    );
    expect(formatCommand).toMatchObject({
      kind: "lint",
      executable: "corepack.cmd",
    });
    expect(formatCommand.arguments.slice(0, 4)).toEqual([
      "pnpm@11.9.0",
      "exec",
      "prettier",
      "--check",
    ]);
    expect(formatCommand.arguments.slice(4)).toEqual([
      "docs/04-agent-system/state/project-state.yaml",
      "docs/04-agent-system/state/task-queue.yaml",
      "docs/04-agent-system/state/task-safety.json",
      "src/app/**/page.tsx",
      "src/db/schema/student-experience.test.ts",
      "src/db/schema/student-experience.ts",
      "src/features/student/home/StudentHomePage.tsx",
      "src/features/student/mock-exam/StudentMockExamReportPage.tsx",
      "src/features/student/practice/StudentPracticePage.tsx",
      "src/server/mappers/mock-exam-mapper.test.ts",
      "src/server/mappers/practice-mapper.test.ts",
      "src/server/models/student-experience.test.ts",
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
      "src/server/repositories/mock-exam-repository.ts",
      "src/server/repositories/practice-repository.ts",
      "src/server/repositories/student-flow-runtime-repository.ts",
      "src/server/services/mock-exam-service.test.ts",
      "src/server/services/mock-exam-service.ts",
      "src/server/services/practice-service.test.ts",
      "src/server/services/practice-service.ts",
      "src/server/validators/mock-exam.test.ts",
      "src/server/validators/mock-exam.ts",
      "src/server/validators/practice.test.ts",
      "src/server/validators/practice.ts",
      "tests/unit/p1-answer-session-authorization-lineage.test.ts",
      "tests/unit/phase-7-student-flow-runtime-smoke.test.ts",
      "tests/unit/student-home-ui.test.ts",
      "tests/unit/student-mock-exam-report-ui.test.ts",
      "tests/unit/student-practice-ui.test.ts",
    ]);

    for (const [name, testName] of [
      [
        "answer-session-authorization-lineage-state-parse",
        "strictly parses state and validates the frozen task contract",
      ],
      [
        "answer-session-authorization-lineage-schema-source",
        "allows only the exact additive lineage migration and coherent Drizzle metadata",
      ],
    ] as const) {
      expect(
        findValidationCommand(taskSafety.validationCommands, name),
      ).toEqual({
        name,
        kind: "test",
        executable: "corepack.cmd",
        arguments: [
          "pnpm@11.9.0",
          "exec",
          "vitest",
          "run",
          "tests/unit/p1-answer-session-authorization-lineage.test.ts",
          "-t",
          testName,
          "--maxWorkers=1",
        ],
      });
    }
  });

  it("allows only the exact additive lineage migration and coherent Drizzle metadata", () => {
    const migration = readRepositoryFile(
      "drizzle/20260723003000_p1_rc_08_answer_session_authorization_lineage.sql",
    );
    const statements = migration
      .split("--> statement-breakpoint")
      .map(normalizeSql)
      .filter(Boolean);
    const expectedStatements = buildExpectedLineageMigrationStatements();

    expect(statements).toHaveLength(18);
    expect(statements).toEqual(expectedStatements);
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE)\b|ALTER\s+COLUMN|\b(?:backfill|apply)\b/iu,
    );
    expect(migration).not.toContain("NOT NULL");

    const journal = parseRepositoryJson<DrizzleJournal>(
      "drizzle/meta/_journal.json",
    );
    const currentSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260723003000_snapshot.json",
    );
    const previousSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260722234500_snapshot.json",
    );
    const currentJournalIndex = journal.entries.findIndex(
      (entry) => entry.tag === MIGRATION_TAG,
    );
    const previousJournalEntry = journal.entries[currentJournalIndex - 1];
    const currentJournalEntry = journal.entries[currentJournalIndex];

    expect(currentJournalIndex).toBeGreaterThan(0);
    expect(previousJournalEntry).toBeDefined();
    expect(currentJournalEntry).toEqual({
      idx: previousJournalEntry!.idx + 1,
      version: journal.version,
      when: expect.any(Number),
      tag: MIGRATION_TAG,
      breakpoints: true,
    });
    expect(currentJournalEntry!.when).toBeGreaterThan(
      previousJournalEntry!.when,
    );
    expect(currentSnapshot).toMatchObject({
      prevId: previousSnapshot.id,
      version: previousSnapshot.version,
      dialect: previousSnapshot.dialect,
    });
    expect(currentSnapshot.id).not.toBe(previousSnapshot.id);

    const lineageColumns = [
      "authorization_source",
      "authorization_public_id",
      "authorization_organization_public_id",
      "quota_owner_type",
      "quota_owner_public_id",
    ];
    for (const table of ["mock_exam", "practice"] as const) {
      const snapshotTable = currentSnapshot.tables[`public.${table}`];
      expect(snapshotTable).toBeDefined();
      expect(Object.keys(snapshotTable!.columns)).toEqual(
        expect.arrayContaining(lineageColumns),
      );
      expect(Object.keys(snapshotTable!.indexes)).toEqual(
        expect.arrayContaining([
          `idx_${table}_authorization_source_public_id`,
          `idx_${table}_authorization_organization_public_id`,
        ]),
      );
      expect(Object.keys(snapshotTable!.checkConstraints)).toEqual(
        expect.arrayContaining([
          `chk_${table}_authorization_lineage_completeness`,
          `chk_${table}_authorization_lineage_source`,
        ]),
      );
    }
  });

  it("validates and locks the exact source in the session creation transaction", () => {
    const repository = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );

    expect(repository).toContain("lockOrganizationScopeMutation(database)");
    expect(repository).toContain(
      "eq(personalAuth.public_id, lineage.authorizationPublicId)",
    );
    expect(repository).toContain(
      "eq(orgAuth.public_id, lineage.authorizationPublicId)",
    );
    expect(repository).toContain('.for("update")');
    expect(repository).toContain(
      "authorization_source:\n              input.authorizationLineage.authorizationSource",
    );
  });

  it("terminates only sessions carrying the cancelled or disabled org_auth lineage", () => {
    const repository = readRepositoryFile(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );

    expect(repository).toContain(
      'eq(practice.authorization_source, "org_auth")',
    );
    expect(repository).toMatch(
      /eq\(practice\.authorization_public_id,\s*activeFlowScope\.orgAuthPublicId\)/u,
    );
    expect(repository).toMatch(
      /inArray\(\s*practice\.authorization_organization_public_id,\s*organizationPublicIds/u,
    );
    expect(repository).toContain('termination_reason: "org_auth_cancelled"');
    expect(repository).toContain('termination_reason: "organization_disabled"');
    expect(repository).toContain('termination_reason: "account_disabled"');
  });

  it("propagates only the requested source identity while retaining server authority", () => {
    const home = readRepositoryFile(
      "src/features/student/home/StudentHomePage.tsx",
    );
    const practice = readRepositoryFile(
      "src/features/student/practice/StudentPracticePage.tsx",
    );
    const mockExam = readRepositoryFile(
      "src/features/student/mock-exam/StudentMockExamReportPage.tsx",
    );

    for (const source of [home, practice, mockExam]) {
      expect(source).toContain("authorizationPublicId");
      expect(source).toContain("authorizationSource");
    }
    expect(practice).not.toContain("quotaOwnerPublicId");
    expect(mockExam).not.toContain("quotaOwnerPublicId");
  });
});
