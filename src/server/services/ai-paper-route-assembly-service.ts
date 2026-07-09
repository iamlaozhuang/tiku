import type {
  AiPaperAssemblyFailureCategory,
  AiPaperAssemblyPlanDto,
  AiPaperAssemblyPlanSectionDto,
  AiPaperAssemblyRole,
  AiPaperPlanAndSelectResult,
  AiPaperSelectableQuestionDto,
  AiPaperSourcePreference,
} from "../contracts/ai-paper-plan-and-select-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import type { Profession, QuestionType, Subject } from "../models/paper";
import { questionTypeValues } from "../models/paper";
import {
  assembleAiPaperFromPlan,
  validateAiPaperAssemblyPlan,
} from "./ai-paper-plan-and-select-service";

export type AiPaperRouteAssemblyFailureCategory =
  | "missing_visible_generated_content"
  | "unparsed_or_unacceptable_paper_plan"
  | AiPaperAssemblyFailureCategory;

export type AiPaperRouteAssemblyResult =
  | {
      status: "assembled";
      assembly: AiPaperPlanAndSelectResult;
      rejection: null;
    }
  | {
      status: "insufficient";
      assembly: AiPaperPlanAndSelectResult;
      rejection: null;
    }
  | {
      status: "rejected";
      assembly: null;
      rejection: {
        failureCategory: AiPaperRouteAssemblyFailureCategory;
      };
    };

export type AiPaperRouteAssemblyInput = {
  role: AiPaperAssemblyRole;
  organizationPublicId: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
  platformQuestions: AiPaperSelectableQuestionDto[];
  enterpriseQuestions: AiPaperSelectableQuestionDto[];
};

const allowedQuestionTypes = new Set<string>(questionTypeValues);

export function assembleAiPaperFromRouteVisiblePlan(
  input: AiPaperRouteAssemblyInput,
): AiPaperRouteAssemblyResult {
  const structuredPreview = input.visibleGeneratedContent?.structuredPreview;

  if (
    input.visibleGeneratedContent === null ||
    structuredPreview === undefined
  ) {
    return createRejectedRouteAssemblyResult(
      "missing_visible_generated_content",
    );
  }

  if (structuredPreview.kind !== "paper_draft") {
    return createRejectedRouteAssemblyResult(
      "unparsed_or_unacceptable_paper_plan",
    );
  }

  if (structuredPreview.parseStatus === "failed") {
    return createRejectedRouteAssemblyResult(
      structuredPreview.failureCategory ===
        "provider_question_content_forbidden"
        ? "provider_question_content_forbidden"
        : "unparsed_or_unacceptable_paper_plan",
    );
  }

  const parsedPlanContent = parseRoutePlanObject(
    input.visibleGeneratedContent.content,
  );
  const normalizedPlan =
    parsedPlanContent === null
      ? null
      : normalizeRoutePlan(parsedPlanContent, input.generationParameters);

  if (normalizedPlan === null) {
    return createRejectedRouteAssemblyResult("invalid_plan_shape");
  }

  const validationResult = validateAiPaperAssemblyPlan(normalizedPlan);

  if (!validationResult.accepted) {
    return createRejectedRouteAssemblyResult(validationResult.failureCategory);
  }

  const assembly = assembleAiPaperFromPlan({
    role: input.role,
    organizationPublicId: input.organizationPublicId,
    plan: normalizedPlan,
    platformQuestions: input.platformQuestions,
    enterpriseQuestions: input.enterpriseQuestions,
  });

  return {
    status: assembly.status,
    assembly,
    rejection: null,
  };
}

function normalizeRoutePlan(
  planContent: Record<string, unknown>,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): AiPaperAssemblyPlanDto | null {
  const sections = readArrayProperty(planContent, [
    "sections",
    "paperSections",
    "paper_sections",
  ]);

  if (sections === null || sections.length === 0) {
    return null;
  }

  const normalizedSections = sections
    .map((section, index) =>
      normalizeRoutePlanSection(section, index, generationParameters),
    )
    .filter(
      (section): section is AiPaperAssemblyPlanSectionDto => section !== null,
    );

  if (normalizedSections.length !== sections.length) {
    return null;
  }

  return {
    title: readNonEmptyString(planContent, ["title", "name"]) ?? "AI组卷方案",
    profession: generationParameters.profession as Profession,
    level: generationParameters.level,
    subject: generationParameters.subject as Subject,
    targetQuestionCount:
      readPositiveInteger(planContent, [
        "targetQuestionCount",
        "totalQuestionCount",
        "questionCount",
      ]) ?? generationParameters.questionCount,
    difficultyGoal:
      readNonEmptyString(planContent, ["difficultyGoal", "difficulty"]) ??
      generationParameters.difficulty,
    sourcePreference:
      readSourcePreference(planContent) ??
      generationParameters.sourcePreference,
    sections: normalizedSections,
    knowledgeCoverage: readKnowledgeCoverage(planContent, generationParameters),
  };
}

function normalizeRoutePlanSection(
  section: unknown,
  index: number,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): AiPaperAssemblyPlanSectionDto | null {
  if (!isRecord(section)) {
    return null;
  }

  const questionType = normalizeQuestionType(
    readNonEmptyString(section, [
      "questionType",
      "question_type",
      "paperSectionType",
      "paper_section_type",
      "type",
    ]),
  );
  const targetQuestionCount = readPositiveInteger(section, [
    "targetQuestionCount",
    "questionCount",
    "question_count",
  ]);
  const targetScore =
    readPositiveNumber(section, ["targetScore", "score"]) ?? 1;

  if (questionType === null || targetQuestionCount === null) {
    return null;
  }

  const knowledgeNodePublicIds = readStringArray(section, [
    "knowledgeNodePublicIds",
    "knowledge_node_public_ids",
  ]);

  return {
    sectionKey:
      readNonEmptyString(section, ["sectionKey", "section_key", "key"]) ??
      `section_${index + 1}`,
    title:
      readNonEmptyString(section, ["title", "name"]) ??
      `Paper section ${index + 1}`,
    questionType,
    targetQuestionCount,
    targetScore,
    knowledgeNodePublicIds:
      knowledgeNodePublicIds.length > 0
        ? knowledgeNodePublicIds
        : [...generationParameters.knowledgeNodePublicIds],
    parentKnowledgeNodePublicIds: readStringArray(section, [
      "parentKnowledgeNodePublicIds",
      "parent_knowledge_node_public_ids",
    ]),
    difficulty:
      readNonEmptyString(section, ["difficulty"]) ??
      generationParameters.difficulty,
  };
}

function readKnowledgeCoverage(
  planContent: Record<string, unknown>,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): AiPaperAssemblyPlanDto["knowledgeCoverage"] {
  const knowledgeCoverage = readRecordProperty(planContent, [
    "knowledgeCoverage",
    "knowledge_coverage",
  ]);

  if (knowledgeCoverage === null) {
    return {
      targetKnowledgeNodePublicIds: [
        ...generationParameters.knowledgeNodePublicIds,
      ],
      targetParentKnowledgeNodePublicIds: [],
    };
  }

  const targetKnowledgeNodePublicIds = readStringArray(knowledgeCoverage, [
    "targetKnowledgeNodePublicIds",
    "knowledgeNodePublicIds",
    "knowledge_node_public_ids",
  ]);

  return {
    targetKnowledgeNodePublicIds:
      targetKnowledgeNodePublicIds.length > 0
        ? targetKnowledgeNodePublicIds
        : [...generationParameters.knowledgeNodePublicIds],
    targetParentKnowledgeNodePublicIds: readStringArray(knowledgeCoverage, [
      "targetParentKnowledgeNodePublicIds",
      "parentKnowledgeNodePublicIds",
      "parent_knowledge_node_public_ids",
    ]),
  };
}

function readSourcePreference(
  planContent: Record<string, unknown>,
): AiPaperSourcePreference | null {
  const sourcePreference = readNonEmptyString(planContent, [
    "sourcePreference",
    "source_preference",
  ]);

  return sourcePreference === "balanced" ||
    sourcePreference === "prefer_platform" ||
    sourcePreference === "prefer_enterprise"
    ? sourcePreference
    : null;
}

function normalizeQuestionType(value: string | null): QuestionType | null {
  const normalizedValue = value === "judge" ? "true_false" : value;

  return normalizedValue !== null && allowedQuestionTypes.has(normalizedValue)
    ? (normalizedValue as QuestionType)
    : null;
}

function parseRoutePlanObject(content: string): Record<string, unknown> | null {
  const directParsedPlan = parseJsonObject(content);

  if (directParsedPlan !== null) {
    return directParsedPlan;
  }

  const objectSlice = extractJsonObjectSlice(content);

  return objectSlice === null ? null : parseJsonObject(objectSlice);
}

function parseJsonObject(content: string): Record<string, unknown> | null {
  try {
    const parsedValue: unknown = JSON.parse(content);

    return isRecord(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function extractJsonObjectSlice(content: string): string | null {
  const openingBraceIndex = content.indexOf("{");
  const closingBraceIndex = content.lastIndexOf("}");

  return openingBraceIndex >= 0 && closingBraceIndex > openingBraceIndex
    ? content.slice(openingBraceIndex, closingBraceIndex + 1)
    : null;
}

function readArrayProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): unknown[] | null {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function readRecordProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = source[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function readNonEmptyString(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value !== "string") {
      continue;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length > 0) {
      return normalizedValue;
    }
  }

  return null;
}

function readStringArray(
  source: Record<string, unknown>,
  keys: readonly string[],
): string[] {
  for (const key of keys) {
    const value = source[key];

    if (!Array.isArray(value)) {
      continue;
    }

    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function readPositiveInteger(
  source: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = source[key];
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number.parseInt(value, 10)
          : null;

    if (
      numericValue !== null &&
      Number.isInteger(numericValue) &&
      numericValue > 0
    ) {
      return numericValue;
    }
  }

  return null;
}

function readPositiveNumber(
  source: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return null;
}

function createRejectedRouteAssemblyResult(
  failureCategory: AiPaperRouteAssemblyFailureCategory,
): AiPaperRouteAssemblyResult {
  return {
    status: "rejected",
    assembly: null,
    rejection: {
      failureCategory,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
