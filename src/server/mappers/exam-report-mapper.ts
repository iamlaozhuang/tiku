import type {
  ExamReportDetailDto,
  ExamReportSummaryDto,
  LearningSuggestionFailureCategory,
  LearningSuggestionLifecycleDto,
} from "../contracts/exam-report-contract";
import type { ExamReportRow } from "../repositories/exam-report-repository";

export const EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS = 3;
export const EXAM_REPORT_LEARNING_SUGGESTION_TIMEOUT_MS = 30_000;
export const EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS = 60_000;
export const EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS = 120_000;

const failureCategories = new Set<LearningSuggestionFailureCategory>([
  "configuration_unavailable",
  "input_unavailable",
  "provider_failed",
  "timeout",
]);

export class ExamReportLearningSuggestionLifecycleIntegrityError extends Error {
  constructor() {
    super("Exam report learning suggestion lifecycle is invalid.");
    this.name = "ExamReportLearningSuggestionLifecycleIntegrityError";
  }
}

function isSha256(value: string | null): value is string {
  return value !== null && /^[0-9a-f]{64}$/u.test(value);
}

export function projectExamReportLearningSuggestionLifecycle(
  examReport: ExamReportRow,
  now = new Date(),
): LearningSuggestionLifecycleDto {
  const status = examReport.learning_suggestion_status;
  const attemptCount = examReport.learning_suggestion_attempt_count;
  const digest = examReport.learning_suggestion_input_digest;
  const claimedAt = examReport.learning_suggestion_claimed_at;
  const completedAt = examReport.learning_suggestion_completed_at;
  const failureCategory = examReport.learning_suggestion_failure_category;
  const snapshot = examReport.learning_suggestion_snapshot;

  if (status === null) {
    if (
      attemptCount !== null ||
      digest !== null ||
      claimedAt !== null ||
      completedAt !== null ||
      failureCategory !== null
    ) {
      throw new ExamReportLearningSuggestionLifecycleIntegrityError();
    }
    return { status: "unavailable", failureCategory: null, canRetry: false };
  }

  if (examReport.exam_status !== "completed") {
    throw new ExamReportLearningSuggestionLifecycleIntegrityError();
  }

  if (status === "pending") {
    if (
      attemptCount !== 0 ||
      digest !== null ||
      claimedAt !== null ||
      completedAt !== null ||
      failureCategory !== null ||
      snapshot !== null
    ) {
      throw new ExamReportLearningSuggestionLifecycleIntegrityError();
    }
    return {
      status,
      failureCategory: null,
      canRetry:
        now.getTime() - examReport.updated_at.getTime() >=
        EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS,
    };
  }

  if (
    status === "failed" &&
    attemptCount === 0 &&
    digest === null &&
    claimedAt === null &&
    completedAt !== null &&
    failureCategory === "input_unavailable" &&
    snapshot === null
  ) {
    return { status, failureCategory, canRetry: false };
  }

  if (
    attemptCount === null ||
    attemptCount < 1 ||
    attemptCount > EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS ||
    !isSha256(digest) ||
    claimedAt === null
  ) {
    throw new ExamReportLearningSuggestionLifecycleIntegrityError();
  }

  if (status === "running") {
    if (completedAt !== null || failureCategory !== null || snapshot !== null) {
      throw new ExamReportLearningSuggestionLifecycleIntegrityError();
    }
    return {
      status,
      failureCategory: null,
      canRetry:
        attemptCount < EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS &&
        now.getTime() - claimedAt.getTime() >=
          EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS,
    };
  }

  if (status === "succeeded") {
    if (completedAt === null || failureCategory !== null || snapshot === null) {
      throw new ExamReportLearningSuggestionLifecycleIntegrityError();
    }
    return { status, failureCategory: null, canRetry: false };
  }

  if (
    status !== "failed" ||
    completedAt === null ||
    failureCategory === null ||
    !failureCategories.has(failureCategory) ||
    snapshot !== null
  ) {
    throw new ExamReportLearningSuggestionLifecycleIntegrityError();
  }
  return {
    status,
    failureCategory,
    canRetry:
      failureCategory !== "input_unavailable" &&
      attemptCount < EXAM_REPORT_LEARNING_SUGGESTION_MAX_ATTEMPTS,
  };
}

export function mapExamReportSummaryToApi(
  examReport: ExamReportRow,
): ExamReportSummaryDto {
  return {
    publicId: examReport.public_id,
    examReportPublicId: examReport.exam_report_public_id,
    mockExamPublicId: examReport.mock_exam_public_id,
    paperPublicId: examReport.paper_public_id,
    paperName: examReport.paper_name,
    profession: examReport.profession,
    level: examReport.level,
    subject: examReport.subject,
    examStatus: examReport.exam_status,
    objectiveScore: examReport.objective_score,
    subjectiveScore: examReport.subjective_score,
    totalScore: examReport.total_score,
    durationSecond: examReport.duration_second,
    startedAt: examReport.started_at.toISOString(),
    generatedAt: examReport.generated_at.toISOString(),
  };
}

export function mapExamReportDetailToApi(
  examReport: ExamReportRow,
  now = new Date(),
): ExamReportDetailDto {
  return {
    ...mapExamReportSummaryToApi(examReport),
    reportSnapshot: examReport.report_snapshot,
    learningSuggestionSnapshot: examReport.learning_suggestion_snapshot,
    learningSuggestionLifecycle: projectExamReportLearningSuggestionLifecycle(
      examReport,
      now,
    ),
  };
}
