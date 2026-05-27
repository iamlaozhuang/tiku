import { describe, expect, it } from "vitest";

import {
  normalizeExamReportListQuery,
  normalizeRetryLearningSuggestionInput,
} from "./exam-report";

describe("exam report validators", () => {
  it("normalizes list query pagination, status, and search", () => {
    expect(
      normalizeExamReportListQuery({
        page: "2",
        pageSize: "50",
        status: " completed ",
        search: " 专卖 ",
      }),
    ).toEqual({
      page: 2,
      pageSize: 50,
      status: "completed",
      search: "专卖",
      sortBy: "startedAt",
      sortOrder: "desc",
    });
  });

  it("keeps terminated list status and uses safe defaults for invalid pagination", () => {
    expect(
      normalizeExamReportListQuery({
        page: "0",
        pageSize: "999",
        status: "terminated",
        search: "",
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      status: "terminated",
      search: null,
      sortBy: "startedAt",
      sortOrder: "desc",
    });
  });

  it("normalizes retry learning suggestion input without requiring Phase 5 data", () => {
    expect(
      normalizeRetryLearningSuggestionInput({
        requestedFromClientAt: " 2026-05-19T09:05:00.000Z ",
      }),
    ).toEqual({
      requestedFromClientAt: "2026-05-19T09:05:00.000Z",
    });
    expect(normalizeRetryLearningSuggestionInput({})).toEqual({
      requestedFromClientAt: null,
    });
  });
});
