import { describe, expect, it } from "vitest";

import {
  createOrganizationTrainingListSearch,
  parseOrganizationTrainingListSearch,
} from "./organization-training-list-url";

describe("organization training list URL", () => {
  it("parses only allow-listed filters and a positive page", () => {
    expect(
      parseOrganizationTrainingListSearch(
        "?status=published&sourceKind=ai_paper&contentKind=paper_training&page=3",
      ),
    ).toEqual({
      contentKind: "paper_training",
      page: 3,
      sourceKind: "ai_paper",
      status: "published",
    });

    expect(
      parseOrganizationTrainingListSearch(
        "?status=deleted&sourceKind=provider&contentKind=mock_exam&page=-2",
      ),
    ).toEqual({
      contentKind: "all",
      page: 1,
      sourceKind: "all",
      status: "all",
    });
  });

  it("serializes one canonical query without default noise", () => {
    expect(
      createOrganizationTrainingListSearch({
        contentKind: "question_training",
        page: 2,
        sourceKind: "manual_group",
        status: "draft",
      }),
    ).toBe(
      "status=draft&sourceKind=manual_group&contentKind=question_training&page=2",
    );

    expect(
      createOrganizationTrainingListSearch({
        contentKind: "all",
        page: 1,
        sourceKind: "all",
        status: "all",
      }),
    ).toBe("");
  });
});
