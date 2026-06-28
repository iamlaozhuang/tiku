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
    expect(screen.queryByRole("form", { name: "组织培训草稿表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
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

    expect(screen.getByText("正在加载组织培训")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "组织培训" }),
    ).toBeInTheDocument();
    expect(screen.getByText("本页仅创建和复制训练草稿")).toBeInTheDocument();
    expect(screen.getByText(/创建草稿后才能绑定来源/u)).toBeInTheDocument();
    expect(screen.getByText(/仅保存来源元数据/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "绑定来源" })).toBeDisabled();

    const draftForm = within(
      screen.getByRole("form", { name: "组织培训草稿表单" }),
    );
    fireEvent.change(draftForm.getByLabelText("组织业务标识"), {
      target: { value: "organization-admin-scope-001" },
    });
    fireEvent.change(draftForm.getByLabelText("企业授权业务标识"), {
      target: { value: "org-auth-admin-scope-001" },
    });
    fireEvent.change(draftForm.getByLabelText("培训标题"), {
      target: { value: "门店服务训练" },
    });
    fireEvent.change(draftForm.getByLabelText("培训说明"), {
      target: { value: "仅保存元数据" },
    });
    fireEvent.click(draftForm.getByRole("button", { name: "创建草稿" }));

    expect(
      await screen.findByText("草稿 organization-training-draft-ui-001 已创建"),
    ).toBeInTheDocument();
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
      screen.getByRole("form", { name: "组织培训来源表单" }),
    );
    fireEvent.change(sourceForm.getByLabelText("来源业务标识"), {
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
    fireEvent.click(sourceForm.getByRole("button", { name: "绑定来源" }));

    expect(
      await screen.findByText("来源 paper-source-ui-001 已绑定"),
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
      screen.getByRole("form", { name: "组织培训复制表单" }),
    );
    fireEvent.change(copyForm.getByLabelText("版本业务标识"), {
      target: { value: "organization-training-version-ui-001" },
    });
    fireEvent.change(copyForm.getByLabelText("新草稿标题"), {
      target: { value: "复训草稿" },
    });
    fireEvent.click(copyForm.getByRole("button", { name: "复制为草稿" }));

    expect(
      await screen.findByText(
        "草稿 organization-training-draft-copy-ui-001 已创建",
      ),
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

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });
});
