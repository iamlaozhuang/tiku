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

import { StudentMistakeBookPage } from "@/features/student/mistake-book/StudentMistakeBookPage";

const mistakeBookPayload = {
  code: 0,
  message: "ok",
  data: {
    mistakeBooks: [
      {
        publicId: "mistake-book-public-001",
        questionPublicId: "question-public-001",
        paperQuestionPublicId: "paper-question-public-001",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionSnapshot: {
          questionType: "single_choice",
          stemRichText: "<p>卷烟市场监管重点是什么？</p>",
          standardAnswerRichText: "<p>A</p>",
          analysisRichText: "<p>应先判断监管对象，再匹配职责边界。</p>",
          rawAnswer: "do-not-render",
          code_hash: "do-not-render",
        },
        latestAnswerSnapshot: {
          selectedLabels: ["B"],
          textAnswer: "raw answer should not render",
          savedFromClientAt: "2026-05-21T05:10:00.000Z",
        },
        mistakeBookSource: "wrong_answer",
        mistakeBookStatus: "unmastered",
        wrongCount: 2,
        isFavorite: false,
        isRemoved: false,
        masteredAt: null,
        latestWrongAt: "2026-05-21T05:00:00.000Z",
        createdAt: "2026-05-21T05:00:00.000Z",
        updatedAt: "2026-05-21T05:00:00.000Z",
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "latestWrongAt",
    sortOrder: "desc",
  },
};

function createJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("StudentMistakeBookPage", () => {
  it("renders unauthorized state when the mistake_book API rejects the cookie-backed session", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/mistake-books?page=1&pageSize=20");
        expect(init).toEqual({ credentials: "same-origin" });

        return createJsonResponse(
          {
            code: 401001,
            message: "unauthorized",
            data: null,
          },
          401,
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    expect(await screen.findByText("请先登录")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books?page=1&pageSize=20",
      { credentials: "same-origin" },
    );
  });

  it("loads the mistake_book list through the cookie-backed student session when no local session value exists", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/mistake-books?page=1&pageSize=20");
        expect(init).toEqual({ credentials: "same-origin" });

        return createJsonResponse(mistakeBookPayload);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    expect(
      await screen.findByTestId("mistake-book-item-mistake-book-public-001"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books?page=1&pageSize=20",
      { credentials: "same-origin" },
    );
  });

  it("loads the current student's mistake_book list through the session runtime without rendering secrets or internal ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toBe("/api/v1/mistake-books?page=1&pageSize=20");

      return createJsonResponse(mistakeBookPayload);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    expect(screen.getByText("正在加载错题本")).toBeInTheDocument();
    expect(
      await screen.findByText("卷烟市场监管重点是什么？"),
    ).toBeInTheDocument();
    expect(screen.getByText("错题本")).toBeInTheDocument();
    expect(screen.getByText("共 1 题")).toBeInTheDocument();

    const item = screen.getByTestId(
      "mistake-book-item-mistake-book-public-001",
    );

    expect(item).toHaveAttribute("data-public-id", "mistake-book-public-001");
    expect(item).not.toHaveAttribute("data-id");
    expect(within(item).getByText("专卖 3级")).toBeInTheDocument();
    expect(within(item).getByText("理论")).toBeInTheDocument();
    expect(within(item).getByText("错 2 次")).toBeInTheDocument();
    expect(within(item).getByText("我的作答")).toBeInTheDocument();
    expect(within(item).getByText("B")).toBeInTheDocument();
    expect(within(item).getByText("标准答案")).toBeInTheDocument();
    expect(within(item).getByText("A")).toBeInTheDocument();
    expect(
      within(item).getByText("应先判断监管对象，再匹配职责边界。"),
    ).toBeInTheDocument();
    const aiExplanationButton = within(item).getByRole("button", {
      name: "AI讲解",
    });
    expect(aiExplanationButton).not.toBeDisabled();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain(
      "raw answer should not render",
    );
    expect(document.body.textContent).not.toContain("do-not-render");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books?page=1&pageSize=20",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-session-token" },
      }),
    );
  });

  it.each(["case_analysis", "calculation"] as const)(
    "safely renders %s mistake_book entries without objective filter expansion",
    async (questionType) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
      const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
        expect(String(url)).toBe("/api/v1/mistake-books?page=1&pageSize=20");

        return createJsonResponse({
          ...mistakeBookPayload,
          data: {
            mistakeBooks: [
              {
                ...mistakeBookPayload.data.mistakeBooks[0],
                publicId: `mistake-book-${questionType}-001`,
                questionSnapshot: {
                  ...mistakeBookPayload.data.mistakeBooks[0].questionSnapshot,
                  questionType,
                  stemRichText: `<p>Synthetic ${questionType} stem</p>`,
                  standardAnswerRichText: "<p>Synthetic reference</p>",
                },
                latestAnswerSnapshot: {
                  selectedLabels: [],
                  textAnswer: `Synthetic ${questionType} answer`,
                  savedFromClientAt: "2026-05-21T05:10:00.000Z",
                },
              },
            ],
          },
        });
      });
      vi.stubGlobal("fetch", fetchMock);

      render(createElement(StudentMistakeBookPage));

      const item = await screen.findByTestId(
        `mistake-book-item-mistake-book-${questionType}-001`,
      );

      expect(
        within(item).getByText(`Synthetic ${questionType} stem`),
      ).toBeInTheDocument();
      expect(
        within(item).getByText(`Synthetic ${questionType} answer`),
      ).toBeInTheDocument();
      expect(
        within(item).getByText(
          questionType === "case_analysis" ? "案例分析题" : "计算题",
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "案例分析题" })).toBeNull();
      expect(screen.queryByRole("option", { name: "计算题" })).toBeNull();
    },
  );

  it("renders mistake_book rich text safely without exposing literal markup or blocked script content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toBe("/api/v1/mistake-books?page=1&pageSize=20");

      return createJsonResponse({
        ...mistakeBookPayload,
        data: {
          mistakeBooks: [
            {
              ...mistakeBookPayload.data.mistakeBooks[0],
              publicId: "mistake-book-rich-text-001",
              questionSnapshot: {
                ...mistakeBookPayload.data.mistakeBooks[0].questionSnapshot,
                stemRichText:
                  "<p>监管 <strong>重点</strong></p><script>do-not-render</script>",
                standardAnswerRichText:
                  "<table><tbody><tr><td>许可</td><td>监管</td></tr></tbody></table>",
                analysisRichText:
                  "<p>先核验 <em>主体</em></p><script>do-not-render</script>",
              },
            },
          ],
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    const item = await screen.findByTestId(
      "mistake-book-item-mistake-book-rich-text-001",
    );

    expect(within(item).getAllByText("监管").length).toBeGreaterThanOrEqual(2);
    expect(within(item).getByText("重点")).toBeInTheDocument();
    expect(within(item).getByText("许可")).toBeInTheDocument();
    expect(within(item).getByText("先核验")).toBeInTheDocument();
    expect(within(item).getByText("主体")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("<table>");
    expect(document.body.textContent).not.toContain("<script>");
    expect(document.body.textContent).not.toContain("do-not-render");
  });

  it("requests and renders a redacted AI explanation for a mistake_book item", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/mistake-books?page=1&pageSize=20") {
          return createJsonResponse(mistakeBookPayload);
        }

        expect(init).toMatchObject({
          method: "POST",
          headers: { authorization: "Bearer unit-test-session-token" },
        });

        if (
          path ===
          "/api/v1/mistake-books/mistake-book-public-001/ai-explanation"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              aiExplanation: {
                explanationStatus: "explained",
                explanationText:
                  "AI 讲解：先核对题干关键词，再对照标准答案定位原因。",
                keyPoints: ["题干关键词", "标准答案定位"],
                learningSuggestion: "复习对应知识点并完成同类题。",
                insufficientEvidenceMessage: null,
                evidenceStatus: "sufficient",
                citations: [
                  {
                    chunkPublicId: "chunk-public-001",
                    resourcePublicId: "resource-public-001",
                    resourceTitle: "专卖管理教材",
                    headingPath: ["第三篇", "第一章"],
                    chunkIndex: 1,
                    chunkText: "引用片段不应完整渲染",
                    textHash: "chunk-hash-001",
                    score: 0.93,
                  },
                ],
                promptTemplateKey: "ai_explanation_v1",
                promptTemplateVersion: 1,
              },
            },
          });
        }

        return createJsonResponse({
          code: 404331,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    await screen.findByTestId("mistake-book-item-mistake-book-public-001");

    const aiExplanationButton = screen.getByRole("button", { name: /AI/ });
    expect(aiExplanationButton).not.toBeDisabled();

    fireEvent.click(aiExplanationButton);

    expect(await screen.findByText(/AI 讲解/)).toBeInTheDocument();
    expect(
      screen.getByText("复习对应知识点并完成同类题。"),
    ).toBeInTheDocument();
    expect(screen.getByText("专卖管理教材")).toBeInTheDocument();
    const item = screen.getByTestId(
      "mistake-book-item-mistake-book-public-001",
    );
    expect(item.textContent).toContain("第三篇 > 第一章");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain(
      "raw answer should not render",
    );
    expect(document.body.textContent).not.toContain("引用片段不应完整渲染");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books/mistake-book-public-001/ai-explanation",
      expect.objectContaining({
        method: "POST",
        headers: { authorization: "Bearer unit-test-session-token" },
      }),
    );
  });

  it("renders empty and API error states from the standard response envelope", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          ...mistakeBookPayload,
          data: { mistakeBooks: [] },
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            sortBy: "latestWrongAt",
            sortOrder: "desc",
          },
        }),
      ),
    );

    render(createElement(StudentMistakeBookPage));

    expect(await screen.findByText("暂无错题记录")).toBeInTheDocument();

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          code: 503331,
          message: "unavailable",
          data: null,
        }),
      ),
    );

    render(createElement(StudentMistakeBookPage));

    expect(await screen.findByText("错题本加载失败")).toBeInTheDocument();
  });

  it("reloads the list when question type, source, mastery status, and pagination controls change", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) =>
      createJsonResponse({
        ...mistakeBookPayload,
        data: { mistakeBooks: [] },
        pagination: {
          page: String(url).includes("page=2") ? 2 : 1,
          pageSize: 20,
          total: 42,
          sortBy: "latestWrongAt",
          sortOrder: "desc",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    expect(await screen.findByLabelText("题型")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "multi_choice" },
    });
    fireEvent.change(screen.getByLabelText("来源"), {
      target: { value: "favorite" },
    });
    fireEvent.change(screen.getByLabelText("掌握状态"), {
      target: { value: "mastered" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/mistake-books?page=1&pageSize=20&questionType=multi_choice&source=favorite&status=mastered",
        expect.any(Object),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/mistake-books?page=2&pageSize=20&questionType=multi_choice&source=favorite&status=mastered",
        expect.any(Object),
      ),
    );
  });

  it("keeps disabled source questions visible with review fields and AI entry", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          ...mistakeBookPayload,
          data: {
            mistakeBooks: [
              {
                ...mistakeBookPayload.data.mistakeBooks[0],
                questionSnapshot: {
                  ...mistakeBookPayload.data.mistakeBooks[0].questionSnapshot,
                  questionStatus: "disabled",
                },
              },
            ],
          },
        }),
      ),
    );

    render(createElement(StudentMistakeBookPage));

    const item = await screen.findByTestId(
      "mistake-book-item-mistake-book-public-001",
    );

    expect(within(item).getByText("该题目已停用")).toBeInTheDocument();
    expect(within(item).getByText("我的作答")).toBeInTheDocument();
    expect(
      within(item).getByRole("button", { name: "AI讲解" }),
    ).not.toBeDisabled();
  });

  it("keeps favorite and mastered actions scoped by publicId and bearer token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const updatedFavoritePayload = {
      code: 0,
      message: "ok",
      data: {
        mistakeBook: {
          ...mistakeBookPayload.data.mistakeBooks[0],
          isFavorite: true,
        },
      },
    };
    const updatedMasteredPayload = {
      code: 0,
      message: "ok",
      data: {
        mistakeBook: {
          ...mistakeBookPayload.data.mistakeBooks[0],
          isFavorite: true,
          mistakeBookStatus: "mastered",
          masteredAt: "2026-05-22T05:20:00.000Z",
        },
      },
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/mistake-books?page=1&pageSize=20") {
          return createJsonResponse(mistakeBookPayload);
        }

        expect(init).toMatchObject({
          method: "POST",
          headers: { authorization: "Bearer unit-test-session-token" },
        });

        if (path === "/api/v1/mistake-books/mistake-book-public-001/favorite") {
          return createJsonResponse(updatedFavoritePayload);
        }

        if (
          path === "/api/v1/mistake-books/mistake-book-public-001/mark-mastered"
        ) {
          return createJsonResponse(updatedMasteredPayload);
        }

        return createJsonResponse({
          code: 404331,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    await screen.findByText("卷烟市场监管重点是什么？");
    fireEvent.click(screen.getByRole("button", { name: "收藏" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取消收藏" }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "标记已掌握" }));

    await waitFor(() => expect(screen.getByText("已掌握")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books/mistake-book-public-001/favorite",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/mistake-books/mistake-book-public-001/mark-mastered",
      expect.any(Object),
    );
  });
});
