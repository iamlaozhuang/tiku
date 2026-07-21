import { randomUUID } from "node:crypto";

import { auditLog } from "@/db/schema";
import type { RuntimeDatabase } from "./runtime-database";

export type ContentMutationAuditInput = {
  actorRole: string;
  actionType: string;
  targetResourceType: "question" | "material" | "paper" | "paper_question";
  metadataSummary: string;
  requestIp: string | null;
};

export type ContentMutationContext = {
  actorPublicId: string;
  auditLog?: ContentMutationAuditInput;
};

export async function appendContentMutationAuditLog(
  database: RuntimeDatabase,
  context: ContentMutationContext | undefined,
  targetPublicId: string,
): Promise<void> {
  if (context?.auditLog === undefined) {
    return;
  }

  await database.insert(auditLog).values({
    public_id: `audit-log-${randomUUID()}`,
    actor_public_id: context.actorPublicId,
    actor_role: context.auditLog.actorRole,
    action_type: context.auditLog.actionType,
    target_resource_type: context.auditLog.targetResourceType,
    target_public_id: targetPublicId,
    result_status: "success",
    metadata_summary: context.auditLog.metadataSummary,
    request_ip: context.auditLog.requestIp,
  });
}
