import { describe, expect, it, vi } from "vitest";

import type { AdminAiGenerationReviewDraftRepository } from "../contracts/admin-ai-generation-review-draft-contract";
import { createAdminAiGenerationReviewDraftService } from "./admin-ai-generation-review-draft-service";

describe("admin AI generation review draft service", () => {
  it("rejects unauthorized actors before repository lookup", async () => {
    const repository: AdminAiGenerationReviewDraftRepository = {
      findCurrentReviewDraft: vi.fn(),
      saveReviewDraft: vi.fn(),
    };
    const service = createAdminAiGenerationReviewDraftService(repository);

    const response = await service.getCurrentReviewDraft({
      actor: { publicId: "ops_admin_public_1", roles: ["ops_admin"] },
      resultPublicId: "admin_ai_generation_result_public_1",
    });

    expect(response.code).toBe(403018);
    expect(repository.findCurrentReviewDraft).not.toHaveBeenCalled();
  });

  it("passes only the server actor, URL result identity and normalized draft command", async () => {
    const current = {
      status: "legacy_unversioned" as const,
      resultPublicId: "admin_ai_generation_result_public_1",
      sourceContentDigest: "sha256:source-content-1",
      targetType: "question" as const,
      currentRevision: null,
      redactionStatus: "redacted" as const,
    };
    const repository: AdminAiGenerationReviewDraftRepository = {
      findCurrentReviewDraft: vi.fn(async () => current),
      saveReviewDraft: vi.fn(),
    };
    const service = createAdminAiGenerationReviewDraftService(repository);

    const response = await service.getCurrentReviewDraft({
      actor: { publicId: "content_admin_public_1", roles: ["content_admin"] },
      resultPublicId: "admin_ai_generation_result_public_1",
    });

    expect(response.code).toBe(0);
    expect(repository.findCurrentReviewDraft).toHaveBeenCalledWith({
      actorPublicId: "content_admin_public_1",
      resultPublicId: "admin_ai_generation_result_public_1",
    });
    expect(response.data).toEqual(current);
  });
});
