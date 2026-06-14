import type { ListExamPapersQuery } from "@/server/repositories/question-paper/question-paper-repository";

export type ValidationResult<TValue> =
  | { ok: true; value: TValue }
  | { code: number; message: string; ok: false };

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "createdAt";
const MAX_PAGE_SIZE = 100;
const PUBLIC_ID_PATTERN = /^[a-z][a-z0-9-]{2,}$/;

function parsePositiveInteger(value: string | null, fallback: number) {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export function parseExamPaperListQuery(request: Request): ListExamPapersQuery {
  const requestUrl = new URL(request.url);
  const page = parsePositiveInteger(
    requestUrl.searchParams.get("page"),
    DEFAULT_PAGE,
  );
  const requestedPageSize = parsePositiveInteger(
    requestUrl.searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );
  const sortOrder =
    requestUrl.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return {
    page,
    pageSize: Math.min(requestedPageSize, MAX_PAGE_SIZE),
    sortBy: requestUrl.searchParams.get("sortBy") ?? DEFAULT_SORT_BY,
    sortOrder,
  };
}

export function validateExamPaperPublicId(
  publicId: string,
): ValidationResult<string> {
  if (!PUBLIC_ID_PATTERN.test(publicId) || /^\d+$/.test(publicId)) {
    return {
      code: 400002,
      message: "Invalid exam paper publicId.",
      ok: false,
    };
  }

  return { ok: true, value: publicId };
}
