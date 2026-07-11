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
  it("shows an actionable empty state when the runtime route has no selected paper or mock exam", () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMockExamPage));

    expect(screen.getByText("请选择模拟考试入口")).toBeInTheDocument();
    expect(
      screen.getByText("请先从学员首页选择试卷后再进入模拟考试。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回学员首页" })).toHaveAttribute(
      "href",
      "/home",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

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
    expect(screen.getByText("未找到模拟考试")).toBeInTheDocument();
  });

  it("distinguishes a missing runtime mock exam from a generic load failure", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404001,
          message: "missing",
          data: null,
        }),
      })),
    );

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-missing",
      }),
    );

    expect(await screen.findByText("未找到模拟考试")).toBeInTheDocument();
    expect(screen.queryByText("模拟考试加载失败")).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("starts a mock exam through the cookie-backed session when no local token is stored", async () => {
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/mock-exams");
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("same-origin");
        expect(new Headers(init?.headers).get("authorization")).toBeNull();
        expect(JSON.parse(String(init?.body))).toEqual({
          paperPublicId: "paper-content-published-001",
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
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("授权已失效")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("starts, saves, and submits a mock exam through the session runtime without exposing answers before submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/mock-exams") {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toEqual({
            paperPublicId: "paper-content-published-001",
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

        if (String(url) === "/api/v1/exam-reports") {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toEqual({
            mockExamPublicId: "mock-exam-marketing-theory-001",
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                examReport: {
                  ...studentExamReportFixture.examReports[0],
                  publicId: "exam-report-from-runtime-submit",
                  mockExamPublicId: "mock-exam-marketing-theory-001",
                  paperPublicId: "paper-content-published-001",
                },
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
        paperPublicId: "paper-content-published-001",
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
    expect(screen.getByRole("link", { name: "查看考试报告" })).toHaveAttribute(
      "href",
      "/exam-report?examReportPublicId=exam-report-from-runtime-submit",
    );
    expect(document.body.textContent).not.toContain("unit-test-session-token");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    const cachedMockExam = localStorage.getItem(
      "tiku.mockExam.cache.paper-content-published-001",
    );

    expect(cachedMockExam).toContain("mock-exam-marketing-theory-001");
    expect(cachedMockExam).not.toContain("unit-test-session-token");
  });

  it("recovers a runtime mock exam from local cache when the network load fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    localStorage.setItem(
      "tiku.mockExam.cache.paper-content-published-001",
      JSON.stringify({
        cachedAt: "2026-05-23T00:00:00.000Z",
        mockExam: {
          ...studentMockExamFixture.mockExams[0].mockExam,
          paperPublicId: "paper-content-published-001",
        },
      }),
    );
    const fetchMock = vi.fn(async () => {
      throw new Error("offline");
    });
    vi.stubGlobal("fetch", fetchMock);

    type RuntimeMockExamProps = Parameters<typeof StudentMockExamPage>[0] & {
      paperPublicId: string;
    };

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      } satisfies RuntimeMockExamProps),
    );

    expect(
      await screen.findByTestId("mock-exam-offline-recovery"),
    ).toHaveTextContent("Offline recovery");
    expect(
      screen.getByTestId("mock-exam-surface-mock-exam-marketing-theory-001"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("queues failed runtime mock answer saves and retries them without exposing the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    let saveAttemptCount = 0;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/mock-exams") {
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
          saveAttemptCount += 1;

          if (saveAttemptCount === 1) {
            throw new Error("offline");
          }

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
                  publicId: "answer-record-runtime-retry-001",
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
        paperPublicId: "paper-content-published-001",
      } satisfies RuntimeMockExamProps),
    );

    expect(
      await screen.findByRole("heading", { name: /理论模考卷 A/ }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));

    const retrySurface = await screen.findByTestId(
      "mock-exam-answer-save-retry",
    );

    expect(retrySurface).toHaveTextContent("1 题待重新保存");

    const queuedAnswer = localStorage.getItem(
      "tiku.mockExam.answerQueue.mock-exam-marketing-theory-001",
    );

    expect(queuedAnswer).toContain("paper-question-mock-marketing-001");
    expect(queuedAnswer).not.toContain("unit-test-session-token");

    fireEvent.click(screen.getByRole("button", { name: "重试保存" }));

    await waitFor(() =>
      expect(screen.queryByTestId("mock-exam-answer-save-retry")).toBeNull(),
    );
    expect(
      localStorage.getItem(
        "tiku.mockExam.answerQueue.mock-exam-marketing-theory-001",
      ),
    ).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(saveAttemptCount).toBe(2);
  });

  it("shows the scoring progress surface after runtime submit returns a scoring mock exam", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/mock-exams") {
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
                  examStatus: "scoring",
                  submittedAt: "2026-05-23T00:30:00.000Z",
                },
                unansweredCount: 3,
              },
            }),
          };
        }

        throw new Error(`Unexpected request: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "交卷" }));
    fireEvent.click(screen.getByRole("button", { name: "确认交卷" }));

    expect(
      await screen.findByText("评分可能需要几分钟，请耐心等待或稍后查看"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("exam-scoring-progress-surface")).toHaveAttribute(
      "data-public-id",
      "mock-exam-marketing-theory-001",
    );
    expect(screen.queryByRole("link", { name: "查看考试报告" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "saves %s mock exam snapshots as text answers",
    async (questionType) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
      const mockExam = {
        ...studentMockExamFixture.mockExams[0].mockExam,
        publicId: `mock-exam-${questionType}-runtime`,
        paperPublicId: `paper-${questionType}-mock-runtime`,
        paperSnapshot: {
          name: `Synthetic ${questionType} mock_exam`,
          paperSections: [
            {
              title: "Synthetic subjective paper_section",
              paperQuestions: [
                {
                  paperQuestionPublicId: `paper-question-${questionType}-001`,
                  questionPublicId: `question-${questionType}-001`,
                  questionType,
                  stemRichText: `Synthetic ${questionType} stem`,
                  score: "10.0",
                },
              ],
            },
          ],
        },
      };
      const fetchMock = vi.fn(
        async (url: RequestInfo | URL, init?: RequestInit) => {
          if (String(url) === "/api/v1/mock-exams") {
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
            `/api/v1/mock-exams/mock-exam-${questionType}-runtime/answers`
          ) {
            expect(JSON.parse(String(init?.body))).toMatchObject({
              paperQuestionPublicId: `paper-question-${questionType}-001`,
              selectedLabels: [],
              textAnswer: `Synthetic ${questionType} answer`,
            });

            return {
              ok: true,
              status: 200,
              json: async () => ({
                code: 0,
                message: "ok",
                data: {
                  answerRecord: {
                    publicId: "answer-record-synthetic",
                  },
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

      render(
        createElement(StudentMockExamPage, {
          paperPublicId: `paper-${questionType}-mock-runtime`,
        }),
      );

      expect(
        await screen.findByRole("heading", {
          name: `Synthetic ${questionType} mock_exam`,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Synthetic ${questionType} stem`),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("文字答案"), {
        target: { value: `Synthetic ${questionType} answer` },
      });
      fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));

      expect(await screen.findByText("本题作答已保存")).toBeInTheDocument();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    },
  );
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
    expect(screen.getByText("已加入错题本")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      "mistake-book-marketing-101",
    );
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

  it("renders full learning suggestion text and citations when report snapshot provides them", () => {
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-learning-suggestion-full-text",
      learningSuggestionSnapshot: {
        summaryText: "建议优先复盘客户需求分析，再完成错题二刷。",
        suggestionItems: [
          "先复习需求识别，再练习服务复盘。",
          {
            title: "错题复盘",
            detail: "把已加入错题本的题目按知识点重新练习。",
          },
        ],
        citations: [
          {
            title: "营销基础讲义",
            headingPath: ["客户服务", "需求分析"],
          },
        ],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-learning-suggestion-full-text",
        examReports: [report],
      }),
    );

    expect(screen.getByText("学习建议：已生成")).toBeInTheDocument();
    expect(
      screen.getByText("建议优先复盘客户需求分析，再完成错题二刷。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("先复习需求识别，再练习服务复盘。"),
    ).toBeInTheDocument();
    expect(screen.getByText("错题复盘")).toBeInTheDocument();
    expect(
      screen.getByText("把已加入错题本的题目按知识点重新练习。"),
    ).toBeInTheDocument();
    expect(screen.getByText("营销基础讲义")).toBeInTheDocument();
    expect(screen.getByText("客户服务 > 需求分析")).toBeInTheDocument();
  });

  it("renders subjective question type and paper_section statistics from report snapshots", () => {
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-subjective-statistics",
      reportSnapshot: {
        totalScoreText: "总分 8.0",
        accuracyText: "得分率 80%",
        scoreSummaryText: "得分 8.0 / 10",
        questionTypeSummaryText: "案例分析题 1 题，计算题 1 题",
        paperSectionSummaryText: "案例模块 得分率 80%",
        knowledgeNodeSummaryText:
          "knowledge_node analytics: knowledge-node-case 1, knowledge-node-calculation 1",
        questionResults: [
          {
            paperQuestionPublicId: "paper-question-case-analysis-001",
            questionPublicId: "question-case-analysis-001",
            questionType: "case_analysis",
            title: "Synthetic case_analysis report item",
            isCorrect: null,
            score: "4.0",
            maxScore: "5.0",
            selectedAnswer: "Synthetic selected answer",
            standardAnswer: "Synthetic reference",
            mistakeBookPublicId: null,
          },
          {
            paperQuestionPublicId: "paper-question-calculation-001",
            questionPublicId: "question-calculation-001",
            questionType: "calculation",
            title: "Synthetic calculation report item",
            isCorrect: null,
            score: "4.0",
            maxScore: "5.0",
            selectedAnswer: "Synthetic selected answer",
            standardAnswer: "Synthetic reference",
            mistakeBookPublicId: null,
          },
        ],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-subjective-statistics",
        examReports: [report],
      }),
    );

    expect(
      screen.getByText("案例分析题 1 题，计算题 1 题"),
    ).toBeInTheDocument();
    expect(screen.getByText("案例模块 得分率 80%")).toBeInTheDocument();
    expect(screen.getByText("案例分析题")).toBeInTheDocument();
    expect(screen.getByText("计算题")).toBeInTheDocument();
    expect(
      screen.getByText(
        "knowledge_node analytics: knowledge-node-case 1, knowledge-node-calculation 1",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Synthetic case_analysis report item"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Synthetic calculation report item"),
    ).toBeInTheDocument();
  });

  it("renders knowledge_node weakness analysis from historical report snapshots", () => {
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-knowledge-node-analysis",
      reportSnapshot: {
        totalScoreText: "total score 3.0",
        accuracyText: "accuracy 67%",
        scoreSummaryText: "score 3.0 / 6.0",
        knowledgeNodeWeaknessSummaryText:
          "knowledge_node weakness: knowledge_node_public_weak score_rate 0% accuracy 0% score 0.0/2.0",
        knowledgeNodeAnalysis: [
          {
            knowledgeNodePublicId: "knowledge_node_public_weak",
            questionCount: 1,
            answeredCount: 0,
            correctCount: 0,
            score: "0.0",
            maxScore: "2.0",
            scoreRate: 0,
            accuracyRate: 0,
            weaknessRank: 1,
            questionPublicIds: ["question_shared_unanswered"],
          },
          {
            knowledgeNodePublicId: "knowledge_node_public_shared",
            questionCount: 2,
            answeredCount: 1,
            correctCount: 1,
            score: "1.0",
            maxScore: "4.0",
            scoreRate: 25,
            accuracyRate: 50,
            weaknessRank: 2,
            questionPublicIds: [
              "question_shared_correct",
              "question_shared_unanswered",
            ],
          },
        ],
        questionResults: [],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-knowledge-node-analysis",
        examReports: [report],
      }),
    );

    expect(screen.getByText("知识点薄弱项")).toBeInTheDocument();
    expect(screen.getByText("薄弱项 1")).toBeInTheDocument();
    expect(screen.getByText("得分率 0%")).toBeInTheDocument();
    expect(screen.getByText("正确率 0%")).toBeInTheDocument();
    expect(screen.getByText("0.0 / 2.0")).toBeInTheDocument();
    expect(
      screen.getByText("覆盖 1 题，已答 0 题，正确 0 题"),
    ).toBeInTheDocument();
    expect(screen.getByText("薄弱项 2")).toBeInTheDocument();
    expect(screen.getByText("得分率 25%")).toBeInTheDocument();
    expect(screen.getByText("正确率 50%")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      "knowledge_node_public_weak",
    );
    expect(document.body.textContent).not.toContain(
      "knowledge_node_public_shared",
    );
  });

  it("renders fill_blank scoring method and per-blank report details", () => {
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-fill-blank-scoring",
      reportSnapshot: {
        totalScoreText: "total score 1.0",
        accuracyText: "accuracy 50%",
        scoreSummaryText: "score 1.0 / 2.0",
        questionResults: [
          {
            paperQuestionPublicId: "paper-question-fill-blank-001",
            questionPublicId: "question-fill-blank-001",
            questionType: "fill_blank",
            scoringMethod: "auto_match",
            title: "Fill blank per blank report item",
            isCorrect: false,
            score: "1.0",
            maxScore: "2.0",
            selectedAnswer: "customer motive; wrong answer",
            standardAnswer:
              "blank_1: customer motive; blank_2: purchase frequency",
            mistakeBookPublicId: "mistake-book-fill-blank-001",
            fillBlankAnswers: [
              {
                blankKey: "blank_1",
                standardAnswers: ["customer motive"],
                score: "1.0",
                sortOrder: 1,
              },
              {
                blankKey: "blank_2",
                standardAnswers: ["purchase frequency"],
                score: "1.0",
                sortOrder: 2,
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-fill-blank-scoring",
        examReports: [report],
      }),
    );

    expect(
      screen.getByText("Fill blank per blank report item"),
    ).toBeInTheDocument();
    expect(screen.getByText("填空题")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === "计分方式：自动匹配",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "blank_1：customer motive（1.0 分）",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "blank_2：purchase frequency（1.0 分）",
      ),
    ).toBeInTheDocument();
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
    expect(screen.getByText("未找到考试报告")).toBeInTheDocument();
  });

  it("renders scoring reports as a progress surface without half-finished score details", () => {
    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-scoring-001",
        examReports: studentExamReportFixture.examReports,
      }),
    );

    expect(screen.getByTestId("exam-scoring-progress-surface")).toHaveAttribute(
      "data-public-id",
      "exam-report-marketing-scoring-001",
    );
    expect(
      screen.getByText("评分可能需要几分钟，请耐心等待或稍后查看"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "刷新结果" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("总分")).toBeNull();
    expect(screen.queryByText("题目结果")).toBeNull();
    expect(screen.queryByText("得分生成中")).toBeNull();
  });

  it("reloads a runtime scoring report when the student refreshes the result", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: {
            examReport: studentExamReportFixture.examReports[1],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: {
            examReport: {
              ...studentExamReportFixture.examReports[0],
              publicId: "exam-report-marketing-scoring-001",
              examReportPublicId: "exam-report-marketing-scoring-001",
            },
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-scoring-001",
      }),
    );

    expect(
      await screen.findByText("评分可能需要几分钟，请耐心等待或稍后查看"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "刷新结果" }));

    expect(await screen.findByText("总分 86.0")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows failed scoring count and retry action for partial failed reports", () => {
    const partialReport = {
      ...studentExamReportFixture.examReports[2],
      reportSnapshot: {
        ...studentExamReportFixture.examReports[2].reportSnapshot,
        failedScoringCount: 2,
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-marketing-partial-001",
        examReports: [partialReport],
      }),
    );

    expect(screen.getByText("2 道题评分失败")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "重试评分" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("题目结果")).toBeNull();
  });

  it("distinguishes a missing runtime exam report from a generic load failure", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404001,
          message: "missing",
          data: null,
        }),
      })),
    );

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-missing",
      }),
    );

    expect(await screen.findByText("未找到考试报告")).toBeInTheDocument();
    expect(screen.queryByText("考试报告加载失败")).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
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
  it("loads mock exam records through the cookie-backed session when no local token is stored", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe(
          "/api/v1/exam-reports?page=1&pageSize=20&sortBy=startedAt",
        );
        expect(init?.credentials).toBe("same-origin");
        expect(new Headers(init?.headers).get("authorization")).toBeNull();

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReports: [studentExamReportFixture.examReports[0]],
            },
            pagination: {
              page: 1,
              pageSize: 20,
              total: 1,
              sortBy: "startedAt",
              sortOrder: "desc",
            },
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentExamReportListPage));

    expect(await screen.findByText("营销理论模考卷 A")).toBeInTheDocument();
    expect(screen.queryByText("授权已失效")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads mock exam records with fixed page size and supports previous-next pagination", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.credentials).toBe("same-origin");

        if (
          String(url) ===
          "/api/v1/exam-reports?page=1&pageSize=20&sortBy=startedAt"
        ) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                examReports: [studentExamReportFixture.examReports[0]],
              },
              pagination: {
                page: 1,
                pageSize: 20,
                total: 21,
                sortBy: "startedAt",
                sortOrder: "desc",
              },
            }),
          };
        }

        expect(String(url)).toBe(
          "/api/v1/exam-reports?page=2&pageSize=20&sortBy=startedAt",
        );

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReports: [
                {
                  ...studentExamReportFixture.examReports[0],
                  publicId: "mock-exam-page-2",
                  paperName: "营销理论模考卷 B",
                },
              ],
            },
            pagination: {
              page: 2,
              pageSize: 20,
              total: 21,
              sortBy: "startedAt",
              sortOrder: "desc",
            },
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentExamReportListPage));

    expect(await screen.findByText("营销理论模考卷 A")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 2 页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一页" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(await screen.findByText("营销理论模考卷 B")).toBeInTheDocument();
    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("loads mock exam records and supports search plus status filtering", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe(
          "/api/v1/exam-reports?page=1&pageSize=20&sortBy=startedAt",
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
            data: {
              examReports: [
                studentExamReportFixture.examReports[0],
                {
                  ...studentExamReportFixture.examReports[0],
                  publicId: "mock-exam-terminated-001",
                  examReportPublicId: null,
                  mockExamPublicId: "mock-exam-terminated-001",
                  paperName: "营销理论终止记录",
                  examStatus: "terminated",
                  totalScore: null,
                  startedAt: "2026-05-18T08:00:00.000Z",
                  generatedAt: "2026-05-26T08:00:00.000Z",
                },
              ],
            },
            pagination: {
              page: 1,
              pageSize: 20,
              total: 2,
              sortBy: "startedAt",
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

    expect(screen.getByText(/2026-05-18/)).toBeInTheDocument();

    expect(screen.getByText("营销理论终止记录")).toBeInTheDocument();
    expect(screen.queryByText("营销理论模考卷 A")).toBeNull();
    expect(screen.getByText("得分：--")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });
});
