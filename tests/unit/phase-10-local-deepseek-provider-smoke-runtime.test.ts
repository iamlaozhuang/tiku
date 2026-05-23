import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scriptPath = join(
  process.cwd(),
  "scripts",
  "local",
  "Invoke-DeepSeekProviderSmoke.ps1",
);

describe("phase 10 local DeepSeek provider smoke runtime", () => {
  it("keeps the local smoke script bounded and redaction-first", () => {
    const scriptSource = readFileSync(scriptPath, "utf8");

    expect(scriptSource).toContain("$boundedMaxTokens = 4");
    expect(scriptSource).toContain("$requestCount = 1");
    expect(scriptSource).toContain("$retryCount = 0");
    expect(scriptSource).toContain("present_redacted");
    expect(scriptSource).toContain("no API key");
    expect(scriptSource).toContain("no secret");
    expect(scriptSource).toContain("redacted");
    expect(scriptSource).toContain("bounded sample");
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$apiKey/i);
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$envValues/i);
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$responseJson/i);
    expect(scriptSource).not.toMatch(/Write-(Output|Host)\s+\$payloadJson/i);
    expect(scriptSource).not.toContain("SkipHttpErrorCheck");
  });
});
