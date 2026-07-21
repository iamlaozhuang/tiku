import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { auditLog, contactConfig, contactConfigQrImage } from "./system";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

describe("system audit log schema", () => {
  it("defines the audit_log table with redaction-safe columns", () => {
    expect(getTableName(auditLog)).toBe("audit_log");
    expect(getColumnNames(auditLog)).toEqual(
      expect.arrayContaining([
        "id",
        "public_id",
        "actor_public_id",
        "actor_role",
        "action_type",
        "target_resource_type",
        "target_public_id",
        "result_status",
        "metadata_summary",
        "request_ip",
        "created_at",
      ]),
    );
  });

  it("indexes audit_log by public id, actor, action, target, and created time", () => {
    expect(getIndexNames(auditLog)).toEqual(
      expect.arrayContaining([
        "udx_audit_log_public_id",
        "idx_audit_log_actor_public_id",
        "idx_audit_log_action_type_result_status",
        "idx_audit_log_target_resource_type_target_public_id",
        "idx_audit_log_created_at",
      ]),
    );
  });
});

describe("system contact config schema", () => {
  it("defines one revisioned contact_config row and durable QR media", () => {
    expect(getTableName(contactConfig)).toBe("contact_config");
    expect(getColumnNames(contactConfig)).toEqual(
      expect.arrayContaining([
        "public_id",
        "title",
        "summary",
        "channels",
        "safety_notice",
        "revision",
        "updated_by_admin_public_id",
        "created_at",
        "updated_at",
      ]),
    );

    expect(getTableName(contactConfigQrImage)).toBe("contact_config_qr_image");
    expect(getColumnNames(contactConfigQrImage)).toEqual(
      expect.arrayContaining([
        "public_id",
        "content_type",
        "bytes_base64",
        "byte_size",
        "created_by_admin_public_id",
        "created_at",
      ]),
    );
  });
});
