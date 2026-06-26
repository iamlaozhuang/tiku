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

function createSessionResponse(input: {
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
}) {
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
        organizationPublicId: input.organizationPublicId ?? null,
        adminPublicId: "admin_public_123",
        adminRoles: input.adminRoles,
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
    expect(sharedSurfaceSource).not.toContain("modelProvider");
    expect(sharedSurfaceSource).not.toContain("providerPayload");
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

    expect(questionRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(questionRouteSource).toContain('workspace="organization"');
    expect(questionRouteSource).toContain('generationKind="question"');
    expect(paperRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(paperRouteSource).toContain('workspace="organization"');
    expect(paperRouteSource).toContain('generationKind="paper"');
    expect(portalRouteSource).toContain("AdminOrganizationPortalPage");
    expect(trainingRouteSource).toContain("AdminOrganizationTrainingPage");
    expect(analyticsRouteSource).toContain("AdminOrganizationAnalyticsPage");
    expect(sharedSurfaceSource).toContain("org_advanced_admin");
    expect(sharedSurfaceSource).toContain("org_standard_admin");
    expect(sharedSurfaceSource).toContain("标准版暂不可用");
    expect(sharedSurfaceSource).not.toContain(
      "/content/ai-question-generation",
    );
    expect(sharedSurfaceSource).not.toContain("/content/ai-paper-generation");
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
        String(url) === "/api/v1/content-ai-generation-requests" &&
        init?.method === "POST"
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

      if (String(url) === "/api/v1/content-ai-generation-requests") {
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
        "/api/v1/content-ai-generation-requests",
        "/api/v1/content-ai-generation-requests",
        "/api/v1/content-ai-generation-requests",
      ]);
    });
    const requestInit = fetchMock.mock.calls[2]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toEqual({
      generationKind: "question",
    });
    expect(
      await screen.findByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("local_contract_only");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("summary_only");
    expect(
      await screen.findByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("Provider 已阻断");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "admin_ai_generation_task_content_question_history",
    );
    expect(document.body.textContent).not.toContain("OMITTED_UI_FIXTURE_A");
    expect(document.body.textContent).not.toContain("OMITTED_UI_FIXTURE_B");
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
        String(url) === "/api/v1/organization-ai-generation-requests" &&
        init?.method === "POST"
      ) {
        return Response.json(
          createLocalContractResponse({
            workspace: "organization",
            generationKind: "paper",
          }),
        );
      }

      if (String(url) === "/api/v1/organization-ai-generation-requests") {
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
        "/api/v1/organization-ai-generation-requests",
        "/api/v1/organization-ai-generation-requests",
        "/api/v1/organization-ai-generation-requests",
      ]);
    });
    expect(
      await screen.findByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("暂无生成结果");
    expect(
      screen.getByTestId("admin-ai-generation-local-contract-summary"),
    ).toHaveTextContent("summary_only");
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

      if (String(url) === "/api/v1/content-ai-generation-requests") {
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
    ).toHaveTextContent("Provider 已阻断");
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("正式写入已阻断");
    expect(document.body.textContent).not.toContain(
      "admin_ai_generation_task_content_paper_secret_123",
    );
  });

  it("shows persisted redacted generated result summaries for content admin history", async () => {
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

      if (String(url) === "/api/v1/content-ai-generation-requests") {
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
    ).toHaveTextContent(
      "redacted generated result summary for content history",
    );
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("redacted_snapshot");
    expect(document.body.textContent).not.toContain(taskPublicId);
    expect(document.body.textContent).not.toContain(resultPublicId);
    expect(document.body.textContent).not.toContain("rawPrompt");
    expect(document.body.textContent).not.toContain("rawOutput");
    expect(document.body.textContent).not.toContain("providerPayload");
  });

  it("shows persisted redacted generated result summaries for organization advanced admin history", async () => {
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

      if (String(url) === "/api/v1/organization-ai-generation-requests") {
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
    ).toHaveTextContent(
      "redacted generated result summary for organization history",
    );
    expect(
      screen.getByTestId("admin-ai-generation-task-history"),
    ).toHaveTextContent("redacted_snapshot");
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

      if (String(url) === "/api/v1/content-ai-generation-requests") {
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

  it("shows a redacted history error state when metadata history loading fails", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return Response.json(
          createSessionResponse({ adminRoles: ["content_admin"] }),
        );
      }

      if (String(url) === "/api/v1/content-ai-generation-requests") {
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
