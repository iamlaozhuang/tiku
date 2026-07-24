import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { PersonalAiGenerationLearningPaperSourceQuestionDto } from "../contracts/personal-ai-generation-learning-session-contract";
import type { PersonalAiGenerationPrivatePaperQuestionSnapshotDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import { serializePersonalAiGenerationPaperAssemblyContainer } from "../validators/personal-ai-generation-result-persistence";

export function mapPrivatePaperQuestionSnapshotToLearningSourceQuestions(input: {
  privateSnapshot: PersonalAiGenerationPrivatePaperQuestionSnapshotDto;
  resultPublicId: string;
  taskPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto;
}): PersonalAiGenerationLearningPaperSourceQuestionDto[] | null {
  const snapshot = input.privateSnapshot.snapshot;

  if (
    snapshot.resultPublicId !== input.resultPublicId ||
    snapshot.taskPublicId !== input.taskPublicId ||
    snapshot.ownerType !== input.ownerType ||
    snapshot.ownerPublicId !== input.ownerPublicId ||
    serializePersonalAiGenerationPaperAssemblyContainer(
      snapshot.paperAssemblyContainer,
    ) !==
      serializePersonalAiGenerationPaperAssemblyContainer(
        input.paperAssemblyContainer,
      )
  ) {
    return null;
  }

  return snapshot.questions.map((question) => ({
    questionPublicId: question.questionPublicId,
    sourceKind: question.sourceKind,
    questionType: question.questionType,
    difficulty: question.difficulty,
    knowledgeNodeLabels: [],
    questionStem: question.questionStem,
    questionOptions: question.questionOptions.map((questionOption) => ({
      optionLabel: questionOption.optionLabel,
      optionText: questionOption.optionText,
      isCorrect: questionOption.isCorrect,
    })),
    standardAnswerLabels: [...question.standardAnswerLabels],
    standardAnswerText: question.standardAnswerText,
    analysis: question.analysis,
    questionGroup:
      question.questionGroup === null
        ? null
        : {
            publicId: question.questionGroup.publicId,
            title: question.questionGroup.title,
            materialSnapshot: {
              materialPublicId:
                question.questionGroup.materialSnapshot.materialPublicId,
              title: question.questionGroup.materialSnapshot.title,
              contentRichText:
                question.questionGroup.materialSnapshot.contentRichText,
            },
            memberQuestionPublicIds: [
              ...question.questionGroup.memberQuestionPublicIds,
            ],
            questionSortOrder: question.questionGroup.questionSortOrder,
          },
  }));
}
