import { randomUUID } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";

import { auditLog, contactConfig, contactConfigQrImage } from "@/db/schema";
import type {
  ContactConfigChannelDto,
  PurchaseGuidanceContactConfigDto,
  UpdateContactConfigInputDto,
} from "../contracts/contact-config-contract";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type ContactConfigAdminRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

export type ContactConfigRepositoryActor = {
  publicId: string;
  role: ContactConfigAdminRole;
  requestIp: string | null;
};

export type ContactConfigQrImageRecord = {
  bytes: Uint8Array;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  publicId: string;
};

export type ContactConfigUpdateResult =
  | { status: "conflict" }
  | {
      status: "updated";
      contactConfig: PurchaseGuidanceContactConfigDto;
    };

export type ContactConfigRuntimeRepository = {
  getActiveContactConfig(): Promise<PurchaseGuidanceContactConfigDto>;
  updateContactConfig(input: {
    actor: ContactConfigRepositoryActor;
    contactConfig: UpdateContactConfigInputDto;
    now: Date;
  }): Promise<ContactConfigUpdateResult>;
  createQrImage(input: {
    actor: ContactConfigRepositoryActor;
    bytes: Uint8Array;
    contentType: ContactConfigQrImageRecord["contentType"];
    now: Date;
    publicId: string;
  }): Promise<ContactConfigQrImageRecord>;
  getQrImage(publicId: string): Promise<ContactConfigQrImageRecord | null>;
};

type ContactConfigRow = {
  channels: ContactConfigChannelDto[];
  public_id: string;
  revision: number;
  safety_notice: string;
  summary: string;
  title: string;
  updated_at: Date;
};

const singletonKey = "purchase_guidance";

function mapContactConfigRow(
  row: ContactConfigRow,
): PurchaseGuidanceContactConfigDto {
  return {
    channels: row.channels,
    publicId: row.public_id,
    revision: row.revision,
    safetyNotice: row.safety_notice,
    summary: row.summary,
    title: row.title,
    updatedAt: row.updated_at.toISOString(),
  };
}

export function createPostgresContactConfigRepository(
  options: RuntimeDatabaseOptions = {},
): ContactConfigRuntimeRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for contact config runtime.",
  );

  return {
    async getActiveContactConfig() {
      const rows = await getDatabase()
        .select()
        .from(contactConfig)
        .where(eq(contactConfig.singleton_key, singletonKey))
        .limit(1);
      const row = rows[0];

      if (row === undefined) {
        throw new Error("Durable contact config is missing.");
      }

      return mapContactConfigRow(row);
    },

    async updateContactConfig(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const rows = await transaction
          .update(contactConfig)
          .set({
            channels: input.contactConfig.channels,
            revision: sql`${contactConfig.revision} + 1`,
            safety_notice: input.contactConfig.safetyNotice,
            summary: input.contactConfig.summary,
            title: input.contactConfig.title,
            updated_at: input.now,
            updated_by_admin_public_id: input.actor.publicId,
          })
          .where(
            and(
              eq(contactConfig.singleton_key, singletonKey),
              eq(contactConfig.revision, input.contactConfig.expectedRevision),
            ),
          )
          .returning();
        const updatedRow = rows[0];

        if (updatedRow === undefined) {
          return { status: "conflict" } as const;
        }

        await transaction.insert(auditLog).values({
          action_type: "contact_config.update",
          actor_public_id: input.actor.publicId,
          actor_role: input.actor.role,
          created_at: input.now,
          metadata_summary: `redacted contact_config update metadata; channelCount=${input.contactConfig.channels.length}; revision=${updatedRow.revision}`,
          public_id: `audit-log-${randomUUID()}`,
          request_ip: input.actor.requestIp,
          result_status: "success",
          target_public_id: updatedRow.public_id,
          target_resource_type: "contact_config",
        });

        return {
          status: "updated",
          contactConfig: mapContactConfigRow(updatedRow),
        } as const;
      });
    },

    async createQrImage(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const record: ContactConfigQrImageRecord = {
          bytes: input.bytes,
          contentType: input.contentType,
          publicId: input.publicId,
        };

        await transaction.insert(contactConfigQrImage).values({
          byte_size: input.bytes.byteLength,
          bytes_base64: Buffer.from(input.bytes).toString("base64"),
          content_type: input.contentType,
          created_at: input.now,
          created_by_admin_public_id: input.actor.publicId,
          public_id: input.publicId,
        });
        await transaction.insert(auditLog).values({
          action_type: "contact_config.qr_image_upload",
          actor_public_id: input.actor.publicId,
          actor_role: input.actor.role,
          created_at: input.now,
          metadata_summary: `redacted contact_config qr image upload metadata; contentType=${input.contentType}; byteSize=${input.bytes.byteLength}`,
          public_id: `audit-log-${randomUUID()}`,
          request_ip: input.actor.requestIp,
          result_status: "success",
          target_public_id: input.publicId,
          target_resource_type: "contact_config",
        });

        return record;
      });
    },

    async getQrImage(publicId) {
      const rows = await getDatabase()
        .select({
          byte_size: contactConfigQrImage.byte_size,
          bytes_base64: contactConfigQrImage.bytes_base64,
          content_type: contactConfigQrImage.content_type,
          public_id: contactConfigQrImage.public_id,
        })
        .from(contactConfigQrImage)
        .where(eq(contactConfigQrImage.public_id, publicId))
        .limit(1);
      const row = rows[0];

      if (
        row === undefined ||
        (row.content_type !== "image/jpeg" &&
          row.content_type !== "image/png" &&
          row.content_type !== "image/webp")
      ) {
        return null;
      }

      const bytes = Uint8Array.from(Buffer.from(row.bytes_base64, "base64"));

      if (bytes.byteLength === 0 || bytes.byteLength !== row.byte_size) {
        return null;
      }

      return {
        bytes,
        contentType: row.content_type,
        publicId: row.public_id,
      };
    },
  };
}
