import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { PersonalAiGenerationLocalBrowserExperienceDto } from "@/server/contracts/personal-ai-generation-local-browser-experience-contract";
import type { PersonalAiGenerationRequestHistoryDto } from "@/server/contracts/personal-ai-generation-request-history-contract";
import type { AiGenerationTaskStatus } from "@/server/models/ai-generation-task";

export const STUDENT_SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

const localPersonalAiGenerationRequestHistoryPublicId =
  "personal-ai-request-public-001";
const localPersonalAiGenerationRequestHistoryRequestedAt =
  "2026-06-12T12:00:00.000Z";

export function getStoredStudentSessionToken(): string | null {
  const storedSessionValue = localStorage
    .getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)
    ?.trim();

  return storedSessionValue === "" ? null : (storedSessionValue ?? null);
}

export function clearStoredStudentSessionToken() {
  localStorage.removeItem(STUDENT_SESSION_TOKEN_STORAGE_KEY);
}

export function createStudentAuthHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}

export async function fetchStudentApi<TPayload>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<ApiResponse<TPayload | null>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...createStudentAuthHeaders(token),
      ...(init?.headers ?? {}),
    },
  });

  return (await response.json()) as ApiResponse<TPayload | null>;
}

export function isStudentUnauthorizedResponse(
  payload: ApiResponse<unknown>,
): boolean {
  return payload.code === 401001;
}

export async function fetchCurrentStudentSession(
  token: string,
): Promise<ApiResponse<AuthContextDto | null>> {
  return fetchStudentApi<AuthContextDto>("/api/v1/sessions", token, {
    method: "GET",
  });
}

export async function fetchPersonalAiGenerationRequestHistory(
  token: string,
): Promise<ApiResponse<PersonalAiGenerationRequestHistoryDto | null>> {
  return fetchStudentApi<PersonalAiGenerationRequestHistoryDto>(
    "/api/v1/personal-ai-generation-requests",
    token,
    {
      method: "GET",
    },
  );
}

function normalizePersonalAiGenerationHistoryStatus(
  status: PersonalAiGenerationLocalBrowserExperienceDto["resultState"]["status"],
): AiGenerationTaskStatus | null {
  return status === "blocked" ? null : status;
}

export function createLocalPersonalAiGenerationRequestHistory(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
): PersonalAiGenerationRequestHistoryDto {
  const status = normalizePersonalAiGenerationHistoryStatus(
    experience.resultState.status,
  );

  if (status === null) {
    return [];
  }

  const resultReference = experience.requestFlow.resultReference;

  return [
    {
      requestPublicId: localPersonalAiGenerationRequestHistoryPublicId,
      taskPublicId: resultReference.taskPublicId,
      status,
      requestedAt: localPersonalAiGenerationRequestHistoryRequestedAt,
      resultPublicId: resultReference.resultReference.resultPublicId,
      evidenceStatus: resultReference.resultReference.evidenceStatus,
      citationCount: resultReference.resultReference.citationCount,
      aiCallLogPublicId: resultReference.aiCallLogReference.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  ];
}
