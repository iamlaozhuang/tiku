import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

describe("0704 acceptance fixture readability", () => {
  it("uses a readable Chinese material fixture in validation data preparation", () => {
    const source = readSource("e2e", "validation-data-prep.spec.ts");

    expect(source).toContain(
      'const validationMaterialLabel = "第23阶段验收材料";',
    );
    expect(source).toContain("keyword=${validationMaterialLabel}");
    expect(source).toContain("title: validationMaterialLabel");
    expect(source).toContain(
      'contentRichText: "<p>用于本地验收的专卖理论材料。</p>"',
    );
    expect(source).not.toContain("phase 23 bounded synthetic material");
  });

  it("uses a readable and run-scoped Chinese material in the role flow", () => {
    const source = readSource(
      "e2e",
      "role-based-acceptance",
      "role-based-full-flow.spec.ts",
    );

    expect(source).toContain(
      "const acceptanceMaterialLabel = `角色全流程验收材料-${acceptanceRunSuffix}`;",
    );
    expect(source).toContain("keyword=${acceptanceMaterialLabel}");
    expect(source).toContain("title: acceptanceMaterialLabel");
    expect(source).toContain(
      'contentRichText: "<p>用于角色全流程验收的专卖理论材料。</p>"',
    );
    expect(source).not.toContain("acceptance material bounded sample");
  });
});
