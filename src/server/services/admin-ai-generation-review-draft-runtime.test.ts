import { describe, expect, it, vi } from "vitest";

import type { ApiResponse } from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { AdminAiGenerationReviewDraftRepository } from "../contracts/admin-ai-generation-review-draft-contract";
import { createAdminAiGenerationReviewDraftRuntimeRouteHandlers } from "./admin-ai-generation-review-draft-runtime";

function createSessionResponse(
  adminRoles: AuthContextDto["user"]["adminRoles"],
): ApiResponse<AuthContextDto | null> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_admin_public_1",
        phone: "13800000000",
        name: "Admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin_public_1",
        adminRoles,
      },
      session: { expiresAt: "2026-07-23T00:00:00.000Z" },
    },
  };
}

describe("admin AI generation review draft runtime", () => {
  it("rejects ops-only actors before repository access", async () => {
    const repository: AdminAiGenerationReviewDraftRepository = {
      findCurrentReviewDraft: vi.fn(),
      saveReviewDraft: vi.fn(),
    };
    const handlers = createAdminAiGenerationReviewDraftRuntimeRouteHandlers({
      repository,
      sessionService: {
        getCurrentSession: vi.fn(async () =>
          createSessionResponse(["ops_admin"]),
        ),
      },
    });

    const response = await handlers.reviewDrafts.GET(
      new Request(
        "http://localhost/api/v1/content-ai-generation-results/r/review-drafts",
      ),
      { params: Promise.resolve({ publicId: "result_public_1" }) },
    );

    expect((await response.json()).code).toBe(403018);
    expect(repository.findCurrentReviewDraft).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects client-owned provenance fields before persistence", async () => {
    const repository: AdminAiGenerationReviewDraftRepository = {
      findCurrentReviewDraft: vi.fn(),
      saveReviewDraft: vi.fn(),
    };
    const handlers = createAdminAiGenerationReviewDraftRuntimeRouteHandlers({
      repository,
      sessionService: {
        getCurrentSession: vi.fn(async () =>
          createSessionResponse(["content_admin"]),
        ),
      },
    });

    const response = await handlers.reviewDrafts.PUT(
      new Request(
        "http://localhost/api/v1/content-ai-generation-results/r/review-drafts",
        {
          method: "PUT",
          body: JSON.stringify({
            expectedRevision: null,
            expectedDraftDigest: null,
            targetType: "question",
            reviewedDraft: {},
            sourceContentDigest: "client-owned",
          }),
          headers: { "content-type": "application/json" },
        },
      ),
      { params: Promise.resolve({ publicId: "result_public_1" }) },
    );

    expect((await response.json()).code).toBe(400018);
    expect(repository.saveReviewDraft).not.toHaveBeenCalled();
  });
});
