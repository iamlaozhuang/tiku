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

import StudentOrganizationTrainingRoutePage from "@/app/(student)/organization-training/page";
import { StudentOrganizationTrainingPage } from "@/features/student/organization-training/StudentOrganizationTrainingPage";
import { COOKIE_BACKED_SESSION_MARKER } from "@/features/student/studentRuntimeApi";

const visibleVersion = {
  publicId: "organization-training-version-ui-001",
  draftPublicId: "organization-training-draft-ui-001",
  versionNumber: 1,
  organizationPublicId: "organization-employee-scope-001",
  publishScopeSnapshot: {
    organizationPublicIds: ["organization-employee-scope-001"],
    capturedAt: "2026-06-18T08:00:00.000Z",
  },
  profession: "marketing",
  level: 3,
  subject: "theory",
  title: "门店服务训练",
  description: "只展示作答摘要",
  questionCount: 5,
  totalScore: 10,
  status: "published",
  publishedAt: "2026-06-18T08:00:00.000Z",
  takenDownAt: null,
  takedownReason: null,
  id: 8801,
};

const draftAnswer = {
  publicId: "organization-training-answer-ui-001",
  trainingVersionPublicId: "organization-training-version-ui-001",
  employeePublicId: "employee-ui-001",
  organizationPublicId: "organization-employee-scope-001",
  answerOrganizationSnapshot: {
    organizationPublicIds: ["organization-employee-scope-001"],
    capturedAt: "2026-06-18T08:05:00.000Z",
  },
  answerStatus: "draft_saved",
  scoreSummary: null,
  submittedAt: null,
  resultSummaryVisible: false,
  id: 9901,
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

describe("StudentOrganizationTrainingPage", () => {
  it("is wired as the student organization training route page", () => {
    expect(StudentOrganizationTrainingRoutePage()).toEqual(
      createElement(StudentOrganizationTrainingPage),
    );
  });

  it("renders authorization state after the cookie-backed session probe fails when the student token is missing", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/organization-trainings/visible-list");
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        return createJsonResponse({
          code: 401001,
          message: "User session is required.",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentOrganizationTrainingPage));

    expect(await screen.findByText("请先登录")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads visible trainings through the cookie-backed session marker without a bearer header", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      COOKIE_BACKED_SESSION_MARKER,
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/organization-trainings/visible-list");
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { versions: [visibleVersion] },
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentOrganizationTrainingPage));

    expect(
      await screen.findByRole("heading", { name: "组织培训作答" }),
    ).toBeInTheDocument();
    expect(screen.getByText("企业训练")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("Organization Training");
    expect(
      screen.getByTestId(
        "organization-training-row-organization-training-version-ui-001",
      ),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      COOKIE_BACKED_SESSION_MARKER,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows a readable Chinese unavailable state for employees outside advanced organization training scope", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toBe("/api/v1/organization-trainings/visible-list");

      return createJsonResponse({
        code: 403076,
        message: "Organization training is unavailable.",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentOrganizationTrainingPage));

    const unavailableState = await screen.findByRole("alert");
    expect(unavailableState).toHaveTextContent("当前授权暂未开放企业训练");
    expect(unavailableState).toHaveTextContent(
      "请确认员工账号已绑定有效的组织高级授权范围",
    );
    expect(document.body.textContent).not.toContain("\\u");
    expect(document.body.textContent).not.toContain("Organization Training");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads visible trainings and runs draft-save, submit, and readonly-summary through session runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-student-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        const method = init?.method ?? "GET";

        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-student-token",
        });

        if (
          path === "/api/v1/organization-trainings/visible-list" &&
          method === "GET"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { versions: [visibleVersion] },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/draft-save" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { answer: draftAnswer },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/submit" &&
          method === "POST"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              answer: {
                ...draftAnswer,
                answerStatus: "submitted",
                scoreSummary: {
                  score: 4,
                  totalScore: 5,
                },
                submittedAt: "2026-06-18T08:10:00.000Z",
                resultSummaryVisible: true,
              },
            },
          });
        }

        if (
          path ===
            "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/readonly-summary" &&
          method === "GET"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              answer: {
                ...draftAnswer,
                answerStatus: "read_only",
                scoreSummary: {
                  score: 4,
                  totalScore: 5,
                },
                submittedAt: "2026-06-18T08:10:00.000Z",
                resultSummaryVisible: true,
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

    render(createElement(StudentOrganizationTrainingPage));

    expect(screen.getByText("正在加载组织培训")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "组织培训作答" }),
    ).toBeInTheDocument();
    const row = screen.getByTestId(
      "organization-training-row-organization-training-version-ui-001",
    );
    expect(row).toHaveAttribute(
      "data-public-id",
      "organization-training-version-ui-001",
    );
    expect(row).not.toHaveAttribute("data-id");
    expect(within(row).getByText("门店服务训练")).toBeInTheDocument();

    fireEvent.change(within(row).getByLabelText("已答题数"), {
      target: { value: "3" },
    });
    fireEvent.click(within(row).getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByText("草稿已保存")).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/draft-save",
        "POST",
      ),
    ).toMatchObject({
      trainingVersionPublicId: "organization-training-version-ui-001",
      answeredQuestionCount: 3,
    });

    fireEvent.change(within(row).getByLabelText("得分"), {
      target: { value: "4" },
    });
    fireEvent.change(within(row).getByLabelText("总分"), {
      target: { value: "5" },
    });
    fireEvent.click(within(row).getByRole("button", { name: "提交" }));

    expect(await screen.findByText("提交成功")).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/submit",
        "POST",
      ),
    ).toMatchObject({
      trainingVersionPublicId: "organization-training-version-ui-001",
      answeredQuestionCount: 3,
      scoreSummary: {
        score: 4,
        totalScore: 5,
      },
    });

    fireEvent.click(within(row).getByRole("button", { name: "查看结果" }));

    expect(await screen.findByText("结果 4 / 5")).toBeInTheDocument();
    expect(
      await screen.findByText("readonly-summary 已加载"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-student-token");
    expect(document.body.textContent).not.toContain("9901");
    expect(document.body.textContent).not.toContain("standardAnswer");
    expect(document.body.textContent).not.toContain("rawAnswer");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });
});
