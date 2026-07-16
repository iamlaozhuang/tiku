import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { PersonalAiGenerationRequestHistoryDto } from "@/server/contracts/personal-ai-generation-request-history-contract";

export const STUDENT_SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
export const STUDENT_SESSION_STORAGE_SCOPE_KEY = "tiku.studentSessionScope";
export const STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX =
  "tiku.mockExam.cache.";
export const STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX =
  "tiku.mockExam.answerQueue.";
export const COOKIE_BACKED_SESSION_MARKER = "__cookie_backed_session__";

const LOCAL_AUTOMATION_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const STUDENT_USER_SCOPED_STORAGE_PREFIXES = [
  STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
  STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX,
  "tiku.studentHome.",
] as const;

function clearStudentUserScopedRuntimeStorage() {
  const keysToRemove = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  ).filter(
    (key): key is string =>
      key !== null &&
      STUDENT_USER_SCOPED_STORAGE_PREFIXES.some((prefix) =>
        key.startsWith(prefix),
      ),
  );

  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

function createOpaqueStudentSessionStorageScope(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function setStudentSessionStorageScope(scope: string): void {
  const normalizedScope = scope.trim();

  if (normalizedScope === "") {
    throw new Error("Student session storage scope is required.");
  }

  localStorage.setItem(STUDENT_SESSION_STORAGE_SCOPE_KEY, normalizedScope);
}

export function shouldPersistLocalAutomationStudentSessionToken(input: {
  hostname: string;
  isBrowserAutomated: boolean;
}) {
  return (
    LOCAL_AUTOMATION_HOSTNAMES.has(input.hostname) && input.isBrowserAutomated
  );
}

export function persistLocalAutomationStudentSessionToken(token: string) {
  if (
    typeof window === "undefined" ||
    !shouldPersistLocalAutomationStudentSessionToken({
      hostname: window.location.hostname,
      isBrowserAutomated: window.navigator.webdriver === true,
    })
  ) {
    return;
  }

  const sessionToken = token.trim();

  if (sessionToken === "") {
    return;
  }

  clearStudentUserScopedRuntimeStorage();
  localStorage.removeItem(STUDENT_SESSION_STORAGE_SCOPE_KEY);
  localStorage.setItem(STUDENT_SESSION_TOKEN_STORAGE_KEY, sessionToken);
  setStudentSessionStorageScope(createOpaqueStudentSessionStorageScope());
}

export function persistCookieBackedSessionMarker(userPublicId: string) {
  if (typeof window === "undefined") {
    return;
  }

  clearStudentUserScopedRuntimeStorage();
  localStorage.removeItem(STUDENT_SESSION_STORAGE_SCOPE_KEY);
  localStorage.setItem(
    STUDENT_SESSION_TOKEN_STORAGE_KEY,
    COOKIE_BACKED_SESSION_MARKER,
  );
  setStudentSessionStorageScope(userPublicId);
}

export function getStoredStudentSessionToken(): string | null {
  const storedSessionValue = localStorage
    .getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)
    ?.trim();

  if (
    storedSessionValue === undefined ||
    storedSessionValue === "" ||
    storedSessionValue === COOKIE_BACKED_SESSION_MARKER
  ) {
    return null;
  }

  return storedSessionValue;
}

export function hasStoredStudentSessionSignal(): boolean {
  const storedSessionValue = localStorage
    .getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)
    ?.trim();

  return storedSessionValue !== undefined && storedSessionValue !== "";
}

export function clearStoredStudentSessionToken() {
  clearStudentUserScopedRuntimeStorage();
  localStorage.removeItem(STUDENT_SESSION_STORAGE_SCOPE_KEY);
  localStorage.removeItem(STUDENT_SESSION_TOKEN_STORAGE_KEY);
}

export function getStudentSessionStorageScope(): string | null {
  const storedScope = localStorage
    .getItem(STUDENT_SESSION_STORAGE_SCOPE_KEY)
    ?.trim();

  if (storedScope !== undefined && storedScope !== "") {
    return storedScope;
  }

  if (!hasStoredStudentSessionSignal()) {
    return null;
  }

  const fallbackScope = createOpaqueStudentSessionStorageScope();
  setStudentSessionStorageScope(fallbackScope);

  return fallbackScope;
}

export function createStudentUserScopedStorageKey(
  prefix: string,
  resourcePublicId: string,
): string {
  const scope = getStudentSessionStorageScope();

  if (scope === null) {
    throw new Error("Student session storage scope is unavailable.");
  }

  return `${prefix}${scope}.${resourcePublicId}`;
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
  token: string | null,
): Promise<ApiResponse<PersonalAiGenerationRequestHistoryDto | null>> {
  return fetchStudentApi<PersonalAiGenerationRequestHistoryDto>(
    "/api/v1/personal-ai-generation-requests",
    token,
    {
      method: "GET",
    },
  );
}
