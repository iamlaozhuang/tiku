import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateRawSync } from "node:zlib";

import { afterEach, describe, expect, it } from "vitest";

import {
  containsForbiddenOwnerPreviewRuntimeRagEvidenceText,
  renderOwnerPreviewRuntimeRagImportSummary,
  runOwnerPreviewRuntimeRagImport,
} from "@/db/owner-preview-runtime-rag-resource-import";

const temporaryRoots: string[] = [];

function createSyntheticRuntimePackage() {
  const packageRoot = mkdtempSync(join(tmpdir(), "owner-preview-rag-package-"));
  const storageRoot = mkdtempSync(join(tmpdir(), "owner-preview-rag-storage-"));
  temporaryRoots.push(packageRoot, storageRoot);

  const curatedRoot = join(packageRoot, "2026-06-28-rawfiles-curated");
  const inventoriesRoot = join(curatedRoot, "inventories");
  const materialsRoot = join(curatedRoot, "materials");

  mkdirSync(inventoriesRoot, { recursive: true });
  mkdirSync(materialsRoot, { recursive: true });

  writeFileSync(
    join(materialsRoot, "monopoly.md"),
    [
      "# Monopoly fixture",
      "",
      "Monopoly level three theory material about regulated retail inspections.",
      "This bounded fixture exists only to prove runtime RAG import behavior.",
    ].join("\n"),
  );
  writeFileSync(
    join(materialsRoot, "marketing.docx"),
    createMinimalDocxBuffer(
      "Marketing level three skill material about customer segmentation.",
    ),
  );

  writeFileSync(
    join(inventoriesRoot, "source-inventory.json"),
    JSON.stringify([
      {
        extension: ".md",
        extractable: true,
        fixtureRelativePath: "materials/monopoly.md",
        fixtureSha256: "a".repeat(64),
        kind: "material",
        level: 3,
        pageCount: 1,
        profession: "monopoly",
        sourceRelativePath: "redacted-source-a.md",
        sourceSizeBytes: 128,
        subject: "theory",
      },
      {
        extension: ".docx",
        extractable: true,
        fixtureRelativePath: "materials/marketing.docx",
        fixtureSha256: "b".repeat(64),
        kind: "material",
        level: 3,
        pageCount: 1,
        profession: "marketing",
        sourceRelativePath: "redacted-source-b.docx",
        sourceSizeBytes: 256,
        subject: "skill",
      },
      {
        extension: ".pdf",
        extractable: true,
        fixtureRelativePath: "materials/ignored.pdf",
        fixtureSha256: "c".repeat(64),
        kind: "material",
        level: 3,
        pageCount: 1,
        profession: "logistics",
        sourceRelativePath: "redacted-source-c.pdf",
        sourceSizeBytes: 512,
        subject: "theory",
      },
    ]),
  );

  return { packageRoot, storageRoot };
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("owner preview runtime RAG resource import", () => {
  it("dry-runs package coverage without writing runtime catalog files", async () => {
    const { packageRoot, storageRoot } = createSyntheticRuntimePackage();

    const result = await runOwnerPreviewRuntimeRagImport({
      confirmOwnerPreviewRuntimeRagImport: false,
      mode: "dry_run",
      packageRoot,
      storageRoot,
    });

    expect(result.status).toBe("dry_run");
    expect(result.summary.validation.inventoryRowCount).toBe(3);
    expect(result.summary.validation.importableMaterialCount).toBe(2);
    expect(result.summary.validation.unsupportedMaterialCount).toBe(1);
    expect(result.summary.validation.professionCoverage).toEqual({
      logistics: 1,
      marketing: 1,
      monopoly: 1,
    });
    expect(
      existsSync(join(storageRoot, "dev", "resource", "catalog.json")),
    ).toBe(false);
  });

  it("blocks execute mode unless explicit runtime RAG import confirmation is present", async () => {
    const { packageRoot, storageRoot } = createSyntheticRuntimePackage();

    const result = await runOwnerPreviewRuntimeRagImport({
      confirmOwnerPreviewRuntimeRagImport: false,
      mode: "execute",
      packageRoot,
      storageRoot,
    });

    expect(result).toMatchObject({
      status: "blocked",
      summary: {
        failureCategory:
          "owner_preview_runtime_rag_import_confirmation_missing",
      },
    });
    expect(
      existsSync(join(storageRoot, "dev", "resource", "catalog.json")),
    ).toBe(false);
  });

  it("imports supported markdown and DOCX materials into the runtime RAG catalog", async () => {
    const { packageRoot, storageRoot } = createSyntheticRuntimePackage();

    const result = await runOwnerPreviewRuntimeRagImport({
      confirmOwnerPreviewRuntimeRagImport: true,
      mode: "execute",
      packageRoot,
      storageRoot,
    });

    const catalogPath = join(storageRoot, "dev", "resource", "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
      resources: Array<{
        activeChunkSnapshot: unknown[];
        chunkCount: number;
        level: number | null;
        profession: string;
        resourceStatus: string;
        title: string;
      }>;
    };

    expect(result.status).toBe("executed");
    expect(result.summary.execution?.importedResourceCount).toBe(2);
    expect(result.summary.execution?.importedChunkCount).toBeGreaterThan(0);
    expect(catalog.resources).toHaveLength(2);
    expect(
      catalog.resources.map((resource) => resource.profession).sort(),
    ).toEqual(["marketing", "monopoly"]);
    expect(catalog.resources.every((resource) => resource.title)).toBe(true);
    expect(
      catalog.resources.every(
        (resource) =>
          resource.resourceStatus === "rag_ready" &&
          resource.chunkCount > 0 &&
          resource.activeChunkSnapshot.length > 0,
      ),
    ).toBe(true);
  });

  it("renders only aggregate, redaction-safe import evidence", async () => {
    const { packageRoot, storageRoot } = createSyntheticRuntimePackage();
    const result = await runOwnerPreviewRuntimeRagImport({
      confirmOwnerPreviewRuntimeRagImport: true,
      mode: "execute",
      packageRoot,
      storageRoot,
    });

    const rendered = renderOwnerPreviewRuntimeRagImportSummary(result.summary);

    expect(rendered).toContain("mode=execute");
    expect(rendered).toContain("status=executed");
    expect(rendered).toContain("importableMaterialCount=2");
    expect(rendered).toContain("importedResourceCount=2");
    expect(rendered).toContain("logisticsCoverage=missing_runtime_source");
    expect(rendered).not.toContain("fixtureRelativePath");
    expect(rendered).not.toContain("sourceRelativePath");
    expect(rendered).not.toContain("regulated retail inspections");
    expect(rendered).not.toContain("customer segmentation");
    expect(containsForbiddenOwnerPreviewRuntimeRagEvidenceText(rendered)).toBe(
      false,
    );
  });
});

function createMinimalDocxBuffer(text: string): Buffer {
  const fileName = "word/document.xml";
  const xml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    "<w:body>",
    `<w:p><w:r><w:t>${escapeXml(text)}</w:t></w:r></w:p>`,
    "</w:body>",
    "</w:document>",
  ].join("");
  const fileNameBuffer = Buffer.from(fileName);
  const contentBuffer = Buffer.from(xml);
  const compressedContent = deflateRawSync(contentBuffer);
  const localHeader = Buffer.alloc(30);
  const centralHeader = Buffer.alloc(46);
  const endRecord = Buffer.alloc(22);
  const crc32 = 0;
  const localHeaderOffset = 0;

  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(8, 8);
  localHeader.writeUInt32LE(crc32, 14);
  localHeader.writeUInt32LE(compressedContent.length, 18);
  localHeader.writeUInt32LE(contentBuffer.length, 22);
  localHeader.writeUInt16LE(fileNameBuffer.length, 26);

  const centralDirectoryOffset =
    localHeader.length + fileNameBuffer.length + compressedContent.length;

  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(8, 10);
  centralHeader.writeUInt32LE(crc32, 16);
  centralHeader.writeUInt32LE(compressedContent.length, 20);
  centralHeader.writeUInt32LE(contentBuffer.length, 24);
  centralHeader.writeUInt16LE(fileNameBuffer.length, 28);
  centralHeader.writeUInt32LE(localHeaderOffset, 42);

  const centralDirectorySize = centralHeader.length + fileNameBuffer.length;

  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(1, 8);
  endRecord.writeUInt16LE(1, 10);
  endRecord.writeUInt32LE(centralDirectorySize, 12);
  endRecord.writeUInt32LE(centralDirectoryOffset, 16);

  return Buffer.concat([
    localHeader,
    fileNameBuffer,
    compressedContent,
    centralHeader,
    fileNameBuffer,
    endRecord,
  ]);
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
