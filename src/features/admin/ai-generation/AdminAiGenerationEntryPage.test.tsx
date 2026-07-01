import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAiGenerationEntryPage } from "./AdminAiGenerationEntryPage";

function createJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
    },
  });
}

function createAdminSessionResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_public_admin_ai_ui",
        phone: "13800000000",
        name: "Content Admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin_public_content_ai_ui",
        adminRoles: ["content_admin"],
      },
      session: {
        expiresAt: "2026-07-01T20:00:00.000Z",
      },
    },
  };
}

function createEmptyHistoryResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      workspace: "content",
      latestTask: null,
      items: [],
      redactionStatus: "redacted",
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
  };
}

function createGeneratedContractResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      runtimeStatus: "local_contract_only",
      workspace: "content",
      generationKind: "question",
      flowStatus: "accepted",
      redactionStatus: "redacted",
      resultState: {
        status: "succeeded",
        taskPublicId: "admin_ai_generation_task_public_ui_hidden",
        resultPublicId: "admin_ai_generation_result_public_ui_hidden",
        contentVisibility: "summary_only",
        evidenceStatus: "sufficient",
        citationCount: 3,
        redactionStatus: "redacted",
      },
      taskRequest: {
        requestPublicId: "admin_ai_generation_request_public_ui_hidden",
        taskPublicId: "admin_ai_generation_task_public_ui_hidden",
        taskType: "ai_question_generation",
        actorPublicId: "admin_public_content_ai_ui",
        authorizationSource: "admin_role",
        authorizationPublicId: "admin_role_content_ai_generation",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
        quotaOwnerType: "platform",
        quotaOwnerPublicId: "platform_content_review_pool",
        effectiveEdition: "advanced",
        decision: "create_pending_task",
        initialStatus: "pending",
        isAuthorizationActive: true,
        isScopeAllowed: true,
        isQuotaAvailable: true,
        isRuntimeConfigReady: true,
        blockedFailureCategory: null,
        idempotency: {
          keyHash: "sha256:admin_ai_ui_hidden",
        },
        resultReference: {
          resultKind: "ai_generated_question_set",
          resultPublicId: "admin_ai_generation_result_public_ui_hidden",
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 3,
          redactionStatus: "redacted",
        },
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      },
      runtimeBridge: {
        bridgeStatus: "provider_call_succeeded",
        providerCallExecuted: true,
        envSecretAccessed: true,
        providerConfigurationRead: true,
        costCalibrationExecuted: false,
        executionSummary: {
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 20,
          usageSummary: {
            promptTokens: 4,
            completionTokens: 4,
            totalTokens: 8,
          },
          providerErrorSummary: null,
          redactionStatus: "redacted",
        },
        visibleGeneratedContent: {
          content: "后台本次生成草稿摘要",
          contentVisibility: "transient_response_only",
          persistenceStatus: "not_persisted",
          safetyStatus: "checked",
          groundingSummary: {
            evidenceStatus: "sufficient",
            citationCount: 3,
          },
          structuredPreview: {
            kind: "question_set",
            parseStatus: "parsed",
            requestedQuestionCount: 10,
            actualQuestionCount: 10,
            draftCount: 10,
            draftSummaries: [],
          },
        },
        redactionStatus: "redacted",
        blockedReasons: [],
      },
      formalContentBoundary: {
        questionWriteStatus: "blocked_without_follow_up_task",
        paperWriteStatus: "blocked_without_follow_up_task",
      },
      organizationOwnedDraftBoundary: {
        generatedResultScope: "platform_review_pool",
        organizationDraftAdoptionStatus: "not_applicable_to_content_workspace",
        organizationTrainingSourceStatus: "not_applicable_to_content_workspace",
        platformFormalDraftStatus: "blocked_requires_content_admin_review",
        publishStatus: "blocked_requires_fresh_publish_task",
        studentVisibleStatus: "blocked",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
        redactionStatus: "redacted",
      },
      taskPersistence: {
        persistenceStatus: "created",
        requestPublicId: "admin_ai_generation_request_public_ui_hidden",
        taskPublicId: "admin_ai_generation_task_public_ui_hidden",
        status: "succeeded",
        resultPublicId: "admin_ai_generation_result_public_ui_hidden",
        contentVisibility: "summary_only",
        evidenceStatus: "sufficient",
        citationCount: 3,
        redactionStatus: "redacted",
      },
      generatedResult: {
        persistenceStatus: "created",
        resultPublicId: "admin_ai_generation_result_public_ui_hidden",
        contentVisibility: "redacted_snapshot",
        evidenceStatus: "sufficient",
        citationCount: 3,
        formalAdoptionStatus: "blocked",
        redactionStatus: "redacted",
      },
    },
  };
}

function mockAdminAiGenerationFetch() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

      if (url === "/api/v1/sessions") {
        return createJsonResponse(createAdminSessionResponse());
      }

      if (url.startsWith("/api/v1/content-ai-generation-requests?")) {
        return createJsonResponse(createEmptyHistoryResponse());
      }

      if (
        url === "/api/v1/content-ai-generation-requests" &&
        init?.method === "POST"
      ) {
        return createJsonResponse(createGeneratedContractResponse());
      }

      return createJsonResponse({
        code: 404001,
        message: "Unexpected admin AI generation test request.",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("AdminAiGenerationEntryPage", () => {
  it("shows generated draft content with business wording and hides governance implementation terms", async () => {
    mockAdminAiGenerationFetch();

    render(
      <AdminAiGenerationEntryPage
        generationKind="question"
        workspace="content"
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "AI出题" }));

    await waitFor(() => {
      expect(
        screen.getByTestId("admin-visible-generated-content"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("后台本次生成草稿摘要")).toBeInTheDocument();
    expect(screen.getByText("资料充足")).toBeInTheDocument();
    expect(screen.queryByText("不持久化正文")).not.toBeInTheDocument();
    expect(screen.queryByText("元数据历史")).not.toBeInTheDocument();
    expect(screen.queryByText(/paper_section/u)).not.toBeInTheDocument();
    expect(screen.queryByText("本地合约")).not.toBeInTheDocument();
    expect(screen.queryByText("已脱敏")).not.toBeInTheDocument();
    expect(screen.queryByText("redactionStatus")).not.toBeInTheDocument();
    expect(screen.queryByText("evidenceStatus")).not.toBeInTheDocument();
    expect(screen.queryByText("citationCount")).not.toBeInTheDocument();
    expect(
      screen.queryByText("admin_ai_generation_result_public_ui_hidden"),
    ).not.toBeInTheDocument();
  });

  it("uses business wording for AI paper controls instead of schema identifiers", async () => {
    mockAdminAiGenerationFetch();

    render(
      <AdminAiGenerationEntryPage generationKind="paper" workspace="content" />,
    );

    expect(await screen.findByText("内容 AI组卷")).toBeInTheDocument();
    expect(screen.getByText("按大题模块组织")).toBeInTheDocument();
    expect(screen.getByText("生成记录")).toBeInTheDocument();
    expect(screen.queryByText(/paper_section/u)).not.toBeInTheDocument();
    expect(screen.queryByText("元数据历史")).not.toBeInTheDocument();
  });
});
