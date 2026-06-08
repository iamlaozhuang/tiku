import { describe, expect, it } from "vitest";

import { buildAuthorizationContextReadModel } from "./authorization-context-service";

const startsAt = "2026-06-01T00:00:00.000Z";
const expiresAt = "2026-12-01T00:00:00.000Z";

function createBaseInput() {
  const redeemCodeSecret = ["SHOULD", "NOT", "LEAK"].join("-");

  return {
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        id: 101,
        authorizationType: "personal_auth",
        publicId: "personal_auth_public_123",
        profession: "monopoly",
        level: 3,
        startsAt,
        expiresAt,
        status: "active",
        redeemCodePublicId: "redeem_code_public_123",
        redeemCodeSecret,
      },
    ],
    scope: {
      paperPublicId: "paper_public_123",
      paperTitle: "Full paper title must stay outside context.",
      paperContent: "Full paper content must not be returned.",
      mockExamPublicId: "mock_exam_public_123",
      mockExamName: "Mock exam name must stay outside context.",
    },
    evidenceReferences: {
      auditLogPublicId: "audit_log_public_123",
      auditLogPayload: "audit payload must not be returned",
      aiCallLogPublicId: "ai_call_log_public_123",
      aiCallLogPayload: "ai call payload must not be returned",
    },
  };
}

describe("authorization context service", () => {
  it("builds a personal_auth read model without exposing internal ids or redeem_code plaintext", () => {
    const input = createBaseInput();
    const result = buildAuthorizationContextReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorization: {
          publicId: "personal_auth_public_123",
          authorizationType: "personal_auth",
          profession: "monopoly",
          level: 3,
          startsAt,
          expiresAt,
          status: "active",
          organizationPublicId: null,
        },
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
        },
        contextScope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(
      input.authorizationSources[0].redeemCodeSecret,
    );
  });

  it("builds an org_auth read model with organization scope only", () => {
    const result = buildAuthorizationContextReadModel({
      userPublicId: "employee_public_123",
      authorizationSources: [
        {
          id: 202,
          authorizationType: "org_auth",
          publicId: "org_auth_public_123",
          organizationPublicId: "org_public_123",
          profession: "logistics",
          level: 4,
          startsAt,
          expiresAt,
          status: "active",
        },
      ],
      scope: {
        paperPublicId: null,
        mockExamPublicId: "mock_exam_public_456",
      },
      evidenceReferences: {
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      },
    });

    expect(result).toMatchObject({
      code: 0,
      data: {
        userPublicId: "employee_public_123",
        authorization: {
          publicId: "org_auth_public_123",
          authorizationType: "org_auth",
          organizationPublicId: "org_public_123",
        },
        redeemCodeReference: {
          publicId: null,
          redactionStatus: "redacted",
        },
        contextScope: {
          paperPublicId: null,
          mockExamPublicId: "mock_exam_public_456",
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });

  it("returns a failure result when authorization is missing", () => {
    expect(
      buildAuthorizationContextReadModel({
        userPublicId: "user_public_123",
        authorizationSources: [],
        scope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
        },
      }),
    ).toEqual({
      code: 404004,
      message:
        "Authorization context does not include an active authorization.",
      data: null,
    });
  });

  it("keeps paper, mock_exam, audit_log, and ai_call_log as redacted references", () => {
    const input = createBaseInput();
    const result = buildAuthorizationContextReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(serializedResult).toContain("paper_public_123");
    expect(serializedResult).toContain("mock_exam_public_123");
    expect(serializedResult).toContain("audit_log_public_123");
    expect(serializedResult).toContain("ai_call_log_public_123");
    expect(serializedResult).not.toContain(input.scope.paperTitle);
    expect(serializedResult).not.toContain(input.scope.paperContent);
    expect(serializedResult).not.toContain(input.scope.mockExamName);
    expect(serializedResult).not.toContain(
      input.evidenceReferences.auditLogPayload,
    );
    expect(serializedResult).not.toContain(
      input.evidenceReferences.aiCallLogPayload,
    );
  });
});
