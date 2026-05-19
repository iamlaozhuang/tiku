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
  StudentPracticePage,
  studentPracticeFixture,
} from "@/features/student/practice/StudentPracticePage";

afterEach(() => {
  cleanup();
});

describe("StudentPracticePage", () => {
  it("renders the selected practice with public identifiers and progress", () => {
    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
        practices: studentPracticeFixture.practices,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "营销理论冲刺卷 B" }),
    ).toBeInTheDocument();
    expect(screen.getByText("第 1 / 2 题")).toBeInTheDocument();
    expect(
      screen.getByText("practice-marketing-theory-001"),
    ).toBeInTheDocument();

    const practiceSurface = screen.getByTestId(
      "practice-surface-practice-marketing-theory-001",
    );

    expect(practiceSurface).toHaveAttribute(
      "data-public-id",
      "practice-marketing-theory-001",
    );
    expect(practiceSurface).not.toHaveAttribute("data-id");
  });

  it("shows objective feedback after submitting and prevents a second answer", () => {
    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
        practices: studentPracticeFixture.practices,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText("回答错误")).toBeInTheDocument();
    expect(screen.getByText("正确答案：B. 客户需求分析")).toBeInTheDocument();
    expect(
      screen.getByText("解析：客户需求分析用于识别客户真实购买动机。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("已加入错题本：mistake-book-marketing-001"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "提交答案" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "下一题" }));

    expect(screen.getByText("第 2 / 2 题")).toBeInTheDocument();
    expect(screen.getByText("以下哪项属于服务复盘动作？")).toBeInTheDocument();
  });

  it("renders subjective skill practice with material and Phase 5 AI placeholders", () => {
    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-skill-001",
        practices: studentPracticeFixture.practices,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "营销技能案例卷" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("客户异议处理案例").length).toBeGreaterThan(0);
    expect(
      screen.getByText("材料：客户连续两次反馈配送延迟。"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("主观题答案"), {
      target: { value: "先确认延迟原因，再给出补偿和后续跟进计划。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText("主观题答案已保存")).toBeInTheDocument();
    expect(screen.getByText("AI 讲解：暂不可用")).toBeInTheDocument();
    expect(screen.getByText("AI 提示：暂不可用")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "AI 提示并重答一次" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "直接查看评分" }),
    ).toBeInTheDocument();
  });

  it("renders loading, error, authorization expired, and empty states", () => {
    render(createElement(StudentPracticePage, { state: "loading" }));
    expect(screen.getByText("正在加载练习进度")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentPracticePage, { state: "error" }));
    expect(screen.getByText("练习加载失败")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentPracticePage, { state: "authorization_expired" }),
    );
    expect(screen.getByText("授权已失效")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-unknown",
        practices: studentPracticeFixture.practices,
      }),
    );
    expect(screen.getByText("暂无可继续的练习")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("practice-empty-state")).getByRole("link", {
        name: "返回学员首页",
      }),
    ).toHaveAttribute("href", "/home");
  });
});
