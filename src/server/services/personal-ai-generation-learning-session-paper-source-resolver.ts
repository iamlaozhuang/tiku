import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperSelectedQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type { PersonalAiGenerationLearningPaperSourceQuestionDto } from "../contracts/personal-ai-generation-learning-session-contract";
import type { PersonalAiGenerationLearningSessionQuestionType } from "../models/personal-ai-generation-learning-session";
import type { OrganizationTrainingQuestionSnapshotValue } from "@/db/schema";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type {
  AiPaperQuestionSourceRepository,
  QuestionAccessRow,
} from "../repositories/question-repository";
import type {
  PersonalAiGenerationLearningPaperSourceQuestionResolver,
  PersonalAiGenerationLearningPaperSourceQuestionResolverInput,
} from "./personal-ai-generation-learning-session-route";

const supportedQuestionTypes = new Set<string>([
  "single_choice",
  "multi_choice",
  "true_false",
  "short_answer",
]);

export function createPersonalAiGenerationLearningSessionPaperSourceResolver(input: {
  questionRepository: AiPaperQuestionSourceRepository;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listEmployeeVisibleQuestionSnapshotsForAiPaperSource"
  >;
}): PersonalAiGenerationLearningPaperSourceQuestionResolver {
  return async (resolverInput) => {
    const selectedQuestions = collectSelectedQuestions(
      resolverInput.paperAssemblyContainer,
    );
    const platformSourceQuestions = await resolvePlatformSourceQuestions({
      resolverInput,
      questionRepository: input.questionRepository,
    });
    const enterpriseSourceQuestions = await resolveEnterpriseSourceQuestions({
      resolverInput,
      organizationTrainingRepository: input.organizationTrainingRepository,
    });
    const sourceQuestionByKey = new Map(
      [...platformSourceQuestions, ...enterpriseSourceQuestions].map(
        (sourceQuestion) => [
          createSelectedQuestionKey(sourceQuestion),
          sourceQuestion,
        ],
      ),
    );

    const resolvedQuestions = selectedQuestions
      .map((selectedQuestion) =>
        sourceQuestionByKey.get(createSelectedQuestionKey(selectedQuestion)),
      )
      .filter(
        (
          sourceQuestion,
        ): sourceQuestion is PersonalAiGenerationLearningPaperSourceQuestionDto =>
          sourceQuestion !== undefined,
      );

    return filterIncompleteResolvedQuestionGroups(
      selectedQuestions,
      resolvedQuestions,
    );
  };
}

function filterIncompleteResolvedQuestionGroups(
  selectedQuestions: ReturnType<typeof collectSelectedQuestions>,
  resolvedQuestions: PersonalAiGenerationLearningPaperSourceQuestionDto[],
): PersonalAiGenerationLearningPaperSourceQuestionDto[] {
  const resolvedKeys = new Set(
    resolvedQuestions.map((question) => createSelectedQuestionKey(question)),
  );
  const invalidGroupPublicIds = new Set<string>();

  for (const selectedQuestion of selectedQuestions) {
    const group = selectedQuestion.questionGroup;

    if (
      group !== null &&
      group !== undefined &&
      group.memberQuestionPublicIds.some(
        (questionPublicId) =>
          !resolvedKeys.has(
            createSelectedQuestionKey({
              sourceKind: selectedQuestion.sourceKind,
              questionPublicId,
            }),
          ),
      )
    ) {
      invalidGroupPublicIds.add(group.publicId);
    }
  }

  return resolvedQuestions.filter(
    (question) =>
      question.questionGroup === null ||
      question.questionGroup === undefined ||
      !invalidGroupPublicIds.has(question.questionGroup.publicId),
  );
}

async function resolvePlatformSourceQuestions(input: {
  resolverInput: PersonalAiGenerationLearningPaperSourceQuestionResolverInput;
  questionRepository: AiPaperQuestionSourceRepository;
}): Promise<PersonalAiGenerationLearningPaperSourceQuestionDto[]> {
  const selectedPlatformQuestionIds = collectSelectedQuestionIdsBySourceKind(
    input.resolverInput.paperAssemblyContainer,
    "platform_formal_question",
  );

  if (selectedPlatformQuestionIds.size === 0) {
    return [];
  }

  const container = input.resolverInput.paperAssemblyContainer;
  const rows =
    await input.questionRepository.listAvailableAiPaperSourceQuestions({
      profession: container.profession,
      level: container.level,
      subject: container.subject,
      knowledgeNodePublicIds: null,
      questionPublicIds: [...selectedPlatformQuestionIds],
    });

  return rows
    .filter(
      (row) =>
        selectedPlatformQuestionIds.has(row.public_id) &&
        row.status === "available",
    )
    .map((row) =>
      mapPlatformQuestionRowToSourceQuestion(
        row,
        findSelectedQuestion(
          input.resolverInput.paperAssemblyContainer,
          "platform_formal_question",
          row.public_id,
        ),
      ),
    )
    .filter(
      (
        sourceQuestion,
      ): sourceQuestion is PersonalAiGenerationLearningPaperSourceQuestionDto =>
        sourceQuestion !== null,
    );
}

async function resolveEnterpriseSourceQuestions(input: {
  resolverInput: PersonalAiGenerationLearningPaperSourceQuestionResolverInput;
  organizationTrainingRepository:
    | Pick<
        OrganizationTrainingRepository,
        "listEmployeeVisibleQuestionSnapshotsForAiPaperSource"
      >
    | undefined;
}): Promise<PersonalAiGenerationLearningPaperSourceQuestionDto[]> {
  const selectedEnterpriseQuestionIds = collectSelectedQuestionIdsBySourceKind(
    input.resolverInput.paperAssemblyContainer,
    "enterprise_training_snapshot",
  );

  if (
    selectedEnterpriseQuestionIds.size === 0 ||
    input.organizationTrainingRepository === undefined ||
    input.resolverInput.userContext.userType !== "employee" ||
    input.resolverInput.userContext.employeePublicId === null ||
    input.resolverInput.userContext.organizationPublicId === null
  ) {
    return [];
  }

  const snapshots =
    await input.organizationTrainingRepository.listEmployeeVisibleQuestionSnapshotsForAiPaperSource(
      {
        employeePublicId: input.resolverInput.userContext.employeePublicId,
        organizationPublicId:
          input.resolverInput.userContext.organizationPublicId,
      },
    );

  return snapshots
    .filter((snapshot) => selectedEnterpriseQuestionIds.has(snapshot.publicId))
    .map((snapshot) =>
      mapEnterpriseSnapshotToSourceQuestion(
        snapshot,
        findSelectedQuestion(
          input.resolverInput.paperAssemblyContainer,
          "enterprise_training_snapshot",
          snapshot.publicId,
        ),
      ),
    )
    .filter(
      (
        sourceQuestion,
      ): sourceQuestion is PersonalAiGenerationLearningPaperSourceQuestionDto =>
        sourceQuestion !== null,
    );
}

function mapPlatformQuestionRowToSourceQuestion(
  row: QuestionAccessRow,
  selectedQuestion: ReturnType<typeof findSelectedQuestion>,
): PersonalAiGenerationLearningPaperSourceQuestionDto | null {
  const questionType = normalizeQuestionType(row.question_type);

  if (
    questionType === null ||
    selectedQuestion === null ||
    !isCurrentPlatformGroupIdentityValid(row, selectedQuestion.questionGroup)
  ) {
    return null;
  }

  return {
    questionPublicId: row.public_id,
    sourceKind: "platform_formal_question",
    questionType,
    difficulty: null,
    knowledgeNodeLabels: [],
    questionStem: row.stem_rich_text,
    questionOptions: row.question_options.map((questionOption) => ({
      optionLabel: questionOption.label,
      optionText: questionOption.content_rich_text,
      isCorrect: questionOption.is_correct,
    })),
    standardAnswerLabels: normalizeAnswerLabels(
      row.question_options
        .filter((questionOption) => questionOption.is_correct)
        .map((questionOption) => questionOption.label),
    ),
    standardAnswerText: normalizeNullableText(row.standard_answer_rich_text),
    analysis: normalizeNullableText(row.analysis_rich_text),
    questionGroup: copyQuestionGroup(selectedQuestion.questionGroup),
  };
}

function mapEnterpriseSnapshotToSourceQuestion(
  snapshot: OrganizationTrainingQuestionSnapshotValue,
  selectedQuestion: ReturnType<typeof findSelectedQuestion>,
): PersonalAiGenerationLearningPaperSourceQuestionDto | null {
  const questionType = normalizeQuestionType(snapshot.questionType);
  const questionStem = normalizeNullableText(snapshot.stem);

  if (
    questionType === null ||
    questionStem === null ||
    selectedQuestion === null ||
    !isCurrentEnterpriseGroupIdentityValid(
      snapshot,
      selectedQuestion.questionGroup,
    )
  ) {
    return null;
  }

  return {
    questionPublicId: snapshot.publicId,
    sourceKind: "enterprise_training_snapshot",
    questionType,
    difficulty: null,
    knowledgeNodeLabels: [],
    questionStem,
    questionOptions: Array.isArray(snapshot.options)
      ? snapshot.options.map((questionOption) => ({
          optionLabel: questionOption.label,
          optionText: questionOption.content,
          isCorrect: null,
        }))
      : [],
    standardAnswerLabels: extractAnswerLabels(snapshot.standardAnswer),
    standardAnswerText: normalizeNullableText(snapshot.standardAnswer),
    analysis: normalizeNullableText(snapshot.analysisSummary),
    questionGroup: copyQuestionGroup(selectedQuestion.questionGroup),
  };
}

function findSelectedQuestion(
  container: AiPaperPlanAndSelectContainerDto,
  sourceKind: PersonalAiGenerationLearningPaperSourceQuestionDto["sourceKind"],
  questionPublicId: string,
) {
  return (
    collectSelectedQuestions(container).find(
      (question) =>
        question.sourceKind === sourceKind &&
        question.questionPublicId === questionPublicId,
    ) ?? null
  );
}

function isCurrentPlatformGroupIdentityValid(
  row: QuestionAccessRow,
  selectedGroup: AiPaperSelectedQuestionDto["questionGroup"],
): boolean {
  if (selectedGroup === null || selectedGroup === undefined) {
    return row.material_id === null && row.material_public_id === null;
  }

  return (
    row.material_id !== null &&
    selectedGroup.materialSnapshot.materialPublicId !== null &&
    row.material_public_id ===
      selectedGroup.materialSnapshot.materialPublicId &&
    selectedGroup.memberQuestionPublicIds.includes(row.public_id)
  );
}

function isCurrentEnterpriseGroupIdentityValid(
  snapshot: OrganizationTrainingQuestionSnapshotValue,
  selectedGroup: AiPaperSelectedQuestionDto["questionGroup"],
): boolean {
  if (selectedGroup === null || selectedGroup === undefined) {
    return (
      snapshot.materialTitle === null &&
      snapshot.materialContent === null &&
      !("questionGroupPublicId" in snapshot)
    );
  }

  const snapshotRecord =
    snapshot as OrganizationTrainingQuestionSnapshotValue & {
      questionGroupPublicId?: string;
      questionGroupTitle?: string;
      questionGroupQuestionSortOrder?: number;
      questionGroupQuestionCount?: number;
    };

  return (
    snapshotRecord.questionGroupPublicId === selectedGroup.publicId &&
    snapshotRecord.questionGroupTitle === selectedGroup.title &&
    snapshotRecord.questionGroupQuestionSortOrder ===
      selectedGroup.questionSortOrder &&
    snapshotRecord.questionGroupQuestionCount ===
      selectedGroup.memberQuestionPublicIds.length &&
    snapshot.materialTitle === selectedGroup.materialSnapshot.title &&
    snapshot.materialContent ===
      selectedGroup.materialSnapshot.contentRichText &&
    selectedGroup.memberQuestionPublicIds.includes(snapshot.publicId)
  );
}

function copyQuestionGroup(
  questionGroup: AiPaperSelectedQuestionDto["questionGroup"],
): PersonalAiGenerationLearningPaperSourceQuestionDto["questionGroup"] {
  if (questionGroup === null || questionGroup === undefined) {
    return null;
  }

  return {
    publicId: questionGroup.publicId,
    title: questionGroup.title,
    materialSnapshot: { ...questionGroup.materialSnapshot },
    memberQuestionPublicIds: [...questionGroup.memberQuestionPublicIds],
    questionSortOrder: questionGroup.questionSortOrder,
  };
}

function collectSelectedQuestions(
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto,
): Array<
  AiPaperPlanAndSelectContainerDto["sections"][number]["selectedQuestions"][number]
> {
  return paperAssemblyContainer.sections.flatMap(
    (section) => section.selectedQuestions,
  );
}

function collectSelectedQuestionIdsBySourceKind(
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto,
  sourceKind: PersonalAiGenerationLearningPaperSourceQuestionDto["sourceKind"],
): Set<string> {
  return new Set(
    collectSelectedQuestions(paperAssemblyContainer)
      .filter((question) => question.sourceKind === sourceKind)
      .map((question) => question.questionPublicId),
  );
}

function createSelectedQuestionKey(input: {
  sourceKind: PersonalAiGenerationLearningPaperSourceQuestionDto["sourceKind"];
  questionPublicId: string;
}): string {
  return `${input.sourceKind}:${input.questionPublicId}`;
}

function normalizeQuestionType(
  questionType: string,
): PersonalAiGenerationLearningSessionQuestionType | null {
  return supportedQuestionTypes.has(questionType)
    ? (questionType as PersonalAiGenerationLearningSessionQuestionType)
    : null;
}

function normalizeAnswerLabels(labels: string[]): string[] {
  return [
    ...new Set(
      labels
        .map((label) => label.trim().toUpperCase())
        .filter((label) => label.length > 0),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

function extractAnswerLabels(answerText: string): string[] {
  return normalizeAnswerLabels(answerText.match(/[A-H](?![a-z])/gi) ?? []);
}

function normalizeNullableText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}
