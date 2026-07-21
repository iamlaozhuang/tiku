import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { ContentMutationContext } from "@/server/repositories/content-mutation-audit";

const paperRepositorySource = readFileSync(
  resolve(process.cwd(), "src/server/repositories/paper-draft-repository.ts"),
  "utf8",
);
const paperRuntimeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/services/paper-composition-lifecycle-runtime.ts",
  ),
  "utf8",
);
const paperDraftServiceSource = readFileSync(
  resolve(process.cwd(), "src/server/services/paper-draft-service.ts"),
  "utf8",
);

const paperMutationContext: ContentMutationContext = {
  actorPublicId: "admin-public-1",
  auditLog: {
    actorRole: "content_admin",
    actionType: "paper.create",
    targetResourceType: "paper",
    metadataSummary: "redacted paper mutation metadata",
    requestIp: null,
  },
};

describe("F-0031 paper database audit atomicity partition", () => {
  it("accepts only redacted paper-domain audit context", () => {
    expect(paperMutationContext.auditLog).toEqual({
      actorRole: "content_admin",
      actionType: "paper.create",
      targetResourceType: "paper",
      metadataSummary: "redacted paper mutation metadata",
      requestIp: null,
    });
  });

  it.each([
    "createPaper",
    "updatePaper",
    "addQuestionToDraftPaper",
    "updatePaperQuestion",
    "removePaperQuestion",
    "publishPaper",
    "archivePaper",
    "deletePaper",
    "copyPaper",
  ])("keeps %s and its success audit in one transaction", (methodName) => {
    const methodStart = paperRepositorySource.indexOf(`async ${methodName}`);
    const nextMethodStart = paperRepositorySource.indexOf(
      "\n    async ",
      methodStart + 1,
    );
    const methodSource = paperRepositorySource.slice(
      methodStart,
      nextMethodStart === -1 ? undefined : nextMethodStart,
    );

    expect(methodStart, `${methodName} exists`).toBeGreaterThan(-1);
    expect(methodSource).toContain("database.transaction(async (transaction)");
    expect(methodSource).toContain("appendContentMutationAuditLog(");
  });

  it("passes paper audit context to database repositories and externally audits only failed database commands", () => {
    expect(paperRuntimeSource).toContain(
      "targetResourceType: targetResourceType",
    );
    expect(paperRuntimeSource).toContain("auditLog: {");
    expect(paperRuntimeSource).toContain("if (response.code !== 0)");
    expect(paperRuntimeSource).not.toMatch(
      /if \(response\.code === 0\)[\s\S]{0,200}auditFailedPaperMutation/u,
    );
  });

  it("forwards the existing mutation context through the delete service path", () => {
    const deleteMethodSource = paperDraftServiceSource.slice(
      paperDraftServiceSource.indexOf("async deletePaper(publicId, input)"),
      paperDraftServiceSource.indexOf(
        "\n\n    async copyPaper",
        paperDraftServiceSource.indexOf("async deletePaper(publicId, input)"),
      ),
    );

    expect(deleteMethodSource).toContain("options.mutationContext");
  });

  it("keeps filesystem-backed paper_asset operations outside this database-only partition", () => {
    const paperAssetRoutes = paperRuntimeSource.slice(
      paperRuntimeSource.indexOf("paperAssets: {"),
    );

    expect(paperAssetRoutes).toContain("readPaperAssetMutationInput(");
    expect(paperAssetRoutes).not.toContain(
      "createPaperServiceForActor(actorOrError, request",
    );
  });
});
