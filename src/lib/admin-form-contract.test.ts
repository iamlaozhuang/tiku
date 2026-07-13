import { describe, expect, it } from "vitest";

import {
  focusFirstAdminFormIssue,
  getAdminFormDirtyState,
  readAdminFieldError,
} from "@/lib/admin-form-contract";

describe("admin form contract", () => {
  it("reads the first local field error without changing issue order", () => {
    const issues = [
      { field: "stemRichText", message: "请输入有效题干。" },
      { field: "analysisRichText", message: "请输入有效老师解析。" },
    ];

    expect(readAdminFieldError(issues, "stemRichText")).toBe(
      "请输入有效题干。",
    );
    expect(readAdminFieldError(issues, "questionType")).toBeNull();
    expect(issues.map((issue) => issue.field)).toEqual([
      "stemRichText",
      "analysisRichText",
    ]);
  });

  it("focuses the first available invalid field without interpolating a selector", () => {
    const form = document.createElement("form");
    const stem = document.createElement("textarea");
    const analysis = document.createElement("textarea");
    stem.dataset.field = "stemRichText";
    analysis.dataset.field = "analysisRichText";
    form.append(stem, analysis);
    document.body.append(form);

    const focused = focusFirstAdminFormIssue(form, [
      { field: 'missing-field\"]', message: "不可聚焦字段" },
      { field: "analysisRichText", message: "请输入有效老师解析。" },
    ]);

    expect(focused).toBe(analysis);
    expect(analysis).toHaveFocus();
    form.remove();
  });

  it("exposes clean and dirty state from caller-owned fingerprints", () => {
    expect(getAdminFormDirtyState("baseline", "baseline")).toEqual({
      isDirty: false,
      status: "clean",
    });
    expect(getAdminFormDirtyState("baseline", "changed")).toEqual({
      isDirty: true,
      status: "dirty",
    });
  });
});
