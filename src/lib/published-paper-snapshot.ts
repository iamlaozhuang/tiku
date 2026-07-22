export type PublishedPaperSnapshotQuestionEntry = {
  paperSection: Record<string, unknown>;
  questionGroup: Record<string, unknown> | null;
  paperQuestion: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNonEmptyString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  const candidate = value[key];

  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
}

function getPositiveInteger(
  value: Record<string, unknown>,
  key: string,
): number | null {
  const candidate = value[key];

  return typeof candidate === "number" &&
    Number.isSafeInteger(candidate) &&
    candidate > 0
    ? candidate
    : null;
}

function getFiniteScore(
  value: Record<string, unknown>,
  key: string,
): number | null {
  const candidate = value[key];
  const score =
    typeof candidate === "number"
      ? candidate
      : typeof candidate === "string" && candidate.trim().length > 0
        ? Number(candidate)
        : Number.NaN;

  return Number.isFinite(score) && score >= 0 ? score : null;
}

function hasUniqueQuestionIdentity(
  paperQuestion: Record<string, unknown>,
  paperQuestionPublicIds: Set<string>,
  questionPublicIds: Set<string>,
): boolean {
  const paperQuestionPublicId = getNonEmptyString(
    paperQuestion,
    "paperQuestionPublicId",
  );
  const questionPublicId = getNonEmptyString(paperQuestion, "questionPublicId");

  if (
    paperQuestionPublicId === null ||
    questionPublicId === null ||
    paperQuestionPublicIds.has(paperQuestionPublicId) ||
    questionPublicIds.has(questionPublicId)
  ) {
    return false;
  }

  paperQuestionPublicIds.add(paperQuestionPublicId);
  questionPublicIds.add(questionPublicId);

  return true;
}

function listVersionedQuestionEntries(
  paperSnapshot: Record<string, unknown>,
): PublishedPaperSnapshotQuestionEntry[] | null {
  if (!Array.isArray(paperSnapshot.paperSections)) {
    return null;
  }

  const entries: PublishedPaperSnapshotQuestionEntry[] = [];
  const paperSectionPublicIds = new Set<string>();
  const questionGroupPublicIds = new Set<string>();
  const paperQuestionPublicIds = new Set<string>();
  const questionPublicIds = new Set<string>();

  for (const paperSection of paperSnapshot.paperSections) {
    if (
      !isRecord(paperSection) ||
      getNonEmptyString(paperSection, "publicId") === null ||
      getNonEmptyString(paperSection, "title") === null ||
      getPositiveInteger(paperSection, "sortOrder") === null ||
      !Array.isArray(paperSection.paperQuestions) ||
      !Array.isArray(paperSection.questionGroups)
    ) {
      return null;
    }

    const paperSectionPublicId = getNonEmptyString(paperSection, "publicId")!;

    if (paperSectionPublicIds.has(paperSectionPublicId)) {
      return null;
    }

    paperSectionPublicIds.add(paperSectionPublicId);

    for (const paperQuestion of paperSection.paperQuestions) {
      if (
        !isRecord(paperQuestion) ||
        !hasUniqueQuestionIdentity(
          paperQuestion,
          paperQuestionPublicIds,
          questionPublicIds,
        )
      ) {
        return null;
      }

      entries.push({ paperSection, questionGroup: null, paperQuestion });
    }

    for (const questionGroup of paperSection.questionGroups) {
      if (
        !isRecord(questionGroup) ||
        getNonEmptyString(questionGroup, "publicId") === null ||
        getNonEmptyString(questionGroup, "title") === null ||
        getPositiveInteger(questionGroup, "sortOrder") === null ||
        !isRecord(questionGroup.materialSnapshot) ||
        !Array.isArray(questionGroup.paperQuestions) ||
        questionGroup.paperQuestions.length === 0
      ) {
        return null;
      }

      const questionGroupPublicId = getNonEmptyString(
        questionGroup,
        "publicId",
      )!;

      if (questionGroupPublicIds.has(questionGroupPublicId)) {
        return null;
      }

      questionGroupPublicIds.add(questionGroupPublicId);

      let calculatedTotalScore = 0;

      for (const paperQuestion of questionGroup.paperQuestions) {
        if (
          !isRecord(paperQuestion) ||
          !hasUniqueQuestionIdentity(
            paperQuestion,
            paperQuestionPublicIds,
            questionPublicIds,
          )
        ) {
          return null;
        }

        const questionScore = getFiniteScore(paperQuestion, "score");

        if (questionScore === null) {
          return null;
        }

        calculatedTotalScore += questionScore;
        entries.push({ paperSection, questionGroup, paperQuestion });
      }

      const declaredTotalScore = getFiniteScore(questionGroup, "totalScore");

      if (
        declaredTotalScore === null ||
        Math.abs(declaredTotalScore - calculatedTotalScore) > 0.000_001
      ) {
        return null;
      }
    }
  }

  return entries;
}

function listLegacyQuestionEntries(
  paperSnapshot: Record<string, unknown>,
): PublishedPaperSnapshotQuestionEntry[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];
  const legacyQuestionGroupByPublicId = new Map<
    string,
    Record<string, unknown>
  >();

  return paperSections.flatMap((paperSection) => {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return [];
    }

    return paperSection.paperQuestions.flatMap((paperQuestion) => {
      if (!isRecord(paperQuestion)) {
        return [];
      }

      const questionGroupPublicId = getNonEmptyString(
        paperQuestion,
        "questionGroupPublicId",
      );
      let questionGroup: Record<string, unknown> | null = null;

      if (questionGroupPublicId !== null) {
        const questionGroupTitle = getNonEmptyString(
          paperQuestion,
          "questionGroupTitle",
        );
        questionGroup = legacyQuestionGroupByPublicId.get(
          questionGroupPublicId,
        ) ?? {
          publicId: questionGroupPublicId,
          ...(questionGroupTitle === null ? {} : { title: questionGroupTitle }),
          materialSnapshot: isRecord(paperQuestion.materialSnapshot)
            ? paperQuestion.materialSnapshot
            : {},
        };
        legacyQuestionGroupByPublicId.set(questionGroupPublicId, questionGroup);
      }

      return [{ paperSection, questionGroup, paperQuestion }];
    });
  });
}

export function listPublishedPaperSnapshotQuestionEntries(
  paperSnapshot: Record<string, unknown>,
): PublishedPaperSnapshotQuestionEntry[] {
  if (paperSnapshot.snapshotVersion !== 2) {
    return listLegacyQuestionEntries(paperSnapshot);
  }

  return listVersionedQuestionEntries(paperSnapshot) ?? [];
}
