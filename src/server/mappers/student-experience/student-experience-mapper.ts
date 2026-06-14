import type {
  MistakeBookScope,
  MistakeBookTransport,
  ObjectiveMistakeBookQuestionType,
} from "@/server/contracts/student-experience/student-experience-contract";
import type { MistakeBookRecord } from "@/server/repositories/student-experience/student-experience-repository";
import { isObjectiveMistakeBookQuestionType } from "@/server/validators/student-experience/mistake-book-scope";

const MISTAKE_BOOK_SCOPE: MistakeBookScope = "objective_question";

export function mapMistakeBookRecord(
  mistakeBookRecord: MistakeBookRecord,
): MistakeBookTransport {
  const questionType = isObjectiveMistakeBookQuestionType(
    mistakeBookRecord.questionType,
  )
    ? mistakeBookRecord.questionType
    : ("single_choice" satisfies ObjectiveMistakeBookQuestionType);

  return {
    isFavorite: mistakeBookRecord.isFavorite,
    isQuestionDisabled: mistakeBookRecord.isQuestionDisabled,
    isRemoved: mistakeBookRecord.isRemoved,
    latestWrongAt: mistakeBookRecord.latestWrongAt,
    masteredAt: mistakeBookRecord.masteredAt,
    mistakeBookScope: MISTAKE_BOOK_SCOPE,
    mistakeBookSource: mistakeBookRecord.mistakeBookSource,
    mistakeBookStatus: mistakeBookRecord.mistakeBookStatus,
    publicId: mistakeBookRecord.publicId,
    questionPublicId: mistakeBookRecord.questionPublicId,
    questionType,
    wrongCount: mistakeBookRecord.wrongCount,
  };
}
