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
  StudentHomePage,
  studentHomeFixture,
} from "@/features/student/home/StudentHomePage";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
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
    expect(screen.getByRole("link", { name: "错题本" })).toHaveAttribute(
      "href",
      "/mistake-book",
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

  it("loads authorization scopes and papers through the student REST runtime without rendering the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const contentPublishedPaper = {
      ...studentHomeFixture.papers[1],
      publicId: "paper-content-published-001",
      name: "内容侧新发布理论卷",
      publishedAt: "2026-05-24T04:40:00.000Z",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/student-papers/scopes") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: [studentHomeFixture.scopes[1]],
            }),
          };
        }

        if (
          String(url) ===
          "/api/v1/student-papers?profession=marketing&level=3&page=1&pageSize=20"
        ) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: [
                contentPublishedPaper,
                ...studentHomeFixture.papers.filter(
                  (paper) => paper.profession === "marketing",
                ),
              ],
              pagination: {
                page: 1,
                pageSize: 20,
                total: 4,
                sortBy: "publishedAt",
                sortOrder: "desc",
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

    render(createElement(StudentHomePage));

    expect(screen.getByText("正在加载授权范围")).toBeInTheDocument();
    expect(await screen.findByText("内容侧新发布理论卷")).toBeInTheDocument();
    expect(await screen.findByText("营销理论冲刺卷 B")).toBeInTheDocument();
    const publishedPaperCard = screen.getByTestId(
      "paper-card-paper-content-published-001",
    );
    expect(
      within(publishedPaperCard).getByRole("link", { name: "练习" }),
    ).toHaveAttribute(
      "href",
      "/practice?paperPublicId=paper-content-published-001",
    );
    expect(
      within(publishedPaperCard).getByRole("link", { name: "模拟考试" }),
    ).toHaveAttribute(
      "href",
      "/mock-exam?paperPublicId=paper-content-published-001",
    );
    expect(screen.getByRole("button", { name: "营销 3级" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.body.textContent).not.toContain("unit-test-session-token");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
