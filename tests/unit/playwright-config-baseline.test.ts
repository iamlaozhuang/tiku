import { afterEach, describe, expect, it, vi } from "vitest";

type PlaywrightWebServerConfig = {
  command?: string;
  reuseExistingServer?: boolean;
  url?: string;
};

async function loadPlaywrightConfig() {
  vi.resetModules();
  return (await import("../../playwright.config")).default;
}

function getWebServerConfig(config: {
  webServer?: PlaywrightWebServerConfig | PlaywrightWebServerConfig[];
}): PlaywrightWebServerConfig {
  expect(Array.isArray(config.webServer)).toBe(false);
  expect(config.webServer).toBeDefined();

  return config.webServer as PlaywrightWebServerConfig;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("playwright config baseline", () => {
  it("starts a fresh local server by default", async () => {
    vi.stubEnv("CI", "");
    vi.stubEnv("TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER", "");

    const webServer = getWebServerConfig(await loadPlaywrightConfig());

    expect(webServer).toMatchObject({
      command: "npm.cmd run dev -- --hostname 127.0.0.1",
      reuseExistingServer: false,
      url: "http://127.0.0.1:3000",
    });
  });

  it("requires explicit local opt-in before reusing an existing server", async () => {
    vi.stubEnv("TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER", "1");

    const webServer = getWebServerConfig(await loadPlaywrightConfig());

    expect(webServer.reuseExistingServer).toBe(true);
  });
});
