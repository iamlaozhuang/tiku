import { describe, expect, it } from "vitest";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "./api-response";

describe("api response contract", () => {
  it("wraps successful data in the standard envelope", () => {
    expect(createSuccessResponse({ publicId: "paper_public_id" })).toEqual({
      code: 0,
      message: "ok",
      data: { publicId: "paper_public_id" },
    });
  });

  it("keeps pagination as a top-level optional object", () => {
    expect(
      createPaginatedResponse([], {
        page: 1,
        pageSize: 20,
        total: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
  });

  it("returns null data for errors instead of an empty string", () => {
    expect(createErrorResponse(400001, "Invalid request.")).toEqual({
      code: 400001,
      message: "Invalid request.",
      data: null,
    });
  });
});
