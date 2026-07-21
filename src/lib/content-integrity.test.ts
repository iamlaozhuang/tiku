import { describe, expect, it } from "vitest";

import {
  getMeaningfulPlainText,
  getQuestionIntegrityIssues,
  hasMeaningfulRichText,
  type QuestionIntegrityInput,
} from "./content-integrity";
import * as contentIntegrity from "./content-integrity";

function createValidQuestionIntegrityInput(
  overrides: Partial<QuestionIntegrityInput> = {},
): QuestionIntegrityInput {
  return {
    questionType: "single_choice",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stemRichText: "Synthetic stem",
    analysisRichText: "Synthetic analysis",
    standardAnswerRichText: "A",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "auto_match",
    questionOptions: [
      { label: "A", contentRichText: "First answer", isCorrect: true },
      { label: "B", contentRichText: "Second answer", isCorrect: false },
    ],
    scoringPoints: [],
    fillBlankAnswers: [],
    ...overrides,
  };
}

describe("content integrity", () => {
  it.each([
    "&nbsp;",
    "&ZeroWidthSpace;",
    "&#8203;",
    "&#x200b;",
    "&#999999999999;",
  ])(
    "treats invisible or invalid entity content as empty without throwing: %s",
    (value) => {
      expect(() => getMeaningfulPlainText(value)).not.toThrow();
      expect(getMeaningfulPlainText(value)).toBe("");
    },
  );

  it("accepts only accessible managed content_image references whose ID and source agree", () => {
    const validImage =
      '<img src="/api/v1/content-images/content-image-public-1" data-content-image-public-id="content-image-public-1" alt="流程图" />';

    expect(hasMeaningfulRichText(validImage)).toBe(true);
    expect(
      hasMeaningfulRichText(validImage.replace('alt="流程图"', 'alt=""')),
    ).toBe(false);
    expect(
      hasMeaningfulRichText(
        validImage.replace(
          "/api/v1/content-images/content-image-public-1",
          "/api/v1/content-images/content-image-other",
        ),
      ),
    ).toBe(false);
    expect(
      hasMeaningfulRichText(
        validImage.replaceAll(
          "content-image-public-1",
          "../content-image-public-1",
        ),
      ),
    ).toBe(false);
  });

  it("classifies every image and rejects external, legacy, malformed or mixed references", () => {
    const parseManagedContentImageReferences = (
      contentIntegrity as unknown as {
        parseManagedContentImageReferences?: (value: string) => unknown;
      }
    ).parseManagedContentImageReferences;

    expect(
      parseManagedContentImageReferences?.(
        '<p>正文</p><img src="/api/v1/content-images/content-image-a" data-content-image-public-id="content-image-a" alt="图 A" /><img src="/api/v1/content-images/content-image-a" data-content-image-public-id="content-image-a" alt="图 A" />',
      ),
    ).toEqual({ publicIds: ["content-image-a"], valid: true });
    expect(
      parseManagedContentImageReferences?.(
        '<p>正文</p><img src="https://tracker.example/pixel.png" alt="外链" />',
      ),
    ).toEqual({ publicIds: [], valid: false });
    expect(
      parseManagedContentImageReferences?.(
        '<img src="/api/v1/paper-assets/paper-asset-public-1" data-paper-asset-public-id="paper-asset-public-1" alt="旧引用" />',
      ),
    ).toEqual({ publicIds: [], valid: false });
    expect(
      parseManagedContentImageReferences?.(
        '<img src="/api/v1/content-images/content-image-a" data-content-image-public-id="content-image-b" alt="错配" />',
      ),
    ).toEqual({ publicIds: [], valid: false });
    expect(
      parseManagedContentImageReferences?.(
        "<table><tr><td>正常表格</td></tr></table>",
      ),
    ).toEqual({ publicIds: [], valid: true });
  });

  it("distinguishes empty table markup from table content", () => {
    expect(
      hasMeaningfulRichText(
        "<table><tr><th></th></tr><tr><td></td></tr></table>",
      ),
    ).toBe(false);
    expect(
      hasMeaningfulRichText("<table><tr><td>有效内容</td></tr></table>"),
    ).toBe(true);
  });

  it("requires a positive half-point score for every persisted fill blank answer", () => {
    const issues = getQuestionIntegrityIssues(
      createValidQuestionIntegrityInput({
        questionType: "fill_blank",
        questionOptions: [],
        standardAnswerRichText: "客户动机",
        fillBlankAnswers: [{ standardAnswers: ["客户动机"], score: "0" }],
      }),
    );

    expect(issues).toContainEqual({
      field: "fillBlankAnswers",
      message:
        "逐空答案必须包含有效答案和正数、0.5 粒度的分值；自动匹配至少需要一空。",
    });
  });

  it.each([
    { questionType: "single_choice", scoringMethod: "ai_scoring" },
    { questionType: "short_answer", scoringMethod: "auto_match" },
    { questionType: "case_analysis", scoringMethod: "auto_match" },
    { questionType: "calculation", scoringMethod: "auto_match" },
  ])("rejects an inconsistent scoring path: %#", (overrides) => {
    const issues = getQuestionIntegrityIssues(
      createValidQuestionIntegrityInput({
        ...overrides,
        questionOptions:
          overrides.questionType === "single_choice"
            ? createValidQuestionIntegrityInput().questionOptions
            : [],
        scoringPoints:
          overrides.questionType === "single_choice"
            ? []
            : [{ description: "评分点", score: "1.0" }],
      }),
    );

    expect(issues).toContainEqual({
      field: "scoringMethod",
      message: "题型与评分方式不匹配。",
    });
  });

  it("rejects partial credit outside multi_choice", () => {
    expect(
      getQuestionIntegrityIssues(
        createValidQuestionIntegrityInput({
          multiChoiceRule: "partial_credit",
        }),
      ),
    ).toContainEqual({
      field: "multiChoiceRule",
      message: "只有多选题可以使用多选评分规则。",
    });
  });

  it("rejects mixed fill_blank scoring artifacts", () => {
    expect(
      getQuestionIntegrityIssues(
        createValidQuestionIntegrityInput({
          questionType: "fill_blank",
          questionOptions: [],
          standardAnswerRichText: "答案",
          fillBlankAnswers: [{ standardAnswers: ["答案"], score: "1.0" }],
          scoringPoints: [{ description: "不应并存", score: "1.0" }],
        }),
      ),
    ).toContainEqual({
      field: "scoringPoints",
      message: "自动匹配填空题不能提交 AI 评分点。",
    });

    expect(
      getQuestionIntegrityIssues(
        createValidQuestionIntegrityInput({
          questionType: "fill_blank",
          scoringMethod: "ai_scoring",
          questionOptions: [],
          standardAnswerRichText: "答案",
          fillBlankAnswers: [{ standardAnswers: ["答案"], score: "1.0" }],
          scoringPoints: [{ description: "评分点", score: "1.0" }],
        }),
      ),
    ).toContainEqual({
      field: "fillBlankAnswers",
      message: "AI 评分填空题不能提交逐空匹配答案。",
    });
  });
});
