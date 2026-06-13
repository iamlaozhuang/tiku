import { describe, expect, it } from "vitest";

import type { PersonalAiGenerationRequestPersistenceRow } from "./personal-ai-generation-request-mapper";
import { mapPersonalAiGenerationRequestRowToHistoryDto } from "./personal-ai-generation-request-mapper";

function createPersistenceRow(
  overrides: Partial<PersonalAiGenerationRequestPersistenceRow> = {},
): PersonalAiGenerationRequestPersistenceRow {
  return {
    public_id: "ai_generation_task_public_201",
    request_public_id: "personal_ai_request_public_201",
    task_status: "succeeded",
    requested_at: new Date("2026-06-12T16:30:00.000Z"),
    result_public_id: "ai_generation_result_public_201",
    evidence_status: "sufficient",
    citation_count: 3,
    ai_call_log_public_id: "ai_call_log_public_201",
    ...overrides,
  };
}

describe("personal AI generation request mapper", () => {
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
      status: "succeeded",
      requestedAt: "2026-06-12T16:30:00.000Z",
      resultPublicId: "ai_generation_result_public_201",
      evidenceStatus: "sufficient",
      citationCount: 3,
      aiCallLogPublicId: "ai_call_log_public_201",
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
});
