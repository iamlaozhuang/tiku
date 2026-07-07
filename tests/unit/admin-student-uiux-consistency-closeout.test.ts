import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(...segments: string[]) {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

describe("full-role UIUX consistency closeout", () => {
  it("uses organization workspace wording for enterprise training instead of mixed enterprise-backend copy", () => {
    const source = readSource(
      "src",
      "features",
      "admin",
      "organization-training",
      "AdminOrganizationTrainingPage.tsx",
    );

    expect(source).toContain(">组织后台<");
    expect(source).not.toContain(">企业后台<");
  });

  it("keeps the contact configuration header free of raw business identifiers", () => {
    const source = readSource(
      "src",
      "features",
      "admin",
      "contact-config",
      "AdminContactConfigPage.tsx",
    );

    expect(source).toContain("受保护配置");
    expect(source).not.toContain("配置业务标识：{contactConfig.publicId}");
  });
});
