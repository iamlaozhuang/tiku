import { describe, expect, it, vi } from "vitest";

import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import { createPersonalAiGenerationResultHistoryService } from "./personal-ai-generation-result-history-service";

function createResult(
  overrides: Partial<PersonalAiGenerationResultDto> &
    Record<string, unknown> = {},
): PersonalAiGenerationResultDto & Record<string, unknown> {
  return {
    resultPublicId: "personal_ai_result_public_200",
    taskPublicId: "ai_generation_task_public_200",
    requestPublicId: "personal_ai_request_public_200",
    taskType: "ai_question_generation",
    status: "draft",
    persistedAt: "2026-06-14T10:00:00.000Z",
    contentReference: {
      contentDigest: "sha256:content_200",
      contentPreviewMasked: "masked preview 200",
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: "ai_call_log_public_200",
      redactionStatus: "redacted",
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
    ...overrides,
  };
}

function createRepository(
  results: PersonalAiGenerationResultDto[] = [],
): PersonalAiGenerationResultRepository {
  return {
    listDraftResults: vi.fn(async () => results),
    createOrReuseDraftResult: vi.fn(),
  };
}

function createExpectedPrivateUseBoundary() {
  return {
    generatedResultScope: "learner_private",
    resultHistoryStatus: "available",
    privatePracticeAttemptSourceStatus:
      "allowed_as_private_practice_attempt_source",
    privatePaperAttemptSourceStatus: "allowed_as_private_paper_attempt_source",
    organizationPrivateAdoptionStatus:
      "blocked_without_organization_admin_task",
    platformFormalDraftStatus: "blocked_requires_content_admin_review",
    publishStatus: "blocked_requires_fresh_publish_task",
    studentVisibleStatus: "blocked",
    redactionStatus: "redacted",
  };
}

describe("personal AI generation result history service", () => {
  it("returns an empty redacted history in the standard response envelope", async () => {
    const repository = createRepository();
    const service = createPersonalAiGenerationResultHistoryService(repository);

    await expect(
      service.listDraftResultHistory({
        ownerPublicId: "student_public_200",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        formalAdoptionWriteStatus: "blocked_without_follow_up_task",
        privateUseBoundary: createExpectedPrivateUseBoundary(),
        results: [],
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });

    expect(repository.listDraftResults).toHaveBeenCalledWith({
      ownerPublicId: "student_public_200",
      taskType: undefined,
      page: undefined,
      pageSize: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it("passes task type and pagination into the result repository", async () => {
    const repository = createRepository();
    const service = createPersonalAiGenerationResultHistoryService(repository);

    const response = await service.listDraftResultHistory({
      ownerPublicId: "student_public_200",
      taskType: "ai_paper_generation",
      page: 2,
      pageSize: 5,
      limit: 5,
      offset: 5,
    });

    expect(response).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });
    expect(repository.listDraftResults).toHaveBeenCalledWith({
      ownerPublicId: "student_public_200",
      taskType: "ai_paper_generation",
      page: 2,
      pageSize: 5,
      limit: 5,
      offset: 5,
    });
  });

  it("returns sorted redacted result rows without internal ids or raw provider content", async () => {
    const omittedPromptFixture = ["OMITTED", "PROMPT", "FIXTURE"].join("-");
    const omittedGeneratedFixture = ["OMITTED", "GENERATED", "FIXTURE"].join(
      "-",
    );
    const omittedProviderPayloadFixture = [
      "OMITTED",
      "PROVIDER",
      "PAYLOAD",
    ].join("-");
    const rawPromptKey = ["raw", "Prompt"].join("");
    const generatedContentKey = ["generated", "Content"].join("");
    const providerPayloadKey = ["provider", "Payload"].join("");
    const repository = createRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_b",
        persistedAt: "2026-06-14T10:00:00.000Z",
        internalId: 42,
        [rawPromptKey]: omittedPromptFixture,
      }),
      createResult({
        resultPublicId: "personal_ai_result_public_c",
        persistedAt: "2026-06-14T11:00:00.000Z",
        [providerPayloadKey]: omittedProviderPayloadFixture,
      }),
      createResult({
        resultPublicId: "personal_ai_result_public_a",
        persistedAt: "2026-06-14T10:00:00.000Z",
        [generatedContentKey]: omittedGeneratedFixture,
      }),
    ]);
    const service = createPersonalAiGenerationResultHistoryService(repository);

    const response = await service.listDraftResultHistory({
      ownerPublicId: "student_public_200",
      limit: 3,
    });
    const serializedResponse = JSON.stringify(response);

    expect(response.data?.results.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_public_c",
      "personal_ai_result_public_a",
      "personal_ai_result_public_b",
    ]);
    expect(response.data?.results[0]?.formalAdoption).toEqual({
      isBlocked: true,
      status: "blocked",
    });
    expect(repository.listDraftResults).toHaveBeenCalledWith({
      ownerPublicId: "student_public_200",
      taskType: undefined,
      page: undefined,
      pageSize: undefined,
      limit: 3,
      offset: undefined,
    });
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain("internalId");
    expect(serializedResponse).not.toContain(rawPromptKey);
    expect(serializedResponse).not.toContain(omittedPromptFixture);
    expect(serializedResponse).not.toContain(generatedContentKey);
    expect(serializedResponse).not.toContain(omittedGeneratedFixture);
    expect(serializedResponse).not.toContain(providerPayloadKey);
    expect(serializedResponse).not.toContain(omittedProviderPayloadFixture);
  });

  it("returns one redacted detail row by owner-scoped public id", async () => {
    const omittedGeneratedFixture = ["OMITTED", "DETAIL", "GENERATED"].join(
      "-",
    );
    const generatedContentKey = ["generated", "Content"].join("");
    const repository = createRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_other",
      }),
      createResult({
        resultPublicId: "personal_ai_result_public_detail",
        [generatedContentKey]: omittedGeneratedFixture,
      }),
    ]);
    const service = createPersonalAiGenerationResultHistoryService(repository);

    const response = await service.getDraftResultDetail({
      ownerPublicId: "student_public_200",
      resultPublicId: "personal_ai_result_public_detail",
    });
    const serializedResponse = JSON.stringify(response);

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        formalAdoptionWriteStatus: "blocked_without_follow_up_task",
        privateUseBoundary: createExpectedPrivateUseBoundary(),
        result: {
          resultPublicId: "personal_ai_result_public_detail",
          taskPublicId: "ai_generation_task_public_200",
          requestPublicId: "personal_ai_request_public_200",
          taskType: "ai_question_generation",
          status: "draft",
          persistedAt: "2026-06-14T10:00:00.000Z",
          contentReference: {
            contentDigest: "sha256:content_200",
            contentPreviewMasked: "masked preview 200",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
          },
          evidenceReference: {
            evidenceStatus: "weak",
            citationCount: 1,
            aiCallLogPublicId: "ai_call_log_public_200",
            redactionStatus: "redacted",
          },
          formalAdoption: {
            isBlocked: true,
            status: "blocked",
          },
        },
      },
    });
    expect(repository.listDraftResults).toHaveBeenCalledWith({
      ownerPublicId: "student_public_200",
      taskType: undefined,
      page: undefined,
      pageSize: undefined,
      limit: undefined,
      offset: undefined,
    });
    expect(serializedResponse).not.toContain(generatedContentKey);
    expect(serializedResponse).not.toContain(omittedGeneratedFixture);
  });

  it("returns not found when owner-scoped detail lookup misses", async () => {
    const repository = createRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_other",
      }),
    ]);
    const service = createPersonalAiGenerationResultHistoryService(repository);

    await expect(
      service.getDraftResultDetail({
        ownerPublicId: "student_public_200",
        resultPublicId: "personal_ai_result_public_missing",
      }),
    ).resolves.toEqual({
      code: 404045,
      message: "Personal AI generation result detail was not found.",
      data: null,
    });
    expect(repository.listDraftResults).toHaveBeenCalledWith({
      ownerPublicId: "student_public_200",
      taskType: undefined,
      page: undefined,
      pageSize: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it("rejects invalid detail input before touching the repository", async () => {
    const repository = createRepository();
    const service = createPersonalAiGenerationResultHistoryService(repository);

    await expect(
      service.getDraftResultDetail({
        ownerPublicId: "student_public_200",
        resultPublicId: "",
      }),
    ).resolves.toEqual({
      code: 400045,
      message: "Invalid personal AI generation result detail input.",
      data: null,
    });
    expect(repository.listDraftResults).not.toHaveBeenCalled();
  });

  it("returns a standard error envelope when detail retrieval fails", async () => {
    const repository = createRepository();
    vi.mocked(repository.listDraftResults).mockRejectedValueOnce(
      new Error("database stack with private detail rows"),
    );
    const service = createPersonalAiGenerationResultHistoryService(repository);

    const response = await service.getDraftResultDetail({
      ownerPublicId: "student_public_200",
      resultPublicId: "personal_ai_result_public_detail",
    });
    const serializedResponse = JSON.stringify(response);

    expect(response).toEqual({
      code: 500020,
      message:
        "Personal AI generation result detail is temporarily unavailable.",
      data: null,
    });
    expect(serializedResponse).not.toContain("database stack");
    expect(serializedResponse).not.toContain("private detail rows");
  });

  it("rejects invalid query input before touching the repository", async () => {
    const repository = createRepository();
    const service = createPersonalAiGenerationResultHistoryService(repository);

    await expect(
      service.listDraftResultHistory({
        ownerPublicId: "",
        limit: 0,
      }),
    ).resolves.toEqual({
      code: 400044,
      message: "Invalid personal AI generation result history input.",
      data: null,
    });
    expect(repository.listDraftResults).not.toHaveBeenCalled();
  });

  it("returns a standard error envelope when history retrieval fails", async () => {
    const repository = createRepository();
    vi.mocked(repository.listDraftResults).mockRejectedValueOnce(
      new Error("database unavailable"),
    );
    const service = createPersonalAiGenerationResultHistoryService(repository);

    await expect(
      service.listDraftResultHistory({
        ownerPublicId: "student_public_200",
      }),
    ).resolves.toEqual({
      code: 500019,
      message:
        "Personal AI generation result history is temporarily unavailable.",
      data: null,
    });
  });
});
