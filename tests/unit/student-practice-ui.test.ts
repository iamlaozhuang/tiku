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
  StudentPracticePage,
  studentPracticeFixture,
} from "@/features/student/practice/StudentPracticePage";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
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

  it("renders runtime paper snapshots that keep section title and rich option content in normalized fields", () => {
    const runtimePractice = {
      ...studentPracticeFixture.practices[0].practice,
      publicId: "practice-runtime-snapshot",
      paperPublicId: "paper-runtime-snapshot",
      paperSnapshot: {
        name: "Runtime practice paper",
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
                standardAnswerRichText: "A",
                analysisRichText: "Runtime analysis",
                score: "1.0",
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-runtime-snapshot",
        practices: [
          {
            practice: runtimePractice,
            feedbackByPaperQuestionPublicId: {},
          },
        ],
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Runtime practice paper" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Runtime section")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "A. runtime option" }),
    ).toBeInTheDocument();
  });

  it("renders local seed paper snapshots that store objective choices as options", () => {
    const runtimePractice = {
      ...studentPracticeFixture.practices[0].practice,
      publicId: "practice-local-seed-snapshot",
      paperPublicId: "paper-local-seed-snapshot",
      paperSnapshot: {
        name: "Local seed practice paper",
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
                standardAnswerRichText: "A",
                analysisRichText: "Local seed analysis",
                score: "1.0",
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-local-seed-snapshot",
        practices: [
          {
            practice: runtimePractice,
            feedbackByPaperQuestionPublicId: {},
          },
        ],
      }),
    );

    expect(
      screen.getByRole("button", { name: "A. local seed option" }),
    ).toBeInTheDocument();
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

  it("renders subjective skill practice with material and pending AI hint state", () => {
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
    expect(screen.getByText("AI 提示生成中")).toBeInTheDocument();
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
    expect(screen.getByText("未找到练习")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("practice-empty-state")).getByRole("link", {
        name: "返回学员首页",
      }),
    ).toHaveAttribute("href", "/home");
  });

  it("distinguishes a missing runtime practice from a generic load failure", async () => {
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-missing",
      }),
    );

    expect(await screen.findByText("未找到练习")).toBeInTheDocument();
    expect(screen.queryByText("练习加载失败")).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("starts practice and submits answers through the session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = studentPracticeFixture.practices[0].practice;
    const feedback =
      studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-001"
      ];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/practices") {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toEqual({
            paperPublicId: "paper-marketing-theory-002",
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice,
                answerRecords: [],
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/practices/practice-marketing-theory-001/answers"
        ) {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toMatchObject({
            paperQuestionPublicId: "paper-question-marketing-001",
            selectedLabels: ["A"],
            textAnswer: null,
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { feedback },
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
      }),
    );

    expect(screen.getByText("正在加载练习进度")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "营销理论冲刺卷 B" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(await screen.findByText("回答错误")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("submits canonical multi_choice practice answers with multiple selected labels", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = {
      ...studentPracticeFixture.practices[0].practice,
      publicId: "practice-multi-choice-runtime",
      paperPublicId: "paper-multi-choice-runtime",
      paperSnapshot: {
        name: "Canonical multi choice practice",
        paperSections: [
          {
            title: "多选题",
            paperQuestions: [
              {
                paperQuestionPublicId: "paper-question-multi-choice-001",
                questionPublicId: "question-multi-choice-001",
                questionType: "multi_choice",
                stemRichText: "哪些动作属于客户需求分析？",
                questionOptions: [
                  { label: "A", contentRichText: "访谈客户" },
                  { label: "B", contentRichText: "复盘购买记录" },
                  { label: "C", contentRichText: "删除反馈记录" },
                ],
                standardAnswerRichText: "A、B",
                analysisRichText: "需要结合访谈与购买记录。",
                score: "3.0",
              },
            ],
          },
        ],
      },
    };
    const feedback = {
      ...studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-001"
      ],
      isCorrect: true,
      mistakeBookPublicId: null,
      score: "3.0",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/practices") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice,
                answerRecords: [],
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/practices/practice-multi-choice-runtime/answers"
        ) {
          expect(JSON.parse(String(init?.body))).toMatchObject({
            paperQuestionPublicId: "paper-question-multi-choice-001",
            selectedLabels: ["A", "B"],
            textAnswer: null,
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { feedback },
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-multi-choice-runtime",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Canonical multi choice practice",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. 访谈客户" }));
    fireEvent.click(screen.getByRole("button", { name: "B. 复盘购买记录" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(await screen.findByText("回答正确")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("submits canonical fill_blank practice answers as textAnswer", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = {
      ...studentPracticeFixture.practices[0].practice,
      publicId: "practice-fill-blank-runtime",
      paperPublicId: "paper-fill-blank-runtime",
      paperSnapshot: {
        name: "Canonical fill blank practice",
        paperSections: [
          {
            title: "填空题",
            paperQuestions: [
              {
                paperQuestionPublicId: "paper-question-fill-blank-001",
                questionPublicId: "question-fill-blank-001",
                questionType: "fill_blank",
                stemRichText: "客户需求分析应先识别客户____。",
                standardAnswerRichText: "真实购买动机",
                analysisRichText: "先识别真实购买动机。",
                score: "2.0",
              },
            ],
          },
        ],
      },
    };
    const feedback = {
      ...studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-001"
      ],
      isCorrect: true,
      mistakeBookPublicId: null,
      score: "2.0",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/practices") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice,
                answerRecords: [],
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/practices/practice-fill-blank-runtime/answers"
        ) {
          expect(JSON.parse(String(init?.body))).toMatchObject({
            paperQuestionPublicId: "paper-question-fill-blank-001",
            selectedLabels: [],
            textAnswer: "真实购买动机",
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { feedback },
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-fill-blank-runtime",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Canonical fill blank practice",
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("填空题答案"), {
      target: { value: "真实购买动机" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(await screen.findByText("回答正确")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each(["case_analysis", "calculation"] as const)(
    "submits %s practice snapshots as subjective text answers",
    async (questionType) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
      const practice = {
        ...studentPracticeFixture.practices[0].practice,
        publicId: `practice-${questionType}-runtime`,
        paperPublicId: `paper-${questionType}-runtime`,
        paperSnapshot: {
          name: `Synthetic ${questionType} practice`,
          paperSections: [
            {
              title: "Synthetic subjective paper_section",
              paperQuestions: [
                {
                  paperQuestionPublicId: `paper-question-${questionType}-001`,
                  questionPublicId: `question-${questionType}-001`,
                  questionType,
                  stemRichText: `Synthetic ${questionType} stem`,
                  standardAnswerRichText: `Synthetic ${questionType} reference`,
                  analysisRichText: `Synthetic ${questionType} analysis`,
                  score: "10.0",
                },
              ],
            },
          ],
        },
      };
      const feedback = {
        ...studentPracticeFixture.practices[1].feedbackByPaperQuestionPublicId[
          "paper-question-skill-001"
        ],
        aiHintStatus: "hinted" as const,
        aiHintText: "Synthetic hint",
        retryRemainingCount: 1,
      };
      const fetchMock = vi.fn(
        async (url: RequestInfo | URL, init?: RequestInit) => {
          if (String(url) === "/api/v1/practices") {
            return {
              ok: true,
              status: 200,
              json: async () => ({
                code: 0,
                message: "ok",
                data: {
                  practice,
                  answerRecords: [],
                },
              }),
            };
          }

          if (
            String(url) ===
            `/api/v1/practices/practice-${questionType}-runtime/answers`
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
                data: { feedback },
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
        createElement(StudentPracticePage, {
          paperPublicId: `paper-${questionType}-runtime`,
        }),
      );

      expect(
        await screen.findByRole("heading", {
          name: `Synthetic ${questionType} practice`,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Synthetic ${questionType} stem`),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("主观题答案"), {
        target: { value: `Synthetic ${questionType} answer` },
      });
      fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

      expect(await screen.findByText("主观题答案已保存")).toBeInTheDocument();
      expect(screen.getByText("Synthetic hint")).toBeInTheDocument();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    },
  );

  it("renders subjective AI hint feedback and allows one retry from the session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = studentPracticeFixture.practices[1].practice;
    const feedback = {
      ...studentPracticeFixture.practices[1].feedbackByPaperQuestionPublicId[
        "paper-question-skill-001"
      ],
      aiHintStatus: "hinted",
      aiHintText: "AI 提示：补充事实核对、沟通动作和后续跟进闭环。",
      aiHintImprovementDirections: ["事实核对", "后续跟进"],
      aiHintEvidenceStatus: "none",
      aiHintCitations: [],
      retryRemainingCount: 1,
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/practices") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice,
                answerRecords: [],
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/practices/practice-marketing-skill-001/answers"
        ) {
          expect(init?.method).toBe("POST");
          expect(JSON.parse(String(init?.body))).toMatchObject({
            paperQuestionPublicId: "paper-question-skill-001",
            selectedLabels: [],
          });

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: { feedback },
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-skill-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销技能案例卷" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("主观题答案"), {
      target: { value: "先确认延迟原因，再给出补偿和后续跟进计划。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(
      await screen.findByText(
        "AI 提示：补充事实核对、沟通动作和后续跟进闭环。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("证据状态：none")).toBeInTheDocument();
    expect(screen.queryByText("AI 提示：暂不可用")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "AI 提示并重答一次" }));

    expect(screen.queryByText("主观题答案已保存")).toBeNull();
    expect(screen.getByLabelText("主观题答案")).not.toBeDisabled();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("restarts an active practice through the session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const startedPractice = studentPracticeFixture.practices[0].practice;
    const restartedPractice = {
      ...startedPractice,
      publicId: "practice-marketing-theory-restarted",
      currentQuestionIndex: 0,
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/practices") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice: startedPractice,
                answerRecords: [],
              },
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/practices/practice-marketing-theory-001/restart"
        ) {
          expect(init?.method).toBe("POST");

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                practice: restartedPractice,
                answerRecords: [],
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
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
      }),
    );

    expect(
      await screen.findByText("practice-marketing-theory-001"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("practice-restart-button"));

    expect(
      await screen.findByText("practice-marketing-theory-restarted"),
    ).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
