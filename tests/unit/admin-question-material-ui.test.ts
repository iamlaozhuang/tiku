import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AdminQuestionMaterialManagement,
  adminQuestionMaterialFixture,
} from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

afterEach(() => {
  cleanup();
});

describe("AdminQuestionMaterialManagement", () => {
  it("renders the question management baseline with filters, references, and safe actions", () => {
    render(createElement(AdminQuestionMaterialManagement));

    expect(
      screen.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "题目" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "新建题目" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑题目" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "停用题目" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "复制题目" })).toBeEnabled();

    const firstQuestion = adminQuestionMaterialFixture.questions[0];
    expect(
      screen.getByText(firstQuestion.references.papers[0].paperName),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`question-row-${firstQuestion.question.publicId}`),
    ).toHaveAttribute("data-public-id", firstQuestion.question.publicId);
  });

  it("filters questions by keyword and status without exposing numeric ids", () => {
    render(createElement(AdminQuestionMaterialManagement));

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流成本" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });

    expect(
      screen.getByText("物流成本核算适用于哪类场景？"),
    ).toBeInTheDocument();
    expect(screen.queryByText("市场调研抽样方法的核心目标是什么？")).toBeNull();

    const row = screen
      .getByText("物流成本核算适用于哪类场景？")
      .closest("article");
    expect(row).not.toBeNull();
    expect(row).toHaveAttribute("data-public-id", "question-logistics-002");
    expect(row).not.toHaveAttribute("data-id");
  });

  it("renders material management with usage visibility and an empty filtered state", () => {
    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    expect(screen.getByRole("tab", { name: "材料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "新建材料" }),
    ).toBeInTheDocument();
    expect(screen.getByText("营销案例材料 A")).toBeInTheDocument();

    const firstMaterial = adminQuestionMaterialFixture.materials[0];
    const materialRow = screen.getByTestId(
      `material-row-${firstMaterial.material.publicId}`,
    );
    expect(
      within(materialRow).getByText(firstMaterial.references.questions[0].stem),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的材料" },
    });

    expect(screen.getByText("没有匹配的材料")).toBeInTheDocument();
  });
});
