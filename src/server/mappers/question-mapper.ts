import type {
  QuestionDetailResultDto,
  QuestionDto,
  QuestionResultDto,
} from "../contracts/question-contract";
import type {
  QuestionAccessRow,
  QuestionDetailAccessRow,
} from "../repositories/question-repository";
import type { NormalizedQuestionDetailInput } from "../validators/question";

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
    difficulty: question.difficulty ?? null,
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
    fillBlankAnswers: question.fill_blank_answers ?? [],
    knowledgeNodePublicIds: question.knowledge_node_public_ids,
    tagPublicIds: question.tag_public_ids,
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

export function mapQuestionDetailResultToApi(
  question: QuestionDetailAccessRow,
  query: NormalizedQuestionDetailInput,
): QuestionDetailResultDto {
  return {
    question: {
      ...mapQuestionToApi(question),
      material:
        question.material_detail === null
          ? null
          : {
              publicId: question.material_detail.public_id,
              title: question.material_detail.title,
              status: question.material_detail.status,
            },
      knowledgeNodes: question.knowledge_nodes.map((knowledgeNodeRow) => ({
        publicId: knowledgeNodeRow.public_id,
        name: knowledgeNodeRow.name,
        pathName: knowledgeNodeRow.path_name,
        knStatus: knowledgeNodeRow.kn_status,
      })),
      tags: question.tags.map((tagRow) => ({
        publicId: tagRow.public_id,
        name: tagRow.name,
      })),
      lockReason:
        question.locking_paper_count === 0
          ? null
          : {
              code: "paper_published",
              paperCount: question.locking_paper_count,
            },
      paperReferences: {
        items: question.paper_references.map((paperReference) => ({
          paperPublicId: paperReference.paper_public_id,
          name: paperReference.name,
          paperStatus: paperReference.paper_status,
          updatedAt: paperReference.updated_at.toISOString(),
        })),
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: question.paper_reference_total,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
      },
    },
  };
}
