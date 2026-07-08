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

      if (String(url) === "/api/v1/organization-trainings") {
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
    expect(screen.getByText("列表草稿")).toBeInTheDocument();
    expect(screen.queryByText("已发布训练")).toBeNull();
    expect(screen.queryByText("已下架训练")).toBeNull();

    fireEvent.click(
      within(filterGroup).getByRole("button", { name: "已发布" }),
    );
    expect(screen.getByText("已发布训练")).toBeInTheDocument();
    expect(screen.queryByText("列表草稿")).toBeNull();
    expect(screen.queryByText("已下架训练")).toBeNull();

    fireEvent.click(
      within(filterGroup).getByRole("button", { name: "已下架" }),
    );
    expect(screen.getByText("已下架训练")).toBeInTheDocument();
    expect(screen.queryByText("列表草稿")).toBeNull();
    expect(screen.queryByText("已发布训练")).toBeNull();
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

      if (String(url) === "/api/v1/organization-trainings") {
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

    fireEvent.click(screen.getAllByRole("button", { name: "查看" })[0]);

    expect(
      screen.getByRole("complementary", { name: "训练详情" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(screen.getByText("分页训练 11")).toBeInTheDocument();
    expect(screen.queryByText("分页训练 01")).toBeNull();
    expect(
      screen.queryByRole("complementary", { name: "训练详情" }),
    ).toBeNull();
    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "上一页" }));

    expect(screen.getByText("分页训练 01")).toBeInTheDocument();
    expect(screen.queryByText("分页训练 11")).toBeNull();
    expect(screen.getByRole("button", { name: "上一页" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "已发布" }));

    expect(screen.getByText("当前筛选下暂无企业训练")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
  });

  it("keeps the create wizard behind an explicit entry and distinguishes training shape plus organization AI result kind", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (String(url) === "/api/v1/organization-trainings") {
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
    const shapeGroup = screen.getByRole("radiogroup", { name: "训练形态" });
    expect(
      within(shapeGroup).getByRole("radio", { name: "试卷训练" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      within(shapeGroup).getByRole("radio", { name: "题目训练" }),
    ).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("radio", { name: "企业 AI 结果" }));

    const aiResultGroup = screen.getByRole("radiogroup", {
      name: "AI 结果类型",
    });
    expect(
      within(aiResultGroup).getByRole("radio", { name: "AI出题结果" }),
    ).toBeInTheDocument();
    expect(
      within(aiResultGroup).getByRole("radio", { name: "AI组卷结果" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("link", { name: "前往 AI出题" })).toHaveAttribute(
      "href",
      "/organization/ai-question-generation",
    );
    expect(screen.getByRole("link", { name: "前往 AI组卷" })).toHaveAttribute(
      "href",
      "/organization/ai-paper-generation",
    );
    expect(screen.getByText(/只进入企业训练草稿/u)).toBeInTheDocument();

    fireEvent.click(
      within(aiResultGroup).getByRole("radio", { name: "AI出题结果" }),
    );
    expect(
      within(shapeGroup).getByRole("radio", { name: "题目训练" }),
    ).toHaveAttribute("aria-checked", "true");

    fireEvent.click(
      within(aiResultGroup).getByRole("radio", { name: "AI组卷结果" }),
    );
    expect(
      within(shapeGroup).getByRole("radio", { name: "试卷训练" }),
    ).toHaveAttribute("aria-checked", "true");
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

        if (path === "/api/v1/organization-trainings" && method === "GET") {
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

  it("creates draft, attaches source context with the runtime context response key, and copies a version through metadata-only API calls", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (path === "/api/v1/organization-trainings" && method === "GET") {
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

    expect(
      screen.getByRole("button", { name: "新建企业训练" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("平台试卷快照")).toBeInTheDocument();
    expect(screen.getByText("企业 AI 结果")).toBeInTheDocument();
    expect(screen.getByText("手动题组")).toBeInTheDocument();
    expect(
      screen.getByText(/模拟考试不作为企业训练来源入口/u),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "绑定试卷快照" })).toBeDisabled();

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

    const sourceForm = within(
      screen.getByRole("form", { name: "企业训练来源表单" }),
    );
    fireEvent.change(sourceForm.getByLabelText("试卷快照"), {
      target: { value: "paper-source-ui-001" },
    });
    fireEvent.change(sourceForm.getByLabelText("来源标题"), {
      target: { value: "服务训练来源试卷" },
    });
    fireEvent.change(sourceForm.getByLabelText("来源题数"), {
      target: { value: "5" },
    });
    fireEvent.change(sourceForm.getByLabelText("来源总分"), {
      target: { value: "10" },
    });
    fireEvent.click(sourceForm.getByRole("button", { name: "绑定试卷快照" }));

    expect(
      await screen.findByText("来源已绑定到企业训练草稿"),
    ).toBeInTheDocument();
    const sourceBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/organization-trainings/organization-training-draft-ui-001/source-contexts",
      "POST",
    );
    expect(sourceBody).toMatchObject({
      draftPublicId: "organization-training-draft-ui-001",
      organizationPublicId: "organization-admin-scope-001",
      authorizationPublicId: "org-auth-admin-scope-001",
      sourceContexts: [
        {
          sourceType: "paper",
          sourcePublicId: "paper-source-ui-001",
          title: "服务训练来源试卷",
          questionCount: 5,
          totalScore: 10,
          sourceStatus: "published",
        },
      ],
    });
    expect(JSON.stringify(sourceBody)).not.toContain("standardAnswer");
    expect(JSON.stringify(sourceBody)).not.toContain("analysis");

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

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
  });

  it("shows organization AI result copy guidance when selected explicitly", async () => {
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
    fireEvent.click(screen.getByRole("radio", { name: "企业 AI 结果" }));

    expect(screen.queryByRole("form", { name: "企业训练来源表单" })).toBeNull();
    expect(screen.getByText(/AI 结果只进入企业训练草稿/u)).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "AI出题结果" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "AI组卷结果" }),
    ).toBeInTheDocument();
  });

  it("loads persisted AI-created drafts and publishes reviewed question snapshots through the existing organization training API", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (path === "/api/v1/organization-trainings" && method === "GET") {
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
    fireEvent.change(publishForm.getByLabelText("题目快照"), {
      target: {
        value: JSON.stringify([
          {
            publicId: "organization-training-question-ai-ui-001",
            sequenceNumber: 1,
            questionType: "single_choice",
            materialTitle: null,
            materialContent: null,
            stem: "synthetic reviewed organization training stem",
            options: [
              {
                publicId: "organization-training-question-option-ai-ui-a",
                label: "A",
                content: "synthetic reviewed option A",
              },
              {
                publicId: "organization-training-question-option-ai-ui-b",
                label: "B",
                content: "synthetic reviewed option B",
              },
            ],
            score: 5,
            standardAnswer: "A",
            analysisSummary: "synthetic reviewed analysis",
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
        ]),
      },
    });
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
      weakEvidenceConfirmed: false,
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
