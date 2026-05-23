import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scriptPath = join(
  process.cwd(),
  "scripts",
  "local",
  "Invoke-RealContentRagSmoke.ps1",
);

describe("phase 10 local real-content RAG smoke runtime", () => {
  it("keeps the local real-content smoke bounded and redaction-first", () => {
    const scriptSource = readFileSync(scriptPath, "utf8");

    expect(scriptSource).toContain(
      '$sourceRoot = Join-Path $repoRoot "rawfiles"',
    );
    expect(scriptSource).toContain("$maxFileCount = 1");
    expect(scriptSource).toContain("$maxExtractedCharacterCount = 12000");
    expect(scriptSource).toContain("$maxChunkCount = 6");
    expect(scriptSource).toContain("ignored_rawfiles");
    expect(scriptSource).toContain("no raw content");
    expect(scriptSource).toContain("redacted");
    expect(scriptSource).toContain("bounded sample");
    expect(scriptSource).toContain("knowledgeBase");
    expect(scriptSource).toContain("resource");
    expect(scriptSource).toContain("chunkSummary");
    expect(scriptSource).toContain("retrievalSummary");
    expect(scriptSource).toContain("evidenceStatus");
    expect(scriptSource).not.toContain(".env.local");
    expect(scriptSource).not.toContain("Authorization");
    expect(scriptSource).not.toContain("Invoke-RestMethod");
    expect(scriptSource).not.toContain("Invoke-WebRequest");
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$extractedText/i);
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$chunkText/i);
    expect(scriptSource).not.toMatch(/source(File)?Path\s*=/i);
    expect(scriptSource).not.toMatch(/file(Name)?\s*=/i);
  });
});
