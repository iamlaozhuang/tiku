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

import AdminOrganizationTrainingRoutePage from "@/app/(admin)/organization-training/page";
import { AdminOrganizationTrainingPage } from "@/features/admin/organization-training/AdminOrganizationTrainingPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-training",
      phone: "13900000002",
      name: "Organization Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-admin-scope-001",
      adminPublicId: "admin-organization-public-001",
      adminRoles: ["organization_admin"],
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
  it("is wired as the admin organization training route page", () => {
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

  it("creates draft, attaches source context, and copies a version through metadata-only API calls", async () => {
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
              attachment: {
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

    const draftForm = within(
      screen.getByRole("form", { name: "组织培训草稿表单" }),
    );
    fireEvent.change(draftForm.getByLabelText("组织 publicId"), {
      target: { value: "organization-admin-scope-001" },
    });
    fireEvent.change(draftForm.getByLabelText("企业授权 publicId"), {
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
    fireEvent.change(sourceForm.getByLabelText("来源 publicId"), {
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
    fireEvent.change(copyForm.getByLabelText("版本 publicId"), {
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
