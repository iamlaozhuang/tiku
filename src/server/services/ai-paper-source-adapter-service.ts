import { createHash } from "node:crypto";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { AiPaperSelectableQuestionDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { QuestionAccessRow } from "../repositories/question-repository";
import { parseCurrentAiGenerationQuestionType } from "./ai-generation-question-type-contract";

type OrganizationTrainingQuestionSnapshot = NonNullable<
  OrganizationTrainingPublishedVersionDto["questions"]
>[number];

export type AiPaperPlatformQuestionSourceAdapterInput = {
  questionRows: readonly QuestionAccessRow[];
};

export type AiPaperEnterpriseQuestionSourceAdapterInput = {
  organizationPublicId: string;
  trainingVersions: readonly OrganizationTrainingPublishedVersionDto[];
};

export function mapPlatformQuestionRowsToAiPaperQuestions(
  input: AiPaperPlatformQuestionSourceAdapterInput,
): AiPaperSelectableQuestionDto[] {
  const availableRows = input.questionRows.filter(
    (questionRow) => questionRow.status === "available",
  );
  const normalizedRows: Array<{
    row: QuestionAccessRow;
    questionType: AiPaperSelectableQuestionDto["questionType"];
  }> = [];
  for (const row of availableRows) {
    const questionType = parseCurrentAiGenerationQuestionType(
      row.question_type,
    );
    if (questionType === null) {
      return [];
    }
    normalizedRows.push({ row, questionType });
  }
  const materialRowsByPublicId = new Map<string, QuestionAccessRow[]>();

  for (const { row: questionRow } of normalizedRows) {
    if (questionRow.material_id === null) {
      continue;
    }

    const materialPublicId = questionRow.material_public_id;

    if (materialPublicId === null) {
      continue;
    }

    const materialRows = materialRowsByPublicId.get(materialPublicId) ?? [];
    materialRows.push(questionRow);
    materialRowsByPublicId.set(materialPublicId, materialRows);
  }

  const mappedQuestions: AiPaperSelectableQuestionDto[] = [];
  for (const { row: questionRow, questionType } of normalizedRows) {
    const questionGroup = createPlatformQuestionGroup(
      questionRow,
      materialRowsByPublicId,
    );

    if (questionRow.material_id !== null && questionGroup === null) {
      return [];
    }

    mappedQuestions.push({
      publicId: questionRow.public_id,
      sourceKind: "platform_formal_question",
      organizationPublicId: null,
      status: "available",
      profession: questionRow.profession,
      level: questionRow.level,
      subject: questionRow.subject,
      questionType,
      difficulty: questionRow.difficulty ?? null,
      knowledgeNodePublicIds: [...questionRow.knowledge_node_public_ids],
      parentKnowledgeNodePublicIds: [
        ...(questionRow.parent_knowledge_node_public_ids ?? []),
      ],
      ancestorKnowledgeNodePublicIds: [
        ...(questionRow.ancestor_knowledge_node_public_ids ?? []),
      ],
      ...(questionGroup === null ? {} : { questionGroup }),
    });
  }

  return mappedQuestions;
}

export function mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions(
  input: AiPaperEnterpriseQuestionSourceAdapterInput,
): AiPaperSelectableQuestionDto[] {
  const mappedQuestions: AiPaperSelectableQuestionDto[] = [];
  for (const trainingVersion of input.trainingVersions) {
    if (
      trainingVersion.organizationPublicId !== input.organizationPublicId ||
      trainingVersion.status !== "published" ||
      trainingVersion.takenDownAt !== null
    ) {
      continue;
    }

    const questionSnapshots = trainingVersion.questions ?? [];
    const validQuestionGroups =
      createEnterpriseQuestionGroups(questionSnapshots);

    for (const questionSnapshot of questionSnapshots) {
      const questionType = parseCurrentAiGenerationQuestionType(
        questionSnapshot.questionType,
      );
      if (questionType === null) {
        return [];
      }

      const hasMaterial =
        questionSnapshot.materialTitle !== null ||
        questionSnapshot.materialContent !== null;
      const hasQuestionGroupMetadata = [
        questionSnapshot.questionGroupPublicId,
        questionSnapshot.questionGroupTitle,
        questionSnapshot.questionGroupQuestionSortOrder,
        questionSnapshot.questionGroupQuestionCount,
      ].some((value) => value !== null && value !== undefined);
      const questionGroupPublicId =
        questionSnapshot.questionGroupPublicId ?? null;
      const questionGroup =
        questionGroupPublicId === null
          ? null
          : (validQuestionGroups
              .get(questionGroupPublicId)
              ?.get(questionSnapshot.publicId) ?? null);

      if ((hasMaterial || hasQuestionGroupMetadata) && questionGroup === null) {
        return [];
      }

      mappedQuestions.push({
        publicId: questionSnapshot.publicId,
        sourceKind: "enterprise_training_snapshot",
        organizationPublicId: trainingVersion.organizationPublicId,
        status: "published",
        profession: trainingVersion.profession,
        level: trainingVersion.level,
        subject: trainingVersion.subject,
        questionType,
        difficulty: questionSnapshot.difficulty ?? null,
        knowledgeNodePublicIds: [
          ...(questionSnapshot.knowledgeNodePublicIds ?? []),
        ],
        parentKnowledgeNodePublicIds: [
          ...(questionSnapshot.parentKnowledgeNodePublicIds ?? []),
        ],
        ancestorKnowledgeNodePublicIds: [
          ...(questionSnapshot.ancestorKnowledgeNodePublicIds ?? []),
        ],
        ...(questionGroup === null ? {} : { questionGroup }),
      });
    }
  }

  return mappedQuestions;
}

function createPlatformQuestionGroup(
  questionRow: QuestionAccessRow,
  materialRowsByPublicId: ReadonlyMap<string, QuestionAccessRow[]>,
): AiPaperSelectableQuestionDto["questionGroup"] {
  if (questionRow.material_id === null) {
    return null;
  }

  const materialPublicId = questionRow.material_public_id;
  const title = normalizeRequiredText(questionRow.material_title);
  const contentRichText = normalizeRequiredText(
    questionRow.material_content_rich_text,
  );

  if (
    materialPublicId === null ||
    questionRow.material_status !== "available" ||
    title === null ||
    contentRichText === null
  ) {
    return null;
  }

  const materialRows = [...(materialRowsByPublicId.get(materialPublicId) ?? [])]
    .filter(
      (row) =>
        row.material_id === questionRow.material_id &&
        row.material_public_id === materialPublicId &&
        row.material_status === "available" &&
        normalizeRequiredText(row.material_title) === title &&
        normalizeRequiredText(row.material_content_rich_text) ===
          contentRichText,
    )
    .sort((left, right) => left.public_id.localeCompare(right.public_id));
  const questionSortOrder =
    materialRows.findIndex((row) => row.public_id === questionRow.public_id) +
    1;
  const authoritativeQuestionCount = questionRow.material_question_count;

  if (
    !Number.isInteger(authoritativeQuestionCount) ||
    (authoritativeQuestionCount ?? 0) <= 0 ||
    materialRows.length !== authoritativeQuestionCount ||
    materialRows.some(
      (row) => row.material_question_count !== authoritativeQuestionCount,
    ) ||
    questionSortOrder < 1
  ) {
    return null;
  }

  return {
    publicId: createQuestionGroupPublicId(
      `platform_formal_question:${materialPublicId}`,
    ),
    title,
    materialSnapshot: {
      materialPublicId,
      title,
      contentRichText,
    },
    memberQuestionPublicIds: materialRows.map((row) => row.public_id),
    questionSortOrder,
  };
}

function createEnterpriseQuestionGroups(
  questionSnapshots: readonly OrganizationTrainingQuestionSnapshot[],
): Map<
  string,
  Map<string, NonNullable<AiPaperSelectableQuestionDto["questionGroup"]>>
> {
  const snapshotsByGroupPublicId = new Map<
    string,
    OrganizationTrainingQuestionSnapshot[]
  >();

  for (const snapshot of questionSnapshots) {
    const groupPublicId = snapshot.questionGroupPublicId ?? null;

    if (groupPublicId === null) {
      continue;
    }

    const groupSnapshots = snapshotsByGroupPublicId.get(groupPublicId) ?? [];
    groupSnapshots.push(snapshot);
    snapshotsByGroupPublicId.set(groupPublicId, groupSnapshots);
  }

  const result = new Map<
    string,
    Map<string, NonNullable<AiPaperSelectableQuestionDto["questionGroup"]>>
  >();

  for (const [groupPublicId, snapshots] of snapshotsByGroupPublicId) {
    const orderedSnapshots = [...snapshots].sort(
      (left, right) =>
        (left.questionGroupQuestionSortOrder ?? 0) -
        (right.questionGroupQuestionSortOrder ?? 0),
    );
    const expectedCount = orderedSnapshots[0]?.questionGroupQuestionCount;
    const title = normalizeRequiredText(
      orderedSnapshots[0]?.questionGroupTitle,
    );
    const materialTitle = normalizeRequiredText(
      orderedSnapshots[0]?.materialTitle,
    );
    const materialContent = normalizeRequiredText(
      orderedSnapshots[0]?.materialContent,
    );
    const isValid =
      Number.isInteger(expectedCount) &&
      expectedCount === orderedSnapshots.length &&
      title !== null &&
      materialTitle !== null &&
      materialContent !== null &&
      orderedSnapshots.every(
        (snapshot, index) =>
          snapshot.questionGroupPublicId === groupPublicId &&
          snapshot.questionGroupTitle === title &&
          snapshot.questionGroupQuestionCount === expectedCount &&
          snapshot.questionGroupQuestionSortOrder === index + 1 &&
          normalizeRequiredText(snapshot.materialTitle) === materialTitle &&
          normalizeRequiredText(snapshot.materialContent) === materialContent,
      ) &&
      new Set(orderedSnapshots.map((snapshot) => snapshot.publicId)).size ===
        orderedSnapshots.length;

    if (!isValid) {
      continue;
    }

    const memberQuestionPublicIds = orderedSnapshots.map(
      (snapshot) => snapshot.publicId,
    );
    result.set(
      groupPublicId,
      new Map(
        orderedSnapshots.map((snapshot, index) => [
          snapshot.publicId,
          {
            publicId: groupPublicId,
            title,
            materialSnapshot: {
              materialPublicId: null,
              title: materialTitle,
              contentRichText: materialContent,
            },
            memberQuestionPublicIds,
            questionSortOrder: index + 1,
          },
        ]),
      ),
    );
  }

  return result;
}

function createQuestionGroupPublicId(sourceIdentity: string): string {
  return `qgroup_${createHash("sha256")
    .update(sourceIdentity, "utf8")
    .digest("hex")
    .slice(0, 32)}`;
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}
