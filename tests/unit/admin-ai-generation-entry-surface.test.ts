import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAiGenerationEntryPage } from "@/features/admin/ai-generation/AdminAiGenerationEntryPage";
import type { AdminRole } from "@/server/models/auth";

const workspaceRoot = process.cwd();
const diagnosticAdminLocalContractSummary =
  "redacted admin AI generation local contract summary";
const businessAdminGeneratedResultFallback = "生成草稿已创建，待评审查看";
const crossRoleAiGenerationSurfacePaths = [
  "src/app/(student)/ai-generation/page.tsx",
  "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
  "src/app/(admin)/content/ai-question-generation/page.tsx",
  "src/app/(admin)/content/ai-paper-generation/page.tsx",
  "src/app/(admin)/organization/ai-question-generation/page.tsx",
  "src/app/(admin)/organization/ai-paper-generation/page.tsx",
  "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
];
const ordinaryUiForbiddenTechnicalPhrases = ["合同已就绪", "本地验证证据"];

function createSessionResponse(input: {
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
}) {
  const organizationPublicId = input.organizationPublicId ?? null;
  const isOrganizationAdvancedAdmin =
    input.adminRoles.includes("org_advanced_admin");
  const isOrganizationStandardAdmin =
    input.adminRoles.includes("org_standard_admin");
  const adminWorkspaceCapability =
    isOrganizationAdvancedAdmin || isOrganizationStandardAdmin
      ? {
          adminRoles: input.adminRoles,
          organizationPublicId,
          organizationEffectiveEdition: isOrganizationAdvancedAdmin
            ? "advanced"
            : "standard",
          organizationAuthorizationSource: "org_auth",
          capabilitySource: "service_computed",
          canUseOrganizationAdvancedWorkspace:
            isOrganizationAdvancedAdmin && organizationPublicId !== null,
        }
      : undefined;

  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "admin_user_public_123",
        phone: "13800000000",
        name: "local admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId,
        adminPublicId: "admin_public_123",
        adminRoles: input.adminRoles,
        ...(adminWorkspaceCapability === undefined
          ? {}
          : { adminWorkspaceCapability }),
      },
      session: {
        expiresAt: "2026-06-26T20:00:00.000Z",
      },
    },
  };
}

function createLocalContractResponse(input: {
  workspace: "content" | "organization";
  generationKind: "question" | "paper";
}) {
  const isContent = input.workspace === "content";
  const isQuestion = input.generationKind === "question";
  const ownerPublicId = isContent
    ? "platform_content_review_pool"
    : "organization_public_123";

  return {
    code: 0,
    message: "ok",
    data: {
      runtimeStatus: "local_contract_only",
      workspace: input.workspace,
      generationKind: input.generationKind,
      flowStatus: "accepted",
      redactionStatus: "redacted",
      taskRequest: {
        runtimeStatus: "local_contract_only",
        decision: "create_pending_task",
        taskPublicId: `admin_ai_generation_task_${input.workspace}_${input.generationKind}`,
        taskType: isQuestion ? "ai_question_generation" : "ai_paper_generation",
        initialStatus: "pending",
        blockedFailureCategory: null,
        authorizationSource: isContent ? "admin_role" : "org_auth",
        authorizationPublicId: isContent
          ? "admin_role_content_ai_generation"
          : "org_auth_local_contract_organization_public_123",
        actorPublicId: "admin_public_123",
        ownerType: isContent ? "platform" : "organization",
        ownerPublicId,
        organizationPublicId: isContent ? null : "organization_public_123",
        quotaOwnerType: isContent ? "platform" : "organization",
        quotaOwnerPublicId: ownerPublicId,
        idempotency: {
          keyHash: `sha256:${input.workspace}_${input.generationKind}`,
          reuseTaskPublicId: null,
        },
        resultReference: {
          resultKind: isQuestion
            ? "ai_generated_question_set"
            : "ai_generated_paper_draft",
          resultPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "none",
          citationCount: 0,
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
      },
      resultState: {
        status: "pending",
        taskPublicId: `admin_ai_generation_task_${input.workspace}_${input.generationKind}`,
        resultPublicId: null,
        contentVisibility: "summary_only",
        evidenceStatus: "none",
        citationCount: 0,
        redactionStatus: "redacted",
      },
      runtimeBridge: {
        bridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        envSecretAccessed: false,
        providerConfigurationRead: false,
        costCalibrationExecuted: false,
        visibleGeneratedContent: null,
        redactionStatus: "redacted",
      },
      formalContentBoundary: {
        questionWriteStatus: "blocked_without_follow_up_task",
        paperWriteStatus: "blocked_without_follow_up_task",
      },
      taskPersistence: {
        persistenceStatus: "created",
        requestPublicId: `admin_ai_generation_request_${input.workspace}_${input.generationKind}`,
        taskPublicId: `admin_ai_generation_task_${input.workspace}_${input.generationKind}`,
        status: "pending",
        resultPublicId: null,
        contentVisibility: "summary_only",
        evidenceStatus: "none",
        citationCount: 0,
        redactionStatus: "redacted",
      },
    },
  };
}

function createTaskHistoryResponse(input: {
  workspace: "content" | "organization";
  generationKind: "question" | "paper";
  generatedResult?: {
    contentPreviewMasked: string;
    contentVisibility?: "redacted_snapshot";
    resultPublicId: string;
  } | null;
  taskPublicId?: string;
}) {
  const isQuestion = input.generationKind === "question";
  const taskPublicId =
    input.taskPublicId ??
    `admin_ai_generation_task_${input.workspace}_${input.generationKind}_history`;
  const resultPublicId = input.generatedResult?.resultPublicId ?? null;
  const generatedResult =
    input.generatedResult === undefined || input.generatedResult === null
      ? null
      : {
          resultPublicId,
          persistedAt: "2026-06-26T20:31:00.000Z",
          status: "draft",
          contentPreviewMasked: input.generatedResult.contentPreviewMasked,
          contentVisibility:
            input.generatedResult.contentVisibility ?? "redacted_snapshot",
          evidenceStatus: "none",
          citationCount: 0,
          formalAdoptionStatus: "blocked",
          redactionStatus: "redacted",
        };

  return {
    code: 0,
    message: "ok",
    data: {
      workspace: input.workspace,
      latestTask: {
        taskPublicId,
        requestPublicId: `${taskPublicId}_request`,
        generationKind: input.generationKind,
        taskType: isQuestion ? "ai_question_generation" : "ai_paper_generation",
        status: generatedResult === null ? "pending" : "succeeded",
        requestedAt: "2026-06-26T20:30:00.000Z",
        resultPublicId,
        contentVisibility: "summary_only",
        evidenceStatus: "none",
        citationCount: 0,
        runtimeStatus: "local_contract_only",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        envSecretAccessed: false,
        providerConfigurationRead: false,
        costCalibrationExecuted: false,
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        generatedResult,
        redactionStatus: "redacted",
      },
      items: [
        {
          taskPublicId,
          requestPublicId: `${taskPublicId}_request`,
          generationKind: input.generationKind,
          taskType: isQuestion
            ? "ai_question_generation"
            : "ai_paper_generation",
          status: generatedResult === null ? "pending" : "succeeded",
          requestedAt: "2026-06-26T20:30:00.000Z",
          resultPublicId,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          runtimeStatus: "local_contract_only",
          runtimeBridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
          formalContentBoundary: {
            questionWriteStatus: "blocked_without_follow_up_task",
            paperWriteStatus: "blocked_without_follow_up_task",
          },
          generatedResult,
          redactionStatus: "redacted",
        },
      ],
      redactionStatus: "redacted",
    },
  };
}

function createEmptyTaskHistoryResponse(workspace: "content" | "organization") {
  return {
    code: 0,
    message: "ok",
    data: {
      workspace,
      latestTask: null,
      items: [],
      redactionStatus: "redacted",
    },
  };
}

function isAdminAiGenerationHistoryRequest(
  url: string | URL,
  path: string,
  init?: RequestInit,
): boolean {
  return init?.method !== "POST" && String(url).startsWith(`${path}?`);
}

function isAdminAiGenerationPostRequest(
  url: string | URL,
  path: string,
  init?: RequestInit,
): boolean {
  return String(url) === path && init?.method === "POST";
}

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
  vi.unstubAllGlobals();
});

function readExpectedSource(sourcePath: string) {
  const absoluteSourcePath = join(workspaceRoot, sourcePath);

  expect(existsSync(absoluteSourcePath)).toBe(true);

  return existsSync(absoluteSourcePath)
    ? readFileSync(absoluteSourcePath, "utf8")
    : "";
}

describe("admin AI generation entry surfaces", () => {
  it("wires content AI question and paper generation routes to the shared draft review surface", () => {
    const questionRouteSource = readExpectedSource(
      "src/app/(admin)/content/ai-question-generation/page.tsx",
    );
    const paperRouteSource = readExpectedSource(
      "src/app/(admin)/content/ai-paper-generation/page.tsx",
    );
    const sharedSurfaceSource = readExpectedSource(
      "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
    );

    expect(questionRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(questionRouteSource).toContain('workspace="content"');
    expect(questionRouteSource).toContain('generationKind="question"');
    expect(paperRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(paperRouteSource).toContain('workspace="content"');
    expect(paperRouteSource).toContain('generationKind="paper"');
    expect(sharedSurfaceSource).toContain("内容 AI 草稿/评审");
    expect(sharedSurfaceSource).toContain("正式题目或试卷写入仍需评审");
    expect(sharedSurfaceSource).not.toContain("本地 owner preview");
    expect(sharedSurfaceSource).not.toContain("本地生成");
    expect(sharedSurfaceSource).not.toContain("本地预览");
    expect(sharedSurfaceSource).not.toContain("modelProvider");
    expect(sharedSurfaceSource).not.toContain("providerPayload");
  });

  it("keeps visible generation instruction sources free of local preview wording", () => {
    const adminRuntimeBridgeSource = readExpectedSource(
      "src/server/services/admin-ai-generation-runtime-bridge-service.ts",
    );
    const personalProviderSource = readExpectedSource(
      "src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts",
    );

    for (const source of [adminRuntimeBridgeSource, personalProviderSource]) {
      expect(source).not.toContain("本地 owner preview");
      expect(source).not.toMatch(/owner preview/iu);
      expect(source).not.toContain("本地预览");
    }
  });

  it("wires organization AI routes to organization-owned advanced-only surfaces", () => {
    const questionRouteSource = readExpectedSource(
      "src/app/(admin)/organization/ai-question-generation/page.tsx",
    );
    const paperRouteSource = readExpectedSource(
      "src/app/(admin)/organization/ai-paper-generation/page.tsx",
    );
    const portalRouteSource = readExpectedSource(
      "src/app/(admin)/organization/portal/page.tsx",
    );
    const trainingRouteSource = readExpectedSource(
      "src/app/(admin)/organization/organization-training/page.tsx",
    );
    const analyticsRouteSource = readExpectedSource(
      "src/app/(admin)/organization/organization-analytics/page.tsx",
    );
    const sharedSurfaceSource = readExpectedSource(
      "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
    );
    const organizationWorkspaceAccessSource = readExpectedSource(
      "src/features/admin/organization-workspace/admin-organization-workspace-access.ts",
    );

    expect(questionRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(questionRouteSource).toContain('workspace="organization"');
    expect(questionRouteSource).toContain('generationKind="question"');
    expect(paperRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(paperRouteSource).toContain('workspace="organization"');
    expect(paperRouteSource).toContain('generationKind="paper"');
    expect(portalRouteSource).toContain("AdminOrganizationPortalPage");
    expect(trainingRouteSource).toContain("AdminOrganizationTrainingPage");
    expect(analyticsRouteSource).toContain("AdminOrganizationAnalyticsPage");
    expect(sharedSurfaceSource).toContain(
      "resolveOrganizationWorkspacePageAccess",
    );
    expect(organizationWorkspaceAccessSource).toContain(
      "AdminWorkspaceCapabilitySummary",
    );
    expect(organizationWorkspaceAccessSource).toContain(
      "resolveAdminWorkspaceRouteAccess",
    );
    expect(sharedSurfaceSource).toContain("标准版暂不可用");
    expect(sharedSurfaceSource).not.toContain(
      "/content/ai-question-generation",
    );
    expect(sharedSurfaceSource).not.toContain("/content/ai-paper-generation");
  });

  it("keeps cross-role ordinary AI generation surfaces free of contract-ready technical wording", () => {
    const sourceByPath = crossRoleAiGenerationSurfacePaths.map(
      (sourcePath) => ({
        sourcePath,
        source: readExpectedSource(sourcePath),
      }),
    );

    expect(
      sourceByPath.find(
        ({ source }) =>
          source.includes("AdminAiGenerationEntryPage") ||
          source.includes("StudentPersonalAiGenerationPage"),
      ),
    ).not.toBeUndefined();

    for (const { source, sourcePath } of sourceByPath) {
      for (const forbiddenPhrase of ordinaryUiForbiddenTechnicalPhrases) {
        expect(source, sourcePath).not.toContain(forbiddenPhrase);
      }
    }
  });

  it("renders content AI question generation detail controls before any local contract request", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json(createEmptyTaskHistoryResponse("content"));
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    const detailControls = await screen.findByTestId(
      "admin-ai-generation-detail-controls",
    );

    expect(detailControls).toHaveTextContent("专业");
    expect(detailControls).toHaveTextContent("等级");
    expect(detailControls).toHaveTextContent("科目");
    expect(detailControls).toHaveTextContent("知识点");
    expect(detailControls).toHaveTextContent("题型");
    expect(detailControls).toHaveTextContent("出题数量");
    expect(detailControls).toHaveTextContent("难度");
    expect(detailControls).toHaveTextContent("学习目标");
    expect(detailControls).toHaveTextContent("草稿评审");
    expect(screen.getByLabelText("专业")).toHaveDisplayValue("市场营销");
    expect(screen.getByLabelText("等级")).toHaveDisplayValue("3级");
    expect(detailControls).toHaveTextContent("1级");
    expect(detailControls).toHaveTextContent("5级");
    expect(detailControls).not.toHaveTextContent("高级工");
    expect(detailControls).not.toHaveTextContent("中级工");
    expect(detailControls).not.toHaveTextContent("技师");
    expect(screen.getByLabelText("科目")).toHaveDisplayValue("理论知识");
    expect(screen.getByLabelText("题型")).toHaveDisplayValue("单选题");
    fireEvent.change(screen.getByLabelText("专业"), {
      target: { value: "物流管理" },
    });
    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "多选题" },
    });
    expect(screen.getByLabelText("专业")).toHaveDisplayValue("物流管理");
    expect(screen.getByLabelText("题型")).toHaveDisplayValue("多选题");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
    ]);
  });

  it("renders organization AI paper generation detail controls before Provider execution", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_advanced_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
        )
      ) {
        return Response.json(createEmptyTaskHistoryResponse("organization"));
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "paper",
      }),
    );

    const detailControls = await screen.findByTestId(
      "admin-ai-generation-detail-controls",
    );

    expect(detailControls).toHaveTextContent("专业");
    expect(detailControls).toHaveTextContent("等级");
    expect(detailControls).toHaveTextContent("科目");
    expect(detailControls).toHaveTextContent("题目数量");
    expect(detailControls).toHaveTextContent("题型分布");
    expect(detailControls).toHaveTextContent("难度");
    expect(detailControls).toHaveTextContent("知识点覆盖");
    expect(detailControls).toHaveTextContent("试卷结构");
    expect(detailControls).toHaveTextContent("组卷目标");
    expect(detailControls).toHaveTextContent("组织草稿");
    expect(screen.getByLabelText("等级")).toHaveDisplayValue("3级");
    expect(screen.getByLabelText("试卷结构")).toHaveDisplayValue(
      "按大题模块组织",
    );
    expect(screen.getByLabelText("题型分布")).toHaveDisplayValue(
      "单选 40% / 多选 30% / 判断 30%",
    );
    expect(document.body.textContent).not.toContain("providerPayload");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/organization-ai-generation-requests?generationKind=paper&page=1&pageSize=10",
    ]);
  });

  it("submits content admin local contract requests and renders a redacted summary", async () => {
    globalThis.localStorage?.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token",
    );
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationPostRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        expect(init).toMatchObject({
          method: "POST",
        });

        return Response.json(
          createLocalContractResponse({
            workspace: "content",
            generationKind: "question",
          }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "content",
            generationKind: "question",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    await waitFor(() => {
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
        "/api/v1/sessions",
        "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
        "/api/v1/content-ai-generation-requests",
        "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
      ]);
    });
    const requestInit = fetchMock.mock.calls[2]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      generationKind: "question",
      generationParameters: {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNode: "卷烟营销基础",
        questionType: "single_choice",
        questionCount: 10,
      },
    });
    expect(
      await screen.findByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("草稿已提交");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).not.toHaveTextContent("summary_only");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).not.toHaveTextContent("本地合约");
    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("待生成");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "admin_ai_generation_task_content_question_history",
    );
    expect(document.body.textContent).not.toContain("OMITTED_UI_FIXTURE_A");
    expect(document.body.textContent).not.toContain("OMITTED_UI_FIXTURE_B");
    expect(document.body.textContent).not.toContain("已脱敏");
    expect(document.body.textContent).not.toContain("contentVisibility");
  });

  it("renders transient visible generated content for provider-enabled admin responses", async () => {
    globalThis.localStorage?.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token",
    );
    const blockedResponse = createLocalContractResponse({
      workspace: "content",
      generationKind: "paper",
    });
    const providerVisibleResponse = {
      ...blockedResponse,
      data: {
        ...blockedResponse.data,
        runtimeBridge: {
          ...blockedResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          visibleGeneratedContent: {
            content: "后台本次生成草稿：包含试卷结构和知识点覆盖建议。",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 2,
              questionCount: 50,
              questionTypeDistributionCount: 3,
              knowledgeCoverageCount: 4,
              reviewStatus: "draft_review_required",
            },
          },
          redactionStatus: "redacted",
        },
      },
    };

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationPostRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(createEmptyTaskHistoryResponse("content"));
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "paper",
      }),
    );

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    expect(
      await screen.findByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("后台本次生成草稿：包含试卷结构和知识点覆盖建议。");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("结构化预览");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("大题模块 2");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("题量 50");
    expect(
      screen
        .getByTestId("admin-visible-generated-content")
        .compareDocumentPosition(
          screen.getByTestId("admin-ai-generation-task-history"),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("submits organization advanced admin local contract requests to the organization API", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_advanced_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      if (
        isAdminAiGenerationPostRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          createLocalContractResponse({
            workspace: "organization",
            generationKind: "paper",
          }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "organization",
            generationKind: "paper",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "paper",
      }),
    );

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    await waitFor(() => {
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
        "/api/v1/sessions",
        "/api/v1/organization-ai-generation-requests?generationKind=paper&page=1&pageSize=10",
        "/api/v1/organization-ai-generation-requests",
        "/api/v1/organization-ai-generation-requests?generationKind=paper&page=1&pageSize=10",
      ]);
    });
    expect(
      await screen.findByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("暂无生成结果");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("资料不足");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).not.toHaveTextContent("summary_only");
    expect(document.body.textContent).not.toContain("Provider");
    expect(document.body.textContent).not.toContain("provider_call_blocked");
  });

  it("does not render a submit action for organization standard admins", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_standard_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    await waitFor(() => {
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
        "/api/v1/sessions",
      ]);
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "升级需由运营管理员维护高级版企业授权",
    );
    expect(await screen.findByRole("alert")).not.toHaveTextContent("org_auth");
    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "standard-unavailable",
    );
    expect(screen.getByRole("link", { name: "返回组织概览" })).toHaveAttribute(
      "href",
      "/organization/portal",
    );
    expect(screen.queryByTestId("admin-ai-generation-submit")).toBeNull();
    expect(
      screen.queryByTestId("admin-ai-generation-local-contract-summary"),
    ).toBeNull();
  });

  it("loads recent provider-disabled task history for content admin without showing public id lists", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "content",
            generationKind: "paper",
            taskPublicId: "admin_ai_generation_task_content_paper_secret_123",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "paper",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("最近任务");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("AI组卷");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("待生成");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("需后续评审");
    expect(document.body.textContent).not.toContain(
      "admin_ai_generation_task_content_paper_secret_123",
    );
  });

  it("converts persisted diagnostic generated result summaries for content admin history", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_history_hidden_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_history_hidden_456";
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for content history",
            },
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent(businessAdminGeneratedResultFallback);
    const historyPanel = screen.getByTestId("admin-ai-generation-task-history");
    expect(historyPanel).toHaveTextContent("草稿快照");
    expect(historyPanel).toHaveTextContent("需审核后采用");
    expect(historyPanel).not.toHaveTextContent("已阻断");
    expect(document.body.textContent).not.toContain(
      "redacted generated result summary for content history",
    );
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("rawOutput");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("converts diagnostic local contract fallback text before rendering admin history", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_history_diagnostic_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_history_diagnostic_456";
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked: diagnosticAdminLocalContractSummary,
            },
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    const historyPanel = await screen.findByTestId(
      "admin-ai-generation-task-history",
    );

    expect(historyPanel).toHaveTextContent(
      businessAdminGeneratedResultFallback,
    );
    expect(historyPanel).not.toHaveTextContent(
      diagnosticAdminLocalContractSummary,
    );
    expect(historyPanel).not.toHaveTextContent("local contract");
    expect(historyPanel).not.toHaveTextContent("本地合约");
    expect(historyPanel).not.toHaveTextContent("redacted");
  });

  it("submits content admin review adoption for a single persisted generated result without exposing sensitive content", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_review_hidden_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_review_hidden_456";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for review traceability",
            },
          }),
        );
      }

      if (String(url) === adoptionUrl && init?.method === "POST") {
        const adoptionRequestBody = JSON.parse(String(init.body));

        expect(adoptionRequestBody).toMatchObject({
          reviewDecision: "approved",
          reviewerConfirmed: true,
          targetType: "question",
        });
        expect(adoptionRequestBody.reviewedDraft).toMatchObject({
          profession: "marketing",
          questionType: "single_choice",
          subject: "theory",
        });
        expect(JSON.stringify(adoptionRequestBody)).not.toContain("rawPrompt");
        expect(JSON.stringify(adoptionRequestBody)).not.toContain("rawOutput");
        expect(JSON.stringify(adoptionRequestBody)).not.toContain(
          "providerPayload",
        );

        return Response.json({
          code: 0,
          message: "ok",
          data: {
            persistenceStatus: "created",
            adoption: {
              redactionStatus: "redacted",
            },
          },
        });
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    const traceabilityPanel = await screen.findByTestId(
      "content-admin-review-traceability",
    );

    expect(traceabilityPanel).toHaveTextContent("单次结果可追溯");
    expect(traceabilityPanel).toHaveTextContent("待评审");
    expect(traceabilityPanel).toHaveTextContent("正式发布需单独审批");
    expect(traceabilityPanel).toHaveTextContent("未执行");
    expect(traceabilityPanel).not.toHaveTextContent("single_result_traceable");
    expect(traceabilityPanel).not.toHaveTextContent("awaiting_metadata_review");
    expect(traceabilityPanel).not.toHaveTextContent(
      "blocked_requires_fresh_publish_task",
    );
    expect(traceabilityPanel).not.toHaveTextContent("not_executed");
    const localValidationPanel = await screen.findByTestId(
      "content-admin-review-batch-retry-diff-history-local-validation",
    );
    expect(localValidationPanel).toHaveTextContent("批量选择预览");
    expect(localValidationPanel).toHaveTextContent("失败重试状态");
    expect(localValidationPanel).toHaveTextContent("结果差异查看");
    expect(localValidationPanel).toHaveTextContent("采用历史查看");
    expect(localValidationPanel).toHaveTextContent("仅提交请求");
    expect(localValidationPanel).toHaveTextContent("只读查看");
    expect(localValidationPanel).toHaveTextContent("未执行");
    expect(localValidationPanel).not.toHaveTextContent(
      "batch_selection_preview",
    );
    expect(localValidationPanel).not.toHaveTextContent("failed_retry_state");
    expect(localValidationPanel).not.toHaveTextContent(
      "result_diff_read_model",
    );
    expect(localValidationPanel).not.toHaveTextContent(
      "adoption_history_read_model",
    );
    expect(localValidationPanel).not.toHaveTextContent("request_only");
    expect(localValidationPanel).not.toHaveTextContent("read_only");
    expect(localValidationPanel).not.toHaveTextContent("not_executed");
    expect(
      screen.getByTestId("content-admin-review-adopt-action"),
    ).toBeEnabled();
    expect(
      screen.getByTestId("content-admin-review-reject-action"),
    ).toBeEnabled();
    expect(
      screen.getByTestId("content-admin-review-adopt-action"),
    ).toHaveTextContent("采用草稿");
    expect(
      screen.getByTestId("content-admin-review-reject-action"),
    ).toHaveTextContent("驳回草稿");

    fireEvent.click(screen.getByTestId("content-admin-review-adopt-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        adoptionUrl,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      await screen.findByText("草稿采用已提交；正式发布仍需单独校验。"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("adopt_disabled");
    expect(document.body.textContent).not.toContain("reject_disabled");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
      adoptionUrl,
      "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
    ]);
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("rawOutput");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("converts persisted diagnostic generated result summaries for organization advanced admin history", async () => {
    const taskPublicId =
      "admin_ai_generation_task_organization_paper_history_hidden_789";
    const resultPublicId =
      "admin_ai_generation_result_organization_paper_history_hidden_789";
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_advanced_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "organization",
            generationKind: "paper",
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for organization history",
            },
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "paper",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent(businessAdminGeneratedResultFallback);
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("组织草稿池");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("草稿快照");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("Provider");
    expect(document.body.textContent).not.toContain(
      "redacted generated result summary for organization history",
    );
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
  });

  it("shows an empty history state before any provider-disabled task exists", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json(createEmptyTaskHistoryResponse("content"));
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("暂无任务记录");
  });

  it("shows organization-specific empty history guidance without enabling Provider", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_advanced_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
        )
      ) {
        return Response.json(createEmptyTaskHistoryResponse("organization"));
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("组织草稿池暂无任务记录");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("模型服务仍待审批");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("不会生成正式题目或试卷");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("Provider");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("question");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("paper");
  });

  it("shows a redacted history error state when metadata history loading fails", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
        )
      ) {
        return Response.json({
          code: 500001,
          message: "synthetic failure",
          data: null,
        });
      }

      throw new Error(`Unexpected fetch: ${String(url)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    expect(
      await screen.findByTestId("admin-ai-generation-task-history-error"),
    ).toHaveTextContent("任务历史暂不可用");
    expect(document.body.textContent).not.toContain("synthetic failure");
  });
});
