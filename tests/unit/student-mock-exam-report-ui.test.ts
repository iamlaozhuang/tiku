import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  StudentExamReportListPage,
  StudentExamReportPage,
  StudentMockExamPage,
  studentExamReportFixture,
  studentMockExamFixture,
} from "@/features/student/mock-exam/StudentMockExamReportPage";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
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

  it("renders runtime mock exam snapshots that keep section title and rich option content in normalized fields", () => {
    const runtimeMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-runtime-snapshot",
      paperSnapshot: {
        name: "Runtime mock exam",
        paperSections: [
          {
            title: "Runtime section",
            paperQuestions: [
              {
                paperQuestionPublicId: "paper-question-runtime-001",
                questionPublicId: "question-runtime-001",
                questionType: "single_choice",
                stemRichText: "Runtime stem",
                questionOptions: [
                  {
                    label: "A",
                    contentRichText: "runtime option",
                  },
                ],
                score: "1.0",
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-runtime-snapshot",
        mockExams: [
          {
            mockExam: runtimeMockExam,
            examReportPublicId: "exam-report-runtime-snapshot",
          },
        ],
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Runtime mock exam" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Runtime section")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "A. runtime option" }),
    ).toBeInTheDocument();
  });

  it("renders local seed mock exam snapshots that store objective choices as options", () => {
    const runtimeMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-local-seed-snapshot",
      paperSnapshot: {
        name: "Local seed mock exam",
        paperSections: [
          {
            title: "Local seed section",
            paperQuestions: [
              {
                paperQuestionPublicId: "paper-question-local-seed-001",
                questionPublicId: "question-local-seed-001",
                questionType: "single_choice",
                stemRichText: "Local seed stem",
                options: [
                  {
                    label: "A",
                    contentRichText: "local seed option",
                  },
                ],
                standardAnswerLabels: ["A"],
                score: "1.0",
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-local-seed-snapshot",
        mockExams: [
          {
            mockExam: runtimeMockExam,
            examReportPublicId: "exam-report-local-seed-snapshot",
          },
        ],
      }),
    );

    expect(
      screen.getByRole("button", { name: "A. local seed option" }),
    ).toBeInTheDocument();
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

  it("starts, saves, and submits a mock exam through the session runtime without exposing answers before submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = studentMockExamFixture.mockExams[0].mockExam;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/mock-exams") {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toEqual({
            paperPublicId: "paper-marketing-theory-mock-001",
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { mockExam },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/mock-exams/mock-exam-marketing-theory-001/answers"
        ) {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toMatchObject({
            paperQuestionPublicId: "paper-question-mock-marketing-001",
            selectedLabels: ["A"],
            textAnswer: null,
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                answerRecord: {
                  publicId: "answer-record-runtime-001",
                  examMode: "mock_exam",
                  paperQuestionPublicId: "paper-question-mock-marketing-001",
                  questionPublicId: "question-mock-marketing-001",
                  answerSnapshot: {
                    selectedLabels: ["A"],
                    textAnswer: null,
                    savedFromClientAt: "2026-05-23T00:00:00.000Z",
                  },
                  answerRecordStatus: "saved",
                  isCorrect: null,
                  score: null,
                  maxScore: "2.0",
                  answeredAt: "2026-05-23T00:00:00.000Z",
                  submittedAt: null,
                },
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/mock-exams/mock-exam-marketing-theory-001/submit"
        ) {
          expect(init?.method).toBe("POST");

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                mockExam: {
                  ...mockExam,
                  examStatus: "completed",
                  submittedAt: "2026-05-23T00:30:00.000Z",
                },
                unansweredCount: 2,
              },
            }),
          };
        }

        return {
          ok: false,
          status: 404,
          json: async () => ({
            code: 404001,
            message: "missing",
            data: null,
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    type RuntimeMockExamProps = Parameters<typeof StudentMockExamPage>[0] & {
      paperPublicId: string;
    };

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-marketing-theory-mock-001",
      } satisfies RuntimeMockExamProps),
    );

    expect(screen.getByText("正在加载模拟考试")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));

    expect(await screen.findByText("本题作答已保存")).toBeInTheDocument();
    expect(screen.queryByText("正确答案：B. 客户需求分析")).toBeNull();
    expect(
      screen.queryByText("解析：客户需求分析用于识别客户真实购买动机。"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "交卷" }));
    fireEvent.click(screen.getByRole("button", { name: "确认交卷" }));

    expect(await screen.findByText("模考已提交")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
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

  it("loads exam report detail through the session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const report = studentExamReportFixture.examReports[0];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe(
          "/api/v1/exam-reports/exam-report-marketing-theory-001",
        );
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: { examReport: report },
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-theory-001",
      }),
    );

    expect(screen.getByText("正在加载考试报告")).toBeInTheDocument();
    expect(await screen.findByText("总分 86.0")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("StudentExamReportListPage", () => {
  it("loads mock exam records and supports search plus status filtering", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/exam-reports?page=1&pageSize=20");
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReports: [
                studentExamReportFixture.examReports[0],
                {
                  ...studentExamReportFixture.examReports[0],
                  publicId: "exam-report-terminated-001",
                  paperName: "营销理论终止记录",
                  examStatus: "terminated",
                  totalScore: null,
                },
              ],
            },
            pagination: {
              page: 1,
              pageSize: 20,
              total: 2,
              sortBy: "generatedAt",
              sortOrder: "desc",
            },
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentExamReportListPage));

    expect(screen.getByText("正在加载模拟考试记录")).toBeInTheDocument();
    expect(await screen.findByText("营销理论模考卷 A")).toBeInTheDocument();
    expect(screen.getByText("营销理论终止记录")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("按试卷名称搜索"), {
      target: { value: "终止" },
    });
    fireEvent.change(screen.getByLabelText("按状态筛选"), {
      target: { value: "terminated" },
    });

    expect(screen.getByText("营销理论终止记录")).toBeInTheDocument();
    expect(screen.queryByText("营销理论模考卷 A")).toBeNull();
    expect(screen.getByText("得分：--")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });
});
