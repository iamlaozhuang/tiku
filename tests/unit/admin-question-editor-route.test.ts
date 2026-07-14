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

import type { QuestionDto } from "@/server/contracts/question-contract";

const { navigationPush, navigationRedirect, navigationReplace } = vi.hoisted(
  () => ({
    navigationPush: vi.fn(),
    navigationRedirect: vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    }),
    navigationReplace: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  redirect: navigationRedirect,
  useRouter: () => ({ push: navigationPush, replace: navigationReplace }),
}));

import QuestionsPage from "@/app/(admin)/content/questions/page";
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

const editableQuestion: QuestionDto = {
  publicId: "question-edit-001",
  questionType: "single_choice",
  profession: "marketing",
  level: 3,
  subject: "theory",
  stemRichText: "待编辑题干",
  analysisRichText: "待编辑老师解析",
  standardAnswerRichText: "A",
  status: "available",
  isLocked: false,
  lockedAt: null,
  multiChoiceRule: "all_correct_only",
  scoringMethod: "auto_match",
  materialPublicId: null,
  questionOptions: [
    {
      label: "A",
      contentRichText: "正确选项",
      isCorrect: true,
      sortOrder: 1,
    },
    {
      label: "B",
      contentRichText: "错误选项",
      isCorrect: false,
      sortOrder: 2,
    },
  ],
  scoringPoints: [],
  knowledgeNodePublicIds: [],
  tagPublicIds: [],
  createdAt: "2026-07-13T20:00:00.000Z",
  updatedAt: "2026-07-13T20:00:00.000Z",
};

function createJsonResponse(payload: unknown) {
  return { json: async () => payload } as Response;
}

function mockQuestionEditorFetch({
  copyCode = 0,
  createCode = 0,
  detailQuestion = editableQuestion,
  listQuestions = [],
  patchCode = 0,
}: {
  copyCode?: number;
  createCode?: number;
  detailQuestion?: typeof editableQuestion | null;
  listQuestions?: (typeof editableQuestion)[];
  patchCode?: number;
} = {}) {
  const fetchMock = vi.fn(
    async (requestUrl: string | URL | Request, init?: RequestInit) => {
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
      if (path === "/api/v1/questions" && init?.method === "POST") {
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
      if (path === "/api/v1/questions/question-edit-001") {
        if (init?.method === "PATCH") {
          return createJsonResponse(
            patchCode === 0
              ? {
                  code: 0,
                  message: "ok",
                  data: {
                    question: {
                      ...editableQuestion,
                      stemRichText: "更新后的待编辑题干",
                      updatedAt: "2026-07-13T20:05:00.000Z",
                    },
                  },
                }
              : { code: patchCode, message: "conflict", data: null },
          );
        }

        return createJsonResponse(
          detailQuestion === null
            ? { code: 404202, message: "missing", data: null }
            : { code: 0, message: "ok", data: { question: detailQuestion } },
        );
      }
      if (path === "/api/v1/questions/question-edit-001/copy") {
        return createJsonResponse(
          copyCode === 0
            ? {
                code: 0,
                message: "ok",
                data: {
                  question: {
                    ...editableQuestion,
                    publicId: "question-copy-001",
                    isLocked: false,
                    lockedAt: null,
                  },
                },
              }
            : { code: copyCode, message: "copy failed", data: null },
        );
      }
      if (path.startsWith("/api/v1/questions?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: listQuestions,
          pagination: {
            page: 1,
            pageSize: 20,
            total: listQuestions.length,
            totalPages: listQuestions.length === 0 ? 0 : 1,
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
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/content/questions");
});

describe("AdminQuestionEditorPage", () => {
  it("uses the validated filtered return target on a clean direct editor", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch();
    window.history.replaceState(
      null,
      "",
      "/content/questions/new?returnTo=%2Fcontent%2Fquestions%3Fpage%3D2%26pageSize%3D50%26sortBy%3DupdatedAt%26sortOrder%3Dasc%26status%3Ddisabled",
    );

    render(createElement(AdminQuestionEditorPage));
    await screen.findByRole("form", { name: "题目表单" });
    fireEvent.click(
      screen.getAllByRole("button", { name: "返回题目列表" })[0]!,
    );

    expect(navigationReplace).toHaveBeenCalledWith(
      "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&status=disabled",
    );
  });

  it("preserves authored question input when dirty leave is cancelled", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch();
    window.history.replaceState(null, "", "/content/questions/new");
    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(createElement(AdminQuestionEditorPage));
    const form = within(await screen.findByRole("form", { name: "题目表单" }));
    fireEvent.change(form.getByLabelText("题干"), {
      target: { value: "不得丢失的题干" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "返回题目列表" })[0]!,
    );

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(navigationReplace).not.toHaveBeenCalled();
    expect(form.getByLabelText("题干")).toHaveValue("不得丢失的题干");
  });

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

  it("posts once and replaces create with the returned edit route", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch();

    render(createElement(AdminQuestionEditorPage));
    await screen.findByRole("form", { name: "题目表单" });
    const form = fillValidSingleChoiceQuestion();
    const saveButton = form.getByRole("button", { name: "保存题目" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/questions/question-created-001/edit?returnTo=%2Fcontent%2Fquestions",
      ),
    );
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl]) => String(requestUrl) === "/api/v1/questions",
      ),
    ).toHaveLength(1);
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
        questionEditorRoutesEnabled: true,
      }),
    );

    await screen.findByRole("heading", { name: "题库与材料管理" });
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    expect(navigationPush).toHaveBeenCalledWith(
      "/content/questions/new?returnTo=%2Fcontent%2Fquestions%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
    );
    expect(
      JSON.parse(
        sessionStorage.getItem("tiku.adminEditorReturn.questions") ?? "null",
      ),
    ).toMatchObject({
      initiatingControl: "create",
      returnTo:
        "/content/questions?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      version: 1,
    });
    expect(screen.queryByRole("form", { name: "题目表单" })).toBeNull();
  });

  it("loads an unlocked question and patches the shared editor contract", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch();

    render(
      createElement(AdminQuestionEditorPage, {
        questionPublicId: "question-edit-001",
      }),
    );

    const form = within(await screen.findByRole("form", { name: "题目表单" }));
    expect(form.getByLabelText("题干")).toHaveValue("待编辑题干");
    fireEvent.change(form.getByLabelText("题干"), {
      target: { value: "更新后的待编辑题干" },
    });
    fireEvent.click(form.getByRole("button", { name: "保存题目" }));

    expect(await screen.findByText("题目已保存")).toBeInTheDocument();
    const patchCalls = fetchMock.mock.calls.filter(
      ([requestUrl, init]) =>
        String(requestUrl) === "/api/v1/questions/question-edit-001" &&
        init?.method === "PATCH",
    );
    expect(patchCalls).toHaveLength(1);
    expect(JSON.parse(String(patchCalls[0]?.[1]?.body))).toMatchObject({
      status: "available",
      stemRichText: "更新后的待编辑题干",
    });
  });

  it("blocks a locked deep link and copies only after the explicit action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch({
      detailQuestion: {
        ...editableQuestion,
        isLocked: true,
        lockedAt: "2026-07-13T20:03:00.000Z",
      },
    });

    render(
      createElement(AdminQuestionEditorPage, {
        questionPublicId: "question-edit-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "题目已锁定" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "题目表单" })).toBeNull();
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "复制为新题并编辑" }));

    await waitFor(() =>
      expect(navigationReplace).toHaveBeenCalledWith(
        "/content/questions/question-copy-001/edit?returnTo=%2Fcontent%2Fquestions",
      ),
    );
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, init]) =>
          String(requestUrl) === "/api/v1/questions/question-edit-001/copy" &&
          init?.method === "POST",
      ),
    ).toHaveLength(1);
  });

  it("keeps the locked page recoverable when copy fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch({
      copyCode: 503202,
      detailQuestion: { ...editableQuestion, isLocked: true },
    });

    render(
      createElement(AdminQuestionEditorPage, {
        questionPublicId: "question-edit-001",
      }),
    );

    await screen.findByRole("heading", { name: "题目已锁定" });
    fireEvent.click(screen.getByRole("button", { name: "复制为新题并编辑" }));

    expect(await screen.findByText("题目复制失败")).toBeInTheDocument();
    expect(navigationReplace).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "复制为新题并编辑" }),
    ).toBeEnabled();
  });

  it("returns safely when a direct edit target is missing", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockQuestionEditorFetch({ detailQuestion: null });

    render(
      createElement(AdminQuestionEditorPage, {
        questionPublicId: "question-edit-001",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "未找到题目" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回题目列表" }));
    expect(navigationReplace).toHaveBeenCalledWith("/content/questions");
  });

  it("preserves authored input and blocks repeat PATCH after a lock race", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch({ patchCode: 409202 });

    render(
      createElement(AdminQuestionEditorPage, {
        questionPublicId: "question-edit-001",
      }),
    );

    const form = within(await screen.findByRole("form", { name: "题目表单" }));
    fireEvent.change(form.getByLabelText("题干"), {
      target: { value: "锁定冲突前的本地输入" },
    });
    fireEvent.click(form.getByRole("button", { name: "保存题目" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("题目保存冲突");
    expect(form.getByLabelText("题干")).toHaveValue("锁定冲突前的本地输入");
    expect(
      screen.getByRole("button", { name: "复制为新题并编辑" }),
    ).toBeInTheDocument();

    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: "复制为新题并编辑" }));
    expect(confirmMock).toHaveBeenCalledOnce();
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, init]) =>
          String(requestUrl).endsWith("/copy") && init?.method === "POST",
      ),
    ).toHaveLength(0);
    expect(form.getByLabelText("题干")).toHaveValue("锁定冲突前的本地输入");

    fireEvent.click(form.getByRole("button", { name: "保存题目" }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH"),
      ).toHaveLength(1),
    );
  });

  it("routes product list edit and successful copy to dedicated editors", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch({
      listQuestions: [editableQuestion],
    });

    render(
      createElement(AdminQuestionMaterialManagement, {
        questionEditorRoutesEnabled: true,
      }),
    );

    await screen.findByTestId("question-row-question-edit-001");
    fireEvent.click(screen.getByRole("button", { name: /编辑题目/ }));
    expect(navigationPush).toHaveBeenCalledWith(
      "/content/questions/question-edit-001/edit?returnTo=%2Fcontent%2Fquestions%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
    );

    fireEvent.click(screen.getByRole("button", { name: /复制题目/ }));
    await waitFor(() =>
      expect(navigationPush).toHaveBeenCalledWith(
        "/content/questions/question-copy-001/edit?returnTo=%2Fcontent%2Fquestions%3Fpage%3D1%26pageSize%3D20%26sortBy%3DupdatedAt%26sortOrder%3Ddesc",
      ),
    );
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, init]) =>
          String(requestUrl) === "/api/v1/questions/question-edit-001/copy" &&
          init?.method === "POST",
      ),
    ).toHaveLength(1);
  });

  it("redirects the existing AI formal-draft query entry into the canonical editor", async () => {
    await expect(
      QuestionsPage({
        searchParams: Promise.resolve({
          questionPublicId: "question-edit-001",
        }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(navigationRedirect).toHaveBeenCalledWith(
      "/content/questions/question-edit-001/edit?publishDraft=1",
    );
  });

  it("keeps explicit publish wording for an AI-adopted disabled draft", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockQuestionEditorFetch({
      detailQuestion: { ...editableQuestion, status: "disabled" },
    });

    render(
      createElement(AdminQuestionEditorPage, {
        publishDraft: true,
        questionPublicId: "question-edit-001",
      }),
    );

    const form = within(await screen.findByRole("form", { name: "题目表单" }));
    fireEvent.click(form.getByRole("button", { name: "发布为正式题目" }));

    expect(await screen.findByText("题目已发布")).toBeInTheDocument();
    const patchCalls = fetchMock.mock.calls.filter(
      ([requestUrl, init]) =>
        String(requestUrl) === "/api/v1/questions/question-edit-001" &&
        init?.method === "PATCH",
    );
    expect(patchCalls).toHaveLength(1);
    expect(JSON.parse(String(patchCalls[0]?.[1]?.body))).toMatchObject({
      status: "available",
    });
  });
});
