import { randomUUID } from "node:crypto";

import { and, eq, inArray } from "drizzle-orm";

import {
  admin,
  auditLog,
  contentImage,
  contentImageUploadOperation,
} from "@/db/schema";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import type { Profession } from "../models/paper";

export type ContentImageAccessRow = {
  id: number;
  public_id: string;
  profession: Profession;
  object_key: string;
  content_type: string;
  file_size_byte: number;
  file_hash: string;
  created_at: Date;
};

export type ContentImageMutationContext = {
  actorPublicId: string;
  auditLog: {
    actorRole: string;
    actionType: "content_image.create";
    metadataSummary: string;
    requestIp: string | null;
  };
};

export type ContentImageRepository = {
  prepareContentImageUpload(input: {
    operationPublicId: string;
    contentImagePublicId: string;
    actorPublicId: string;
    idempotencyKeyHash: string;
    requestFingerprint: string;
    profession: Profession;
    objectKey: string;
    contentType: string;
    fileSizeByte: number;
    fileHash: string;
  }): Promise<
    | { status: "prepared"; operationPublicId: string; objectKey: string }
    | { status: "completed"; contentImage: ContentImageAccessRow }
    | { status: "conflict" }
  >;
  markContentImageUploadFileStored(operationPublicId: string): Promise<boolean>;
  completeContentImageUpload(input: {
    operationPublicId: string;
    requestFingerprint: string;
    mutationContext: ContentImageMutationContext;
  }): Promise<
    | {
        status: "completed";
        contentImage: ContentImageAccessRow;
        replayed: boolean;
      }
    | { status: "conflict" }
  >;
  recordContentImageUploadFailure(input: {
    operationPublicId: string;
    failureMessageDigest: string;
  }): Promise<void>;
  findContentImageByPublicId(
    publicId: string,
  ): Promise<ContentImageAccessRow | null>;
  findExistingContentImagePublicIds(publicIds: string[]): Promise<string[]>;
};

async function resolveActorAdminId(
  database: RuntimeDatabase,
  actorPublicId: string,
): Promise<number> {
  const [row] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.public_id, actorPublicId))
    .limit(1);

  if (row === undefined) {
    throw new Error("Content image mutation admin actor does not exist.");
  }

  return row.id;
}

async function findById(
  database: RuntimeDatabase,
  id: number,
): Promise<ContentImageAccessRow | null> {
  const [row] = await database
    .select()
    .from(contentImage)
    .where(eq(contentImage.id, id))
    .limit(1);
  return row ?? null;
}

export function createPostgresContentImageRepository(
  options: RuntimeDatabaseOptions = {},
): ContentImageRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for content_image runtime.",
  );

  return {
    async prepareContentImageUpload(input) {
      return getDatabase().transaction(async (transaction) => {
        const database = transaction as RuntimeDatabase;
        const actorAdminId = await resolveActorAdminId(
          database,
          input.actorPublicId,
        );
        const [inserted] = await database
          .insert(contentImageUploadOperation)
          .values({
            public_id: input.operationPublicId,
            actor_admin_id: actorAdminId,
            content_image_public_id: input.contentImagePublicId,
            idempotency_key_hash: input.idempotencyKeyHash,
            request_fingerprint: input.requestFingerprint,
            profession: input.profession,
            object_key: input.objectKey,
            content_type: input.contentType,
            file_size_byte: input.fileSizeByte,
            file_hash: input.fileHash,
            operation_status: "pending",
          })
          .onConflictDoNothing({
            target: contentImageUploadOperation.idempotency_key_hash,
          })
          .returning();
        const operation =
          inserted ??
          (
            await database
              .select()
              .from(contentImageUploadOperation)
              .where(
                eq(
                  contentImageUploadOperation.idempotency_key_hash,
                  input.idempotencyKeyHash,
                ),
              )
              .limit(1)
              .for("update")
          )[0];

        if (
          operation === undefined ||
          operation.actor_admin_id !== actorAdminId ||
          operation.request_fingerprint !== input.requestFingerprint
        ) {
          return { status: "conflict" as const };
        }

        if (operation.operation_status === "completed") {
          const completed =
            operation.content_image_id === null
              ? null
              : await findById(database, operation.content_image_id);
          return completed === null
            ? { status: "conflict" as const }
            : { status: "completed" as const, contentImage: completed };
        }

        if (operation.operation_status === "failed") {
          await database
            .update(contentImageUploadOperation)
            .set({
              operation_status: "pending",
              file_stored_at: null,
              last_failure_message_digest: null,
              updated_at: new Date(),
            })
            .where(eq(contentImageUploadOperation.id, operation.id));
        }

        return {
          status: "prepared" as const,
          operationPublicId: operation.public_id,
          objectKey: operation.object_key,
        };
      });
    },

    async markContentImageUploadFileStored(operationPublicId) {
      const database = getDatabase();
      const [row] = await database
        .update(contentImageUploadOperation)
        .set({
          operation_status: "file_stored",
          file_stored_at: new Date(),
          last_failure_message_digest: null,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(contentImageUploadOperation.public_id, operationPublicId),
            inArray(contentImageUploadOperation.operation_status, [
              "pending",
              "file_stored",
            ]),
          ),
        )
        .returning({ id: contentImageUploadOperation.id });
      if (row !== undefined) {
        return true;
      }
      const [completed] = await database
        .select({
          operation_status: contentImageUploadOperation.operation_status,
        })
        .from(contentImageUploadOperation)
        .where(eq(contentImageUploadOperation.public_id, operationPublicId))
        .limit(1);
      return completed?.operation_status === "completed";
    },

    async completeContentImageUpload(input) {
      return getDatabase().transaction(async (transaction) => {
        const database = transaction as RuntimeDatabase;
        const actorAdminId = await resolveActorAdminId(
          database,
          input.mutationContext.actorPublicId,
        );
        const [operation] = await database
          .select()
          .from(contentImageUploadOperation)
          .where(
            eq(contentImageUploadOperation.public_id, input.operationPublicId),
          )
          .limit(1)
          .for("update");

        if (
          operation === undefined ||
          operation.actor_admin_id !== actorAdminId ||
          operation.request_fingerprint !== input.requestFingerprint ||
          input.mutationContext.auditLog.actionType !== "content_image.create"
        ) {
          return { status: "conflict" as const };
        }

        if (operation.operation_status === "completed") {
          const completed =
            operation.content_image_id === null
              ? null
              : await findById(database, operation.content_image_id);
          return completed === null
            ? { status: "conflict" as const }
            : {
                status: "completed" as const,
                contentImage: completed,
                replayed: true,
              };
        }

        if (operation.operation_status !== "file_stored") {
          return { status: "conflict" as const };
        }

        const [created] = await database
          .insert(contentImage)
          .values({
            public_id: operation.content_image_public_id,
            profession: operation.profession,
            object_key: operation.object_key,
            content_type: operation.content_type,
            file_size_byte: operation.file_size_byte,
            file_hash: operation.file_hash,
            created_by_admin_id: actorAdminId,
          })
          .returning({
            id: contentImage.id,
            public_id: contentImage.public_id,
          });

        if (created === undefined) {
          throw new Error("Content image insert did not return a row.");
        }

        await database.insert(auditLog).values({
          public_id: `audit-log-${randomUUID()}`,
          actor_public_id: input.mutationContext.actorPublicId,
          actor_role: input.mutationContext.auditLog.actorRole,
          action_type: "content_image.create",
          target_resource_type: "content_image",
          target_public_id: created.public_id,
          result_status: "success",
          metadata_summary: "redacted content_image upload metadata",
          request_ip: input.mutationContext.auditLog.requestIp,
        });
        await database
          .update(contentImageUploadOperation)
          .set({
            content_image_id: created.id,
            operation_status: "completed",
            completed_at: new Date(),
            last_failure_message_digest: null,
            updated_at: new Date(),
          })
          .where(eq(contentImageUploadOperation.id, operation.id));
        const completed = await findById(database, created.id);

        if (completed === null) {
          throw new Error("Completed content image could not be reloaded.");
        }

        return {
          status: "completed" as const,
          contentImage: completed,
          replayed: false,
        };
      });
    },

    async recordContentImageUploadFailure(input) {
      await getDatabase()
        .update(contentImageUploadOperation)
        .set({
          operation_status: "failed",
          last_failure_message_digest: input.failureMessageDigest,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(contentImageUploadOperation.public_id, input.operationPublicId),
            inArray(contentImageUploadOperation.operation_status, [
              "pending",
              "file_stored",
              "failed",
            ]),
          ),
        );
    },

    async findContentImageByPublicId(publicId) {
      const [row] = await getDatabase()
        .select()
        .from(contentImage)
        .where(eq(contentImage.public_id, publicId))
        .limit(1);
      return row ?? null;
    },

    async findExistingContentImagePublicIds(publicIds) {
      if (publicIds.length === 0) {
        return [];
      }
      const rows = await getDatabase()
        .select({ public_id: contentImage.public_id })
        .from(contentImage)
        .where(inArray(contentImage.public_id, [...new Set(publicIds)]));
      return rows.map((row) => row.public_id);
    },
  };
}
