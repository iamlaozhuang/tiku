import type {
  PaperDraftDto,
  PaperDraftResultDto,
  PaperQuestionDto,
  PaperQuestionResultDto,
} from "../contracts/paper-draft-contract";
import type {
  PaperDraftAccessRow,
  PaperQuestionAccessRow,
} from "../repositories/paper-draft-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapPaperQuestionToApi(
  paperQuestion: PaperQuestionAccessRow,
): PaperQuestionDto {
  return {
    publicId: paperQuestion.public_id,
    sourceQuestionPublicId: paperQuestion.source_question_public_id,
    paperSectionSortOrder:
      paperQuestion.paper_section_sort_order ?? paperQuestion.sort_order,
    questionGroupSortOrder: paperQuestion.question_group_sort_order ?? null,
    questionGroupPublicId: paperQuestion.question_group_public_id ?? null,
    score: paperQuestion.score,
    sortOrder: paperQuestion.sort_order,
    questionSnapshot: paperQuestion.question_snapshot,
    materialSnapshot: paperQuestion.material_snapshot,
    scoringPoints: paperQuestion.scoring_points.map((scoringPoint) => ({
      publicId: scoringPoint.public_id,
      description: scoringPoint.description,
      score: scoringPoint.score,
      sortOrder: scoringPoint.sort_order,
    })),
    createdAt: paperQuestion.created_at.toISOString(),
    updatedAt: paperQuestion.updated_at.toISOString(),
  };
}

export function mapPaperDraftToApi(paper: PaperDraftAccessRow): PaperDraftDto {
  const paperSections = paper.paper_sections.map((paperSection) => ({
    title: paperSection.title,
    description: paperSection.description,
    sortOrder: paperSection.sort_order,
    totalScore: paperSection.total_score,
    paperQuestions: paperSection.paper_questions.map((paperQuestion) =>
      mapPaperQuestionToApi(paperQuestion),
    ),
  }));
  const questionCount = paperSections.reduce(
    (totalCount, paperSection) =>
      totalCount + paperSection.paperQuestions.length,
    0,
  );

  return {
    publicId: paper.public_id,
    name: paper.name,
    profession: paper.profession,
    level: paper.level,
    subject: paper.subject,
    paperStatus: paper.paper_status,
    paperType: paper.paper_type,
    year: paper.year,
    month: paper.month,
    sourceDescription: paper.source,
    sourceRegion: paper.source_region,
    sourceOrganization: paper.source_organization,
    questionBasis: paper.question_basis,
    generationMethod: paper.generation_method,
    durationMinute: paper.duration_minute,
    totalScore: paper.total_score,
    revision: paper.revision,
    publishedAt: formatNullableTimestamp(paper.published_at),
    archivedAt: formatNullableTimestamp(paper.archived_at),
    questionCount,
    paperSections,
    questionGroups: paper.question_groups.map((questionGroup) => ({
      publicId: questionGroup.public_id,
      title: questionGroup.title,
      materialPublicId: questionGroup.material_public_id,
      materialSnapshot: questionGroup.material_snapshot,
      sortOrder: questionGroup.sort_order,
    })),
    createdAt: paper.created_at.toISOString(),
    updatedAt: paper.updated_at.toISOString(),
  };
}

export function mapPaperDraftResultToApi(
  paper: PaperDraftAccessRow,
): PaperDraftResultDto {
  return {
    paper: mapPaperDraftToApi(paper),
  };
}

export function mapPaperQuestionResultToApi(
  paperQuestion: PaperQuestionAccessRow,
): PaperQuestionResultDto {
  return {
    paperQuestion: mapPaperQuestionToApi(paperQuestion),
  };
}
