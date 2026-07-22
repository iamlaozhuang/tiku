import { describe, expect, it } from "vitest";

import { listPublishedPaperSnapshotQuestionEntries } from "./published-paper-snapshot";

function createQuestion(
  paperQuestionPublicId: string,
  questionPublicId: string,
  score: string,
) {
  return {
    paperQuestionPublicId,
    questionPublicId,
    questionType: "short_answer",
    score,
  };
}

describe("published paper snapshot traversal", () => {
  it("reads standalone and grouped questions from a versioned hierarchy without duplicating group material", () => {
    const groupMaterialSnapshot = {
      materialPublicId: "material_public_1",
      title: "共享材料",
      contentRichText: "<p>共享正文</p>",
    };
    const entries = listPublishedPaperSnapshotQuestionEntries({
      snapshotVersion: 2,
      paperSections: [
        {
          publicId: "paper_section_public_1",
          title: "技能模块",
          sortOrder: 1,
          paperQuestions: [
            createQuestion(
              "paper_question_standalone",
              "question_standalone",
              "5.0",
            ),
          ],
          questionGroups: [
            {
              publicId: "qgroup_public_1",
              title: "共享材料题组",
              sortOrder: 1,
              totalScore: "20.0",
              materialSnapshot: groupMaterialSnapshot,
              paperQuestions: [
                createQuestion("paper_question_group_1", "question_1", "8.0"),
                createQuestion("paper_question_group_2", "question_2", "12.0"),
              ],
            },
          ],
        },
      ],
    });

    expect(
      entries.map(({ questionGroup, paperQuestion }) => ({
        paperQuestionPublicId: paperQuestion.paperQuestionPublicId,
        questionGroupPublicId: questionGroup?.publicId ?? null,
      })),
    ).toEqual([
      {
        paperQuestionPublicId: "paper_question_standalone",
        questionGroupPublicId: null,
      },
      {
        paperQuestionPublicId: "paper_question_group_1",
        questionGroupPublicId: "qgroup_public_1",
      },
      {
        paperQuestionPublicId: "paper_question_group_2",
        questionGroupPublicId: "qgroup_public_1",
      },
    ]);
    expect(entries[1].questionGroup?.materialSnapshot).toBe(
      groupMaterialSnapshot,
    );
    expect(entries[2].questionGroup).toBe(entries[1].questionGroup);
  });

  it("adapts immutable legacy flat group fields into one shared group context", () => {
    const legacyMaterialSnapshot = {
      materialPublicId: "material_public_legacy",
      title: "历史材料",
    };
    const entries = listPublishedPaperSnapshotQuestionEntries({
      paperSections: [
        {
          title: "历史技能模块",
          paperQuestions: [
            {
              ...createQuestion(
                "paper_question_legacy_1",
                "question_legacy_1",
                "5.0",
              ),
              questionGroupPublicId: "qgroup_public_legacy",
              questionGroupTitle: "历史题组",
              materialSnapshot: legacyMaterialSnapshot,
            },
            {
              ...createQuestion(
                "paper_question_legacy_2",
                "question_legacy_2",
                "5.0",
              ),
              questionGroupPublicId: "qgroup_public_legacy",
              questionGroupTitle: "历史题组",
              materialSnapshot: legacyMaterialSnapshot,
            },
          ],
        },
      ],
    });

    expect(entries).toHaveLength(2);
    expect(entries[0].questionGroup).toMatchObject({
      publicId: "qgroup_public_legacy",
      title: "历史题组",
      materialSnapshot: legacyMaterialSnapshot,
    });
    expect(entries[1].questionGroup).toBe(entries[0].questionGroup);
  });

  it.each([
    [
      "missing questionGroups",
      {
        snapshotVersion: 2,
        paperSections: [
          {
            publicId: "paper_section_public_1",
            title: "技能模块",
            sortOrder: 1,
            paperQuestions: [
              createQuestion("paper_question_1", "question_1", "5.0"),
            ],
          },
        ],
      },
    ],
    [
      "empty group",
      {
        snapshotVersion: 2,
        paperSections: [
          {
            publicId: "paper_section_public_1",
            title: "技能模块",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "qgroup_public_1",
                title: "空题组",
                sortOrder: 1,
                totalScore: "0.0",
                materialSnapshot: {},
                paperQuestions: [],
              },
            ],
          },
        ],
      },
    ],
    [
      "subtotal mismatch",
      {
        snapshotVersion: 2,
        paperSections: [
          {
            publicId: "paper_section_public_1",
            title: "技能模块",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "qgroup_public_1",
                title: "错误小计",
                sortOrder: 1,
                totalScore: "9.0",
                materialSnapshot: {},
                paperQuestions: [
                  createQuestion("paper_question_1", "question_1", "10.0"),
                ],
              },
            ],
          },
        ],
      },
    ],
    [
      "duplicate question identity",
      {
        snapshotVersion: 2,
        paperSections: [
          {
            publicId: "paper_section_public_1",
            title: "技能模块",
            sortOrder: 1,
            paperQuestions: [
              createQuestion("paper_question_duplicate", "question_1", "5.0"),
            ],
            questionGroups: [
              {
                publicId: "qgroup_public_1",
                title: "重复题目",
                sortOrder: 1,
                totalScore: "5.0",
                materialSnapshot: {},
                paperQuestions: [
                  createQuestion(
                    "paper_question_duplicate",
                    "question_2",
                    "5.0",
                  ),
                ],
              },
            ],
          },
        ],
      },
    ],
    [
      "noncanonical numeric score",
      {
        snapshotVersion: 2,
        paperSections: [
          {
            publicId: "paper_section_public_1",
            title: "技能模块",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "qgroup_public_1",
                title: "分值格式损坏",
                sortOrder: 1,
                totalScore: "10.0",
                materialSnapshot: {},
                paperQuestions: [
                  createQuestion("paper_question_1", "question_1", "10.0junk"),
                ],
              },
            ],
          },
        ],
      },
    ],
  ])("fails closed for malformed v2 hierarchy: %s", (_caseName, snapshot) => {
    expect(listPublishedPaperSnapshotQuestionEntries(snapshot)).toEqual([]);
  });
});
