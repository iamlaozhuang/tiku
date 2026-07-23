import {
  AI_PAPER_DEFAULT_TARGET_QUESTION_COUNT,
  AI_PAPER_MAX_TARGET_QUESTION_COUNT,
  type AiPaperAssemblyPlanDto,
  type AiPaperAssemblyPlanSectionDto,
  type AiPaperAssemblyPlanValidationResult,
  type AiPaperMatchQuality,
  type AiPaperMatchTier,
  type AiPaperPlanAndSelectContainerDto,
  type AiPaperPlanAndSelectInput,
  type AiPaperPlanAndSelectResult,
  type AiPaperPlanAndSelectSectionDto,
  type AiPaperQuestionSourceKind,
  type AiPaperSourcePreference,
  type AiPaperSelectableQuestionDto,
  type AiPaperSelectedQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";

export {
  AI_PAPER_DEFAULT_TARGET_QUESTION_COUNT,
  AI_PAPER_MAX_TARGET_QUESTION_COUNT,
};

const forbiddenProviderQuestionContentKeys = new Set([
  "questions",
  "questionDrafts",
  "question_drafts",
  "questionStem",
  "question_stem",
  "stem",
  "questionOptions",
  "question_options",
  "options",
  "standardAnswer",
  "standard_answer",
  "answer",
  "answers",
  "analysis",
  "scoringPoints",
  "scoring_points",
]);

type AiPaperSelectionState = {
  selectedPublicIds: Set<string>;
  enterpriseQuestionCount: number;
  platformQuestionCount: number;
};

export function validateAiPaperAssemblyPlan(
  input: unknown,
): AiPaperAssemblyPlanValidationResult {
  if (!isRecord(input)) {
    return {
      accepted: false,
      failureCategory: "invalid_plan_shape",
    };
  }

  if (containsForbiddenProviderQuestionContent(input)) {
    return {
      accepted: false,
      failureCategory: "provider_question_content_forbidden",
    };
  }

  if (
    !isValidTargetQuestionCount(getRecordNumber(input, "targetQuestionCount"))
  ) {
    return {
      accepted: false,
      failureCategory: "target_count_out_of_range",
    };
  }

  if (!isValidPlanShape(input)) {
    return {
      accepted: false,
      failureCategory: "invalid_plan_shape",
    };
  }

  if (!hasMatchingSectionQuestionCount(input)) {
    return {
      accepted: false,
      failureCategory: "section_count_mismatch",
    };
  }

  return {
    accepted: true,
    failureCategory: null,
  };
}

export function assembleAiPaperFromPlan(
  input: AiPaperPlanAndSelectInput,
): AiPaperPlanAndSelectResult {
  const sections = assembleSections(input);
  const selectedQuestions = sections.flatMap((section) =>
    section.selectedQuestions.map((question) => question),
  );
  const sourceComposition = summarizeSourceComposition(selectedQuestions);
  const container: AiPaperPlanAndSelectContainerDto = {
    title: input.plan.title,
    profession: input.plan.profession,
    level: input.plan.level,
    subject: input.plan.subject,
    requestedQuestionCount: input.plan.targetQuestionCount,
    selectedQuestionCount: selectedQuestions.length,
    sourceComposition,
    matchQuality: resolveMatchQuality(
      selectedQuestions,
      input.plan.targetQuestionCount,
    ),
    constraintLineage: {
      request: {
        difficulty:
          input.plan.requestConstraints?.difficulty ??
          input.plan.difficultyGoal,
        knowledgeNodePublicIds: [
          ...(input.plan.requestConstraints?.knowledgeNodePublicIds ??
            input.plan.knowledgeCoverage.targetKnowledgeNodePublicIds),
        ],
      },
      plan: {
        difficulty: input.plan.difficultyGoal,
        knowledgeNodePublicIds: [
          ...input.plan.knowledgeCoverage.targetKnowledgeNodePublicIds,
        ],
        parentKnowledgeNodePublicIds: [
          ...input.plan.knowledgeCoverage.targetParentKnowledgeNodePublicIds,
        ],
      },
    },
    sections,
  };
  const missingQuestionCount = Math.max(
    input.plan.targetQuestionCount - selectedQuestions.length,
    0,
  );

  return {
    status: missingQuestionCount === 0 ? "assembled" : "insufficient",
    container,
    insufficiency:
      missingQuestionCount === 0
        ? null
        : {
            requestedQuestionCount: input.plan.targetQuestionCount,
            selectedQuestionCount: selectedQuestions.length,
            missingQuestionCount,
            failureCategory: "insufficient_formal_question_source",
          },
  };
}

function assembleSections(
  input: AiPaperPlanAndSelectInput,
): AiPaperPlanAndSelectSectionDto[] {
  const selectionState = {
    selectedPublicIds: new Set<string>(),
    enterpriseQuestionCount: 0,
    platformQuestionCount: 0,
  };
  const candidates = createEligibleCandidates(input);

  return input.plan.sections.map((section) => {
    const selectedQuestions = selectQuestionsForSection(
      section,
      candidates,
      selectionState,
      input.plan.sourcePreference,
    );

    return {
      sectionKey: section.sectionKey,
      title: section.title,
      questionType: section.questionType,
      targetQuestionCount: section.targetQuestionCount,
      selectedQuestionCount: selectedQuestions.length,
      selectedQuestions,
      degradationSummary: {
        exactCount: countMatchTier(selectedQuestions, "exact"),
        ...(countMatchTier(selectedQuestions, "descendant") === 0
          ? {}
          : {
              descendantCount: countMatchTier(selectedQuestions, "descendant"),
            }),
        nearbyKnowledgeCount: countMatchTier(
          selectedQuestions,
          "nearby_knowledge",
        ),
        sameScopeCount: countMatchTier(selectedQuestions, "same_scope"),
      },
    };
  });
}

function createEligibleCandidates(
  input: AiPaperPlanAndSelectInput,
): AiPaperSelectableQuestionDto[] {
  const platformQuestions = input.platformQuestions.filter((question) =>
    isEligiblePlatformQuestion(question, input.plan),
  );
  const enterpriseQuestions = canUseEnterpriseQuestions(input)
    ? input.enterpriseQuestions.filter((question) =>
        isEligibleEnterpriseQuestion(question, input),
      )
    : [];

  const orderedCandidates =
    input.plan.sourcePreference === "prefer_enterprise"
      ? [...enterpriseQuestions, ...platformQuestions]
      : [...platformQuestions, ...enterpriseQuestions];
  const seenPublicIds = new Set<string>();

  return orderedCandidates.filter((question) => {
    if (seenPublicIds.has(question.publicId)) {
      return false;
    }

    seenPublicIds.add(question.publicId);
    return true;
  });
}

function selectQuestionsForSection(
  section: AiPaperAssemblyPlanSectionDto,
  candidates: AiPaperSelectableQuestionDto[],
  selectionState: AiPaperSelectionState,
  sourcePreference: AiPaperSourcePreference | null,
): AiPaperSelectedQuestionDto[] {
  const selectedQuestions: AiPaperSelectedQuestionDto[] = [];

  for (const matchTier of [
    "exact",
    "descendant",
    "nearby_knowledge",
    "same_scope",
  ] as const) {
    while (selectedQuestions.length < section.targetQuestionCount) {
      const candidate = selectNextCandidate({
        candidates,
        matchTier,
        section,
        selectionState,
        sourcePreference,
      });

      if (candidate === null) {
        break;
      }

      selectionState.selectedPublicIds.add(candidate.publicId);
      if (candidate.sourceKind === "enterprise_training_snapshot") {
        selectionState.enterpriseQuestionCount += 1;
      } else {
        selectionState.platformQuestionCount += 1;
      }
      selectedQuestions.push({
        questionPublicId: candidate.publicId,
        sourceKind: candidate.sourceKind as Exclude<
          AiPaperQuestionSourceKind,
          "ai_generated_draft"
        >,
        matchTier,
        score: section.targetScore,
        constraintMatchBasis: {
          difficulty: candidate.difficulty,
          knowledgeNodePublicIds: [...candidate.knowledgeNodePublicIds],
          parentKnowledgeNodePublicIds: [
            ...candidate.parentKnowledgeNodePublicIds,
          ],
          ancestorKnowledgeNodePublicIds: [
            ...(candidate.ancestorKnowledgeNodePublicIds ?? []),
          ],
          matchTier,
        },
      });
    }
  }

  return selectedQuestions;
}

function selectNextCandidate({
  candidates,
  matchTier,
  section,
  selectionState,
  sourcePreference,
}: {
  candidates: AiPaperSelectableQuestionDto[];
  matchTier: AiPaperMatchTier;
  section: AiPaperAssemblyPlanSectionDto;
  selectionState: AiPaperSelectionState;
  sourcePreference: AiPaperSourcePreference | null;
}): AiPaperSelectableQuestionDto | null {
  const eligibleCandidates = candidates.filter(
    (candidate) =>
      !selectionState.selectedPublicIds.has(candidate.publicId) &&
      matchesSection(candidate, section, matchTier),
  );

  if (eligibleCandidates.length === 0) {
    return null;
  }

  const preferredSourceKind = resolvePreferredSourceKind(
    sourcePreference,
    selectionState,
  );

  return (
    eligibleCandidates.find(
      (candidate) => candidate.sourceKind === preferredSourceKind,
    ) ??
    eligibleCandidates[0] ??
    null
  );
}

function resolvePreferredSourceKind(
  sourcePreference: AiPaperSourcePreference | null,
  selectionState: AiPaperSelectionState,
): Exclude<AiPaperQuestionSourceKind, "ai_generated_draft"> {
  if (sourcePreference === "prefer_enterprise") {
    return "enterprise_training_snapshot";
  }

  if (
    sourcePreference === "balanced" &&
    selectionState.enterpriseQuestionCount <
      selectionState.platformQuestionCount
  ) {
    return "enterprise_training_snapshot";
  }

  return "platform_formal_question";
}

function matchesSection(
  question: AiPaperSelectableQuestionDto,
  section: AiPaperAssemblyPlanSectionDto,
  matchTier: AiPaperMatchTier,
): boolean {
  if (question.questionType !== section.questionType) {
    return false;
  }

  if (matchTier === "same_scope") {
    return true;
  }

  if (question.difficulty === null) {
    return false;
  }

  if (matchTier === "nearby_knowledge") {
    return intersects(
      question.parentKnowledgeNodePublicIds,
      section.parentKnowledgeNodePublicIds,
    );
  }

  if (matchTier === "descendant") {
    return (
      matchesExactDifficulty(question, section) &&
      intersects(
        question.ancestorKnowledgeNodePublicIds ?? [],
        section.knowledgeNodePublicIds,
      )
    );
  }

  return (
    matchesExactDifficulty(question, section) &&
    intersects(question.knowledgeNodePublicIds, section.knowledgeNodePublicIds)
  );
}

function isEligiblePlatformQuestion(
  question: AiPaperSelectableQuestionDto,
  plan: AiPaperAssemblyPlanDto,
): boolean {
  return (
    question.sourceKind === "platform_formal_question" &&
    question.status === "available" &&
    matchesPlanScope(question, plan)
  );
}

function isEligibleEnterpriseQuestion(
  question: AiPaperSelectableQuestionDto,
  input: AiPaperPlanAndSelectInput,
): boolean {
  return (
    question.sourceKind === "enterprise_training_snapshot" &&
    question.status === "published" &&
    question.organizationPublicId === input.organizationPublicId &&
    matchesPlanScope(question, input.plan)
  );
}

function canUseEnterpriseQuestions(input: AiPaperPlanAndSelectInput): boolean {
  return (
    input.organizationPublicId !== null &&
    (input.role === "org_advanced_employee" ||
      input.role === "org_advanced_admin")
  );
}

function matchesPlanScope(
  question: AiPaperSelectableQuestionDto,
  plan: AiPaperAssemblyPlanDto,
): boolean {
  return (
    question.profession === plan.profession &&
    question.level === plan.level &&
    question.subject === plan.subject
  );
}

function matchesExactDifficulty(
  question: AiPaperSelectableQuestionDto,
  section: AiPaperAssemblyPlanSectionDto,
): boolean {
  return (
    section.difficulty !== null && question.difficulty === section.difficulty
  );
}

function summarizeSourceComposition(
  selectedQuestions: AiPaperSelectedQuestionDto[],
): AiPaperPlanAndSelectContainerDto["sourceComposition"] {
  return {
    platformFormalQuestionCount: selectedQuestions.filter(
      (question) => question.sourceKind === "platform_formal_question",
    ).length,
    enterpriseTrainingSnapshotCount: selectedQuestions.filter(
      (question) => question.sourceKind === "enterprise_training_snapshot",
    ).length,
  };
}

function resolveMatchQuality(
  selectedQuestions: AiPaperSelectedQuestionDto[],
  requestedQuestionCount: number,
): AiPaperMatchQuality {
  if (selectedQuestions.length < requestedQuestionCount) {
    return "insufficient";
  }

  if (
    selectedQuestions.some((question) => question.matchTier === "same_scope")
  ) {
    return "supplemented_from_same_scope";
  }

  if (
    selectedQuestions.some(
      (question) => question.matchTier === "nearby_knowledge",
    )
  ) {
    return "supplemented_from_nearby_knowledge";
  }

  if (
    selectedQuestions.some((question) => question.matchTier === "descendant")
  ) {
    return "supplemented_from_nearby_knowledge";
  }

  return "fully_matched";
}

function countMatchTier(
  selectedQuestions: AiPaperSelectedQuestionDto[],
  matchTier: AiPaperMatchTier,
): number {
  return selectedQuestions.filter(
    (question) => question.matchTier === matchTier,
  ).length;
}

function intersects(left: string[], right: string[]): boolean {
  if (right.length === 0) {
    return false;
  }

  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

function isValidTargetQuestionCount(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= AI_PAPER_MAX_TARGET_QUESTION_COUNT
  );
}

function isValidPlanShape(input: Record<string, unknown>): boolean {
  const sections = input.sections;

  return (
    typeof input.title === "string" &&
    input.title.trim().length > 0 &&
    typeof input.profession === "string" &&
    typeof input.level === "number" &&
    typeof input.subject === "string" &&
    Array.isArray(sections) &&
    sections.length > 0 &&
    sections.every(isValidPlanSectionShape)
  );
}

function isValidPlanSectionShape(input: unknown): boolean {
  if (!isRecord(input)) {
    return false;
  }

  return (
    typeof input.sectionKey === "string" &&
    input.sectionKey.trim().length > 0 &&
    typeof input.title === "string" &&
    input.title.trim().length > 0 &&
    typeof input.questionType === "string" &&
    isValidTargetQuestionCount(input.targetQuestionCount) &&
    typeof input.targetScore === "number" &&
    input.targetScore > 0 &&
    Array.isArray(input.knowledgeNodePublicIds) &&
    Array.isArray(input.parentKnowledgeNodePublicIds)
  );
}

function hasMatchingSectionQuestionCount(
  input: Record<string, unknown>,
): boolean {
  const sections = input.sections;

  if (!Array.isArray(sections)) {
    return false;
  }

  const sectionTargetTotal = sections.reduce((total, section) => {
    if (!isRecord(section) || typeof section.targetQuestionCount !== "number") {
      return total;
    }

    return total + section.targetQuestionCount;
  }, 0);

  return sectionTargetTotal === input.targetQuestionCount;
}

function containsForbiddenProviderQuestionContent(input: unknown): boolean {
  if (Array.isArray(input)) {
    return input.some(containsForbiddenProviderQuestionContent);
  }

  if (!isRecord(input)) {
    return false;
  }

  return Object.entries(input).some(([key, value]) => {
    return (
      forbiddenProviderQuestionContentKeys.has(key) ||
      containsForbiddenProviderQuestionContent(value)
    );
  });
}

function getRecordNumber(
  input: Record<string, unknown>,
  key: string,
): number | null {
  return typeof input[key] === "number" ? input[key] : null;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}
