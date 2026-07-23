import { createElement, type ComponentProps } from "react";
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
import type {
  EffectiveAuthorizationCapabilitiesDto,
  EffectiveAuthorizationContextDto,
} from "@/server/contracts/effective-authorization-contract";

const routerReplaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
  }),
}));

type StudentHomePagePropsWithAuthorizationContexts = ComponentProps<
  typeof StudentHomePage
> & {
  authorizationContexts?: EffectiveAuthorizationContextDto[];
};

type AuthorizationContextOverrides = Omit<
  Partial<EffectiveAuthorizationContextDto>,
  "capabilities"
> & {
  capabilities?: Partial<EffectiveAuthorizationCapabilitiesDto>;
};

const baseAuthorizationCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
} satisfies EffectiveAuthorizationCapabilitiesDto;

function createAuthorizationContext(
  overrides: AuthorizationContextOverrides = {},
): EffectiveAuthorizationContextDto {
  return {
    profession: "marketing",
    level: 3,
    contextDisplayStatus: "display_only",
    edition: "standard",
    effectiveEdition: "standard",
    upgradeStatus: "none",
    expiresAt: "2026-09-30T15:59:59Z",
    displayStatus: "active",
    authorizationSource: "personal_auth",
    authorizationPublicId: "authorization-context-ui-001",
    ownerType: "personal",
    ownerPublicId: "student-public-ui-001",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student-public-ui-001",
    blockedReason: null,
    ...overrides,
    capabilities: {
      ...baseAuthorizationCapabilities,
      ...(overrides.capabilities ?? {}),
    },
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("StudentHomePage", () => {
  it("shows the AI training entry for personal advanced learner capabilities", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            effectiveEdition: "advanced",
            edition: "advanced",
            authorizationSource: "personal_auth",
            authorizationPublicId: "personal-auth-advanced-ui-001",
            capabilities: {
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
            },
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    expect(screen.getByRole("link", { name: "AI训练" })).toHaveAttribute(
      "href",
      "/ai-generation?authorizationPublicId=personal-auth-advanced-ui-001",
    );
    expect(screen.queryByRole("link", { name: "企业训练" })).toBeNull();
    expect(screen.getByRole("link", { name: /查看权益/u })).toHaveAttribute(
      "href",
      "/profile?authorizationPublicId=personal-auth-advanced-ui-001",
    );
  });

  it("does not borrow an advanced AI entry from another selected scope", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            authorizationPublicId: "personal-auth-marketing-standard-ui-001",
          }),
          createAuthorizationContext({
            profession: "monopoly",
            authorizationPublicId: "personal-auth-monopoly-advanced-ui-001",
            edition: "advanced",
            effectiveEdition: "advanced",
            capabilities: {
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
            },
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    expect(screen.queryByRole("link", { name: "AI训练" })).toBeNull();
    expect(screen.getByTestId("student-home-context-band")).toHaveTextContent(
      "标准版",
    );
  });

  it("requires an explicit exact authorization selection when one scope has multiple contexts", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            authorizationPublicId: "personal-auth-marketing-standard-ui-001",
          }),
          createAuthorizationContext({
            authorizationPublicId: "personal-auth-marketing-advanced-ui-002",
            edition: "advanced",
            effectiveEdition: "advanced",
            expiresAt: "2027-01-31T15:59:59Z",
            capabilities: {
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
            },
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    expect(screen.getByTestId("student-home-context-band")).toHaveTextContent(
      "请选择具体授权",
    );
    expect(screen.queryByRole("link", { name: "AI训练" })).toBeNull();

    fireEvent.click(
      screen.getByRole("radio", {
        name: /个人授权 · 高级版 · 营销 3级/u,
      }),
    );

    expect(screen.getByRole("link", { name: "AI训练" })).toHaveAttribute(
      "href",
      "/ai-generation?authorizationPublicId=personal-auth-marketing-advanced-ui-002",
    );
  });

  it("shows AI and organization training entries for advanced organization employee capabilities", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            effectiveEdition: "advanced",
            edition: "advanced",
            authorizationSource: "org_auth",
            authorizationPublicId: "org-auth-advanced-ui-001",
            ownerType: "organization",
            ownerPublicId: "organization-public-ui-001",
            organizationPublicId: "organization-public-ui-001",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization-public-ui-001",
            capabilities: {
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
              canAnswerOrganizationTraining: true,
            },
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    expect(screen.getByRole("link", { name: "AI训练" })).toHaveAttribute(
      "href",
      "/ai-generation?authorizationPublicId=org-auth-advanced-ui-001",
    );
    expect(screen.getByRole("link", { name: "企业训练" })).toHaveAttribute(
      "href",
      "/organization-training?authorizationPublicId=org-auth-advanced-ui-001",
    );
  });

  it("shows a compact learner context band without exposing raw authorization identifiers", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            effectiveEdition: "advanced",
            edition: "advanced",
            authorizationSource: "org_auth",
            authorizationPublicId: "org-auth-context-band-ui-001",
            ownerType: "organization",
            ownerPublicId: "organization-context-band-ui-001",
            organizationPublicId: "organization-context-band-ui-001",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization-context-band-ui-001",
            capabilities: {
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
              canAnswerOrganizationTraining: true,
            },
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    const contextBand = screen.getByTestId("student-home-context-band");

    expect(contextBand).toHaveTextContent("当前学习上下文");
    expect(contextBand).toHaveTextContent("营销 3级");
    expect(contextBand).toHaveTextContent("组织授权");
    expect(contextBand).toHaveTextContent("高级版");
    expect(contextBand).toHaveTextContent("组织额度");
    expect(contextBand).not.toHaveTextContent("org-auth-context-band-ui-001");
    expect(contextBand).not.toHaveTextContent(
      "organization-context-band-ui-001",
    );
  });

  it("hides advanced learner home entries when authorization capabilities are absent", () => {
    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
        authorizationContexts: [
          createAuthorizationContext({
            effectiveEdition: "standard",
            edition: "standard",
            authorizationSource: "org_auth",
            authorizationPublicId: "org-auth-standard-ui-001",
            ownerType: "organization",
            ownerPublicId: "organization-public-ui-001",
            organizationPublicId: "organization-public-ui-001",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization-public-ui-001",
          }),
        ],
      } satisfies StudentHomePagePropsWithAuthorizationContexts),
    );

    expect(screen.queryByRole("link", { name: "AI训练" })).toBeNull();
    expect(screen.queryByRole("link", { name: "企业训练" })).toBeNull();
  });

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
    expect(screen.queryByRole("link", { name: "个人中心" })).toBeNull();
    expect(screen.queryByRole("link", { name: "错题本" })).toBeNull();
    expect(screen.getByRole("link", { name: "考试记录" })).toHaveAttribute(
      "href",
      "/exam-report",
    );
    expect(
      screen.getByText("先选择专业和等级，再选择试卷开始练习或模拟考试。"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/不是两套系统|本页最多展示/)).toBeNull();
    expect(screen.getByRole("heading", { name: "理论" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "技能" })).toBeInTheDocument();

    const theoryGroup = screen.getByTestId("subject-group-theory");
    const skillGroup = screen.getByTestId("subject-group-skill");

    expect(
      within(theoryGroup).getByText("营销理论冲刺卷 B"),
    ).toBeInTheDocument();
    expect(within(theoryGroup).getAllByText(/总分 100/)).not.toHaveLength(0);
    expect(
      within(theoryGroup).getByText("营销理论冲刺卷 A"),
    ).toBeInTheDocument();
    expect(within(skillGroup).getByText("营销技能案例卷")).toBeInTheDocument();
  });

  it("keeps the home guidance concise while preserving subject and paper counts", () => {
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
      screen.getByText("先选择专业和等级，再选择试卷开始练习或模拟考试。"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/不是两套系统|本页最多展示/)).toBeNull();

    const theoryGroup = screen.getByTestId("subject-group-theory");
    const theoryPaperCard = screen.getByTestId(
      "paper-card-paper-marketing-theory-002",
    );

    expect(within(theoryGroup).getByText("2 套试卷")).toBeInTheDocument();
    expect(within(theoryPaperCard).getByText("42 题")).toBeInTheDocument();
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

  it("persists the selected authorization scope and restores it on remount", () => {
    const { unmount } = render(
      createElement(StudentHomePage, {
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
      }),
    );

    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(localStorage.getItem("tiku.studentHome.selectedScope")).toContain(
      "marketing",
    );

    unmount();
    render(
      createElement(StudentHomePage, {
        scopes: studentHomeFixture.scopes,
        papers: studentHomeFixture.papers,
      }),
    );

    expect(screen.getAllByRole("button")[1]).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByTestId("paper-card-paper-marketing-theory-002"),
    ).toBeInTheDocument();
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
    expect(routerReplaceMock).toHaveBeenCalledWith("/redeem-code");
    expect(screen.getByText("暂无有效授权")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往兑换卡密" })).toHaveAttribute(
      "href",
      "/redeem-code",
    );
  });

  it("loads authorization scopes and papers through the cookie-backed student REST runtime", async () => {
    const contentPublishedPaper = {
      ...studentHomeFixture.papers[1],
      publicId: "paper-content-published-001",
      name: "内容侧新发布理论卷",
      publishedAt: "2026-05-24T04:40:00.000Z",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({ credentials: "same-origin" });
        expect(init).not.toHaveProperty("headers");

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

        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              code: 0,
              message: "ok",
              data: {
                authorizations: [],
                effectiveAuthorizations: [],
                authorizationContexts: [
                  createAuthorizationContext({
                    effectiveEdition: "advanced",
                    edition: "advanced",
                    authorizationSource: "org_auth",
                    authorizationPublicId: "org-auth-runtime-ui-001",
                    ownerType: "organization",
                    ownerPublicId: "organization-runtime-ui-001",
                    organizationPublicId: "organization-runtime-ui-001",
                    quotaOwnerType: "organization",
                    quotaOwnerPublicId: "organization-runtime-ui-001",
                    capabilities: {
                      canGenerateAiQuestion: true,
                      canGenerateAiPaper: true,
                      canAnswerOrganizationTraining: true,
                    },
                  }),
                ],
              },
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
      "/practice?paperPublicId=paper-content-published-001&authorizationSource=org_auth&authorizationPublicId=org-auth-runtime-ui-001",
    );
    expect(
      within(publishedPaperCard).getByRole("link", { name: "模拟考试" }),
    ).toHaveAttribute(
      "href",
      "/mock-exam?paperPublicId=paper-content-published-001&authorizationSource=org_auth&authorizationPublicId=org-auth-runtime-ui-001",
    );
    expect(screen.getByRole("button", { name: "营销 3级" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(await screen.findByRole("link", { name: "AI训练" })).toHaveAttribute(
      "href",
      "/ai-generation?authorizationPublicId=org-auth-runtime-ui-001",
    );
    expect(screen.getByRole("link", { name: "企业训练" })).toHaveAttribute(
      "href",
      "/organization-training?authorizationPublicId=org-auth-runtime-ui-001",
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("keeps student papers visible when authorization context loading fails closed", async () => {
    const runtimePaper = {
      ...studentHomeFixture.papers[1],
      publicId: "paper-runtime-without-auth-context-001",
      name: "授权上下文失败时仍展示试卷",
      publishedAt: "2026-05-25T04:40:00.000Z",
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({ credentials: "same-origin" });
        expect(init).not.toHaveProperty("headers");

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

        if (String(url) === "/api/v1/authorizations") {
          throw new Error("authorization contexts unavailable");
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
              data: [runtimePaper],
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

    expect(
      await screen.findByText("授权上下文失败时仍展示试卷"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "AI训练" })).toBeNull();
    expect(screen.queryByRole("link", { name: "企业训练" })).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("shows an authorization expiry reminder for scopes expiring within 15 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));

    render(
      createElement(StudentHomePage, {
        rememberedScope: {
          profession: "marketing",
          level: 3,
        },
        scopes: [
          {
            ...studentHomeFixture.scopes[0],
            expiresAt: "2026-06-12T12:00:00.000Z",
          },
          {
            ...studentHomeFixture.scopes[1],
            expiresAt: "2026-06-11T12:00:00.000Z",
          },
        ],
        papers: studentHomeFixture.papers,
      }),
    );

    const reminder = screen.getByTestId("auth-expiry-reminder");

    expect(reminder).toHaveTextContent("15");
    expect(reminder).toHaveTextContent("2026-06-11");
    expect(reminder).not.toHaveTextContent("2026-06-12");
  });

  it("suppresses a dismissed authorization expiry reminder only for the current local day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T09:00:00.000Z"));

    const expiringScopes = [
      {
        ...studentHomeFixture.scopes[1],
        expiresAt: "2026-06-01T12:00:00.000Z",
      },
    ];
    const renderProps = {
      rememberedScope: {
        profession: "marketing" as const,
        level: 3,
      },
      scopes: expiringScopes,
      papers: studentHomeFixture.papers,
    };
    const { rerender } = render(createElement(StudentHomePage, renderProps));

    expect(screen.getByTestId("auth-expiry-reminder")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dismiss-auth-expiry-reminder"));

    expect(screen.queryByTestId("auth-expiry-reminder")).toBeNull();

    rerender(createElement(StudentHomePage, renderProps));

    expect(screen.queryByTestId("auth-expiry-reminder")).toBeNull();

    vi.setSystemTime(new Date("2026-05-28T09:00:00.000Z"));
    rerender(createElement(StudentHomePage, renderProps));

    expect(screen.getByTestId("auth-expiry-reminder")).toBeInTheDocument();
  });

  it.each([
    { total: 21, expectedPages: 2 },
    { total: 40, expectedPages: 2 },
    { total: 41, expectedPages: 3 },
  ])(
    "makes every paper page reachable when total is $total",
    async ({ total, expectedPages }) => {
      const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/v1/student-papers/scopes") {
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

        if (requestUrl === "/api/v1/authorizations") {
          throw new Error("authorization contexts unavailable");
        }

        const requestPage = Number(
          new URL(requestUrl, "http://tiku.local").searchParams.get("page"),
        );

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: [
              {
                ...studentHomeFixture.papers[1],
                publicId: `paper-page-${requestPage}`,
                name: `第 ${requestPage} 页试卷`,
              },
            ],
            pagination: {
              page: requestPage,
              pageSize: 20,
              total,
              sortBy: "publishedAt",
              sortOrder: "desc",
            },
          }),
        };
      });
      vi.stubGlobal("fetch", fetchMock);

      render(createElement(StudentHomePage));

      expect(await screen.findByText("第 1 页试卷")).toBeInTheDocument();

      for (let page = 2; page <= expectedPages; page += 1) {
        fireEvent.click(screen.getByRole("button", { name: "下一页" }));
        expect(
          await screen.findByText(`第 ${page} 页试卷`),
        ).toBeInTheDocument();
      }

      expect(
        screen.getByText(`第 ${expectedPages} / ${expectedPages} 页`),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();
    },
  );

  it("resets paper pagination to page one when the authorization scope changes", async () => {
    const requestedUrls: string[] = [];
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const requestUrl = String(url);

      if (requestUrl === "/api/v1/student-papers/scopes") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            message: "ok",
            data: [studentHomeFixture.scopes[1], studentHomeFixture.scopes[0]],
          }),
        };
      }

      if (requestUrl === "/api/v1/authorizations") {
        throw new Error("authorization contexts unavailable");
      }

      requestedUrls.push(requestUrl);
      const request = new URL(requestUrl, "http://tiku.local");
      const requestPage = Number(request.searchParams.get("page"));
      const profession = request.searchParams.get("profession");

      return {
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: [
            {
              ...studentHomeFixture.papers[0],
              publicId: `paper-${profession}-${requestPage}`,
              name: `${profession} 第 ${requestPage} 页`,
              profession,
            },
          ],
          pagination: {
            page: requestPage,
            pageSize: 20,
            total: 21,
            sortBy: "publishedAt",
            sortOrder: "desc",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentHomePage));

    expect(await screen.findByText("marketing 第 1 页")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(await screen.findByText("marketing 第 2 页")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "专卖 3级" }));

    expect(await screen.findByText("monopoly 第 1 页")).toBeInTheDocument();
    expect(requestedUrls.at(-1)).toContain("profession=monopoly");
    expect(requestedUrls.at(-1)).toContain("page=1");
  });

  it("falls back to the last valid paper page after concurrent removal", async () => {
    const requestedPages: number[] = [];
    let collectionShrank = false;
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const requestUrl = String(url);

      if (requestUrl === "/api/v1/student-papers/scopes") {
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

      if (requestUrl === "/api/v1/authorizations") {
        throw new Error("authorization contexts unavailable");
      }

      const requestPage = Number(
        new URL(requestUrl, "http://tiku.local").searchParams.get("page"),
      );
      requestedPages.push(requestPage);
      const isStaleThirdPage = requestPage === 3;

      if (isStaleThirdPage) {
        collectionShrank = true;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: isStaleThirdPage
            ? []
            : [
                {
                  ...studentHomeFixture.papers[1],
                  publicId: `paper-page-${requestPage}`,
                  name: `第 ${requestPage} 页试卷`,
                },
              ],
          pagination: {
            page: requestPage,
            pageSize: 20,
            total: collectionShrank ? 40 : 41,
            sortBy: "publishedAt",
            sortOrder: "desc",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentHomePage));

    expect(await screen.findByText("第 1 页试卷")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(await screen.findByText("第 2 页试卷")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(await screen.findByText("第 2 页试卷")).toBeInTheDocument();
    expect(requestedPages).toEqual([1, 2, 3, 2]);
    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
  });
});
