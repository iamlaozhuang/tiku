import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  answerRecord,
  answerRecordStatusValues,
  examModeValues,
  examReport,
  examStatusValues,
  learningSuggestionStatusValues,
  mistakeBook,
  mistakeBookSourceValues,
  mistakeBookStatusValues,
  mockExam,
  practice,
  practiceStatusValues,
} from "./student-experience";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function getCheckNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).checks.map((schemaCheck) => schemaCheck.name);
}

describe("student experience schema baseline", () => {
  it("defines the approved Phase 4 table names", () => {
    expect([
      getTableName(practice),
      getTableName(mockExam),
      getTableName(answerRecord),
      getTableName(examReport),
      getTableName(mistakeBook),
    ]).toEqual([
      "practice",
      "mock_exam",
      "answer_record",
      "exam_report",
      "mistake_book",
    ]);
  });

  it("registers the Phase 4 workflow enums", () => {
    expect(examModeValues).toEqual(["practice", "mock_exam"]);
    expect(examStatusValues).toEqual([
      "in_progress",
      "scoring",
      "scoring_partial_failed",
      "completed",
      "terminated",
    ]);
    expect(practiceStatusValues).toEqual([
      "in_progress",
      "completed",
      "expired",
      "terminated",
    ]);
    expect(answerRecordStatusValues).toEqual([
      "draft",
      "saved",
      "submitted",
      "scored",
      "scoring_failed",
    ]);
    expect(mistakeBookSourceValues).toEqual(["wrong_answer", "favorite"]);
    expect(mistakeBookStatusValues).toEqual([
      "unmastered",
      "mastered",
      "removed",
    ]);
    expect(learningSuggestionStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
    ]);
  });

  it("keeps practice and mock exam sessions user-owned with paper snapshots", () => {
    expect(getColumnNames(practice)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "user_id",
        "paper_id",
        "paper_public_id",
        "paper_snapshot",
        "profession",
        "level",
        "subject",
        "practice_status",
        "started_at",
        "last_answered_at",
        "expires_at",
        "terminated_at",
        "termination_reason",
        "authorization_source",
        "authorization_public_id",
        "authorization_organization_public_id",
        "quota_owner_type",
        "quota_owner_public_id",
        "created_at",
        "updated_at",
      ]),
    );
    expect(getColumnNames(mockExam)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "user_id",
        "paper_id",
        "paper_public_id",
        "paper_snapshot",
        "exam_status",
        "server_deadline_at",
        "duration_minute",
        "objective_score",
        "subjective_score",
        "total_score",
        "authorization_source",
        "authorization_public_id",
        "authorization_organization_public_id",
        "quota_owner_type",
        "quota_owner_public_id",
      ]),
    );
  });

  it("keeps authorization lineage either legacy-null or source-coherent", () => {
    expect(getCheckNames(practice)).toEqual(
      expect.arrayContaining([
        "chk_practice_authorization_lineage_completeness",
        "chk_practice_authorization_lineage_source",
      ]),
    );
    expect(getCheckNames(mockExam)).toEqual(
      expect.arrayContaining([
        "chk_mock_exam_authorization_lineage_completeness",
        "chk_mock_exam_authorization_lineage_source",
      ]),
    );
  });

  it("stores answers, reports, and mistake book records with stable snapshots", () => {
    expect(getColumnNames(answerRecord)).toEqual(
      expect.arrayContaining([
        "public_id",
        "user_id",
        "exam_mode",
        "practice_id",
        "mock_exam_id",
        "paper_question_public_id",
        "question_public_id",
        "question_snapshot",
        "answer_snapshot",
        "answer_record_status",
        "is_correct",
        "score",
        "max_score",
      ]),
    );
    expect(getColumnNames(examReport)).toEqual(
      expect.arrayContaining([
        "public_id",
        "mock_exam_id",
        "report_snapshot",
        "learning_suggestion_snapshot",
        "generated_at",
      ]),
    );
    expect(getColumnNames(mistakeBook)).toEqual(
      expect.arrayContaining([
        "public_id",
        "question_public_id",
        "paper_question_public_id",
        "question_snapshot",
        "latest_answer_snapshot",
        "mistake_book_source",
        "mistake_book_status",
        "wrong_count",
        "is_favorite",
        "is_removed",
        "mastered_at",
        "latest_wrong_at",
      ]),
    );
  });

  it("enforces database-backed practice attempts and one mistake-book row per user question", () => {
    expect(getColumnNames(answerRecord)).toEqual(
      expect.arrayContaining([
        "practice_attempt_number",
        "practice_max_attempt_count",
      ]),
    );
    expect(getCheckNames(answerRecord)).toEqual(
      expect.arrayContaining([
        "chk_answer_record_practice_attempt_completeness",
        "chk_answer_record_practice_attempt_mode",
        "chk_answer_record_practice_attempt_bounds",
      ]),
    );
    expect(getIndexNames(answerRecord)).toContain(
      "udx_answer_record_practice_question_attempt",
    );
    expect(getIndexNames(mistakeBook)).toContain(
      "udx_mistake_book_user_id_question_public_id",
    );
  });

  it("uses contract index names for public lookup, ownership, and status filters", () => {
    expect(getIndexNames(practice)).toEqual(
      expect.arrayContaining([
        "udx_practice_public_id",
        "udx_practice_user_id_paper_id_active",
        "idx_practice_user_id",
        "idx_practice_user_id_paper_id_practice_status",
      ]),
    );
    expect(getIndexNames(mockExam)).toEqual(
      expect.arrayContaining([
        "udx_mock_exam_public_id",
        "udx_mock_exam_user_id_paper_id_active",
      ]),
    );
    expect(getIndexNames(answerRecord)).toEqual(
      expect.arrayContaining([
        "udx_answer_record_public_id",
        "idx_answer_record_user_id",
        "idx_answer_record_exam_mode",
      ]),
    );
    expect(getIndexNames(examReport)).toContain("udx_exam_report_mock_exam_id");
    expect(getIndexNames(mistakeBook)).toEqual(
      expect.arrayContaining([
        "udx_mistake_book_public_id",
        "idx_mistake_book_user_id",
        "idx_mistake_book_mistake_book_status",
      ]),
    );
  });
});
expect(getColumnNames(examReport)).toEqual(
  expect.arrayContaining([
    "learning_suggestion_status",
    "learning_suggestion_attempt_count",
    "learning_suggestion_input_digest",
    "learning_suggestion_claimed_at",
    "learning_suggestion_completed_at",
    "learning_suggestion_failure_category",
  ]),
);
expect(getCheckNames(examReport)).toContain(
  "chk_exam_report_learning_suggestion_lifecycle",
);
expect(getIndexNames(examReport)).toContain(
  "idx_exam_report_learning_suggestion_status_updated_at",
);
