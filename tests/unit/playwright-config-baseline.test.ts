import { describe, expect, it } from "vitest";

import playwrightConfig, {
  shouldReuseExistingPlaywrightServer,
} from "../../playwright.config";

type PlaywrightWebServerConfig = {
  command?: string;
  reuseExistingServer?: boolean;
  url?: string;
};

function getWebServerConfig(config: {
  webServer?: PlaywrightWebServerConfig | PlaywrightWebServerConfig[];
}): PlaywrightWebServerConfig {
  expect(Array.isArray(config.webServer)).toBe(false);
  expect(config.webServer).toBeDefined();

  return config.webServer as PlaywrightWebServerConfig;
}

describe("playwright config baseline", () => {
  it("starts a fresh local server by default", () => {
    const webServer = getWebServerConfig(playwrightConfig);

    expect(webServer).toMatchObject({
      command: "npm.cmd run dev -- --hostname 127.0.0.1",
      reuseExistingServer: false,
      url: "http://127.0.0.1:3000",
    });
    expect(
      shouldReuseExistingPlaywrightServer({
        TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER: "",
      }),
    ).toBe(false);
  });

  it("requires explicit local opt-in before reusing an existing server", () => {
    expect(
      shouldReuseExistingPlaywrightServer({
        TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER: "1",
      }),
    ).toBe(true);
  });
});
