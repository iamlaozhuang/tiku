import type { ApiResponse } from "@/server/contracts/api-response";

export const STUDENT_SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

export function getStoredStudentSessionToken(): string | null {
  const token = localStorage.getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)?.trim();

  return token === "" ? null : (token ?? null);
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
