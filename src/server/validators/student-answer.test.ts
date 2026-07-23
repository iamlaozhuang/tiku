import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STUDENT_ANSWER_ITEM_MAX_COUNT,
  STUDENT_ANSWER_SELECTION_MAX_COUNT,
  STUDENT_ANSWER_SELECTION_MAX_LENGTH,
  STUDENT_ANSWER_TEXT_MAX_LENGTH,
  normalizeStudentAnswerItemList,
  normalizeStudentAnswerSelections,
  normalizeStudentAnswerText,
} from "./student-answer";

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseYamlStrictly(path: string): Record<string, unknown> {
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
  const document = parseDocument(readText(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS() as Record<string, unknown>;
}

describe("student answer input contract", () => {
  it("strictly parses the F-0174 task contract and WIP state", () => {
    const taskSafety = JSON.parse(
      readText("docs/04-agent-system/state/task-safety.json"),
    ) as Record<string, unknown>;
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );

    expect(taskSafety).toMatchObject({
      taskId: "p1-remediation-rc-08-student-answer-input-bounds-2026-07-23",
      branch: "fix/student-answer-input-bounds",
      baseSha: "32cd5469ffcda797ad6750029a2db3aaedfafd37",
      status: "ready_for_closeout",
      conditionalCloseout: true,
    });
    expect(JSON.stringify(projectState)).toContain(
      "p1-remediation-rc-08-student-answer-input-bounds-2026-07-23",
    );
    expect(JSON.stringify(taskQueue)).toContain(
      "p1-remediation-rc-08-student-answer-input-bounds-2026-07-23",
    );
  });

  it("accepts exact text and selection limits with detached canonical values", () => {
    const selections = Array.from(
      { length: STUDENT_ANSWER_SELECTION_MAX_COUNT },
      (_unused, index) =>
        `${index}`.padEnd(STUDENT_ANSWER_SELECTION_MAX_LENGTH, "x"),
    );
    const selectionResult = normalizeStudentAnswerSelections(selections);

    expect(
      normalizeStudentAnswerText("x".repeat(STUDENT_ANSWER_TEXT_MAX_LENGTH)),
    ).toEqual({ success: true, value: "x".repeat(4_000) });
    expect(selectionResult).toEqual({ success: true, value: selections });
    expect(selectionResult.success && selectionResult.value).not.toBe(
      selections,
    );
  });

  it("rejects over-limit, malformed, duplicate and sparse selections atomically", () => {
    const sparseSelections = new Array(2);
    sparseSelections[0] = "A";

    for (const value of [
      Array.from(
        { length: STUDENT_ANSWER_SELECTION_MAX_COUNT + 1 },
        (_unused, index) => `${index}`,
      ),
      ["x".repeat(STUDENT_ANSWER_SELECTION_MAX_LENGTH + 1)],
      ["A", " A "],
      ["A", 2],
      sparseSelections,
      "A",
    ]) {
      expect(normalizeStudentAnswerSelections(value)).toEqual({
        success: false,
      });
    }
  });

  it("rejects over-limit or wrong-typed text without truncation", () => {
    expect(
      normalizeStudentAnswerText(
        "x".repeat(STUDENT_ANSWER_TEXT_MAX_LENGTH + 1),
      ),
    ).toEqual({ success: false });
    expect(normalizeStudentAnswerText({ answer: "x" })).toEqual({
      success: false,
    });
    expect(normalizeStudentAnswerText("   ")).toEqual({
      success: true,
      value: null,
    });
  });

  it("accepts only dense bounded answer item arrays", () => {
    const exactItems = Array.from(
      { length: STUDENT_ANSWER_ITEM_MAX_COUNT },
      (_unused, index) => ({ index }),
    );
    const sparseItems = new Array(2);
    sparseItems[0] = {};

    expect(normalizeStudentAnswerItemList(exactItems)).toEqual(exactItems);
    expect(
      normalizeStudentAnswerItemList([
        ...exactItems,
        { index: STUDENT_ANSWER_ITEM_MAX_COUNT },
      ]),
    ).toBeNull();
    expect(normalizeStudentAnswerItemList(sparseItems)).toBeNull();
  });

  it("routes every production learner answer validator through this contract", () => {
    for (const path of [
      "src/server/validators/practice.ts",
      "src/server/validators/mock-exam.ts",
      "src/server/validators/organization-training.ts",
    ]) {
      const source = readText(path);
      expect(source).toContain('from "./student-answer"');
    }
  });
});
