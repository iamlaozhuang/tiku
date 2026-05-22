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
  it("renders unauthorized state without calling the protected mistake_book API when the session token is missing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentMistakeBookPage));

    expect(screen.getByText("请先登录")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).not.toHaveBeenCalled();
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
    expect(within(item).getByText("AI讲解暂不可用")).toBeDisabled();
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
