import { describe, expect, it } from "vitest";

import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import {
  createPersonalAiGenerationResultRouteHandlers,
  createPersonalAiGenerationResultUserResolver,
} from "./personal-ai-generation-result-route";
import type { SessionService } from "./session-service";

const userContext = {
  userPublicId: "result_route_user_public_123",
};

function createGetRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-results${query}`,
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
    ...overrides,
  };
}

function createResultRepository(
  results: PersonalAiGenerationResultDto[] = [],
  options: {
    listError?: Error;
  } = {},
): Pick<PersonalAiGenerationResultRepository, "listDraftResults"> & {
  calls: Array<{ ownerPublicId: string; limit?: number }>;
} {
  const calls: Array<{ ownerPublicId: string; limit?: number }> = [];

  return {
    calls,
    async listDraftResults(query) {
      calls.push(query);

      if (options.listError !== undefined) {
        throw options.listError;
      }

      return results;
    },
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

describe("personal AI generation result route handlers", () => {
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
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-local-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-local-session-token",
    );
  });

  it("rejects non-personal sessions from the personal result history path", async () => {
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => null,
    );

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
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest(
        `?userPublicId=${staleQueryUserPublicId}&id=701&limit=5`,
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
          },
        ],
      },
    });
    expect(resultRepository.calls).toEqual([
      {
        ownerPublicId: userContext.userPublicId,
        limit: 5,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain(omittedText);
  });

  it("rejects invalid limit input before touching the repository", async () => {
    const resultRepository = createResultRepository();
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response = await getResultHistoryRouteHandler(collection)(
      createGetRequest("?limit=invalid"),
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
    const { collection } = createPersonalAiGenerationResultRouteHandlers(
      async () => userContext,
      {
        resultRepository,
      },
    );

    const response =
      await getResultHistoryRouteHandler(collection)(createGetRequest());
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
});
