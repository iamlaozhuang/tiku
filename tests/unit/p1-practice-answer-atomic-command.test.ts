import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID =
  "p1-remediation-rc-08-practice-answer-atomic-command-2026-07-23";
const BASE_SHA = "da410333050b0db8b17ed7ca5b16074fb0faa45e";
const BRANCH = "fix/practice-answer-atomic-command";
const APPROVAL_ID = "guardian-f0027-practice-answer-atomic-command-2026-07-23";
const MIGRATION_TAG = "20260723023000_p1_rc_08_practice_answer_atomic_command";

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
  approvalAmendments: Array<{
    approvalId: string;
    addedFiles: string[];
  }>;
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
      columns: Record<string, { notNull: boolean; type: string }>;
      indexes: Record<
        string,
        {
          isUnique: boolean;
          where?: string;
          columns: Array<{ expression: string }>;
        }
      >;
      checkConstraints: Record<string, { value: string }>;
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

describe("F-0027 practice answer atomic command", () => {
  it("strictly parses the F-0027 practice partition contract and WIP state", () => {
    const contract = parseRepositoryJson<TaskSafetyContract>(
      "docs/04-agent-system/state/task-safety.json",
    );
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string; status: string; findingStatus: string };
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
    expect(contract.allowedFiles).toHaveLength(17);
    expect(contract.approvalAmendments).toContainEqual(
      expect.objectContaining({
        approvalId:
          "guardian-f0027-test-fixture-schema-inferselect-amendment-2026-07-23",
        addedFiles: ["src/server/models/student-experience.test.ts"],
      }),
    );
    expect(contract.coreFiles).toHaveLength(13);
    expect(contract.contingencyFiles).toHaveLength(4);
    expect(projectState.currentTask).toMatchObject({
      id: TASK_ID,
      status: "in_progress",
      findingStatus: "open_partitioned",
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

  it("allows only the additive practice-attempt and mistake-book uniqueness migration", () => {
    const migration = readRepositoryFile(`drizzle/${MIGRATION_TAG}.sql`);
    const statements = migration
      .split("--> statement-breakpoint")
      .map(normalizeSql)
      .filter(Boolean);

    expect(statements).toHaveLength(7);
    expect(statements).toEqual(
      expect.arrayContaining([
        'ALTER TABLE "answer_record" ADD COLUMN "practice_attempt_number" integer;',
        'ALTER TABLE "answer_record" ADD COLUMN "practice_max_attempt_count" integer;',
        expect.stringContaining(
          'ADD CONSTRAINT "chk_answer_record_practice_attempt_completeness"',
        ),
        expect.stringContaining(
          'ADD CONSTRAINT "chk_answer_record_practice_attempt_mode"',
        ),
        expect.stringContaining(
          'ADD CONSTRAINT "chk_answer_record_practice_attempt_bounds"',
        ),
        expect.stringContaining(
          'CREATE UNIQUE INDEX "udx_answer_record_practice_question_attempt"',
        ),
        'CREATE UNIQUE INDEX "udx_mistake_book_user_id_question_public_id" ON "mistake_book" USING btree ("user_id","question_public_id");',
      ]),
    );
    for (const statement of statements) {
      expect(statement).toMatch(
        /^(?:ALTER TABLE "answer_record" ADD (?:COLUMN "practice_(?:attempt_number|max_attempt_count)" integer|CONSTRAINT "chk_answer_record_practice_attempt_(?:completeness|mode|bounds)" CHECK \(.+\));|CREATE UNIQUE INDEX "udx_(?:answer_record_practice_question_attempt|mistake_book_user_id_question_public_id)" .+;)$/u,
      );
    }
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT)\b|ALTER\s+COLUMN|\b(?:backfill|apply)\b/iu,
    );

    const journal = parseRepositoryJson<DrizzleJournal>(
      "drizzle/meta/_journal.json",
    );
    const currentEntry = journal.entries.at(-1);
    const previousEntry = journal.entries.at(-2);
    const currentSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260723023000_snapshot.json",
    );
    const previousSnapshot = parseRepositoryJson<DrizzleSnapshot>(
      "drizzle/meta/20260723013000_snapshot.json",
    );
    const answerRecord = currentSnapshot.tables["public.answer_record"]!;
    const mistakeBook = currentSnapshot.tables["public.mistake_book"]!;

    expect(currentEntry).toEqual({
      idx: previousEntry!.idx + 1,
      version: journal.version,
      when: expect.any(Number),
      tag: MIGRATION_TAG,
      breakpoints: true,
    });
    expect(currentEntry!.when).toBeGreaterThan(previousEntry!.when);
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(answerRecord.columns.practice_attempt_number).toMatchObject({
      notNull: false,
      type: "integer",
    });
    expect(answerRecord.columns.practice_max_attempt_count).toMatchObject({
      notNull: false,
      type: "integer",
    });
    expect(Object.keys(answerRecord.checkConstraints)).toEqual(
      expect.arrayContaining([
        "chk_answer_record_practice_attempt_completeness",
        "chk_answer_record_practice_attempt_mode",
        "chk_answer_record_practice_attempt_bounds",
      ]),
    );
    expect(
      answerRecord.indexes.udx_answer_record_practice_question_attempt,
    ).toMatchObject({
      isUnique: true,
      columns: [
        { expression: "practice_id" },
        { expression: "paper_question_public_id" },
        { expression: "practice_attempt_number" },
      ],
    });
    expect(
      mistakeBook.indexes.udx_mistake_book_user_id_question_public_id,
    ).toMatchObject({
      isUnique: true,
      columns: [
        { expression: "user_id" },
        { expression: "question_public_id" },
      ],
    });
  });

  it("uses one authoritative transaction command and atomic mistake-book upserts", () => {
    const repository = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const submitCommand = repository.slice(
      repository.indexOf("async submitPracticeAnswer(input)"),
      repository.indexOf("async upsertMistakeBookFromFavorite(input)"),
    );
    const favoriteCommand = repository.slice(
      repository.indexOf("async upsertMistakeBookFromFavorite(input)"),
      repository.indexOf("function createPostgresMockExamRepository"),
    );
    const wrongConflict = submitCommand.slice(
      submitCommand.indexOf(".onConflictDoUpdate({"),
      submitCommand.indexOf(".returning({ public_id: mistakeBook.public_id })"),
    );
    const service = readRepositoryFile(
      "src/server/services/practice-service.ts",
    );
    const serviceSubmit = service.slice(
      service.indexOf("async submitPracticeAnswer(userContext"),
      service.indexOf("async favoritePracticeQuestion"),
    );

    expect(submitCommand).toContain("database.transaction");
    expect(submitCommand).toContain("validateAndLockAuthorizationLineage");
    expect(submitCommand).toContain(
      'eq(practice.practice_status, "in_progress")',
    );
    expect(submitCommand).toContain('.for("update")');
    expect(submitCommand).toContain("lockPracticeAnswerAttempt");
    expect(submitCommand).toContain("attemptRows");
    expect(submitCommand).not.toContain(".limit(1)");
    expect(submitCommand).toContain("practice_attempt_number");
    expect(submitCommand).toContain("practice_max_attempt_count");
    expect(submitCommand).toContain("isCoherentPreparedAnswer");
    expect(submitCommand).toContain("hasCoherentAttemptIdentity");
    expect(submitCommand).toContain("requiresMistakeBook");
    expect(submitCommand).toContain(".onConflictDoUpdate");
    expect(submitCommand).toContain("wrong_count: sql");
    expect(wrongConflict).not.toContain("mistake_book_source:");
    expect(wrongConflict).not.toContain("question_snapshot:");
    expect(wrongConflict).not.toContain("is_favorite:");
    expect(favoriteCommand).toContain(".onConflictDoUpdate");
    expect(favoriteCommand).not.toContain("existingRow");

    expect(serviceSubmit).toContain("repository.submitPracticeAnswer");
    expect(serviceSubmit).not.toContain(
      "findAnswerRecordByPracticeAndQuestion",
    );
    expect(serviceSubmit).not.toContain("listAnswerRecordsByPractice");
    expect(serviceSubmit).not.toContain("createPracticeAnswerRecord");
    expect(serviceSubmit).not.toContain("updatePracticeLastAnsweredAt");
    expect(serviceSubmit).not.toContain("upsertMistakeBookFromWrongAnswer");
  });
});
