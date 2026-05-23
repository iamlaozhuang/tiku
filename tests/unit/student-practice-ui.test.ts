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
});
