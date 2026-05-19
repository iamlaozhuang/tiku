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
  StudentExamReportPage,
  StudentMockExamPage,
  studentExamReportFixture,
  studentMockExamFixture,
} from "@/features/student/mock-exam/StudentMockExamReportPage";

afterEach(() => {
  cleanup();
});

describe("StudentMockExamPage", () => {
  it("renders the selected mock exam with public identifiers, remaining time, and progress", () => {
    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-marketing-theory-001",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();
    expect(screen.getByText("剩余 75 分钟")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 3 题")).toBeInTheDocument();
    expect(
      screen.getByText("mock-exam-marketing-theory-001"),
    ).toBeInTheDocument();

    const mockExamSurface = screen.getByTestId(
      "mock-exam-surface-mock-exam-marketing-theory-001",
    );

    expect(mockExamSurface).toHaveAttribute(
      "data-public-id",
      "mock-exam-marketing-theory-001",
    );
    expect(mockExamSurface).not.toHaveAttribute("data-id");
    expect(mockExamSurface).not.toHaveTextContent("1001");
  });

  it("does not reveal standard answers or analysis before mock exam submit", () => {
    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-marketing-theory-001",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));

    expect(screen.getByText("本题作答已保存")).toBeInTheDocument();
    expect(screen.queryByText("正确答案：B. 客户需求分析")).toBeNull();
    expect(
      screen.queryByText("解析：客户需求分析用于识别客户真实购买动机。"),
    ).toBeNull();
  });

  it("supports next question navigation, question card navigation, and submit confirmation", () => {
    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-marketing-theory-001",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "下一题" }));

    expect(screen.getByText("第 2 / 3 题")).toBeInTheDocument();
    expect(screen.getByText("以下哪项属于服务复盘动作？")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "题号 3" }));

    expect(screen.getByText("第 3 / 3 题")).toBeInTheDocument();
    expect(screen.getByText("判断：客户画像应定期复核。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "交卷" }));

    const confirmation = screen.getByTestId("mock-exam-submit-confirmation");
    expect(within(confirmation).getByText("确认交卷")).toBeInTheDocument();
    expect(
      within(confirmation).getByText("仍有 3 题未保存作答。"),
    ).toBeInTheDocument();
  });

  it("shows a report entry after submit", () => {
    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-marketing-theory-001",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "交卷" }));
    fireEvent.click(screen.getByRole("button", { name: "确认交卷" }));

    expect(screen.getByText("模考已提交")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看考试报告" })).toHaveAttribute(
      "href",
      "/exam-report?examReportPublicId=exam-report-marketing-theory-001",
    );
  });

  it("renders loading, error, authorization expired, and empty mock exam states", () => {
    render(createElement(StudentMockExamPage, { state: "loading" }));
    expect(screen.getByText("正在加载模拟考试")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentMockExamPage, { state: "error" }));
    expect(screen.getByText("模拟考试加载失败")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentMockExamPage, { state: "authorization_expired" }),
    );
    expect(screen.getByText("授权已失效")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-unknown",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );
    expect(screen.getByText("暂无可进入的模拟考试")).toBeInTheDocument();
  });
});

describe("StudentExamReportPage", () => {
  it("renders completed report score summary, question results, mistake entry, and learning suggestion placeholder", () => {
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-theory-001",
        examReports: studentExamReportFixture.examReports,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();
    expect(screen.getByText("总分 86.0")).toBeInTheDocument();
    expect(screen.getByText("正确率 67%")).toBeInTheDocument();
    expect(screen.getByText("得分 86.0 / 100")).toBeInTheDocument();
    expect(screen.getByText("客户需求分析")).toBeInTheDocument();
    expect(
      screen.getByText("已加入错题本：mistake-book-marketing-101"),
    ).toBeInTheDocument();
    expect(screen.getByText("学习建议：生成中")).toBeInTheDocument();

    const reportSurface = screen.getByTestId(
      "exam-report-surface-exam-report-marketing-theory-001",
    );

    expect(reportSurface).toHaveAttribute(
      "data-public-id",
      "exam-report-marketing-theory-001",
    );
    expect(reportSurface).not.toHaveAttribute("data-id");
    expect(reportSurface).not.toHaveTextContent("2001");
  });

  it("renders scoring, scoring partial failed, completed, loading, error, authorization expired, and empty report states", () => {
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-scoring-001",
        examReports: studentExamReportFixture.examReports,
      }),
    );
    expect(screen.getByText("评分中")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-partial-001",
        examReports: studentExamReportFixture.examReports,
      }),
    );
    expect(screen.getByText("评分部分失败")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-theory-001",
        examReports: studentExamReportFixture.examReports,
      }),
    );
    expect(screen.getByText("已完成")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentExamReportPage, { state: "loading" }));
    expect(screen.getByText("正在加载考试报告")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentExamReportPage, { state: "error" }));
    expect(screen.getByText("考试报告加载失败")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentExamReportPage, { state: "authorization_expired" }),
    );
    expect(screen.getByText("授权已失效")).toBeInTheDocument();

    cleanup();
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-unknown",
        examReports: studentExamReportFixture.examReports,
      }),
    );
    expect(screen.getByText("暂无考试报告")).toBeInTheDocument();
  });
});
