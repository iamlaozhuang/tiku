import { deflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  convertLocalOfficeDocumentBytes,
  localOfficeDocumentConversionBudgets,
  readLocalOfficeConversionRuntimeSnapshot,
} from "@/server/services/local-office-document-converter";

type ZipEntry = {
  path: string;
  body: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createZipBuffer(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const fileName = Buffer.from(entry.path);
    const body = Buffer.from(entry.body);
    const compressedBody = deflateRawSync(body);
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(compressedBody.length, 18);
    localHeader.writeUInt32LE(body.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localParts.push(localHeader, fileName, compressedBody);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt32LE(0, 16);
    centralHeader.writeUInt32LE(compressedBody.length, 20);
    centralHeader.writeUInt32LE(body.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralParts.push(centralHeader, fileName);

    localOffset += localHeader.length + fileName.length + compressedBody.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localOffset, 16);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function createMinimalDocxEntries(text: string): ZipEntry[] {
  return [
    {
      path: "[Content_Types].xml",
      body: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    },
    {
      path: "_rels/.rels",
      body: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    },
    {
      path: "word/document.xml",
      body: `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${escapeXml(text)}</w:t></w:r></w:p></w:body></w:document>`,
    },
  ];
}

function createMinimalDocxBuffer(text: string) {
  return createZipBuffer(createMinimalDocxEntries(text));
}

function createMinimalPptxBuffer(text: string) {
  return createZipBuffer([
    {
      path: "[Content_Types].xml",
      body: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>',
    },
    {
      path: "_rels/.rels",
      body: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>',
    },
    {
      path: "ppt/presentation.xml",
      body: '<?xml version="1.0"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst></p:presentation>',
    },
    {
      path: "ppt/_rels/presentation.xml.rels",
      body: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>',
    },
    {
      path: "ppt/slides/slide1.xml",
      body: `<?xml version="1.0"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${escapeXml(text)}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`,
    },
  ]);
}

function createMinimalPdfBuffer(text: string) {
  const escapedText = text
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
  const stream = `BT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];

  for (const [index, objectBody] of objects.entries()) {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body);
}

describe("F-0082 resource office conversion boundary", () => {
  it("freezes explicit process and resource budgets", () => {
    expect(localOfficeDocumentConversionBudgets).toEqual({
      maxInputBytes: 52_428_800,
      maxChildHeapMiB: 256,
      childAbortTimeoutMs: 25_000,
      hardWallTimeoutMs: 30_000,
      maxStdinBytes: 52_428_804,
      maxStdoutBytes: 8_388_608,
      maxStderrBytes: 16_384,
      maxUncompressedBytes: 134_217_728,
      maxZipEntries: 2_048,
      maxTableCells: 100_000,
      maxPageOrSlideCount: 500,
      maxMarkdownOutputBytes: 4_194_304,
      maxActiveConversions: 1,
      maxQueuedConversions: 2,
      queueWaitTimeoutMs: 5_000,
    });
  });

  it("converts a magic-detected DOCX in the isolated child without OCR or network", async () => {
    const converted = await convertLocalOfficeDocumentBytes({
      bytes: createMinimalDocxBuffer("Controlled DOCX conversion evidence"),
      expectedExtension: "docx",
    });

    expect(converted).toMatchObject({
      status: "converted",
      detectedType: "docx",
      isolation: {
        childProcess: true,
        nodePermissionModel: true,
        fsWriteAllowed: false,
        childSpawnAllowed: false,
        workerAllowed: false,
        wasiAllowed: false,
        ocrEnabled: false,
        networkAttemptCount: 0,
        environmentKeys: ["LANG", "NODE_ENV", "TZ"],
        pageOrSlideLimitStage: "post_ast",
      },
    });
    expect(
      converted.status === "converted" && converted.markdownContent,
    ).toContain("Controlled DOCX conversion evidence");
  }, 35_000);

  it.each([
    {
      bytes: createMinimalPptxBuffer("Controlled PPTX conversion evidence"),
      expectedExtension: "pptx" as const,
      expectedText: "Controlled PPTX conversion evidence",
    },
    {
      bytes: createMinimalPdfBuffer("Controlled PDF conversion evidence"),
      expectedExtension: "pdf" as const,
      expectedText: "Controlled PDF conversion evidence",
    },
  ])(
    "converts a magic-detected $expectedExtension without worker or network access",
    async ({ bytes, expectedExtension, expectedText }) => {
      const converted = await convertLocalOfficeDocumentBytes({
        bytes,
        expectedExtension,
      });

      expect(converted).toMatchObject({
        status: "converted",
        detectedType: expectedExtension,
        isolation: {
          workerAllowed: false,
          networkAttemptCount: 0,
        },
      });
      expect(
        converted.status === "converted" && converted.markdownContent,
      ).toContain(expectedText);
    },
    35_000,
  );

  it.each([
    {
      bytes: createMinimalDocxBuffer("Do not reinterpret this as PPTX"),
      expectedExtension: "pptx" as const,
    },
    {
      bytes: createMinimalPptxBuffer("Do not reinterpret this as DOCX"),
      expectedExtension: "docx" as const,
    },
  ])(
    "rejects a ZIP-based office file detected as a different type than $expectedExtension",
    async ({ bytes, expectedExtension }) => {
      const result = await convertLocalOfficeDocumentBytes({
        bytes,
        expectedExtension,
      });

      expect(result).toEqual({
        status: "failed",
        reason: "format_mismatch",
      });
    },
    35_000,
  );

  it("fails closed for corrupt, non-PDF, and textless PDF bytes", async () => {
    const results = [];
    for (const input of [
      {
        bytes: Buffer.from("PK corrupted archive"),
        expectedExtension: "docx" as const,
      },
      {
        bytes: Buffer.from("not a PDF"),
        expectedExtension: "pdf" as const,
      },
      {
        bytes: createMinimalPdfBuffer(""),
        expectedExtension: "pdf" as const,
      },
      {
        bytes: Buffer.from(
          "%PDF-1.7\n1 0 obj\n<< /Encrypt 2 0 R /Length 0 >>\nendobj\n%%EOF",
        ),
        expectedExtension: "pdf" as const,
      },
    ]) {
      results.push(await convertLocalOfficeDocumentBytes(input));
    }

    expect(results).toEqual([
      { status: "failed", reason: "conversion_failed" },
      { status: "failed", reason: "conversion_failed" },
      { status: "failed", reason: "no_extractable_text" },
      { status: "failed", reason: "conversion_failed" },
    ]);
  }, 35_000);

  it("rejects oversized and pre-aborted input before spawning conversion work", async () => {
    const abortController = new AbortController();
    abortController.abort();

    await expect(
      convertLocalOfficeDocumentBytes({
        bytes: Buffer.alloc(
          localOfficeDocumentConversionBudgets.maxInputBytes + 1,
        ),
        expectedExtension: "docx",
      }),
    ).resolves.toEqual({
      status: "failed",
      reason: "input_limit_exceeded",
    });
    await expect(
      convertLocalOfficeDocumentBytes({
        bytes: createMinimalDocxBuffer("aborted"),
        expectedExtension: "docx",
        signal: abortController.signal,
      }),
    ).resolves.toEqual({
      status: "failed",
      reason: "conversion_aborted",
    });
  });

  it("caps single-process active and queued work without spawning the rejected request", async () => {
    const before = readLocalOfficeConversionRuntimeSnapshot();
    const bytes = createMinimalDocxBuffer("bounded concurrency evidence");
    const conversions = Array.from({ length: 4 }, () =>
      convertLocalOfficeDocumentBytes({
        bytes,
        expectedExtension: "docx",
      }),
    );
    const during = readLocalOfficeConversionRuntimeSnapshot();

    expect(during).toEqual({
      activeCount: 1,
      queuedCount: 2,
      totalSpawnCount: before.totalSpawnCount + 1,
    });

    const results = await Promise.all(conversions);
    expect(
      results.filter((result) => result.status === "converted"),
    ).toHaveLength(3);
    expect(results.filter((result) => result.status === "failed")).toEqual([
      { status: "failed", reason: "conversion_busy" },
    ]);
    expect(readLocalOfficeConversionRuntimeSnapshot()).toEqual({
      activeCount: 0,
      queuedCount: 0,
      totalSpawnCount: before.totalSpawnCount + 3,
    });
  }, 35_000);

  it("hard-stops an externally aborted child and releases admission capacity", async () => {
    const before = readLocalOfficeConversionRuntimeSnapshot();
    const abortController = new AbortController();
    const conversion = convertLocalOfficeDocumentBytes({
      bytes: createMinimalDocxBuffer("abort active child evidence"),
      expectedExtension: "docx",
      signal: abortController.signal,
    });

    setTimeout(() => abortController.abort(), 10);

    await expect(conversion).resolves.toEqual({
      status: "failed",
      reason: "conversion_aborted",
    });
    expect(readLocalOfficeConversionRuntimeSnapshot()).toEqual({
      activeCount: 0,
      queuedCount: 0,
      totalSpawnCount: before.totalSpawnCount + 1,
    });
  }, 35_000);

  it("rejects Markdown output beyond the frozen byte budget without truncating", async () => {
    const result = await convertLocalOfficeDocumentBytes({
      bytes: createMinimalDocxBuffer(
        "x".repeat(
          localOfficeDocumentConversionBudgets.maxMarkdownOutputBytes + 1,
        ),
      ),
      expectedExtension: "docx",
    });

    expect(result).toEqual({
      status: "failed",
      reason: "resource_limit_exceeded",
    });
  }, 35_000);

  it("rejects an archive beyond the frozen ZIP entry budget", async () => {
    const docxEntries = createMinimalDocxEntries("entry limit");
    docxEntries.push(
      ...Array.from(
        {
          length:
            localOfficeDocumentConversionBudgets.maxZipEntries -
            docxEntries.length +
            1,
        },
        (_, index) => ({ path: `bounded/entry-${index}.xml`, body: "x" }),
      ),
    );

    const result = await convertLocalOfficeDocumentBytes({
      bytes: createZipBuffer(docxEntries),
      expectedExtension: "docx",
    });

    expect(result).toEqual({
      status: "failed",
      reason: "resource_limit_exceeded",
    });
  }, 35_000);

  it("keeps officeparser out of the main module graph and fixes the child launch contract", async () => {
    const source = await readFile(
      resolve(
        process.cwd(),
        "src/server/services/local-office-document-converter.ts",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/^import .*officeparser/imu);
    expect(source).not.toContain('require("officeparser")');
    expect(source).toContain('await import("officeparser")');
    expect(source).toContain('"--permission"');
    expect(source).toContain('"--input-type=module"');
    expect(source).toContain("shell: false");
    expect(source).toContain("windowsHide: true");
    expect(source).not.toContain('"--allow-worker"');
    expect(source).not.toContain('"--allow-fs-write');
    expect(source).not.toContain("...process.env");
  });
});
