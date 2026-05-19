import type {
  QuestionDto,
  QuestionResultDto,
} from "../contracts/question-contract";
import type { QuestionAccessRow } from "../repositories/question-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapQuestionToApi(question: QuestionAccessRow): QuestionDto {
  return {
    publicId: question.public_id,
    questionType: question.question_type,
    profession: question.profession,
    level: question.level,
    subject: question.subject,
    stemRichText: question.stem_rich_text,
    analysisRichText: question.analysis_rich_text,
    standardAnswerRichText: question.standard_answer_rich_text,
    status: question.status,
    isLocked: question.is_locked,
    lockedAt: formatNullableTimestamp(question.locked_at),
    multiChoiceRule: question.multi_choice_rule,
    scoringMethod: question.scoring_method,
    materialPublicId: question.material_public_id,
    questionOptions: question.question_options.map((questionOption) => ({
      label: questionOption.label,
      contentRichText: questionOption.content_rich_text,
      isCorrect: questionOption.is_correct,
      sortOrder: questionOption.sort_order,
    })),
    scoringPoints: question.scoring_points.map((scoringPoint) => ({
      description: scoringPoint.description,
      score: scoringPoint.score,
      sortOrder: scoringPoint.sort_order,
    })),
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
    createdAt: question.created_at.toISOString(),
    updatedAt: question.updated_at.toISOString(),
  };
}

export function mapQuestionResultToApi(
  question: QuestionAccessRow,
): QuestionResultDto {
  return {
    question: mapQuestionToApi(question),
  };
}
