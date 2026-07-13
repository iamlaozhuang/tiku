import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AdminFieldError,
  AdminFormDisabledReason,
  AdminFormErrorSummary,
} from "@/components/admin/AdminFormFeedback";

afterEach(() => {
  cleanup();
});

describe("AdminFormFeedback", () => {
  it("renders one accessible summary while keeping the field error local", () => {
    render(
      <>
        <AdminFormErrorSummary
          issues={[
            { field: "title", message: "请输入有效材料标题。" },
            { field: "contentRichText", message: "请输入有效材料正文。" },
          ]}
        />
        <AdminFieldError
          id="material-title-error"
          message="请输入有效材料标题。"
        />
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "请修正以下内容后再保存",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("请输入有效材料正文。");
    expect(
      screen.getByText("请输入有效材料标题。", { selector: "span" }),
    ).toHaveAttribute("id", "material-title-error");
  });

  it("renders a visible status that a disabled action can reference", () => {
    render(
      <>
        <button aria-describedby="question-save-reason" disabled>
          保存中…
        </button>
        <AdminFormDisabledReason
          id="question-save-reason"
          reason="正在保存，请勿重复提交。"
        />
      </>,
    );

    expect(screen.getByRole("button", { name: "保存中…" })).toHaveAttribute(
      "aria-describedby",
      "question-save-reason",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "正在保存，请勿重复提交。",
    );
  });
});
