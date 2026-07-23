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

  if (parsedPlanContent === null) {
    return createRejectedRouteAssemblyResult("invalid_plan_shape");
  }

  if (
    !isRoutePlanSectionContractCompatible(
      parsedPlanContent,
      input.generationParameters,
    )
  ) {
    return createRejectedRouteAssemblyResult("invalid_plan_shape");
  }

  const normalizedPlan = normalizeRoutePlan(
    parsedPlanContent,
    input.generationParameters,
  );

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

  const knowledgeCoverage = readKnowledgeCoverage(
    planContent,
    generationParameters,
  );

  const normalizedSections = sections
    .map((section, index) =>
      normalizeRoutePlanSection(
        section,
        index,
        generationParameters,
        knowledgeCoverage.targetKnowledgeNodePublicIds,
      ),
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
    difficultyGoal: generationParameters.difficulty,
    sourcePreference:
      readSourcePreference(planContent) ??
      generationParameters.sourcePreference,
    sections: normalizedSections,
    knowledgeCoverage,
    requestConstraints: {
      difficulty: generationParameters.difficulty,
      knowledgeNodePublicIds: [...generationParameters.knowledgeNodePublicIds],
    },
  };
}

function normalizeRoutePlanSection(
  section: unknown,
  index: number,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
  planKnowledgeNodePublicIds: readonly string[],
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
        : [...planKnowledgeNodePublicIds],
    parentKnowledgeNodePublicIds: [],
    difficulty: generationParameters.difficulty,
  };
}

function isRoutePlanSectionContractCompatible(
  planContent: Record<string, unknown>,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): boolean {
  const sections = readArrayProperty(planContent, [
    "sections",
    "paperSections",
    "paper_sections",
  ]);

  if (sections === null || sections.length === 0) {
    return false;
  }

  const targetQuestionCount =
    readPositiveInteger(planContent, [
      "targetQuestionCount",
      "totalQuestionCount",
      "questionCount",
    ]) ?? generationParameters.questionCount;

  return (
    isRoutePlanConstraintCompatible(
      sections,
      planContent,
      generationParameters,
    ) &&
    areRoutePlanSectionsCompatibleWithStructure(
      sections,
      generationParameters.paperStructure ?? null,
    ) &&
    areRoutePlanSectionsCompatibleWithQuestionTypeDistribution(
      sections,
      generationParameters.questionTypeDistribution ?? null,
      targetQuestionCount,
    )
  );
}

function isRoutePlanConstraintCompatible(
  sections: readonly unknown[],
  planContent: Record<string, unknown>,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): boolean {
  const planDifficulty = readOptionalNonEmptyString(planContent, [
    "difficultyGoal",
    "difficulty_goal",
    "difficulty",
  ]);
  if (
    !planDifficulty.valid ||
    (planDifficulty.present &&
      planDifficulty.value !== generationParameters.difficulty)
  ) {
    return false;
  }

  const coverage = readStrictKnowledgeCoverage(planContent);
  if (
    !coverage.valid ||
    coverage.parentKnowledgeNodePublicIds.length > 0 ||
    !isKnowledgeScopeSubset(
      coverage.knowledgeNodePublicIds,
      generationParameters.knowledgeNodePublicIds,
    )
  ) {
    return false;
  }
  const effectivePlanKnowledgeNodePublicIds =
    coverage.knowledgeNodePublicIds.length > 0
      ? coverage.knowledgeNodePublicIds
      : generationParameters.knowledgeNodePublicIds;

  return sections.every((section) => {
    if (!isRecord(section)) {
      return false;
    }

    const sectionDifficulty = readOptionalNonEmptyString(section, [
      "difficulty",
    ]);
    const sectionScope = readStrictStringArrayProperty(section, [
      "knowledgeNodePublicIds",
      "knowledge_node_public_ids",
    ]);
    const sectionParentScope = readStrictStringArrayProperty(section, [
      "parentKnowledgeNodePublicIds",
      "parent_knowledge_node_public_ids",
    ]);

    return (
      sectionDifficulty.valid &&
      (!sectionDifficulty.present ||
        sectionDifficulty.value === generationParameters.difficulty) &&
      sectionScope.valid &&
      sectionParentScope.valid &&
      sectionParentScope.values.length === 0 &&
      isKnowledgeScopeSubset(
        sectionScope.values,
        effectivePlanKnowledgeNodePublicIds,
      )
    );
  });
}

function areRoutePlanSectionsCompatibleWithQuestionTypeDistribution(
  sections: readonly unknown[],
  questionTypeDistribution:
    | AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"]
    | null,
  questionCount: number,
): boolean {
  if (
    questionTypeDistribution === null ||
    questionTypeDistribution === undefined ||
    questionTypeDistribution === "weak_point_priority"
  ) {
    return true;
  }

  const expectedCounts = createExpectedRoutePlanQuestionTypeCounts(
    questionTypeDistribution,
    questionCount,
  );

  if (expectedCounts === null) {
    return true;
  }

  const actualCounts = readRoutePlanSectionQuestionTypeCounts(sections);

  if (actualCounts === null) {
    return true;
  }

  for (const [questionType, expectedCount] of expectedCounts) {
    if ((actualCounts.get(questionType) ?? 0) !== expectedCount) {
      return false;
    }
  }

  for (const [questionType, actualCount] of actualCounts) {
    if (!expectedCounts.has(questionType) && actualCount > 0) {
      return false;
    }
  }

  return true;
}

function createExpectedRoutePlanQuestionTypeCounts(
  questionTypeDistribution: NonNullable<
    AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"]
  >,
  questionCount: number,
): Map<QuestionType, number> | null {
  const ratios: Array<readonly [QuestionType, number]> | null =
    questionTypeDistribution === "balanced_40_30_30"
      ? [
          ["single_choice", 40],
          ["multi_choice", 30],
          ["true_false", 30],
        ]
      : questionTypeDistribution === "single_50_multi_25_true_false_25"
        ? [
            ["single_choice", 50],
            ["multi_choice", 25],
            ["true_false", 25],
          ]
        : null;

  if (ratios === null) {
    return null;
  }

  const ratioTotal = ratios.reduce((total, [, ratio]) => total + ratio, 0);
  const counts = ratios.map(([questionType, ratio], index) => {
    const exactCount = (questionCount * ratio) / ratioTotal;

    return {
      questionType: questionType as QuestionType,
      count: Math.floor(exactCount),
      remainder: exactCount - Math.floor(exactCount),
      index,
    };
  });
  let remainingCount =
    questionCount - counts.reduce((total, item) => total + item.count, 0);

  for (const item of [...counts].sort(
    (first, second) =>
      second.remainder - first.remainder || first.index - second.index,
  )) {
    if (remainingCount <= 0) {
      break;
    }

    item.count += 1;
    remainingCount -= 1;
  }

  return new Map(counts.map((item) => [item.questionType, item.count]));
}

function readRoutePlanSectionQuestionTypeCounts(
  sections: readonly unknown[],
): Map<QuestionType, number> | null {
  const counts = new Map<QuestionType, number>();

  for (const section of sections) {
    if (!isRecord(section)) {
      return null;
    }

    const questionType = readRoutePlanSectionQuestionType(section);
    const questionCount = readPositiveInteger(section, [
      "targetQuestionCount",
      "questionCount",
      "question_count",
    ]);

    if (questionType === null || questionCount === null) {
      return null;
    }

    counts.set(questionType, (counts.get(questionType) ?? 0) + questionCount);
  }

  return counts;
}

function areRoutePlanSectionsCompatibleWithStructure(
  sections: readonly unknown[],
  paperStructure:
    | AiGenerationRouteIntegratedGenerationParameters["paperStructure"]
    | null,
): boolean {
  if (paperStructure === null || paperStructure === undefined) {
    return true;
  }

  if (paperStructure === "by_question_type") {
    return sections.every((section) => {
      if (!isRecord(section)) {
        return false;
      }

      const questionType = readRoutePlanSectionQuestionType(section);
      const questionTypes = readRoutePlanSectionQuestionTypes(section);

      return (
        questionType !== null &&
        questionTypes.length <= 1 &&
        (questionTypes.length === 0 || questionTypes[0] === questionType)
      );
    });
  }

  if (paperStructure === "by_knowledge_node") {
    return sections.every(
      (section) =>
        isRecord(section) && hasExplicitRoutePlanSectionKnowledgeScope(section),
    );
  }

  return true;
}

function readRoutePlanSectionQuestionType(
  section: Record<string, unknown>,
): QuestionType | null {
  return normalizeQuestionType(
    readNonEmptyString(section, [
      "questionType",
      "question_type",
      "paperSectionType",
      "paper_section_type",
      "type",
    ]),
  );
}

function readRoutePlanSectionQuestionTypes(
  section: Record<string, unknown>,
): QuestionType[] {
  const questionTypes = readStringArray(section, [
    "questionTypes",
    "question_types",
    "questionTypeList",
    "question_type_list",
  ])
    .map(normalizeQuestionType)
    .filter(
      (questionType): questionType is QuestionType => questionType !== null,
    );

  return Array.from(new Set(questionTypes));
}

function hasExplicitRoutePlanSectionKnowledgeScope(
  section: Record<string, unknown>,
): boolean {
  return (
    readStringArray(section, [
      "knowledgeNodePublicIds",
      "knowledge_node_public_ids",
    ]).length > 0
  );
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
    targetParentKnowledgeNodePublicIds: [],
  };
}

function readOptionalNonEmptyString(
  source: Record<string, unknown>,
  keys: readonly string[],
): { present: boolean; valid: boolean; value: string | null } {
  for (const key of keys) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (typeof value !== "string") {
      return { present: true, valid: false, value: null };
    }

    const normalizedValue = value.trim();
    return {
      present: true,
      valid: normalizedValue.length > 0,
      value: normalizedValue.length > 0 ? normalizedValue : null,
    };
  }

  return { present: false, valid: true, value: null };
}

function readStrictStringArrayProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): { present: boolean; valid: boolean; values: string[] } {
  for (const key of keys) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (!Array.isArray(value)) {
      return { present: true, valid: false, values: [] };
    }

    const values: string[] = [];
    const canonicalValues = new Set<string>();
    for (const item of value) {
      if (typeof item !== "string") {
        return { present: true, valid: false, values: [] };
      }

      const normalizedValue = item.trim();
      const canonicalValue = normalizedValue.normalize("NFKC").toLowerCase();
      if (normalizedValue.length === 0 || canonicalValues.has(canonicalValue)) {
        return { present: true, valid: false, values: [] };
      }
      canonicalValues.add(canonicalValue);
      values.push(normalizedValue);
    }

    return { present: true, valid: true, values };
  }

  return { present: false, valid: true, values: [] };
}

function readStrictKnowledgeCoverage(planContent: Record<string, unknown>): {
  valid: boolean;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
} {
  const coverage =
    planContent.knowledgeCoverage ?? planContent.knowledge_coverage;
  if (coverage === undefined) {
    return {
      valid: true,
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
    };
  }

  if (Array.isArray(coverage)) {
    const scope = readStrictStringArrayProperty({ values: coverage }, [
      "values",
    ]);
    return {
      valid: scope.valid,
      knowledgeNodePublicIds: scope.values,
      parentKnowledgeNodePublicIds: [],
    };
  }

  if (!isRecord(coverage)) {
    return {
      valid: false,
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
    };
  }

  const scope = readStrictStringArrayProperty(coverage, [
    "targetKnowledgeNodePublicIds",
    "knowledgeNodePublicIds",
    "knowledge_node_public_ids",
  ]);
  const parentScope = readStrictStringArrayProperty(coverage, [
    "targetParentKnowledgeNodePublicIds",
    "parentKnowledgeNodePublicIds",
    "parent_knowledge_node_public_ids",
  ]);
  return {
    valid: scope.valid && parentScope.valid,
    knowledgeNodePublicIds: scope.values,
    parentKnowledgeNodePublicIds: parentScope.values,
  };
}

function isKnowledgeScopeSubset(
  candidatePublicIds: readonly string[],
  requestedPublicIds: readonly string[],
): boolean {
  const requested = new Set(requestedPublicIds);
  return candidatePublicIds.every((publicId) => requested.has(publicId));
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
