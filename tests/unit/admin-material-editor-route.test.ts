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

import type { MaterialDto } from "@/server/contracts/material-contract";

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

const createdMaterial: MaterialDto = {
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

const editableMaterial: MaterialDto = {
  ...createdMaterial,
  publicId: "material-edit-001",
  title: "待编辑材料",
  contentRichText: "待编辑材料正文",
};

function createJsonResponse(payload: unknown) {
  return { json: async () => payload } as Response;
}

function mockMaterialEditorFetch({
  copyCode = 0,
  createCode = 0,
  detailMaterial = editableMaterial,
  listMaterials = [],
  patchCode = 0,
}: {
  copyCode?: number;
  createCode?: number;
  detailMaterial?: typeof editableMaterial | null;
  listMaterials?: (typeof editableMaterial)[];
  patchCode?: number;
} = {}) {
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
      if (path === "/api/v1/materials/material-edit-001") {
        if (init?.method === "PATCH") {
          return createJsonResponse(
            patchCode === 0
              ? {
                  code: 0,
                  message: "ok",
                  data: {
                    material: {
                      ...editableMaterial,
                      title: "编辑后的材料",
                      updatedAt: "2026-07-13T20:05:00.000Z",
                    },
                  },
                }
              : { code: patchCode, message: "conflict", data: null },
          );
        }
        return createJsonResponse(
          detailMaterial === null
            ? { code: 404201, message: "missing", data: null }
            : { code: 0, message: "ok", data: { material: detailMaterial } },
        );
      }
      if (path === "/api/v1/materials/material-edit-001/copy") {
        return createJsonResponse(
          copyCode === 0
            ? {
                code: 0,
                message: "ok",
                data: {
                  material: {
                    ...editableMaterial,
                    publicId: "material-copy-001",
                    isLocked: false,
                    lockedAt: null,
                  },
                },
              }
            : { code: copyCode, message: "copy failed", data: null },
        );
      }
      if (path.startsWith("/api/v1/materials?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: listMaterials,
          pagination: {
            page: 1,
            pageSize: 20,
            total: listMaterials.length,
            totalPages: listMaterials.length === 0 ? 0 : 1,
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
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/content/materials");
});

describe("AdminMaterialEditorPage", () => {
  it("uses the validated filtered return target on a clean direct editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch();
    window.history.replaceState(
      null,
      "",
      "/content/materials/new?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D2%26pageSize%3D50%26sortBy%3DupdatedAt%26sortOrder%3Dasc%26status%3Ddisabled",
    );

    render(createElement(AdminMaterialEditorPage));
    await screen.findByRole("form", { name: "材料表单" });
    fireEvent.click(
      screen.getAllByRole("button", { name: "返回材料列表" })[0]!,
    );

    expect(navigationReplace).toHaveBeenCalledWith(
      "/content/materials?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&status=disabled",
    );
  });

  it("preserves authored material input when dirty leave is cancelled", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch();
    window.history.replaceState(null, "", "/content/materials/new");
    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(createElement(AdminMaterialEditorPage));
    const form = within(await screen.findByRole("form", { name: "材料表单" }));
    fireEvent.change(form.getByLabelText("材料正文"), {
      target: { value: "不得丢失的材料正文" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "返回材料列表" })[0]!,
    );

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(navigationReplace).not.toHaveBeenCalled();
    expect(form.getByLabelText("材料正文")).toHaveValue("不得丢失的材料正文");
  });

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

  it("posts valid input once and replaces the create URL with the returned edit route", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch();

    render(createElement(AdminMaterialEditorPage));
    const form = await fillValidMaterial();
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    fireEvent.click(form.getByRole("button", { name: "保存中…" }));

    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/materials/material-created-001/edit?returnTo=%2Fcontent%2Fmaterials",
      ),
    );
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
    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/materials/material-created-001/edit?returnTo=%2Fcontent%2Fmaterials",
      ),
    );
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
    expect(navigationReplace).toHaveBeenCalledWith("/content/materials");
  });

  it("loads an unlocked material and patches the shared form contract", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch();

    render(
      createElement(AdminMaterialEditorPage, {
        materialPublicId: editableMaterial.publicId,
      }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "编辑材料" }),
    ).toBeInTheDocument();
    const form = within(screen.getByRole("form", { name: "材料表单" }));
    expect(form.getByLabelText("材料标题")).toHaveValue(editableMaterial.title);
    fireEvent.change(form.getByLabelText("材料标题"), {
      target: { value: "编辑后的材料" },
    });
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));

    expect(await screen.findByText("材料已保存")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-edit-001",
      expect.objectContaining({ method: "PATCH" }),
    );
    const patchCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url) === "/api/v1/materials/material-edit-001" &&
        init?.method === "PATCH",
    );
    expect(JSON.parse(String(patchCall?.[1]?.body))).toMatchObject({
      expectedUpdatedAt: editableMaterial.updatedAt,
      status: "available",
      title: "编辑后的材料",
    });
    expect(screen.getByRole("form", { name: "材料表单" })).toHaveAttribute(
      "data-admin-form-dirty-state",
      "clean",
    );
  });

  it("does not mount a form for a locked deep link and copies only after an explicit action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch({
      detailMaterial: {
        ...editableMaterial,
        isLocked: true,
        lockedAt: "2026-07-13T20:10:00.000Z",
      },
    });

    render(
      createElement(AdminMaterialEditorPage, {
        materialPublicId: editableMaterial.publicId,
      }),
    );

    expect(await screen.findByText("材料已锁定")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).endsWith("/copy")),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "复制为新材料并编辑" }));
    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/materials/material-copy-001/edit?returnTo=%2Fcontent%2Fmaterials",
      ),
    );
  });

  it("keeps a locked page recoverable when copy fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch({
      copyCode: 409201,
      detailMaterial: { ...editableMaterial, isLocked: true },
    });

    render(
      createElement(AdminMaterialEditorPage, {
        materialPublicId: editableMaterial.publicId,
      }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "复制为新材料并编辑" }),
    );

    expect(await screen.findByText("材料复制失败")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "复制为新材料并编辑" }),
    ).toBeEnabled();
    expect(navigationReplace).not.toHaveBeenCalled();
  });

  it("preserves input and blocks further patches after a server lock race", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch({ patchCode: 409201 });

    render(
      createElement(AdminMaterialEditorPage, {
        materialPublicId: editableMaterial.publicId,
      }),
    );
    const form = within(await screen.findByRole("form", { name: "材料表单" }));
    fireEvent.change(form.getByLabelText("材料标题"), {
      target: { value: "锁定竞态保留输入" },
    });
    fireEvent.click(form.getByRole("button", { name: "保存材料" }));

    expect(await screen.findByText("材料保存冲突")).toBeInTheDocument();
    expect(form.getByLabelText("材料标题")).toHaveValue("锁定竞态保留输入");
    expect(form.getByRole("button", { name: "保存材料" })).toBeDisabled();

    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: "复制为新材料并编辑" }));
    expect(confirmMock).toHaveBeenCalledOnce();
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url).endsWith("/copy") && init?.method === "POST",
      ),
    ).toHaveLength(0);
    expect(form.getByLabelText("材料标题")).toHaveValue("锁定竞态保留输入");

    fireEvent.click(form.getByRole("button", { name: "保存材料" }));
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url) === "/api/v1/materials/material-edit-001" &&
          init?.method === "PATCH",
      ),
    ).toHaveLength(1);
  });

  it("offers a deterministic list return for a missing material", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch({ detailMaterial: null });

    render(
      createElement(AdminMaterialEditorPage, {
        materialPublicId: editableMaterial.publicId,
      }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "未找到材料" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回材料列表" }));
    expect(navigationReplace).toHaveBeenCalledWith("/content/materials");
  });
});

describe("material create route entry", () => {
  it("routes the product material list create action to the dedicated editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockMaterialEditorFetch();

    render(createElement(MaterialsPage));

    fireEvent.click(await screen.findByRole("button", { name: "新建材料" }));
    expect(navigationPush).toHaveBeenCalledWith(
      "/content/materials/new?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
    );
    expect(
      JSON.parse(
        sessionStorage.getItem("tiku.adminEditorReturn.materials") ?? "null",
      ),
    ).toMatchObject({
      initiatingControl: "create",
      returnTo:
        "/content/materials?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      version: 1,
    });
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
  });

  it("routes product list edit and copy to the canonical material editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockMaterialEditorFetch({
      listMaterials: [editableMaterial],
    });

    render(createElement(MaterialsPage));

    fireEvent.click(
      await screen.findByRole("button", {
        name: "编辑材料 待编辑材料（可用）",
      }),
    );
    expect(navigationPush).toHaveBeenCalledWith(
      "/content/materials/material-edit-001/edit?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "复制材料 待编辑材料（可用）",
      }),
    );
    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/materials/material-copy-001/edit?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-edit-001/copy",
      expect.objectContaining({ method: "POST" }),
    );
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
    expect(navigationPush).toHaveBeenCalledWith(
      "/content/materials/new?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
    );
    expect(screen.queryByRole("form", { name: "材料表单" })).toBeNull();
  });
});
