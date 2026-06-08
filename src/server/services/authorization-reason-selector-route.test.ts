import { describe, expect, it } from "vitest";

import { createAuthorizationReasonSelectorRouteHandlers } from "./authorization-reason-selector-route";

const userContext = {
  userPublicId: "user_public_123",
};

function createSelectorSummary() {
  return {
    id: 1001,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    selectorStatus: "local_selector_only",
    sourceSummaryStatus: "local_view_model_only",
    selectorKey: "authorization.reason.selector.summary",
    statusSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.status",
      selectedAuthorizationPublicId: "personal_auth_public_123",
      severity: "info",
      primaryReasonCode: "selected_authorization_active",
      statusRowCount: 1,
    },
    contextSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.context",
      severity: "info",
      paperPublicId: "paper_public_123",
      mockExamPublicId: "mock_exam_public_123",
      contextCardCount: 2,
    },
    evidenceSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.evidence",
      severity: "info",
      redeemCodePublicId: "redeem_code_public_123",
      auditLogPublicId: "audit_log_public_123",
      aiCallLogPublicId: "ai_call_log_public_123",
      evidenceChipCount: 3,
    },
  };
}

function createPostRequest(body: unknown): Request {
  return new Request(
    "http://localhost/api/v1/authorizations/personal_auth_public_123/preview-reason-selector",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

describe("authorization reason selector route contract handlers", () => {
  it("returns a local API contract response for selector summary input", async () => {
    const { detail } = createAuthorizationReasonSelectorRouteHandlers(
      async () => userContext,
    );

    const response = await detail.POST(
      createPostRequest(createSelectorSummary()),
      {
        params: Promise.resolve({
          authorizationPublicId: "personal_auth_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        apiContractStatus: "local_api_contract_only",
        apiPath:
          "/api/v1/authorizations/personal_auth_public_123/preview-reason-selector",
        evidenceReferenceStatus: "redacted_reference",
        selectorSummary: {
          contextSelector: {
            paperPublicId: "paper_public_123",
            mockExamPublicId: "mock_exam_public_123",
          },
          evidenceSelector: {
            redeemCodePublicId: "redeem_code_public_123",
            auditLogPublicId: "audit_log_public_123",
            aiCallLogPublicId: "ai_call_log_public_123",
          },
        },
      },
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { detail } = createAuthorizationReasonSelectorRouteHandlers(
      async () => null,
    );

    const response = await detail.POST(
      createPostRequest(createSelectorSummary()),
      {
        params: Promise.resolve({
          authorizationPublicId: "personal_auth_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("rejects authorization public id mismatches without exposing internal id", async () => {
    const { detail } = createAuthorizationReasonSelectorRouteHandlers(
      async () => userContext,
    );

    const response = await detail.POST(
      createPostRequest(createSelectorSummary()),
      {
        params: Promise.resolve({
          authorizationPublicId: "personal_auth_public_other",
        }),
      },
    );
    const responseJson = await response.json();

    expect(responseJson).toEqual({
      code: 400040,
      message: "Invalid authorization reason selector API contract input.",
      data: null,
    });
    expect(JSON.stringify(responseJson)).not.toMatch(/"id":/);
  });
});
