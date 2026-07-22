import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAiGenerationEntryPage } from "@/features/admin/ai-generation/AdminAiGenerationEntryPage";
import type { AdminRole } from "@/server/models/auth";

vi.mock("@/features/admin/content-admin-runtime", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/admin/content-admin-runtime")
    >();

  return {
    ...actual,
    async fetchAdminApi<TData>(
      path: string,
      sessionToken: string | null,
      init: RequestInit = {},
    ) {
      if (path === "/api/v1/ai-generation/availability") {
        return {
          code: 0,
          message: "ok",
          data: { generationAvailability: "available" } as TData,
        };
      }

      return actual.fetchAdminApi<TData>(path, sessionToken, init);
    },
  };
});

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
  organizationAuthorizationPublicId?: string | null;
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
          organizationAuthorizationPublicId:
            input.organizationAuthorizationPublicId ??
            (isOrganizationAdvancedAdmin && organizationPublicId !== null
              ? "org_auth_session_public_123"
              : null),
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
          : "org_auth_session_public_123",
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
      paperAssembly: null,
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

function createContentPaperAssembly(
  input: {
    matchQuality?:
      | "fully_matched"
      | "supplemented_from_nearby_knowledge"
      | "supplemented_from_same_scope"
      | "insufficient";
    requestedQuestionCount?: number;
    selectedQuestionCount?: number;
    insufficiency?: { missingQuestionCount: number } | null;
  } = {},
) {
  const requestedQuestionCount = input.requestedQuestionCount ?? 2;
  const selectedQuestionCount =
    input.selectedQuestionCount ?? requestedQuestionCount;
  const matchQuality = input.matchQuality ?? "fully_matched";

  return {
    status: matchQuality === "insufficient" ? "insufficient" : "assembled",
    sourceDiagnostics: {
      role: "content_admin",
      platformQuestionCount: selectedQuestionCount,
      enterpriseQuestionCount: 0,
      enterpriseSourceStatus: "not_applicable",
    },
    container: {
      title: "待审试卷草稿",
      profession: "marketing",
      level: 3,
      subject: "theory",
      requestedQuestionCount,
      selectedQuestionCount,
      sourceComposition: {
        platformFormalQuestionCount: selectedQuestionCount,
        enterpriseTrainingSnapshotCount: 0,
      },
      matchQuality,
      sections: [
        {
          sectionKey: "single_choice",
          title: "单选题",
          questionType: "single_choice",
          targetQuestionCount: requestedQuestionCount,
          selectedQuestionCount,
          selectedQuestions: [
            {
              questionPublicId: "platform_formal_question_public_a",
              sourceKind: "platform_formal_question",
              matchTier: "exact",
              score: 1,
            },
            {
              questionPublicId: "platform_formal_question_public_b",
              sourceKind: "platform_formal_question",
              matchTier: "nearby_knowledge",
              score: 1,
            },
          ],
          degradationSummary: {
            exactCount:
              matchQuality === "fully_matched" ? selectedQuestionCount : 0,
            nearbyKnowledgeCount:
              matchQuality === "supplemented_from_nearby_knowledge"
                ? selectedQuestionCount
                : 0,
            sameScopeCount:
              matchQuality === "supplemented_from_same_scope"
                ? selectedQuestionCount
                : 0,
          },
        },
      ],
    },
    insufficiency: input.insufficiency ?? null,
    redactionStatus: "redacted",
  };
}

function createTaskHistoryResponse(input: {
  workspace: "content" | "organization";
  generationKind: "question" | "paper";
  generatedResult?: {
    contentDigest?: string;
    contentPreviewMasked: string;
    contentVisibility?: "redacted_snapshot";
    evidenceStatus?: "none" | "weak" | "sufficient";
    citationCount?: number;
    formalAdoptionStatus?:
      | "blocked"
      | "approved_for_formal_adoption"
      | "draft_created"
      | "rejected";
    formalAdoptionReviewStatus?:
      | "approved_for_formal_adoption"
      | "rejected"
      | null;
    formalQuestionPublicId?: string | null;
    formalPaperPublicId?: string | null;
    formalTargetWriteStatus?:
      | "blocked_without_follow_up_task"
      | "draft_created"
      | null;
    formalAdoptionReviewedAt?: string | null;
    resultPublicId: string;
    reviewedDraft?: unknown;
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
          contentDigest:
            input.generatedResult.contentDigest ??
            "sha256:admin_ai_generation_history_result",
          contentPreviewMasked: input.generatedResult.contentPreviewMasked,
          contentVisibility:
            input.generatedResult.contentVisibility ?? "redacted_snapshot",
          evidenceStatus: input.generatedResult.evidenceStatus ?? "none",
          citationCount: input.generatedResult.citationCount ?? 0,
          formalAdoptionStatus:
            input.generatedResult.formalAdoptionStatus ?? "blocked",
          formalAdoptionReviewStatus:
            input.generatedResult.formalAdoptionReviewStatus ?? null,
          formalTargetWriteStatus:
            input.generatedResult.formalTargetWriteStatus ?? null,
          formalQuestionPublicId:
            input.generatedResult.formalQuestionPublicId ?? null,
          formalPaperPublicId:
            input.generatedResult.formalPaperPublicId ?? null,
          formalAdoptionReviewedAt:
            input.generatedResult.formalAdoptionReviewedAt ?? null,
          reviewedDraft: input.generatedResult.reviewedDraft ?? null,
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
        evidenceStatus: input.generatedResult?.evidenceStatus ?? "none",
        citationCount: input.generatedResult?.citationCount ?? 0,
        authorizationPublicId:
          input.workspace === "organization"
            ? "org_auth_session_public_123"
            : "admin_role_content_ai_generation",
        ownerPublicId:
          input.workspace === "organization"
            ? "organization_public_123"
            : "platform_content_review_pool",
        organizationPublicId:
          input.workspace === "organization" ? "organization_public_123" : null,
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
        organizationOwnedDraftBoundary: {
          generatedResultScope:
            input.workspace === "organization"
              ? "organization_private"
              : "platform_review_pool",
          organizationDraftAdoptionStatus:
            input.workspace === "organization"
              ? "allowed_as_organization_private_draft"
              : "not_applicable_to_content_workspace",
          organizationTrainingSourceStatus:
            input.workspace === "organization"
              ? "allowed_as_organization_private_training_source"
              : "not_applicable_to_content_workspace",
          platformFormalDraftStatus: "blocked_requires_content_admin_review",
          publishStatus: "blocked_requires_fresh_publish_task",
          studentVisibleStatus: "blocked",
          ownerType:
            input.workspace === "organization" ? "organization" : "platform",
          ownerPublicId:
            input.workspace === "organization"
              ? "organization_public_123"
              : "platform_content_review_pool",
          organizationPublicId:
            input.workspace === "organization"
              ? "organization_public_123"
              : null,
          redactionStatus: "redacted",
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
          evidenceStatus: input.generatedResult?.evidenceStatus ?? "none",
          citationCount: input.generatedResult?.citationCount ?? 0,
          authorizationPublicId:
            input.workspace === "organization"
              ? "org_auth_session_public_123"
              : "admin_role_content_ai_generation",
          ownerPublicId:
            input.workspace === "organization"
              ? "organization_public_123"
              : "platform_content_review_pool",
          organizationPublicId:
            input.workspace === "organization"
              ? "organization_public_123"
              : null,
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
          organizationOwnedDraftBoundary: {
            generatedResultScope:
              input.workspace === "organization"
                ? "organization_private"
                : "platform_review_pool",
            organizationDraftAdoptionStatus:
              input.workspace === "organization"
                ? "allowed_as_organization_private_draft"
                : "not_applicable_to_content_workspace",
            organizationTrainingSourceStatus:
              input.workspace === "organization"
                ? "allowed_as_organization_private_training_source"
                : "not_applicable_to_content_workspace",
            platformFormalDraftStatus: "blocked_requires_content_admin_review",
            publishStatus: "blocked_requires_fresh_publish_task",
            studentVisibleStatus: "blocked",
            ownerType:
              input.workspace === "organization" ? "organization" : "platform",
            ownerPublicId:
              input.workspace === "organization"
                ? "organization_public_123"
                : "platform_content_review_pool",
            organizationPublicId:
              input.workspace === "organization"
                ? "organization_public_123"
                : null,
            redactionStatus: "redacted",
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

function createAiKnowledgeNodeOptionsResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      knowledgeNodes: [
        {
          publicId: "knowledge-node-public-marketing-3",
          parentKnowledgeNodePublicId: null,
          profession: "marketing",
          levelList: [3],
          name: "市场调研",
          pathName: "营销/基础知识/市场调研",
          sortOrder: 10,
          knStatus: "active",
          questionCount: 0,
          isRecommendable: true,
          updatedAt: "2026-07-08T10:00:00.000Z",
        },
      ],
    },
    pagination: {
      page: 1,
      pageSize: 100,
      total: 1,
      sortBy: "sortOrder",
      sortOrder: "asc",
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
    expect(sharedSurfaceSource).toContain("内容 AI 辅助");
    expect(sharedSurfaceSource).toContain("AI出题工作台");
    expect(sharedSurfaceSource).toContain("AI组卷工作台");
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
    expect(detailControls).toHaveTextContent("知识点覆盖");
    expect(detailControls).toHaveTextContent("包含下级知识点");
    expect(detailControls).toHaveTextContent("知识点补充说明");
    expect(detailControls).toHaveTextContent("题型");
    expect(detailControls).toHaveTextContent("出题数量");
    expect(detailControls).toHaveTextContent("难度");
    expect(detailControls).toHaveTextContent("评审目标");
    expect(detailControls).toHaveTextContent("待审题目草稿");
    expect(screen.getByLabelText("专业")).toHaveDisplayValue("市场营销");
    expect(screen.getByLabelText("等级")).toHaveDisplayValue("3级");
    expect(detailControls).toHaveTextContent("1级");
    expect(detailControls).toHaveTextContent("5级");
    expect(detailControls).not.toHaveTextContent("高级工");
    expect(detailControls).not.toHaveTextContent("中级工");
    expect(detailControls).not.toHaveTextContent("技师");
    expect(screen.getByLabelText("科目")).toHaveDisplayValue("理论知识");
    expect(screen.getByLabelText("题型")).toHaveDisplayValue("单选题");
    expect(screen.getByLabelText("出题数量")).toHaveDisplayValue("3");
    expect(screen.getByLabelText("出题数量")).toHaveAttribute("max", "10");
    expect(screen.getByLabelText("知识点覆盖")).toHaveDisplayValue("均衡覆盖");
    expect(screen.getByLabelText("包含下级知识点")).toHaveDisplayValue(
      "不包含",
    );
    expect(screen.getByTestId("admin-ai-generation-submit")).toHaveTextContent(
      "生成题目草稿",
    );
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
    expect(detailControls).toHaveTextContent("训练试卷草稿");
    expect(screen.getByLabelText("等级")).toHaveDisplayValue("3级");
    expect(screen.getByLabelText("题目数量")).toHaveDisplayValue("30");
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

  it("renders content admin AI paper generation as platform-only reviewable paper draft", async () => {
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
        generationKind: "paper",
      }),
    );

    const detailControls = await screen.findByTestId(
      "admin-ai-generation-detail-controls",
    );

    expect(screen.getByText("内容 AI 辅助")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AI组卷工作台" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("题目数量")).toHaveDisplayValue("30");
    expect(screen.getByLabelText("题目数量")).toHaveAttribute("max", "80");
    expect(screen.getByLabelText("知识点覆盖")).toHaveDisplayValue("均衡覆盖");
    const adoptionBand = screen.getByTestId(
      "content-ai-adoption-lifecycle-band",
    );

    expect(adoptionBand).toHaveTextContent(
      "计划生成 -> 本地选题 -> 待审试卷草稿 -> 人工审阅",
    );
    expect(adoptionBand).toHaveTextContent("不直接发布正式试卷");
    expect(detailControls).toHaveTextContent("平台正式题库");
    expect(detailControls).not.toHaveTextContent("本企业已发布训练题");
    expect(detailControls).not.toHaveTextContent("优先使用企业题");
    expect(detailControls).not.toHaveTextContent("优先使用平台题");
    expect(screen.getByTestId("admin-ai-generation-submit")).toHaveTextContent(
      "生成组卷方案并本地选题",
    );
    expect(document.body).toHaveTextContent(
      "待审试卷草稿仍需编辑、驳回、审核和发布校验",
    );
    expect(document.body).not.toHaveTextContent("内容 AI组卷");
    expect(document.body).not.toHaveTextContent("Provider");
  });

  it("renders organization admin AI question generation as enterprise training draft workbench", async () => {
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

    expect(await screen.findByText("企业 AI 训练内容")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "训练题草稿" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-ai-generation-zone-context"),
    ).toHaveTextContent("企业 AI 训练内容");
    expect(
      screen.getByTestId("admin-ai-generation-zone-mode"),
    ).toHaveTextContent("AI出题");
    expect(
      screen.getByTestId("admin-ai-generation-zone-parameters"),
    ).toHaveTextContent("专业");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("只进入企业训练草稿");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("训练发布检查");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("依据资料状态");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).not.toHaveTextContent("草稿评审");
    expect(
      await screen.findByTestId("admin-ai-generation-zone-result-history"),
    ).toHaveTextContent("组织草稿池暂无任务记录");
    expect(screen.getByLabelText("出题数量")).toHaveDisplayValue("3");
    expect(screen.getByLabelText("出题数量")).toHaveAttribute("max", "10");
    expect(screen.getByTestId("admin-ai-generation-submit")).toHaveTextContent(
      "生成训练题草稿",
    );
    expect(document.body).toHaveTextContent(
      "这些题目还未发布，员工暂时看不到。",
    );
    expect(document.body).not.toHaveTextContent("组织 AI出题");
    expect(document.body).not.toHaveTextContent("Provider");
  });

  it("renders organization admin AI paper generation source and draft actions contract", async () => {
    const resultPublicId =
      "admin_ai_generation_result_organization_paper_recontract_hidden_001";
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
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for organization paper draft",
              evidenceStatus: "sufficient",
              citationCount: 2,
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

    const detailControls = await screen.findByTestId(
      "admin-ai-generation-detail-controls",
    );

    expect(screen.getByText("企业 AI 训练内容")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "训练试卷草稿" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("题目数量")).toHaveDisplayValue("30");
    expect(screen.getByLabelText("题目数量")).toHaveAttribute("max", "80");
    expect(screen.getByLabelText("题源偏好")).toHaveDisplayValue("均衡使用");
    expect(screen.getByLabelText("知识点覆盖")).toHaveDisplayValue("均衡覆盖");
    expect(detailControls).toHaveTextContent("平台正式题库");
    expect(detailControls).toHaveTextContent("本企业已发布训练题");
    expect(detailControls).toHaveTextContent("优先使用企业题");
    expect(detailControls).toHaveTextContent("优先使用平台题");
    expect(screen.getByTestId("admin-ai-generation-submit")).toHaveTextContent(
      "生成训练试卷草稿",
    );
    expect(
      screen.getByTestId("admin-ai-generation-zone-context"),
    ).toHaveTextContent("企业 AI 训练内容");
    expect(
      screen.getByTestId("admin-ai-generation-zone-mode"),
    ).toHaveTextContent("AI组卷");
    expect(
      screen.getByTestId("admin-ai-generation-zone-parameters"),
    ).toHaveTextContent("题源偏好");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("只进入企业训练草稿");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("训练发布检查");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).toHaveTextContent("依据资料状态");
    expect(
      screen.getByTestId("admin-ai-generation-zone-boundary"),
    ).not.toHaveTextContent("草稿评审");

    const nextStep = await screen.findByTestId(
      "organization-ai-generation-draft-next-step",
    );
    expect(nextStep).toHaveTextContent("企业训练试卷草稿");
    expect(nextStep).toHaveTextContent("创建企业训练草稿");
    expect(nextStep).toHaveTextContent("编辑试卷");
    expect(nextStep).toHaveTextContent("调整题目");
    expect(nextStep).toHaveTextContent("预览员工视角");
    expect(nextStep).toHaveTextContent("保存草稿");
    expect(nextStep).toHaveTextContent("发布训练");
    expect(document.body).not.toHaveTextContent("组织 AI组卷");
    expect(document.body).not.toHaveTextContent("Provider");
  });

  it.each([
    {
      actionLabel: "生成题目草稿",
      adminRoles: ["content_admin"] satisfies AdminRole[],
      generationKind: "question" as const,
      historyPath:
        "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
      title: "AI出题工作台",
      workspace: "content" as const,
    },
    {
      actionLabel: "生成组卷方案并本地选题",
      adminRoles: ["content_admin"] satisfies AdminRole[],
      generationKind: "paper" as const,
      historyPath:
        "/api/v1/content-ai-generation-requests?generationKind=paper&page=1&pageSize=10",
      title: "AI组卷工作台",
      workspace: "content" as const,
    },
    {
      actionLabel: "生成训练题草稿",
      adminRoles: ["org_advanced_admin"] satisfies AdminRole[],
      generationKind: "question" as const,
      historyPath:
        "/api/v1/organization-ai-generation-requests?generationKind=question&page=1&pageSize=10",
      title: "训练题草稿",
      workspace: "organization" as const,
    },
    {
      actionLabel: "生成训练试卷草稿",
      adminRoles: ["org_advanced_admin"] satisfies AdminRole[],
      generationKind: "paper" as const,
      historyPath:
        "/api/v1/organization-ai-generation-requests?generationKind=paper&page=1&pageSize=10",
      title: "训练试卷草稿",
      workspace: "organization" as const,
    },
  ])(
    "renders ordinary admin UI matrix row for $workspace $generationKind",
    async ({
      actionLabel,
      adminRoles,
      generationKind,
      historyPath,
      title,
      workspace,
    }) => {
      globalThis.localStorage?.setItem(
        "tiku.localSessionToken",
        "unit-test-admin-token",
      );
      const fetchMock = vi.fn(async (url: string | URL) => {
        if (String(url) === "/api/v1/sessions") {
          return Response.json(
            createSessionResponse({
              adminRoles,
              organizationPublicId:
                workspace === "organization" ? "organization_public_123" : null,
            }),
          );
        }

        if (String(url) === historyPath) {
          return Response.json(createEmptyTaskHistoryResponse(workspace));
        }

        throw new Error(`Unexpected fetch: ${String(url)}`);
      });
      vi.stubGlobal("fetch", fetchMock);

      render(
        createElement(AdminAiGenerationEntryPage, {
          workspace,
          generationKind,
        }),
      );

      expect(
        await screen.findByRole("heading", { name: title }),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("admin-ai-generation-submit"),
      ).toHaveTextContent(actionLabel);
      expect(
        screen.getByTestId("admin-ai-generation-detail-controls"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("admin-ai-generation-task-history"),
      ).toBeInTheDocument();
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
        "/api/v1/sessions",
        historyPath,
      ]);
      expect(document.body.textContent).not.toContain("unit-test-admin-token");
      expect(document.body.textContent).not.toContain("providerPayload");
      expect(document.body.textContent).not.toContain("rawPrompt");
      expect(document.body.textContent).not.toContain("Authorization");
      expect(document.body.textContent).not.toContain("localStorage");
    },
  );

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
        includeDescendants: false,
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        knowledgeNodeSupplement: null,
        sourcePreference: null,
        questionType: "single_choice",
        questionCount: 3,
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

  it("submits admin AI selected knowledge-node public ids from the options route", async () => {
    globalThis.localStorage?.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token",
    );
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (
        path ===
        "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10"
      ) {
        return Response.json(createEmptyTaskHistoryResponse("content"));
      }

      if (path.startsWith("/api/v1/ai-generation/knowledge-nodes?")) {
        expect(init?.method).toBe("GET");
        expect(path).toContain("profession=marketing");
        expect(path).toContain("level=3");

        return Response.json(createAiKnowledgeNodeOptionsResponse());
      }

      if (path === "/api/v1/content-ai-generation-requests") {
        expect(init?.method).toBe("POST");

        return Response.json(
          createLocalContractResponse({
            workspace: "content",
            generationKind: "question",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        generationKind: "question",
        workspace: "content",
      }),
    );

    expect(await screen.findByText("最近生成记录")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("知识点覆盖"), {
      target: { value: "指定知识点" },
    });
    fireEvent.click(
      await screen.findByLabelText("选择知识点 营销/基础知识/市场调研"),
    );
    fireEvent.change(screen.getByLabelText("包含下级知识点"), {
      target: { value: "包含" },
    });
    fireEvent.click(screen.getByTestId("admin-ai-generation-submit"));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            String(url) === "/api/v1/content-ai-generation-requests" &&
            init?.method === "POST",
        ),
      ).toBe(true),
    );
    const requestInit = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url) === "/api/v1/content-ai-generation-requests" &&
        init?.method === "POST",
    )?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      generationKind: "question",
      generationParameters: {
        includeDescendants: true,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge-node-public-marketing-3"],
      },
    });
  });

  it("submits organization admin AI组卷 selected knowledge-node public ids", async () => {
    globalThis.localStorage?.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token",
    );
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({
            adminRoles: ["org_advanced_admin"],
            organizationPublicId: "organization_public_123",
          }),
        );
      }

      if (
        path ===
        "/api/v1/organization-ai-generation-requests?generationKind=paper&page=1&pageSize=10"
      ) {
        return Response.json(createEmptyTaskHistoryResponse("organization"));
      }

      if (path.startsWith("/api/v1/ai-generation/knowledge-nodes?")) {
        expect(init?.method).toBe("GET");
        expect(path).toContain("profession=marketing");
        expect(path).toContain("level=3");

        return Response.json(createAiKnowledgeNodeOptionsResponse());
      }

      if (path === "/api/v1/organization-ai-generation-requests") {
        expect(init?.method).toBe("POST");

        return Response.json(
          createLocalContractResponse({
            workspace: "organization",
            generationKind: "paper",
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        generationKind: "paper",
        workspace: "organization",
      }),
    );

    expect(await screen.findByText("最近生成记录")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("知识点覆盖"), {
      target: { value: "指定知识点" },
    });
    fireEvent.click(
      await screen.findByLabelText("选择知识点 营销/基础知识/市场调研"),
    );
    fireEvent.change(screen.getByLabelText("题型分布"), {
      target: { value: "单选 50% / 多选 25% / 判断 25%" },
    });
    fireEvent.change(screen.getByLabelText("试卷结构"), {
      target: { value: "按知识点模块组织" },
    });
    fireEvent.click(screen.getByTestId("admin-ai-generation-submit"));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            String(url) === "/api/v1/organization-ai-generation-requests" &&
            init?.method === "POST",
        ),
      ).toBe(true),
    );
    const requestInit = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url) === "/api/v1/organization-ai-generation-requests" &&
        init?.method === "POST",
    )?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      generationKind: "paper",
      generationParameters: {
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge-node-public-marketing-3"],
        sourcePreference: "balanced",
        questionTypeDistribution: "single_50_multi_25_true_false_25",
        paperStructure: "by_knowledge_node",
      },
    });
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
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic visible paper section",
                  questionCount: 20,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem: "synthetic visible paper question stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText: "synthetic visible paper option",
                        },
                      ],
                      standardAnswer: "synthetic visible paper answer",
                      analysis: "synthetic visible paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
              reviewStatus: "draft_review_required",
            },
          },
          redactionStatus: "redacted",
        },
        paperAssembly: createContentPaperAssembly(),
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
    ).toHaveTextContent("待审试卷草稿");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("平台正式题库");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("已选 2 / 2 题");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("单选题");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).not.toHaveTextContent("synthetic visible paper question stem");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).not.toHaveTextContent("synthetic visible paper answer");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).not.toHaveTextContent("synthetic visible paper analysis");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).not.toHaveTextContent("platform_formal_question_public_a");
    expect(
      screen.getByTestId("admin-visible-generated-content"),
    ).not.toHaveTextContent("paper_draft");
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

  it("renders paper assembly degradation and insufficiency as Chinese product wording", async () => {
    const cases = [
      {
        matchQuality: "supplemented_from_nearby_knowledge" as const,
        expectedText: "已从相近知识点自动补足",
        forbiddenText: "supplemented_from_nearby_knowledge",
        selectedQuestionCount: 2,
        insufficiency: null,
      },
      {
        matchQuality: "supplemented_from_same_scope" as const,
        expectedText: "已从同范围题目自动补足",
        forbiddenText: "supplemented_from_same_scope",
        selectedQuestionCount: 2,
        insufficiency: null,
      },
      {
        matchQuality: "insufficient" as const,
        expectedText: "题源不足，需调整条件",
        forbiddenText: "insufficient_formal_question_source",
        selectedQuestionCount: 1,
        insufficiency: { missingQuestionCount: 1 },
      },
    ];

    for (const testCase of cases) {
      cleanup();
      vi.unstubAllGlobals();
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
            visibleGeneratedContent: {
              content: "后台本次生成草稿：只展示安全摘要。",
              contentVisibility: "transient_response_only",
              persistenceStatus: "not_persisted",
              safetyStatus: "checked",
            },
            redactionStatus: "redacted",
          },
          paperAssembly: createContentPaperAssembly({
            matchQuality: testCase.matchQuality,
            requestedQuestionCount: 2,
            selectedQuestionCount: testCase.selectedQuestionCount,
            insufficiency: testCase.insufficiency,
          }),
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

      const visibleContent = await screen.findByTestId(
        "admin-visible-generated-content",
      );
      expect(visibleContent).toHaveTextContent(testCase.expectedText);
      expect(visibleContent).not.toHaveTextContent(testCase.forbiddenText);
      expect(visibleContent).not.toHaveTextContent("fallback");
      expect(visibleContent).not.toHaveTextContent("matchQuality");

      if (testCase.insufficiency !== null) {
        expect(visibleContent).toHaveTextContent(
          "仍缺 1 题，请调整知识点、题型或题量。",
        );
      }
    }
  });

  it("renders organization advanced admin AI paper drafts on the same structured surface", async () => {
    const blockedResponse = createLocalContractResponse({
      workspace: "organization",
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
            content: "生成试卷草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 20,
              questionTypeDistributionCount: 1,
              knowledgeCoverageCount: 1,
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic organization paper section",
                  questionCount: 20,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem:
                        "synthetic visible organization paper question stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText:
                            "synthetic visible organization paper option",
                        },
                      ],
                      standardAnswer:
                        "synthetic visible organization paper answer",
                      analysis: "synthetic visible organization paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
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
        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
          init,
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

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    const visibleGeneratedContent = await screen.findByTestId(
      "admin-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("生成试卷草稿");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic organization paper section",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization paper question stem",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization paper option",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization paper answer",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization paper analysis",
    );
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("renders authorized admin AI question drafts before governance details", async () => {
    globalThis.localStorage?.setItem(
      "tiku.localSessionToken",
      "unit-test-admin-token",
    );
    const blockedResponse = createLocalContractResponse({
      workspace: "content",
      generationKind: "question",
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
            content: "生成草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 10,
              actualQuestionCount: 10,
              draftCount: 10,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  knowledgeNodeLabels: ["synthetic knowledge node"],
                  questionStem: "synthetic visible admin question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic visible option",
                    },
                  ],
                  standardAnswer: "synthetic visible answer",
                  analysis: "synthetic visible analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
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
        generationKind: "question",
      }),
    );

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    const visibleGeneratedContent = await screen.findByTestId(
      "admin-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("待审题目草稿列表");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible admin question stem",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible option",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible answer",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible analysis",
    );
    expect(
      visibleGeneratedContent.compareDocumentPosition(
        screen.getByTestId("admin-ai-generation-task-history"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("renders organization advanced admin AI question drafts on the same structured surface", async () => {
    const blockedResponse = createLocalContractResponse({
      workspace: "organization",
      generationKind: "question",
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
            content: "生成草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 10,
              actualQuestionCount: 10,
              draftCount: 10,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  questionStem: "synthetic visible organization question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic visible organization option",
                    },
                  ],
                  standardAnswer: "synthetic visible organization answer",
                  analysis: "synthetic visible organization analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          redactionStatus: "redacted",
        },
      },
    };

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
        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
          init,
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

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    const visibleGeneratedContent = await screen.findByTestId(
      "admin-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("企业训练题草稿列表");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization question stem",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization option",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization answer",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible organization analysis",
    );
    const draftCard = within(visibleGeneratedContent).getByTestId(
      "admin-ai-question-draft-card",
    );
    expect(draftCard).toHaveTextContent("企业训练题草稿");
    expect(draftCard).toHaveTextContent("第 1 题");
    expect(draftCard).toHaveTextContent("单选题");
    expect(draftCard).toHaveTextContent("中等");
    expect(draftCard).toHaveTextContent("查看标准答案");
    expect(draftCard).toHaveTextContent("查看解析");
    expect(draftCard).not.toHaveTextContent("single_choice");
    expect(draftCard).not.toHaveTextContent("medium");
    expect(
      within(draftCard).getByText("查看标准答案").closest("details"),
    ).not.toHaveAttribute("open");
    expect(
      within(draftCard).getByText("查看解析").closest("details"),
    ).not.toHaveAttribute("open");
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
    ).toHaveTextContent("最近生成记录");
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
    expect(historyPanel).toHaveTextContent("内容评审摘要");
    expect(historyPanel).toHaveTextContent("草稿快照");
    expect(historyPanel).toHaveTextContent("采用依据状态");
    expect(historyPanel).toHaveTextContent("内容采纳");
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

  it("submits content admin current question review adoption with a content digest", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_content_question_current_review_456";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const blockedResponse = createLocalContractResponse({
      workspace: "content",
      generationKind: "question",
    });
    const providerVisibleResponse = {
      ...blockedResponse,
      data: {
        ...blockedResponse.data,
        resultState: {
          ...blockedResponse.data.resultState,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        taskPersistence: {
          ...blockedResponse.data.taskPersistence,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId,
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "sufficient",
          citationCount: 2,
          formalAdoptionStatus: "blocked",
          formalAdoptionReviewStatus: null,
          formalTargetWriteStatus: null,
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
          formalAdoptionReviewedAt: null,
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          ...blockedResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          visibleGeneratedContent: {
            content: "生成题目草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  questionStem: "synthetic reviewed question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic reviewed option A",
                      isCorrect: true,
                    },
                    {
                      optionLabel: "B",
                      optionText: "synthetic reviewed option B",
                      isCorrect: false,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic reviewed analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          redactionStatus: "redacted",
        },
      },
    };
    let requestSubmitted = false;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
        requestSubmitted = true;

        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          requestSubmitted
            ? createTaskHistoryResponse({
                workspace: "content",
                generationKind: "question",
                generatedResult: {
                  resultPublicId,
                  contentPreviewMasked:
                    "redacted generated result summary for current review",
                  evidenceStatus: "sufficient",
                  citationCount: 2,
                },
              })
            : createEmptyTaskHistoryResponse("content"),
        );
      }

      if (path === adoptionUrl && init?.method === "POST") {
        const adoptionRequestBody = JSON.parse(String(init.body));

        expect(adoptionRequestBody).toMatchObject({
          reviewDecision: "approved",
          reviewerConfirmed: true,
          targetType: "question",
          expectedContentDigest: "sha256:admin_ai_generation_history_result",
        });
        expect(adoptionRequestBody).not.toHaveProperty("reviewedDraft");
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
              review: {
                reviewDecision: "approved",
              },
              targetReference: {
                formalTargetWriteStatus: "draft_created",
              },
              redactionStatus: "redacted",
            },
          },
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    expect(
      await screen.findByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("待审题目草稿列表");
    const visibleGeneratedContent = screen.getByTestId(
      "admin-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("待审题目草稿");
    expect(visibleGeneratedContent).toHaveTextContent("第 1 题");
    expect(visibleGeneratedContent).toHaveTextContent("单选题");
    expect(visibleGeneratedContent).toHaveTextContent("中等");
    expect(visibleGeneratedContent).not.toHaveTextContent("single_choice");
    expect(visibleGeneratedContent).not.toHaveTextContent("medium");
    expect(
      screen.getByTestId("content-admin-review-traceability"),
    ).toHaveTextContent("审阅、采纳与驳回");
    expect(
      screen.getByTestId("content-admin-review-traceability"),
    ).toHaveTextContent("发布前校验");
    const traceabilitySummary = screen.getByTestId(
      "content-admin-generation-traceability-summary",
    );
    expect(traceabilitySummary).toHaveTextContent("参数与依据追溯");
    expect(traceabilitySummary).toHaveTextContent(/题型\s*单选题/u);
    expect(traceabilitySummary).toHaveTextContent(/题量\s*1\/3/u);
    expect(traceabilitySummary).toHaveTextContent(/知识点范围\s*均衡覆盖/u);
    expect(traceabilitySummary).toHaveTextContent(/已选知识点\s*0 个/u);
    expect(traceabilitySummary).toHaveTextContent(/依据状态\s*资料充足/u);
    expect(traceabilitySummary).toHaveTextContent(/依据数量\s*2/u);
    expect(traceabilitySummary).not.toHaveTextContent("rawPrompt");
    expect(traceabilitySummary).not.toHaveTextContent("rawOutput");
    expect(traceabilitySummary).not.toHaveTextContent("providerPayload");
    expect(traceabilitySummary).not.toHaveTextContent(
      "synthetic reviewed question stem",
    );
    expect(
      screen.getByTestId("content-admin-review-next-actions"),
    ).toHaveTextContent("采用到内容草稿");
    fireEvent.click(
      await screen.findByTestId("content-admin-review-adopt-action"),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        adoptionUrl,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      await screen.findByText("待审草稿已创建；正式发布仍需审核和发布校验。"),
    ).toBeInTheDocument();
  });

  it("renders persisted content admin adoption status as completed in history", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_content_question_reviewed_history";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for adopted history",
              evidenceStatus: "sufficient",
              citationCount: 2,
              formalAdoptionStatus: "draft_created",
              formalTargetWriteStatus: "draft_created",
              formalQuestionPublicId: "formal_question_public_reviewed",
              formalAdoptionReviewedAt: "2026-06-26T21:12:00.000Z",
              reviewedDraft: {
                questionType: "single_choice",
                profession: "marketing",
                level: 3,
                subject: "theory",
                stemRichText: "synthetic reviewed question stem",
                standardAnswerRichText: "A",
                analysisRichText: "synthetic reviewed analysis",
                multiChoiceRule: "all_correct_only",
                scoringMethod: "auto_match",
                materialPublicId: null,
                questionOptions: [],
                scoringPoints: [],
                fillBlankAnswers: [],
                knowledgeNodePublicIds: [],
                tagPublicIds: [],
              },
            },
          }),
        );
      }

      if (path === adoptionUrl && init?.method === "POST") {
        return Response.json({
          code: 500001,
          message: "unexpected adoption request",
          data: null,
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
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
    const adoptAction = await screen.findByTestId(
      "content-admin-review-adopt-action",
    );
    const rejectAction = await screen.findByTestId(
      "content-admin-review-reject-action",
    );

    expect(historyPanel).toHaveTextContent("已创建待审草稿");
    expect(adoptAction).toBeDisabled();
    expect(adoptAction).toHaveTextContent("已创建待审题目草稿");
    expect(
      screen.getByRole("link", { name: "查看待审题目草稿" }),
    ).toHaveAttribute(
      "href",
      "/content/questions?questionPublicId=formal_question_public_reviewed",
    );
    expect(rejectAction).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalledWith(
      adoptionUrl,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("renders persisted content admin paper adoption detail entry with public id link", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_content_paper_reviewed_history";
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
            generationKind: "paper",
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated paper result summary for adopted history",
              evidenceStatus: "sufficient",
              citationCount: 2,
              formalAdoptionStatus: "draft_created",
              formalTargetWriteStatus: "draft_created",
              formalPaperPublicId: "formal_paper_public_reviewed",
              formalAdoptionReviewedAt: "2026-06-26T21:18:00.000Z",
              reviewedDraft: {
                kind: "paper",
                paper: {
                  name: "redacted paper draft",
                  profession: "marketing",
                  level: 3,
                  subject: "theory",
                  paperType: "mock_paper",
                  year: 2026,
                  durationMinute: 90,
                  source: "redacted source summary",
                },
                paperSections: [],
              },
            },
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "paper",
      }),
    );

    const historyPanel = await screen.findByTestId(
      "admin-ai-generation-task-history",
    );

    expect(historyPanel).toHaveTextContent("已创建待审草稿");
    expect(
      screen.getByRole("link", { name: "查看待审试卷草稿" }),
    ).toHaveAttribute(
      "href",
      "/content/papers?paperPublicId=formal_paper_public_reviewed",
    );
  });

  it("keeps content admin adoption detail entry disabled until the formal draft target exists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
            generatedResult: {
              resultPublicId:
                "admin_ai_generation_result_content_question_approved_waiting",
              contentPreviewMasked:
                "redacted generated result summary for approved history",
              evidenceStatus: "sufficient",
              citationCount: 2,
              formalAdoptionStatus: "approved_for_formal_adoption",
              formalTargetWriteStatus: null,
              formalQuestionPublicId: null,
              formalAdoptionReviewedAt: "2026-06-26T21:20:00.000Z",
            },
          }),
        );
      }

      throw new Error(`Unexpected fetch: ${path}`);
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

    expect(traceabilityPanel).toHaveTextContent("已审核待创建草稿");
    expect(traceabilityPanel).toHaveTextContent("草稿创建后显示详情入口");
    expect(screen.queryByRole("link", { name: "查看待审题目草稿" })).toBeNull();
  });

  it("submits content admin current paper review adoption with selected platform formal questions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_content_paper_current_review_456";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const blockedResponse = createLocalContractResponse({
      workspace: "content",
      generationKind: "paper",
    });
    const providerVisibleResponse = {
      ...blockedResponse,
      data: {
        ...blockedResponse.data,
        resultState: {
          ...blockedResponse.data.resultState,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        taskPersistence: {
          ...blockedResponse.data.taskPersistence,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId,
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "sufficient",
          citationCount: 2,
          formalAdoptionStatus: "blocked",
          formalAdoptionReviewStatus: null,
          formalTargetWriteStatus: null,
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
          formalAdoptionReviewedAt: null,
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          ...blockedResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          visibleGeneratedContent: {
            content: "生成试卷草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 1,
              questionTypeDistributionCount: 1,
              knowledgeCoverageCount: 1,
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic reviewed paper section",
                  description: "synthetic reviewed paper section description",
                  questionCount: 1,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem: "synthetic reviewed paper question stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText: "synthetic reviewed paper option A",
                          isCorrect: true,
                        },
                      ],
                      standardAnswer: "A",
                      analysis: "synthetic reviewed paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
              reviewStatus: "draft_review_required",
            },
          },
          redactionStatus: "redacted",
        },
        paperAssembly: createContentPaperAssembly(),
      },
    };
    let requestSubmitted = false;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
        requestSubmitted = true;

        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          requestSubmitted
            ? createTaskHistoryResponse({
                workspace: "content",
                generationKind: "paper",
                generatedResult: {
                  resultPublicId,
                  contentPreviewMasked:
                    "redacted generated result summary for current paper review",
                  evidenceStatus: "sufficient",
                  citationCount: 2,
                },
              })
            : createEmptyTaskHistoryResponse("content"),
        );
      }

      if (path === adoptionUrl && init?.method === "POST") {
        const adoptionRequestBody = JSON.parse(String(init.body));

        expect(adoptionRequestBody).toMatchObject({
          reviewDecision: "approved",
          reviewerConfirmed: true,
          targetType: "paper",
          expectedContentDigest: "sha256:admin_ai_generation_history_result",
        });
        expect(adoptionRequestBody).not.toHaveProperty("reviewedDraft");
        expect(JSON.stringify(adoptionRequestBody)).not.toContain(
          "synthetic reviewed paper question stem",
        );
        expect(JSON.stringify(adoptionRequestBody)).not.toContain(
          "synthetic reviewed paper analysis",
        );
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
              review: {
                reviewDecision: "approved",
              },
              targetReference: {
                formalTargetWriteStatus: "draft_created",
              },
              redactionStatus: "redacted",
            },
          },
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "paper",
      }),
    );

    fireEvent.change(await screen.findByLabelText("题目数量"), {
      target: { value: "2" },
    });
    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));

    expect(
      await screen.findByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("待审试卷草稿");
    const traceabilitySummary = await screen.findByTestId(
      "content-admin-generation-traceability-summary",
    );
    expect(traceabilitySummary).toHaveTextContent("参数与依据追溯");
    expect(traceabilitySummary).toHaveTextContent(
      /题型分布\s*单选 40% \/ 多选 30% \/ 判断 30%/u,
    );
    expect(traceabilitySummary).toHaveTextContent(/试卷结构\s*按大题模块组织/u);
    expect(traceabilitySummary).toHaveTextContent(/题量\s*2\/2/u);
    expect(traceabilitySummary).toHaveTextContent(/大题数\s*1\/1/u);
    expect(traceabilitySummary).toHaveTextContent(/题源\s*平台正式题库 2 题/u);
    expect(traceabilitySummary).toHaveTextContent(/知识点范围\s*均衡覆盖/u);
    expect(traceabilitySummary).toHaveTextContent(/依据状态\s*资料充足/u);
    expect(traceabilitySummary).not.toHaveTextContent(
      "synthetic reviewed paper question stem",
    );
    expect(traceabilitySummary).not.toHaveTextContent(
      "synthetic reviewed paper analysis",
    );
    expect(traceabilitySummary).not.toHaveTextContent(
      "platform_formal_question_public_a",
    );
    expect(traceabilitySummary).not.toHaveTextContent("rawPrompt");
    expect(traceabilitySummary).not.toHaveTextContent("rawOutput");
    expect(traceabilitySummary).not.toHaveTextContent("providerPayload");
    fireEvent.click(
      await screen.findByTestId("content-admin-review-adopt-action"),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        adoptionUrl,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      await screen.findByText("待审草稿已创建；正式发布仍需审核和发布校验。"),
    ).toBeInTheDocument();
  });

  it("keeps history-only content admin adoption unavailable without fabricating a reviewed draft payload", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_review_hidden_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_review_hidden_456";
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
              evidenceStatus: "sufficient",
              citationCount: 1,
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

    const traceabilityPanel = await screen.findByTestId(
      "content-admin-review-traceability",
    );

    expect(traceabilityPanel).toHaveTextContent("审阅、采纳与驳回");
    expect(traceabilityPanel).toHaveTextContent("待评审");
    expect(traceabilityPanel).toHaveTextContent("正式发布需审核");
    expect(traceabilityPanel).toHaveTextContent("不直接发布");
    expect(traceabilityPanel).not.toHaveTextContent("single_result_traceable");
    expect(traceabilityPanel).not.toHaveTextContent("awaiting_metadata_review");
    expect(traceabilityPanel).not.toHaveTextContent(
      "blocked_requires_fresh_publish_task",
    );
    expect(traceabilityPanel).not.toHaveTextContent("not_executed");
    const localValidationPanel = await screen.findByTestId(
      "content-admin-review-batch-retry-diff-history-local-validation",
    );
    expect(localValidationPanel).toHaveTextContent("来源与重复检查");
    expect(localValidationPanel).toHaveTextContent("资料依据复核");
    expect(localValidationPanel).toHaveTextContent("审阅记录");
    expect(localValidationPanel).toHaveTextContent("发布前校验");
    expect(localValidationPanel).toHaveTextContent("人工确认");
    expect(localValidationPanel).toHaveTextContent("只读留痕");
    expect(localValidationPanel).toHaveTextContent("正式内容不自动写入");
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
    ).toBeDisabled();
    expect(
      screen.getByTestId("content-admin-review-reject-action"),
    ).toBeEnabled();
    expect(
      screen.getByTestId("content-admin-review-adopt-action"),
    ).toHaveTextContent("需本次结构化草稿");
    expect(
      screen.getByTestId("content-admin-review-reject-action"),
    ).toHaveTextContent("驳回草稿");

    expect(document.body.textContent).not.toContain("adopt_disabled");
    expect(document.body.textContent).not.toContain("reject_disabled");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
    ]);
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("rawOutput");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("submits content admin historical question adoption when a reviewed draft snapshot is persisted", async () => {
    const resultPublicId =
      "admin_ai_generation_result_content_question_history_review_456";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const reviewedDraft = {
      questionType: "single_choice",
      profession: "marketing",
      level: 3,
      subject: "theory",
      stemRichText: "synthetic historical question stem",
      standardAnswerRichText: "A",
      analysisRichText: "synthetic historical analysis",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: null,
      questionOptions: [
        {
          label: "A",
          contentRichText: "synthetic historical option A",
          isCorrect: true,
          sortOrder: 1,
        },
      ],
      scoringPoints: [],
      fillBlankAnswers: [],
      knowledgeNodePublicIds: [],
      tagPublicIds: [],
    };
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for persisted review",
              evidenceStatus: "sufficient",
              citationCount: 2,
              reviewedDraft,
            },
          }),
        );
      }

      if (path === adoptionUrl && init?.method === "POST") {
        const requestBody = JSON.parse(String(init.body));
        expect(requestBody).toMatchObject({
          reviewDecision: "approved",
          reviewerConfirmed: true,
          targetType: "question",
          expectedContentDigest: "sha256:admin_ai_generation_history_result",
        });
        expect(requestBody).not.toHaveProperty("reviewedDraft");

        return Response.json({
          code: 0,
          message: "ok",
          data: {
            persistenceStatus: "created",
            adoption: {
              review: {
                reviewDecision: "approved",
              },
              targetReference: {
                formalTargetWriteStatus: "draft_created",
              },
              redactionStatus: "redacted",
            },
          },
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "content",
        generationKind: "question",
      }),
    );

    const adoptAction = await screen.findByTestId(
      "content-admin-review-adopt-action",
    );

    expect(adoptAction).toBeEnabled();
    expect(adoptAction).toHaveTextContent("采用到待审题目草稿");

    fireEvent.click(adoptAction);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        adoptionUrl,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      await screen.findByText("待审草稿已创建；正式发布仍需审核和发布校验。"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("rawOutput");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("keeps content admin adoption disabled until a generated result is grounded", async () => {
    const resultPublicId =
      "admin_ai_generation_result_content_question_ungrounded_hidden_456";
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
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for review traceability",
              evidenceStatus: "none",
              citationCount: 0,
            },
          }),
        );
      }

      if (String(url) === adoptionUrl) {
        throw new Error("Ungrounded generated result must not be adopted");
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
    const adoptAction = await screen.findByTestId(
      "content-admin-review-adopt-action",
    );

    expect(traceabilityPanel).toHaveTextContent("资料不足");
    expect(adoptAction).toBeDisabled();

    fireEvent.click(adoptAction);

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10",
    ]);
  });

  it("requires explicit weak-evidence confirmation before content admin current adoption request", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_content_question_weak_hidden_456";
    const adoptionUrl = `/api/v1/content-ai-generation-results/${resultPublicId}/formal-adoptions`;
    const blockedResponse = createLocalContractResponse({
      workspace: "content",
      generationKind: "question",
    });
    const providerVisibleResponse = {
      ...blockedResponse,
      data: {
        ...blockedResponse.data,
        resultState: {
          ...blockedResponse.data.resultState,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "weak",
          citationCount: 1,
        },
        taskPersistence: {
          ...blockedResponse.data.taskPersistence,
          status: "succeeded",
          resultPublicId,
          evidenceStatus: "weak",
          citationCount: 1,
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId,
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "weak",
          citationCount: 1,
          formalAdoptionStatus: "blocked",
          formalAdoptionReviewStatus: null,
          formalTargetWriteStatus: null,
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
          formalAdoptionReviewedAt: null,
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          ...blockedResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          visibleGeneratedContent: {
            content: "弱依据题目草稿已创建，待评审查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "weak",
              citationCount: 1,
            },
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  questionStem: "synthetic weak reviewed question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic weak reviewed option A",
                      isCorrect: true,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic weak reviewed analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          redactionStatus: "redacted",
        },
      },
    };
    let requestSubmitted = false;
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
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
        requestSubmitted = true;

        return Response.json(providerVisibleResponse);
      }

      if (
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/content-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          requestSubmitted
            ? createTaskHistoryResponse({
                workspace: "content",
                generationKind: "question",
                generatedResult: {
                  resultPublicId,
                  contentPreviewMasked:
                    "redacted generated result summary for weak evidence review",
                  evidenceStatus: "weak",
                  citationCount: 1,
                },
              })
            : createEmptyTaskHistoryResponse("content"),
        );
      }

      if (path === adoptionUrl && init?.method === "POST") {
        const adoptionRequestBody = JSON.parse(String(init.body));

        expect(adoptionRequestBody).toMatchObject({
          reviewDecision: "approved",
          reviewerConfirmed: true,
          targetType: "question",
          weakEvidenceConfirmed: true,
          expectedContentDigest: "sha256:admin_ai_generation_history_result",
        });
        expect(adoptionRequestBody).not.toHaveProperty("reviewedDraft");

        return Response.json({
          code: 0,
          message: "ok",
          data: {
            persistenceStatus: "created",
            adoption: {
              review: {
                reviewDecision: "approved",
              },
              targetReference: {
                formalTargetWriteStatus: "draft_created",
              },
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

    fireEvent.click(await screen.findByTestId("admin-ai-generation-submit"));
    expect(
      await screen.findByTestId("admin-visible-generated-content"),
    ).toHaveTextContent("待审题目草稿列表");

    const traceabilityPanel = await screen.findByTestId(
      "content-admin-review-traceability",
    );
    const adoptAction = await screen.findByTestId(
      "content-admin-review-adopt-action",
    );

    expect(traceabilityPanel).toHaveTextContent("资料较少");
    expect(traceabilityPanel).toHaveTextContent("需人工确认");
    expect(adoptAction).toBeEnabled();
    expect(adoptAction).toHaveTextContent("确认资料较少并采用到待审题目草稿");

    fireEvent.click(adoptAction);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        adoptionUrl,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      await screen.findByText("待审草稿已创建；正式发布仍需审核和发布校验。"),
    ).toBeInTheDocument();
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
              evidenceStatus: "sufficient",
              citationCount: 1,
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
    ).toHaveTextContent("训练草稿摘要");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("企业训练试卷草稿");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("依据资料状态");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("可作为组织训练素材");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("发布前需后续编辑校验");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("未关联训练草稿");
    expect(
      screen.getByTestId("organization-ai-training-copy-action"),
    ).toHaveTextContent("创建企业训练草稿");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("正式采用");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).not.toHaveTextContent("Provider");
    expect(document.body.textContent).not.toContain(
      "redacted generated result summary for organization history",
    );
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
  });

  it("creates an organization training draft with source task attribution for a sufficiently grounded organization AI result", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_organization_question_copy_hidden_001";
    const trainingDraftPublicId = "organization-training-draft-ai-copy-001";
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);
      const method = init?.method ?? "GET";

      if (path === "/api/v1/sessions") {
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
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "organization",
            generationKind: "question",
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for organization copy",
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
          }),
        );
      }

      if (path === "/api/v1/organization-trainings" && method === "POST") {
        return Response.json({
          code: 0,
          message: "ok",
          data: {
            draft: {
              publicId: trainingDraftPublicId,
              sourceTaskPublicId:
                "admin_ai_generation_task_organization_question_history",
              organizationPublicId: "organization_public_123",
              authorizationSource: "org_auth",
              authorizationPublicId: "org_auth_session_public_123",
              profession: "marketing",
              level: 3,
              subject: "theory",
              title: "AI出题训练草稿 2026-06-26 20:30",
              description: "metadata only",
              questionCount: 10,
              totalScore: 10,
              questionTypeSummary: {
                singleChoice: 10,
                multiChoice: 0,
                trueFalse: 0,
                shortAnswer: 0,
              },
              evidenceStatus: "sufficient",
              validationStatus: "needs_review",
              retentionStatus: "active",
              createdAt: "2026-06-26T20:32:00.000Z",
              expiresAt: null,
            },
          },
        });
      }

      if (
        path ===
          `/api/v1/organization-trainings/${trainingDraftPublicId}/source-contexts` &&
        method === "POST"
      ) {
        return Response.json({
          code: 0,
          message: "ok",
          data: {
            context: {
              draftPublicId: trainingDraftPublicId,
              organizationPublicId: "organization_public_123",
              sourceContexts: [
                {
                  sourceType: "organization_ai_result",
                  sourcePublicId: resultPublicId,
                  title: "AI出题训练草稿 2026-06-26 20:30",
                  profession: "marketing",
                  level: 3,
                  subject: "theory",
                  questionCount: 10,
                  totalScore: 10,
                  sourceStatus: "ai_generated_sufficient_evidence",
                  redactionStatus: "metadata_only",
                },
              ],
              redactionStatus: "metadata_only",
            },
          },
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    const copyAction = await screen.findByTestId(
      "organization-ai-training-copy-action",
    );

    fireEvent.click(copyAction);

    const copyFeedbackMessage = await screen.findByText(
      "已创建企业训练草稿并关联本次 AI 任务；发布前仍需编辑、预览和校验。",
    );
    const copyFeedback = copyFeedbackMessage.closest('[role="status"]');
    expect(copyFeedback).toBeInstanceOf(HTMLElement);
    if (!(copyFeedback instanceof HTMLElement)) {
      throw new Error("Expected organization training copy feedback");
    }
    expect(copyFeedback).toHaveAttribute("data-admin-feedback-tone", "success");
    expect(copyFeedback).toHaveTextContent("企业训练草稿已创建");
    expect(copyFeedback).toHaveTextContent(
      "已创建企业训练草稿并关联本次 AI 任务；发布前仍需编辑、预览和校验。",
    );
    fireEvent.click(
      within(copyFeedback).getByRole("button", { name: "关闭操作反馈" }),
    );
    expect(
      screen.getByTestId("organization-ai-training-copy-action"),
    ).toBeDisabled();

    const draftBody = JSON.parse(
      String(
        fetchMock.mock.calls.find(
          ([url, init]) =>
            String(url) === "/api/v1/organization-trainings" &&
            init?.method === "POST",
        )?.[1]?.body,
      ),
    );
    expect(draftBody).toMatchObject({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_session_public_123",
      sourceTaskPublicId:
        "admin_ai_generation_task_organization_question_history",
      profession: "marketing",
      level: 3,
      subject: "theory",
      capabilityContext: {
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        canCreateOrganizationTraining: true,
      },
    });
    expect(JSON.stringify(draftBody)).not.toContain("standardAnswer");
    expect(JSON.stringify(draftBody)).not.toContain("analysis");
    expect(JSON.stringify(draftBody)).not.toContain("providerPayload");

    const sourceContextBody = JSON.parse(
      String(
        fetchMock.mock.calls.find(([url]) =>
          String(url).endsWith("/source-contexts"),
        )?.[1]?.body,
      ),
    );
    expect(sourceContextBody).toMatchObject({
      draftPublicId: trainingDraftPublicId,
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_session_public_123",
      profession: "marketing",
      level: 3,
      capabilityContext: {
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        canCreateOrganizationTraining: true,
      },
      sourceContexts: [
        {
          sourceType: "organization_ai_result",
          sourcePublicId: resultPublicId,
          profession: "marketing",
          level: 3,
          subject: "theory",
          questionCount: 3,
          totalScore: 3,
          sourceStatus: "ai_generated_sufficient_evidence",
        },
      ],
    });
    expect(JSON.stringify(sourceContextBody)).not.toContain("standardAnswer");
    expect(JSON.stringify(sourceContextBody)).not.toContain("analysis");
    expect(JSON.stringify(sourceContextBody)).not.toContain("providerPayload");
  });

  it("shows organization training draft business error code when AI result copy is rejected", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const resultPublicId =
      "admin_ai_generation_result_organization_question_copy_error_001";
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url);
      const method = init?.method ?? "GET";

      if (path === "/api/v1/sessions") {
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
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "organization",
            generationKind: "question",
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for organization copy error",
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
          }),
        );
      }

      if (path === "/api/v1/organization-trainings" && method === "POST") {
        return Response.json({
          code: 403079,
          message: "Organization training manual draft lineage is unavailable.",
          data: null,
        });
      }

      throw new Error(`Unexpected fetch: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    fireEvent.click(
      await screen.findByTestId("organization-ai-training-copy-action"),
    );

    const copyAlert = await screen.findByRole("alert");
    expect(copyAlert).toHaveAttribute("data-admin-feedback-tone", "error");
    expect(copyAlert).toHaveTextContent("企业训练草稿创建失败");
    expect(copyAlert).toHaveTextContent(
      "创建企业训练草稿失败（code: 403079）：Organization training manual draft lineage is unavailable.",
    );
  });

  it("requires explicit weak-evidence wording before copying organization AI results and blocks none evidence", async () => {
    const weakResultPublicId =
      "admin_ai_generation_result_organization_question_weak_hidden_001";
    const noneResultPublicId =
      "admin_ai_generation_result_organization_question_none_hidden_001";
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
        isAdminAiGenerationHistoryRequest(
          url,
          "/api/v1/organization-ai-generation-requests",
          init,
        )
      ) {
        return Response.json(
          createTaskHistoryResponse({
            workspace: "organization",
            generationKind: "question",
            generatedResult: {
              resultPublicId: weakResultPublicId,
              contentPreviewMasked: "weak organization result",
              evidenceStatus: "weak",
              citationCount: 1,
            },
          }),
        );
      }

      if (String(url) === "/api/v1/organization-trainings") {
        return Response.json({
          code: 0,
          message: "ok",
          data: {
            draft: {
              publicId: "organization-training-draft-ai-weak-001",
              sourceTaskPublicId:
                "admin_ai_generation_task_organization_question_history",
              organizationPublicId: "organization_public_123",
              authorizationSource: "org_auth",
              authorizationPublicId: "org_auth_session_public_123",
              profession: "marketing",
              level: 3,
              subject: "theory",
              title: "AI出题训练草稿 2026-06-26 20:30",
              description: null,
              questionCount: 10,
              totalScore: 10,
              questionTypeSummary: {
                singleChoice: 10,
                multiChoice: 0,
                trueFalse: 0,
                shortAnswer: 0,
              },
              evidenceStatus: "weak",
              validationStatus: "needs_review",
              retentionStatus: "active",
              createdAt: "2026-06-26T20:32:00.000Z",
              expiresAt: null,
            },
          },
        });
      }

      if (
        String(url) ===
        "/api/v1/organization-trainings/organization-training-draft-ai-weak-001/source-contexts"
      ) {
        return Response.json({
          code: 0,
          message: "ok",
          data: {
            context: {
              draftPublicId: "organization-training-draft-ai-weak-001",
              organizationPublicId: "organization_public_123",
              sourceContexts: [
                {
                  sourceType: "organization_ai_result",
                  sourcePublicId: weakResultPublicId,
                  title: "AI出题训练草稿 2026-06-26 20:30",
                  profession: "marketing",
                  level: 3,
                  subject: "theory",
                  questionCount: 10,
                  totalScore: 10,
                  sourceStatus: "ai_generated_weak_evidence",
                  redactionStatus: "metadata_only",
                },
              ],
              redactionStatus: "metadata_only",
            },
          },
        });
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

    const weakCopyAction = await screen.findByTestId(
      "organization-ai-training-copy-action",
    );
    expect(weakCopyAction).toHaveTextContent("确认资料较少并创建训练草稿");

    fireEvent.click(weakCopyAction);

    expect(
      await screen.findByText(
        "已创建企业训练草稿并关联本次 AI 任务；发布前仍需编辑、预览和校验。",
      ),
    ).toBeInTheDocument();

    const weakDraftBody = JSON.parse(
      String(
        fetchMock.mock.calls.find(
          ([url, init]) =>
            String(url) === "/api/v1/organization-trainings" &&
            init?.method === "POST",
        )?.[1]?.body,
      ),
    );

    expect(weakDraftBody).toMatchObject({
      sourceTaskPublicId:
        "admin_ai_generation_task_organization_question_history",
    });

    vi.unstubAllGlobals();
    const noneFetchMock = vi.fn(
      async (url: string | URL, init?: RequestInit) => {
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
            init,
          )
        ) {
          return Response.json(
            createTaskHistoryResponse({
              workspace: "organization",
              generationKind: "question",
              generatedResult: {
                resultPublicId: noneResultPublicId,
                contentPreviewMasked: "none organization result",
                evidenceStatus: "none",
                citationCount: 0,
              },
            }),
          );
        }

        throw new Error(`Unexpected fetch: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", noneFetchMock);
    cleanup();

    render(
      createElement(AdminAiGenerationEntryPage, {
        workspace: "organization",
        generationKind: "question",
      }),
    );

    const blockedCopyAction = await screen.findByTestId(
      "organization-ai-training-copy-action",
    );

    expect(blockedCopyAction).toBeDisabled();
    expect(blockedCopyAction).toHaveTextContent("创建企业训练草稿");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("资料不足，暂不可作为组织训练素材");
    expect(noneFetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
      "/api/v1/organization-ai-generation-requests?generationKind=question&page=1&pageSize=10",
    ]);
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
