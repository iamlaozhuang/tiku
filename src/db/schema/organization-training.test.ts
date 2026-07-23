import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schemaIndex from "./index";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function getForeignKeyNames(
  table: Parameters<typeof getTableConfig>[0],
): string[] {
  return getTableConfig(table).foreignKeys.map((foreignKey) =>
    foreignKey.getName(),
  );
}

function getCheckNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).checks.map((tableCheck) => tableCheck.name);
}

describe("organization training publish-version persistence schema", () => {
  const schemaExports = schemaIndex as Record<string, unknown>;
  const organizationTrainingVersion =
    schemaExports.organizationTrainingVersion as
      | Parameters<typeof getTableConfig>[0]
      | undefined;
  const organizationTrainingAnswer =
    schemaExports.organizationTrainingAnswer as
      | Parameters<typeof getTableConfig>[0]
      | undefined;
  const organizationTrainingDraft = schemaExports.organizationTrainingDraft as
    | Parameters<typeof getTableConfig>[0]
    | undefined;
  const organizationTrainingSourceContext =
    schemaExports.organizationTrainingSourceContext as
      | Parameters<typeof getTableConfig>[0]
      | undefined;
  const organizationTrainingVersionRecipient =
    schemaExports.organizationTrainingVersionRecipient as
      | Parameters<typeof getTableConfig>[0]
      | undefined;

  it("registers organization training version lifecycle status values", () => {
    expect(schemaExports.organizationTrainingVersionStatusValues).toEqual([
      "published",
      "taken_down",
    ]);
  });

  it("registers organization training answer lifecycle status values", () => {
    expect(schemaExports.organizationTrainingAnswerStatusValues).toEqual([
      "in_progress",
      "scoring",
      "submitted",
      "scoring_failed",
      "read_only",
    ]);
  });

  it("defines an isolated published version table for organization training", () => {
    expect(organizationTrainingVersion).toBeDefined();

    if (organizationTrainingVersion === undefined) {
      return;
    }

    expect(getTableName(organizationTrainingVersion)).toBe(
      "organization_training_version",
    );
    expect(getColumnNames(organizationTrainingVersion)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "draft_public_id",
        "version_number",
        "organization_id",
        "organization_public_id",
        "org_auth_id",
        "authorization_source",
        "authorization_public_id",
        "owner_type",
        "owner_public_id",
        "quota_owner_type",
        "quota_owner_public_id",
        "publish_scope_snapshot",
        "recipient_snapshot_schema_version",
        "recipient_snapshot_captured_at",
        "recipient_snapshot_count",
        "recipient_snapshot_digest",
        "profession",
        "level",
        "subject",
        "title",
        "description",
        "question_count",
        "total_score",
        "question_type_summary",
        "version_status",
        "published_at",
        "answer_deadline_at",
        "taken_down_at",
        "takedown_reason",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("defines a legacy-safe immutable recipient snapshot schema", () => {
    expect(organizationTrainingVersionRecipient).toBeDefined();

    if (
      organizationTrainingVersion === undefined ||
      organizationTrainingVersionRecipient === undefined
    ) {
      return;
    }

    expect(getTableName(organizationTrainingVersionRecipient)).toBe(
      "organization_training_version_recipient",
    );
    expect(getColumnNames(organizationTrainingVersionRecipient)).toEqual([
      "id",
      "organization_training_version_id",
      "employee_public_id",
      "organization_public_id",
      "authorization_public_id",
      "created_at",
    ]);
    expect(getCheckNames(organizationTrainingVersion)).toContain(
      "chk_organization_training_version_recipient_snapshot",
    );
    expect(getForeignKeyNames(organizationTrainingVersionRecipient)).toEqual([
      "fk_organization_training_version_recipient_version",
    ]);
    expect(getIndexNames(organizationTrainingVersionRecipient)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_version_recipient_version_employee",
        "idx_organization_training_version_recipient_version_id",
        "idx_organization_training_version_recipient_org_employee",
      ]),
    );
    expect(
      [
        ...getCheckNames(organizationTrainingVersion),
        ...getForeignKeyNames(organizationTrainingVersionRecipient),
        ...getIndexNames(organizationTrainingVersionRecipient),
      ].every((identifierName) => identifierName.length <= 63),
    ).toBe(true);
  });

  it("keeps organization training persistence away from formal and provider columns", () => {
    expect(organizationTrainingVersion).toBeDefined();

    if (organizationTrainingVersion === undefined) {
      return;
    }

    expect(getColumnNames(organizationTrainingVersion)).not.toEqual(
      expect.arrayContaining([
        "question_id",
        "paper_id",
        "practice_id",
        "mock_exam_id",
        "answer_record_id",
        "exam_report_id",
        "mistake_book_id",
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_answer",
        "raw_generated_content",
        "generated_content",
        "standard_answer",
        "analysis",
        "employee_answer",
      ]),
    );
  });

  it("adds public-id, lineage, lifecycle, and scope indexes with named foreign keys", () => {
    expect(organizationTrainingVersion).toBeDefined();

    if (organizationTrainingVersion === undefined) {
      return;
    }

    expect(getIndexNames(organizationTrainingVersion)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_version_public_id",
        "udx_organization_training_version_draft_version",
        "idx_organization_training_version_organization_id",
        "idx_organization_training_version_org_auth_id",
        "idx_organization_training_version_org_published_at",
        "idx_organization_training_version_version_status",
        "idx_organization_training_version_profession_level_subject",
        "idx_organization_training_version_answer_deadline",
      ]),
    );
    expect(getForeignKeyNames(organizationTrainingVersion)).toEqual(
      expect.arrayContaining([
        "fk_organization_training_version_organization",
        "fk_organization_training_version_org_auth",
      ]),
    );
    expect(
      [
        ...getIndexNames(organizationTrainingVersion),
        ...getForeignKeyNames(organizationTrainingVersion),
      ].every((identifierName) => identifierName.length <= 63),
    ).toBe(true);
  });

  it("defines a metadata-only official answer source for organization training analytics", () => {
    expect(organizationTrainingAnswer).toBeDefined();

    if (organizationTrainingAnswer === undefined) {
      return;
    }

    expect(getTableName(organizationTrainingAnswer)).toBe(
      "organization_training_answer",
    );
    expect(getColumnNames(organizationTrainingAnswer)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "organization_training_version_id",
        "organization_training_version_public_id",
        "employee_id",
        "employee_public_id",
        "organization_id",
        "organization_public_id",
        "organization_training_answer_status",
        "score",
        "total_score",
        "submitted_at",
        "answer_organization_snapshot",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps organization training answer source free of raw content and provider payload columns", () => {
    expect(organizationTrainingAnswer).toBeDefined();

    if (organizationTrainingAnswer === undefined) {
      return;
    }

    expect(getColumnNames(organizationTrainingAnswer)).not.toEqual(
      expect.arrayContaining([
        "question_id",
        "paper_id",
        "practice_id",
        "mock_exam_id",
        "answer_record_id",
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_answer",
        "raw_generated_content",
        "generated_content",
        "standard_answer",
        "analysis",
        "answer_snapshot",
        "employee_answer",
      ]),
    );
  });

  it("adds official-answer lookup indexes and named foreign keys", () => {
    expect(organizationTrainingAnswer).toBeDefined();

    if (organizationTrainingAnswer === undefined) {
      return;
    }

    expect(getIndexNames(organizationTrainingAnswer)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_answer_public_id",
        "udx_organization_training_answer_version_employee",
        "idx_organization_training_answer_version_id",
        "idx_organization_training_answer_employee_id",
        "idx_organization_training_answer_org_submitted_at",
        "idx_organization_training_answer_status_submitted_at",
      ]),
    );
    expect(getForeignKeyNames(organizationTrainingAnswer)).toEqual(
      expect.arrayContaining([
        "fk_organization_training_answer_version",
        "fk_organization_training_answer_employee",
        "fk_organization_training_answer_organization",
      ]),
    );
    expect(
      [
        ...getIndexNames(organizationTrainingAnswer),
        ...getForeignKeyNames(organizationTrainingAnswer),
      ].every((identifierName) => identifierName.length <= 63),
    ).toBe(true);
  });

  it("defines a metadata-only draft table for manual creation and copy lineage", () => {
    expect(organizationTrainingDraft).toBeDefined();

    if (organizationTrainingDraft === undefined) {
      return;
    }

    expect(getTableName(organizationTrainingDraft)).toBe(
      "organization_training_draft",
    );
    expect(getColumnNames(organizationTrainingDraft)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "source_task_public_id",
        "source_version_public_id",
        "organization_id",
        "organization_public_id",
        "org_auth_id",
        "authorization_source",
        "authorization_public_id",
        "owner_type",
        "owner_public_id",
        "quota_owner_type",
        "quota_owner_public_id",
        "profession",
        "level",
        "subject",
        "title",
        "description",
        "question_count",
        "total_score",
        "question_type_summary",
        "evidence_status",
        "validation_status",
        "retention_status",
        "created_at",
        "updated_at",
        "expires_at",
      ]),
    );
  });

  it("keeps draft persistence free of formal paper and provider payload columns", () => {
    expect(organizationTrainingDraft).toBeDefined();

    if (organizationTrainingDraft === undefined) {
      return;
    }

    expect(getColumnNames(organizationTrainingDraft)).not.toEqual(
      expect.arrayContaining([
        "question_id",
        "paper_id",
        "mock_exam_id",
        "answer_record_id",
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_answer",
        "raw_generated_content",
        "generated_content",
        "standard_answer",
        "analysis",
        "question_body",
      ]),
    );
  });

  it("adds draft lookup, lineage, lifecycle, and scope indexes with named foreign keys", () => {
    expect(organizationTrainingDraft).toBeDefined();

    if (organizationTrainingDraft === undefined) {
      return;
    }

    expect(getIndexNames(organizationTrainingDraft)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_draft_public_id",
        "idx_organization_training_draft_organization_id",
        "idx_organization_training_draft_org_auth_id",
        "idx_organization_training_draft_scope",
        "idx_organization_training_draft_retention",
        "idx_organization_training_draft_source_task",
        "idx_organization_training_draft_source_version",
      ]),
    );
    expect(getForeignKeyNames(organizationTrainingDraft)).toEqual(
      expect.arrayContaining([
        "fk_organization_training_draft_organization",
        "fk_organization_training_draft_org_auth",
      ]),
    );
    expect(
      [
        ...getIndexNames(organizationTrainingDraft),
        ...getForeignKeyNames(organizationTrainingDraft),
      ].every((identifierName) => identifierName.length <= 63),
    ).toBe(true);
  });

  it("defines a metadata-only source context table for draft source attachments", () => {
    expect(organizationTrainingSourceContext).toBeDefined();

    if (organizationTrainingSourceContext === undefined) {
      return;
    }

    expect(getTableName(organizationTrainingSourceContext)).toBe(
      "organization_training_source_context",
    );
    expect(getColumnNames(organizationTrainingSourceContext)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "organization_training_draft_id",
        "organization_training_draft_public_id",
        "organization_id",
        "organization_public_id",
        "org_auth_id",
        "authorization_source",
        "authorization_public_id",
        "source_type",
        "source_public_id",
        "title",
        "profession",
        "level",
        "subject",
        "question_count",
        "total_score",
        "source_status",
        "redaction_status",
        "formal_usage_policy",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps source context persistence free of formal and raw content columns", () => {
    expect(organizationTrainingSourceContext).toBeDefined();

    if (organizationTrainingSourceContext === undefined) {
      return;
    }

    expect(getColumnNames(organizationTrainingSourceContext)).not.toEqual(
      expect.arrayContaining([
        "question_id",
        "paper_id",
        "mock_exam_id",
        "answer_record_id",
        "question_body",
        "standard_answer",
        "analysis",
        "prompt",
        "prompt_text",
        "provider_payload",
        "raw_answer",
        "raw_generated_content",
        "generated_content",
      ]),
    );
  });

  it("adds source context lookup indexes and named foreign keys", () => {
    expect(organizationTrainingSourceContext).toBeDefined();

    if (organizationTrainingSourceContext === undefined) {
      return;
    }

    expect(getIndexNames(organizationTrainingSourceContext)).toEqual(
      expect.arrayContaining([
        "udx_organization_training_source_context_public_id",
        "udx_organization_training_source_context_draft_source",
        "idx_organization_training_source_context_draft_id",
        "idx_organization_training_source_context_organization_id",
        "idx_organization_training_source_context_org_auth_id",
        "idx_organization_training_source_context_source",
      ]),
    );
    expect(getForeignKeyNames(organizationTrainingSourceContext)).toEqual(
      expect.arrayContaining([
        "fk_organization_training_source_context_draft",
        "fk_organization_training_source_context_organization",
        "fk_organization_training_source_context_org_auth",
      ]),
    );
    expect(
      [
        ...getIndexNames(organizationTrainingSourceContext),
        ...getForeignKeyNames(organizationTrainingSourceContext),
      ].every((identifierName) => identifierName.length <= 63),
    ).toBe(true);
  });
});
