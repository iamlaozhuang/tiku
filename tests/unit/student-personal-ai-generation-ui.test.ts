import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentPersonalAiGenerationPage } from "@/features/student/ai-generation/StudentPersonalAiGenerationPage";
import { COOKIE_BACKED_SESSION_MARKER } from "@/features/student/studentRuntimeApi";
import type {
  EffectiveAuthorizationCapabilitiesDto,
  EffectiveAuthorizationContextDto,
} from "@/server/contracts/effective-authorization-contract";

const pageTitle = "AI训练";
const requestButtonLabel = "AI出题：生成练习题";
const paperButtonLabel = "AI组卷：生成自测试卷";
const blockedTitle = "\u8bf7\u6c42\u5df2\u963b\u65ad";
const unauthorizedTitle = "\u8bf7\u5148\u767b\u5f55";
const unavailableTitle =
  "\u5f53\u524d\u6388\u6743\u6682\u672a\u5f00\u653e AI \u8bad\u7ec3";
const historyTitle = "\u8fd1\u671f AI \u8bf7\u6c42\u5386\u53f2";
const historyEmptyTitle = "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42";
const historyErrorTitle = "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528";
const localSessionUserPublicId = "user-dev-student";

const serverHistoryResponse = {
  code: 0,
  message: "ok",
  data: [
    {
      requestPublicId: "personal-ai-request-public-initial-001",
      taskPublicId: "ai-generation-task-public-initial-001",
      status: "succeeded",
      requestedAt: "2026-06-12T10:00:00.000Z",
      taskType: "ai_question_generation",
      resultPublicId: "ai-result-public-initial-001",
      evidenceStatus: "sufficient",
      citationCount: 1,
      aiCallLogPublicId: "ai-call-log-public-initial-001",
      redactionStatus: "redacted",
    },
  ],
};

const serverHistoryAfterSubmitResponse = {
  code: 0,
  message: "ok",
  data: [
    {
      requestPublicId: "personal-ai-request-public-server-after-submit-001",
      taskPublicId: "ai-generation-task-public-server-after-submit-001",
      status: "pending",
      requestedAt: "2026-06-12T12:30:00.000Z",
      taskType: "ai_question_generation",
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      redactionStatus: "redacted",
    },
  ],
};

const emptyServerHistoryResponse = {
  code: 0,
  message: "ok",
  data: [],
};

const emptyResultHistoryResponse = {
  code: 0,
  message: "ok",
  data: {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    results: [],
  },
};

const localExperienceResponse = {
  code: 0,
  message: "ok",
  data: {
    runtimeStatus: "local_contract_only",
    experienceSurface: "student_local_browser",
    flowStatus: "accepted",
    redactionStatus: "redacted",
    requestState: {
      status: "ready",
      selectedContext: {
        contextType: "paper",
        contextPublicId: "paper-public-001",
      },
      action: {
        actionType: "submit_personal_ai_generation_request",
        isEnabled: true,
        disabledReason: null,
      },
    },
    resultState: {
      status: "pending",
      taskPublicId: "ai-generation-task-public-001",
      resultPublicId: null,
      contentVisibility: "summary_only",
      isFormalAdoptionBlocked: true,
      evidenceStatus: "none",
      citationCount: 0,
      redactionStatus: "redacted",
    },
    stateCoverage: {
      loadingState: "supported",
      emptyState: "supported",
      errorState: "supported",
      permissionBlockedState: "supported",
    },
    runtimeBridge: {
      bridgeStatus: "provider_call_blocked",
      bridgeMode: "default_blocked",
      runnerMode: "provider_call_blocked_runner",
      localSwitchRequired: true,
      explicitLocalSwitchPresent: false,
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      providerRetryAttempted: false,
      providerStreamingEnabled: false,
      costCalibrationExecuted: false,
      redactionStatus: "redacted",
      providerMetadata: {
        modelProvider: "openai_compatible",
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
        baseUrlHost: "dashscope.aliyuncs.com",
        envKeyAlias: "ALIBABA_API_KEY",
      },
      redactionProbe: {
        requestContext: {
          redactionStatus: "redacted",
          reason: "user_answer",
        },
        modelOutput: {
          redactionStatus: "redacted",
          reason: "model_output",
        },
        providerRequestPayload: null,
        providerResponsePayload: null,
        providerErrorPayload: null,
      },
      providerExecutionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "provider_call_blocked",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      resultMaterializationSummary: {
        materializationStatus: "not_requested",
        failureCategory: "not_requested",
        resultPublicId: null,
        contentDigest: null,
        contentPreviewMasked: null,
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        evidenceStatus: "none",
        citationCount: 0,
        formalAdoptionStatus: "blocked",
      },
      visibleGeneratedContent: null,
      blockedReasons: ["provider_call_blocked"],
    },
    requestFlow: {
      runtimeStatus: "local_contract_only",
      flowStatus: "accepted",
      redactionStatus: "redacted",
      request: {
        userPublicId: "student-public-001",
        authorizationPublicId: "personal-auth-public-001",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        generationContext: {
          questionPublicId: "question-public-001",
          answerRecordPublicId: "answer-record-public-001",
          paperPublicId: "paper-public-001",
          mockExamPublicId: null,
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper-public-001",
          },
        },
        redeemCodeReference: {
          publicId: null,
          redactionStatus: "redacted",
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
      },
      contextSelection: {
        userPublicId: "student-public-001",
        authorizationBoundary: {
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal-auth-public-001",
          ownerType: "personal",
          quotaOwnerType: "personal",
        },
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        selectedContext: {
          contextType: "paper",
          contextPublicId: "paper-public-001",
        },
        redactionStatus: "redacted",
      },
      taskRequest: {
        runtimeStatus: "local_contract_only",
        requestDecision: "create_new_task",
        rejectionReason: null,
        idempotencyKeyHash: "sha256:student-local-request",
        taskPublicId: "ai-generation-task-public-001",
        existingTaskPublicId: null,
        quotaReservation: {
          isReserved: true,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student-public-001",
        },
        redactionStatus: "redacted",
      },
      resultReference: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai-generation-task-public-001",
        taskType: "ai_question_generation",
        status: "pending",
        failureCategory: null,
        resultReference: {
          resultPublicId: null,
          contentVisibility: "summary_only",
          isFormalAdoptionBlocked: true,
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        aiCallLogReference: {
          aiCallLogPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
      },
    },
  },
};

const localSessionResponse = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: localSessionUserPublicId,
      phone: "13900000002",
      name: "Local Student",
      userType: "personal",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-06-19T12:00:00.000Z",
    },
  },
};

const employeeSessionResponse = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "employee-session-user-public-123",
      phone: "13900000003",
      name: "Organization Employee",
      userType: "employee",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: "employee-public-123",
      organizationPublicId: "organization-public-123",
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-06-19T12:00:00.000Z",
    },
  },
};

const baseAuthorizationCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
} satisfies EffectiveAuthorizationCapabilitiesDto;

type AuthorizationContextOverrides = Omit<
  Partial<EffectiveAuthorizationContextDto>,
  "capabilities"
> & {
  capabilities?: Partial<EffectiveAuthorizationCapabilitiesDto>;
};

function createAuthorizationContext(
  overrides: AuthorizationContextOverrides = {},
): EffectiveAuthorizationContextDto {
  return {
    profession: "monopoly",
    level: 3,
    contextDisplayStatus: "display_only",
    edition: "advanced",
    effectiveEdition: "advanced",
    upgradeStatus: "none",
    expiresAt: "2027-06-23T00:00:00.000Z",
    displayStatus: "active",
    authorizationSource: "personal_auth",
    authorizationPublicId: "authorization-context-ui-001",
    ownerType: "personal",
    ownerPublicId: "student-public-ui-001",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student-public-ui-001",
    blockedReason: null,
    ...overrides,
    capabilities: {
      ...baseAuthorizationCapabilities,
      canGenerateAiQuestion: true,
      canGenerateAiPaper: true,
      ...(overrides.capabilities ?? {}),
    },
  };
}

function createAdvancedAuthorizationListResponse(
  overrides: AuthorizationContextOverrides = {},
) {
  return createAuthorizationListResponse([
    createAuthorizationContext(overrides),
  ]);
}

function createAuthorizationListResponse(
  authorizationContexts: EffectiveAuthorizationContextDto[],
) {
  return {
    code: 0,
    message: "ok",
    data: {
      authorizations: [],
      effectiveAuthorizations: [],
      authorizationContexts,
    },
  };
}

function createPersonalAiGenerationFetchMock(
  experienceResponse: unknown = localExperienceResponse,
  historyResponse: unknown = emptyServerHistoryResponse,
) {
  return vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => localSessionResponse,
      };
    }

    if (path === "/api/v1/authorizations") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => createAdvancedAuthorizationListResponse(),
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      if (init?.method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => historyResponse,
        };
      }

      expect(init?.method).toBe("POST");

      return {
        ok: true,
        status: 200,
        json: async () => experienceResponse,
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-results")) {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => emptyResultHistoryResponse,
      };
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

function createPersonalAiGenerationFetchMockWithHistorySequence(
  historyResponses: unknown[],
  experienceResponse: unknown = localExperienceResponse,
) {
  const remainingHistoryResponses = [...historyResponses];

  return vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => localSessionResponse,
      };
    }

    if (path === "/api/v1/authorizations") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => createAdvancedAuthorizationListResponse(),
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      if (init?.method === "GET") {
        const historyResponse =
          remainingHistoryResponses.shift() ?? emptyServerHistoryResponse;

        return {
          ok: true,
          status: 200,
          json: async () => historyResponse,
        };
      }

      expect(init?.method).toBe("POST");

      return {
        ok: true,
        status: 200,
        json: async () => experienceResponse,
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-results")) {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => emptyResultHistoryResponse,
      };
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

function expectRenderedTextToHideValues(
  values: Array<string | null | undefined>,
) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    expect(screen.queryByText(value)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(value);
  }
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("StudentPersonalAiGenerationPage", () => {
  it.each([
    {
      roleName: "standard personal learner",
      authorizationContext: createAuthorizationContext({
        edition: "standard",
        effectiveEdition: "standard",
        authorizationSource: "personal_auth",
        ownerType: "personal",
        ownerPublicId: "student-public-ui-001",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student-public-ui-001",
        capabilities: {
          canGenerateAiQuestion: false,
          canGenerateAiPaper: false,
        },
      }),
    },
    {
      roleName: "standard organization employee",
      authorizationContext: createAuthorizationContext({
        edition: "standard",
        effectiveEdition: "standard",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: "organization-public-ui-001",
        organizationPublicId: "organization-public-ui-001",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization-public-ui-001",
        capabilities: {
          canGenerateAiQuestion: false,
          canGenerateAiPaper: false,
        },
      }),
    },
  ])(
    "renders unavailable state for direct AI route access by $roleName",
    async ({ authorizationContext }) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
      const fetchMock = vi.fn(
        async (url: RequestInfo | URL, init?: RequestInit) => {
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          if (String(url) === "/api/v1/authorizations") {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () =>
                createAuthorizationListResponse([authorizationContext]),
            };
          }

          if (
            String(url).startsWith("/api/v1/personal-ai-generation-requests")
          ) {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          if (
            String(url).startsWith("/api/v1/personal-ai-generation-results")
          ) {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () => emptyResultHistoryResponse,
            };
          }

          throw new Error(`Unexpected fetch path: ${String(url)}`);
        },
      );
      vi.stubGlobal("fetch", fetchMock);

      render(createElement(StudentPersonalAiGenerationPage));

      expect(await screen.findByText(unavailableTitle)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: requestButtonLabel }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: paperButtonLabel }),
      ).toBeDisabled();
      expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
        "/api/v1/authorizations",
      ]);
    },
  );

  it("loads redacted request history from the server on initial render when a student session token exists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => serverHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      await screen.findByText("2026-06-12T10:00:00.000Z"),
    ).toBeInTheDocument();
    expect(screen.getByText("状态")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("请求时间")).toBeInTheDocument();
    expect(screen.getByText("脱敏状态")).toBeInTheDocument();
    expect(screen.getAllByText("已脱敏").length).toBeGreaterThan(0);
    expect(screen.getByText("证据充分")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expectRenderedTextToHideValues([
      serverHistoryResponse.data[0].requestPublicId,
      serverHistoryResponse.data[0].taskPublicId,
      serverHistoryResponse.data[0].resultPublicId,
      serverHistoryResponse.data[0].aiCallLogPublicId,
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("posts a session-aligned camelCase public-id payload to the local route contract without rendering the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
            "content-type": "application/json",
          });

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      screen.getByRole("heading", { name: pageTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("\u5c1a\u672a\u63d0\u4ea4\u672c\u5730\u8bf7\u6c42"),
    ).toBeInTheDocument();
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("仅本地合约")).toBeInTheDocument();
    expect(screen.getByText("学员本地页面")).toBeInTheDocument();
    expect(screen.getByText("已受理")).toBeInTheDocument();
    expect(screen.getByText("内容可见性")).toBeInTheDocument();
    expect(screen.getByText("引用脱敏状态")).toBeInTheDocument();
    expect(screen.getAllByText("处理中").length).toBeGreaterThan(0);
    expect(screen.getByText("仅摘要")).toBeInTheDocument();
    expect(screen.getByText("是否阻断正式入库")).toBeInTheDocument();
    expect(screen.getByText("是")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始练习" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "提交作答" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "查看学习反馈" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "重试生成" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "开始练习" }));
    expect(screen.getByText("生成练习已就绪")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    expect(screen.getByText("作答已提交")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看学习反馈" }));
    expect(screen.getByText("学习反馈可查看")).toBeInTheDocument();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/v1/authorizations");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
    );
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
    );
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe("/api/v1/sessions");
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[4]?.[0])).toBe("/api/v1/authorizations");
    expect(fetchMock.mock.calls[4]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[5]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests",
    );
    expect(fetchMock.mock.calls[5]?.[1]?.method).toBe("POST");
    expect(String(fetchMock.mock.calls[6]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
    );
    expect(fetchMock.mock.calls[6]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[7]?.[0])).toBe(
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
    );
    expect(fetchMock.mock.calls[7]?.[1]?.method).toBe("GET");

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[5]?.[1]?.body),
    ) as Record<string, unknown>;

    expect(requestBody).toEqual({
      responseMode: "local_browser_experience",
      userPublicId: localSessionUserPublicId,
      requestPublicId: expect.stringMatching(/^personal-ai-request-public-/),
      authorizationPublicId: "personal-auth-public-001",
      aiFuncType: "explanation",
      questionPublicId: "question-public-001",
      answerRecordPublicId: "answer-record-public-001",
      paperPublicId: "paper-public-001",
      mockExamPublicId: null,
      redeemCodePublicId: null,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
      taskPublicId: expect.stringMatching(/^ai-generation-task-public-/),
      taskType: "ai_question_generation",
      actorPublicId: localSessionUserPublicId,
      authorizationSource: "personal_auth",
      ownerType: "personal",
      ownerPublicId: localSessionUserPublicId,
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: localSessionUserPublicId,
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      idempotencyKeyHash: expect.stringMatching(
        /^sha256:student-local-request-/,
      ),
      existingTaskPublicId: null,
      existingTaskStatus: null,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
    });
    expect(JSON.stringify(requestBody)).not.toContain(
      "unit-test-session-token",
    );
    expect(requestBody.requestPublicId).not.toBe(
      "personal-ai-request-public-001",
    );
    expect(requestBody.taskPublicId).not.toBe("ai-generation-task-public-001");
    expect(requestBody.idempotencyKeyHash).not.toBe(
      "sha256:student-local-request",
    );
    expectRenderedTextToHideValues([
      String(requestBody.requestPublicId),
      String(requestBody.taskPublicId),
      String(requestBody.authorizationPublicId),
      String(requestBody.questionPublicId),
      String(requestBody.answerRecordPublicId),
      String(requestBody.paperPublicId),
      String(requestBody.userPublicId),
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("posts an organization-context local route contract payload for employee sessions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      userPublicId: "employee-session-user-public-123",
      actorPublicId: "employee-session-user-public-123",
      authorizationSource: "org_auth",
      ownerType: "organization",
      ownerPublicId: "organization-public-123",
      organizationPublicId: "organization-public-123",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization-public-123",
    });
    expect(JSON.stringify(submittedBodies[0])).not.toContain(
      "unit-test-session-token",
    );
  });

  it("renders learner AI detail controls for advanced organization employee before submitting", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "AI出题参数" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "AI组卷参数" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题专业")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题等级")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题科目")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题知识点")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题题型")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题题目数量")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题难度")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题学习目标")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷专业")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷等级")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷科目")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷题型分布")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷知识点覆盖")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷大题结构")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷难度")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷时长目标")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷学习目标")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: requestButtonLabel }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: paperButtonLabel }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "开始练习" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "提交作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "查看学习反馈" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重试生成" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "GET",
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
  });

  it("posts an AI paper generation local route contract payload from the paper action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    const paperButton = screen.getByRole("button", {
      name: paperButtonLabel,
    });
    expect(paperButton).toBeEnabled();

    fireEvent.click(paperButton);

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_paper_generation",
      aiFuncType: "explanation",
      responseMode: "local_browser_experience",
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
    });
    expect(JSON.stringify(submittedBodies[0])).not.toContain(
      "unit-test-session-token",
    );
  });

  it("generates unique request identifiers for consecutive personal AI generation submits", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init).toBeDefined();
          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(await screen.findByText("仅本地合约")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(2));

    const [firstRequestBody, secondRequestBody] = submittedBodies as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];

    expect(firstRequestBody.userPublicId).toBe(localSessionUserPublicId);
    expect(secondRequestBody.userPublicId).toBe(localSessionUserPublicId);
    expect(firstRequestBody.requestPublicId).not.toBe(
      secondRequestBody.requestPublicId,
    );
    expect(firstRequestBody.taskPublicId).not.toBe(
      secondRequestBody.taskPublicId,
    );
    expect(firstRequestBody.idempotencyKeyHash).not.toBe(
      secondRequestBody.idempotencyKeyHash,
    );
  });

  it("refreshes server-backed request history after successful submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence([
      emptyServerHistoryResponse,
      serverHistoryAfterSubmitResponse,
    ]);
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("仅本地合约")).toBeInTheDocument();
    expect(
      await screen.findByText("2026-06-12T12:30:00.000Z"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("处理中").length).toBeGreaterThan(0);
    expect(screen.getAllByText("无证据").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("已脱敏").length).toBeGreaterThan(0);
    expectRenderedTextToHideValues([
      serverHistoryAfterSubmitResponse.data[0].requestPublicId,
      serverHistoryAfterSubmitResponse.data[0].taskPublicId,
      serverHistoryAfterSubmitResponse.data[0].resultPublicId,
      serverHistoryAfterSubmitResponse.data[0].aiCallLogPublicId,
      "personal-ai-request-public-001",
    ]);
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "/api/v1/authorizations",
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
      "/api/v1/sessions",
      "/api/v1/authorizations",
      "/api/v1/personal-ai-generation-requests",
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
    ]);
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "GET",
      "GET",
      "GET",
      "POST",
      "GET",
      "GET",
    ]);
  });

  it("renders transient visible generated content from a provider-enabled local response", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          bridgeMode: "controlled_runner",
          runnerMode: "route_integrated_provider_runner",
          explicitLocalSwitchPresent: true,
          realProviderExecutionApproved: true,
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          providerExecutionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 42,
            usageSummary: {
              inputTokens: 12,
              outputTokens: 24,
              totalTokens: 36,
            },
            providerErrorSummary: null,
            redactionStatus: "redacted",
          },
          visibleGeneratedContent: {
            content: "学生端本次生成内容：先复习知识点，再完成两道自练题。",
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
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence(
      [emptyServerHistoryResponse, emptyServerHistoryResponse],
      visibleResponse,
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(
      await screen.findByTestId("student-visible-generated-content"),
    ).toHaveTextContent("学生端本次生成内容：先复习知识点，再完成两道自练题。");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("结构化预览");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("草稿 10/10");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders a redacted history error state when the post-submit server refresh fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence([
      emptyServerHistoryResponse,
      {
        code: 500017,
        message:
          "Personal AI request history is temporarily unavailable. database stack provider payload",
        data: null,
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("仅本地合约")).toBeInTheDocument();
    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("database stack");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(7));
  });

  it("renders a true unauthorized state after the cookie-backed session probe fails when no local token exists", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/sessions");
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 401001,
            message: "User session is required.",
            data: null,
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      screen.getByText("\u6b63\u5728\u6821\u9a8c\u5b66\u5458\u4f1a\u8bdd"),
    ).toBeInTheDocument();
    expect(await screen.findByText(unauthorizedTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: requestButtonLabel }),
    ).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads histories through the cookie-backed session marker without a bearer header", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      COOKIE_BACKED_SESSION_MARKER,
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(
      await screen.findByText("\u6682\u65e0\u5386\u53f2\u7ed3\u679c"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      COOKIE_BACKED_SESSION_MARKER,
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("renders the local contract blocked state without provider content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const blockedResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "blocked",
        requestState: {
          ...localExperienceResponse.data.requestState,
          status: "blocked",
          action: {
            actionType: "submit_personal_ai_generation_request",
            isEnabled: false,
            disabledReason: "quota_insufficient",
          },
        },
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "blocked",
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock(blockedResponse),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(blockedTitle)).toBeInTheDocument();
    expect(screen.getByText("额度不足")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
  });

  it("renders redacted result and ai_call_log reference metadata without raw provider content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const redactedReferenceResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: "ai-generation-task-public-001",
          resultPublicId: "ai-result-public-001",
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            status: "succeeded",
            resultReference: {
              resultPublicId: "ai-result-public-001",
              contentVisibility: "summary_only",
              evidenceStatus: "sufficient",
              citationCount: 2,
              redactionStatus: "redacted",
            },
            aiCallLogReference: {
              aiCallLogPublicId: "ai-call-log-public-001",
              contentVisibility: "summary_only",
              redactionStatus: "redacted",
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [
          emptyServerHistoryResponse,
          {
            code: 0,
            message: "ok",
            data: [
              {
                requestPublicId:
                  "personal-ai-request-public-server-history-001",
                taskPublicId: "ai-generation-task-public-history-001",
                status: "succeeded",
                requestedAt: "2026-06-12T12:45:00.000Z",
                taskType: "ai_question_generation",
                resultPublicId: "ai-result-public-history-001",
                evidenceStatus: "weak",
                citationCount: 3,
                aiCallLogPublicId: "ai-call-log-public-history-001",
                redactionStatus: "redacted",
              },
            ],
          },
        ],
        redactedReferenceResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("仅本地合约")).toBeInTheDocument();
    expect(screen.getAllByText("内容可见性").length).toBeGreaterThan(0);
    expect(screen.getAllByText("仅摘要").length).toBeGreaterThan(0);
    expect(screen.getAllByText("证据状态").length).toBeGreaterThan(0);
    expect(screen.getAllByText("证据充分").length).toBeGreaterThan(0);
    expect(screen.getAllByText("引用数量").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getByText("引用脱敏状态")).toBeInTheDocument();
    expectRenderedTextToHideValues([
      redactedReferenceResponse.data.resultState.taskPublicId,
      redactedReferenceResponse.data.resultState.resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.resultReference
        .resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference
        .aiCallLogReference.aiCallLogPublicId,
    ]);
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("places transient visible generated content next to the submit action before practice feedback", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "本次临时预览摘要",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 10,
              actualQuestionCount: 10,
              draftCount: 10,
              draftSummaries: [],
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [emptyServerHistoryResponse, serverHistoryAfterSubmitResponse],
        visibleResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    const visibleGeneratedContent = await screen.findByTestId(
      "student-visible-generated-content",
    );
    const practiceFeedbackHeading = screen.getByText(
      "\u751f\u6210\u7ec3\u4e60\u4e0e\u5b66\u4e60\u53cd\u9988",
    );

    expect(
      visibleGeneratedContent.compareDocumentPosition(practiceFeedbackHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(visibleGeneratedContent).toHaveTextContent("草稿 10/10");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders redacted recent request history rows from camelCase read-model fields", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const redactedReferenceResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: "ai-generation-task-public-history-001",
          resultPublicId: "ai-result-public-history-001",
          contentVisibility: "summary_only",
          evidenceStatus: "weak",
          citationCount: 3,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskPublicId: "ai-generation-task-public-history-001",
            status: "succeeded",
            resultReference: {
              resultPublicId: "ai-result-public-history-001",
              contentVisibility: "summary_only",
              evidenceStatus: "weak",
              citationCount: 3,
              redactionStatus: "redacted",
            },
            aiCallLogReference: {
              aiCallLogPublicId: "ai-call-log-public-history-001",
              contentVisibility: "summary_only",
              redactionStatus: "redacted",
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [
          emptyServerHistoryResponse,
          {
            code: 0,
            message: "ok",
            data: [
              {
                requestPublicId:
                  "personal-ai-request-public-server-history-001",
                taskPublicId: "ai-generation-task-public-history-001",
                status: "succeeded",
                requestedAt: "2026-06-12T12:45:00.000Z",
                taskType: "ai_question_generation",
                resultPublicId: "ai-result-public-history-001",
                evidenceStatus: "weak",
                citationCount: 3,
                aiCallLogPublicId: "ai-call-log-public-history-001",
                redactionStatus: "redacted",
              },
            ],
          },
        ],
        redactedReferenceResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));

    expect(screen.getByText(historyTitle)).toBeInTheDocument();
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(
      await screen.findByText("2026-06-12T12:45:00.000Z"),
    ).toBeInTheDocument();
    expect(screen.queryByText("requestPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("taskPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("resultPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("aiCallLogPublicId")).not.toBeInTheDocument();
    expect(screen.getByText("请求时间")).toBeInTheDocument();
    expect(screen.getAllByText("证据较弱").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("已脱敏").length).toBeGreaterThan(0);
    expectRenderedTextToHideValues([
      redactedReferenceResponse.data.resultState.taskPublicId,
      redactedReferenceResponse.data.resultState.resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.taskPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.resultReference
        .resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference
        .aiCallLogReference.aiCallLogPublicId,
      "personal-ai-request-public-server-history-001",
      "ai-generation-task-public-history-001",
      "ai-result-public-history-001",
      "ai-call-log-public-history-001",
    ]);
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("full paper content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("requests task-type isolated paginated histories and shows the active history filter", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const observedGetUrls: string[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            observedGetUrls.push(path);

            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          return {
            ok: true,
            status: 200,
            json: async () => ({
              ...localExperienceResponse,
              data: {
                ...localExperienceResponse.data,
                requestFlow: {
                  ...localExperienceResponse.data.requestFlow,
                  resultReference: {
                    ...localExperienceResponse.data.requestFlow.resultReference,
                    taskType: "ai_paper_generation",
                  },
                },
              },
            }),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          observedGetUrls.push(path);

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(screen.getAllByText("当前筛选：AI出题").length).toBeGreaterThan(0);
    expect(observedGetUrls).toEqual(
      expect.arrayContaining([
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
      ]),
    );

    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    await waitFor(() => {
      expect(observedGetUrls).toEqual(
        expect.arrayContaining([
          "/api/v1/personal-ai-generation-requests?taskType=ai_paper_generation&page=1&pageSize=10",
          "/api/v1/personal-ai-generation-results?taskType=ai_paper_generation&page=1&pageSize=10",
        ]),
      );
    });
    expect(screen.getAllByText("当前筛选：AI组卷").length).toBeGreaterThan(0);
  });

  it("renders request history error state without exposing private content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock({
        code: 500001,
        message: "local failure",
        data: null,
      }),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders the initial request history error state without exposing private content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock(localExperienceResponse, {
        code: 500001,
        message: "local failure",
        data: null,
      }),
    );

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });
});
