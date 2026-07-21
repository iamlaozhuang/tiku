import { describe, expect, it } from "vitest";

describe("content_image upload validation", () => {
  it("accepts only bounded managed image uploads", async () => {
    const validatorModule = await import("./content-image").catch(() => ({}));
    const normalize = Reflect.get(
      validatorModule,
      "normalizeContentImageUploadInput",
    );

    expect(typeof normalize).toBe("function");
    expect(
      normalize({
        commandPublicId: "content-image-command-1",
        profession: "marketing",
        file: new File([new Uint8Array([1, 2, 3])], "diagram.png", {
          type: "image/png",
        }),
      }),
    ).toMatchObject({ success: true });
    expect(
      normalize({
        commandPublicId: "content-image-command-2",
        profession: "marketing",
        file: new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
          type: "image/png",
        }),
      }),
    ).toEqual({ success: false, message: "Invalid content_image input." });
    expect(
      normalize({
        commandPublicId: "content-image-command-3",
        profession: "marketing",
        file: new File(["svg"], "diagram.svg", { type: "image/svg+xml" }),
      }),
    ).toEqual({ success: false, message: "Invalid content_image input." });
  });
});
