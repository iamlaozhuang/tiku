import type { MistakeBookItemDto } from "../contracts/mistake-book-contract";
import type { MistakeBookRow } from "../repositories/mistake-book-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapMistakeBookItemToApi(
  mistakeBook: MistakeBookRow,
): MistakeBookItemDto {
  return {
    publicId: mistakeBook.public_id,
    questionPublicId: mistakeBook.question_public_id,
    paperQuestionPublicId: mistakeBook.paper_question_public_id,
    profession: mistakeBook.profession,
    level: mistakeBook.level,
    subject: mistakeBook.subject,
    questionSnapshot: mistakeBook.question_snapshot,
    latestAnswerSnapshot: mistakeBook.latest_answer_snapshot,
    mistakeBookSource: mistakeBook.mistake_book_source,
    mistakeBookStatus: mistakeBook.mistake_book_status,
    wrongCount: mistakeBook.wrong_count,
    isFavorite: mistakeBook.is_favorite,
    isRemoved: mistakeBook.is_removed,
    masteredAt: formatNullableTimestamp(mistakeBook.mastered_at),
    latestWrongAt: formatNullableTimestamp(mistakeBook.latest_wrong_at),
    createdAt: mistakeBook.created_at.toISOString(),
    updatedAt: mistakeBook.updated_at.toISOString(),
  };
}
