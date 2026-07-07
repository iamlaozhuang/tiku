import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next dev origin config", () => {
  it("allows the 127.0.0.1 loopback host used by local browser validation", () => {
    const allowedDevOrigins =
      (nextConfig as { allowedDevOrigins?: string[] }).allowedDevOrigins ?? [];

    expect(allowedDevOrigins).toContain("127.0.0.1");
  });
});
