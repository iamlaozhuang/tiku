import { describe, expect, it, vi } from "vitest";

import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";
import type {
  GetPersonalAiGenerationResultQuery,
  ListPersonalAiGenerationResultQuery,
  PersonalAiGenerationResultRepository,
} from "../repositories/personal-ai-generation-result-repository";
import type { PersonalAiGenerationAuthorizationOwnershipRepository } from "./personal-ai-generation-authorization-context";
import { SESSION_COOKIE_NAME } from "../auth/session-cookie";
import {
  createPersonalAiGenerationResultRouteHandlers,
  createPersonalAiGenerationResultUserResolver,
  type PersonalAiGenerationResultRouteDependencies,
} from "./personal-ai-generation-result-route";
import type { SessionService } from "./session-service";

const userContext = {
  userPublicId: "result_route_user_public_123",
  userType: "personal",
  employeePublicId: null,
  organizationPublicId: null,
} as const;

const employeeUserContext = {
  userPublicId: "employee_result_user_public_123",
  userType: "employee",
  employeePublicId: "employee_public_123",
  organizationPublicId: "organization_public_123",
} as const;

const personalAuthorizationPublicId = "personal_auth_result_public_401";
const organizationAuthorizationPublicId = "org_auth_result_public_402";

function createGetRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-results${query}`,
    {
      method: "GET",
    },
  );
}

function createDetailGetRequest(publicId: string, query = ""): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-results/${publicId}${query}`,
    {
      method: "GET",
    },
  );
}

function createResult(
  overrides: Partial<PersonalAiGenerationResultDto> &
    Record<string, unknown> = {},
): PersonalAiGenerationResultDto & Record<string, unknown> {
  return {
    resultPublicId: "personal_ai_result_public_route_401",
    taskPublicId: "ai_generation_task_public_route_401",
    requestPublicId: "personal_ai_request_public_route_401",
    taskType: "ai_question_generation",
    status: "draft",
    persistedAt: "2026-06-14T10:00:00.000Z",
    contentReference: {
      contentDigest: "sha256:content_route_401",
      contentPreviewMasked: "masked preview route 401",
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: "ai_call_log_public_route_401",
      redactionStatus: "redacted",
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
    paperAssembly: null,
    ...overrides,
  };
}

function createResultRepository(
  results: PersonalAiGenerationResultDto[] = [],
  options: {
    listError?: Error;
  } = {},
): Pick<
  PersonalAiGenerationResultRepository,
  "countDraftResults" | "listDraftResults"
> & {
  calls: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
  }>;
  detailCalls: GetPersonalAiGenerationResultQuery[];
  findDraftResultByPublicId(
    query: GetPersonalAiGenerationResultQuery,
  ): Promise<PersonalAiGenerationResultDto | null>;
} {
  const calls: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
  }> = [];
  const detailCalls: GetPersonalAiGenerationResultQuery[] = [];

  return {
    calls,
    detailCalls,
    async listDraftResults(query) {
      calls.push(query);

      if (options.listError !== undefined) {
        throw options.listError;
      }

      return results;
    },
    async countDraftResults() {
      return results.length;
    },
    async findDraftResultByPublicId(query) {
      detailCalls.push(query);

      if (options.listError !== undefined) {
        throw options.listError;
      }

      return (
        results.find(
          (result) => result.resultPublicId === query.resultPublicId,
        ) ?? null
      );
    },
  };
}

function createPersonalAuthorizationRow(
  overrides: Partial<EffectivePersonalAuthRow> = {},
): EffectivePersonalAuthRow {
  return {
    id: 401,
    public_id: personalAuthorizationPublicId,
    edition: "advanced",
    profession: "monopoly",
    level: 3,
    starts_at: new Date("2026-07-01T00:00:00.000Z"),
    expires_at: new Date("2026-08-01T00:00:00.000Z"),
    status: "active",
    ...overrides,
  };
}

function createOrganizationAuthorizationRow(
  overrides: Partial<EffectiveOrgAuthRow> = {},
): EffectiveOrgAuthRow {
  return {
    id: 402,
    public_id: organizationAuthorizationPublicId,
    organization_public_id: employeeUserContext.organizationPublicId,
    organization_name: "Synthetic organization",
    organization_status: "active",
    edition: "advanced",
    profession: "monopoly",
    level: 3,
    starts_at: new Date("2026-07-01T00:00:00.000Z"),
    expires_at: new Date("2026-08-01T00:00:00.000Z"),
    status: "active",
    ...overrides,
  };
}

function createAuthorizationRepository(input: {
  personalAuths?: EffectivePersonalAuthRow[];
  orgAuths?: EffectiveOrgAuthRow[];
}): PersonalAiGenerationAuthorizationOwnershipRepository {
  return {
    async listPersonalAuthsByUserPublicId() {
      return input.personalAuths ?? [];
    },
    async listOrgAuthsByUserPublicId() {
      return input.orgAuths ?? [];
    },
  };
}

function createTestResultRouteHandlers(
  resolveUserContext: Parameters<
    typeof createPersonalAiGenerationResultRouteHandlers
  >[0],
  dependencies: Parameters<
    typeof createPersonalAiGenerationResultRouteHandlers
  >[1] = {},
) {
  return createPersonalAiGenerationResultRouteHandlers(resolveUserContext, {
    authorizationRepository: createAuthorizationRepository({
      personalAuths: [createPersonalAuthorizationRow()],
      orgAuths: [createOrganizationAuthorizationRow()],
    }),
    ...dependencies,
  });
}

function createExactResultRepository(input: {
  results?: Array<{
    authorizationPublicId: string;
    result: PersonalAiGenerationResultDto;
  }>;
}) {
  const listCalls: ListPersonalAiGenerationResultQuery[] = [];
  const detailCalls: GetPersonalAiGenerationResultQuery[] = [];
  const results = input.results ?? [];

  return {
    listCalls,
    detailCalls,
    async listDraftResults(query: ListPersonalAiGenerationResultQuery) {
      listCalls.push(query);
      return results
        .filter(
          (entry) =>
            entry.authorizationPublicId === query.authorizationPublicId,
        )
        .map((entry) => entry.result);
    },
    async countDraftResults(query: ListPersonalAiGenerationResultQuery) {
      return results.filter(
        (entry) => entry.authorizationPublicId === query.authorizationPublicId,
      ).length;
    },
    async findDraftResultByPublicId(query: GetPersonalAiGenerationResultQuery) {
      detailCalls.push(query);
      return (
        results.find(
          (entry) =>
            entry.authorizationPublicId === query.authorizationPublicId &&
            entry.result.resultPublicId === query.resultPublicId,
        )?.result ?? null
      );
    },
  };
}

function createExpectedPrivateUseBoundary() {
  return {
    generatedResultScope: "learner_private",
    resultHistoryStatus: "available",
    privatePracticeAttemptSourceStatus:
      "allowed_as_private_practice_attempt_source",
    privatePaperAttemptSourceStatus: "allowed_as_private_paper_attempt_source",
    organizationPrivateAdoptionStatus:
      "blocked_without_organization_admin_task",
    platformFormalDraftStatus: "blocked_requires_content_admin_review",
    publishStatus: "blocked_requires_fresh_publish_task",
    studentVisibleStatus: "blocked",
    redactionStatus: "redacted",
  };
}

function getResultHistoryRouteHandler(collection: unknown) {
  const getHandler = (
    collection as {
      GET?: (request: Request) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (request: Request) => Promise<Response>;
}

function getResultDetailRouteHandler(detail: unknown) {
  const getHandler = (
    detail as {
      GET?: (
        request: Request,
        context: { params: Promise<{ publicId: string }> },
      ) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ) => Promise<Response>;
}

describe("personal AI generation result route handlers", () => {
  it.each(["", "   "])(
    "rejects missing or empty selected authorization %j before result history access",
    async (authorizationPublicId) => {
      const resultRepository = createExactResultRepository({});
      const { collection } = createPersonalAiGenerationResultRouteHandlers(
        async () => employeeUserContext,
        {
          resultRepository,
          authorizationRepository: createAuthorizationRepository({
            personalAuths: [createPersonalAuthorizationRow()],
          }),
        },
      );
      const query =
        authorizationPublicId.length === 0
          ? ""
          : `?authorizationPublicId=${encodeURIComponent(authorizationPublicId)}`;

      const response = await getResultHistoryRouteHandler(collection)(
        createGetRequest(query),
      );

      await expect(response.json()).resolves.toEqual({
        code: 400044,
        message: "Invalid personal AI generation result history input.",
        data: null,
      });
      expect(resultRepository.listCalls).toEqual([]);
    },
  );

  it("fails closed when the canonical result handler lacks raw ownership dependencies", async () => {
    const resultRepository = createExactResultRepository({});
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => employeeUserContext,
      { resultRepository },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        "?authorizationPublicId=personal_auth_result_public_401",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(resultRepository.listCalls).toEqual([]);
  });

  it("fails closed when the canonical result detail handler lacks exact lookup", async () => {
    const listDraftResults = vi.fn(async () => []);
    const { detail } = createPersonalAiGenerationResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository: {
          listDraftResults,
        } as unknown as PersonalAiGenerationResultRouteDependencies["resultRepository"],
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuthorizationRow()],
        }),
      },
    );

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_route_detail",
        `?authorizationPublicId=${personalAuthorizationPublicId}`,
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_detail",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(listDraftResults).not.toHaveBeenCalled();
  });

  it.each(["", "   "])(
    "rejects missing or empty selected authorization %j before result detail access",
    async (authorizationPublicId) => {
      const resultRepository = createExactResultRepository({});
      const { detail } = createPersonalAiGenerationResultRouteHandlers(
        async () => employeeUserContext,
        {
          resultRepository,
          authorizationRepository: createAuthorizationRepository({
            personalAuths: [createPersonalAuthorizationRow()],
          }),
        },
      );
      const query =
        authorizationPublicId.length === 0
          ? ""
          : `?authorizationPublicId=${encodeURIComponent(authorizationPublicId)}`;

      const response = await getResultDetailRouteHandler(detail)(
        createDetailGetRequest("personal_ai_result_public_route_detail", query),
        {
          params: Promise.resolve({
            publicId: "personal_ai_result_public_route_detail",
          }),
        },
      );

      await expect(response.json()).resolves.toEqual({
        code: 400045,
        message: "Invalid personal AI generation result detail input.",
        data: null,
      });
      expect(resultRepository.listCalls).toEqual([]);
      expect(resultRepository.detailCalls).toEqual([]);
    },
  );

  it("rejects a foreign selected authorization before result detail access", async () => {
    const resultRepository = createExactResultRepository({});
    const { detail } = createPersonalAiGenerationResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuthorizationRow()],
          orgAuths: [createOrganizationAuthorizationRow()],
        }),
      },
    );

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_route_detail",
        "?authorizationPublicId=foreign_auth_public_999",
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_detail",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(resultRepository.listCalls).toEqual([]);
    expect(resultRepository.detailCalls).toEqual([]);
  });

  it.each([
    {
      name: "employee personal",
      authorizationPublicId: "personal_auth_result_public_401",
      expectedOwnerType: "personal",
      expectedOwnerPublicId: employeeUserContext.userPublicId,
    },
    {
      name: "employee organization",
      authorizationPublicId: "org_auth_result_public_402",
      expectedOwnerType: "organization",
      expectedOwnerPublicId: employeeUserContext.organizationPublicId,
    },
  ])(
    "derives $name history owner from the exact raw authorization",
    async ({
      authorizationPublicId,
      expectedOwnerType,
      expectedOwnerPublicId,
    }) => {
      const resultRepository = createExactResultRepository({});
      const { collection } = createPersonalAiGenerationResultRouteHandlers(
        async () => employeeUserContext,
        {
          resultRepository,
          authorizationRepository: createAuthorizationRepository({
            personalAuths: [createPersonalAuthorizationRow()],
            orgAuths: [createOrganizationAuthorizationRow()],
          }),
        },
      );

      const response = await getResultHistoryRouteHandler(collection)(
        createGetRequest(
          `?authorizationPublicId=${encodeURIComponent(authorizationPublicId)}`,
        ),
      );

      expect((await response.json()).code).toBe(0);
      expect(resultRepository.listCalls).toEqual([
        expect.objectContaining({
          authorizationPublicId,
          ownerType: expectedOwnerType,
          ownerPublicId: expectedOwnerPublicId,
          actorPublicId: employeeUserContext.userPublicId,
        }),
      ]);
    },
  );

  it("rejects a foreign selected authorization before result history access", async () => {
    const resultRepository = createExactResultRepository({});
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [createPersonalAuthorizationRow()],
          orgAuths: [createOrganizationAuthorizationRow()],
        }),
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest("?authorizationPublicId=foreign_auth_public_999"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(resultRepository.listCalls).toEqual([]);
  });

  it("returns 404 for a detail owned under another authorization without loading history", async () => {
    const result = createResult({
      resultPublicId: "personal_ai_result_other_authorization",
    });
    const selectedAuthorizationPublicId =
      "personal_auth_result_public_selected";
    const resultRepository = createExactResultRepository({
      results: [
        {
          authorizationPublicId: "personal_auth_result_public_other",
          result,
        },
      ],
    });
    const { detail } = createPersonalAiGenerationResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository,
        authorizationRepository: createAuthorizationRepository({
          personalAuths: [
            createPersonalAuthorizationRow({
              public_id: selectedAuthorizationPublicId,
            }),
            createPersonalAuthorizationRow({
              id: 403,
              public_id: "personal_auth_result_public_other",
            }),
          ],
        }),
      },
    );

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        result.resultPublicId,
        `?authorizationPublicId=${selectedAuthorizationPublicId}`,
      ),
      {
        params: Promise.resolve({ publicId: result.resultPublicId }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 404045,
      message: "Personal AI generation result detail was not found.",
      data: null,
    });
    expect(resultRepository.listCalls).toEqual([]);
    expect(resultRepository.detailCalls).toEqual([
      {
        authorizationPublicId: selectedAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: employeeUserContext.userPublicId,
        actorPublicId: employeeUserContext.userPublicId,
        resultPublicId: result.resultPublicId,
      },
    ]);
  });

  it("resolves personal user public id from the local session runtime", async () => {
    const observedAuthorizationValues: Array<string | null | undefined> = [];
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession(input) {
        observedAuthorizationValues.push(input.authorization);

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "session_result_user_public_123",
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
      createPersonalAiGenerationResultUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-results", {
        headers: {
          authorization: "Bearer synthetic-local-session-token",
        },
      }),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "session_result_user_public_123",
      userType: "personal",
      employeePublicId: null,
      organizationPublicId: null,
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-local-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-local-session-token",
    );
  });

  it("resolves employee user public id from the local session runtime", async () => {
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession() {
        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "employee_result_user_public_123",
              phone: "13900000000",
              name: "企业员工",
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: "employee_public_123",
              organizationPublicId: "organization_public_123",
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
      createPersonalAiGenerationResultUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-results"),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "employee_result_user_public_123",
      userType: "employee",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
  });

  it("resolves cookie-backed employee sessions with organization context", async () => {
    const observedAuthorizationValues: Array<string | null | undefined> = [];
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession(input) {
        observedAuthorizationValues.push(input.authorization);

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "cookie_employee_result_user_public_123",
              phone: "13900000000",
              name: "cookie employee",
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: "employee_public_123",
              organizationPublicId: "organization_public_123",
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
      createPersonalAiGenerationResultUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-results", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=synthetic-cookie-session-token`,
        },
      }),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "cookie_employee_result_user_public_123",
      userType: "employee",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-cookie-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-cookie-session-token",
    );
  });

  it("rejects non-personal sessions from the personal result history path", async () => {
    const { collection } = createTestResultRouteHandlers(async () => null);

    const response =
      await getResultHistoryRouteHandler(collection)(createGetRequest());

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns session-owned redacted result history and ignores stale query ownership", async () => {
    const staleQueryUserPublicId = "query_stale_result_user_public_999";
    const omittedText = ["OMITTED", "RESULT", "TEXT"].join("-");
    const resultRepository = createResultRepository([
      createResult({
        omittedFixture: omittedText,
      }),
    ]);
    const { collection } = createTestResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?authorizationPublicId=${personalAuthorizationPublicId}&userPublicId=${staleQueryUserPublicId}&id=701&limit=5`,
      ),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        formalAdoptionWriteStatus: "blocked_without_follow_up_task",
        privateUseBoundary: createExpectedPrivateUseBoundary(),
        results: [
          {
            resultPublicId: "personal_ai_result_public_route_401",
            taskPublicId: "ai_generation_task_public_route_401",
            requestPublicId: "personal_ai_request_public_route_401",
            taskType: "ai_question_generation",
            status: "draft",
            persistedAt: "2026-06-14T10:00:00.000Z",
            contentReference: {
              contentDigest: "sha256:content_route_401",
              contentPreviewMasked: "masked preview route 401",
              contentVisibility: "redacted_snapshot",
              redactionStatus: "redacted",
            },
            evidenceReference: {
              evidenceStatus: "sufficient",
              citationCount: 2,
              aiCallLogPublicId: "ai_call_log_public_route_401",
              redactionStatus: "redacted",
            },
            formalAdoption: {
              isBlocked: true,
              status: "blocked",
            },
            paperAssembly: null,
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 5,
        total: 1,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });
    expect(resultRepository.calls).toEqual([
      {
        authorizationPublicId: personalAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        actorPublicId: userContext.userPublicId,
        taskType: undefined,
        page: undefined,
        pageSize: undefined,
        limit: 5,
        offset: 0,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain(omittedText);
  });

  it("queries employee result history with the organization owner scope", async () => {
    const staleQueryUserPublicId = "query_stale_employee_result_public_999";
    const resultRepository = createResultRepository();
    const { collection } = createTestResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?authorizationPublicId=${organizationAuthorizationPublicId}&userPublicId=${staleQueryUserPublicId}&taskType=ai_paper_generation&page=2&pageSize=5`,
      ),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });
    expect(resultRepository.calls).toEqual([
      {
        authorizationPublicId: organizationAuthorizationPublicId,
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        actorPublicId: employeeUserContext.userPublicId,
        taskType: "ai_paper_generation",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
  });

  it("passes task type and pagination query to personal result history repository", async () => {
    const resultRepository = createResultRepository([]);
    const { collection } = createTestResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?authorizationPublicId=${personalAuthorizationPublicId}&taskType=ai_paper_generation&page=2&pageSize=5`,
      ),
    );
    const payload = await response.json();

    expect(resultRepository.calls).toEqual([
      {
        authorizationPublicId: personalAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        actorPublicId: userContext.userPublicId,
        taskType: "ai_paper_generation",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });
  });

  it("rejects invalid limit input before touching the repository", async () => {
    const resultRepository = createResultRepository();
    const { collection } = createTestResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?authorizationPublicId=${personalAuthorizationPublicId}&limit=invalid`,
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400044,
      message: "Invalid personal AI generation result history input.",
      data: null,
    });
    expect(resultRepository.calls).toEqual([]);
  });

  it("returns a standard error envelope when persistent result history lookup fails", async () => {
    const resultRepository = createResultRepository([], {
      listError: new Error("database stack with internal connection details"),
    });
    const { collection } = createTestResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?authorizationPublicId=${personalAuthorizationPublicId}`,
      ),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 500019,
      message:
        "Personal AI generation result history is temporarily unavailable.",
      data: null,
    });
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("internal connection details");
  });

  it("returns session-owned redacted result detail and ignores stale query ownership", async () => {
    const staleQueryUserPublicId = "query_stale_detail_user_public_999";
    const omittedGeneratedText = ["OMITTED", "DETAIL", "TEXT"].join("-");
    const generatedContentKey = ["generated", "Content"].join("");
    const resultRepository = createResultRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_route_other",
      }),
      createResult({
        resultPublicId: "personal_ai_result_public_route_detail",
        [generatedContentKey]: omittedGeneratedText,
      }),
    ]);
    const { detail } = createTestResultRouteHandlers(async () => userContext, {
      resultRepository,
    });

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_route_detail",
        `?authorizationPublicId=${personalAuthorizationPublicId}&userPublicId=${staleQueryUserPublicId}&id=701`,
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_detail",
        }),
      },
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        formalAdoptionWriteStatus: "blocked_without_follow_up_task",
        privateUseBoundary: createExpectedPrivateUseBoundary(),
        result: {
          resultPublicId: "personal_ai_result_public_route_detail",
          taskPublicId: "ai_generation_task_public_route_401",
          requestPublicId: "personal_ai_request_public_route_401",
          taskType: "ai_question_generation",
          status: "draft",
          persistedAt: "2026-06-14T10:00:00.000Z",
          contentReference: {
            contentDigest: "sha256:content_route_401",
            contentPreviewMasked: "masked preview route 401",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
          },
          evidenceReference: {
            evidenceStatus: "sufficient",
            citationCount: 2,
            aiCallLogPublicId: "ai_call_log_public_route_401",
            redactionStatus: "redacted",
          },
          formalAdoption: {
            isBlocked: true,
            status: "blocked",
          },
          paperAssembly: null,
        },
      },
    });
    expect(resultRepository.detailCalls).toEqual([
      {
        authorizationPublicId: personalAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        actorPublicId: userContext.userPublicId,
        resultPublicId: "personal_ai_result_public_route_detail",
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain(generatedContentKey);
    expect(serializedPayload).not.toContain(omittedGeneratedText);
  });

  it("queries employee result detail with the organization owner scope", async () => {
    const resultRepository = createResultRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_employee_detail",
      }),
    ]);
    const { detail } = createTestResultRouteHandlers(
      async () => employeeUserContext,
      {
        resultRepository,
      },
    );

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_employee_detail",
        `?authorizationPublicId=${organizationAuthorizationPublicId}`,
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_employee_detail",
        }),
      },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        result: {
          resultPublicId: "personal_ai_result_public_employee_detail",
        },
      },
    });
    expect(resultRepository.detailCalls).toEqual([
      {
        authorizationPublicId: organizationAuthorizationPublicId,
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        actorPublicId: employeeUserContext.userPublicId,
        resultPublicId: "personal_ai_result_public_employee_detail",
      },
    ]);
  });

  it("rejects non-personal sessions from the personal result detail path", async () => {
    const { detail } = createTestResultRouteHandlers(async () => null);

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest("personal_ai_result_public_route_detail"),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_detail",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns not found for missing session-owned result detail", async () => {
    const resultRepository = createResultRepository([
      createResult({
        resultPublicId: "personal_ai_result_public_route_other",
      }),
    ]);
    const { detail } = createTestResultRouteHandlers(async () => userContext, {
      resultRepository,
    });

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_route_missing",
        `?authorizationPublicId=${personalAuthorizationPublicId}`,
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_missing",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 404045,
      message: "Personal AI generation result detail was not found.",
      data: null,
    });
    expect(resultRepository.detailCalls).toEqual([
      {
        authorizationPublicId: personalAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        actorPublicId: userContext.userPublicId,
        resultPublicId: "personal_ai_result_public_route_missing",
      },
    ]);
  });

  it("returns a standard error envelope when persistent result detail lookup fails", async () => {
    const resultRepository = createResultRepository([], {
      listError: new Error("database stack with private detail rows"),
    });
    const { detail } = createTestResultRouteHandlers(async () => userContext, {
      resultRepository,
    });

    const response = await getResultDetailRouteHandler(detail)(
      createDetailGetRequest(
        "personal_ai_result_public_route_detail",
        `?authorizationPublicId=${personalAuthorizationPublicId}`,
      ),
      {
        params: Promise.resolve({
          publicId: "personal_ai_result_public_route_detail",
        }),
      },
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 500020,
      message:
        "Personal AI generation result detail is temporarily unavailable.",
      data: null,
    });
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("private detail rows");
  });
});
