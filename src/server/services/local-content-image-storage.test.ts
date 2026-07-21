import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("local content_image storage", () => {
  it("prepares a deterministic managed path and verifies stored bytes", async () => {
    const storageModule = await import("./local-content-image-storage").catch(
      () => ({}),
    );
    const prepare = Reflect.get(storageModule, "prepareLocalContentImageFile");
    const store = Reflect.get(
      storageModule,
      "storePreparedLocalContentImageFile",
    );
    const load = Reflect.get(storageModule, "readLocalContentImageFile");

    expect([typeof prepare, typeof store, typeof load]).toEqual([
      "function",
      "function",
      "function",
    ]);
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-content-image-"));
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const prepared = await prepare({
      file: new File([pngBytes], "diagram.png", {
        type: "image/png",
      }),
      profession: "marketing",
      uploadedAt: new Date("2026-07-21T00:00:00.000Z"),
    });

    expect(prepared.objectKey).toMatch(
      /^dev\/content-image\/marketing\/202607\/[a-f0-9]{64}\.png$/u,
    );
    await store({ preparedFile: prepared, storageRoot });
    await expect(load({ metadata: prepared, storageRoot })).resolves.toEqual(
      Buffer.from(pngBytes),
    );
    await expect(
      readFile(join(storageRoot, ...prepared.objectKey.split("/"))),
    ).resolves.toEqual(Buffer.from(pngBytes));
    await expect(
      store({ preparedFile: prepared, storageRoot }),
    ).resolves.toBeUndefined();
    await writeFile(
      join(storageRoot, ...prepared.objectKey.split("/")),
      Buffer.from("corrupt"),
    );
    await expect(
      store({ preparedFile: prepared, storageRoot }),
    ).rejects.toThrow("Existing content_image object failed integrity check.");

    await expect(
      prepare({
        file: new File([new Uint8Array([1, 2, 3])], "forged.png", {
          type: "image/png",
        }),
        profession: "marketing",
      }),
    ).rejects.toThrow("Unsupported content_image content type.");
  });
});
