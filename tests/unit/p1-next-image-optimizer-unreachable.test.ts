import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { resolve } from "node:path";

import loadConfig from "next/dist/server/config";
import type {
  NextConfigComplete,
  NextConfigRuntime,
} from "next/dist/server/config-shared";
import { ImageOptimizerCache } from "next/dist/server/image-optimizer";
import { PHASE_PRODUCTION_SERVER } from "next/dist/shared/lib/constants";
import { hasLocalMatch } from "next/dist/shared/lib/match-local-pattern";
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import { beforeAll, describe, expect, it } from "vitest";

const repositoryRoot = resolve(__dirname, "../..");

let normalizedConfig: NextConfigComplete | NextConfigRuntime;

beforeAll(async () => {
  normalizedConfig = await loadConfig(PHASE_PRODUCTION_SERVER, repositoryRoot, {
    silent: true,
  });
});

function validateOptimizerSource(url: string) {
  const request = new IncomingMessage(new Socket());
  request.headers.accept = "image/webp";

  return ImageOptimizerCache.validateParams(
    request,
    {
      q: "75",
      url,
      w: String(normalizedConfig.images.deviceSizes[0]),
    },
    normalizedConfig,
    false,
  );
}

describe("Next image optimizer trust boundary", () => {
  it("normalizes the config to the build-controlled static-media source only", () => {
    expect(normalizedConfig.images.localPatterns).toEqual([
      { pathname: "/_next/static/media/**", search: "" },
    ]);
    expect(normalizedConfig.images.remotePatterns).toEqual([]);

    expect(
      hasLocalMatch(
        normalizedConfig.images.localPatterns,
        "/_next/static/media/logo.01234567.png",
      ),
    ).toBe(true);
    expect(
      hasLocalMatch(
        normalizedConfig.images.localPatterns,
        "/_next/static/media/logo.01234567.png?v=1",
      ),
    ).toBe(false);
  });

  it.each([
    "/api/v1/contact-configs/qr-images/contact-config-qr-public",
    "/api/v1/contact-configs/qr-images/contact-config-qr-public?variant=1",
    "/api/v1/content-images/content-image-public",
    "/api/v1/other-image-source?url=%2F_next%2Fstatic%2Fmedia%2Flogo.png",
  ])("rejects API local source %s", (source) => {
    expect(hasLocalMatch(normalizedConfig.images.localPatterns, source)).toBe(
      false,
    );
    expect(validateOptimizerSource(source)).toEqual({
      errorMessage: '"url" parameter is not allowed',
    });
  });

  it.each([
    "https://example.com/untrusted.png",
    "http://127.0.0.1/api/v1/contact-configs/qr-images/public-id",
  ])("rejects remote source %s", (source) => {
    expect(
      hasRemoteMatch(
        normalizedConfig.images.domains,
        normalizedConfig.images.remotePatterns,
        new URL(source),
      ),
    ).toBe(false);
    expect(validateOptimizerSource(source)).toEqual({
      errorMessage: '"url" parameter is not allowed',
    });
  });

  it("rejects a manual optimizer request before internal fetch or decode", () => {
    const requestUrl = new URL("http://localhost/_next/image");
    requestUrl.searchParams.set(
      "url",
      "/api/v1/contact-configs/qr-images/contact-config-qr-public",
    );
    requestUrl.searchParams.set(
      "w",
      String(normalizedConfig.images.deviceSizes[0]),
    );
    requestUrl.searchParams.set("q", "75");

    expect(
      ImageOptimizerCache.validateParams(
        new IncomingMessage(new Socket()),
        Object.fromEntries(requestUrl.searchParams),
        normalizedConfig,
        false,
      ),
    ).toEqual({ errorMessage: '"url" parameter is not allowed' });
  });

  it("continues to reject recursive optimizer sources", () => {
    expect(validateOptimizerSource("/_next/image?url=%2Flogo.png")).toEqual({
      errorMessage: '"url" parameter cannot be recursive',
    });
  });

  it("has no product import of Next image components or sharp", () => {
    const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean)
      .filter((path) => /\.[cm]?[jt]sx?$/u.test(path))
      .filter(
        (path) =>
          !path.startsWith("docs/") &&
          !path.startsWith("scripts/") &&
          !path.startsWith("tests/"),
      )
      .filter((path) => !/\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(path));
    const forbiddenProductImport =
      /(?:from\s*|import\s*\(\s*|import\s+|require\s*\(\s*)["'](?:next\/image|next\/legacy\/image|sharp)["']/u;
    const matches = trackedFiles.filter((path) =>
      forbiddenProductImport.test(
        readFileSync(resolve(repositoryRoot, path), "utf8"),
      ),
    );

    expect(matches).toEqual([]);
  });
});
