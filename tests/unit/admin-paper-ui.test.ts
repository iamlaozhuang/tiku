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
  AdminPaperManagement,
  adminPaperManagementFixture,
} from "@/features/admin/paper-management/AdminPaperManagement";

afterEach(() => {
  cleanup();
});

describe("AdminPaperManagement", () => {
  it("renders the paper management baseline with lifecycle actions and safe public identifiers", () => {
    render(createElement(AdminPaperManagement));

    expect(
      screen.getByRole("heading", { name: "试卷管理" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新建草稿" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "组卷" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "发布" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "下架" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "复制" })).toBeEnabled();

    const firstPaper = adminPaperManagementFixture.papers[0];
    const firstRow = screen.getByTestId(
      `paper-row-${firstPaper.paper.publicId}`,
    );

    expect(firstRow).toHaveAttribute(
      "data-public-id",
      firstPaper.paper.publicId,
    );
    expect(firstRow).not.toHaveAttribute("data-id");
    expect(
      within(firstRow).getByText(firstPaper.paper.name),
    ).toBeInTheDocument();
    expect(
      within(firstRow).getByText(firstPaper.paper.paperSections[0].title),
    ).toBeInTheDocument();
    expect(within(firstRow).getByText("模拟记录 18")).toBeInTheDocument();
  });

  it("filters papers by keyword, status, subject, and type", () => {
    render(createElement(AdminPaperManagement));

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流技能" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "draft" },
    });
    fireEvent.change(screen.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    fireEvent.change(screen.getByLabelText("类型"), {
      target: { value: "mock_paper" },
    });

    expect(screen.getByText("物流技能练习卷")).toBeInTheDocument();
    expect(screen.queryByText("2026 春季营销理论模拟卷")).toBeNull();
  });

  it("shows paper assets, validation issues, empty, loading, and error states", () => {
    render(createElement(AdminPaperManagement));

    const publishedPaper = adminPaperManagementFixture.papers[0];
    const publishedRow = screen.getByTestId(
      `paper-row-${publishedPaper.paper.publicId}`,
    );

    expect(
      within(publishedRow).getByText("spring-marketing.pdf"),
    ).toBeInTheDocument();
    expect(within(publishedRow).getByText("下载原始文件")).toBeInTheDocument();
    expect(
      within(publishedRow).getByText("发布校验已通过"),
    ).toBeInTheDocument();

    const draftPaper = adminPaperManagementFixture.papers[1];
    const draftRow = screen.getByTestId(
      `paper-row-${draftPaper.paper.publicId}`,
    );

    expect(within(draftRow).getByText("缺少题目分值")).toBeInTheDocument();

    cleanup();
    render(
      createElement(AdminPaperManagement, {
        state: "loading",
      }),
    );
    expect(screen.getByText("正在加载试卷")).toBeInTheDocument();

    cleanup();
    render(
      createElement(AdminPaperManagement, {
        state: "error",
      }),
    );
    expect(screen.getByText("试卷加载失败")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminPaperManagement));
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的试卷" },
    });
    expect(screen.getByText("没有匹配的试卷")).toBeInTheDocument();
  });
});
