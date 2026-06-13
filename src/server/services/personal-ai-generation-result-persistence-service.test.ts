import { describe, expect, it, vi } from "vitest";

import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import { createPersonalAiGenerationResultPersistenceService } from "./personal-ai-generation-result-persistence-service";

function createBaseInput() {
  const omittedDraftText = ["OMITTED", "DRAFT", "TEXT"].join("-");
  const omittedExternalEnvelope = ["OMITTED", "EXTERNAL", "ENVELOPE"].join("-");

  return {
    id: 170,
    resultPublicId: "personal_ai_result_public_180",
    taskPublicId: "ai_generation_task_public_180",
    ownerPublicId: "student_public_180",
    taskType: "ai_question_generation",
    contentRedactedSnapshot: {
      redactionStatus: "redacted",
      contentHash: "sha256:content_180",
    },
    contentDigest: "sha256:content_180",
    contentPreviewMasked: "masked preview 180",
    citationRedactedSnapshot: null,
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    createdAt: "2026-06-13T14:30:00.000Z",
    unexpectedDraftText: omittedDraftText,
    externalEnvelope: omittedExternalEnvelope,
  };
}

function createRepository(): PersonalAiGenerationResultRepository {
  return {
    listDraftResults: vi.fn(async () => []),
    createOrReuseDraftResult: vi.fn(async (input) => ({
      persistenceStatus: "created" as const,
      result: {
        resultPublicId: input.resultPublicId,
        taskPublicId: input.taskPublicId,
        requestPublicId: "personal_ai_request_public_180",
        taskType: input.taskType,
        status: "draft" as const,
        persistedAt: input.createdAt.toISOString(),
        contentReference: {
          contentDigest: input.contentDigest,
          contentPreviewMasked: input.contentPreviewMasked,
          contentVisibility: "redacted_snapshot" as const,
          redactionStatus: "redacted" as const,
        },
        evidenceReference: {
          evidenceStatus: input.evidenceStatus,
          citationCount: input.citationCount,
          aiCallLogPublicId: input.aiCallLogPublicId,
          redactionStatus: "redacted" as const,
        },
        formalAdoption: {
          isBlocked: true as const,
          status: "blocked" as const,
        },
      },
    })),
  };
}

describe("personal AI generation result persistence service", () => {
  it("persists a draft result through a standard API response without leaking raw content", async () => {
    const repository = createRepository();
    const service =
      createPersonalAiGenerationResultPersistenceService(repository);
    const input = createBaseInput();

    const response = await service.persistDraftResult(input);
    const serializedResponse = JSON.stringify(response);
    const repositoryCall = vi.mocked(repository.createOrReuseDraftResult).mock
      .calls[0]?.[0];

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        persistenceStatus: "created",
        result: {
          resultPublicId: "personal_ai_result_public_180",
          taskPublicId: "ai_generation_task_public_180",
          requestPublicId: "personal_ai_request_public_180",
          taskType: "ai_question_generation",
          status: "draft",
          persistedAt: "2026-06-13T14:30:00.000Z",
          contentReference: {
            contentDigest: "sha256:content_180",
            contentPreviewMasked: "masked preview 180",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
          },
          evidenceReference: {
            evidenceStatus: "weak",
            citationCount: 1,
            aiCallLogPublicId: null,
            redactionStatus: "redacted",
          },
          formalAdoption: {
            isBlocked: true,
            status: "blocked",
          },
        },
      },
    });
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain(input.unexpectedDraftText);
    expect(serializedResponse).not.toContain(input.externalEnvelope);
    expect(JSON.stringify(repositoryCall)).not.toContain(
      input.unexpectedDraftText,
    );
    expect(JSON.stringify(repositoryCall)).not.toContain(
      input.externalEnvelope,
    );
  });

  it("rejects formal adoption requests before touching the repository", async () => {
    const repository = createRepository();
    const service =
      createPersonalAiGenerationResultPersistenceService(repository);

    const response = await service.persistDraftResult({
      ...createBaseInput(),
      formalAdoptionRequested: true,
    });

    expect(response).toEqual({
      code: 400015,
      message: "Formal generated content adoption is not approved.",
      data: null,
    });
    expect(repository.createOrReuseDraftResult).not.toHaveBeenCalled();
  });

  it("rejects invalid persistence input", async () => {
    const service =
      createPersonalAiGenerationResultPersistenceService(createRepository());

    await expect(service.persistDraftResult(null)).resolves.toEqual({
      code: 400016,
      message: "Invalid personal AI generation result persistence input.",
      data: null,
    });
  });
});
