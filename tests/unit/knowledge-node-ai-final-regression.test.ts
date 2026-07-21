import { describe, expect, it } from "vitest";

import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import { normalizeAiGenerationRouteIntegratedKnowledgeScope } from "@/server/contracts/route-integrated-provider-execution-contract";
import type {
  AiPaperQuestionSourceRepository,
  QuestionAccessRow,
} from "@/server/repositories/question-repository";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";
import { resolveAiPaperRouteQuestionSources } from "@/server/services/ai-paper-route-source-resolution-service";

function createCapabilitySummary(
  overrides: Partial<AdminWorkspaceCapabilitySummary>,
): AdminWorkspaceCapabilitySummary {
  return {
    adminRoles: [],
    organizationPublicId: null,
    organizationEffectiveEdition: null,
    organizationAuthorizationSource: null,
    capabilitySource: "service_computed",
    canUseOrganizationAdvancedWorkspace: false,
    ...overrides,
  };
}

function createQuestionRow(
  override: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 1001,
    public_id: "platform_question_public_selected",
    question_type: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    stem_rich_text: "redacted stem",
    analysis_rich_text: "redacted analysis",
    standard_answer_rich_text: "redacted answer",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    fill_blank_answers: [],
    material_id: null,
    material_public_id: null,
    question_options: [],
    scoring_points: [],
    knowledge_node_public_ids: ["knowledge_node_public_selected"],
    tag_public_ids: [],
    created_at: new Date("2026-07-08T00:00:00.000Z"),
    updated_at: new Date("2026-07-08T00:00:00.000Z"),
    ...override,
  };
}

describe("knowledge node AI final cross-role regression", () => {
  it("keeps structured selected knowledge scope identical for approved AI generation roles", () => {
    const approvedRoles = [
      "personal_advanced_student",
      "org_advanced_employee",
      "org_advanced_admin",
      "content_admin",
    ] as const;

    for (const role of approvedRoles) {
      const normalizedScope =
        normalizeAiGenerationRouteIntegratedKnowledgeScope({
          knowledgeNodePublicIds: [
            "knowledge_node_public_selected",
            " knowledge_node_public_selected ",
            "knowledge_node_public_sibling",
          ],
          knowledgeNodeMode: "selected",
          includeDescendants: true,
          knowledgeNodeSupplement: "redacted scope summary",
          sourcePreference:
            role === "org_advanced_employee" || role === "org_advanced_admin"
              ? "prefer_enterprise"
              : "balanced",
        });

      expect(normalizedScope).toEqual({
        knowledgeNode: null,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: [
          "knowledge_node_public_selected",
          "knowledge_node_public_sibling",
        ],
        includeDescendants: true,
        knowledgeNodeSupplement: "redacted scope summary",
        sourcePreference:
          role === "org_advanced_employee" || role === "org_advanced_admin"
            ? "prefer_enterprise"
            : "balanced",
      });
    }
  });

  it("keeps backend AI entry boundaries separated for standard, advanced, ops, content, and super admin roles", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({ status: "allowed", workspace: "content" });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["ops_admin"],
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "content",
      reason: "workspace_role_mismatch",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/ai-audit-logs",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["ops_admin"],
        }),
      }),
    ).toMatchObject({ status: "allowed", workspace: "ops" });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["org_standard_admin"],
          organizationPublicId: "organization_public_standard",
          organizationEffectiveEdition: "standard",
          organizationAuthorizationSource: "org_auth",
        }),
      }),
    ).toMatchObject({
      status: "standard_unavailable",
      reason: "organization_advanced_capability_required",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationPublicId: "organization_public_advanced",
          organizationEffectiveEdition: "advanced",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({ status: "allowed", workspace: "organization" });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["super_admin"],
          organizationPublicId: null,
          organizationEffectiveEdition: "advanced",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      reason: "organization_context_required",
      requiredOrganizationContext: true,
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-question-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["super_admin"],
        }),
      }),
    ).toMatchObject({ status: "allowed", workspace: "content" });
  });

  it("keeps selected knowledge-node scope from admitting unrelated platform questions during AI paper source resolution", async () => {
    const questionRepository: AiPaperQuestionSourceRepository = {
      async listAvailableAiPaperSourceQuestions() {
        return [
          createQuestionRow(),
          createQuestionRow({
            public_id: "platform_question_public_unrelated",
            knowledge_node_public_ids: ["knowledge_node_public_unrelated"],
          }),
        ];
      },
    };

    const result = await resolveAiPaperRouteQuestionSources({
      role: "content_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters: {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNode: null,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge_node_public_selected"],
        includeDescendants: false,
        knowledgeNodeSupplement: null,
        sourcePreference: "balanced",
        questionType: null,
        questionCount: 1,
        difficulty: "medium",
        learningObjective: "redacted objective",
      },
      questionRepository,
      organizationTrainingRepository: undefined,
    });

    expect(result.status).toBe("resolved");
    expect(
      result.platformQuestions.map((question) => question.publicId),
    ).toEqual(["platform_question_public_selected"]);
    expect(result.enterpriseQuestions).toEqual([]);
  });
});
