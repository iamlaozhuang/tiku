import type {
  PaperDraftDto,
  PaperPublishValidationIssueDto,
  PaperScoringPointDto,
} from "@/server/contracts/paper-draft-contract";

export type PaperComposerIssue = PaperPublishValidationIssueDto & {
  targetPaperSectionSortOrder: number | null;
};

export type PaperComposerValidation = {
  blockers: PaperComposerIssue[];
  warnings: PaperComposerIssue[];
};

function toHalfPoints(value: string | null): number | null {
  if (value === null) return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 ? Math.round(score * 2) : null;
}

export function createPaperComposerValidation(
  paper: PaperDraftDto,
): PaperComposerValidation {
  const blockers: PaperComposerIssue[] = [];
  const warnings: PaperComposerIssue[] = [];
  const questionScores = paper.paperSections.flatMap((paperSection) =>
    paperSection.paperQuestions.map((paperQuestion) => ({
      paperQuestion,
      paperSectionSortOrder: paperSection.sortOrder,
      score: toHalfPoints(paperQuestion.score),
    })),
  );
  const totalScore = toHalfPoints(paper.totalScore);
  const questionScoreTotal = questionScores.reduce(
    (sum, item) => sum + (item.score ?? 0),
    0,
  );

  if (questionScores.length === 0) {
    blockers.push({
      code: "paper_has_no_counting_question",
      message: "至少加入一道计分题后才能发布。",
      targetPaperSectionSortOrder: null,
    });
  }

  if (questionScores.length > 100) {
    blockers.push({
      code: "paper_question_count_invalid",
      message: "试卷题量不能超过 100 道。",
      targetPaperSectionSortOrder: null,
    });
  }

  for (const paperSection of paper.paperSections) {
    if (paperSection.paperQuestions.length === 0) {
      blockers.push({
        code: "empty_paper_section",
        message: `${paperSection.title} 尚未加入题目。`,
        targetPaperSectionSortOrder: paperSection.sortOrder,
      });
    }
  }

  const missingScore = questionScores.find((item) => item.score === null);
  if (missingScore !== undefined) {
    blockers.push({
      code: "paper_question_score_missing",
      message: "存在未设置分值的题目。",
      targetPaperSectionSortOrder: missingScore.paperSectionSortOrder,
    });
  }

  for (const item of questionScores) {
    const { paperQuestion, paperSectionSortOrder, score } = item;
    const questionType = paperQuestion.questionSnapshot.questionType;
    const requiresScoringPoints =
      questionType === "short_answer" ||
      questionType === "case_analysis" ||
      questionType === "calculation" ||
      (questionType === "fill_blank" &&
        paperQuestion.questionSnapshot.scoringMethod === "ai_scoring");
    const scoringPointTotal = paperQuestion.scoringPoints.reduce(
      (sum, scoringPoint) => sum + (toHalfPoints(scoringPoint.score) ?? 0),
      0,
    );

    if (
      requiresScoringPoints &&
      score !== null &&
      scoringPointTotal !== score
    ) {
      blockers.push({
        code: "scoring_point_total_mismatch",
        message: "主观题评分点分值合计必须等于题目分值。",
        targetPaperSectionSortOrder: paperSectionSortOrder,
      });
    }

    if (
      questionType === "fill_blank" &&
      paperQuestion.questionSnapshot.scoringMethod === "auto_match" &&
      score !== null
    ) {
      const fillBlankAnswers =
        paperQuestion.questionSnapshot.fillBlankAnswers ?? [];
      const answerScoreTotal = fillBlankAnswers.reduce(
        (sum, answer) => sum + (toHalfPoints(answer.score) ?? 0),
        0,
      );
      if (fillBlankAnswers.length === 0 || answerScoreTotal !== score) {
        blockers.push({
          code: "fill_blank_score_total_mismatch",
          message: "填空题各空分值合计必须等于题目分值。",
          targetPaperSectionSortOrder: paperSectionSortOrder,
        });
      }
    }

    if (paperQuestion.questionSnapshot.questionStatus === "disabled") {
      warnings.push({
        code: "source_reference_unresolved",
        message: "源题已停用；当前草稿仍保留快照，发布前建议复核。",
        targetPaperSectionSortOrder: paperSectionSortOrder,
      });
    }

    const material = paperQuestion.materialSnapshot;
    if (
      material !== null &&
      (material.profession !== paper.profession ||
        material.level !== paper.level ||
        material.subject !== paper.subject)
    ) {
      warnings.push({
        code: "source_reference_unresolved",
        message: "材料范围与试卷不完全一致；这是提醒，不阻断发布。",
        targetPaperSectionSortOrder: paperSectionSortOrder,
      });
    }
  }

  if (totalScore === null) {
    blockers.push({
      code: "paper_total_score_missing",
      message: "请先设置试卷总分。",
      targetPaperSectionSortOrder: null,
    });
  } else if (missingScore === undefined && totalScore !== questionScoreTotal) {
    blockers.push({
      code: "paper_total_score_mismatch",
      message: "试卷总分与各题分值合计不一致。",
      targetPaperSectionSortOrder: null,
    });
  }

  return { blockers, warnings };
}

export function createPaperQuestionUpdateInput(input: {
  paperSection: {
    title: string;
    description: string | null;
    sortOrder: number;
  };
  score: string;
  scoringPoints: PaperScoringPointDto[];
  sortOrder: number;
}) {
  return {
    paperSection: input.paperSection,
    score: input.score,
    scoringPoints: input.scoringPoints,
    sortOrder: input.sortOrder,
  };
}
