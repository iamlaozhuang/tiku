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
    expect(screen.getByText("练习模式")).toBeInTheDocument();
    expect(
      screen.queryByText("practice-marketing-theory-001"),
    ).not.toBeInTheDocument();

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

  it("renders safe rich text for practice stems, options, and feedback without exposing markup", () => {
    const runtimePractice = {
      ...studentPracticeFixture.practices[0].practice,
      publicId: "practice-rich-text-snapshot",
      paperPublicId: "paper-rich-text-snapshot",
      paperSnapshot: {
        name: "Rich text practice paper",
        paperSections: [
          {
            title: "Rich text section",
            paperQuestions: [
              {
                paperQuestionPublicId: "paper-question-rich-text-001",
                questionPublicId: "question-rich-text-001",
                questionType: "single_choice",
                stemRichText:
                  "<p>Runtime <strong>rich stem</strong></p><script>do-not-render</script>",
                questionOptions: [
                  {
                    label: "A",
                    contentRichText:
                      "<p><em>rich option</em></p><script>do-not-render</script>",
                  },
                ],
                standardAnswerRichText:
                  "<p>Correct <strong>answer</strong></p>",
                analysisRichText:
                  "<p>Teacher <em>analysis</em></p><script>do-not-render</script>",
                score: "1.0",
              },
            ],
          },
        ],
      },
    };

    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-rich-text-snapshot",
        practices: [
          {
            practice: runtimePractice,
            feedbackByPaperQuestionPublicId: {
              "paper-question-rich-text-001": {
                ...studentPracticeFixture.practices[0]
                  .feedbackByPaperQuestionPublicId[
                  "paper-question-marketing-002"
                ],
                answerRecordPublicId: "answer-rich-text-001",
                isCorrect: true,
                score: "1.0",
                maxScore: "1.0",
                standardAnswerRichText:
                  "<p>Correct <strong>answer</strong></p>",
                analysisRichText:
                  "<p>Teacher <em>analysis</em></p><script>do-not-render</script>",
                mistakeBookPublicId: null,
                aiExplanationStatus: null,
                aiHintStatus: null,
              },
            },
          },
        ],
      }),
    );

    expect(screen.getByText("Runtime")).toBeInTheDocument();
    expect(screen.getByText("rich stem")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "A. rich option" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. rich option" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("answer")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
    expect(screen.getByText("analysis")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("<p>");
    expect(document.body.textContent).not.toContain("<script>");
    expect(document.body.textContent).not.toContain("do-not-render");
  });

  it("renders objective ai_explanation feedback and manual trigger entry", () => {
    const wrongFeedback = {
      ...studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-001"
      ],
      aiExplanationStatus: "explained",
      aiExplanationText:
        "Local AI explanation: compare your answer with the standard answer and teacher analysis.",
      aiExplanationLearningSuggestion:
        "Review this knowledge point and retry a similar objective question.",
      aiExplanationEvidenceStatus: "none" as const,
    };
    const correctFeedback = {
      ...studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-002"
      ],
      aiExplanationStatus: "available",
      aiExplanationText: null,
    };

    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
        practices: [
          {
            practice: studentPracticeFixture.practices[0].practice,
            feedbackByPaperQuestionPublicId: {
              "paper-question-marketing-001": wrongFeedback,
              "paper-question-marketing-002": correctFeedback,
            },
          },
        ],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /B\./ }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText("AI explanation")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Local AI explanation: compare your answer with the standard answer and teacher analysis.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review this knowledge point and retry a similar objective question.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence status: none")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一题" }));
    fireEvent.click(screen.getByRole("button", { name: /A\./ }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(
      screen.getByRole("button", { name: "Need AI explanation" }),
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

  it("starts practice through the cookie-backed session when no local token is stored", async () => {
    const practice = studentPracticeFixture.practices[0].practice;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/practices");
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("same-origin");
        expect(new Headers(init?.headers).get("authorization")).toBeNull();
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
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(StudentPracticePage, {
        paperPublicId: "paper-marketing-theory-002",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "营销理论冲刺卷 B" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("授权已失效")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
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

  it("lets runtime learners favorite an answered objective question into mistake book", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = studentPracticeFixture.practices[0].practice;
    const feedback = {
      ...studentPracticeFixture.practices[0].feedbackByPaperQuestionPublicId[
        "paper-question-marketing-002"
      ],
      isCorrect: true,
      mistakeBookPublicId: null,
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
          "/api/v1/practices/practice-marketing-theory-001/answers"
        ) {
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

        if (
          String(url) ===
          "/api/v1/practices/practice-marketing-theory-001/favorite-question"
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
              data: {
                mistakeBookPublicId: "mistake-book-manual-favorite-001",
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
      await screen.findByRole("heading", { name: "营销理论冲刺卷 B" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A. 市场细分" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "收藏到错题本" }),
    );

    expect(
      await screen.findByText("已加入错题本：mistake-book-manual-favorite-001"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
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

  it("requests final scoring for subjective practice from the session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = studentPracticeFixture.practices[1].practice;
    const hintFeedback = {
      ...studentPracticeFixture.practices[1].feedbackByPaperQuestionPublicId[
        "paper-question-skill-001"
      ],
      score: null,
      aiHintStatus: "hinted",
      aiHintText: "Synthetic subjective hint",
      retryRemainingCount: 1,
    };
    const scoringFeedback = {
      ...hintFeedback,
      score: "10.0",
      aiHintStatus: null,
      aiHintText: null,
      aiHintImprovementDirections: [],
      retryRemainingCount: 0,
    };
    const answerBodies: unknown[] = [];
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
          const requestBody = JSON.parse(String(init?.body));
          answerBodies.push(requestBody);

          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                feedback:
                  requestBody.aiScoringTrigger === "manual_request"
                    ? scoringFeedback
                    : hintFeedback,
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
        paperPublicId: "paper-marketing-skill-001",
      }),
    );

    expect(
      await screen.findByTestId(
        "practice-surface-practice-marketing-skill-001",
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox"), {
      target: {
        value: "facts, legal basis, handling steps, and follow up.",
      },
    });
    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(
      await screen.findByText("Synthetic subjective hint"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button")[3]);

    expect(
      await screen.findByText("Final score: 10.0 / 10.0"),
    ).toBeInTheDocument();
    expect(answerBodies).toMatchObject([
      {
        paperQuestionPublicId: "paper-question-skill-001",
        textAnswer: "facts, legal basis, handling steps, and follow up.",
      },
      {
        paperQuestionPublicId: "paper-question-skill-001",
        textAnswer: "facts, legal basis, handling steps, and follow up.",
        aiScoringTrigger: "manual_request",
      },
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("prompts runtime learners to continue or restart saved practice progress", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const practice = {
      ...studentPracticeFixture.practices[0].practice,
      currentQuestionIndex: 1,
      lastAnsweredAt: "2026-05-19T08:20:00.000Z",
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
                answerRecords: [
                  {
                    publicId: "answer-practice-resume-001",
                    examMode: "practice",
                    paperQuestionPublicId: "paper-question-marketing-001",
                    questionPublicId: "question-marketing-001",
                    answerSnapshot: {
                      selectedLabels: ["B"],
                      textAnswer: null,
                      savedFromClientAt: "2026-05-19T08:20:00.000Z",
                    },
                    answerRecordStatus: "scored",
                    isCorrect: true,
                    score: "2.0",
                    maxScore: "2.0",
                    answeredAt: "2026-05-19T08:20:00.000Z",
                    submittedAt: "2026-05-19T08:20:00.000Z",
                  },
                ],
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

    const choicePanel = await screen.findByTestId("practice-resume-choice");

    expect(choicePanel).toHaveAttribute(
      "data-public-id",
      "practice-marketing-theory-001",
    );
    expect(choicePanel).not.toHaveAttribute("data-id");
    expect(
      screen.queryByTestId("practice-surface-practice-marketing-theory-001"),
    ).toBeNull();

    fireEvent.click(screen.getByTestId("practice-resume-continue-button"));

    expect(
      screen.getByTestId("practice-surface-practice-marketing-theory-001"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("practice-resume-choice")).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("restarts saved practice progress from the runtime resume choice", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const startedPractice = {
      ...studentPracticeFixture.practices[0].practice,
      currentQuestionIndex: 1,
      lastAnsweredAt: "2026-05-19T08:20:00.000Z",
    };
    const restartedPractice = {
      ...startedPractice,
      publicId: "practice-marketing-theory-restarted",
      currentQuestionIndex: 0,
      lastAnsweredAt: null,
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
                answerRecords: [
                  {
                    publicId: "answer-practice-resume-001",
                    examMode: "practice",
                    paperQuestionPublicId: "paper-question-marketing-001",
                    questionPublicId: "question-marketing-001",
                    answerSnapshot: {
                      selectedLabels: ["B"],
                      textAnswer: null,
                      savedFromClientAt: "2026-05-19T08:20:00.000Z",
                    },
                    answerRecordStatus: "scored",
                    isCorrect: true,
                    score: "2.0",
                    maxScore: "2.0",
                    answeredAt: "2026-05-19T08:20:00.000Z",
                    submittedAt: "2026-05-19T08:20:00.000Z",
                  },
                ],
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
      await screen.findByTestId("practice-resume-choice"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("practice-resume-restart-button"));

    await waitFor(() =>
      expect(
        screen.getByTestId(
          "practice-surface-practice-marketing-theory-restarted",
        ),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("practice-resume-choice")).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
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

    expect(await screen.findByText("练习模式")).toBeInTheDocument();
    expect(
      screen.queryByText("practice-marketing-theory-001"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("practice-restart-button"));

    await waitFor(() =>
      expect(
        screen.queryByText("practice-marketing-theory-restarted"),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
