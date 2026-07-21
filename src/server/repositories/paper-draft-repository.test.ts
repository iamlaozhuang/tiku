import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createPaperQuestionSectionMovePlan,
  createTwoPhaseSortOrderPlan,
  isExactPublicIdOrder,
  isQuestionGroupMembershipCompatible,
} from "./paper-draft-repository";

describe("paper question section move planning", () => {
  it("moves a standalone paper question without rebuilding its snapshot", () => {
    expect(
      createPaperQuestionSectionMovePlan({
        paperQuestionId: 11,
        questionGroupId: null,
        sourcePaperSectionId: 21,
        targetPaperSectionId: 22,
      }),
    ).toEqual({
      kind: "paper_question",
      paperQuestionId: 11,
      sourcePaperSectionId: 21,
      targetPaperSectionId: 22,
    });
  });

  it("moves a material group atomically instead of detaching one child", () => {
    expect(
      createPaperQuestionSectionMovePlan({
        paperQuestionId: 11,
        questionGroupId: 31,
        sourcePaperSectionId: 21,
        targetPaperSectionId: 22,
      }),
    ).toEqual({
      kind: "question_group",
      questionGroupId: 31,
      sourcePaperSectionId: 21,
      targetPaperSectionId: 22,
    });
  });
});

describe("paper structure fail-closed planning", () => {
  it("requires a complete exact public-id set for reorder", () => {
    expect(isExactPublicIdOrder(["a", "b"], ["b", "a"])).toBe(true);
    expect(isExactPublicIdOrder(["a", "b"], ["a"])).toBe(false);
    expect(isExactPublicIdOrder(["a", "b"], ["a", "b", "c"])).toBe(false);
    expect(isExactPublicIdOrder(["a", "b"], ["a", "a"])).toBe(false);
  });

  it("uses collision-free temporary orders before assigning contiguous final orders", () => {
    expect(createTwoPhaseSortOrderPlan(["b", "a"])).toEqual([
      { publicId: "b", temporarySortOrder: -1, finalSortOrder: 1 },
      { publicId: "a", temporarySortOrder: -2, finalSortOrder: 2 },
    ]);
  });

  it("requires paper, section, and material compatibility for group membership", () => {
    expect(
      isQuestionGroupMembershipCompatible({
        paperId: 1,
        paperSectionId: 2,
        materialPublicId: "material_1",
        groupPaperId: 1,
        groupPaperSectionId: 2,
        groupSectionOwnerPaperId: 1,
        groupMaterialPublicId: "material_1",
      }),
    ).toBe(true);
    expect(
      isQuestionGroupMembershipCompatible({
        paperId: 1,
        paperSectionId: 2,
        materialPublicId: "material_1",
        groupPaperId: 1,
        groupPaperSectionId: 3,
        groupSectionOwnerPaperId: 1,
        groupMaterialPublicId: "material_1",
      }),
    ).toBe(false);
    expect(
      isQuestionGroupMembershipCompatible({
        paperId: 1,
        paperSectionId: 2,
        materialPublicId: null,
        groupPaperId: 1,
        groupPaperSectionId: 2,
        groupSectionOwnerPaperId: 1,
        groupMaterialPublicId: "material_1",
      }),
    ).toBe(false);
    expect(
      isQuestionGroupMembershipCompatible({
        paperId: 1,
        paperSectionId: 2,
        materialPublicId: "material_1",
        groupPaperId: 1,
        groupPaperSectionId: 2,
        groupSectionOwnerPaperId: 9,
        groupMaterialPublicId: "material_1",
      }),
    ).toBe(false);
  });

  it("keeps each structure command in one revision-CAS transaction and rejects non-empty deletion", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/paper-draft-repository.ts",
      ),
      "utf8",
    );
    const sectionSource = source.slice(
      source.indexOf("async mutatePaperSections"),
      source.indexOf("async mutateQuestionGroups"),
    );
    const groupSource = source.slice(
      source.indexOf("async mutateQuestionGroups"),
      source.indexOf(
        "async publishPaper",
        source.indexOf("async mutateQuestionGroups"),
      ),
    );

    expect(sectionSource.match(/advancePaperRevision/gu)).toHaveLength(1);
    expect(groupSource.match(/advancePaperRevision/gu)).toHaveLength(1);
    expect(sectionSource).toContain("groupCountRow");
    expect(sectionSource).toContain("questionCountRow");
    expect(groupSource).toContain("questionCountRow");
    expect(sectionSource).toContain("applyPaperSectionSortOrderPlan");
    expect(groupSource).toContain("applyQuestionGroupSortOrderPlan");
    expect(groupSource).not.toContain("question_snapshot:");
    expect(groupSource).not.toContain("scoring_points:");
  });
});
