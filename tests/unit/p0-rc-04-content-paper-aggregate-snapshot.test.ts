import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createPaperCommandRequestHash } from "@/server/repositories/paper-draft-repository";

const repositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/paper-draft-repository.ts"),
  "utf8",
);
const materialRepositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/material-repository.ts"),
  "utf8",
);
const questionRepositorySource = readFileSync(
  join(process.cwd(), "src/server/repositories/question-repository.ts"),
  "utf8",
);
const studentFlowRepositorySource = readFileSync(
  join(
    process.cwd(),
    "src/server/repositories/student-flow-runtime-repository.ts",
  ),
  "utf8",
);

describe("P0 RC-04 paper aggregate atomicity", () => {
  it("hashes semantically identical command payloads independently of object key order", () => {
    expect(
      createPaperCommandRequestHash({
        expectedRevision: 3,
        paperPublicId: "paper-public-001",
        nested: { score: "5.0", sortOrder: 1 },
      }),
    ).toBe(
      createPaperCommandRequestHash({
        nested: { sortOrder: 1, score: "5.0" },
        paperPublicId: "paper-public-001",
        expectedRevision: 3,
      }),
    );
  });

  it("rolls back an add command when explicit question_group resolution fails after revision CAS", () => {
    const addQuestionSource = repositorySource.slice(
      repositorySource.indexOf("async addQuestionToDraftPaper"),
      repositorySource.indexOf("async updatePaperQuestion"),
    );

    expect(addQuestionSource).toContain("PaperMutationConflictError");
    expect(addQuestionSource).toMatch(
      /if \(questionGroupId === undefined\) \{\s*throw new PaperMutationConflictError/u,
    );
    expect(addQuestionSource).not.toMatch(
      /if \(questionGroupId === undefined\) \{\s*await releasePaperCommand[\s\S]*?return null/u,
    );
  });

  it("fails the whole copy transaction instead of committing a partial aggregate", () => {
    const copySource = repositorySource.slice(
      repositorySource.indexOf("async copyPaper"),
      repositorySource.indexOf("async function hydratePapers"),
    );

    expect(copySource).not.toMatch(
      /if \(targetSectionId === undefined \|\| materialId === null\) \{\s*continue;/u,
    );
    expect(copySource).not.toMatch(
      /if \(targetSectionId === undefined\) \{\s*continue;/u,
    );
    expect(copySource).toContain(
      "Paper copy group could not be resolved atomically.",
    );
    expect(copySource).toContain(
      "Paper copy section could not be resolved atomically.",
    );
    expect(copySource).toContain(
      "question_snapshot: await buildQuestionSnapshot",
    );
    expect(copySource).toContain("material_snapshot: materialSnapshot");
    expect(copySource).toContain("await findMaterialSnapshotById");
    expect(copySource).toContain("material_snapshot: materialSnapshot");
    expect(copySource).not.toContain(
      "material_snapshot: sourceGroup.material_snapshot",
    );
    expect(copySource).toContain("materialSnapshot?.materialPublicId !==");
    expect(copySource).toContain("sourceQuestionGroup.material_public_id");
    expect(copySource).toContain("findCopySourcePaper");
    expect(copySource.indexOf("await claimPaperCommand")).toBeLessThan(
      copySource.indexOf("await findCopySourcePaper"),
    );
    expect(copySource.indexOf('commandClaim.kind === "replay"')).toBeLessThan(
      copySource.indexOf("await findCopySourcePaper"),
    );
    expect(
      copySource.indexOf("for (const sourceQuestionPublicId"),
    ).toBeLessThan(copySource.indexOf("for (const sourceGroup"));

    const copySourceLookup = repositorySource.slice(
      repositorySource.indexOf("async function findCopySourcePaper"),
      repositorySource.indexOf("async function requirePaperByPublicId"),
    );
    expect(copySourceLookup).toContain('.for("share")');
    expect(copySourceLookup).toContain("eq(paper.revision, expectedRevision)");
  });

  it("holds a shared source-question lock while taking an add snapshot", () => {
    const sourceQuestionLookup = repositorySource.slice(
      repositorySource.indexOf("async function findSourceQuestionByPublicId"),
      repositorySource.indexOf("async function buildQuestionSnapshot"),
    );

    expect(sourceQuestionLookup).toContain('.for("share"');
    expect(sourceQuestionLookup).toContain("of: question");

    const sourceMaterialLookup = repositorySource.slice(
      repositorySource.indexOf("async function findMaterialSnapshotById"),
      repositorySource.indexOf("async function resolveMaterialId"),
    );
    expect(sourceMaterialLookup).toContain('.for("share")');
  });

  it("acquires the paper aggregate before the source question and replays before mutable source checks", () => {
    const addQuestionSource = repositorySource.slice(
      repositorySource.indexOf("async addQuestionToDraftPaper"),
      repositorySource.indexOf("async updatePaperQuestion"),
    );
    const replayIndex = addQuestionSource.indexOf(
      'commandClaim.kind === "replay"',
    );
    const paperRevisionIndex = addQuestionSource.indexOf(
      "await advancePaperRevision",
    );
    const sourceQuestionIndex = addQuestionSource.indexOf(
      "await findSourceQuestionByPublicId",
    );

    expect(replayIndex).toBeGreaterThan(0);
    expect(paperRevisionIndex).toBeGreaterThan(replayIndex);
    expect(sourceQuestionIndex).toBeGreaterThan(paperRevisionIndex);
  });

  it("treats post-mutation aggregate reload failures as transaction failures", () => {
    const updateQuestionSource = repositorySource.slice(
      repositorySource.indexOf("async updatePaperQuestion"),
      repositorySource.indexOf("async removePaperQuestion"),
    );
    const removeQuestionSource = repositorySource.slice(
      repositorySource.indexOf("async removePaperQuestion"),
      repositorySource.indexOf("async publishPaper"),
    );
    const publishSource = repositorySource.slice(
      repositorySource.indexOf("async publishPaper"),
      repositorySource.indexOf("async archivePaper"),
    );
    const archiveSource = repositorySource.slice(
      repositorySource.indexOf("async archivePaper"),
      repositorySource.indexOf("async deletePaper"),
    );

    expect(updateQuestionSource).toContain("requirePaperQuestionByPublicId");
    expect(removeQuestionSource).toContain("requirePaperByPublicId");
    expect(publishSource).toContain("requirePaperByPublicId");
    expect(archiveSource).toContain("requirePaperByPublicId");
  });
});

describe("P0 RC-04 content optimistic concurrency", () => {
  it("returns a recoverable material conflict when the CAS updates no row", () => {
    const updateMaterialSource = materialRepositorySource.slice(
      materialRepositorySource.indexOf("async updateMaterial"),
      materialRepositorySource.indexOf("async disableMaterial"),
    );

    expect(updateMaterialSource).toMatch(
      /if \(row === undefined\) \{\s*return null;/u,
    );
    expect(updateMaterialSource).not.toContain(
      'throw new Error("Updated material could not be loaded.")',
    );
  });

  it.each([
    ["question", questionRepositorySource],
    ["material", materialRepositorySource],
  ])(
    "compares %s versions at API timestamp precision and advances them monotonically",
    (_kind, source) => {
      expect(source).toContain("date_trunc('milliseconds'");
      expect(source).toContain("greatest(");
      expect(source).toContain("interval '1 millisecond'");
    },
  );
});

describe("P0 RC-04 immutable student snapshot identity", () => {
  it("fails closed when canonical question, score, or group identity is missing", () => {
    const snapshotSource = studentFlowRepositorySource.slice(
      studentFlowRepositorySource.indexOf("async function buildPaperSnapshot"),
      studentFlowRepositorySource.indexOf("async function listQuestionCounts"),
    );

    expect(snapshotSource).toContain("PaperSnapshotIntegrityError");
    expect(snapshotSource).not.toContain("?? row.public_id");
    expect(snapshotSource).not.toContain('row.score ?? "0.0"');
    expect(snapshotSource).not.toMatch(
      /questionGroupPublicIdById\.get\(questionRow\.question_group_id\) \?\?\s*null/u,
    );
  });
});
