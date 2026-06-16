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

describe("organization training publish-version persistence schema", () => {
  const schemaExports = schemaIndex as Record<string, unknown>;
  const organizationTrainingVersion =
    schemaExports.organizationTrainingVersion as
      | Parameters<typeof getTableConfig>[0]
      | undefined;

  it("registers organization training version lifecycle status values", () => {
    expect(schemaExports.organizationTrainingVersionStatusValues).toEqual([
      "published",
      "taken_down",
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
        "taken_down_at",
        "takedown_reason",
        "created_at",
        "updated_at",
      ]),
    );
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
});
