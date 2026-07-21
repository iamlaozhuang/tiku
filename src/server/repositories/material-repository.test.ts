import { describe, expect, it } from "vitest";

import { mergeMaterialPaperReferenceRows } from "./material-repository";

const earlier = new Date("2026-07-20T10:00:00.000Z");
const later = new Date("2026-07-20T11:00:00.000Z");

describe("material paper reference facts", () => {
  it("keeps empty-group references, adds snapshot-only papers, and deduplicates the same paper across sources", () => {
    const references = mergeMaterialPaperReferenceRows(
      [
        {
          material_id: 1,
          paper_public_id: "paper-grouped",
          name: "Grouped paper",
          paper_status: "published",
          updated_at: later,
        },
        {
          material_id: 2,
          paper_public_id: "paper-empty-group",
          name: "Empty group paper",
          paper_status: "draft",
          updated_at: earlier,
        },
      ],
      [
        {
          material_id: 1,
          paper_public_id: "paper-ungrouped",
          name: "Ungrouped snapshot paper",
          paper_status: "published",
          updated_at: earlier,
        },
        {
          material_id: 1,
          paper_public_id: "paper-grouped",
          name: "Grouped paper",
          paper_status: "published",
          updated_at: later,
        },
      ],
    );

    expect(references.get(1)).toEqual([
      {
        paper_public_id: "paper-ungrouped",
        name: "Ungrouped snapshot paper",
        paper_status: "published",
        updated_at: earlier,
      },
      {
        paper_public_id: "paper-grouped",
        name: "Grouped paper",
        paper_status: "published",
        updated_at: later,
      },
    ]);
    expect(references.get(2)).toEqual([
      {
        paper_public_id: "paper-empty-group",
        name: "Empty group paper",
        paper_status: "draft",
        updated_at: earlier,
      },
    ]);
  });
});
