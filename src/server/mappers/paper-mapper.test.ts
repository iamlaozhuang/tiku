import { describe, expect, it } from "vitest";

import { mapPaperRowToApi } from "./paper-mapper";
import type { PaperRow } from "../models/paper";

describe("mapPaperRowToApi", () => {
  it("maps database naming to API JSON naming without exposing internal id", () => {
    const paperRow = {
      id: 42,
      public_id: "paper_2H7Q9M",
      title: "专卖理论模拟卷",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paper_type: "mock_paper",
      paper_status: "draft",
      description: null,
      created_at: new Date("2026-05-12T12:00:00.000Z"),
      updated_at: new Date("2026-05-13T12:00:00.000Z"),
      published_at: null,
    } satisfies PaperRow;

    const mappedPaper = mapPaperRowToApi(paperRow);

    expect(mappedPaper).toEqual({
      publicId: "paper_2H7Q9M",
      title: "专卖理论模拟卷",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      paperStatus: "draft",
      description: null,
      createdAt: "2026-05-12T12:00:00.000Z",
      updatedAt: "2026-05-13T12:00:00.000Z",
      publishedAt: null,
    });
    expect(mappedPaper).not.toHaveProperty("id");
  });
});
