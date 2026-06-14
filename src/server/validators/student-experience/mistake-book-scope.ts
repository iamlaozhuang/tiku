import type { QuestionType } from "@/server/models/paper";
import type { ObjectiveMistakeBookQuestionType } from "@/server/contracts/student-experience/student-experience-contract";

const objectiveMistakeBookQuestionTypes = new Set<QuestionType>([
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
]);

export type MistakeBookObjectiveScopeDecision =
  | {
      mistakeBookScope: "objective_question";
      ok: true;
      questionType: ObjectiveMistakeBookQuestionType;
    }
  | {
      blockedGate: "subjective_mistake_book";
      code: 422031;
      message: "Subjective questions are outside standard mistake_book scope.";
      ok: false;
    };

export function isObjectiveMistakeBookQuestionType(
  questionType: QuestionType,
): questionType is ObjectiveMistakeBookQuestionType {
  return objectiveMistakeBookQuestionTypes.has(questionType);
}

export function createMistakeBookObjectiveScopeDecision(input: {
  questionType: QuestionType;
}): MistakeBookObjectiveScopeDecision {
  if (isObjectiveMistakeBookQuestionType(input.questionType)) {
    return {
      mistakeBookScope: "objective_question",
      ok: true,
      questionType: input.questionType,
    };
  }

  return {
    blockedGate: "subjective_mistake_book",
    code: 422031,
    message: "Subjective questions are outside standard mistake_book scope.",
    ok: false,
  };
}
