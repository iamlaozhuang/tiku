import { describe, expect, it } from "vitest";

import { projectPaperSnapshotForLearner } from "@/lib/learner-content-projection";

describe("learner content projection", () => {
  it("removes every teacher-only fact from nested paper questions without mutating the source snapshot", () => {
    const source = {
      paperPublicId: "paper_public_1",
      paperSections: [
        {
          paperSectionPublicId: "paper_section_public_1",
          paperQuestions: [
            {
              paperQuestionPublicId: "paper_question_public_1",
              questionPublicId: "question_public_1",
              questionType: "fill_blank",
              stemRichText: "<p>题干</p>",
              questionOptions: [
                {
                  label: "A",
                  contentRichText: "<p>选项 A</p>",
                  isCorrect: true,
                },
              ],
              standardAnswer: ["A"],
              standardAnswerLabels: ["A"],
              standardAnswerText: "A",
              standardAnswerRichText: "<p>A</p>",
              analysis: "解析",
              analysisRichText: "<p>解析</p>",
              fillBlankAnswers: [
                { blankKey: "blank_1", standardAnswers: ["答案"] },
              ],
              scoringPoints: [{ description: "评分点", score: "1.0" }],
              materialSnapshot: {
                materialPublicId: "material_public_1",
                contentRichText: "<p>材料正文</p>",
              },
            },
          ],
        },
      ],
    };

    const projected = projectPaperSnapshotForLearner(source);
    const serialized = JSON.stringify(projected);

    expect(serialized).not.toContain("standardAnswer");
    expect(serialized).not.toContain("analysisRichText");
    expect(serialized).not.toContain("fillBlankAnswers");
    expect(serialized).not.toContain("scoringPoints");
    expect(serialized).not.toContain("isCorrect");
    expect(projected).toMatchObject({
      paperPublicId: "paper_public_1",
      paperSections: [
        {
          paperQuestions: [
            {
              stemRichText: "<p>题干</p>",
              questionOptions: [
                { label: "A", contentRichText: "<p>选项 A</p>" },
              ],
              materialSnapshot: {
                materialPublicId: "material_public_1",
                contentRichText: "<p>材料正文</p>",
              },
            },
          ],
        },
      ],
    });
    expect(source.paperSections[0]?.paperQuestions[0]).toHaveProperty(
      "standardAnswerRichText",
    );
  });
});
