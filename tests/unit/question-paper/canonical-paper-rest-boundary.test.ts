import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

const retiredExamPaperPaths = [
  "src/app/api/v1/exam-papers/route.ts",
  "src/app/api/v1/exam-papers/[publicId]/route.ts",
  "src/app/api/v1/exam-papers/[publicId]/copy/route.ts",
  "src/app/api/v1/exam-papers/[publicId]/publish/route.ts",
  "src/app/api/v1/exam-papers/[publicId]/unpublish/route.ts",
  "src/server/contracts/question-paper/exam-paper-contract.ts",
  "src/server/repositories/question-paper/question-paper-repository.ts",
  "src/server/services/question-paper/route-handlers.ts",
  "src/server/validators/question-paper/exam-paper-validator.ts",
  "tests/unit/question-paper/question-paper-rest-layering.test.ts",
] as const;

function readRepositoryFile(relativePath: string): string {
  return readFileSync(join(repositoryRoot, relativePath), "utf8");
}

describe("canonical formal paper REST boundary", () => {
  it("publishes only the production-backed /api/v1/papers route family", () => {
    expect(
      existsSync(join(repositoryRoot, "src/app/api/v1/papers/route.ts")),
    ).toBe(true);

    for (const retiredPath of retiredExamPaperPaths) {
      expect(
        existsSync(join(repositoryRoot, retiredPath)),
        `retired scaffold must stay absent: ${retiredPath}`,
      ).toBe(false);
    }
  });

  it("keeps current architecture and traceability SSOT on the canonical papers aggregate", () => {
    const architectureDecision = readRepositoryFile(
      "docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md",
    );
    const technicalMatrix = readRepositoryFile(
      "docs/01-requirements/traceability/unified-use-case-technical-matrix.md",
    );

    expect(architectureDecision).toContain("src/app/api/v1/papers/route.ts");
    expect(technicalMatrix).toContain("src/app/api/v1/papers/**");
    expect(`${architectureDecision}\n${technicalMatrix}`).not.toContain(
      "src/app/api/v1/exam-papers",
    );
    expect(technicalMatrix).not.toContain(
      "src/server/services/question-paper/**",
    );
  });
});
