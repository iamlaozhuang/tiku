import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
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

    return selectedQuestions
      .map((selectedQuestion) =>
        sourceQuestionByKey.get(createSelectedQuestionKey(selectedQuestion)),
      )
      .filter(
        (
          sourceQuestion,
        ): sourceQuestion is PersonalAiGenerationLearningPaperSourceQuestionDto =>
          sourceQuestion !== undefined,
      );
  };
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
    .map(mapPlatformQuestionRowToSourceQuestion)
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
    .map(mapEnterpriseSnapshotToSourceQuestion)
    .filter(
      (
        sourceQuestion,
      ): sourceQuestion is PersonalAiGenerationLearningPaperSourceQuestionDto =>
        sourceQuestion !== null,
    );
}

function mapPlatformQuestionRowToSourceQuestion(
  row: QuestionAccessRow,
): PersonalAiGenerationLearningPaperSourceQuestionDto | null {
  const questionType = normalizeQuestionType(row.question_type);

  if (questionType === null) {
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
  };
}

function mapEnterpriseSnapshotToSourceQuestion(
  snapshot: OrganizationTrainingQuestionSnapshotValue,
): PersonalAiGenerationLearningPaperSourceQuestionDto | null {
  const questionType = normalizeQuestionType(snapshot.questionType);
  const questionStem = normalizeNullableText(snapshot.stem);

  if (questionType === null || questionStem === null) {
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
