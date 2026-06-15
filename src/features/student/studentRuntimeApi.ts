import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { PersonalAiGenerationRequestHistoryDto } from "@/server/contracts/personal-ai-generation-request-history-contract";

export const STUDENT_SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

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

function createStudentApiRequestInit(
  tokenOrInit?: string | null | RequestInit,
  init?: RequestInit,
): RequestInit {
  const token =
    typeof tokenOrInit === "string" || tokenOrInit === null
      ? tokenOrInit
      : null;
  const requestInit =
    typeof tokenOrInit === "string" || tokenOrInit === null
      ? init
      : tokenOrInit;
  const headers = {
    ...(token === null ? {} : createStudentAuthHeaders(token)),
    ...(requestInit?.headers ?? {}),
  };
  const request: RequestInit = {
    ...requestInit,
    credentials: requestInit?.credentials ?? "same-origin",
  };

  return Object.keys(headers).length === 0
    ? request
    : {
        ...request,
        headers,
      };
}

export async function fetchStudentApi<TPayload>(
  path: string,
  tokenOrInit?: string | null | RequestInit,
  init?: RequestInit,
): Promise<ApiResponse<TPayload | null>> {
  const response = await fetch(
    path,
    createStudentApiRequestInit(tokenOrInit, init),
  );

  return (await response.json()) as ApiResponse<TPayload | null>;
}

export function isStudentUnauthorizedResponse(
  payload: ApiResponse<unknown>,
): boolean {
  return payload.code === 401001;
}

export async function fetchCurrentStudentSession(
  token?: string | null,
): Promise<ApiResponse<AuthContextDto | null>> {
  return fetchStudentApi<AuthContextDto>("/api/v1/sessions", token ?? null, {
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
