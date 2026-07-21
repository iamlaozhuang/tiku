import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("content_image repository contract", () => {
  it("exposes durable idempotent upload and reference lookup boundaries", async () => {
    const repositoryModule = await import("./content-image-repository").catch(
      () => ({}),
    );

    expect(
      typeof Reflect.get(
        repositoryModule,
        "createPostgresContentImageRepository",
      ),
    ).toBe("function");
    expect(
      Reflect.get(repositoryModule, "createPostgresContentImageRepository"),
    ).toBeDefined();
    const source = await readFile(
      join(
        process.cwd(),
        "src/server/repositories/content-image-repository.ts",
      ),
      "utf8",
    );
    expect(source).toContain(".transaction(async (transaction)");
    expect(source).toContain(
      "target: contentImageUploadOperation.idempotency_key_hash",
    );
    expect(source).toContain('action_type: "content_image.create"');
    expect(source).toContain(
      'metadata_summary: "redacted content_image upload metadata"',
    );
    expect(source).toContain('completed?.operation_status === "completed"');
    expect(source).toMatch(
      /inArray\(contentImageUploadOperation\.operation_status,\s*\[\s*"pending",\s*"file_stored",\s*"failed",?\s*\]\)/u,
    );
  });
});
