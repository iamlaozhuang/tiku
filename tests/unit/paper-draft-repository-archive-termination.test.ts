import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("paper draft repository archive termination guard", () => {
  const repositorySource = readFileSync(
    join(process.cwd(), "src/server/repositories/paper-draft-repository.ts"),
    "utf8",
  );

  it("terminates unfinished practice and mock_exam sessions when archiving a paper", () => {
    expect(repositorySource).toContain("PAPER_ARCHIVE_TERMINATION_REASON");
    expect(repositorySource).toContain(
      'const PAPER_ARCHIVE_TERMINATION_REASON = "paper_archived"',
    );
    expect(repositorySource).toContain(
      "termination_reason: PAPER_ARCHIVE_TERMINATION_REASON",
    );
    expect(repositorySource).toContain('practice_status: "terminated"');
    expect(repositorySource).toContain('exam_status: "terminated"');
    expect(repositorySource).toContain(
      'eq(practice.practice_status, "in_progress")',
    );
    expect(repositorySource).toContain("eq(mockExam.paper_id, paperId)");
    expect(repositorySource).toMatch(
      /inArray\(mockExam\.exam_status,\s*\[\s*"in_progress",\s*"scoring",\s*"scoring_partial_failed",?\s*\]\s*\)/,
    );
  });
});
