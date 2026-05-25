import { describe, expect, it } from "vitest";

import playwrightConfig from "../../playwright.config";

describe("phase 11 local e2e postgres connection pressure fix", () => {
  it("caps local Playwright workers to one by default", () => {
    expect(playwrightConfig.workers).toBe(1);
  });
});
