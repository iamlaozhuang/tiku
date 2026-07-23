import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  vi.useRealTimers();
});

beforeEach(() => {
  localStorage.setItem("tiku.studentSessionScope", "student-test-scope");
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

  it("renders the selected mock exam without visible public identifiers", () => {
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
    expect(screen.queryByText("mock-exam-marketing-theory-001")).toBeNull();

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

  it("advances the countdown continuously from the server clock offset", () => {
    vi.useFakeTimers();

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: "mock-exam-marketing-theory-001",
        mockExams: studentMockExamFixture.mockExams,
      }),
    );

    expect(screen.getByText("剩余 75 分钟")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText("剩余 74 分钟")).toBeInTheDocument();
  });

  it("routes a persisted completed mock exam to its stable report public id on reload", async () => {
    const completedMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-runtime-completed",
      examStatus: "completed" as const,
      submittedAt: "2026-05-20T01:00:00.000Z",
    };
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/mock-exams/mock-exam-runtime-completed") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: { mockExam: completedMockExam },
          }),
        };
      }

      if (String(url) === "/api/v1/exam-reports") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReport: {
                ...studentExamReportFixture.examReports[0],
                publicId: "exam-report-runtime-stable",
                mockExamPublicId: completedMockExam.publicId,
              },
            },
          }),
        };
      }

      throw new Error(`unexpected request: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: completedMockExam.publicId,
      }),
    );

    expect(
      await screen.findByRole("link", { name: "查看考试报告" }),
    ).toHaveAttribute(
      "href",
      "/exam-report?examReportPublicId=exam-report-runtime-stable",
    );
    expect(screen.queryByText("第 1 / 3 题")).toBeNull();
    expect(document.body.textContent).not.toContain(
      "mock-exam-runtime-completed?",
    );
  });

  it("routes a persisted scoring mock exam to progress on reload", async () => {
    const scoringMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-runtime-scoring",
      examStatus: "scoring" as const,
      submittedAt: "2026-05-20T01:00:00.000Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: { mockExam: scoringMockExam },
        }),
      })),
    );

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: scoringMockExam.publicId,
      }),
    );

    expect(
      await screen.findByTestId("exam-scoring-progress-surface"),
    ).toHaveAttribute("data-public-id", scoringMockExam.publicId);
    expect(screen.queryByText("第 1 / 3 题")).toBeNull();
    expect(screen.queryByRole("link", { name: "查看考试报告" })).toBeNull();
  });

  it("renders a persisted terminated mock exam read-only without a report link", async () => {
    const terminatedMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-runtime-terminated",
      examStatus: "terminated" as const,
      submittedAt: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: { mockExam: terminatedMockExam },
        }),
      })),
    );

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: terminatedMockExam.publicId,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "模拟考试已终止" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("第 1 / 3 题")).toBeNull();
    expect(screen.queryByRole("link", { name: "查看考试报告" })).toBeNull();
  });

  it("refreshes authoritative state at zero and routes the auto-submitted exam", async () => {
    vi.useFakeTimers();
    const activeMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-runtime-deadline",
      serverNow: "2026-05-20T00:15:00.000Z",
      serverDeadlineAt: "2026-05-20T00:16:00.000Z",
    };
    const completedMockExam = {
      ...activeMockExam,
      examStatus: "completed" as const,
      submittedAt: "2026-05-20T00:16:00.000Z",
    };
    let mockExamReadCount = 0;
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/mock-exams/mock-exam-runtime-deadline") {
        mockExamReadCount += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              mockExam:
                mockExamReadCount === 1 ? activeMockExam : completedMockExam,
            },
          }),
        };
      }

      if (String(url) === "/api/v1/exam-reports") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReport: {
                ...studentExamReportFixture.examReports[0],
                publicId: "exam-report-runtime-deadline",
                mockExamPublicId: completedMockExam.publicId,
              },
            },
          }),
        };
      }

      throw new Error(`unexpected request: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: activeMockExam.publicId,
      }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("剩余 1 分钟")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByRole("link", { name: "查看考试报告" })).toHaveAttribute(
      "href",
      "/exam-report?examReportPublicId=exam-report-runtime-deadline",
    );
    expect(mockExamReadCount).toBe(2);
  });

  it("autosaves the current answer before navigating to another question", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const answerRequests: Record<string, unknown>[] = [];
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

        if (String(url).endsWith("/answers")) {
          answerRequests.push(JSON.parse(String(init?.body)));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                answerRecord: {
                  publicId: "answer_record_public_autosave",
                  answerRevision: 1,
                },
              },
            }),
          };
        }

        throw new Error(`unexpected request: ${String(url)}`);
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
    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "下一题" }));

    await waitFor(() => expect(answerRequests).toHaveLength(1));
    expect(answerRequests[0]).toMatchObject({
      paperQuestionPublicId: "paper-question-mock-marketing-001",
      selectedLabels: ["A"],
      operationId: expect.stringMatching(/^answer_operation_/u),
      expectedRevision: 0,
    });
    expect(screen.getByText("第 2 / 3 题")).toBeInTheDocument();
  });

  it("autosaves a changed answer with the next server revision", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const answerRequests: Record<string, unknown>[] = [];
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

        if (String(url).endsWith("/answers")) {
          answerRequests.push(JSON.parse(String(init?.body)));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                answerRecord: {
                  publicId: "answer_record_public_revision",
                  answerRevision: answerRequests.length,
                },
              },
            }),
          };
        }

        throw new Error(`unexpected request: ${String(url)}`);
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
    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));
    await waitFor(() => expect(answerRequests).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "B. 客户需求分析" }));
    fireEvent.click(screen.getByRole("button", { name: "下一题" }));

    await waitFor(() => expect(answerRequests).toHaveLength(2));
    expect(answerRequests[1]).toMatchObject({
      selectedLabels: ["B"],
      expectedRevision: 1,
    });
  });

  it("hydrates persisted answer revisions before editing a resumed mock_exam", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
      answeredCount: 1,
    };
    const answerRequests: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/mock-exams") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                mockExam,
                answerRecords: [
                  {
                    paperQuestionPublicId: "paper-question-mock-marketing-001",
                    answerSnapshot: {
                      selectedLabels: ["A"],
                      textAnswer: null,
                    },
                    answerRevision: 3,
                  },
                ],
              },
            }),
          };
        }

        if (String(url).endsWith("/answers")) {
          answerRequests.push(JSON.parse(String(init?.body)));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                answerRecord: {
                  publicId: "answer_record_public_resumed",
                  answerRevision: 4,
                },
              },
            }),
          };
        }

        throw new Error(`unexpected request: ${String(url)}`);
      }),
    );

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => element?.textContent === "1 / 3"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "B. 客户需求分析" }));
    fireEvent.click(screen.getByRole("button", { name: "下一题" }));

    await waitFor(() => expect(answerRequests).toHaveLength(1));
    expect(answerRequests[0]).toMatchObject({
      selectedLabels: ["B"],
      expectedRevision: 3,
    });
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
        snapshotVersion: 2,
        name: "Runtime mock exam",
        paperSections: [
          {
            publicId: "paper-section-runtime-001",
            title: "Runtime section",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "question-group-runtime-001",
                title: "Runtime group",
                sortOrder: 1,
                totalScore: "1.0",
                materialSnapshot: {
                  materialPublicId: "material-runtime-001",
                  title: "Runtime material",
                  contentRichText: "<p>Runtime material body</p>",
                },
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
    expect(screen.getByText("Runtime group")).toBeInTheDocument();
    expect(screen.getByText("Runtime material body")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "A. runtime option" }),
    ).toBeInTheDocument();
  });

  it("renders one question_group page, autosaves every changed child, and navigates by group", async () => {
    const createQuestion = (
      paperQuestionPublicId: string,
      stemRichText: string,
    ) => ({
      paperQuestionPublicId,
      questionPublicId: `question-${paperQuestionPublicId}`,
      questionType: "short_answer",
      stemRichText,
      questionOptions: [],
      score: "10.0",
    });
    const groupedMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-grouped-navigation",
      subject: "skill" as const,
      questionCount: 3,
      paperSnapshot: {
        snapshotVersion: 2,
        name: "技能题组模考",
        paperSections: [
          {
            publicId: "paper-section-grouped-1",
            title: "技能大题一",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "question-group-grouped-1",
                title: "材料一题组",
                sortOrder: 1,
                totalScore: "20.0",
                materialSnapshot: {
                  materialPublicId: "material-grouped-1",
                  title: "材料一",
                  contentRichText: "材料一正文",
                },
                paperQuestions: [
                  createQuestion("paper-question-grouped-1-a", "题组一子题 A"),
                  createQuestion("paper-question-grouped-1-b", "题组一子题 B"),
                ],
              },
            ],
          },
          {
            publicId: "paper-section-grouped-2",
            title: "技能大题二",
            sortOrder: 2,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "question-group-grouped-2",
                title: "材料二题组",
                sortOrder: 1,
                totalScore: "10.0",
                materialSnapshot: {
                  materialPublicId: "material-grouped-2",
                  title: "材料二",
                  contentRichText: "材料二正文",
                },
                paperQuestions: [
                  createQuestion("paper-question-grouped-2-a", "题组二子题 A"),
                ],
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: groupedMockExam.publicId,
        mockExams: [
          {
            mockExam: groupedMockExam,
            examReportPublicId: "exam-report-grouped-navigation",
          },
        ],
      }),
    );

    expect(screen.getByText("第 1 / 2 组")).toBeInTheDocument();
    const firstGroup = screen.getByTestId(
      "mock-exam-question-group-question-group-grouped-1",
    );
    expect(within(firstGroup).getByText("材料一题组")).toBeInTheDocument();
    expect(within(firstGroup).getByText("题组共 20.0 分")).toBeInTheDocument();
    expect(within(firstGroup).getAllByText("材料一")).toHaveLength(1);
    expect(within(firstGroup).getByText("材料一正文")).toBeInTheDocument();
    expect(within(firstGroup).getByText("题组一子题 A")).toBeInTheDocument();
    expect(within(firstGroup).getByText("题组一子题 B")).toBeInTheDocument();

    for (const [index, answerInput] of within(firstGroup)
      .getAllByLabelText("文字答案")
      .entries()) {
      fireEvent.change(answerInput, {
        target: { value: `题组一作答 ${index + 1}` },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "下一组" }));

    await waitFor(() =>
      expect(screen.getByText("第 2 / 2 组")).toBeInTheDocument(),
    );
    expect(screen.getByText("已保存").parentElement).toHaveTextContent("2 / 3");
    const secondGroup = screen.getByTestId(
      "mock-exam-question-group-question-group-grouped-2",
    );
    expect(within(secondGroup).getByText("题组二子题 A")).toBeInTheDocument();
    expect(within(secondGroup).getAllByText("材料二")).toHaveLength(1);
    expect(screen.queryByText("材料一正文")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "题号 1" }));

    await waitFor(() =>
      expect(screen.getByText("第 1 / 2 组")).toBeInTheDocument(),
    );
    expect(screen.getAllByLabelText("文字答案")[0]).toHaveValue("题组一作答 1");
    expect(screen.getAllByLabelText("文字答案")[1]).toHaveValue("题组一作答 2");
  });

  it("fails closed without reordering a noncontiguous mock_exam question_group", async () => {
    const createQuestion = (
      paperQuestionPublicId: string,
      stemRichText: string,
      questionGroupPublicId: string | null,
    ) => ({
      paperQuestionPublicId,
      questionPublicId: `question-${paperQuestionPublicId}`,
      questionType: "short_answer",
      paperSectionTitle: "技能模块",
      questionGroupPublicId,
      questionGroupTitle:
        questionGroupPublicId === null ? null : "非连续材料题组",
      stemRichText,
      questionOptions: [],
      score: "1.0",
    });
    const malformedMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-noncontiguous-group",
      subject: "skill" as const,
      questionCount: 3,
      paperSnapshot: {
        name: "非连续题组模考",
        paperSections: [
          {
            title: "技能模块",
            paperQuestions: [
              createQuestion(
                "paper-question-noncontiguous-first",
                "Group first",
                "question-group-noncontiguous",
              ),
              createQuestion(
                "paper-question-noncontiguous-standalone",
                "Standalone middle",
                null,
              ),
              createQuestion(
                "paper-question-noncontiguous-last",
                "Group last",
                "question-group-noncontiguous",
              ),
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentMockExamPage, {
        mockExamPublicId: malformedMockExam.publicId,
        mockExams: [
          {
            mockExam: malformedMockExam,
            examReportPublicId: "exam-report-noncontiguous-group",
          },
        ],
      }),
    );

    expect(screen.getByText("第 1 / 3 题")).toBeInTheDocument();
    expect(screen.getByText("Group first")).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "mock-exam-question-group-question-group-noncontiguous",
      ),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "下一题" }));
    await waitFor(() =>
      expect(screen.getByText("Standalone middle")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "下一题" }));
    await waitFor(() =>
      expect(screen.getByText("Group last")).toBeInTheDocument(),
    );
  });

  it("keeps every grouped child in the durable retry queue when autosave is offline", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const createQuestion = (paperQuestionPublicId: string, title: string) => ({
      paperQuestionPublicId,
      questionPublicId: `question-${paperQuestionPublicId}`,
      questionType: "short_answer",
      stemRichText: title,
      questionOptions: [],
      score: "1.0",
    });
    const groupedMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      publicId: "mock-exam-grouped-offline",
      paperPublicId: "paper-grouped-offline",
      subject: "skill" as const,
      questionCount: 3,
      paperSnapshot: {
        snapshotVersion: 2,
        name: "离线题组模考",
        paperSections: [
          {
            publicId: "paper-section-offline",
            title: "离线技能模块",
            sortOrder: 1,
            paperQuestions: [],
            questionGroups: [
              {
                publicId: "question-group-offline-1",
                title: "离线题组一",
                sortOrder: 1,
                totalScore: "2.0",
                materialSnapshot: {
                  materialPublicId: "material-offline-1",
                  title: "离线材料一",
                  contentRichText: "离线材料一正文",
                },
                paperQuestions: [
                  createQuestion("paper-question-offline-1-a", "离线子题 A"),
                  createQuestion("paper-question-offline-1-b", "离线子题 B"),
                ],
              },
              {
                publicId: "question-group-offline-2",
                title: "离线题组二",
                sortOrder: 2,
                totalScore: "1.0",
                materialSnapshot: {
                  materialPublicId: "material-offline-2",
                  title: "离线材料二",
                  contentRichText: "离线材料二正文",
                },
                paperQuestions: [
                  createQuestion("paper-question-offline-2-a", "离线子题 C"),
                ],
              },
            ],
          },
        ],
      },
    };
    let answerAttemptCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/mock-exams") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { mockExam: groupedMockExam, answerRecords: [] },
            }),
          };
        }

        if (String(url).endsWith("/answers")) {
          answerAttemptCount += 1;
          throw new Error("offline");
        }

        throw new Error(`unexpected request: ${String(url)}`);
      }),
    );

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: groupedMockExam.paperPublicId,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "离线题组模考" }),
    ).toBeInTheDocument();
    for (const [index, answerInput] of screen
      .getAllByLabelText("文字答案")
      .entries()) {
      fireEvent.change(answerInput, {
        target: { value: `离线作答 ${index + 1}` },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "下一组" }));

    await waitFor(() => expect(answerAttemptCount).toBe(2));
    expect(screen.getByTestId("mock-exam-answer-save-retry")).toHaveTextContent(
      "2 题待重新保存",
    );
    expect(screen.getByText("第 2 / 2 组")).toBeInTheDocument();
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
          authorizationSource: "org_auth",
          authorizationPublicId: "org-auth-public-001",
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
        authorizationSource: "org_auth",
        authorizationPublicId: "org-auth-public-001",
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
            operationId: expect.stringMatching(/^answer_operation_/u),
            expectedRevision: 0,
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
                  answerRevision: 1,
                  clientOperationId: "answer_operation_runtime_001",
                  clientSavedAt: "2026-05-23T00:00:00.000Z",
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
      "tiku.mockExam.cache.student-test-scope.paper-content-published-001",
    );

    expect(cachedMockExam).toBeNull();
  });

  it("recovers a runtime mock exam from local cache when the network load fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    localStorage.setItem(
      "tiku.mockExam.cache.student-test-scope.paper-content-published-001",
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
    ).toHaveTextContent(
      "网络暂不可用，已显示本机保存的考试内容。作答会先保存在本机，联网后请按提示重试保存。",
    );
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
            operationId: expect.stringMatching(/^answer_operation_/u),
            expectedRevision: 0,
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
                  answerRevision: 1,
                  clientOperationId: "answer_operation_runtime_retry_001",
                  clientSavedAt: "2026-05-23T00:00:00.000Z",
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
      "tiku.mockExam.answerQueue.student-test-scope.mock-exam-marketing-theory-001",
    );

    expect(queuedAnswer).toContain("paper-question-mock-marketing-001");
    expect(queuedAnswer).not.toContain("unit-test-session-token");

    window.dispatchEvent(new Event("online"));

    await waitFor(() =>
      expect(screen.queryByTestId("mock-exam-answer-save-retry")).toBeNull(),
    );
    expect(
      localStorage.getItem(
        "tiku.mockExam.answerQueue.student-test-scope.mock-exam-marketing-theory-001",
      ),
    ).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(saveAttemptCount).toBe(2);
  });

  it("supplements only server-missing answers when online recovery finds an auto-submitted exam", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const activeMockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    const completedMockExam = {
      ...activeMockExam,
      examStatus: "completed" as const,
      submittedAt: "2026-05-23T01:00:00.000Z",
    };
    let saveAttemptCount = 0;
    let supplementBody: unknown = null;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/v1/mock-exams") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { mockExam: activeMockExam },
            }),
          };
        }

        if (requestUrl.endsWith("/answers")) {
          saveAttemptCount += 1;

          if (saveAttemptCount === 1) {
            throw new Error("offline");
          }

          return {
            ok: false,
            status: 409,
            json: async () => ({
              code: 409311,
              message: "Mock exam is not in progress.",
              data: null,
            }),
          };
        }

        if (
          requestUrl === "/api/v1/mock-exams/mock-exam-marketing-theory-001"
        ) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { mockExam: completedMockExam },
            }),
          };
        }

        if (requestUrl.endsWith("/answers/supplement")) {
          supplementBody = JSON.parse(String(init?.body));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                mockExam: completedMockExam,
                supplementedCount: 1,
                skippedExistingCount: 0,
                examReportPublicId: "exam-report-marketing-theory-001",
                reportRevision: 2,
              },
            }),
          };
        }

        throw new Error(`unexpected request: ${requestUrl}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: /理论模考卷 A/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));
    expect(
      await screen.findByTestId("mock-exam-answer-save-retry"),
    ).toBeInTheDocument();

    window.dispatchEvent(new Event("online"));

    expect(
      await screen.findByText("考试已自动交卷，未保存的作答已补充提交"),
    ).toBeInTheDocument();
    expect(supplementBody).toEqual({
      answers: [
        expect.objectContaining({
          paperQuestionPublicId: "paper-question-mock-marketing-001",
          operationId: expect.stringMatching(/^answer_operation_/u),
          expectedRevision: 0,
        }),
      ],
    });
    expect(
      localStorage.getItem(
        "tiku.mockExam.answerQueue.student-test-scope.mock-exam-marketing-theory-001",
      ),
    ).toBeNull();
  });

  it("blocks submission until every locally queued answer has flushed", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const mockExam = {
      ...studentMockExamFixture.mockExams[0].mockExam,
      paperPublicId: "paper-content-published-001",
    };
    let answerAttemptCount = 0;
    let submitAttemptCount = 0;
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
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

      if (String(url).endsWith("/answers")) {
        answerAttemptCount += 1;
        throw new Error("offline");
      }

      if (String(url).endsWith("/submit")) {
        submitAttemptCount += 1;
      }

      throw new Error(`unexpected request: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentMockExamPage, {
        paperPublicId: "paper-content-published-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销理论模考卷 A" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "保存本题作答" }));
    expect(
      await screen.findByTestId("mock-exam-answer-save-retry"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "交卷" }));
    fireEvent.click(screen.getByRole("button", { name: "确认交卷" }));

    await waitFor(() => expect(answerAttemptCount).toBe(2));
    expect(submitAttemptCount).toBe(0);
    expect(screen.getByTestId("mock-exam-answer-save-retry")).toHaveTextContent(
      "1 题待重新保存",
    );
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
              operationId: expect.stringMatching(/^answer_operation_/u),
              expectedRevision: 0,
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
                    answerRevision: 1,
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
    expect(screen.getByText("86.0")).toBeInTheDocument();
    expect(screen.getByText("用时")).toBeInTheDocument();
    expect(screen.getByText("45 分")).toBeInTheDocument();
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
    expect(reportSurface).not.toHaveTextContent(
      "exam-report-marketing-theory-001",
    );
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
        questionGroupSummaryText: "材料题组：客户服务案例 2 题",
        knowledgeNodeSummaryText:
          "knowledge_node analytics: knowledge-node-case 1, knowledge-node-calculation 1",
        questionResults: [
          {
            paperQuestionPublicId: "paper-question-case-analysis-001",
            questionPublicId: "question-case-analysis-001",
            questionType: "case_analysis",
            paperSectionTitle: "案例模块",
            questionGroupPublicId: "question-group-case-001",
            questionGroupTitle: "客户服务案例",
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
            paperSectionTitle: "案例模块",
            questionGroupPublicId: "question-group-case-001",
            questionGroupTitle: "客户服务案例",
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
    expect(screen.getByText("材料题组：客户服务案例 2 题")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "客户服务案例" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("案例模块 · 题组小计 8.0 / 10.0"),
    ).toBeInTheDocument();
    expect(screen.queryByText("案例模块 · 客户服务案例")).toBeNull();
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

  it("keeps same-title groups separate and refuses to group incomplete identities", () => {
    const createResult = (overrides: Record<string, unknown>) => ({
      paperQuestionPublicId: "paper-question-group-boundary",
      questionPublicId: "question-group-boundary",
      questionType: "short_answer",
      title: "Group boundary result",
      isCorrect: null,
      score: "1.0",
      maxScore: "2.0",
      selectedAnswer: "selected",
      standardAnswer: "reference",
      mistakeBookPublicId: null,
      paperSectionTitle: "技能模块",
      ...overrides,
    });
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-group-identity-boundary",
      reportSnapshot: {
        totalScoreText: "总分 1.0",
        accuracyText: "得分率 20%",
        scoreSummaryText: "得分 1.0 / 5.0",
        questionResults: [
          createResult({
            paperQuestionPublicId: "paper-question-group-a",
            questionPublicId: "question-group-a",
            title: "Group A result",
            questionGroupPublicId: "question-group-a",
            questionGroupTitle: "同名题组",
          }),
          createResult({
            paperQuestionPublicId: "paper-question-group-b",
            questionPublicId: "question-group-b",
            title: "Group B result",
            score: null,
            maxScore: "3.0",
            questionGroupPublicId: "question-group-b",
            questionGroupTitle: "同名题组",
          }),
          createResult({
            paperQuestionPublicId: "paper-question-incomplete-group",
            questionPublicId: "question-incomplete-group",
            title: "Incomplete group identity result",
            questionGroupPublicId: null,
            questionGroupTitle: "不可信题组标题",
          }),
          createResult({
            paperQuestionPublicId: "paper-question-invalid-score",
            questionPublicId: "question-invalid-score",
            title: "Invalid score result",
            score: "0x1",
            maxScore: "3.0",
            questionGroupPublicId: "question-group-invalid-score",
            questionGroupTitle: "损坏分值题组",
          }),
        ],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-group-identity-boundary",
        examReports: [report],
      }),
    );

    expect(screen.getAllByRole("heading", { name: "同名题组" })).toHaveLength(
      2,
    );
    expect(
      screen.getByText("技能模块 · 题组小计 1.0 / 2.0"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("技能模块 · 题组小计 待评分 / 3.0"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "不可信题组标题" }),
    ).toBeNull();
    expect(
      screen.getByText("Incomplete group identity result"),
    ).toBeInTheDocument();
    expect(screen.getByText("技能模块 · 题组小计生成中")).toBeInTheDocument();
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

  it("fails closed instead of reordering a noncontiguous question_group", () => {
    const createResult = (
      paperQuestionPublicId: string,
      title: string,
      questionGroupPublicId: string | null,
    ) => ({
      paperQuestionPublicId,
      questionPublicId: `question-${paperQuestionPublicId}`,
      questionType: "short_answer",
      paperSectionTitle: "技能模块",
      questionGroupPublicId,
      questionGroupTitle: questionGroupPublicId === null ? null : "非连续题组",
      title,
      isCorrect: null,
      score: "1.0",
      maxScore: "1.0",
      selectedAnswer: "selected",
      standardAnswer: "reference",
      mistakeBookPublicId: null,
    });
    const report = {
      ...studentExamReportFixture.examReports[0],
      publicId: "exam-report-noncontiguous-group",
      reportSnapshot: {
        totalScoreText: "总分 3.0",
        accuracyText: "得分率 100%",
        scoreSummaryText: "得分 3.0 / 3.0",
        questionResults: [
          createResult("paper-question-group-first", "Group first", "group-a"),
          createResult("paper-question-standalone", "Standalone middle", null),
          createResult("paper-question-group-last", "Group last", "group-a"),
        ],
      },
    };

    render(
      createElement(StudentExamReportPage, {
        examReportPublicId: "exam-report-noncontiguous-group",
        examReports: [report],
      }),
    );

    expect(screen.queryByRole("heading", { name: "非连续题组" })).toBeNull();
    const reportText = document.body.textContent ?? "";
    expect(reportText.indexOf("Group first")).toBeLessThan(
      reportText.indexOf("Standalone middle"),
    );
    expect(reportText.indexOf("Standalone middle")).toBeLessThan(
      reportText.indexOf("Group last"),
    );
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
      screen.getByTestId("exam-scoring-progress-surface"),
    ).not.toHaveTextContent("exam-report-marketing-scoring-001");
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

    expect(await screen.findByText("86.0")).toBeInTheDocument();
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
    expect(await screen.findByText("86.0")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("StudentExamReportListPage", () => {
  it("never uses a mock exam public id as an exam report public id", () => {
    render(
      createElement(StudentExamReportListPage, {
        examReports: [
          {
            ...studentExamReportFixture.examReports[0],
            publicId: "mock-exam-scoring-list-001",
            examReportPublicId: null,
            mockExamPublicId: "mock-exam-scoring-list-001",
            examStatus: "scoring",
          },
        ],
      }),
    );

    expect(screen.getByRole("link", { name: "查看评分进度" })).toHaveAttribute(
      "href",
      "/mock-exam?mockExamPublicId=mock-exam-scoring-list-001",
    );
    expect(document.body.innerHTML).not.toContain(
      "examReportPublicId=mock-exam-scoring-list-001",
    );
  });

  it("shows total score and exact elapsed time without rounding away seconds", () => {
    render(
      createElement(StudentExamReportListPage, {
        examReports: [
          {
            ...studentExamReportFixture.examReports[0],
            durationSecond: 3661,
          },
        ],
      }),
    );

    expect(screen.getByText("总分：86.0")).toBeInTheDocument();
    expect(screen.getByText("用时：1 小时 1 分 1 秒")).toBeInTheDocument();
    expect(screen.queryByText("用时：61 分钟")).toBeNull();
  });

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

  it("resets an out-of-range report page before applying a server filter", async () => {
    const requestedUrls: string[] = [];
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const requestUrl = String(url);
      requestedUrls.push(requestUrl);
      const isFiltered = requestUrl.includes("status=completed");
      const isSecondPage = requestUrl.includes("page=2");

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
                publicId: isFiltered
                  ? "filtered-page-one"
                  : isSecondPage
                    ? "unfiltered-page-two"
                    : "unfiltered-page-one",
                paperName: isFiltered
                  ? "筛选后第一页"
                  : isSecondPage
                    ? "未筛选第二页"
                    : "未筛选第一页",
              },
            ],
          },
          pagination: {
            page: isFiltered ? 1 : isSecondPage ? 2 : 1,
            pageSize: 20,
            total: isFiltered ? 1 : 21,
            sortBy: "startedAt",
            sortOrder: "desc",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentExamReportListPage));

    expect(await screen.findByText("未筛选第一页")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(await screen.findByText("未筛选第二页")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("按状态筛选"), {
      target: { value: "completed" },
    });

    expect(await screen.findByText("筛选后第一页")).toBeInTheDocument();
    expect(requestedUrls.at(-1)).toContain("page=1");
    expect(requestedUrls.at(-1)).toContain("status=completed");
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
  });

  it("queries server-side search and status from page one", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const requestedUrls: string[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        requestedUrls.push(String(url));
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        const isFilteredRequest =
          String(url).includes("search=%E7%BB%88%E6%AD%A2") &&
          String(url).includes("status=terminated");

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: {
              examReports: isFilteredRequest
                ? [
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
                  ]
                : [studentExamReportFixture.examReports[0]],
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

    expect(screen.getByText("正在加载模拟考试记录")).toBeInTheDocument();
    expect(await screen.findByText("营销理论模考卷 A")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("按试卷名称搜索"), {
      target: { value: "终止" },
    });
    fireEvent.change(screen.getByLabelText("按状态筛选"), {
      target: { value: "terminated" },
    });

    expect(await screen.findByText("营销理论终止记录")).toBeInTheDocument();
    expect(screen.queryByText("营销理论模考卷 A")).toBeNull();
    expect(screen.getByText("总分：--")).toBeInTheDocument();
    expect(requestedUrls.at(-1)).toContain("page=1");
    expect(requestedUrls.at(-1)).toContain("search=%E7%BB%88%E6%AD%A2");
    expect(requestedUrls.at(-1)).toContain("status=terminated");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("ignores an older report response after rapid search switching", async () => {
    type ReportListResponse = {
      ok: boolean;
      status: number;
      json: () => Promise<unknown>;
    };
    let resolveSlowRequest:
      | ((response: ReportListResponse) => void)
      | undefined;
    const makeResponse = (paperName: string): ReportListResponse => ({
      ok: true,
      status: 200,
      json: async () => ({
        code: 0,
        message: "ok",
        data: {
          examReports: [
            {
              ...studentExamReportFixture.examReports[0],
              publicId: `report-${paperName}`,
              paperName,
            },
          ],
        },
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "startedAt",
          sortOrder: "desc",
        },
      }),
    });
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const requestUrl = String(url);

      if (requestUrl.includes("search=%E6%85%A2")) {
        return new Promise<ReportListResponse>((resolve) => {
          resolveSlowRequest = resolve;
        });
      }

      return requestUrl.includes("search=%E5%BF%AB")
        ? makeResponse("快速结果")
        : makeResponse("初始结果");
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentExamReportListPage));

    expect(await screen.findByText("初始结果")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("按试卷名称搜索"), {
      target: { value: "慢" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("search=%E6%85%A2"),
        ),
      ).toBe(true),
    );
    fireEvent.change(screen.getByLabelText("按试卷名称搜索"), {
      target: { value: "快" },
    });

    expect(await screen.findByText("快速结果")).toBeInTheDocument();
    resolveSlowRequest?.(makeResponse("过期慢结果"));
    await waitFor(() => expect(screen.queryByText("过期慢结果")).toBeNull());
    expect(screen.getByText("快速结果")).toBeInTheDocument();
  });
});
