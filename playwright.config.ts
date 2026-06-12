import { defineConfig, devices } from "@playwright/test";

export function shouldReuseExistingPlaywrightServer(
  env: { TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER?: string } = {
    TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER:
      process.env.TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER,
  },
) {
  return env.TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";
}

const reuseExistingServer = shouldReuseExistingPlaywrightServer();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? undefined : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm.cmd run dev -- --hostname 127.0.0.1",
    reuseExistingServer,
    url: "http://127.0.0.1:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
