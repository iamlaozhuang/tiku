import { describe, expect, it } from "vitest";

import { normalizeStudentPaperListInput } from "./student-paper";

describe("student paper validators", () => {
  it("normalizes student paper list filters and publishedAt sort defaults", () => {
    expect(
      normalizeStudentPaperListInput({
        page: "0",
        pageSize: "500",
        profession: "monopoly",
        level: "3",
        subject: "theory",
      }),
    ).toEqual({
      page: 1,
      pageSize: 100,
      sortBy: "publishedAt",
      sortOrder: "desc",
      profession: "monopoly",
      level: 3,
      subject: "theory",
    });
  });

  it("keeps invalid optional filters null and accepts explicit ascending order", () => {
    expect(
      normalizeStudentPaperListInput({
        sortBy: "name",
        sortOrder: "asc",
        profession: "unknown",
        level: "not-a-number",
        subject: "paper",
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      sortBy: "name",
      sortOrder: "asc",
      profession: null,
      level: null,
      subject: null,
    });
  });
});
