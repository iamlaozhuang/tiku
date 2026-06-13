import { describe, expect, it } from "vitest";

import {
  createPersonalAiGenerationRequestRouteHandlers,
  createPersonalAiGenerationRequestUserResolver,
} from "./personal-ai-generation-request-route";
import type {
  CreatePersonalAiGenerationRequestInput,
  PersonalAiGenerationRequestPersistenceResult,
  PersonalAiGenerationRequestRepository,
} from "../repositories/personal-ai-generation-request-repository";
import type { SessionService } from "./session-service";

const userContext = {
  userPublicId: "resolver_user_public_123",
};

function createBaseBody() {
  const omittedTextA = ["OMITTED", "A"].join("-");
  const omittedTextB = ["OMITTED", "B"].join("-");
  const omittedTextC = ["OMITTED", "C"].join("-");
  const omittedTextD = ["OMITTED", "D"].join("-");
  const omittedTextE = ["OMITTED", "E"].join("-");

  return {
    id: 701,
    userPublicId: "body_user_public_999",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    omittedFixtureOne: omittedTextA,
    omittedFixtureTwo: omittedTextB,
    omittedFixtureThree: omittedTextC,
    omittedFixtureFour: omittedTextD,
    omittedFixtureFive: omittedTextE,
  };
}

function createBaseFlowBody() {
  return {
    ...createBaseBody(),
    responseMode: "local_browser_experience",
    requestPublicId: "personal_ai_request_public_route_123",
    taskPublicId: "ai_generation_task_public_route_123",
    taskType: "ai_question_generation",
    actorPublicId: userContext.userPublicId,
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: userContext.userPublicId,
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: userContext.userPublicId,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_route_123",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request(
    "http://localhost/api/v1/personal-ai-generation-requests",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

function createGetRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-requests${query}`,
    {
      method: "GET",
    },
  );
}

function getPersonalAiGenerationRequestHistoryRouteHandler(
  collection: unknown,
) {
  const getHandler = (
    collection as {
      GET?: (request: Request) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (request: Request) => Promise<Response>;
}

function createRequestRepository(
  historyRows: Awaited<
    ReturnType<PersonalAiGenerationRequestRepository["listRequestHistory"]>
  > = [],
  options: {
    createError?: Error;
    createResult?: PersonalAiGenerationRequestPersistenceResult;
  } = {},
): Pick<
  PersonalAiGenerationRequestRepository,
  "createOrReuseRequest" | "listRequestHistory"
> & {
  calls: Array<{ ownerPublicId: string; limit?: number }>;
  createCalls: CreatePersonalAiGenerationRequestInput[];
} {
  const calls: Array<{ ownerPublicId: string; limit?: number }> = [];
  const createCalls: CreatePersonalAiGenerationRequestInput[] = [];

  return {
    calls,
    createCalls,
    async listRequestHistory(query) {
      calls.push(query);

      return historyRows;
    },
    async createOrReuseRequest(input) {
      createCalls.push(input);

      if (options.createError !== undefined) {
        throw options.createError;
      }

      return (
        options.createResult ?? {
          persistenceStatus: "created",
          historyItem: {
            requestPublicId: input.requestPublicId,
            taskPublicId: input.taskPublicId,
            status: "pending",
            requestedAt: input.requestedAt.toISOString(),
            resultPublicId: input.resultPublicId ?? null,
            evidenceStatus: input.evidenceStatus ?? "none",
            citationCount: input.citationCount ?? 0,
            aiCallLogPublicId: input.aiCallLogPublicId ?? null,
            redactionStatus: "redacted",
          },
        }
      );
    },
  };
}

describe("personal AI generation request route handlers", () => {
  it("resolves user public id from the local session runtime without exposing session material", async () => {
    const observedAuthorizationValues: Array<string | null | undefined> = [];
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession(input) {
        observedAuthorizationValues.push(input.authorization);

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "session_user_public_123",
              phone: "13800000000",
              name: "本地学员",
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
      },
    };
    const resolveUserContext =
      createPersonalAiGenerationRequestUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-requests", {
        headers: {
          authorization: "Bearer synthetic-local-session-token",
        },
      }),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "session_user_public_123",
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-local-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-local-session-token",
    );
  });

  it("merges resolver user context and returns a redacted local request contract", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(createPostRequest(createBaseBody()));

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "resolver_user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        generationContext: {
          questionPublicId: "question_public_123",
          answerRecordPublicId: "answer_record_public_123",
          paperPublicId: "paper_public_123",
          mockExamPublicId: null,
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper_public_123",
          },
        },
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
  });

  it("returns the standard unauthorized response when user context is missing", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => null,
    );

    const response = await collection.POST(createPostRequest(createBaseBody()));

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns the standard unauthorized response when request history user context is missing", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => null,
    );

    const response =
      await getPersonalAiGenerationRequestHistoryRouteHandler(collection)(
        createGetRequest(),
      );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns a session-owned empty request history list without echoing query user ids", async () => {
    const staleQueryUserPublicId = "query_stale_user_public_999";
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(createGetRequest(`?userPublicId=${staleQueryUserPublicId}&id=701`));
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: [],
    });
    expect(requestRepository.calls).toEqual([
      {
        ownerPublicId: userContext.userPublicId,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns persisted redacted request history rows from the repository", async () => {
    const requestRepository = createRequestRepository([
      {
        requestPublicId: "personal_ai_request_public_route_301",
        taskPublicId: "ai_generation_task_public_route_301",
        status: "succeeded",
        requestedAt: "2026-06-12T16:30:00.000Z",
        resultPublicId: "ai_generation_result_public_route_301",
        evidenceStatus: "sufficient",
        citationCount: 2,
        aiCallLogPublicId: "ai_call_log_public_route_301",
        redactionStatus: "redacted",
      },
    ]);
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(createGetRequest("?userPublicId=stale_client_user&id=701"));
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          requestPublicId: "personal_ai_request_public_route_301",
          taskPublicId: "ai_generation_task_public_route_301",
          status: "succeeded",
          requestedAt: "2026-06-12T16:30:00.000Z",
          resultPublicId: "ai_generation_result_public_route_301",
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_route_301",
          redactionStatus: "redacted",
        },
      ],
    });
    expect(requestRepository.calls).toEqual([
      {
        ownerPublicId: userContext.userPublicId,
      },
    ]);
    expect(serializedPayload).not.toContain("stale_client_user");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("generated content");
  });

  it("returns a standard error envelope when persistent history lookup fails", async () => {
    const requestRepository: Pick<
      PersonalAiGenerationRequestRepository,
      "listRequestHistory"
    > = {
      async listRequestHistory() {
        throw new Error("database stack with internal connection details");
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response =
      await getPersonalAiGenerationRequestHistoryRouteHandler(collection)(
        createGetRequest(),
      );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 500017,
      message: "Personal AI request history is temporarily unavailable.",
      data: null,
    });
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("internal connection details");
  });

  it("returns the local browser experience contract when requested", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );

    await expect(response.json()).resolves.toMatchObject({
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
            contextPublicId: "paper_public_123",
          },
          action: {
            actionType: "submit_personal_ai_generation_request",
            isEnabled: true,
            disabledReason: null,
          },
        },
        resultState: {
          status: "pending",
          taskPublicId: "ai_generation_task_public_route_123",
          resultPublicId: null,
          contentVisibility: "summary_only",
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
        requestFlow: {
          request: {
            userPublicId: "resolver_user_public_123",
          },
        },
      },
    });
  });

  it("persists local browser POST metadata with session-normalized ownership public ids", async () => {
    const staleBodyPublicId = "body_stale_owner_public_999";
    const requestedAt = new Date("2026-06-12T18:00:00.000Z");
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
        now: () => requestedAt,
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        actorPublicId: staleBodyPublicId,
        ownerPublicId: staleBodyPublicId,
        quotaOwnerPublicId: staleBodyPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          taskRequest: {
            actorPublicId: userContext.userPublicId,
            ownerPublicId: userContext.userPublicId,
            quotaOwnerPublicId: userContext.userPublicId,
          },
        },
      },
    });
    expect(requestRepository.createCalls).toEqual([
      {
        requestPublicId: "personal_ai_request_public_route_123",
        taskPublicId: "ai_generation_task_public_route_123",
        taskType: "ai_question_generation",
        aiFuncType: "explanation",
        authorizationPublicId: "personal_auth_public_123",
        actorPublicId: userContext.userPublicId,
        ownerPublicId: userContext.userPublicId,
        organizationPublicId: null,
        quotaOwnerPublicId: userContext.userPublicId,
        effectiveEdition: "advanced",
        questionPublicId: "question_public_123",
        answerRecordPublicId: "answer_record_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: null,
        idempotencyKeyHash: "sha256:personal_generation_route_123",
        requestedAt,
        resultPublicId: null,
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: null,
        isAuthorizationActive: true,
        isScopeAllowed: true,
        isQuotaAvailable: true,
        isRuntimeConfigReady: true,
      },
    ]);
    expect(serializedPayload).not.toContain(staleBodyPublicId);
  });

  it("uses server-owned pending metadata instead of client-supplied result and evidence references", async () => {
    const staleClientResultPublicId = "client_result_public_stale_route";
    const staleClientAiCallLogPublicId =
      "client_ai_call_log_public_stale_route";
    const staleClientAuditLogPublicId = "client_audit_log_public_stale_route";
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        resultPublicId: staleClientResultPublicId,
        evidenceStatus: "sufficient",
        citationCount: 9,
        aiCallLogPublicId: staleClientAiCallLogPublicId,
        auditLogPublicId: staleClientAuditLogPublicId,
        isAuthorizationActive: false,
        isScopeAllowed: false,
        isQuotaAvailable: false,
        isRuntimeConfigReady: false,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          request: {
            evidenceReferences: {
              auditLogPublicId: null,
              aiCallLogPublicId: null,
            },
          },
          taskRequest: {
            decision: "create_pending_task",
            resultReference: {
              resultPublicId: null,
              evidenceStatus: "none",
              citationCount: 0,
            },
            evidenceReferences: {
              auditLogPublicId: null,
              aiCallLogPublicId: null,
            },
          },
        },
        resultState: {
          status: "pending",
          resultPublicId: null,
          evidenceStatus: "none",
          citationCount: 0,
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(requestRepository.createCalls[0]).toMatchObject({
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
    });
    expect(serializedPayload).not.toContain(staleClientResultPublicId);
    expect(serializedPayload).not.toContain(staleClientAiCallLogPublicId);
    expect(serializedPayload).not.toContain(staleClientAuditLogPublicId);
  });

  it("uses reused persistent task metadata for idempotent local browser POST responses", async () => {
    const requestRepository = createRequestRepository([], {
      createResult: {
        persistenceStatus: "reused",
        historyItem: {
          requestPublicId: "personal_ai_request_public_existing_route",
          taskPublicId: "ai_generation_task_public_existing_route",
          status: "running",
          requestedAt: "2026-06-12T17:00:00.000Z",
          resultPublicId: "ai_generation_result_public_existing_route",
          evidenceStatus: "weak",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_existing_route",
          redactionStatus: "redacted",
        },
      },
    });
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "reused",
        resultState: {
          status: "running",
          taskPublicId: "ai_generation_task_public_existing_route",
          resultPublicId: "ai_generation_result_public_existing_route",
          evidenceStatus: "weak",
          citationCount: 2,
        },
        requestFlow: {
          taskRequest: {
            decision: "reuse_existing_task",
            idempotency: {
              keyHash: "sha256:personal_generation_route_123",
              reuseTaskPublicId: "ai_generation_task_public_existing_route",
            },
          },
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("generated content");
  });

  it("keeps local browser POST responses redacted when persistence is temporarily unavailable", async () => {
    const requestRepository = createRequestRepository([], {
      createError: new Error("database stack with internal connection details"),
    });
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        resultState: {
          status: "pending",
          taskPublicId: "ai_generation_task_public_route_123",
          resultPublicId: null,
          evidenceStatus: "none",
          citationCount: 0,
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("internal connection details");
  });

  it("normalizes request ownership public ids from the resolver user context", async () => {
    const staleBodyPublicId = "body_stale_owner_public_999";
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        actorPublicId: staleBodyPublicId,
        ownerPublicId: staleBodyPublicId,
        quotaOwnerPublicId: staleBodyPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        requestFlow: {
          request: {
            userPublicId: userContext.userPublicId,
          },
          taskRequest: {
            actorPublicId: userContext.userPublicId,
            ownerPublicId: userContext.userPublicId,
            quotaOwnerPublicId: userContext.userPublicId,
          },
        },
      },
    });
    expect(serializedPayload).not.toContain(staleBodyPublicId);
  });

  it("does not expose body user id or sensitive request payload fields", async () => {
    const body = createBaseBody();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(createPostRequest(body));
    const serializedResponse = JSON.stringify(await response.json());

    expect(serializedResponse).toContain("resolver_user_public_123");
    expect(serializedResponse).not.toContain("body_user_public_999");
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain(body.omittedFixtureOne);
    expect(serializedResponse).not.toContain(body.omittedFixtureTwo);
    expect(serializedResponse).not.toContain(body.omittedFixtureThree);
    expect(serializedResponse).not.toContain(body.omittedFixtureFour);
    expect(serializedResponse).not.toContain(body.omittedFixtureFive);
  });

  it("returns the generation-only validation error for ai_scoring", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseBody(),
        aiFuncType: "scoring",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400011,
      message: "Invalid personal AI generation request input.",
      data: null,
    });
  });
});
