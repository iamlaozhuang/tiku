import { describe, expect, it } from "vitest";

import {
  normalizeCreateMaterialInput,
  normalizeMaterialListInput,
  normalizeUpdateMaterialInput,
} from "./material";

function createMaterialInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Synthetic material",
    contentRichText: "<p>Synthetic material body.</p>",
    profession: "monopoly",
    level: 3,
    subject: "skill",
    ...overrides,
  };
}

describe("material validator", () => {
  it.each([
    { title: "   " },
    { contentRichText: "<p><br></p>" },
    { contentRichText: "<div>&nbsp;</div>" },
    { contentRichText: "<table><tr><th></th></tr><tr><td></td></tr></table>" },
    {
      contentRichText:
        '<img data-paper-asset-public-id="paper-asset-public-1" alt="" />',
    },
  ])("rejects semantically empty material input %#", (overrides) => {
    expect(
      normalizeCreateMaterialInput(createMaterialInput(overrides)),
    ).toEqual({
      success: false,
      message: "Invalid material input.",
    });
  });

  it("accepts meaningful table text and an accessible managed image", () => {
    expect(
      normalizeCreateMaterialInput(
        createMaterialInput({
          contentRichText: "<table><tr><td>有效内容</td></tr></table>",
        }),
      ),
    ).toMatchObject({ success: true });

    expect(
      normalizeCreateMaterialInput(
        createMaterialInput({
          contentRichText:
            '<img src="/api/v1/content-images/content-image-public-1" data-content-image-public-id="content-image-public-1" alt="现场照片" />',
        }),
      ),
    ).toMatchObject({ success: true });
  });

  it("enforces the material body length boundary", () => {
    expect(
      normalizeCreateMaterialInput(
        createMaterialInput({ contentRichText: "材".repeat(30000) }),
      ),
    ).toMatchObject({ success: true });
    expect(
      normalizeCreateMaterialInput(
        createMaterialInput({ contentRichText: "材".repeat(30001) }),
      ),
    ).toEqual({
      success: false,
      message: "Invalid material input.",
    });
  });

  it("requires a canonical optimistic concurrency timestamp for update", () => {
    expect(
      normalizeUpdateMaterialInput(
        createMaterialInput({ status: "available" }),
      ),
    ).toEqual({ success: false, message: "Invalid material input." });
    expect(
      normalizeUpdateMaterialInput(
        createMaterialInput({
          status: "available",
          expectedUpdatedAt: "2026-05-19T02:00:00.000Z",
        }),
      ),
    ).toMatchObject({
      success: true,
      value: { expectedUpdatedAt: new Date("2026-05-19T02:00:00.000Z") },
    });
  });

  it("normalizes bounded exact public id filters for current binding hydration", () => {
    expect(
      normalizeMaterialListInput({
        publicIds: [" material-public-101 ", "material-public-101", ""],
      }),
    ).toMatchObject({ publicIds: ["material-public-101"] });
    expect(
      normalizeMaterialListInput({ publicIds: "material-public-102" }),
    ).toMatchObject({ publicIds: ["material-public-102"] });
  });
});
