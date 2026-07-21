import { describe, expect, it } from "vitest";

import {
  createOrganizationTrainingListSearch,
  parseOrganizationTrainingListSearch,
} from "./organization-training-list-url";

describe("organization training list URL", () => {
  it("parses only allow-listed filters and a positive page", () => {
    expect(
      parseOrganizationTrainingListSearch(
        "?status=published&sourceKind=ai_paper&contentKind=paper_training&page=3&pageSize=50",
      ),
    ).toEqual({
      contentKind: "paper_training",
      page: 3,
      pageSize: 50,
      sourceKind: "ai_paper",
      status: "published",
    });

    expect(
      parseOrganizationTrainingListSearch(
        "?status=deleted&sourceKind=provider&contentKind=mock_exam&page=-2&pageSize=10",
      ),
    ).toEqual({
      contentKind: "all",
      page: 1,
      pageSize: 20,
      sourceKind: "all",
      status: "all",
    });
  });

  it("serializes one canonical query without default noise", () => {
    expect(
      createOrganizationTrainingListSearch({
        contentKind: "question_training",
        page: 2,
        pageSize: 100,
        sourceKind: "manual_group",
        status: "draft",
      }),
    ).toBe(
      "status=draft&sourceKind=manual_group&contentKind=question_training&pageSize=100&page=2",
    );

    expect(
      createOrganizationTrainingListSearch({
        contentKind: "all",
        page: 1,
        pageSize: 20,
        sourceKind: "all",
        status: "all",
      }),
    ).toBe("");
  });
});
