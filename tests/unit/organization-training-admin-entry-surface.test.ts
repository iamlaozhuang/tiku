import { readFileSync } from "node:fs";
import { join } from "node:path";
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

import AdminOrganizationTrainingRoutePage from "@/app/(admin)/organization/organization-training/page";
import { AdminOrganizationTrainingPage } from "@/features/admin/organization-training/AdminOrganizationTrainingPage";

const contentOrganizationTrainingPagePath =
  "src/app/(admin)/content/organization-training/page.tsx";

function readSourceFile(sourcePath: string) {
  return readFileSync(join(process.cwd(), sourcePath), "utf8");
}

function getRequestPath(url: RequestInfo | URL): string {
  return new URL(String(url), "http://localhost").pathname;
}

function getRequestSearchParams(url: RequestInfo | URL): URLSearchParams {
  return new URL(String(url), "http://localhost").searchParams;
}

function isOrganizationTrainingListGet(
  url: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  return (
    getRequestPath(url) === "/api/v1/organization-trainings" &&
    (init?.method ?? "GET") === "GET"
  );
}

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-training",
      phone: "13900000002",
      name: "组织高级管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-admin-scope-001",
      adminPublicId: "admin-organization-public-001",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationAuthorizationPublicId: "org-auth-admin-scope-001",
        organizationPublicId: "organization-admin-scope-001",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: true,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const standardAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-training-standard",
      phone: "13900000005",
      name: "组织标准管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-admin-scope-001",
      adminPublicId: "admin-organization-standard-public-001",
      adminRoles: ["org_standard_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_standard_admin"],
        organizationPublicId: "organization-admin-scope-001",
        organizationEffectiveEdition: "standard",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const createdDraft = {
  publicId: "organization-training-draft-ui-001",
  sourceTaskPublicId: null,
  organizationPublicId: "organization-admin-scope-001",
  authorizationSource: "org_auth",
  authorizationPublicId: "org-auth-admin-scope-001",
  profession: "marketing",
  level: 3,
  subject: "theory",
  title: "门店服务训练",
  description: "仅保存元数据",
  questionCount: 0,
  totalScore: 0,
  questionTypeSummary: {
    singleChoice: 0,
    multiChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
  },
  evidenceStatus: "none",
  validationStatus: "pending",
  retentionStatus: "active",
  createdAt: "2026-06-18T08:00:00.000Z",
  expiresAt: null,
  id: 9301,
};

const persistedAiDraft = {
  ...createdDraft,
  publicId: "organization-training-draft-ai-ui-001",
  sourceTaskPublicId: "admin-ai-generation-task-organization-ui-001",
  title: "AI 生成训练草稿",
  description: "AI 结果复制草稿",
  questionCount: 1,
  totalScore: 5,
  questionTypeSummary: {
    singleChoice: 1,
    multiChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
  },
  evidenceStatus: "sufficient",
  validationStatus: "needs_review",
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function readJsonRequestBody(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
  method: string,
) {
  const matchedCall = fetchMock.mock.calls.find(
    ([requestUrl, requestInit]) =>
      String(requestUrl) === path && requestInit?.method === method,
  );

  expect(matchedCall).toBeDefined();

  const requestBody = matchedCall?.[1]?.body;

  expect(typeof requestBody).toBe("string");

  return JSON.parse(String(requestBody)) as Record<string, unknown>;
}

function openCreateWizard() {
  fireEvent.click(screen.getByRole("button", { name: "新建企业训练" }));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminOrganizationTrainingPage", () => {
  it("is wired as the organization training route page", () => {
    expect(AdminOrganizationTrainingRoutePage()).toEqual(
      createElement(AdminOrganizationTrainingPage),
    );
  });

  it("redirects the content workspace organization training route back to the organization workspace", () => {
    const contentRouteSource = readSourceFile(
      contentOrganizationTrainingPagePath,
    );

    expect(contentRouteSource).toContain(
      'redirect("/organization/organization-training")',
    );
    expect(contentRouteSource).not.toContain("AdminOrganizationTrainingPage");
  });

  it("renders unauthorized state without calling organization training writes when session is missing", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse({
          code: 401001,
          message: "Admin session is required.",
          data: null,
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("shows a Chinese unavailable state for standard organization admins", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(standardAdminSessionPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const unavailableState = await screen.findByRole("alert");
    expect(unavailableState).toHaveAttribute(
      "data-admin-ux-state",
      "standard-unavailable",
    );
    expect(unavailableState).toHaveTextContent("标准版暂不可用");
    expect(unavailableState).toHaveTextContent(
      "标准版组织后台暂不开放企业训练",
    );
    expect(unavailableState).toHaveTextContent(
      "升级需由运营管理员维护高级版企业授权",
    );
    expect(unavailableState).not.toHaveTextContent("org_auth");
    expect(screen.getByRole("link", { name: "返回组织概览" })).toHaveAttribute(
      "href",
      "/organization/portal",
    );
    expect(screen.queryByRole("form", { name: "企业训练配置表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("filters organization training lifecycle rows and exposes read-only published actions", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationTrainingListGet(url)) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            items: [
              {
                publicId: "organization-training-draft-list-ui-001",
                resourceType: "organization_training_draft",
                organizationPublicId: "organization-admin-scope-001",
                authorizationPublicId: "org-auth-admin-scope-001",
                profession: "marketing",
                level: 3,
                subject: "theory",
                title: "列表草稿",
                description: "待发布训练",
                questionCount: 1,
                totalScore: 5,
                questionTypeSummary: {
                  singleChoice: 1,
                  multiChoice: 0,
                  trueFalse: 0,
                  shortAnswer: 0,
                },
                status: "draft",
                availableActions: ["publish"],
              },
              {
                publicId: "organization-training-version-published-ui-001",
                resourceType: "organization_training_version",
                organizationPublicId: "organization-admin-scope-001",
                profession: "marketing",
                level: 3,
                subject: "theory",
                title: "已发布训练",
                description: "员工可见训练",
                questionCount: 2,
                totalScore: 10,
                status: "published",
                availableActions: ["take_down", "copy_to_new_draft"],
              },
              {
                publicId: "organization-training-version-taken-down-ui-001",
                resourceType: "organization_training_version",
                organizationPublicId: "organization-admin-scope-001",
                profession: "marketing",
                level: 3,
                subject: "theory",
                title: "已下架训练",
                description: "历史训练",
                questionCount: 3,
                totalScore: 15,
                status: "taken_down",
                availableActions: ["copy_to_new_draft"],
              },
            ],
            redactionStatus: "metadata_only",
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const filterGroup = await screen.findByRole("group", {
      name: "企业训练状态筛选",
    });
    expect(
      within(filterGroup).getByRole("button", { name: "全部" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(filterGroup).getByRole("button", { name: "草稿" }),
    ).toBeInTheDocument();
    expect(
      within(filterGroup).getByRole("button", { name: "已发布" }),
    ).toBeInTheDocument();
    expect(
      within(filterGroup).getByRole("button", { name: "已下架" }),
    ).toBeInTheDocument();

    const draftCard = await screen.findByTestId(
      "organization-training-lifecycle-organization-training-draft-list-ui-001",
    );
    expect(
      within(draftCard).getByRole("button", { name: "继续配置" }),
    ).toBeInTheDocument();
    expect(
      within(draftCard).getByRole("button", { name: "发布" }),
    ).toBeInTheDocument();
    expect(
      within(draftCard).queryByRole("button", { name: "复制为新草稿" }),
    ).toBeNull();
    expect(
      within(draftCard).queryByRole("button", { name: "下架" }),
    ).toBeNull();
    expect(
      within(draftCard).queryByRole("button", { name: "查看" }),
    ).toBeNull();

    const publishedCard = await screen.findByTestId(
      "organization-training-lifecycle-organization-training-version-published-ui-001",
    );
    expect(
      within(publishedCard).getByRole("button", { name: "查看" }),
    ).toBeInTheDocument();
    expect(
      within(publishedCard).getByRole("button", { name: "复制为新草稿" }),
    ).toBeInTheDocument();
    expect(
      within(publishedCard).getByRole("button", { name: "下架" }),
    ).toBeInTheDocument();
    expect(
      within(publishedCard).queryByRole("button", { name: "发布" }),
    ).toBeNull();

    fireEvent.click(
      within(publishedCard).getByRole("button", { name: "查看" }),
    );
    const detailPanel = screen.getByRole("complementary", {
      name: "训练详情",
    });
    expect(detailPanel).toHaveTextContent("已发布版本为只读");
    expect(detailPanel).toHaveTextContent("复制为新草稿");
    expect(detailPanel.textContent).not.toContain(
      "organization-training-version-published-ui-001",
    );

    fireEvent.click(within(filterGroup).getByRole("button", { name: "草稿" }));
    expect(await screen.findByText("列表草稿")).toBeInTheDocument();
    expect(screen.queryByText("已发布训练")).toBeNull();
    expect(screen.queryByText("已下架训练")).toBeNull();

    fireEvent.click(
      within(filterGroup).getByRole("button", { name: "已发布" }),
    );
    expect(await screen.findByText("已发布训练")).toBeInTheDocument();
    expect(screen.queryByText("列表草稿")).toBeNull();
    expect(screen.queryByText("已下架训练")).toBeNull();

    fireEvent.click(
      within(filterGroup).getByRole("button", { name: "已下架" }),
    );
    expect(await screen.findByText("已下架训练")).toBeInTheDocument();
    expect(screen.queryByText("列表草稿")).toBeNull();
    expect(screen.queryByText("已发布训练")).toBeNull();
  });

  it("shows organization training source and content-kind filters backed by lifecycle query parameters", async () => {
    const lifecycleItems = [
      {
        publicId: "organization-training-draft-ai-question-ui-001",
        resourceType: "organization_training_draft",
        organizationPublicId: "organization-admin-scope-001",
        authorizationPublicId: "org-auth-admin-scope-001",
        profession: "marketing",
        level: 3,
        subject: "theory",
        title: "AI出题草稿",
        description: "题目训练草稿",
        questionCount: 2,
        totalScore: 10,
        questionTypeSummary: {
          singleChoice: 2,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 0,
        },
        status: "draft",
        sourceKind: "ai_question",
        contentKind: "question_training",
        availableActions: ["publish"],
      },
      {
        publicId: "organization-training-draft-ai-paper-ui-001",
        resourceType: "organization_training_draft",
        organizationPublicId: "organization-admin-scope-001",
        authorizationPublicId: "org-auth-admin-scope-001",
        profession: "marketing",
        level: 3,
        subject: "theory",
        title: "AI组卷草稿",
        description: "试卷训练草稿",
        questionCount: 5,
        totalScore: 25,
        questionTypeSummary: {
          singleChoice: 5,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 0,
        },
        status: "draft",
        sourceKind: "ai_paper",
        contentKind: "paper_training",
        availableActions: ["publish"],
      },
    ];
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationTrainingListGet(url)) {
        const searchParams = getRequestSearchParams(url);
        const sourceKind = searchParams.get("sourceKind") ?? "all";
        const contentKind = searchParams.get("contentKind") ?? "all";
        const filteredItems = lifecycleItems.filter(
          (item) =>
            (sourceKind === "all" || item.sourceKind === sourceKind) &&
            (contentKind === "all" || item.contentKind === contentKind),
        );

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            items: filteredItems,
            redactionStatus: "metadata_only",
          },
          pagination: {
            page: Number.parseInt(searchParams.get("page") ?? "1", 10),
            pageSize: 10,
            total: filteredItems.length,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const sourceFilterGroup = await screen.findByRole("group", {
      name: "企业训练来源筛选",
    });
    const contentFilterGroup = await screen.findByRole("group", {
      name: "企业训练形态筛选",
    });
    expect(
      within(sourceFilterGroup).getByRole("button", { name: "AI出题" }),
    ).toBeInTheDocument();
    expect(
      within(sourceFilterGroup).getByRole("button", { name: "AI组卷" }),
    ).toBeInTheDocument();
    expect(
      within(contentFilterGroup).getByRole("button", { name: "题目训练" }),
    ).toBeInTheDocument();
    expect(
      within(contentFilterGroup).getByRole("button", { name: "试卷训练" }),
    ).toBeInTheDocument();
    expect(screen.getByText("AI出题草稿")).toBeInTheDocument();
    expect(screen.getByText("AI组卷草稿")).toBeInTheDocument();

    fireEvent.click(
      within(sourceFilterGroup).getByRole("button", { name: "AI组卷" }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url]) =>
            getRequestPath(url) === "/api/v1/organization-trainings" &&
            getRequestSearchParams(url).get("sourceKind") === "ai_paper",
        ),
      ).toBe(true),
    );
    expect(screen.getByText("AI组卷草稿")).toBeInTheDocument();
    expect(screen.queryByText("AI出题草稿")).toBeNull();

    fireEvent.click(
      within(sourceFilterGroup).getByRole("button", { name: "全部来源" }),
    );
    fireEvent.click(
      within(contentFilterGroup).getByRole("button", { name: "试卷训练" }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url]) =>
            getRequestPath(url) === "/api/v1/organization-trainings" &&
            getRequestSearchParams(url).get("contentKind") === "paper_training",
        ),
      ).toBe(true),
    );
    expect(screen.getByText("AI组卷草稿")).toBeInTheDocument();
    expect(screen.queryByText("AI出题草稿")).toBeNull();
  });

  it("paginates organization training lifecycle rows near the active filter", async () => {
    const lifecycleItems = Array.from({ length: 12 }, (_, index) => ({
      publicId: `organization-training-draft-page-ui-${index + 1}`,
      resourceType: "organization_training_draft",
      organizationPublicId: "organization-admin-scope-001",
      authorizationPublicId: "org-auth-admin-scope-001",
      profession: "marketing",
      level: 3,
      subject: "theory",
      title: `分页训练 ${String(index + 1).padStart(2, "0")}`,
      description: "分页训练",
      questionCount: 1,
      totalScore: 5,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 0,
      },
      status: "draft",
      availableActions: ["publish"],
    }));
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationTrainingListGet(url)) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            items: lifecycleItems,
            redactionStatus: "metadata_only",
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(await screen.findByText("分页训练 01")).toBeInTheDocument();
    expect(screen.getByText("共 12 条")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 2 页")).toBeInTheDocument();
    expect(screen.queryByText("分页训练 11")).toBeNull();

    fireEvent.click(screen.getAllByRole("button", { name: "继续配置" })[0]);

    expect(
      screen.getByRole("complementary", { name: "训练详情" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(await screen.findByText("分页训练 11")).toBeInTheDocument();
    expect(screen.queryByText("分页训练 01")).toBeNull();
    expect(
      screen.queryByRole("complementary", { name: "训练详情" }),
    ).toBeNull();
    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "上一页" }));

    expect(await screen.findByText("分页训练 01")).toBeInTheDocument();
    expect(screen.queryByText("分页训练 11")).toBeNull();
    expect(screen.getByRole("button", { name: "上一页" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "已发布" }));

    expect(
      await screen.findByText("当前筛选下暂无企业训练"),
    ).toBeInTheDocument();
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
  });

  it("keeps the create wizard behind an explicit entry and splits create intent before matching source choices", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationTrainingListGet(url)) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            items: [],
            redactionStatus: "metadata_only",
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "企业训练配置表单" })).toBeNull();

    openCreateWizard();

    expect(
      screen.getByRole("form", { name: "企业训练配置表单" }),
    ).toBeInTheDocument();
    const intentGroup = screen.getByRole("radiogroup", { name: "业务意图" });
    expect(
      within(intentGroup).getByRole("radio", { name: "新建试卷训练" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      within(intentGroup).getByRole("radio", { name: "新建题目训练" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("radio", { name: "企业 AI 结果" })).toBeNull();

    let sourceGroup = screen.getByRole("radiogroup", {
      name: "企业训练来源",
    });
    expect(
      within(sourceGroup).getByRole("radio", { name: "AI组卷结果" }),
    ).toBeInTheDocument();
    expect(
      within(sourceGroup).getByRole("radio", { name: "平台试卷快照" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      within(sourceGroup).queryByRole("radio", { name: "AI出题结果" }),
    ).toBeNull();
    expect(
      within(sourceGroup).queryByRole("radio", { name: "手动题组" }),
    ).toBeNull();
    expect(screen.queryByLabelText("试卷快照")).toBeNull();
    expect(
      screen.getByText(/模拟考试不是企业训练来源入口/u),
    ).toBeInTheDocument();

    fireEvent.click(
      within(intentGroup).getByRole("radio", { name: "新建题目训练" }),
    );
    sourceGroup = screen.getByRole("radiogroup", {
      name: "企业训练来源",
    });
    expect(
      within(intentGroup).getByRole("radio", { name: "新建题目训练" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      within(sourceGroup).getByRole("radio", { name: "AI出题结果" }),
    ).toBeInTheDocument();
    expect(
      within(sourceGroup).getByRole("radio", { name: "手动题组" }),
    ).toBeInTheDocument();
    expect(
      within(sourceGroup).queryByRole("radio", { name: "AI组卷结果" }),
    ).toBeNull();
    expect(
      within(sourceGroup).queryByRole("radio", { name: "平台试卷快照" }),
    ).toBeNull();
    expect(screen.getByRole("link", { name: "前往 AI出题" })).toHaveAttribute(
      "href",
      "/organization/ai-question-generation",
    );
    expect(
      screen.getByText(/题目还未发布，员工暂时看不到/u),
    ).toBeInTheDocument();

    fireEvent.click(
      within(intentGroup).getByRole("radio", { name: "新建试卷训练" }),
    );
    sourceGroup = screen.getByRole("radiogroup", {
      name: "企业训练来源",
    });
    expect(
      within(intentGroup).getByRole("radio", { name: "新建试卷训练" }),
    ).toHaveAttribute("aria-checked", "true");
    fireEvent.click(
      within(sourceGroup).getByRole("radio", { name: "AI组卷结果" }),
    );
    expect(screen.getByRole("link", { name: "前往 AI组卷" })).toHaveAttribute(
      "href",
      "/organization/ai-paper-generation",
    );
    expect(screen.getByText(/本地选题后进入企业训练草稿/u)).toBeInTheDocument();
  });

  it("takes down and copies published training versions from list actions through existing metadata-only routes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("内容已过期");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (isOrganizationTrainingListGet(url, init)) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              items: [
                {
                  publicId: "organization-training-version-published-ui-002",
                  resourceType: "organization_training_version",
                  organizationPublicId: "organization-admin-scope-001",
                  profession: "marketing",
                  level: 3,
                  subject: "theory",
                  title: "发布训练",
                  description: "可复训训练",
                  questionCount: 2,
                  totalScore: 10,
                  status: "published",
                  availableActions: ["take_down", "copy_to_new_draft"],
                },
              ],
              redactionStatus: "metadata_only",
            },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-published-ui-002/copy-to-new-draft" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              draft: {
                ...createdDraft,
                publicId: "organization-training-draft-copy-ui-002",
                title: "发布训练 复训草稿",
                questionCount: 2,
                totalScore: 10,
              },
            },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-published-ui-002/take-down" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              version: {
                publicId: "organization-training-version-published-ui-002",
                draftPublicId: "organization-training-draft-list-ui-002",
                versionNumber: 1,
                organizationPublicId: "organization-admin-scope-001",
                publishScopeSnapshot: {
                  organizationPublicIds: ["organization-admin-scope-001"],
                  capturedAt: "2026-07-06T06:20:00.000Z",
                },
                profession: "marketing",
                level: 3,
                subject: "theory",
                title: "发布训练",
                description: "可复训训练",
                questionCount: 2,
                totalScore: 10,
                status: "taken_down",
                publishedAt: "2026-07-06T06:20:00.000Z",
                takenDownAt: "2026-07-06T07:20:00.000Z",
                takedownReason: "内容已过期",
              },
            },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const publishedCard = await screen.findByTestId(
      "organization-training-lifecycle-organization-training-version-published-ui-002",
    );
    fireEvent.click(
      within(publishedCard).getByRole("button", { name: "复制为新草稿" }),
    );

    expect(
      await screen.findByText("已复制为新的企业训练草稿"),
    ).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-published-ui-002/copy-to-new-draft",
        "POST",
      ),
    ).toMatchObject({
      sourceVersionPublicId: "organization-training-version-published-ui-002",
      authorizationPublicId: "org-auth-admin-scope-001",
      newDraftTitle: "发布训练 复训草稿",
    });

    fireEvent.click(
      within(publishedCard).getByRole("button", { name: "下架" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业训练已下架",
    );
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-published-ui-002/take-down",
        "POST",
      ),
    ).toMatchObject({
      versionPublicId: "organization-training-version-published-ui-002",
      takedownReason: "内容已过期",
    });
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("creates a draft without exposing manual source identifiers and copies a version through metadata-only API calls", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (isOrganizationTrainingListGet(url, init)) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              items: [],
              redactionStatus: "metadata_only",
            },
          });
        }

        if (path === "/api/v1/organization-trainings" && method === "POST") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { draft: createdDraft },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-draft-ui-001/source-contexts" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              context: {
                draftPublicId: "organization-training-draft-ui-001",
                organizationPublicId: "organization-admin-scope-001",
                sourceContexts: [
                  {
                    sourceType: "paper",
                    sourcePublicId: "paper-source-ui-001",
                    title: "服务训练来源试卷",
                    profession: "marketing",
                    level: 3,
                    subject: "theory",
                    questionCount: 5,
                    totalScore: 10,
                    sourceStatus: "published",
                    redactionStatus: "metadata_only",
                  },
                ],
                redactionStatus: "metadata_only",
              },
            },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-ui-001/copy-to-new-draft" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              draft: {
                ...createdDraft,
                publicId: "organization-training-draft-copy-ui-001",
                title: "复训草稿",
                questionCount: 5,
                totalScore: 10,
              },
            },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(screen.getByText("正在加载企业训练")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();
    expect(screen.getByText("企业训练列表")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新建企业训练" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("form", { name: "企业训练配置表单" })).toBeNull();

    openCreateWizard();

    const createRegion = within(
      screen.getByRole("region", { name: /新建企业训练/u }),
    );
    for (const stepLabel of ["选择来源", "配置训练", "设置范围", "预览发布"]) {
      expect(createRegion.getAllByText(stepLabel)).toHaveLength(1);
    }
    expect(createRegion.getByText("来源类型")).toBeInTheDocument();
    expect(createRegion.getByText("训练配置")).toBeInTheDocument();
    expect(createRegion.getByText("发布范围")).toBeInTheDocument();
    expect(createRegion.getByText("发布检查")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "新建企业训练" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("radio", { name: "新建题目训练" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "新建试卷训练" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "平台试卷快照" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "AI组卷结果" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "企业 AI 结果" })).toBeNull();
    expect(
      screen.getByText(/模拟考试不是企业训练来源入口/u),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("试卷快照")).toBeNull();

    const draftForm = within(
      screen.getByRole("form", { name: "企业训练配置表单" }),
    );
    expect(draftForm.queryByLabelText("组织节点")).toBeNull();
    expect(draftForm.queryByLabelText("企业授权")).toBeNull();
    expect(
      draftForm.getByText("组织范围由当前会话授权带入"),
    ).toBeInTheDocument();
    expect(draftForm.getByText("企业授权由服务端校验")).toBeInTheDocument();
    fireEvent.change(draftForm.getByLabelText("训练标题"), {
      target: { value: "门店服务训练" },
    });
    fireEvent.change(draftForm.getByLabelText("训练说明"), {
      target: { value: "仅保存元数据" },
    });
    fireEvent.click(
      draftForm.getByRole("button", { name: "创建企业训练草稿" }),
    );

    const createdDraftStatus = await screen.findByRole("status");
    expect(createdDraftStatus).toHaveTextContent("企业训练草稿已创建");
    expect(
      readJsonRequestBody(fetchMock, "/api/v1/organization-trainings", "POST"),
    ).toMatchObject({
      organizationPublicId: "organization-admin-scope-001",
      authorizationPublicId: "org-auth-admin-scope-001",
      profession: "marketing",
      level: 3,
      subject: "theory",
      title: "门店服务训练",
      description: "仅保存元数据",
      capabilityContext: {
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        canCreateOrganizationTraining: true,
      },
    });

    expect(screen.queryByRole("form", { name: "企业训练来源表单" })).toBeNull();
    expect(
      screen.getByText(/创建草稿后从试卷列表选择平台试卷快照/u),
    ).toBeInTheDocument();

    const copyForm = within(
      screen.getByRole("form", { name: "企业训练复制表单" }),
    );
    fireEvent.change(copyForm.getByLabelText("已发布版本"), {
      target: { value: "organization-training-version-ui-001" },
    });
    fireEvent.change(copyForm.getByLabelText("新草稿名称"), {
      target: { value: "复训草稿" },
    });
    fireEvent.click(copyForm.getByRole("button", { name: "复制为草稿" }));

    expect(
      await screen.findByText("已复制为新的企业训练草稿"),
    ).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-ui-001/copy-to-new-draft",
        "POST",
      ),
    ).toMatchObject({
      sourceVersionPublicId: "organization-training-version-ui-001",
      authorizationPublicId: "org-auth-admin-scope-001",
      newDraftTitle: "复训草稿",
    });
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("9301");
    expect(document.body.textContent).not.toContain(
      "organization-training-draft-ui-001",
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });

  it("shows source-specific organization AI handoff guidance when selected explicitly", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();

    openCreateWizard();
    fireEvent.click(screen.getByRole("radio", { name: "新建题目训练" }));

    expect(screen.queryByRole("form", { name: "企业训练来源表单" })).toBeNull();
    expect(
      screen.getByText(/题目还未发布，员工暂时看不到/u),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "AI出题结果" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "AI组卷结果" })).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "新建试卷训练" }));

    expect(
      screen.getByRole("radio", { name: "AI组卷结果" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "AI组卷结果" }));
    expect(screen.getByText(/本地选题后进入企业训练草稿/u)).toBeInTheDocument();
  });

  it("loads persisted AI-created drafts and publishes structured reviewed previews without raw JSON input", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (isOrganizationTrainingListGet(url, init)) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              items: [
                {
                  publicId: persistedAiDraft.publicId,
                  resourceType: "organization_training_draft",
                  organizationPublicId: persistedAiDraft.organizationPublicId,
                  authorizationPublicId: persistedAiDraft.authorizationPublicId,
                  profession: persistedAiDraft.profession,
                  level: persistedAiDraft.level,
                  subject: persistedAiDraft.subject,
                  title: persistedAiDraft.title,
                  description: persistedAiDraft.description,
                  questionCount: persistedAiDraft.questionCount,
                  totalScore: persistedAiDraft.totalScore,
                  questionTypeSummary: persistedAiDraft.questionTypeSummary,
                  status: "draft",
                  availableActions: ["publish"],
                },
              ],
              redactionStatus: "metadata_only",
            },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-draft-ai-ui-001/publish" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              version: {
                publicId: "organization-training-version-ai-ui-001",
                draftPublicId: "organization-training-draft-ai-ui-001",
                versionNumber: 1,
                organizationPublicId: "organization-admin-scope-001",
                publishScopeSnapshot: {
                  organizationPublicIds: ["organization-admin-scope-001"],
                  capturedAt: "2026-07-06T06:20:00.000Z",
                },
                profession: "marketing",
                level: 3,
                subject: "theory",
                title: "AI 生成训练草稿",
                description: "AI 结果复制草稿",
                questionCount: 1,
                totalScore: 5,
                status: "published",
                publishedAt: "2026-07-06T06:20:00.000Z",
                takenDownAt: null,
                takedownReason: null,
              },
            },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    const persistedDraftCard = await screen.findByTestId(
      "organization-training-lifecycle-organization-training-draft-ai-ui-001",
    );
    expect(persistedDraftCard).toHaveTextContent("AI 生成训练草稿");
    expect(persistedDraftCard).toHaveTextContent("草稿");
    expect(persistedDraftCard).toHaveTextContent("待发布");

    fireEvent.click(
      within(persistedDraftCard).getByRole("button", { name: "发布" }),
    );

    const publishForm = within(
      screen.getByRole("form", { name: "企业训练发布表单" }),
    );
    expect(publishForm.queryByLabelText("题目快照")).toBeNull();
    expect(publishForm.getByText("发布前题目预览")).toBeInTheDocument();
    expect(publishForm.getByText("员工视角预览")).toBeInTheDocument();

    fireEvent.change(publishForm.getByLabelText("第 1 题题干"), {
      target: { value: "synthetic reviewed organization training stem" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题题型"), {
      target: { value: "single_choice" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题分值"), {
      target: { value: "5" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题选项 A"), {
      target: { value: "synthetic reviewed option A" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题选项 B"), {
      target: { value: "synthetic reviewed option B" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题标准答案"), {
      target: { value: "A" },
    });
    fireEvent.change(publishForm.getByLabelText("第 1 题解析"), {
      target: { value: "synthetic reviewed analysis" },
    });

    fireEvent.click(publishForm.getByRole("button", { name: "发布训练" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "当前草稿缺少必要内容或依据，暂不能发布",
    );
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) ===
            "/api/v1/organization-trainings/organization-training-draft-ai-ui-001/publish" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);

    fireEvent.change(publishForm.getByLabelText("第 1 题依据状态"), {
      target: { value: "weak" },
    });
    fireEvent.click(publishForm.getByRole("button", { name: "发布训练" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "资料依据较弱，发布前需要确认适用范围和员工可见内容",
    );
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) ===
            "/api/v1/organization-trainings/organization-training-draft-ai-ui-001/publish" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);

    fireEvent.click(publishForm.getByLabelText("确认弱依据后发布"));
    fireEvent.click(publishForm.getByRole("button", { name: "预览员工视角" }));
    expect(publishForm.getByText("员工可见预览")).toBeInTheDocument();
    expect(
      publishForm.getByText("synthetic reviewed organization training stem"),
    ).toBeInTheDocument();
    expect(publishForm.queryByText("synthetic reviewed analysis")).toBeNull();

    fireEvent.click(publishForm.getByRole("button", { name: "查看答案解析" }));
    expect(
      publishForm.getByText("解析：synthetic reviewed analysis"),
    ).toBeInTheDocument();

    fireEvent.click(publishForm.getByRole("button", { name: "发布训练" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业训练已发布",
    );
    const publishBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/organization-trainings/organization-training-draft-ai-ui-001/publish",
      "POST",
    );
    expect(publishBody).toMatchObject({
      draftPublicId: "organization-training-draft-ai-ui-001",
      organizationPublicId: "organization-admin-scope-001",
      authorizationPublicId: "org-auth-admin-scope-001",
      profession: "marketing",
      level: 3,
      subject: "theory",
      title: "AI 生成训练草稿",
      questionCount: 1,
      totalScore: 5,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 0,
      },
      publishScopeOrganizationPublicIds: ["organization-admin-scope-001"],
      capabilityContext: {
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        canCreateOrganizationTraining: true,
      },
      weakEvidenceConfirmed: true,
      questions: [
        {
          sequenceNumber: 1,
          questionType: "single_choice",
          stem: "synthetic reviewed organization training stem",
          options: [
            {
              label: "A",
              content: "synthetic reviewed option A",
            },
            {
              label: "B",
              content: "synthetic reviewed option B",
            },
          ],
          score: 5,
          standardAnswer: "A",
          analysisSummary: "synthetic reviewed analysis",
          evidenceStatus: "weak",
          citationCount: 1,
        },
      ],
    });
    expect(JSON.stringify(publishBody)).not.toContain("rawPrompt");
    expect(JSON.stringify(publishBody)).not.toContain("providerPayload");
  });

  it("announces organization training mutation failures as alerts", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (path === "/api/v1/organization-trainings" && method === "POST") {
          return createJsonResponse({
            code: 500001,
            message: "failed",
            data: null,
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();

    openCreateWizard();

    const draftForm = within(
      screen.getByRole("form", { name: "企业训练配置表单" }),
    );
    expect(draftForm.queryByLabelText("组织节点")).toBeNull();
    expect(draftForm.queryByLabelText("企业授权")).toBeNull();
    fireEvent.change(draftForm.getByLabelText("训练标题"), {
      target: { value: "门店服务训练" },
    });
    fireEvent.click(
      draftForm.getByRole("button", { name: "创建企业训练草稿" }),
    );

    const mutationAlert = await screen.findByRole("alert");
    expect(mutationAlert).toHaveTextContent("企业训练草稿创建失败");
  });

  it("shows submitting copy while creating an organization training draft", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    let resolveDraftResponse: (
      response: ReturnType<typeof createJsonResponse>,
    ) => void = () => {};
    const draftResponsePromise = new Promise<
      ReturnType<typeof createJsonResponse>
    >((resolve) => {
      resolveDraftResponse = resolve;
    });
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (path === "/api/v1/organization-trainings" && method === "POST") {
          return draftResponsePromise;
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationTrainingPage));

    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();

    openCreateWizard();

    const draftForm = within(
      screen.getByRole("form", { name: "企业训练配置表单" }),
    );
    expect(draftForm.queryByLabelText("组织节点")).toBeNull();
    expect(draftForm.queryByLabelText("企业授权")).toBeNull();
    fireEvent.change(draftForm.getByLabelText("训练标题"), {
      target: { value: "门店服务训练" },
    });
    fireEvent.click(
      draftForm.getByRole("button", { name: "创建企业训练草稿" }),
    );

    await waitFor(() =>
      expect(draftForm.getByRole("button", { name: "创建中" })).toBeDisabled(),
    );

    resolveDraftResponse(
      createJsonResponse({
        code: 0,
        message: "ok",
        data: { draft: createdDraft },
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业训练草稿已创建",
    );
  });
});
