import { describe, expect, it } from "vitest";

import {
  createOrganizationTrainingListSearch,
  parseOrganizationTrainingListSearch,
} from "./organization-training-list-url";

describe("organization training list URL", () => {
  it("parses only allow-listed filters and a positive page", () => {
    expect(
      parseOrganizationTrainingListSearch(
        "?status=published&sourceKind=ai_paper&contentKind=paper_training&page=3&pageSize=50&draftPublicId=organization-training-draft-001&generationKind=paper",
      ),
    ).toEqual({
      contentKind: "paper_training",
      draftGenerationKind: "paper",
      draftPublicId: "organization-training-draft-001",
      draftSelectorStatus: "valid",
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
      draftGenerationKind: null,
      draftPublicId: null,
      draftSelectorStatus: "absent",
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
        draftGenerationKind: "question",
        draftPublicId: "organization-training-draft-001",
        draftSelectorStatus: "valid",
        page: 2,
        pageSize: 100,
        sourceKind: "manual_group",
        status: "draft",
      }),
    ).toBe(
      "status=draft&sourceKind=manual_group&contentKind=question_training&pageSize=100&page=2&draftPublicId=organization-training-draft-001&generationKind=question",
    );

    expect(
      createOrganizationTrainingListSearch({
        contentKind: "all",
        draftGenerationKind: null,
        draftPublicId: null,
        draftSelectorStatus: "absent",
        page: 1,
        pageSize: 20,
        sourceKind: "all",
        status: "all",
      }),
    ).toBe("");
  });

  it("fails closed on duplicate, uppercase, malformed, or incomplete draft selectors", () => {
    for (const search of [
      "?draftPublicId=organization-training-draft-001&draftPublicId=organization-training-draft-002&generationKind=question",
      "?draftPublicId=Organization-Training-Draft-001&generationKind=question",
      "?draftPublicId=../organization-training-draft-001&generationKind=question",
      "?draftPublicId=not-a-training-draft&generationKind=question",
      "?draftPublicId=organization-training-draft-001",
      "?generationKind=paper",
      "?draftPublicId=organization-training-draft-001&generationKind=question&generationKind=paper",
    ]) {
      expect(parseOrganizationTrainingListSearch(search)).toMatchObject({
        draftGenerationKind: null,
        draftPublicId: null,
        draftSelectorStatus: "invalid",
      });
    }
  });
});
