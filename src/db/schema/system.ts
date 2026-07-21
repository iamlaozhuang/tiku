import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { ContactConfigChannelDto } from "@/server/contracts/contact-config-contract";

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

export const contactConfig = pgTable(
  "contact_config",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    singleton_key: text("singleton_key").default("purchase_guidance").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    channels: jsonb("channels").$type<ContactConfigChannelDto[]>().notNull(),
    safety_notice: text("safety_notice").notNull(),
    revision: integer("revision").default(1).notNull(),
    updated_by_admin_public_id: text("updated_by_admin_public_id").notNull(),
    created_at: createdAtColumn(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("udx_contact_config_public_id").on(table.public_id),
    uniqueIndex("udx_contact_config_singleton_key").on(table.singleton_key),
  ],
);

export const contactConfigQrImage = pgTable(
  "contact_config_qr_image",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    content_type: text("content_type").notNull(),
    bytes_base64: text("bytes_base64").notNull(),
    byte_size: integer("byte_size").notNull(),
    created_by_admin_public_id: text("created_by_admin_public_id").notNull(),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_contact_config_qr_image_public_id").on(table.public_id),
    index("idx_contact_config_qr_image_created_at").on(table.created_at),
  ],
);
