import { describe, expect, it } from "vitest";

import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract-route";
import type { AdminRole } from "../models/auth";
import type { SessionService } from "./session-service";

function createAdminSessionService(input: {
  adminPublicId?: string | null;
  adminRoles?: AdminRole[];
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
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
            adminPublicId: input.adminPublicId ?? "admin_public_123",
            adminRoles: input.adminRoles ?? [],
          },
          session: {
            expiresAt: "2026-06-26T20:00:00.000Z",
          },
        },
      };
    },
  };
}

function createPostRequest(
  workspace: AdminAiGenerationWorkspace,
  body: Record<string, unknown>,
): Request {
  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests`,
    {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer synthetic-admin-session",
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

async function postLocalContractRequest(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
  body: Record<string, unknown>;
}) {
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    {
      sessionService: createAdminSessionService({
        adminRoles: input.adminRoles,
        organizationPublicId: input.organizationPublicId,
      }),
    },
  );

  return collection.POST(createPostRequest(input.workspace, input.body));
}

describe("admin AI generation local contract route handlers", () => {
  it("accepts content admin AI question requests as platform-owned local contracts", async () => {
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureA: "OMITTED_FIXTURE_A",
        clientOnlyFixtureB: "OMITTED_FIXTURE_B",
        clientOnlyFixtureC: "OMITTED_FIXTURE_C",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "content",
        generationKind: "question",
        flowStatus: "accepted",
        redactionStatus: "redacted",
        taskRequest: {
          decision: "create_pending_task",
          taskType: "ai_question_generation",
          authorizationSource: "admin_role",
          ownerType: "platform",
          ownerPublicId: "platform_content_review_pool",
          quotaOwnerType: "platform",
          quotaOwnerPublicId: "platform_content_review_pool",
          resultReference: {
            resultKind: "ai_generated_question_set",
            resultPublicId: null,
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "none",
            citationCount: 0,
          },
        },
        runtimeBridge: {
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_A");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_B");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_C");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("accepts organization advanced admin AI paper requests as organization-owned local contracts", async () => {
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      body: {
        generationKind: "paper",
        clientOnlyFixtureD: "OMITTED_FIXTURE_D",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "organization",
        generationKind: "paper",
        flowStatus: "accepted",
        taskRequest: {
          taskType: "ai_paper_generation",
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "organization_public_123",
          resultReference: {
            resultKind: "ai_generated_paper_draft",
            contentVisibility: "summary_only",
          },
        },
        resultState: {
          status: "pending",
          resultPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_D");
  });

  it("denies organization standard admin direct POST without creating a task contract", async () => {
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_standard_admin"],
      organizationPublicId: "organization_public_123",
      body: {
        generationKind: "question",
        clientOnlyFixtureE: "OMITTED_FIXTURE_E",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_E");
  });
});
