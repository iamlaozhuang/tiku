import {
  multiChoiceRuleValues,
  questionTypeValues,
  scoringMethodValues,
  type MultiChoiceRule,
  type QuestionType,
  type ScoringMethod,
} from "@/server/models/paper";

export type QuestionScoringContractIssue =
  | "scoring_method_mismatch"
  | "multi_choice_rule_mismatch";

export type QuestionScoringContractInput = {
  questionType: QuestionType;
  scoringMethod: ScoringMethod;
  multiChoiceRule: MultiChoiceRule;
};

const objectiveQuestionTypes = new Set<QuestionType>([
  "single_choice",
  "multi_choice",
  "true_false",
]);
const subjectiveQuestionTypes = new Set<QuestionType>([
  "short_answer",
  "case_analysis",
  "calculation",
]);
const knownQuestionTypes = new Set<unknown>(questionTypeValues);
const knownScoringMethods = new Set<unknown>(scoringMethodValues);
const knownMultiChoiceRules = new Set<unknown>(multiChoiceRuleValues);

export function isQuestionScoringContractValid(input: {
  questionType: unknown;
  scoringMethod: unknown;
  multiChoiceRule: unknown;
}): input is QuestionScoringContractInput {
  return (
    knownQuestionTypes.has(input.questionType) &&
    knownScoringMethods.has(input.scoringMethod) &&
    knownMultiChoiceRules.has(input.multiChoiceRule) &&
    getQuestionScoringContractIssues(input as QuestionScoringContractInput)
      .length === 0
  );
}

export function getDefaultScoringConfiguration(
  questionType: QuestionType,
): Pick<QuestionScoringContractInput, "scoringMethod" | "multiChoiceRule"> {
  return {
    scoringMethod: subjectiveQuestionTypes.has(questionType)
      ? "ai_scoring"
      : "auto_match",
    multiChoiceRule: "all_correct_only",
  };
}

export function getQuestionScoringContractIssues(
  input: QuestionScoringContractInput,
): QuestionScoringContractIssue[] {
  const issues: QuestionScoringContractIssue[] = [];
  const scoringMethodIsValid =
    knownQuestionTypes.has(input.questionType) &&
    knownScoringMethods.has(input.scoringMethod) &&
    ((objectiveQuestionTypes.has(input.questionType) &&
      input.scoringMethod === "auto_match") ||
      (subjectiveQuestionTypes.has(input.questionType) &&
        input.scoringMethod === "ai_scoring") ||
      (input.questionType === "fill_blank" &&
        (input.scoringMethod === "auto_match" ||
          input.scoringMethod === "ai_scoring")));

  if (!scoringMethodIsValid) {
    issues.push("scoring_method_mismatch");
  }

  if (
    !knownMultiChoiceRules.has(input.multiChoiceRule) ||
    (input.questionType !== "multi_choice" &&
      input.multiChoiceRule !== "all_correct_only")
  ) {
    issues.push("multi_choice_rule_mismatch");
  }

  return issues;
}

export function isObjectiveAutoScoredQuestion(
  input: Pick<QuestionScoringContractInput, "questionType" | "scoringMethod">,
): boolean {
  return (
    input.scoringMethod === "auto_match" &&
    (objectiveQuestionTypes.has(input.questionType) ||
      input.questionType === "fill_blank")
  );
}
