import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const createdAtColumn = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const auditLog = pgTable(
  "audit_log",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_public_id: text("actor_public_id").notNull(),
    actor_role: text("actor_role").notNull(),
    action_type: text("action_type").notNull(),
    target_resource_type: text("target_resource_type").notNull(),
    target_public_id: text("target_public_id"),
    result_status: text("result_status").notNull(),
    metadata_summary: text("metadata_summary"),
    request_ip: text("request_ip"),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_audit_log_public_id").on(table.public_id),
    index("idx_audit_log_actor_public_id").on(table.actor_public_id),
    index("idx_audit_log_action_type_result_status").on(
      table.action_type,
      table.result_status,
    ),
    index("idx_audit_log_target_resource_type_target_public_id").on(
      table.target_resource_type,
      table.target_public_id,
    ),
    index("idx_audit_log_created_at").on(table.created_at),
  ],
);
