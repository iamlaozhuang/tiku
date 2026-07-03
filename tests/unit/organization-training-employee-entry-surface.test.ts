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
  organizationName: "营销一部",
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
  answerDeadlineAt: "2026-06-25T18:00:00.000Z",
  employeeAnswerStatus: "not_started",
  submittedScoreSummary: null,
  takenDownAt: null,
  takedownReason: null,
  questions: [
    {
      publicId: "organization-training-question-ui-001",
      sequenceNumber: 1,
      questionType: "single_choice",
      materialTitle: "客户服务场景",
      materialContent: "客户询问新品卷烟陈列位置时，需要先确认门店陈列规范。",
      stem: "接待客户咨询时，第一步应当怎么做？",
      options: [
        {
          publicId: "organization-training-option-ui-a",
          label: "A",
          content: "先确认客户诉求并核对门店陈列规范",
        },
        {
          publicId: "organization-training-option-ui-b",
          label: "B",
          content: "直接推荐库存最多的商品",
        },
      ],
      score: 4,
    },
    {
      publicId: "organization-training-question-ui-002",
      sequenceNumber: 2,
      questionType: "short_answer",
      materialTitle: null,
      materialContent: null,
      stem: "请写出一次门店服务复盘中需要记录的两个要点。",
      options: [],
      score: 6,
    },
  ],
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
  answerItems: [
    {
      questionPublicId: "organization-training-question-ui-001",
      selectedOptionPublicIds: ["organization-training-option-ui-a"],
      textAnswer: null,
    },
    {
      questionPublicId: "organization-training-question-ui-002",
      selectedOptionPublicIds: [],
      textAnswer: "记录客户诉求和服务改进动作。",
    },
  ],
  questionResults: [],
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
      await screen.findByRole("heading", { name: "企业训练" }),
    ).toBeInTheDocument();
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

  it("loads visible trainings and runs draft-save, submit, and result summary through session runtime", async () => {
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
                questionResults: [
                  {
                    questionPublicId: "organization-training-question-ui-001",
                    score: 4,
                    maxScore: 4,
                    standardAnswer: "A",
                    analysis: "服务类题目应先确认客户诉求，再按门店规范处理。",
                    scoringPointResults: [],
                  },
                  {
                    questionPublicId: "organization-training-question-ui-002",
                    score: 3,
                    maxScore: 6,
                    standardAnswer: "客户诉求、处理动作、复盘改进。",
                    analysis: "复盘记录需要同时覆盖事实和改进动作。",
                    scoringPointResults: [
                      {
                        label: "记录客户诉求",
                        score: 2,
                        maxScore: 3,
                        reason: "已覆盖客户诉求，但缺少完整场景。",
                      },
                    ],
                  },
                ],
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
                questionResults: [
                  {
                    questionPublicId: "organization-training-question-ui-001",
                    score: 4,
                    maxScore: 4,
                    standardAnswer: "A",
                    analysis: "服务类题目应先确认客户诉求，再按门店规范处理。",
                    scoringPointResults: [],
                  },
                  {
                    questionPublicId: "organization-training-question-ui-002",
                    score: 3,
                    maxScore: 6,
                    standardAnswer: "客户诉求、处理动作、复盘改进。",
                    analysis: "复盘记录需要同时覆盖事实和改进动作。",
                    scoringPointResults: [
                      {
                        label: "记录客户诉求",
                        score: 2,
                        maxScore: 3,
                        reason: "已覆盖客户诉求，但缺少完整场景。",
                      },
                    ],
                  },
                ],
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

    expect(screen.getByText("正在加载企业训练")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "企业训练" }),
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
    expect(within(row).getByText("卷烟营销")).toBeInTheDocument();
    expect(within(row).getByText("3 级")).toBeInTheDocument();
    expect(within(row).getByText("理论")).toBeInTheDocument();
    expect(within(row).getByText("营销一部")).toBeInTheDocument();
    expect(within(row).getByText("第 1 版")).toBeInTheDocument();
    expect(within(row).getByText("共 5 题")).toBeInTheDocument();
    expect(within(row).getByText("截止 2026-06-25")).toBeInTheDocument();
    expect(within(row).getByText("未开始")).toBeInTheDocument();
    expect(
      within(row).getByRole("group", { name: "企业训练作答区" }),
    ).toBeInTheDocument();
    expect(within(row).getByText("客户服务场景")).toBeInTheDocument();
    expect(
      within(row).getByText("接待客户咨询时，第一步应当怎么做？"),
    ).toBeInTheDocument();
    expect(
      within(row).getByText("请写出一次门店服务复盘中需要记录的两个要点。"),
    ).toBeInTheDocument();
    expect(within(row).queryByLabelText("完成题数")).toBeNull();
    expect(within(row).queryByLabelText("得分")).toBeNull();
    expect(within(row).queryByLabelText("总分")).toBeNull();
    expect(document.body.textContent).not.toContain(
      "organization-training-version-ui-001",
    );

    fireEvent.click(
      within(row).getByLabelText("A. 先确认客户诉求并核对门店陈列规范"),
    );
    fireEvent.change(within(row).getByLabelText("第 2 题作答"), {
      target: { value: "记录客户诉求和服务改进动作。" },
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
      answeredQuestionCount: 2,
      answerItems: [
        {
          questionPublicId: "organization-training-question-ui-001",
          selectedOptionPublicIds: ["organization-training-option-ui-a"],
          textAnswer: null,
        },
        {
          questionPublicId: "organization-training-question-ui-002",
          selectedOptionPublicIds: [],
          textAnswer: "记录客户诉求和服务改进动作。",
        },
      ],
    });

    fireEvent.click(within(row).getByRole("button", { name: "提交" }));
    expect(
      within(row).getByRole("group", { name: "企业训练提交确认" }),
    ).toBeInTheDocument();
    fireEvent.click(within(row).getByRole("button", { name: "确认提交" }));

    expect(await screen.findByText("提交成功")).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/organization-trainings/organization-training-version-ui-001/employee-answers/submit",
        "POST",
      ),
    ).toMatchObject({
      trainingVersionPublicId: "organization-training-version-ui-001",
      answeredQuestionCount: 2,
      answerItems: [
        {
          questionPublicId: "organization-training-question-ui-001",
          selectedOptionPublicIds: ["organization-training-option-ui-a"],
          textAnswer: null,
        },
        {
          questionPublicId: "organization-training-question-ui-002",
          selectedOptionPublicIds: [],
          textAnswer: "记录客户诉求和服务改进动作。",
        },
      ],
      scoreSummary: {
        score: 0,
        totalScore: 10,
      },
    });

    fireEvent.click(within(row).getByRole("button", { name: "查看结果" }));

    expect(await screen.findByText("结果 4 / 5")).toBeInTheDocument();
    expect(await screen.findByText("我的答案")).toBeInTheDocument();
    expect(
      screen.getAllByText("记录客户诉求和服务改进动作。").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("标准答案：A")).toBeInTheDocument();
    expect(
      screen.getByText("服务类题目应先确认客户诉求，再按门店规范处理。"),
    ).toBeInTheDocument();
    expect(screen.getByText("记录客户诉求：2 / 3")).toBeInTheDocument();
    expect(
      screen.getByText("已覆盖客户诉求，但缺少完整场景。"),
    ).toBeInTheDocument();
    expect(await screen.findByText("结果已加载")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-student-token");
    expect(document.body.textContent).not.toContain("9901");
    expect(document.body.textContent).not.toContain("standardAnswer");
    expect(document.body.textContent).not.toContain("rawAnswer");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });
});
