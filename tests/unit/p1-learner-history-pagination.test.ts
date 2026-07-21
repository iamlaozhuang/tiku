import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { createMistakeBookAuthorizationScopeCondition } from "@/server/repositories/mistake-book-repository";
import { createExamReportAuthorizationScopeCondition } from "@/server/repositories/student-flow-runtime-repository";

function readRepository(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function readMethod(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);

  return source.slice(startIndex, endIndex);
}

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }

  seen.add(value);

  return Object.values(value).some((item) => containsText(item, text, seen));
}

describe("P1 learner history visible-set pagination", () => {
  it("reads exam report authorization, rows, and total in one repeatable-read snapshot", () => {
    const source = readRepository(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const method = readMethod(
      source,
      "async listExamReports(query)",
      "async findExamReportByPublicId(query)",
    );

    expect(method).toContain("database.transaction");
    expect(method).toContain("listEffectiveAuthorizationScopes(");
    expect(method).toContain("createExamReportAuthorizationScopeCondition(");
    expect(method).toContain('isolationLevel: "repeatable read"');
    expect(method).toContain('accessMode: "read only"');
    expect(method).toMatch(
      /orderBy\([\s\S]*mockExam\.started_at[\s\S]*mockExam\.id/,
    );
    expect(
      method.indexOf("createExamReportAuthorizationScopeCondition("),
    ).toBeLessThan(method.indexOf(".limit(query.pageSize)"));
  });

  it("reads mistake-book authorization, removal, rows, and total in one repeatable-read snapshot", () => {
    const source = readRepository(
      "src/server/repositories/mistake-book-repository.ts",
    );
    const method = readMethod(
      source,
      "async listMistakeBooks(query)",
      "async findMistakeBookByPublicId(query)",
    );

    expect(method).toContain("database.transaction");
    expect(method).toContain("listEffectiveAuthorizationScopes(");
    expect(method).toContain("createMistakeBookAuthorizationScopeCondition(");
    expect(method).toContain("eq(mistakeBook.is_removed, false)");
    expect(method).toContain('isolationLevel: "repeatable read"');
    expect(method).toContain('accessMode: "read only"');
    expect(method).toMatch(
      /mistakeBook\.latest_wrong_at[\s\S]*mistakeBook\.id[\s\S]*\.orderBy\(\.\.\.orderBy\)/,
    );
    expect(
      method.indexOf("createMistakeBookAuthorizationScopeCondition("),
    ).toBeLessThan(method.indexOf(".limit(query.pageSize)"));
  });

  it("fails closed on no scope and binds exact profession-level scopes", () => {
    expect(createExamReportAuthorizationScopeCondition([])).toBeNull();
    expect(createMistakeBookAuthorizationScopeCondition([])).toBeNull();

    const scopes = [
      {
        profession: "marketing" as const,
        level: 3,
        authorization_types: ["personal_auth" as const],
        expires_at: new Date("2027-07-20T00:00:00.000Z"),
      },
    ];
    const reportCondition = createExamReportAuthorizationScopeCondition(scopes);
    const mistakeCondition =
      createMistakeBookAuthorizationScopeCondition(scopes);

    expect(containsText(reportCondition, "marketing")).toBe(true);
    expect(containsText(reportCondition, "3")).toBe(true);
    expect(containsText(mistakeCondition, "marketing")).toBe(true);
    expect(containsText(mistakeCondition, "3")).toBe(true);
  });
});
