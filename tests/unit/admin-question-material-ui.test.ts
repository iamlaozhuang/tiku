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

import { AdminQuestionMaterialManagement as AdminQuestionMaterialManagementBaseline } from "@/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement";
import { AdminQuestionMaterialManagement } from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-content",
      phone: "13900000001",
      name: "Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-content-public-001",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const questionPayload = {
  code: 0,
  message: "ok",
  data: [
    {
      publicId: "question-marketing-001",
      questionType: "single_choice",
      profession: "marketing",
      level: 3,
      subject: "theory",
      stemRichText: "市场调研抽样方法的核心目标是什么？",
      analysisRichText: "抽样方法需要确保样本代表目标总体。",
      standardAnswerRichText: "A",
      status: "available",
      isLocked: false,
      lockedAt: null,
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: "material-marketing-001",
      questionOptions: [
        {
          label: "A",
          contentRichText: "提高样本代表性",
          isCorrect: true,
          sortOrder: 1,
        },
        {
          label: "B",
          contentRichText: "降低样本代表性",
          isCorrect: false,
          sortOrder: 2,
        },
      ],
      scoringPoints: [],
      knowledgeNodePublicIds: ["knowledge-node-sampling"],
      tagPublicIds: ["tag-research"],
      createdAt: "2026-05-19T06:20:00.000Z",
      updatedAt: "2026-05-19T06:20:00.000Z",
      id: 101,
    },
    {
      publicId: "question-logistics-002",
      questionType: "short_answer",
      profession: "logistics",
      level: 2,
      subject: "skill",
      stemRichText: "物流成本核算适用于哪类场景？",
      analysisRichText: "物流成本核算用于评估运输、仓储和配送成本。",
      standardAnswerRichText: "适用于运输、仓储、配送等成本分析场景。",
      status: "disabled",
      isLocked: true,
      lockedAt: "2026-05-18T08:00:00.000Z",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "ai_scoring",
      materialPublicId: null,
      questionOptions: [],
      scoringPoints: [],
      knowledgeNodePublicIds: ["knowledge-node-costing"],
      tagPublicIds: [],
      createdAt: "2026-05-18T05:10:00.000Z",
      updatedAt: "2026-05-19T03:10:00.000Z",
      id: 102,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

const caseAnalysisQuestionPayload = {
  ...questionPayload.data[0],
  publicId: "question-case-analysis-001",
  questionType: "case_analysis",
  profession: "logistics",
  level: 4,
  subject: "skill",
  stemRichText: "Synthetic case_analysis stem",
  analysisRichText: "Synthetic case_analysis analysis",
  standardAnswerRichText: "Synthetic case_analysis reference",
  scoringMethod: "ai_scoring",
  materialPublicId: "material-marketing-001",
  questionOptions: [],
  scoringPoints: [
    {
      description: "Synthetic case_analysis scoring_point",
      score: "2.0",
      sortOrder: 1,
    },
  ],
  knowledgeNodePublicIds: ["knowledge-node-case-analysis"],
  tagPublicIds: ["tag-case-analysis"],
  createdAt: "2026-05-19T06:25:00.000Z",
  updatedAt: "2026-05-19T06:25:00.000Z",
};

const calculationQuestionPayload = {
  ...questionPayload.data[0],
  publicId: "question-calculation-001",
  questionType: "calculation",
  profession: "logistics",
  level: 4,
  subject: "skill",
  stemRichText: "Synthetic calculation stem",
  analysisRichText: "Synthetic calculation analysis",
  standardAnswerRichText: "Synthetic calculation reference",
  scoringMethod: "ai_scoring",
  materialPublicId: "material-marketing-001",
  questionOptions: [],
  scoringPoints: [
    {
      description: "Synthetic calculation scoring_point",
      score: "2.0",
      sortOrder: 1,
    },
  ],
  knowledgeNodePublicIds: ["knowledge-node-calculation"],
  tagPublicIds: ["tag-calculation"],
  createdAt: "2026-05-19T06:26:00.000Z",
  updatedAt: "2026-05-19T06:26:00.000Z",
};

const materialPayload = {
  code: 0,
  message: "ok",
  data: [
    {
      publicId: "material-marketing-001",
      title: "营销案例材料 A",
      contentRichText: "某品牌计划进入区域市场，需要完成消费者抽样调研。",
      profession: "marketing",
      level: 3,
      subject: "theory",
      status: "available",
      isLocked: false,
      lockedAt: null,
      references: {
        questions: [
          {
            questionPublicId: "question-marketing-001",
            questionType: "single_choice",
            status: "available",
            updatedAt: "2026-05-19T06:20:00.000Z",
          },
        ],
        papers: [
          {
            paperPublicId: "paper-material-ref-001",
            name: "Material reference paper",
            paperStatus: "published",
            updatedAt: "2026-05-19T08:00:00.000Z",
          },
        ],
      },
      createdAt: "2026-05-19T06:00:00.000Z",
      updatedAt: "2026-05-19T06:00:00.000Z",
      id: 201,
    },
    {
      publicId: "material-locked-002",
      title: "已锁定物流材料 B",
      contentRichText: "已发布试卷快照引用的材料正文。",
      profession: "logistics",
      level: 2,
      subject: "skill",
      status: "available",
      isLocked: true,
      lockedAt: "2026-05-19T07:00:00.000Z",
      references: {
        questions: [],
        papers: [],
      },
      createdAt: "2026-05-19T05:00:00.000Z",
      updatedAt: "2026-05-19T07:00:00.000Z",
      id: 202,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

const knowledgeNodeOptionPayload = {
  code: 0,
  message: "ok",
  data: {
    knowledgeNodes: [
      {
        publicId: "knowledge-node-sampling",
        knStatus: "active",
        name: "Sampling",
        pathName: "Marketing / Research / Sampling",
      },
      {
        publicId: "knowledge-node-costing",
        knStatus: "active",
        name: "Costing",
        pathName: "Logistics / Costing",
      },
      {
        publicId: "knowledge-node-retail",
        knStatus: "active",
        name: "Retail",
        pathName: "Marketing / Retail",
      },
      {
        publicId: "knowledge-node-price",
        knStatus: "active",
        name: "Pricing",
        pathName: "Marketing / Pricing",
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 4,
    sortBy: "sortOrder",
    sortOrder: "asc",
  },
};

const tagOptionPayload = {
  code: 0,
  message: "ok",
  data: {
    tags: [
      { publicId: "tag-research", name: "Research" },
      { publicId: "tag-compliance", name: "Compliance" },
    ],
  },
};

const marketingQuestionReadableName =
  "单选题 市场调研抽样方法的核心目标是什么？";
const logisticsQuestionReadableName = "简答题 物流成本核算适用于哪类场景？";
const marketingMaterialReadableName = "营销案例材料 A（可用）";
const lockedMaterialReadableName = "已锁定物流材料 B（可用）";

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createDeferred<TValue>() {
  let resolve!: (value: TValue | PromiseLike<TValue>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function createQuestionListPayload(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  return {
    ...questionPayload,
    data,
    pagination: {
      ...questionPayload.pagination,
      total: data.length,
    },
  };
}

function mockContentFetch(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/questions?")) {
      const searchParams = new URL(path, "http://localhost").searchParams;
      const filteredData = data.filter((question) => {
        const keyword = searchParams.get("keyword")?.toLowerCase();
        const knowledgeNodePublicIds =
          question.knowledgeNodePublicIds as string[];
        const tagPublicIds = question.tagPublicIds as string[];

        return (
          (keyword === undefined ||
            [question.publicId, question.stemRichText]
              .join(" ")
              .toLowerCase()
              .includes(keyword)) &&
          (searchParams.get("profession") === null ||
            question.profession === searchParams.get("profession")) &&
          (searchParams.get("subject") === null ||
            question.subject === searchParams.get("subject")) &&
          (searchParams.get("level") === null ||
            String(question.level) === searchParams.get("level")) &&
          (searchParams.get("status") === null ||
            question.status === searchParams.get("status")) &&
          (searchParams.get("questionType") === null ||
            question.questionType === searchParams.get("questionType")) &&
          (searchParams.get("knowledgeNodePublicId") === null ||
            knowledgeNodePublicIds.includes(
              searchParams.get("knowledgeNodePublicId")!,
            )) &&
          (searchParams.get("tagPublicId") === null ||
            tagPublicIds.includes(searchParams.get("tagPublicId")!))
        );
      });

      return createJsonResponse(createQuestionListPayload(filteredData));
    }

    if (path.startsWith("/api/v1/materials?")) {
      const searchParams = new URL(path, "http://localhost").searchParams;
      const filteredMaterials = materialPayload.data.filter((material) => {
        const keyword = searchParams.get("keyword")?.toLowerCase();

        return (
          (keyword === undefined ||
            [material.title, material.contentRichText]
              .join(" ")
              .toLowerCase()
              .includes(keyword)) &&
          (searchParams.get("profession") === null ||
            material.profession === searchParams.get("profession")) &&
          (searchParams.get("subject") === null ||
            material.subject === searchParams.get("subject")) &&
          (searchParams.get("level") === null ||
            String(material.level) === searchParams.get("level")) &&
          (searchParams.get("status") === null ||
            material.status === searchParams.get("status"))
        );
      });

      return createJsonResponse({
        ...materialPayload,
        data: filteredMaterials,
        pagination: {
          ...materialPayload.pagination,
          total: filteredMaterials.length,
        },
      });
    }

    if (path.startsWith("/api/v1/knowledge-nodes?")) {
      return createJsonResponse(knowledgeNodeOptionPayload);
    }

    if (path === "/api/v1/tags") {
      return createJsonResponse(tagOptionPayload);
    }

    if (path === "/api/v1/questions/question-marketing-001") {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: { question: questionPayload.data[0] },
      });
    }

    if (path === "/api/v1/materials/material-marketing-001") {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: { material: materialPayload.data[0] },
      });
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockWritableContentFetch(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);
      const method = init?.method ?? "GET";

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/questions?")) {
        return createJsonResponse(createQuestionListPayload(data));
      }

      if (path.startsWith("/api/v1/materials?")) {
        return createJsonResponse(materialPayload);
      }

      if (path.startsWith("/api/v1/knowledge-nodes?")) {
        return createJsonResponse(knowledgeNodeOptionPayload);
      }

      if (path === "/api/v1/tags") {
        return createJsonResponse(tagOptionPayload);
      }

      if (path === "/api/v1/content-images" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            contentImage: {
              publicId: "content-image-uploaded-001",
              contentType: "image/png",
              fileSizeByte: 3,
              createdAt: "2026-07-21T00:00:00.000Z",
              url: "/api/v1/content-images/content-image-uploaded-001",
            },
          },
        });
      }

      if (path === "/api/v1/questions" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              publicId: "question-created-001",
              stemRichText: "新建题目题干",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001" &&
        method === "PATCH"
      ) {
        const requestBody =
          init?.body === undefined
            ? {}
            : (JSON.parse(String(init.body)) as Record<string, unknown>);

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              stemRichText: "编辑后的题干",
              knowledgeNodePublicIds: Array.isArray(
                requestBody.knowledgeNodePublicIds,
              )
                ? requestBody.knowledgeNodePublicIds
                : questionPayload.data[0].knowledgeNodePublicIds,
              tagPublicIds: Array.isArray(requestBody.tagPublicIds)
                ? requestBody.tagPublicIds
                : questionPayload.data[0].tagPublicIds,
              updatedAt: "2026-05-19T06:30:00.000Z",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001/disable" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              status: "disabled",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001/copy" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              publicId: "question-marketing-001-copy",
            },
          },
        });
      }

      if (
        path ===
          "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes" &&
        method === "POST"
      ) {
        const requestBody =
          init?.body === undefined
            ? null
            : (JSON.parse(String(init.body)) as Record<string, unknown>);
        const isConfirmed = requestBody?.action === "confirm";
        const isIgnored = requestBody?.action === "ignore";
        const selectedCandidatePublicIds = new Set(
          Array.isArray(requestBody?.candidatePublicIds)
            ? requestBody.candidatePublicIds.filter(
                (publicId): publicId is string => typeof publicId === "string",
              )
            : [],
        );
        const resolveConfirmationStatus = (candidatePublicId: string) =>
          isConfirmed
            ? selectedCandidatePublicIds.has(candidatePublicId)
              ? "confirmed"
              : "ignored"
            : isIgnored && selectedCandidatePublicIds.has(candidatePublicId)
              ? "ignored"
              : "pending_confirmation";

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            recommendation: {
              questionPublicId: "question-marketing-001",
              recommendationStatus: "recommended",
              reviewState: {
                questionUpdatedAt: "2026-05-19T06:20:00.000Z",
                currentQuestionUpdatedAt: "2026-05-19T06:20:00.000Z",
                taskPublicId: "kn-recommendation-task-public-001",
                taskStatus: "succeeded",
                staleCheck: "question_updated_at_mismatch",
                bindingMode: "durable_question_binding",
              },
              recommendations: [
                {
                  candidatePublicId: "kn-recommendation-candidate-public-001",
                  knowledgeNodePublicId: "knowledge-node-sampling-v2",
                  name: "Sampling v2",
                  pathName: "Marketing / Research / Sampling v2",
                  confidence: "high",
                  reason: "bounded local fixture reason",
                  source: "ai_recommended",
                  confirmationStatus: resolveConfirmationStatus(
                    "kn-recommendation-candidate-public-001",
                  ),
                  confidenceBasisPoint: 9_000,
                  citationCount: 2,
                },
                {
                  candidatePublicId: "kn-recommendation-candidate-public-002",
                  knowledgeNodePublicId: "knowledge-node-segmentation",
                  name: "Segmentation",
                  pathName: "Marketing / Research / Segmentation",
                  confidence: "low",
                  reason: "bounded local fallback reason",
                  source: "ai_recommended",
                  confirmationStatus: resolveConfirmationStatus(
                    "kn-recommendation-candidate-public-002",
                  ),
                  confidenceBasisPoint: 4_000,
                  citationCount: 1,
                },
                {
                  candidatePublicId: "kn-recommendation-candidate-public-003",
                  knowledgeNodePublicId: "knowledge-node-unreadable-marker",
                  name: "",
                  pathName: "",
                  confidence: "medium",
                  reason: "bounded incomplete recommendation fixture",
                  source: "ai_recommended",
                  confirmationStatus: resolveConfirmationStatus(
                    "kn-recommendation-candidate-public-003",
                  ),
                  confidenceBasisPoint: 6_000,
                  citationCount: 1,
                },
              ],
              evidenceStatus: "sufficient",
              modelConfig: {
                modelConfigPublicId: "model-config-dev-kn-recommendation",
                promptTemplatePublicId:
                  "prompt-template-kn-recommendation-public-001",
              },
              failureReason: null,
            },
          },
        });
      }

      if (path === "/api/v1/materials" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              publicId: "material-created-001",
              title: "新建案例材料",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001" &&
        method === "PATCH"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              title: "编辑后的材料",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001/disable" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              status: "disabled",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001/copy" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              publicId: "material-marketing-001-copy",
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

  return fetchMock;
}

function readJsonRequestBody(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
  method: string,
) {
  const matchedCall = fetchMock.mock.calls
    .filter(
      ([requestUrl, requestInit]) =>
        String(requestUrl) === path &&
        requestInit?.method === method &&
        typeof requestInit.body === "string",
    )
    .at(-1);

  expect(matchedCall).toBeDefined();

  const requestBody = matchedCall?.[1]?.body;

  expect(typeof requestBody).toBe("string");

  return JSON.parse(String(requestBody)) as Record<string, unknown>;
}

function expectAdminFetchAuthorization(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
) {
  const matchedCall = fetchMock.mock.calls.find(
    ([requestUrl]) => String(requestUrl) === path,
  );

  expect(matchedCall).toBeDefined();
  expect(new Headers(matchedCall?.[1]?.headers).get("authorization")).toBe(
    "Bearer unit-test-admin-token",
  );
}

function fillRequiredQuestionClassification(
  questionForm: ReturnType<typeof within>,
) {
  fireEvent.change(questionForm.getByLabelText("专业"), {
    target: { value: "marketing" },
  });
  fireEvent.change(questionForm.getByLabelText("等级"), {
    target: { value: "3" },
  });
  fireEvent.change(questionForm.getByLabelText("科目"), {
    target: { value: "theory" },
  });
}

function fillNewSingleChoiceStructure(questionForm: ReturnType<typeof within>) {
  fireEvent.change(questionForm.getByLabelText("题型"), {
    target: { value: "single_choice" },
  });
  fillRequiredQuestionClassification(questionForm);
  fireEvent.change(questionForm.getByLabelText("选项 A"), {
    target: { value: "候选项 A" },
  });
  fireEvent.change(questionForm.getByLabelText("选项 B"), {
    target: { value: "候选项 B" },
  });
  fireEvent.click(questionForm.getByLabelText("选项 A 正确"));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminQuestionMaterialManagement", () => {
  it("uses readable question context and business-name binding selectors", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    const questionName = marketingQuestionReadableName;
    expect(
      await screen.findByRole("button", { name: `查看题目 ${questionName}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `编辑题目 ${questionName}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `复制题目 ${questionName}` }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: `编辑题目 ${questionName}` }),
    );
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    expect(questionForm.getByLabelText("题型").closest("form")).toHaveAttribute(
      "data-admin-form-dirty-state",
      "clean",
    );
    expect(
      questionForm.getByText(/题型、专业、等级、科目/),
    ).toBeInTheDocument();

    expect(questionForm.getByLabelText("关联材料")).toHaveValue(
      "material-marketing-001",
    );
    expect(
      await questionForm.findByRole("checkbox", {
        name: "Marketing / Research / Sampling",
      }),
    ).toBeChecked();
    expect(
      await questionForm.findByRole("checkbox", { name: "Research" }),
    ).toBeChecked();
    expect(questionForm.getByLabelText("搜索知识点")).toBeInTheDocument();
    expect(questionForm.getByLabelText("搜索标签")).toBeInTheDocument();
    expect(questionForm.getByText("营销案例材料 A")).toBeInTheDocument();
    expect(questionForm.queryByText("knowledge-node-sampling")).toBeNull();
    expect(questionForm.queryByText("tag-research")).toBeNull();
  });

  it("searches and paginates question references on the server while hydrating current bindings exactly", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();
    const defaultFetchImplementation = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url, init) => {
      const parsedUrl = new URL(String(url), "http://localhost");
      if (
        parsedUrl.pathname === "/api/v1/materials" &&
        parsedUrl.searchParams.get("keyword") === "第 101 份材料"
      ) {
        return createJsonResponse({
          ...materialPayload,
          data: [
            {
              ...materialPayload.data[0],
              publicId: "material-public-101",
              title: "第 101 份材料",
            },
          ],
          pagination: { ...materialPayload.pagination, total: 101 },
        });
      }
      if (
        parsedUrl.pathname === "/api/v1/knowledge-nodes" &&
        parsedUrl.searchParams.get("keyword") === "第 101 个知识点"
      ) {
        return createJsonResponse({
          ...knowledgeNodeOptionPayload,
          data: {
            knowledgeNodes: [
              {
                ...knowledgeNodeOptionPayload.data.knowledgeNodes[0],
                publicId: "knowledge-node-public-101",
                name: "第 101 个知识点",
                pathName: "营销 / 第 101 个知识点",
              },
            ],
          },
          pagination: { ...knowledgeNodeOptionPayload.pagination, total: 101 },
        });
      }
      return defaultFetchImplementation!(url, init);
    });

    render(createElement(AdminQuestionMaterialManagement));
    const questionName = marketingQuestionReadableName;
    fireEvent.click(
      await screen.findByRole("button", { name: `编辑题目 ${questionName}` }),
    );
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));

    expect(await questionForm.findByLabelText("搜索材料")).toBeInTheDocument();
    fireEvent.change(questionForm.getByLabelText("搜索材料"), {
      target: { value: "第 101 份材料" },
    });
    fireEvent.change(questionForm.getByLabelText("搜索知识点"), {
      target: { value: "第 101 个知识点" },
    });

    await waitFor(() => {
      const urls = fetchMock.mock.calls.map(([url]) => String(url));
      const parsedUrls = urls
        .filter((url) => url.includes("?"))
        .map((url) => new URL(url, "http://localhost"));
      expect(
        parsedUrls.some(
          (url) =>
            url.pathname === "/api/v1/materials" &&
            url.searchParams.get("keyword") === "第 101 份材料" &&
            url.searchParams.get("page") === "1" &&
            url.searchParams.get("pageSize") === "20",
        ),
      ).toBe(true);
      expect(
        parsedUrls.some(
          (url) =>
            url.pathname === "/api/v1/knowledge-nodes" &&
            url.searchParams.get("keyword") === "第 101 个知识点" &&
            url.searchParams.get("page") === "1" &&
            url.searchParams.get("pageSize") === "20",
        ),
      ).toBe(true);
      expect(
        parsedUrls.some(
          (url) =>
            url.pathname === "/api/v1/materials" &&
            url.searchParams.get("publicId") === "material-marketing-001",
        ),
      ).toBe(true);
      expect(
        parsedUrls.some(
          (url) =>
            url.pathname === "/api/v1/knowledge-nodes" &&
            url.searchParams.get("publicId") === "knowledge-node-sampling",
        ),
      ).toBe(true);
    });
    expect(
      questionForm.getByRole("option", { name: "第 101 份材料" }),
    ).toBeInTheDocument();
    expect(
      questionForm.getByRole("checkbox", { name: "营销 / 第 101 个知识点" }),
    ).toBeInTheDocument();
    expect(
      within(questionForm.getByRole("group", { name: "知识点" })).getByRole(
        "button",
        { name: "下一页" },
      ),
    ).toBeEnabled();
    expect(questionForm.queryByText("绑定项不可用")).toBeNull();
  });

  it("uses material titles and statuses to name repeated material actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    const materialName = marketingMaterialReadableName;
    expect(
      await screen.findByRole("button", { name: `查看材料 ${materialName}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `编辑材料 ${materialName}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `复制材料 ${materialName}` }),
    ).toBeInTheDocument();
  });

  it("renders unauthorized state without calling protected content APIs when the local session token is missing", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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

    render(createElement(AdminQuestionMaterialManagement));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/login");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("loads question management through the protected runtime with filters and safe actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    expect(screen.getByText("正在加载题库数据")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-admin-async-state",
      "initial-loading",
    );
    expect(
      await screen.findByRole("heading", { name: "题库与材料管理" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "题目" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "题目" })).toHaveClass(
      "active:scale-[0.98]",
    );
    expect(screen.getByRole("tab", { name: "材料" })).toHaveClass(
      "active:scale-[0.98]",
    );
    const lifecycleBand = screen.getByTestId(
      "question-material-lifecycle-context-band",
    );

    expect(lifecycleBand).toHaveTextContent("内容生命周期");
    expect(lifecycleBand).toHaveTextContent("题库题目");
    expect(lifecycleBand).toHaveTextContent("可编辑 1");
    expect(lifecycleBand).toHaveTextContent("已停用 1");
    expect(lifecycleBand).toHaveTextContent("锁定 1");
    expect(lifecycleBand).toHaveTextContent("待审 AI 题目需先创建内容草稿");
    expect(screen.getByRole("button", { name: "新建题目" })).toBeEnabled();
    expect(
      screen.getByTestId("content-action-runtime-ready"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `编辑题目 ${marketingQuestionReadableName}`,
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: `停用题目 ${marketingQuestionReadableName}`,
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: `复制题目 ${marketingQuestionReadableName}`,
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: `查看题目 ${marketingQuestionReadableName}`,
      }),
    ).toBeEnabled();

    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).toHaveAttribute("data-public-id", "question-marketing-001");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expectAdminFetchAuthorization(
      fetchMock,
      "/api/v1/questions?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
    );
  });

  it("opens and closes a question detail drawer while preserving list query state", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    window.history.replaceState(
      null,
      "",
      "/content/questions?profession=marketing&page=2",
    );
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    fireEvent.click(
      await screen.findByRole("button", {
        name: `查看题目 ${marketingQuestionReadableName}`,
      }),
    );
    expect(
      await screen.findByRole("dialog", { name: "题目详情" }),
    ).toBeInTheDocument();
    expect(window.location.search).toContain("profession=marketing");
    expect(window.location.search).toContain(
      "questionDetail=question-marketing-001",
    );

    fireEvent.click(screen.getByRole("button", { name: "关闭题目详情" }));
    expect(screen.queryByRole("dialog", { name: "题目详情" })).toBeNull();
    expect(window.location.search).toContain("profession=marketing");
    expect(window.location.search).not.toContain("questionDetail");
  });

  it("restores a material detail drawer from the route query", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    window.history.replaceState(
      null,
      "",
      "/content/materials?materialDetail=material-marketing-001",
    );
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    expect(
      await screen.findByRole("dialog", { name: "材料详情" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("营销案例材料 A").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(window.location.search).toContain(
      "materialDetail=material-marketing-001",
    );
  });

  it("opens a question draft edit entry from a public id query target", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        initialQuestionPublicId: "question-marketing-001",
      }),
    );

    expect(
      await screen.findByText(
        `已定位待审题目草稿 ${marketingQuestionReadableName}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("content-edit-context-label")).toHaveTextContent(
      "编辑题目",
    );
    expect(screen.getByTestId("content-edit-context-panel")).toHaveTextContent(
      "正在编辑所选内容",
    );
    expect(
      screen.getByTestId("content-edit-context-panel"),
    ).not.toHaveTextContent("question-marketing-001");
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("keyword=question-marketing-001"),
      ),
    ).toBe(true);
  });

  it("publishes a disabled AI question draft opened from a public id query target", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch([
      {
        ...questionPayload.data[0],
        status: "disabled",
      },
    ]);

    render(
      createElement(AdminQuestionMaterialManagement, {
        initialQuestionPublicId: "question-marketing-001",
      }),
    );

    expect(
      await screen.findByText(
        `已定位待审题目草稿 ${marketingQuestionReadableName}`,
      ),
    ).toBeInTheDocument();
    const questionForm = within(
      screen.getByTestId("content-edit-context-panel"),
    );

    fireEvent.click(
      questionForm.getByRole("button", { name: "发布为正式题目" }),
    );

    expect(
      await screen.findByText("题目“单选题 编辑后的题干”已发布为正式题目"),
    ).toBeInTheDocument();
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/questions/question-marketing-001",
        "PATCH",
      ),
    ).toMatchObject({
      status: "available",
    });
  });

  it("keeps baseline question and material tabs on the approved active press feedback", () => {
    render(createElement(AdminQuestionMaterialManagementBaseline));

    expect(screen.getByRole("tab", { name: "题目" })).toHaveClass(
      "active:scale-[0.98]",
    );
    expect(screen.getByRole("tab", { name: "材料" })).toHaveClass(
      "active:scale-[0.98]",
    );
  });

  it("filters questions by keyword and status without exposing numeric ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    expect(
      await screen.findByText("市场调研抽样方法的核心目标是什么？"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流成本" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("物流成本核算适用于哪类场景？"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("市场调研抽样方法的核心目标是什么？"),
      ).toBeNull();
    });

    const row = screen
      .getByText("物流成本核算适用于哪类场景？")
      .closest("article");
    expect(row).not.toBeNull();
    expect(row).toHaveAttribute("data-public-id", "question-logistics-002");
    expect(row).not.toHaveAttribute("data-id");
  });

  it("uses the shared question ledger and requests server pagination", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");

    expect(
      screen.getByRole("region", { name: "题目筛选" }),
    ).toBeInTheDocument();
    expect(screen.getByText("共 2 道题目")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "题目列表" })).toHaveAttribute(
      "data-slot",
      "admin-table-frame",
    );
    expect(screen.getByRole("table", { name: "题目列表" })).toBeInTheDocument();
    expect(screen.getByLabelText("每页条数")).toHaveValue("20");
    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=50"),
        expect.anything(),
      ),
    );
    expect(screen.getByRole("button", { name: "重置筛选" })).toBeEnabled();
  });

  it("forwards material keyword filters and keeps shared pagination visible", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    expect(
      screen.getByRole("region", { name: "材料筛选" }),
    ).toBeInTheDocument();
    expect(screen.getByText("共 2 份材料")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "材料列表" })).toHaveAttribute(
      "data-slot",
      "admin-table-frame",
    );
    expect(screen.getByRole("table", { name: "材料列表" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "营" },
    });
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "营销案例" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("keyword=%E8%90%A5%E9%94%80%E6%A1%88%E4%BE%8B"),
        expect.anything(),
      ),
    );
    expect(
      fetchMock.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.startsWith("/api/v1/materials?"))
        .map((url) =>
          new URL(url, "http://localhost").searchParams.get("keyword"),
        )
        .filter((keywordValue) => keywordValue !== null),
    ).toEqual(["营销案例"]);
    expect(
      screen.getByRole("button", { name: "移除筛选 关键词：营销案例" }),
    ).toBeEnabled();
    expect(new URLSearchParams(window.location.search).get("keyword")).toBe(
      "营销案例",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "移除筛选 关键词：营销案例" }),
    );

    expect(screen.getByLabelText("关键词")).toHaveValue("");
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("keyword")).toBe(
        null,
      ),
    );
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
  });

  it("restores canonical material list state from the URL", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    window.history.replaceState(
      null,
      "",
      "/content/materials?page=3&pageSize=50&sortBy=updatedAt&sortOrder=asc&profession=marketing&keyword=%E8%90%A5%E9%94%80%E6%A1%88%E4%BE%8B",
    );
    const fetchMock = mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    expect(await screen.findByText("营销案例材料 A")).toBeInTheDocument();
    expect(screen.getByLabelText("关键词")).toHaveValue("营销案例");
    expect(screen.getByLabelText("专业")).toHaveValue("marketing");
    expect(screen.getByLabelText("每页条数")).toHaveValue("50");
    expectAdminFetchAuthorization(
      fetchMock,
      "/api/v1/materials?page=3&pageSize=50&sortBy=updatedAt&sortOrder=asc&keyword=%E8%90%A5%E9%94%80%E6%A1%88%E4%BE%8B&profession=marketing",
    );
  });

  it("keeps the latest question filter response when requests finish out of order", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const disabledResponse =
      createDeferred<ReturnType<typeof createJsonResponse>>();
    const availableResponse =
      createDeferred<ReturnType<typeof createJsonResponse>>();
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return Promise.resolve(createJsonResponse(adminSessionPayload));
      }

      if (path.startsWith("/api/v1/questions?")) {
        const status = new URL(path, "http://localhost").searchParams.get(
          "status",
        );

        if (status === "disabled") {
          return disabledResponse.promise;
        }

        if (status === "available") {
          return availableResponse.promise;
        }

        return Promise.resolve(createJsonResponse(questionPayload));
      }

      if (path.startsWith("/api/v1/materials?")) {
        return Promise.resolve(createJsonResponse(materialPayload));
      }

      if (path.startsWith("/api/v1/knowledge-nodes?")) {
        return Promise.resolve(createJsonResponse(knowledgeNodeOptionPayload));
      }

      if (path === "/api/v1/tags") {
        return Promise.resolve(createJsonResponse(tagOptionPayload));
      }

      return Promise.resolve(
        createJsonResponse({ code: 404001, message: "missing", data: null }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("status=disabled"),
        ),
      ).toBe(true),
    );

    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "available" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("status=available"),
        ),
      ).toBe(true),
    );

    disabledResponse.resolve(
      createJsonResponse(createQuestionListPayload([questionPayload.data[1]])),
    );
    await waitFor(() =>
      expect(
        screen.getByText("市场调研抽样方法的核心目标是什么？"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText("正在刷新题目列表，当前结果仍可操作。"),
    ).toBeInTheDocument();

    availableResponse.resolve(
      createJsonResponse(createQuestionListPayload([questionPayload.data[0]])),
    );
    await waitFor(() =>
      expect(
        screen.queryByText("正在刷新题目列表，当前结果仍可操作。"),
      ).toBeNull(),
    );
    expect(
      screen.getByText("市场调研抽样方法的核心目标是什么？"),
    ).toBeInTheDocument();
    expect(screen.queryByText("物流成本核算适用于哪类场景？")).toBeNull();
  });

  it("[D1] retains question rows and announces refreshing while a filter request is pending", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const refreshResponse =
      createDeferred<ReturnType<typeof createJsonResponse>>();
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return Promise.resolve(createJsonResponse(adminSessionPayload));
      }
      if (path.startsWith("/api/v1/questions?")) {
        return path.includes("status=disabled")
          ? refreshResponse.promise
          : Promise.resolve(createJsonResponse(questionPayload));
      }
      if (path.startsWith("/api/v1/knowledge-nodes?")) {
        return Promise.resolve(createJsonResponse(knowledgeNodeOptionPayload));
      }
      if (path === "/api/v1/tags") {
        return Promise.resolve(createJsonResponse(tagOptionPayload));
      }

      return Promise.resolve(
        createJsonResponse({ code: 404001, message: "missing", data: null }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));
    const currentRow =
      await screen.findByText("市场调研抽样方法的核心目标是什么？");

    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("status=disabled"),
        ),
      ).toBe(true),
    );

    expect(currentRow).toBeInTheDocument();
    expect(
      screen
        .getByText("正在刷新题目列表，当前结果仍可操作。")
        .closest('[role="status"]'),
    ).toHaveAttribute("data-admin-async-state", "refreshing");
  });

  it("[D2] retains material rows and announces refreshing while a filter request is pending", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const disabledResponse =
      createDeferred<ReturnType<typeof createJsonResponse>>();
    const availableResponse =
      createDeferred<ReturnType<typeof createJsonResponse>>();
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return Promise.resolve(createJsonResponse(adminSessionPayload));
      }
      if (path.startsWith("/api/v1/materials?")) {
        if (path.includes("status=disabled")) {
          return disabledResponse.promise;
        }
        if (path.includes("status=available")) {
          return availableResponse.promise;
        }
        return Promise.resolve(createJsonResponse(materialPayload));
      }

      return Promise.resolve(
        createJsonResponse({ code: 404001, message: "missing", data: null }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );
    const currentRow = await screen.findByText("营销案例材料 A");

    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("status=disabled"),
        ),
      ).toBe(true),
    );

    expect(currentRow).toBeInTheDocument();
    expect(
      screen
        .getByText("正在刷新材料列表，当前结果仍可操作。")
        .closest('[role="status"]'),
    ).toHaveAttribute("data-admin-async-state", "refreshing");

    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "available" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("status=available"),
        ),
      ).toBe(true),
    );

    disabledResponse.resolve(
      createJsonResponse({
        ...materialPayload,
        data: [materialPayload.data[1]],
        pagination: { ...materialPayload.pagination, total: 1 },
      }),
    );
    await waitFor(() => expect(currentRow).toBeInTheDocument());
    expect(
      screen.getByText("正在刷新材料列表，当前结果仍可操作。"),
    ).toBeInTheDocument();

    availableResponse.resolve(
      createJsonResponse({
        ...materialPayload,
        data: [materialPayload.data[0]],
        pagination: { ...materialPayload.pagination, total: 1 },
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByText("正在刷新材料列表，当前结果仍可操作。"),
      ).toBeNull(),
    );
    expect(currentRow).toBeInTheDocument();
    expect(screen.queryByText("已锁定物流材料 B")).toBeNull();
  });

  it("[D3] restores canonical list controls when browser history emits popstate", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");

    window.history.pushState(
      null,
      "",
      "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&status=disabled",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() =>
      expect(screen.getByLabelText("状态")).toHaveValue("disabled"),
    );
    expect(screen.getByLabelText("每页条数")).toHaveValue("50");
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("page=2&pageSize=50"),
      ),
    ).toBe(true);
  });

  it("[D3] restores the initiating edit control and captured scroll position on return", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 320,
    });

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    const editButton = screen.getByRole("button", {
      name: `编辑题目 ${marketingQuestionReadableName}`,
    });
    editButton.focus();
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole("button", { name: "取消" });
    cancelButton.focus();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    fireEvent.click(cancelButton);

    expect.soft(editButton).toHaveFocus();
    expect.soft(scrollToMock).toHaveBeenCalledWith({
      behavior: "auto",
      top: 320,
    });
  });

  it("[D3] restores a material edit trigger and captured scroll position", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 240,
    });

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );
    await screen.findByText("营销案例材料 A");
    const editButton = screen.getByRole("button", {
      name: `编辑材料 ${marketingMaterialReadableName}`,
    });
    fireEvent.click(editButton);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(editButton).toHaveFocus();
    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: "auto",
      top: 240,
    });
  });

  it("[D3] falls back to the list toolbar when the edit trigger disconnects", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    const editButton = screen.getByRole("button", {
      name: `编辑题目 ${marketingQuestionReadableName}`,
    });
    fireEvent.click(editButton);

    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });
    await waitFor(() => expect(editButton.isConnected).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.getByLabelText("关键词")).toHaveFocus();
  });

  it("filters questions by level, question type, knowledge_node, and tag", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");

    fireEvent.change(screen.getByLabelText("等级筛选"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "short_answer" },
    });
    fireEvent.change(screen.getByLabelText("知识点筛选"), {
      target: { value: "knowledge-node-costing" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("物流成本核算适用于哪类场景？"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("市场调研抽样方法的核心目标是什么？"),
      ).toBeNull();
    });

    fireEvent.change(screen.getByLabelText("等级筛选"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "single_choice" },
    });
    fireEvent.change(screen.getByLabelText("知识点筛选"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("标签筛选"), {
      target: { value: "tag-research" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("市场调研抽样方法的核心目标是什么？"),
      ).toBeInTheDocument();
      expect(screen.queryByText("物流成本核算适用于哪类场景？")).toBeNull();
    });
  });

  it("renders explicit question binding feedback for material, knowledge_node, and tag", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");

    const boundQuestion = screen.getByTestId(
      "question-binding-question-marketing-001",
    );
    expect(boundQuestion).toHaveTextContent("关联材料：1 份");
    expect(boundQuestion).toHaveTextContent("知识点：1 个");
    expect(boundQuestion).toHaveTextContent("标签：1 个");

    const unboundQuestion = screen.getByTestId(
      "question-binding-question-logistics-002",
    );
    expect(unboundQuestion).toHaveTextContent("关联材料：无");
    expect(unboundQuestion).toHaveTextContent("知识点：1 个");
    expect(unboundQuestion).toHaveTextContent("标签：0 个");
  });

  it("starts question review from a knowledge_node durable binding handoff", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        initialKnowledgeNodeFilter: "knowledge-node-costing",
      }),
    );

    await screen.findByText("物流成本核算适用于哪类场景？");

    expect(
      await screen.findByDisplayValue("Logistics / Costing"),
    ).toBeInTheDocument();
    expect(screen.queryByText("市场调研抽样方法的核心目标是什么？")).toBeNull();
  });

  it("lists and filters case_analysis and calculation question types", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch([caseAnalysisQuestionPayload, calculationQuestionPayload]);

    render(createElement(AdminQuestionMaterialManagement));

    expect(
      await screen.findByText("Synthetic case_analysis stem"),
    ).toBeInTheDocument();
    expect(screen.getByText("Synthetic calculation stem")).toBeInTheDocument();
    expect(screen.getAllByText("案例分析题").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("计算题").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("知识点：1 个").length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.getAllByText("标签：1 个").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("knowledge-node-case-analysis")).toBeNull();
    expect(screen.queryByText("tag-calculation")).toBeNull();

    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "case_analysis" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Synthetic case_analysis stem"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Synthetic calculation stem")).toBeNull();
    });

    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "calculation" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Synthetic calculation stem"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Synthetic case_analysis stem")).toBeNull();
    });
  });

  it("keeps locked questions copy-only in the content admin list", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-logistics-002");

    expect(
      screen.getByTestId("question-edit-question-logistics-002"),
    ).toBeDisabled();
    expect(
      screen.getByText("已锁定题目只能复制新题后编辑"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `复制题目 ${logisticsQuestionReadableName}`,
      }),
    ).toBeEnabled();
  });

  it("renders question lock state reason without exposing internal ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-logistics-002");

    expect(
      screen.getByTestId("question-lock-question-marketing-001"),
    ).toHaveTextContent("状态：可编辑");

    const lockedQuestion = screen.getByTestId(
      "question-lock-question-logistics-002",
    );
    expect(lockedQuestion).toHaveTextContent("状态：已被已发布试卷引用锁定");
    expect(lockedQuestion).toHaveTextContent(
      "锁定时间：2026-05-18T08:00:00.000Z",
    );
    expect(lockedQuestion).not.toHaveTextContent('"id"');
  });

  it("renders material management with runtime loading and an empty filtered state", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    expect(await screen.findByText("营销案例材料 A")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "材料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const lifecycleBand = screen.getByTestId(
      "question-material-lifecycle-context-band",
    );

    expect(lifecycleBand).toHaveTextContent("材料库生命周期");
    expect(lifecycleBand).toHaveTextContent("可编辑 1");
    expect(lifecycleBand).toHaveTextContent("已停用 0");
    expect(lifecycleBand).toHaveTextContent("锁定 1");
    expect(lifecycleBand).toHaveTextContent("锁定材料只能复制新材料");
    expect(screen.getByRole("button", { name: "新建材料" })).toBeEnabled();
    expect(
      screen.getByTestId("content-action-runtime-ready"),
    ).toBeInTheDocument();

    const materialRow = screen.getByTestId(
      "material-row-material-marketing-001",
    );
    expect(materialRow).toHaveAttribute(
      "data-public-id",
      "material-marketing-001",
    );
    expect(materialRow).toHaveTextContent("关联题目 1 道，关联试卷 1 套");
    expect(materialRow).toHaveTextContent("具体引用关系请在材料详情中查看");
    expect(materialRow).toHaveTextContent("营销 / 3级 / 理论");

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的材料" },
    });

    expect(await screen.findByText("没有匹配的材料")).toBeInTheDocument();
  });

  it("keeps locked materials copy-only and exposes their lock boundary", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByTestId("material-row-material-locked-002");

    expect(
      screen.getByTestId("material-edit-material-locked-002"),
    ).toBeDisabled();
    expect(
      screen.getByText("已锁定材料只能复制新材料后编辑"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `复制材料 ${lockedMaterialReadableName}`,
      }),
    ).toBeEnabled();
  });

  it("renders material reference counts, linked public references, and lock reason", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByTestId("material-row-material-marketing-001");

    const materialReferences = screen.getByTestId(
      "material-reference-summary-material-marketing-001",
    );
    expect(materialReferences).toHaveTextContent("题目引用数：1");
    expect(materialReferences).toHaveTextContent("试卷引用数：1");
    expect(materialReferences).toHaveTextContent(
      "具体引用关系请在材料详情中查看。",
    );
    expect(materialReferences).not.toHaveTextContent("question-marketing-001");
    expect(materialReferences).not.toHaveTextContent("paper-material-ref-001");

    const lockedMaterial = screen.getByTestId(
      "material-lock-material-locked-002",
    );
    expect(lockedMaterial).toHaveTextContent("状态：已被已发布试卷引用锁定");
    expect(lockedMaterial).toHaveTextContent(
      "锁定时间：2026-05-19T07:00:00.000Z",
    );
    expect(lockedMaterial).not.toHaveTextContent('"id"');
  });

  it("starts new question and material forms without submission defaults and blocks an empty save with accessible errors", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    expect(questionForm.getByLabelText("题型").closest("form")).toHaveAttribute(
      "data-admin-form-dirty-state",
      "clean",
    );
    expect(questionForm.getByLabelText("题型")).toHaveValue("");
    expect(questionForm.getByLabelText("专业")).toHaveValue("");
    expect(questionForm.getByLabelText("等级")).toHaveValue(null);
    expect(questionForm.getByLabelText("科目")).toHaveValue("");
    expect(questionForm.getByLabelText("题干")).toHaveValue("");
    expect(questionForm.getByLabelText("标准答案")).toHaveValue("");
    expect(questionForm.getByLabelText("老师解析")).toHaveValue("");
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "未完成解析草稿" },
    });
    expect(questionForm.getByLabelText("题型").closest("form")).toHaveAttribute(
      "data-admin-form-dirty-state",
      "dirty",
    );

    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(questionForm.getByRole("alert")).toHaveTextContent(
      "请修正以下内容后再保存",
    );
    expect(questionForm.getByLabelText("题型")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(questionForm.getByLabelText("题型")).toHaveFocus();
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);

    fireEvent.click(questionForm.getByRole("button", { name: "取消" }));
    cleanup();
    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );
    await screen.findByTestId("material-row-material-marketing-001");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));

    const materialForm = within(screen.getByRole("form", { name: "材料表单" }));
    expect(
      materialForm.getByLabelText("材料标题").closest("form"),
    ).toHaveAttribute("data-admin-form-dirty-state", "clean");
    expect(
      materialForm.getByText(/材料标题、专业、等级、科目/),
    ).toBeInTheDocument();
    expect(materialForm.getByLabelText("材料标题")).toHaveValue("");
    expect(materialForm.getByLabelText("材料正文")).toHaveValue("");
    expect(materialForm.getByLabelText("专业")).toHaveValue("");
    expect(materialForm.getByLabelText("等级")).toHaveValue(null);
    expect(materialForm.getByLabelText("科目")).toHaveValue("");
    fireEvent.change(materialForm.getByLabelText("材料标题"), {
      target: { value: "未完成材料草稿" },
    });
    expect(
      materialForm.getByLabelText("材料标题").closest("form"),
    ).toHaveAttribute("data-admin-form-dirty-state", "dirty");
  });

  it("uses the same integrity source for edit validation and focuses the first invalid field", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(
      screen.getByRole("button", {
        name: `编辑题目 ${marketingQuestionReadableName}`,
      }),
    );
    const editForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(editForm.getByLabelText("题干"), {
      target: { value: "<p>\u200b</p>" },
    });
    fireEvent.click(editForm.getByRole("button", { name: "保存题目" }));

    expect(editForm.getByRole("alert")).toHaveTextContent("请输入有效题干。");
    expect(editForm.getByLabelText("题干")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(editForm.getByLabelText("题干")).toHaveFocus();
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions/question-marketing-001" &&
          requestInit?.method === "PATCH",
      ),
    ).toBe(false);
  });

  it("creates, edits, disables, and copies questions through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const createQuestionForm = within(
      screen.getByRole("form", { name: "题目表单" }),
    );
    fillNewSingleChoiceStructure(createQuestionForm);
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "新建题目题干" },
    });
    fireEvent.change(screen.getByLabelText("标准答案"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText("老师解析"), {
      target: { value: "新建题目解析" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目“单选题 新建题目题干”已保存"),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText("题目“单选题 新建题目题干”已保存")
        .closest('[role="status"]'),
    ).toHaveAttribute("data-admin-feedback-tone", "success");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
          "content-type": "application/json",
        }),
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: `编辑题目 ${marketingQuestionReadableName}`,
      }),
    );
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "编辑后的题干" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      await screen.findByText("题目“单选题 编辑后的题干”已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001",
      expect.objectContaining({ method: "PATCH" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "停用题目 单选题 编辑后的题干",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认停用题目？");
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));

    const disabledQuestionRow = await screen.findByTestId(
      "question-row-question-marketing-001",
    );
    await waitFor(() =>
      expect(disabledQuestionRow).toHaveTextContent("已停用"),
    );
    fireEvent.click(
      within(disabledQuestionRow).getByRole("button", {
        name: /复制题目/,
      }),
    );

    expect(
      await screen.findByTestId("question-row-question-marketing-001-copy"),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/disable",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/copy",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("deduplicates an in-progress save and explains why submission is disabled", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fallbackFetch = mockWritableContentFetch();
    let resolveSave:
      | ((response: ReturnType<typeof createJsonResponse>) => void)
      | undefined;
    const pendingSave = new Promise<ReturnType<typeof createJsonResponse>>(
      (resolve) => {
        resolveSave = resolve;
      },
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/questions" && init?.method === "POST") {
          return pendingSave;
        }

        return fallbackFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fillNewSingleChoiceStructure(questionForm);
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "待保存题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "A" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "待保存解析" },
    });

    const saveButton = questionForm.getByRole("button", { name: "保存题目" });
    fireEvent.click(saveButton);
    fireEvent.submit(screen.getByRole("form", { name: "题目表单" }));

    expect(
      questionForm.getByRole("button", { name: "保存中…" }),
    ).toBeDisabled();
    const disabledSave = questionForm.getByRole("button", { name: "保存中…" });
    const disabledReasonId = disabledSave.getAttribute("aria-describedby");
    expect(disabledReasonId).not.toBeNull();
    expect(document.getElementById(disabledReasonId ?? "")).toHaveTextContent(
      "正在保存，请勿重复提交。",
    );
    expect(questionForm.getByRole("status")).toHaveTextContent(
      "正在保存，请勿重复提交。",
    );
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions" &&
          requestInit?.method === "POST",
      ),
    ).toHaveLength(1);

    resolveSave?.(
      createJsonResponse({
        code: 0,
        message: "ok",
        data: {
          question: {
            ...questionPayload.data[0],
            publicId: "question-created-pending",
            stemRichText: "待保存题干",
          },
        },
      }),
    );
    await screen.findByText("题目“单选题 待保存题干”已保存");
  });

  it("keeps the current object when a copy request fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fallbackFetch = mockWritableContentFetch();
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (
          String(url) === "/api/v1/questions/question-marketing-001/copy" &&
          init?.method === "POST"
        ) {
          throw new Error("synthetic network failure");
        }

        return fallbackFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));
    const currentRow = await screen.findByTestId(
      "question-row-question-marketing-001",
    );

    fireEvent.click(
      within(currentRow).getByRole("button", { name: /复制题目/ }),
    );

    const feedback = await screen.findByRole("alert");
    expect(feedback).toHaveAttribute("data-admin-feedback-tone", "error");
    expect(feedback).toHaveTextContent("当前列表保持不变");
    expect(currentRow).toBeInTheDocument();
    expect(
      screen.queryByTestId("question-row-question-marketing-001-copy"),
    ).toBeNull();
  });

  it("keeps author input and distinguishes save conflicts from other failures", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const conflictFallbackFetch = mockWritableContentFetch();
    const conflictFetch = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (
          String(url) === "/api/v1/questions/question-marketing-001" &&
          init?.method === "PATCH"
        ) {
          return createJsonResponse({
            code: 409202,
            message: "redacted conflict",
            data: null,
          });
        }

        return conflictFallbackFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", conflictFetch);

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(
      screen.getByRole("button", {
        name: `编辑题目 ${marketingQuestionReadableName}`,
      }),
    );
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "发生冲突时保留的题干" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    const conflictFeedback = await screen.findByRole("alert");
    expect(conflictFeedback).toHaveTextContent("当前输入已保留");
    expect(conflictFeedback).toHaveAttribute(
      "data-admin-feedback-tone",
      "conflict",
    );
    expect(screen.getByLabelText("题干")).toHaveValue("发生冲突时保留的题干");

    cleanup();
    const failureFallbackFetch = mockWritableContentFetch();
    const failureFetch = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/questions" && init?.method === "POST") {
          return createJsonResponse({
            code: 500001,
            message: "redacted failure",
            data: null,
          });
        }

        return failureFallbackFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", failureFetch);

    render(createElement(AdminQuestionMaterialManagement));
    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fillNewSingleChoiceStructure(questionForm);
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "普通失败时保留的题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "A" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "普通失败时保留的解析" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "当前输入已保留",
    );
    expect(questionForm.getByLabelText("题干")).toHaveValue(
      "普通失败时保留的题干",
    );
    expect(screen.queryByText(/题目保存冲突/)).toBeNull();
  });

  it("posts selected existing question type fields instead of hardcoded single_choice defaults", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "multi_choice" },
    });
    fireEvent.change(questionForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(questionForm.getByLabelText("等级"), {
      target: { value: "2" },
    });
    fireEvent.change(questionForm.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    await questionForm.findByRole("option", { name: "营销案例材料 A" });
    expect(questionForm.getByLabelText("关联材料")).toBeEnabled();
    fireEvent.change(questionForm.getByLabelText("关联材料"), {
      target: { value: "material-marketing-001" },
    });
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "多选题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "A,B" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "多选题解析" },
    });
    fireEvent.change(questionForm.getByLabelText("多选评分规则"), {
      target: { value: "partial_credit" },
    });
    fireEvent.change(questionForm.getByLabelText("选项 A"), {
      target: { value: "候选项 A" },
    });
    fireEvent.change(questionForm.getByLabelText("选项 B"), {
      target: { value: "候选项 B" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "添加选项" }));
    fireEvent.change(questionForm.getByLabelText("选项 C"), {
      target: { value: "候选项 C" },
    });
    expect(
      questionForm.getByRole("button", { name: "删除最后选项" }),
    ).toBeEnabled();
    fireEvent.click(questionForm.getByLabelText("选项 A 正确"));
    fireEvent.click(questionForm.getByLabelText("选项 B 正确"));
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目“单选题 新建题目题干”已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      level: 2,
      materialPublicId: "material-marketing-001",
      multiChoiceRule: "partial_credit",
      profession: "marketing",
      questionType: "multi_choice",
      scoringMethod: "auto_match",
      subject: "skill",
    });
    expect(requestBody.questionOptions).toEqual([
      {
        contentRichText: "候选项 A",
        isCorrect: true,
        label: "A",
        sortOrder: 1,
      },
      {
        contentRichText: "候选项 B",
        isCorrect: true,
        label: "B",
        sortOrder: 2,
      },
      {
        contentRichText: "候选项 C",
        isCorrect: false,
        label: "C",
        sortOrder: 3,
      },
    ]);
    expect(requestBody.scoringPoints).toEqual([]);
  });

  it("normalizes true_false A/B authoring into correct and incorrect answers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "true_false" },
    });
    fillRequiredQuestionClassification(questionForm);

    expect(questionForm.getByLabelText("标准答案")).toHaveValue("A");
    expect(questionForm.getByLabelText("选项 A")).toHaveValue("正确");
    expect(questionForm.getByLabelText("选项 B")).toHaveValue("错误");
    expect(questionForm.queryByLabelText("选项 C")).toBeNull();

    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "判断题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "B" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "判断题解析" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目“单选题 新建题目题干”已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      questionType: "true_false",
      standardAnswerRichText: "错误",
    });
    expect(requestBody.questionOptions).toEqual([
      {
        contentRichText: "正确",
        isCorrect: false,
        label: "A",
        sortOrder: 1,
      },
      {
        contentRichText: "错误",
        isCorrect: true,
        label: "B",
        sortOrder: 2,
      },
    ]);
  });

  it("prevents saving question rich text above the SSOT 10000 character limit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "题".repeat(10001) },
    });

    expect(questionForm.getByText("10001/10000")).toBeInTheDocument();
    expect(
      questionForm.getByText("题干超过 10000 字符，不能保存。"),
    ).toBeInTheDocument();
    expect(
      questionForm.getByRole("button", { name: "保存题目" }),
    ).toBeEnabled();
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));
    expect(questionForm.getByRole("alert")).toHaveTextContent(
      "题干超过 10000 字符，不能保存。",
    );

    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
  });

  it("uploads a managed content_image before inserting its canonical reference", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(questionForm.getByLabelText("选择题目图片"), {
      target: {
        files: [
          new File([new Uint8Array([1, 2, 3])], "diagram.png", {
            type: "image/png",
          }),
        ],
      },
    });
    await questionForm.findByText("图片已上传并插入。");
    fireEvent.click(questionForm.getByRole("button", { name: "插入表格模板" }));

    const stemInput = questionForm.getByLabelText(
      "题干",
    ) as HTMLTextAreaElement;

    expect(stemInput.value).toContain("<img");
    expect(stemInput.value).toContain(
      'data-content-image-public-id="content-image-uploaded-001"',
    );
    expect(stemInput.value).toContain(
      "/api/v1/content-images/content-image-uploaded-001",
    );
    expect(stemInput.value).not.toContain("paper-assets");
    expect(stemInput.value).toContain("<table>");
  });

  it("posts non-option existing question type scoring points without option rows", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "short_answer" },
    });
    fillRequiredQuestionClassification(questionForm);
    fireEvent.change(questionForm.getByLabelText("评分方式"), {
      target: { value: "ai_scoring" },
    });
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "简答题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "简答题参考答案" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "简答题解析" },
    });
    fireEvent.change(questionForm.getByLabelText("评分点 1"), {
      target: { value: "说明关键步骤" },
    });
    fireEvent.change(questionForm.getByLabelText("评分点 1 分值"), {
      target: { value: "2.5" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目“单选题 新建题目题干”已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      questionType: "short_answer",
      scoringMethod: "ai_scoring",
    });
    expect(requestBody.questionOptions).toEqual([]);
    expect(requestBody.scoringPoints).toEqual([
      {
        description: "说明关键步骤",
        score: "2.5",
        sortOrder: 1,
      },
    ]);
  });

  it("preserves fill blank data across scoring-method changes and posts only valid active structures", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "fill_blank" },
    });
    fillRequiredQuestionClassification(questionForm);
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "客户需求分析应先识别客户____。" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "客户动机" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "识别真实客户动机。" },
    });
    fireEvent.change(questionForm.getByLabelText("第 1 空答案"), {
      target: { value: "客户动机 | 购买动机" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));
    expect(questionForm.getByRole("alert")).toHaveTextContent(
      "逐空答案必须包含有效答案和正数、0.5 粒度的分值",
    );
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
    fireEvent.change(questionForm.getByLabelText("第 1 空分值"), {
      target: { value: "1.5" },
    });

    fireEvent.change(questionForm.getByLabelText("评分方式"), {
      target: { value: "ai_scoring" },
    });
    expect(questionForm.getByLabelText("第 1 空答案")).toHaveValue(
      "客户动机 | 购买动机",
    );
    expect(questionForm.getByLabelText("第 1 空分值")).toHaveValue("1.5");
    fireEvent.change(questionForm.getByLabelText("评分点 1"), {
      target: { value: "识别核心动机" },
    });
    fireEvent.change(questionForm.getByLabelText("评分点 1 分值"), {
      target: { value: "1.5" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    await screen.findByText("题目“单选题 新建题目题干”已保存");
    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );
    expect(requestBody).toMatchObject({
      questionType: "fill_blank",
      scoringMethod: "ai_scoring",
      questionOptions: [],
    });
    expect(requestBody.fillBlankAnswers).toEqual([]);
    expect(requestBody.scoringPoints).toEqual([
      {
        description: "识别核心动机",
        score: "1.5",
        sortOrder: 1,
      },
    ]);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "posts %s through the subjective authoring path",
    async (questionType) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
      const fetchMock = mockWritableContentFetch();

      render(createElement(AdminQuestionMaterialManagement));

      await screen.findByText("市场调研抽样方法的核心目标是什么？");
      fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
      const questionForm = within(
        screen.getByRole("form", { name: "题目表单" }),
      );
      fireEvent.change(questionForm.getByLabelText("题型"), {
        target: { value: questionType },
      });
      fillRequiredQuestionClassification(questionForm);

      expect(questionForm.queryByLabelText("选项 A")).toBeNull();
      expect(questionForm.getByLabelText("评分点 1")).toBeInTheDocument();
      expect(questionForm.getByLabelText("标准答案")).toBeInTheDocument();

      fireEvent.change(questionForm.getByLabelText("评分方式"), {
        target: { value: "ai_scoring" },
      });
      await questionForm.findByRole("option", { name: "营销案例材料 A" });
      expect(questionForm.getByLabelText("关联材料")).toBeEnabled();
      fireEvent.change(questionForm.getByLabelText("关联材料"), {
        target: { value: "material-marketing-001" },
      });
      fireEvent.change(questionForm.getByLabelText("题干"), {
        target: { value: `Synthetic ${questionType} stem` },
      });
      fireEvent.change(questionForm.getByLabelText("标准答案"), {
        target: { value: `Synthetic ${questionType} reference` },
      });
      fireEvent.change(questionForm.getByLabelText("老师解析"), {
        target: { value: `Synthetic ${questionType} analysis` },
      });
      fireEvent.change(questionForm.getByLabelText("评分点 1"), {
        target: { value: `Synthetic ${questionType} scoring_point` },
      });
      fireEvent.change(questionForm.getByLabelText("评分点 1 分值"), {
        target: { value: "3.0" },
      });
      fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

      expect(
        await screen.findByText("题目“单选题 新建题目题干”已保存"),
      ).toBeInTheDocument();

      const requestBody = readJsonRequestBody(
        fetchMock,
        "/api/v1/questions",
        "POST",
      );

      expect(requestBody).toMatchObject({
        materialPublicId: "material-marketing-001",
        questionType,
        scoringMethod: "ai_scoring",
        standardAnswerRichText: `Synthetic ${questionType} reference`,
      });
      expect(requestBody.questionOptions).toEqual([]);
      expect(requestBody.scoringPoints).toEqual([
        {
          description: `Synthetic ${questionType} scoring_point`,
          score: "3.0",
          sortOrder: 1,
        },
      ]);
    },
  );

  it("opens question edit in a contextual panel tied to the selected row", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(screen.getByTestId("question-edit-question-marketing-001"));

    const editPanel = screen.getByTestId("content-edit-context-panel");

    expect(editPanel).toHaveTextContent("正在编辑所选内容");
    expect(editPanel).not.toHaveTextContent("question-marketing-001");
    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).toHaveAttribute("data-selected", "true");
    expect(
      screen.getByTestId("question-row-question-logistics-002"),
    ).toHaveAttribute("data-selected", "false");
    expect(within(editPanel).getByRole("form")).toBeInTheDocument();
  });

  it("edits durable knowledge_node and tag bindings from the question form", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(screen.getByTestId("question-edit-question-marketing-001"));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));

    expect(
      await questionForm.findByRole("checkbox", {
        name: "Marketing / Research / Sampling",
      }),
    ).toBeChecked();
    expect(
      await questionForm.findByRole("checkbox", { name: "Research" }),
    ).toBeChecked();

    fireEvent.click(
      questionForm.getByRole("checkbox", { name: "Marketing / Retail" }),
    );
    fireEvent.click(
      questionForm.getByRole("checkbox", { name: "Marketing / Pricing" }),
    );
    fireEvent.click(questionForm.getByRole("checkbox", { name: "Compliance" }));
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目“单选题 编辑后的题干”已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions/question-marketing-001",
      "PATCH",
    );

    expect(requestBody.knowledgeNodePublicIds).toEqual([
      "knowledge-node-sampling",
      "knowledge-node-retail",
      "knowledge-node-price",
    ]);
    expect(requestBody.tagPublicIds).toEqual([
      "tag-research",
      "tag-compliance",
    ]);
    const updatedQuestionRow = screen.getByTestId(
      "question-row-question-marketing-001",
    );
    await waitFor(() =>
      expect(updatedQuestionRow).toHaveTextContent("知识点：3 个"),
    );
    expect(updatedQuestionRow).toHaveTextContent("标签：2 个");
    expect(updatedQuestionRow).not.toHaveTextContent("knowledge-node-price");
    expect(updatedQuestionRow).not.toHaveTextContent("tag-compliance");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("previews parsed question bindings before saving the question form", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(screen.getByTestId("question-edit-question-marketing-001"));

    const questionForm = within(
      screen.getByTestId("content-edit-context-panel"),
    );
    await questionForm.findByRole("option", { name: "营销案例材料 A" });
    const bindingPreview = screen.getByTestId("question-binding-preview");

    expect(bindingPreview).toHaveTextContent("关联材料：营销案例材料 A");
    expect(bindingPreview).toHaveTextContent(
      "知识点：1 个 Marketing / Research / Sampling",
    );
    expect(bindingPreview).toHaveTextContent("标签：1 个 Research");

    fireEvent.change(questionForm.getByLabelText("关联材料"), {
      target: { value: "" },
    });
    fireEvent.click(
      questionForm.getByRole("checkbox", { name: "Marketing / Retail" }),
    );
    fireEvent.click(questionForm.getByRole("checkbox", { name: "Research" }));

    expect(bindingPreview).toHaveTextContent("关联材料：无");
    expect(bindingPreview).toHaveTextContent(
      "知识点：2 个 Marketing / Research / Sampling、Marketing / Retail",
    );
    expect(bindingPreview).toHaveTextContent("标签：0 个 无");
  });

  it("reviews knowledge_node recommendations with confidence, stale, accept, and discard states", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(
      screen.getByRole("button", {
        name: `为题目 ${marketingQuestionReadableName} 推荐知识点`,
      }),
    );

    const panel = await screen.findByTestId(
      "knowledge-recommendation-panel-question-marketing-001",
    );
    expect(panel).toHaveAttribute("data-stale", "false");
    const reviewSummary = screen.getByTestId(
      "knowledge-recommendation-review-summary-question-marketing-001",
    );
    expect(reviewSummary).toHaveTextContent(
      `目标题目：${marketingQuestionReadableName}`,
    );
    expect(reviewSummary).toHaveTextContent("已采纳：0");
    expect(reviewSummary).toHaveTextContent("已丢弃：0");
    expect(reviewSummary).toHaveTextContent("待确认： 3");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-sampling-v2",
      ),
    ).toHaveTextContent("high");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-segmentation",
      ),
    ).toHaveTextContent("low");
    const unreadableRecommendation = screen.getByTestId(
      "knowledge-recommendation-row-knowledge-node-unreadable-marker",
    );
    expect(unreadableRecommendation).toHaveTextContent("推荐项不可用");
    expect(unreadableRecommendation).toHaveTextContent(
      "缺少知识点名称或完整路径，不能审查。",
    );
    expect(
      within(unreadableRecommendation).getByRole("button", {
        name: "采纳推荐 推荐项不可用",
      }),
    ).toBeDisabled();
    expect(unreadableRecommendation).not.toHaveTextContent(
      "knowledge-node-unreadable-marker",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "丢弃推荐 Segmentation",
      }),
    );
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes",
        "POST",
      ),
    ).toEqual({
      action: "ignore",
      taskPublicId: "kn-recommendation-task-public-001",
      expectedQuestionUpdatedAt: "2026-05-19T06:20:00.000Z",
      candidatePublicIds: ["kn-recommendation-candidate-public-002"],
    });
    await waitFor(() => {
      expect(reviewSummary).toHaveTextContent("已采纳：0");
      expect(reviewSummary).toHaveTextContent("已丢弃：1");
      expect(reviewSummary).toHaveTextContent("待确认： 2");
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "采纳推荐 Sampling v2",
      }),
    );

    const acceptedRecommendationBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes",
      "POST",
    );
    expect(acceptedRecommendationBody).toEqual({
      action: "confirm",
      taskPublicId: "kn-recommendation-task-public-001",
      expectedQuestionUpdatedAt: "2026-05-19T06:20:00.000Z",
      candidatePublicIds: ["kn-recommendation-candidate-public-001"],
    });
    await waitFor(() =>
      expect(
        screen.getByTestId("question-row-question-marketing-001"),
      ).toHaveTextContent("Sampling v2"),
    );
    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).not.toHaveTextContent("knowledge-node-sampling-v2");

    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-segmentation",
      ),
    ).toHaveTextContent("已丢弃");
    expect(reviewSummary).toHaveTextContent("已采纳：1");
    expect(reviewSummary).toHaveTextContent("已丢弃：2");
    expect(reviewSummary).toHaveTextContent("待确认： 0");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-review-trace-question-marketing-001",
      ),
    ).toHaveTextContent("已采纳 Sampling v2 · 已持久化审查");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-review-trace-question-marketing-001",
      ),
    ).toHaveTextContent("已丢弃 Segmentation · 已持久化审查");

    fireEvent.click(
      screen.getByRole("button", {
        name: `编辑题目 ${marketingQuestionReadableName}`,
      }),
    );
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "updated bounded fixture stem" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    await screen.findByText("题目“单选题 编辑后的题干”已保存");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-panel-question-marketing-001",
      ),
    ).toHaveAttribute("data-stale", "true");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("distinguishes network, non-JSON, failed-task, and successful-empty recommendation outcomes with retry", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const baseFetch = mockWritableContentFetch();
    let recommendationAttempt = 0;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (
          path ===
            "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes" &&
          init?.method === "POST"
        ) {
          recommendationAttempt += 1;

          if (recommendationAttempt === 1) {
            throw new TypeError("simulated network failure");
          }
          if (recommendationAttempt === 2) {
            return new Response("upstream html", { status: 502 });
          }

          const isFailed = recommendationAttempt === 3;

          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              recommendation: {
                questionPublicId: "question-marketing-001",
                recommendationStatus: isFailed
                  ? "recommendation_failed"
                  : "recommended",
                reviewState: {
                  questionUpdatedAt: "2026-05-19T06:20:00.000Z",
                  currentQuestionUpdatedAt: "2026-05-19T06:20:00.000Z",
                  taskPublicId: "kn-recommendation-task-public-recovery",
                  taskStatus: isFailed ? "failed" : "succeeded",
                  staleCheck: "question_updated_at_mismatch",
                  bindingMode: "durable_question_binding",
                },
                recommendations: [],
                evidenceStatus: isFailed ? null : "none",
                modelConfig: null,
                failureReason: isFailed ? "recommendation_runner_failed" : null,
              },
            },
          });
        }

        return baseFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    const recommendButton = screen.getByRole("button", {
      name: `为题目 ${marketingQuestionReadableName} 推荐知识点`,
    });

    for (const expectedAttempt of [1, 2, 3]) {
      fireEvent.click(recommendButton);
      expect(
        await screen.findByText("知识点推荐未完成，请重试。"),
      ).toBeInTheDocument();
      expect(recommendButton).toBeEnabled();
      expect(recommendButton).toHaveTextContent("重试知识点推荐");
      expect(recommendationAttempt).toBe(expectedAttempt);
    }

    fireEvent.click(recommendButton);

    expect(
      await screen.findByText(
        `题目“${marketingQuestionReadableName}”的知识点推荐已完成，暂无候选`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "knowledge-recommendation-panel-question-marketing-001",
      ),
    ).toHaveTextContent("推荐已完成，暂无候选");
    expect(recommendationAttempt).toBe(4);
  });

  it("issues one recommendation request while the same question is in flight", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const baseFetch = mockWritableContentFetch();
    let resolveRecommendation:
      | ((response: ReturnType<typeof createJsonResponse>) => void)
      | undefined;
    const recommendationResponse = new Promise<
      ReturnType<typeof createJsonResponse>
    >((resolve) => {
      resolveRecommendation = resolve;
    });
    let recommendationRequestCount = 0;
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (
          path ===
            "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes" &&
          init?.method === "POST"
        ) {
          recommendationRequestCount += 1;
          return recommendationResponse;
        }

        return baseFetch(url, init);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    const recommendButton = screen.getByRole("button", {
      name: `为题目 ${marketingQuestionReadableName} 推荐知识点`,
    });

    fireEvent.click(recommendButton);
    fireEvent.click(recommendButton);

    expect(recommendationRequestCount).toBe(1);
    expect(recommendButton).toBeDisabled();
    expect(recommendButton).toHaveTextContent("知识点推荐处理中");

    resolveRecommendation?.(
      createJsonResponse({
        code: 0,
        message: "ok",
        data: {
          recommendation: {
            questionPublicId: "question-marketing-001",
            recommendationStatus: "pending",
            reviewState: {
              questionUpdatedAt: "2026-05-19T06:20:00.000Z",
              currentQuestionUpdatedAt: "2026-05-19T06:20:00.000Z",
              taskPublicId: "kn-recommendation-task-public-pending",
              taskStatus: "pending",
              staleCheck: "question_updated_at_mismatch",
              bindingMode: "durable_question_binding",
            },
            recommendations: [],
            evidenceStatus: null,
            modelConfig: null,
            failureReason: null,
          },
        },
      }),
    );

    expect(
      await screen.findByText(
        `题目“${marketingQuestionReadableName}”的知识点推荐任务已创建`,
      ),
    ).toBeInTheDocument();
    expect(recommendButton).toBeEnabled();
  });

  it("creates, edits, disables, and copies materials through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));
    const createMaterialForm = within(
      screen.getByRole("form", { name: "材料表单" }),
    );
    fireEvent.change(screen.getByLabelText("材料标题"), {
      target: { value: "新建案例材料" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("等级"), {
      target: { value: "4" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("科目"), {
      target: { value: "theory" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("材料正文"), {
      target: { value: "新建材料正文" },
    });
    fireEvent.click(
      createMaterialForm.getByRole("button", { name: "保存材料" }),
    );

    expect(
      await screen.findByText("材料“新建案例材料”已保存"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("材料“新建案例材料”已保存").closest('[role="status"]'),
    ).toHaveAttribute("data-admin-feedback-tone", "success");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
          "content-type": "application/json",
        }),
      }),
    );
    expect(
      readJsonRequestBody(fetchMock, "/api/v1/materials", "POST"),
    ).toMatchObject({
      contentRichText: "新建材料正文",
      level: 4,
      profession: "marketing",
      subject: "theory",
      title: "新建案例材料",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: `编辑材料 ${marketingMaterialReadableName}`,
      }),
    );
    const editMaterialForm = within(
      screen.getByRole("form", { name: "材料表单" }),
    );
    fireEvent.change(editMaterialForm.getByLabelText("材料标题"), {
      target: { value: "编辑后的材料" },
    });
    fireEvent.change(editMaterialForm.getByLabelText("等级"), {
      target: { value: "5" },
    });
    fireEvent.click(editMaterialForm.getByRole("button", { name: "保存材料" }));

    expect(
      await screen.findByText("材料“编辑后的材料”已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/materials/material-marketing-001",
        "PATCH",
      ),
    ).toMatchObject({
      level: 5,
      profession: "marketing",
      status: "available",
      subject: "theory",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "停用材料 编辑后的材料（可用）",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认停用材料？");
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));

    const disabledMaterialRow = await screen.findByTestId(
      "material-row-material-marketing-001",
    );
    await waitFor(() =>
      expect(disabledMaterialRow).toHaveTextContent("已停用"),
    );
    fireEvent.click(
      within(disabledMaterialRow).getByRole("button", {
        name: /复制材料/,
      }),
    );

    expect(
      await screen.findByTestId("material-row-material-marketing-001-copy"),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001/disable",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001/copy",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("prevents saving material rich text above the SSOT 30000 character limit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));

    const materialForm = within(screen.getByRole("form", { name: "材料表单" }));
    fireEvent.change(materialForm.getByLabelText("材料正文"), {
      target: { value: "材".repeat(30001) },
    });

    expect(materialForm.getByText("30001/30000")).toBeInTheDocument();
    expect(
      materialForm.getByText("材料正文超过 30000 字符，不能保存。"),
    ).toBeInTheDocument();
    expect(
      materialForm.getByRole("button", { name: "保存材料" }),
    ).toBeEnabled();
    fireEvent.click(materialForm.getByRole("button", { name: "保存材料" }));
    expect(materialForm.getByRole("alert")).toHaveTextContent(
      "材料正文超过 30000 字符，不能保存。",
    );
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/materials" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
  });

  it("uploads a managed material content_image before inserting its canonical reference", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));

    const materialForm = within(screen.getByRole("form", { name: "材料表单" }));
    fireEvent.change(materialForm.getByLabelText("材料标题"), {
      target: { value: "受管图片材料" },
    });
    fireEvent.change(materialForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(materialForm.getByLabelText("等级"), {
      target: { value: "3" },
    });
    fireEvent.change(materialForm.getByLabelText("科目"), {
      target: { value: "theory" },
    });
    fireEvent.click(materialForm.getByRole("button", { name: "插入表格模板" }));
    fireEvent.click(materialForm.getByRole("button", { name: "保存材料" }));
    expect(materialForm.getByRole("alert")).toHaveTextContent(
      "请输入有效材料正文",
    );
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/materials" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
    fireEvent.change(materialForm.getByLabelText("选择材料图片"), {
      target: {
        files: [
          new File([new Uint8Array([1, 2, 3])], "diagram.png", {
            type: "image/png",
          }),
        ],
      },
    });
    await materialForm.findByText("图片已上传并插入。");

    const contentInput = materialForm.getByLabelText(
      "材料正文",
    ) as HTMLTextAreaElement;

    expect(contentInput.value).toContain("<img");
    expect(contentInput.value).toContain(
      'data-content-image-public-id="content-image-uploaded-001"',
    );
    expect(contentInput.value).toContain(
      "/api/v1/content-images/content-image-uploaded-001",
    );
    expect(contentInput.value).not.toContain("paper-assets");
    expect(contentInput.value).toContain("<table>");
    fireEvent.click(materialForm.getByRole("button", { name: "保存材料" }));
    await screen.findByText("材料“新建案例材料”已保存");
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/materials" &&
          requestInit?.method === "POST",
      ),
    ).toHaveLength(1);
  });
});
