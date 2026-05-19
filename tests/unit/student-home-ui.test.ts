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
  StudentHomePage,
  studentHomeFixture,
} from "@/features/student/home/StudentHomePage";

afterEach(() => {
  cleanup();
});

describe("StudentHomePage", () => {
  it("selects the remembered authorization scope and groups papers by subject", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "学员首页" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "营销 3级" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: "理论" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "技能" })).toBeInTheDocument();

    const theoryGroup = screen.getByTestId("subject-group-theory");
    const skillGroup = screen.getByTestId("subject-group-skill");

    expect(
      within(theoryGroup).getByText("营销理论冲刺卷 B"),
    ).toBeInTheDocument();
    expect(
      within(theoryGroup).getByText("营销理论冲刺卷 A"),
    ).toBeInTheDocument();
    expect(within(skillGroup).getByText("营销技能案例卷")).toBeInTheDocument();
  });

  it("uses public identifiers in paper cards and action links", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
      }),
    );

    const paperCard = screen.getByTestId(
      "paper-card-paper-marketing-theory-002",
    );

    expect(paperCard).toHaveAttribute(
      "data-public-id",
      "paper-marketing-theory-002",
    );
    expect(paperCard).not.toHaveAttribute("data-id");
    expect(within(paperCard).getByText("2026-05-18 发布")).toBeInTheDocument();
    expect(within(paperCard).getByText("42 题")).toBeInTheDocument();

    expect(
      within(paperCard).getByRole("link", { name: "练习" }),
    ).toHaveAttribute(
      "href",
      "/practice?paperPublicId=paper-marketing-theory-002",
    );
    expect(
      within(paperCard).getByRole("link", { name: "模拟考试" }),
    ).toHaveAttribute(
      "href",
      "/mock-exam?paperPublicId=paper-marketing-theory-002",
    );
  });

  it("supports scope switching and first-scope fallback", () => {
    render(
      createElement(StudentHomePage, {
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
      }),
    );

    expect(screen.getByRole("button", { name: "专卖 3级" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("专卖理论真题卷")).toBeInTheDocument();
    expect(screen.queryByText("营销理论冲刺卷 B")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "营销 3级" }));

    expect(screen.getByRole("button", { name: "营销 3级" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("营销理论冲刺卷 B")).toBeInTheDocument();
    expect(screen.queryByText("专卖理论真题卷")).toBeNull();
  });

  it("renders loading, error, empty paper, and no-authorization states", () => {
    render(createElement(StudentHomePage, { state: "loading" }));
    expect(screen.getByText("正在加载授权范围")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentHomePage, { state: "error" }));
    expect(screen.getByText("学员首页加载失败")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentHomePage, {
        scopes: [studentHomeFixture.scopes[0]],
        papers: [],
      }),
    );
    expect(screen.getByText("当前范围暂无试卷")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentHomePage, { scopes: [], papers: [] }));
    expect(screen.getByText("暂无有效授权")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往兑换卡密" })).toHaveAttribute(
      "href",
      "/redeem-code",
    );
  });
});
