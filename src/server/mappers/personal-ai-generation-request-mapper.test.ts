import { describe, expect, it } from "vitest";

import type { PersonalAiGenerationRequestPersistenceRow } from "./personal-ai-generation-request-mapper";
import { mapPersonalAiGenerationRequestRowToHistoryDto } from "./personal-ai-generation-request-mapper";

function createPersistenceRow(
  overrides: Partial<PersonalAiGenerationRequestPersistenceRow> = {},
): PersonalAiGenerationRequestPersistenceRow {
  return {
    public_id: "ai_generation_task_public_201",
    request_public_id: "personal_ai_request_public_201",
    task_type: "ai_question_generation",
    task_status: "succeeded",
    requested_at: new Date("2026-06-12T16:30:00.000Z"),
    result_public_id: "ai_generation_result_public_201",
    evidence_status: "sufficient",
    citation_count: 3,
    ai_call_log_public_id: "ai_call_log_public_201",
    generation_snapshot_version: null,
    generation_input_snapshot: null,
    generation_constraint_snapshot: null,
    generation_snapshot_digest: null,
    ...overrides,
  };
}

describe("personal AI generation request mapper", () => {
  it("maps complete snapshots to a redacted reconstructable history view and legacy rows to unavailable", () => {
    const available = mapPersonalAiGenerationRequestRowToHistoryDto(
      createPersistenceRow({
        generation_snapshot_version: 1,
        generation_input_snapshot: {
          generationParameters: {
            profession: "marketing",
            level: 3,
            subject: "theory",
            knowledgeNode: null,
            knowledgeNodeMode: "balanced",
            knowledgeNodePublicIds: [],
            includeDescendants: false,
            knowledgeNodeSupplement: null,
            sourcePreference: null,
            questionType: "single_choice",
            questionCount: 3,
            difficulty: "medium",
            learningObjective: null,
            questionTypeDistribution: null,
            paperStructure: null,
          },
        },
        generation_constraint_snapshot: {
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal_auth_secret_public_160",
          ownerType: "personal",
          ownerPublicId: "student_secret_public_160",
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student_secret_public_160",
          effectiveEdition: "advanced",
          profession: "marketing",
          level: 3,
        },
        generation_snapshot_digest: `sha256:${"a".repeat(64)}`,
      }),
    );

    expect(available.generationSnapshot).toEqual({
      status: "available",
      schemaVersion: 1,
      generationParameters: expect.objectContaining({
        profession: "marketing",
        questionCount: 3,
      }),
      constraints: {
        authorizationSource: "personal_auth",
        effectiveEdition: "advanced",
        profession: "marketing",
        level: 3,
        redactionStatus: "redacted",
      },
    });
    expect(JSON.stringify(available)).not.toContain(
      "personal_auth_secret_public_160",
    );
    expect(JSON.stringify(available)).not.toContain(
      "student_secret_public_160",
    );
    expect(
      mapPersonalAiGenerationRequestRowToHistoryDto(createPersistenceRow())
        .generationSnapshot,
    ).toEqual({
      status: "unavailable",
      reason: "legacy_snapshot_unavailable",
    });
  });

  it("fails closed for malformed or non-canonical persisted snapshots", () => {
    const malformed = createPersistenceRow({
      generation_snapshot_version: 1,
      generation_input_snapshot: {
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodeMode: "balanced",
          knowledgeNodePublicIds: [],
          includeDescendants: false,
          knowledgeNodeSupplement: null,
          sourcePreference: null,
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: null,
          questionTypeDistribution: null,
          paperStructure: null,
          providerCredential: "must-not-leak",
        },
      },
      generation_constraint_snapshot: {
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal_auth_public_160",
        ownerType: "personal",
        ownerPublicId: "student_public_160",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student_public_160",
        effectiveEdition: "advanced",
        profession: "marketing",
        level: 3,
      },
      generation_snapshot_digest: `sha256:${"a".repeat(64)}`,
    });

    const dto = mapPersonalAiGenerationRequestRowToHistoryDto(malformed);

    expect(dto.generationSnapshot).toEqual({
      status: "unavailable",
      reason: "legacy_snapshot_unavailable",
    });
    expect(JSON.stringify(dto)).not.toContain("must-not-leak");
  });

  it("maps persistence rows to redacted camelCase request history DTOs", () => {
    const dto = mapPersonalAiGenerationRequestRowToHistoryDto({
      ...createPersistenceRow(),
      id: 701,
      owner_public_id: "student_public_201",
      provider_payload: "OMITTED_PROVIDER_PAYLOAD",
      raw_generated_content: "OMITTED_GENERATED_CONTENT",
    } as unknown as PersonalAiGenerationRequestPersistenceRow);

    expect(dto).toEqual({
      requestPublicId: "personal_ai_request_public_201",
      taskPublicId: "ai_generation_task_public_201",
      taskType: "ai_question_generation",
      status: "succeeded",
      requestedAt: "2026-06-12T16:30:00.000Z",
      resultPublicId: "ai_generation_result_public_201",
      evidenceStatus: "sufficient",
      citationCount: 3,
      aiCallLogPublicId: "ai_call_log_public_201",
      generationSnapshot: {
        status: "unavailable",
        reason: "legacy_snapshot_unavailable",
      },
      redactionStatus: "redacted",
    });

    const serializedDto = JSON.stringify(dto);

    expect(serializedDto).not.toMatch(/"id":/);
    expect(serializedDto).not.toContain("owner_public_id");
    expect(serializedDto).not.toContain("provider_payload");
    expect(serializedDto).not.toContain("OMITTED_PROVIDER_PAYLOAD");
    expect(serializedDto).not.toContain("raw_generated_content");
    expect(serializedDto).not.toContain("OMITTED_GENERATED_CONTENT");
  });

  it("normalizes nullable result and ai_call_log references to explicit nulls", () => {
    expect(
      mapPersonalAiGenerationRequestRowToHistoryDto(
        createPersistenceRow({
          task_status: "pending",
          result_public_id: null,
          evidence_status: "none",
          citation_count: 0,
          ai_call_log_public_id: null,
        }),
      ),
    ).toMatchObject({
      status: "pending",
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      redactionStatus: "redacted",
    });
  });

  it("treats historical pending tasks with a persisted result as succeeded", () => {
    expect(
      mapPersonalAiGenerationRequestRowToHistoryDto(
        createPersistenceRow({
          task_status: "pending",
          result_public_id: "ai_generation_result_public_historical_201",
        }),
      ),
    ).toMatchObject({
      status: "succeeded",
      resultPublicId: "ai_generation_result_public_historical_201",
    });
  });
});
