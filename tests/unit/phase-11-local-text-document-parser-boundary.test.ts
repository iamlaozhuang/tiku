import { createHash } from "node:crypto";
import { mkdir, mkdtemp, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseLocalTextDocumentAsset } from "@/server/services/local-text-document-parser";
import { storeLocalPaperAssetFile } from "@/server/services/local-paper-asset-storage";
import { localResourceMaxFileSizeByte } from "@/server/services/rag-resource-knowledge-runtime";

async function storeControlledAsset(input: {
  fileName: string;
  body: string | ArrayBuffer;
}) {
  const storageRoot = await mkdtemp(join(tmpdir(), "tiku-parser-test-"));
  const paperAsset = await storeLocalPaperAssetFile({
    file: new File([input.body], input.fileName, { type: "text/plain" }),
    paperAttachmentUsage: "paper_source",
    paperPublicId: "paper-public-parser-001",
    profession: "marketing",
    storageRoot,
    uploadedAt: new Date("2026-05-25T08:10:00.000Z"),
  });

  return { paperAsset, storageRoot };
}

describe("phase 11 local text document parser boundary", () => {
  it("parses a local txt paper_asset from ignored runtime storage with redacted evidence", async () => {
    const controlledText = [
      "Marketing theory controlled line one.",
      "Controlled line two for local parser smoke.",
    ].join("\n");
    const { paperAsset, storageRoot } = await storeControlledAsset({
      body: controlledText,
      fileName: "controlled-paper-source.txt",
    });

    const parsed = await parseLocalTextDocumentAsset({
      fileName: paperAsset.fileName,
      objectKey: paperAsset.objectKey,
      storageRoot,
    });

    if (parsed.status !== "parsed") {
      throw new Error(`Expected parsed text document, got ${parsed.status}.`);
    }

    expect(parsed).toMatchObject({
      status: "parsed",
      parserMode: "local_only",
      source: {
        contentType: "text/plain",
        extension: "txt",
        fileName: "controlled-paper-source.txt",
        objectKey: paperAsset.objectKey,
      },
      lineCount: 2,
      charLength: controlledText.length,
      markdownContent: controlledText,
      markdownContentHash: createHash("sha256")
        .update(controlledText)
        .digest("hex"),
    });
    expect(JSON.stringify(parsed.evidenceSummary)).not.toContain(
      "Marketing theory controlled line one",
    );
    expect(JSON.stringify(parsed.evidenceSummary)).not.toContain(storageRoot);
  });

  it("normalizes markdown front matter and headings without leaking raw content into metadata", async () => {
    const markdownBody = [
      "---",
      "private: redacted-test-front-matter",
      "---",
      "# Material Intro",
      "",
      "Controlled markdown paragraph for local parsing.",
      "",
      "## Skill Rules",
      "",
      "Controlled nested paragraph.",
    ].join("\n");
    const { paperAsset, storageRoot } = await storeControlledAsset({
      body: markdownBody,
      fileName: "controlled-material.md",
    });

    const parsed = await parseLocalTextDocumentAsset({
      fileName: paperAsset.fileName,
      objectKey: paperAsset.objectKey,
      storageRoot,
    });

    if (parsed.status !== "parsed") {
      throw new Error(
        `Expected parsed markdown document, got ${parsed.status}.`,
      );
    }

    expect(parsed.markdownContent).toContain("# Material Intro");
    expect(parsed.markdownContent).not.toContain("redacted-test-front-matter");
    expect(parsed.headingPaths).toEqual([
      ["Material Intro"],
      ["Material Intro", "Skill Rules"],
    ]);
    expect(JSON.stringify(parsed.evidenceSummary)).not.toContain(
      "Controlled markdown paragraph",
    );
  });

  it("skips unsupported local binary formats without OCR or parser fallback", async () => {
    const { paperAsset, storageRoot } = await storeControlledAsset({
      body: "controlled unsupported binary placeholder",
      fileName: "controlled-paper-source.bin",
    });

    const parsed = await parseLocalTextDocumentAsset({
      fileName: paperAsset.fileName,
      objectKey: paperAsset.objectKey,
      storageRoot,
    });

    expect(parsed).toEqual({
      status: "skipped",
      parserMode: "local_only",
      skippedReason: "unsupported_extension",
      source: {
        extension: "bin",
        fileName: "controlled-paper-source.bin",
        objectKey: paperAsset.objectKey,
      },
    });
  });

  it.each([
    {
      body: new Uint8Array([0xc3, 0x28]).buffer,
      fileName: "invalid-utf8.md",
    },
    {
      body: new Uint8Array([0x23, 0x20, 0x41, 0x00, 0x42]).buffer,
      fileName: "binary-as-text.txt",
    },
    {
      body: new Uint8Array([0x23, 0x20, 0x41, 0x07, 0x42]).buffer,
      fileName: "control-character.md",
    },
    {
      body: new Uint8Array([0x23, 0x20, 0x41, 0xc2, 0x85, 0x42]).buffer,
      fileName: "c1-control-character.md",
    },
  ])(
    "rejects $fileName before producing a draft",
    async ({ body, fileName }) => {
      const { paperAsset, storageRoot } = await storeControlledAsset({
        body,
        fileName,
      });

      await expect(
        parseLocalTextDocumentAsset({
          fileName: paperAsset.fileName,
          objectKey: paperAsset.objectKey,
          storageRoot,
        }),
      ).resolves.toEqual({
        status: "skipped",
        parserMode: "local_only",
        skippedReason: "invalid_text_content",
        source: {
          extension: fileName.endsWith(".txt") ? "txt" : "md",
          fileName,
          objectKey: paperAsset.objectKey,
        },
      });
    },
  );

  it("enforces the 50MB local resource parser limit before reading document content", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-parser-limit-"));
    const objectKey = "dev/resource/marketing/202605/large-resource.md";
    const targetPath = join(storageRoot, ...objectKey.split("/"));

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, "");
    await truncate(targetPath, localResourceMaxFileSizeByte + 1);

    const parsed = await parseLocalTextDocumentAsset({
      fileName: "large-resource.md",
      maxFileSizeByte: localResourceMaxFileSizeByte,
      objectKey,
      storageRoot,
    });

    expect(parsed).toEqual({
      status: "skipped",
      parserMode: "local_only",
      skippedReason: "file_too_large",
      source: {
        extension: "md",
        fileName: "large-resource.md",
        objectKey,
      },
    });
    expect(JSON.stringify(parsed)).not.toContain(storageRoot);
  });
});
