import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { PersonalAiGenerationLearningSessionAnswerFeedbackDto } from "../../src/server/contracts/personal-ai-generation-learning-session-contract";
import { createPersonalAiLearningAnswerCommandDigest } from "../../src/server/validators/personal-ai-generation-learning-session";

const repositoryRoot = process.cwd();
const taskId =
  "p1-remediation-rc-08-personal-ai-learning-answer-cas-2026-07-24";
const baseSha = "8a7af98590d6b05fde4c31a22cf44ea61ac99513";
const approvalId = "guardian-f0163-personal-ai-learning-answer-cas-2026-07-24";
const migrationPath =
  "drizzle/20260724003000_p1_rc_08_personal_ai_learning_answer_cas.sql";

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

function createCurrentFeedback(): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  return {
    status: "scored",
    blockReason: null,
    sessionPublicId: "ai_learning_session_command_001",
    sessionQuestionPublicId: "ai_learning_session_command_001_q_1",
    actorPublicId: "student_command_001",
    answerRevision: 1,
    selectedOptionLabels: ["A"],
    textAnswer: null,
    isCorrect: true,
    score: "1.0",
    maxScore: "1.0",
    standardAnswerLabels: ["A"],
    standardAnswerText: null,
    analysis: "synthetic analysis",
    aiScoringStatus: "blocked",
    formalWriteBoundary: {
      questionWriteStatus: "blocked",
      paperWriteStatus: "blocked",
      practiceWriteStatus: "blocked",
      answerRecordWriteStatus: "blocked",
      examReportWriteStatus: "blocked",
      mistakeBookWriteStatus: "blocked",
    },
    mistakeBookPublicId: null,
    submittedAt: "2026-07-24T07:00:00.000Z",
  };
}

describe("F-0163 personal AI learning answer CAS", () => {
  it("keeps the historical closeout and additive migration source exact", () => {
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );
    const persistedState = JSON.stringify({ projectState, taskQueue });

    expect(persistedState).toContain(taskId);
    expect(persistedState).toContain(baseSha);
    expect(persistedState).toContain(approvalId);
    expect(persistedState).toContain(
      "9f2182dee69f66b1aec6e8918c7a05434a04e3ea",
    );
    expect(persistedState).toContain("closed_static_product");

    const migration = readRepositoryFile(migrationPath).trim();
    const statements = migration
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/--.*$/gmu, "").trim())
      .filter(Boolean);
    expect(statements).toHaveLength(3);
    expect(statements.slice(0, 2)).toEqual([
      'ALTER TABLE "personal_ai_learning_answer_feedback" ADD COLUMN "answer_revision" integer;',
      'ALTER TABLE "personal_ai_learning_answer_feedback" ADD COLUMN "answer_command_digest" text;',
    ]);
    expect(statements[2]?.replace(/\s+/gu, " ")).toBe(
      'ALTER TABLE "personal_ai_learning_answer_feedback" ADD CONSTRAINT "personal_ai_learning_answer_feedback_revision_check" CHECK (( ("personal_ai_learning_answer_feedback"."answer_revision" is null and "personal_ai_learning_answer_feedback"."answer_command_digest" is null) or ( "personal_ai_learning_answer_feedback"."answer_revision" is not null and "personal_ai_learning_answer_feedback"."answer_command_digest" is not null and "personal_ai_learning_answer_feedback"."answer_revision" between 1 and 2147483647 and "personal_ai_learning_answer_feedback"."answer_command_digest" ~ \'^[0-9a-f]{64}$\' ) ));',
    );
    expect(statements[2]).toContain('"answer_revision" is not null');
    expect(statements[2]).toContain('"answer_command_digest" is not null');
    for (const statement of statements) {
      expect(statement.match(/;/gu)).toHaveLength(1);
    }
    expect(migration).not.toMatch(
      /\b(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT|COPY|CREATE\s+TABLE|CREATE\s+TYPE|ALTER\s+COLUMN|DEFAULT)\b/iu,
    );

    const previousSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260723063000_snapshot.json"),
    ) as { id: string };
    const currentSnapshot = JSON.parse(
      readRepositoryFile("drizzle/meta/20260724003000_snapshot.json"),
    ) as { id: string; prevId: string };
    const journal = JSON.parse(
      readRepositoryFile("drizzle/meta/_journal.json"),
    ) as { entries: Array<{ idx: number; tag: string }> };
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(currentSnapshot.id).not.toBe(previousSnapshot.id);
    expect(
      journal.entries.find(
        (entry) =>
          entry.tag ===
          "20260724003000_p1_rc_08_personal_ai_learning_answer_cas",
      ),
    ).toEqual(
      expect.objectContaining({
        idx: 59,
        tag: "20260724003000_p1_rc_08_personal_ai_learning_answer_cas",
      }),
    );
  });

  it("rejects malformed or ambiguous command facts instead of hashing them", () => {
    const malformedIsCorrect = structuredClone(createCurrentFeedback());
    Reflect.set(malformedIsCorrect, "isCorrect", "true");
    const unknownFact = structuredClone(createCurrentFeedback());
    Reflect.set(unknownFact, "currentRevision", 0);
    const duplicateLabels = {
      ...createCurrentFeedback(),
      selectedOptionLabels: ["A", "A"],
    };
    const sparseLabels = new Array<string>(2);
    sparseLabels[1] = "B";
    const descendingLabels = {
      ...createCurrentFeedback(),
      selectedOptionLabels: ["B", "A"],
    };

    for (const answerFeedback of [
      malformedIsCorrect,
      unknownFact,
      duplicateLabels,
      descendingLabels,
      { ...createCurrentFeedback(), selectedOptionLabels: sparseLabels },
    ]) {
      expect(
        createPersonalAiLearningAnswerCommandDigest({
          expectedAnswerRevision: 0,
          answerFeedback,
        }),
      ).toBeNull();
    }

    const original = createCurrentFeedback();
    const detachedBefore = structuredClone(original);
    const firstDigest = createPersonalAiLearningAnswerCommandDigest({
      expectedAnswerRevision: 0,
      answerFeedback: original,
    });
    const laterTimestampDigest = createPersonalAiLearningAnswerCommandDigest({
      expectedAnswerRevision: 0,
      answerFeedback: {
        ...original,
        submittedAt: "2026-07-24T08:00:00.000Z",
      },
    });
    const reorderedBoundaryDigest = createPersonalAiLearningAnswerCommandDigest(
      {
        expectedAnswerRevision: 0,
        answerFeedback: {
          ...original,
          formalWriteBoundary: {
            mistakeBookWriteStatus: "blocked",
            examReportWriteStatus: "blocked",
            answerRecordWriteStatus: "blocked",
            practiceWriteStatus: "blocked",
            paperWriteStatus: "blocked",
            questionWriteStatus: "blocked",
          },
        },
      },
    );
    expect(firstDigest).toMatch(/^[a-f0-9]{64}$/u);
    expect(laterTimestampDigest).toBe(firstDigest);
    expect(reorderedBoundaryDigest).toBe(firstDigest);
    expect(original).toEqual(detachedBefore);
    expect(
      createPersonalAiLearningAnswerCommandDigest({
        expectedAnswerRevision: 2_147_483_647,
        answerFeedback: original,
      }),
    ).toBeNull();
  });

  it("keeps the production answer boundary revision-CAS only and hides the digest", () => {
    const repositorySource = readRepositoryFile(
      "src/server/repositories/personal-ai-generation-learning-session-repository.ts",
    );
    const contractSource = readRepositoryFile(
      "src/server/contracts/personal-ai-generation-learning-session-contract.ts",
    );
    const routeSource = readRepositoryFile(
      "src/server/services/personal-ai-generation-learning-session-route.ts",
    );

    expect(repositorySource).not.toContain("onConflictDoUpdate");
    expect(repositorySource).toContain("expectedCurrentAnswerCommandDigest");
    expect(repositorySource).toContain("answer_revision} + 1");
    expect(repositorySource).toContain("greatest(");
    expect(repositorySource).toContain(
      "findAnswerFeedbackRowsBySessionQuestion",
    );
    expect(contractSource).toContain("answerRevision: number | null");
    expect(contractSource).not.toContain("answerCommandDigest");
    expect(routeSource).toContain('"expectedAnswerRevision"');
    expect(routeSource).not.toContain("answerCommandDigest");
  });
});
