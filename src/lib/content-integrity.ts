import type {
  MultiChoiceRule,
  QuestionType,
  ScoringMethod,
} from "@/server/models/paper";

import { getQuestionScoringContractIssues } from "./question-scoring-contract";

export type ContentIntegrityIssue = {
  field: string;
  message: string;
};

export const MAX_QUESTION_RICH_TEXT_LENGTH = 10000;
export const MAX_MATERIAL_RICH_TEXT_LENGTH = 30000;

export type QuestionIntegrityInput = {
  questionType: string;
  profession: string;
  level: number | string;
  subject: string;
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  multiChoiceRule: string;
  scoringMethod: string;
  questionOptions: {
    label: string;
    contentRichText: string;
    isCorrect: boolean;
  }[];
  scoringPoints: { description: string; score: number | string }[];
  fillBlankAnswers: {
    standardAnswers: string[];
    score: number | string;
  }[];
};

export type MaterialIntegrityInput = {
  title: string;
  contentRichText: string;
  profession: string;
  level: number | string;
  subject: string;
};

const invisibleCharacterPattern =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180f\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufeff\uffa0]/gu;
const richTextTagPattern = /<[^>]*>/gu;

function decodeNumericEntity(value: string, radix: 10 | 16): string {
  const codePoint = Number.parseInt(value, radix);

  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return " ";
  }

  return String.fromCodePoint(codePoint);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);?/gu, (_, decimalValue: string) =>
      decodeNumericEntity(decimalValue, 10),
    )
    .replace(/&#x([\da-f]+);?/giu, (_, hexadecimalValue: string) =>
      decodeNumericEntity(hexadecimalValue, 16),
    )
    .replace(
      /&(nbsp|ensp|emsp|thinsp|zerowidthspace|zwnj|zwj|lrm|rlm);?/giu,
      " ",
    )
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/&apos;|&#39;/giu, "'");
}

export function getMeaningfulPlainText(value: string): string {
  return decodeHtmlEntities(value.replace(richTextTagPattern, " "))
    .replace(invisibleCharacterPattern, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function readHtmlAttribute(attributes: string, attributeName: string) {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const attributePattern = new RegExp(
    `(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "iu",
  );
  const match = attributes.match(attributePattern);

  return match === null ? null : decodeHtmlEntities(match[1] ?? match[2] ?? "");
}

function hasAccessibleManagedImage(value: string): boolean {
  const imagePattern = /<img\b([^>]*)>/giu;
  const publicIdPattern = /^[a-z][a-z0-9-]{2,}$/u;

  return Array.from(value.matchAll(imagePattern)).some((imageMatch) => {
    const attributes = imageMatch[1] ?? "";
    const altText = readHtmlAttribute(attributes, "alt");
    const boundary = readHtmlAttribute(attributes, "data-paper-asset-boundary");
    const paperAssetPublicId = readHtmlAttribute(
      attributes,
      "data-paper-asset-public-id",
    );
    const source = readHtmlAttribute(attributes, "src");

    return (
      boundary === "metadata-only" &&
      paperAssetPublicId !== null &&
      publicIdPattern.test(paperAssetPublicId) &&
      source === `/api/v1/paper-assets/${paperAssetPublicId}` &&
      altText !== null &&
      getMeaningfulPlainText(altText).length > 0
    );
  });
}

export function hasMeaningfulRichText(value: string): boolean {
  return (
    getMeaningfulPlainText(value).length > 0 || hasAccessibleManagedImage(value)
  );
}

export function getMaterialIntegrityIssues(
  input: MaterialIntegrityInput,
): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [];

  if (getMeaningfulPlainText(input.title).length === 0) {
    issues.push({ field: "title", message: "请输入有效材料标题。" });
  }
  if (input.profession.trim().length === 0) {
    issues.push({ field: "profession", message: "请选择专业。" });
  }
  const level =
    typeof input.level === "number" ? input.level : Number(input.level);
  if (!Number.isInteger(level) || level <= 0) {
    issues.push({ field: "level", message: "请输入有效等级。" });
  }
  if (input.subject.trim().length === 0) {
    issues.push({ field: "subject", message: "请选择科目。" });
  }
  if (input.contentRichText.length > MAX_MATERIAL_RICH_TEXT_LENGTH) {
    issues.push({
      field: "contentRichText",
      message: "材料正文超过 30000 字符，不能保存。",
    });
  } else if (!hasMeaningfulRichText(input.contentRichText)) {
    issues.push({ field: "contentRichText", message: "请输入有效材料正文。" });
  }

  return issues;
}

function readStandardAnswerLabels(value: string): string[] {
  const plainText = getMeaningfulPlainText(value).toUpperCase();

  if (plainText === "正确" || plainText === "TRUE") {
    return ["A"];
  }

  if (plainText === "错误" || plainText === "FALSE") {
    return ["B"];
  }

  return Array.from(new Set(plainText.match(/[A-Z]/gu) ?? [])).sort();
}

function haveSameLabels(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((label, index) => label === right[index])
  );
}

function isPositiveHalfPointScore(value: number | string): boolean {
  const score = typeof value === "number" ? value : Number(value);

  return (
    Number.isFinite(score) && score > 0 && score * 2 === Math.round(score * 2)
  );
}

export function getQuestionIntegrityIssues(
  input: QuestionIntegrityInput,
): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [];
  const addIssue = (field: string, message: string) => {
    if (!issues.some((issue) => issue.field === field)) {
      issues.push({ field, message });
    }
  };

  if (input.questionType.trim().length === 0) {
    addIssue("questionType", "请选择题型。");
  }
  if (input.profession.trim().length === 0) {
    addIssue("profession", "请选择专业。");
  }
  const level =
    typeof input.level === "number" ? input.level : Number(input.level);
  if (!Number.isInteger(level) || level <= 0) {
    addIssue("level", "请输入有效等级。");
  }
  if (input.subject.trim().length === 0) {
    addIssue("subject", "请选择科目。");
  }

  const scoringContractIssues = getQuestionScoringContractIssues({
    questionType: input.questionType as QuestionType,
    scoringMethod: input.scoringMethod as ScoringMethod,
    multiChoiceRule: input.multiChoiceRule as MultiChoiceRule,
  });
  if (scoringContractIssues.includes("scoring_method_mismatch")) {
    addIssue("scoringMethod", "题型与评分方式不匹配。");
  }
  if (scoringContractIssues.includes("multi_choice_rule_mismatch")) {
    addIssue("multiChoiceRule", "只有多选题可以使用多选评分规则。");
  }
  if (!hasMeaningfulRichText(input.stemRichText)) {
    addIssue("stemRichText", "请输入有效题干。");
  } else if (input.stemRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH) {
    addIssue("stemRichText", "题干超过 10000 字符，不能保存。");
  }
  if (!hasMeaningfulRichText(input.standardAnswerRichText)) {
    addIssue("standardAnswerRichText", "请输入有效标准答案或参考答案。");
  }
  if (!hasMeaningfulRichText(input.analysisRichText)) {
    addIssue("analysisRichText", "请输入有效老师解析。");
  } else if (input.analysisRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH) {
    addIssue("analysisRichText", "解析超过 10000 字符，不能保存。");
  }

  const isOptionQuestion = [
    "single_choice",
    "multi_choice",
    "true_false",
  ].includes(input.questionType);

  if (isOptionQuestion) {
    if (input.questionOptions.length < 2) {
      addIssue("questionOptions", "客观题至少需要两个有效选项。");
    }

    const normalizedLabels = input.questionOptions.map((questionOption) =>
      questionOption.label.trim().toUpperCase(),
    );
    if (
      normalizedLabels.some((label) => label.length === 0) ||
      new Set(normalizedLabels).size !== normalizedLabels.length
    ) {
      addIssue("questionOptions", "选项标号必须非空且唯一。");
    }
    if (
      input.questionOptions.some(
        (questionOption) =>
          !hasMeaningfulRichText(questionOption.contentRichText),
      )
    ) {
      addIssue("questionOptions", "每个选项都必须包含有效内容。");
    }

    const correctLabels = input.questionOptions
      .filter((questionOption) => questionOption.isCorrect)
      .map((questionOption) => questionOption.label.trim().toUpperCase())
      .sort();
    const expectedCorrectCount = input.questionType === "multi_choice" ? 2 : 1;
    if (
      (input.questionType === "multi_choice" &&
        correctLabels.length < expectedCorrectCount) ||
      (input.questionType !== "multi_choice" && correctLabels.length !== 1)
    ) {
      addIssue(
        "questionOptions",
        input.questionType === "multi_choice"
          ? "多选题至少需要两个正确选项。"
          : "该题型必须且只能有一个正确选项。",
      );
    }

    if (
      !haveSameLabels(
        readStandardAnswerLabels(input.standardAnswerRichText),
        correctLabels,
      )
    ) {
      addIssue("standardAnswerRichText", "标准答案必须与正确选项一致。");
    }

    if (input.questionType === "true_false") {
      const trueFalseShape = input.questionOptions
        .map((questionOption) => ({
          content: getMeaningfulPlainText(questionOption.contentRichText),
          label: questionOption.label.trim().toUpperCase(),
        }))
        .sort((left, right) => left.label.localeCompare(right.label));
      if (
        trueFalseShape.length !== 2 ||
        trueFalseShape[0]?.label !== "A" ||
        trueFalseShape[0]?.content !== "正确" ||
        trueFalseShape[1]?.label !== "B" ||
        trueFalseShape[1]?.content !== "错误"
      ) {
        addIssue("questionOptions", "判断题必须使用 A.正确、B.错误。");
      }
    }
  } else if (input.questionOptions.length > 0) {
    addIssue("questionOptions", "非选择题不能提交选项。");
  }

  if (isOptionQuestion && input.scoringPoints.length > 0) {
    addIssue("scoringPoints", "客观题不能提交评分点。");
  }
  if (
    input.questionType === "fill_blank" &&
    input.scoringMethod === "auto_match" &&
    input.scoringPoints.length > 0
  ) {
    addIssue("scoringPoints", "自动匹配填空题不能提交 AI 评分点。");
  }

  if (
    input.questionType !== "fill_blank" &&
    input.fillBlankAnswers.length > 0
  ) {
    addIssue("fillBlankAnswers", "只有填空题可以提交逐空答案。");
  }
  if (
    input.questionType === "fill_blank" &&
    input.scoringMethod === "ai_scoring" &&
    input.fillBlankAnswers.length > 0
  ) {
    addIssue("fillBlankAnswers", "AI 评分填空题不能提交逐空匹配答案。");
  }
  if (
    input.questionType === "fill_blank" &&
    ((input.scoringMethod === "auto_match" &&
      input.fillBlankAnswers.length === 0) ||
      input.fillBlankAnswers.some(
        (fillBlankAnswer) =>
          fillBlankAnswer.standardAnswers.length === 0 ||
          fillBlankAnswer.standardAnswers.some(
            (answer) => getMeaningfulPlainText(answer).length === 0,
          ) ||
          !isPositiveHalfPointScore(fillBlankAnswer.score),
      ))
  ) {
    addIssue(
      "fillBlankAnswers",
      "逐空答案必须包含有效答案和正数、0.5 粒度的分值；自动匹配至少需要一空。",
    );
  }

  const requiresScoringPoints =
    ["short_answer", "case_analysis", "calculation"].includes(
      input.questionType,
    ) ||
    (input.questionType === "fill_blank" &&
      input.scoringMethod === "ai_scoring");
  if (requiresScoringPoints && input.scoringPoints.length === 0) {
    addIssue("scoringPoints", "该题型至少需要一个评分点。");
  }
  if (
    requiresScoringPoints &&
    input.scoringPoints.some(
      (scoringPoint) =>
        getMeaningfulPlainText(scoringPoint.description).length === 0 ||
        !isPositiveHalfPointScore(scoringPoint.score),
    )
  ) {
    addIssue(
      "scoringPoints",
      "评分点描述不能为空，分值必须为正数且以 0.5 为粒度。",
    );
  }

  return issues;
}
