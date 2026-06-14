import type { StudentExperienceSortOrder } from "@/server/contracts/student-experience/student-experience-contract";
import type { ListMistakeBooksQuery } from "@/server/repositories/student-experience/student-experience-repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "latestWrongAt";
const DEFAULT_SORT_ORDER: StudentExperienceSortOrder = "desc";

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function parseSortOrder(value: string | null): StudentExperienceSortOrder {
  return value === "asc" || value === "desc" ? value : DEFAULT_SORT_ORDER;
}

export function parseMistakeBookListQuery(
  request: Request,
): ListMistakeBooksQuery {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: parsePositiveInteger(searchParams.get("page"), DEFAULT_PAGE),
    pageSize: parsePositiveInteger(
      searchParams.get("pageSize"),
      DEFAULT_PAGE_SIZE,
    ),
    sortBy: searchParams.get("sortBy") ?? DEFAULT_SORT_BY,
    sortOrder: parseSortOrder(searchParams.get("sortOrder")),
  };
}
