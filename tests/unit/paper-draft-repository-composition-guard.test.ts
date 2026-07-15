import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/paper-draft-repository.ts"),
  "utf8",
);

describe("paper draft repository composition guard", () => {
  it("filters newly composed source questions to available status without blocking paper copy snapshots", () => {
    expect(repositorySource).toContain('requiredStatus: "available"');
    expect(repositorySource).toContain(
      "eq(question.status, input.requiredStatus)",
    );
    const copySource = repositorySource.slice(
      repositorySource.indexOf("async copyPaper"),
      repositorySource.indexOf("function createPaperConditions"),
    );
    expect(copySource).toContain("{ publicId: sourceQuestionPublicId }");
    expect(copySource).not.toMatch(
      /publicId: sourceQuestionPublicId,\s*requiredStatus/u,
    );
  });
});
