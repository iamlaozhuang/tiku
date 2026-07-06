import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { AiPaperSelectableQuestionDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { QuestionAccessRow } from "../repositories/question-repository";

export type AiPaperPlatformQuestionSourceAdapterInput = {
  questionRows: readonly QuestionAccessRow[];
  knowledgeNodeParentPublicIdsByPublicId?: Readonly<
    Record<string, string | null>
  >;
  difficultyByQuestionPublicId?: Readonly<Record<string, string | null>>;
};

export type AiPaperEnterpriseQuestionSourceAdapterInput = {
  organizationPublicId: string;
  trainingVersions: readonly OrganizationTrainingPublishedVersionDto[];
};

const enterpriseTrainingQuestionTypes = new Set([
  "single_choice",
  "multi_choice",
  "true_false",
  "short_answer",
]);

export function mapPlatformQuestionRowsToAiPaperQuestions(
  input: AiPaperPlatformQuestionSourceAdapterInput,
): AiPaperSelectableQuestionDto[] {
  return input.questionRows
    .filter((questionRow) => questionRow.status === "available")
    .map((questionRow) => ({
      publicId: questionRow.public_id,
      sourceKind: "platform_formal_question",
      organizationPublicId: null,
      status: "available",
      profession: questionRow.profession,
      level: questionRow.level,
      subject: questionRow.subject,
      questionType: questionRow.question_type,
      difficulty:
        input.difficultyByQuestionPublicId?.[questionRow.public_id] ?? null,
      knowledgeNodePublicIds: [...questionRow.knowledge_node_public_ids],
      parentKnowledgeNodePublicIds: mapParentKnowledgeNodePublicIds(
        questionRow.knowledge_node_public_ids,
        input.knowledgeNodeParentPublicIdsByPublicId ?? {},
      ),
    }));
}

export function mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions(
  input: AiPaperEnterpriseQuestionSourceAdapterInput,
): AiPaperSelectableQuestionDto[] {
  return input.trainingVersions.flatMap((trainingVersion) => {
    if (
      trainingVersion.organizationPublicId !== input.organizationPublicId ||
      trainingVersion.status !== "published" ||
      trainingVersion.takenDownAt !== null
    ) {
      return [];
    }

    return (trainingVersion.questions ?? []).flatMap((questionSnapshot) => {
      if (!enterpriseTrainingQuestionTypes.has(questionSnapshot.questionType)) {
        return [];
      }

      return [
        {
          publicId: questionSnapshot.publicId,
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: trainingVersion.organizationPublicId,
          status: "published",
          profession: trainingVersion.profession,
          level: trainingVersion.level,
          subject: trainingVersion.subject,
          questionType: questionSnapshot.questionType,
          difficulty: null,
          knowledgeNodePublicIds: [],
          parentKnowledgeNodePublicIds: [],
        } satisfies AiPaperSelectableQuestionDto,
      ];
    });
  });
}

function mapParentKnowledgeNodePublicIds(
  knowledgeNodePublicIds: readonly string[],
  knowledgeNodeParentPublicIdsByPublicId: Readonly<
    Record<string, string | null>
  >,
): string[] {
  return [
    ...new Set(
      knowledgeNodePublicIds
        .map((knowledgeNodePublicId) => {
          return (
            knowledgeNodeParentPublicIdsByPublicId[knowledgeNodePublicId] ??
            null
          );
        })
        .filter((publicId): publicId is string => publicId !== null),
    ),
  ];
}
