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

const { navigationPush } = vi.hoisted(() => ({ navigationPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationPush }),
}));

import { AdminQuestionEditorPage } from "@/features/admin/question-material-management/AdminQuestionEditorPage";
import { AdminQuestionMaterialManagement } from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

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

function createJsonResponse(payload: unknown) {
  return { json: async () => payload } as Response;
}

function mockQuestionEditorFetch({
  createCode = 0,
}: { createCode?: number } = {}) {
  const fetchMock = vi.fn(async (requestUrl: string | URL | Request) => {
    const path = String(requestUrl);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }
    if (path.startsWith("/api/v1/materials?")) {
      return createJsonResponse({ code: 0, message: "ok", data: [] });
    }
    if (path.startsWith("/api/v1/knowledge-nodes?")) {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: { knowledgeNodes: [] },
      });
    }
    if (path === "/api/v1/tags") {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: { tags: [] },
      });
    }
    if (path === "/api/v1/questions") {
      return createJsonResponse(
        createCode === 0
          ? {
              code: 0,
              message: "ok",
              data: { question: { publicId: "question-created-001" } },
            }
          : { code: createCode, message: "conflict", data: null },
      );
    }
    if (path.startsWith("/api/v1/questions?")) {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function fillValidSingleChoiceQuestion() {
  const form = within(screen.getByRole("form", { name: "题目表单" }));
  fireEvent.change(form.getByLabelText("题型"), {
    target: { value: "single_choice" },
  });
  fireEvent.change(form.getByLabelText("专业"), {
    target: { value: "marketing" },
  });
  fireEvent.change(form.getByLabelText("等级"), { target: { value: "3" } });
  fireEvent.change(form.getByLabelText("科目"), {
    target: { value: "theory" },
  });
  fireEvent.change(form.getByLabelText("题干"), {
    target: { value: "独立 editor route 题干" },
  });
  fireEvent.change(form.getByLabelText("标准答案"), {
    target: { value: "A" },
  });
  fireEvent.change(form.getByLabelText("老师解析"), {
    target: { value: "独立 editor route 解析" },
  });
  fireEvent.change(form.getByLabelText("选项 A"), {
    target: { value: "正确选项" },
  });
  fireEvent.change(form.getByLabelText("选项 B"), {
    target: { value: "错误选项" },
  });
  fireEvent.click(form.getByLabelText("选项 A 正确"));
  return form;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminQuestionEditorPage", () => {
  it("renders a dedicated create editor and blocks semantic-empty submission", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch();

    render(createElement(AdminQuestionEditorPage));

    const form = await screen.findByRole("form", { name: "题目表单" });
    expect(
      screen.getByRole("heading", { level: 1, name: "新建题目" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "题目列表" })).toBeNull();

    fireEvent.click(within(form).getByRole("button", { name: "保存题目" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "请修正以下内容",
    );
    expect(form.querySelector('[data-field="questionType"]')).toHaveFocus();
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl]) => String(requestUrl) === "/api/v1/questions",
      ),
    ).toBe(false);
  });

  it("posts once, enters a non-resubmittable completion state, and returns explicitly", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch();

    render(createElement(AdminQuestionEditorPage));
    await screen.findByRole("form", { name: "题目表单" });
    const form = fillValidSingleChoiceQuestion();
    fireEvent.click(form.getByRole("button", { name: "保存题目" }));

    const completionHeading = await screen.findByRole("heading", {
      name: "题目已创建",
    });
    expect(screen.queryByRole("form", { name: "题目表单" })).toBeNull();
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl]) => String(requestUrl) === "/api/v1/questions",
      ),
    ).toHaveLength(1);

    const completion = completionHeading.closest("section");
    expect(completion).not.toBeNull();
    fireEvent.click(
      within(completion as HTMLElement).getByRole("button", {
        name: "返回题目列表",
      }),
    );
    expect(navigationPush).toHaveBeenCalledWith("/content/questions");
  });

  it("preserves authored input after a recoverable create conflict", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch({ createCode: 409001 });

    render(createElement(AdminQuestionEditorPage));
    await screen.findByRole("form", { name: "题目表单" });
    const form = fillValidSingleChoiceQuestion();
    fireEvent.click(form.getByRole("button", { name: "保存题目" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("题目保存失败");
    expect(form.getByLabelText("题干")).toHaveValue("独立 editor route 题干");
    await waitFor(() =>
      expect(form.getByRole("button", { name: "保存题目" })).toBeEnabled(),
    );
  });

  it("routes the product question-list create action to the dedicated editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        questionCreateRouteEnabled: true,
      }),
    );

    await screen.findByRole("heading", { name: "题库与材料管理" });
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    expect(navigationPush).toHaveBeenCalledWith("/content/questions/new");
    expect(screen.queryByRole("form", { name: "题目表单" })).toBeNull();
  });
});
