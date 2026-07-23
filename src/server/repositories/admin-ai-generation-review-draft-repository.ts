import { createHash } from "node:crypto";

import type { AdminAiGenerationFormalReviewedDraftPayload } from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type { AdminAiGenerationReviewDraftTargetType } from "../models/admin-ai-generation-review-draft";

export type AdminAiGenerationReviewDraftIdentityInput = {
  resultPublicId: string;
  sourceContentDigest: string;
  targetType: AdminAiGenerationReviewDraftTargetType;
  revision: number;
  reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function createIdentityHash(
  input: AdminAiGenerationReviewDraftIdentityInput,
): string {
  const canonical = JSON.stringify(
    canonicalize({
      resultPublicId: input.resultPublicId,
      reviewedDraft: input.reviewedDraft,
      revision: input.revision,
      sourceContentDigest: input.sourceContentDigest,
      targetType: input.targetType,
    }),
  );
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function createAdminAiGenerationReviewDraftDigest(
  input: AdminAiGenerationReviewDraftIdentityInput,
): string {
  return `sha256:${createIdentityHash(input)}`;
}

export function createAdminAiGenerationReviewDraftPublicId(
  input: AdminAiGenerationReviewDraftIdentityInput,
): string {
  return `admin_ai_review_draft_${createIdentityHash(input).slice(0, 48)}`;
}

export function resolveNextAdminAiGenerationReviewDraftRevision(
  currentRevision: number | null,
): number {
  if (currentRevision === null) {
    return 0;
  }
  if (!Number.isSafeInteger(currentRevision) || currentRevision < 0) {
    throw new Error("unsafe admin AI generation review draft revision");
  }
  return currentRevision + 1;
}
