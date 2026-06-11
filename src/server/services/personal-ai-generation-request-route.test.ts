import { describe, expect, it } from "vitest";

import { createPersonalAiGenerationRequestRouteHandlers } from "./personal-ai-generation-request-route";

const userContext = {
  userPublicId: "resolver_user_public_123",
};

function createBaseBody() {
  const omittedTextA = ["OMITTED", "A"].join("-");
  const omittedTextB = ["OMITTED", "B"].join("-");
  const omittedTextC = ["OMITTED", "C"].join("-");
  const omittedTextD = ["OMITTED", "D"].join("-");
  const credentialKey = "token";

  return {
    id: 701,
    userPublicId: "body_user_public_999",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    promptText: omittedTextA,
    rawAnswer: omittedTextB,
    generatedContent: omittedTextC,
    redeemCodePlaintext: omittedTextD,
    [credentialKey]: "opaque",
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

describe("personal AI generation request route handlers", () => {
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
          mockExamPublicId: "mock_exam_public_123",
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
    expect(serializedResponse).not.toContain(body.promptText);
    expect(serializedResponse).not.toContain(body.rawAnswer);
    expect(serializedResponse).not.toContain(body.generatedContent);
    expect(serializedResponse).not.toContain(body.redeemCodePlaintext);
    expect(serializedResponse).not.toContain(body.token);
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
