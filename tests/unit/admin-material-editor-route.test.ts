import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { navigationPush, navigationReplace } = vi.hoisted(() => ({
  navigationPush: vi.fn(),
  navigationReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationPush, replace: navigationReplace }),
}));

import MaterialsPage from "@/app/(admin)/content/materials/page";
import QuestionsPage from "@/app/(admin)/content/questions/page";
import { AdminMaterialEditorPage } from "@/features/admin/question-material-management/AdminMaterialEditorPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-content-admin",
      phone: "139****0001",
      name: "Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-content-001",
      adminRoles: ["content_admin"],
    },
    session: { expiresAt: "2026-07-14T08:00:00.000Z" },
  },
};

const createdMaterial = {
  publicId: "material-created-001",
  title: "独立编辑器材料",
  contentRichText: "包含有效正文的材料",
  profession: "marketing",
  level: 3,
  subject: "theory",
  status: "available",
  isLocked: false,
  lockedAt: null,
  references: { questions: [], papers: [] },
  createdAt: "2026-07-13T20:00:00.000Z",
  updatedAt: "2026-07-13T20:00:00.000Z",
};

function createJsonResponse(payload: unknown) {
  return { json: async () => payload } as Response;
}

function mockMaterialEditorFetch({
  createCode = 0,
}: { createCode?: number } = {}) {
  const fetchMock = vi.fn(
    async (requestUrl: string | URL | Request, init?: RequestInit) => {
      const path = String(requestUrl);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }
      if (path === "/api/v1/materials" && init?.method === "POST") {
        return createJsonResponse(
          createCode === 0
            ? {
                code: 0,
                message: "ok",
                data: { material: createdMaterial },
              }
            : { code: createCode, message: "conflict", data: null },
        );
      }
      if (path.startsWith("/api/v1/materials?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        });
      }
      if (path.startsWith("/api/v1/questions?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
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
  return fetchMock;
}

async function fillValidMaterial() {
  const form = within(await screen.findByRole("form", { name: "材料表单" }));
  fireEvent.change(form.getByLabelText("材料标题"), {
    target: { value: createdMaterial.title },
  });
  fireEvent.change(form.getByLabelText("专业"), {
    target: { value: createdMaterial.profession },
  });
  fireEvent.change(form.getByLabelText("等级"), {
    target: { value: String(createdMaterial.level) },
  });
  fireEvent.change(form.getByLabelText("科目"), {
    target: { value: createdMaterial.subject },
  });
  fireEvent.change(form.getByLabelText("材料正文"), {
    target: { value: createdMaterial.contentRichText },
  });
  return form;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminMaterialEditorPage", () => {
  it("renders a dedicated create editor and blocks semantic-empty submission", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch();

    render(createElement(AdminMaterialEditorPage));

    const form = await screen.findByRole("form", { name: "材料表单" });
    expect(
      screen.getByRole("heading", { level: 1, name: "新建材料" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "材料列表" })).toBeNull();

    fireEvent.click(within(form).getByRole("button", { name: "保存材料" }));

    expect(within(form).getByRole("alert")).toHaveTextContent(
      "请输入有效材料标题",
    );
    expect(within(form).getByLabelText("材料标题")).toHaveFocus();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url) === "/api/v1/materials" && init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("posts valid input once and replaces the form with a non-resubmittable completion", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch();

    render(createElement(AdminMaterialEditorPage));
    const form = await fillValidMaterial();
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    fireEvent.click(form.getByRole("button", { name: "保存中…" }));

    expect(
      await screen.findByRole("heading", { level: 2, name: "材料已创建" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
    expect(navigationReplace).not.toHaveBeenCalled();
    const postCalls = fetchMock.mock.calls.filter(
      ([url, init]) =>
        String(url) === "/api/v1/materials" && init?.method === "POST",
    );
    expect(postCalls).toHaveLength(1);
    expect(JSON.parse(String(postCalls[0]?.[1]?.body))).toEqual({
      title: createdMaterial.title,
      contentRichText: createdMaterial.contentRichText,
      profession: createdMaterial.profession,
      level: createdMaterial.level,
      subject: createdMaterial.subject,
    });
  });

  it("keeps authored input after a conflict and does not cross the 30000-character contract", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch({ createCode: 409201 });

    render(createElement(AdminMaterialEditorPage));
    const form = await fillValidMaterial();
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));

    expect(await screen.findByText("材料保存失败")).toBeInTheDocument();
    expect(form.getByLabelText("材料标题")).toHaveValue(createdMaterial.title);

    fireEvent.change(form.getByLabelText("材料正文"), {
      target: { value: "材".repeat(30001) },
    });
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    expect(form.getByRole("alert")).toHaveTextContent(
      "材料正文超过 30000 字符，不能保存。",
    );
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url) === "/api/v1/materials" && init?.method === "POST",
      ),
    ).toHaveLength(1);
  });

  it("keeps empty table markup invalid while accepting the managed accessible image helper", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch();

    render(createElement(AdminMaterialEditorPage));
    const form = within(await screen.findByRole("form", { name: "材料表单" }));
    fireEvent.change(form.getByLabelText("材料标题"), {
      target: { value: createdMaterial.title },
    });
    fireEvent.change(form.getByLabelText("专业"), {
      target: { value: createdMaterial.profession },
    });
    fireEvent.change(form.getByLabelText("等级"), {
      target: { value: String(createdMaterial.level) },
    });
    fireEvent.change(form.getByLabelText("科目"), {
      target: { value: createdMaterial.subject },
    });
    fireEvent.click(form.getByRole("button", { name: "插入表格模板" }));
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    expect(form.getByRole("alert")).toHaveTextContent("请输入有效材料正文");

    fireEvent.click(form.getByRole("button", { name: "插入受管图片引用" }));
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "材料已创建" }),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url) === "/api/v1/materials" && init?.method === "POST",
      ),
    ).toHaveLength(1);
  });

  it("renders a safe return when the administrator session is unauthorized", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          code: 401001,
          message: "unauthorized",
          data: null,
        }),
      ),
    );
    render(createElement(AdminMaterialEditorPage));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "无权访问材料编辑器",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回材料列表" }));
    expect(navigationPush).toHaveBeenCalledWith("/content/materials");
  });
});

describe("material create route entry", () => {
  it("routes the product material list create action to the dedicated editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch();

    render(createElement(MaterialsPage));

    fireEvent.click(await screen.findByRole("button", { name: "新建材料" }));
    expect(navigationPush).toHaveBeenCalledWith("/content/materials/new");
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
  });

  it("keeps the material create route when entering the material tab from questions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch();

    render(
      await QuestionsPage({
        searchParams: Promise.resolve({}),
      }),
    );

    fireEvent.click(await screen.findByRole("tab", { name: "材料" }));
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));
    expect(navigationPush).toHaveBeenCalledWith("/content/materials/new");
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
  });
});
