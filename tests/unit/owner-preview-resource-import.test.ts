import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  containsForbiddenOwnerPreviewResourceImportEvidenceText,
  createOwnerPreviewResourceImportDryRunSummary,
  renderOwnerPreviewResourceImportSummary,
  runOwnerPreviewResourceImport,
  validateOwnerPreviewResourcePackage,
} from "@/db/owner-preview-resource-import";

const databaseUrlProtocol = "postgres" + "://";
const fakeSecret = "fake-secret";
const temporaryRoots: string[] = [];

function buildDatabaseUrl(host: string, databaseName = "tiku_owner_preview") {
  return `${databaseUrlProtocol}local_user:${fakeSecret}@${host}:5432/${databaseName}`;
}

function createSyntheticResourcePackage() {
  const packageRoot = mkdtempSync(join(tmpdir(), "owner-preview-resource-"));
  temporaryRoots.push(packageRoot);

  const curatedRoot = join(packageRoot, "2026-06-28-rawfiles-curated");
  const questionsRoot = join(curatedRoot, "questions", "synthetic");
  const inventoriesRoot = join(curatedRoot, "inventories");
  const papersRoot = join(curatedRoot, "papers");

  mkdirSync(questionsRoot, { recursive: true });
  mkdirSync(inventoriesRoot, { recursive: true });
  mkdirSync(papersRoot, { recursive: true });

  writeFileSync(
    join(questionsRoot, "minimal-question-import.csv"),
    [
      [
        "profession",
        "level",
        "subject",
        "questionType",
        "knowledgeNode",
        "difficulty",
        "questionStem",
        "optionA",
        "optionB",
        "optionC",
        "optionD",
        "standardAnswer",
        "analysis",
      ].join(","),
      [
        "monopoly",
        "1",
        "theory",
        "single_choice",
        "fixture_node_a",
        "medium",
        "synthetic stem a",
        "choice a",
        "choice b",
        "choice c",
        "choice d",
        "A",
        "synthetic analysis a",
      ].join(","),
      [
        "marketing",
        "2",
        "skill",
        "single_choice",
        "fixture_node_b",
        "easy",
        "synthetic stem b",
        "choice a",
        "choice b",
        "choice c",
        "choice d",
        "B",
        "synthetic analysis b",
      ].join(","),
    ].join("\n"),
  );
  writeFileSync(
    join(curatedRoot, "resource-pack-manifest.json"),
    JSON.stringify({
      copiedFileCount: 2,
      packageName: "synthetic-owner-preview-package",
      redactionBoundary: "synthetic-test-only",
      skippedFileCount: 0,
      sourceCoverage: [
        {
          count: 1,
          kind: "textbook",
          level: 1,
          profession: "monopoly",
          subject: "theory",
        },
        {
          count: 1,
          kind: "knowledge_doc",
          level: 2,
          profession: "marketing",
          subject: "skill",
        },
      ],
    }),
  );
  writeFileSync(
    join(inventoriesRoot, "source-inventory.json"),
    JSON.stringify([
      {
        extension: ".pdf",
        extractable: true,
        fixtureRelativePath: "redacted/a.pdf",
        fixtureSha256: "a".repeat(64),
        kind: "textbook",
        level: 1,
        pageCount: 2,
        profession: "monopoly",
        sourceRelativePath: "redacted-source-a.pdf",
        sourceSizeBytes: 1024,
        subject: "theory",
      },
      {
        extension: ".docx",
        extractable: true,
        fixtureRelativePath: "redacted/b.docx",
        fixtureSha256: "b".repeat(64),
        kind: "knowledge_doc",
        level: 2,
        pageCount: 3,
        profession: "marketing",
        sourceRelativePath: "redacted-source-b.docx",
        sourceSizeBytes: 2048,
        subject: "skill",
      },
    ]),
  );
  writeFileSync(
    join(inventoriesRoot, "copied-source-files.json"),
    JSON.stringify([]),
  );
  writeFileSync(
    join(papersRoot, "paper-fixture-plan.yaml"),
    "schemaVersion: 1\npurpose: synthetic\n",
  );
  writeFileSync(
    join(curatedRoot, "authorization-matrix.yaml"),
    "schemaVersion: 1\nfixturePack: synthetic\n",
  );

  return packageRoot;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("owner preview resource import contract", () => {
  it("validates a package and reports only aggregate coverage counts", async () => {
    const packageRoot = createSyntheticResourcePackage();
    const validation = await validateOwnerPreviewResourcePackage(packageRoot);

    expect(validation.status).toBe("usable");
    expect(validation.fileCounts.structuredFileCount).toBeGreaterThanOrEqual(5);
    expect(validation.coverage.professionCount).toBe(2);
    expect(validation.coverage.levelCount).toBe(2);
    expect(validation.coverage.subjectCount).toBe(2);
    expect(validation.coverage.knowledgeNodeCount).toBe(2);
    expect(validation.questionRowCount).toBe(2);
    expect(validation.resourceInventoryRowCount).toBe(2);

    const rendered = renderOwnerPreviewResourceImportSummary(
      createOwnerPreviewResourceImportDryRunSummary({ validation }),
    );

    expect(rendered).toContain("mode=dry_run");
    expect(rendered).toContain("status=dry_run");
    expect(rendered).toContain("packageStatus=usable");
    expect(rendered).toContain("questionRowCount=2");
    expect(rendered).toContain("resourceInventoryRowCount=2");
    expect(rendered).not.toContain("synthetic stem");
    expect(rendered).not.toContain("choice a");
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(rendered),
    ).toBe(false);
  });

  it("keeps dry-run offline and never calls the import adapter", async () => {
    const packageRoot = createSyntheticResourcePackage();
    const adapter = {
      close: vi.fn(),
      importPackage: vi.fn(),
    };

    const result = await runOwnerPreviewResourceImport({
      adapter,
      confirmOwnerPreviewResourceImport: false,
      databaseUrl: undefined,
      mode: "dry_run",
      packageRoot,
    });

    expect(result.status).toBe("dry_run");
    expect(adapter.importPackage).not.toHaveBeenCalled();
    expect(adapter.close).not.toHaveBeenCalled();
  });

  it("blocks execute mode without confirmation or a local database target", async () => {
    const packageRoot = createSyntheticResourcePackage();
    const adapter = {
      close: vi.fn(),
      importPackage: vi.fn(),
    };

    await expect(
      runOwnerPreviewResourceImport({
        adapter,
        confirmOwnerPreviewResourceImport: false,
        databaseUrl: buildDatabaseUrl("localhost"),
        mode: "execute",
        packageRoot,
      }),
    ).resolves.toMatchObject({
      status: "blocked",
      summary: {
        failureCategory: "owner_preview_resource_import_confirmation_missing",
      },
    });
    await expect(
      runOwnerPreviewResourceImport({
        adapter,
        confirmOwnerPreviewResourceImport: true,
        databaseUrl: buildDatabaseUrl("db.example.com"),
        mode: "execute",
        packageRoot,
      }),
    ).resolves.toMatchObject({
      status: "blocked",
      summary: {
        failureCategory: "target_not_local_dev",
      },
    });
    expect(adapter.importPackage).not.toHaveBeenCalled();
  });

  it("executes through an adapter only after package, confirmation, and local DB checks pass", async () => {
    const packageRoot = createSyntheticResourcePackage();
    const adapter = {
      close: vi.fn(),
      importPackage: vi.fn(async () => ({
        knowledgeBaseCount: 2,
        knowledgeNodeCount: 2,
        materialCount: 0,
        paperCount: 2,
        paperQuestionCount: 2,
        questionCount: 2,
        resourceCount: 2,
      })),
    };

    const result = await runOwnerPreviewResourceImport({
      adapter,
      confirmOwnerPreviewResourceImport: true,
      databaseUrl: buildDatabaseUrl("127.0.0.1"),
      mode: "execute",
      packageRoot,
    });
    const rendered = renderOwnerPreviewResourceImportSummary(result.summary);

    expect(result.status).toBe("executed");
    expect(adapter.importPackage).toHaveBeenCalledTimes(1);
    expect(adapter.close).toHaveBeenCalledTimes(1);
    expect(rendered).toContain("status=executed");
    expect(rendered).toContain("importedQuestionCount=2");
    expect(rendered).toContain("importedPaperCount=2");
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(rendered),
    ).toBe(false);
  });

  it("sanitizes adapter failures without rendering low-level database details", async () => {
    const packageRoot = createSyntheticResourcePackage();
    const adapter = {
      close: vi.fn(),
      importPackage: vi.fn(async () => {
        throw new Error(
          [
            databaseUrlProtocol,
            "local/raw public",
            "_id internal",
            "_id failing row details",
          ].join(""),
        );
      }),
    };

    const result = await runOwnerPreviewResourceImport({
      adapter,
      confirmOwnerPreviewResourceImport: true,
      databaseUrl: buildDatabaseUrl("localhost"),
      mode: "execute",
      packageRoot,
    });
    const rendered = renderOwnerPreviewResourceImportSummary(result.summary);

    expect(result.status).toBe("blocked");
    expect(adapter.close).toHaveBeenCalledTimes(1);
    expect(result.summary.failureCategory).toBe(
      "resource_import_execution_failed",
    );
    expect(rendered).toContain(
      "failureCategory=resource_import_execution_failed",
    );
    expect(rendered).not.toContain(databaseUrlProtocol);
    expect(rendered).not.toContain("failing row");
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(rendered),
    ).toBe(false);
  });

  it("guards against sensitive evidence patterns", () => {
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(
        ["DATABASE", "_URL=", databaseUrlProtocol, "user:value@localhost"].join(
          "",
        ),
      ),
    ).toBe(true);
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(
        ["provider", "_payload raw", "_prompt raw", "_ai_output"].join(""),
      ),
    ).toBe(true);
    expect(
      containsForbiddenOwnerPreviewResourceImportEvidenceText(
        ["em", "ail ph", "one public", "_id internal", "_id"].join(""),
      ),
    ).toBe(true);
  });
});
