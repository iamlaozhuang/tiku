import { beforeEach, describe, expect, it, vi } from "vitest";
import { promptTemplateDefinitions } from "@/ai/prompts/templates";

import type { AdminAiGenerationRouteIntegratedProviderRequestContext } from "../contracts/admin-ai-generation-runtime-bridge-contract";
import { createModelConfigSnapshot } from "../models/ai-rag";
import {
  createOwnerPreviewQwenAdminRuntimeBridgeControl,
  createOwnerPreviewQwenPersonalRuntimeBridgeControl,
} from "./owner-preview-qwen-visible-ai-runtime-control";

const resourceRetrievalMock = vi.hoisted(() => vi.fn());

vi.mock("./rag-resource-knowledge-runtime", () => ({
  buildResourceRagRetrievalResult: resourceRetrievalMock,
}));

beforeEach(() => {
  resourceRetrievalMock.mockReset();
});

const explicitLocalOwnerPreviewProviderGate = {
  NODE_ENV: "development",
  TIKU_OWNER_PREVIEW_PROVIDER_GATE: "enabled",
  TIKU_OWNER_PREVIEW_PROVIDER_TARGET: "local",
} as const;

function createOwnerPreviewOptions(
  runtimeGate: Record<string, string>,
  credential: string | null = null,
) {
  return {
    runtimeGate,
    readProviderCredential: () => credential,
  };
}

describe("owner preview Qwen visible AI runtime control", () => {
  it("stays disabled without an explicitly injected credential resolver", () => {
    expect(
      createOwnerPreviewQwenPersonalRuntimeBridgeControl(),
    ).toBeUndefined();
    expect(createOwnerPreviewQwenAdminRuntimeBridgeControl()).toBeUndefined();
  });

  it("does not enable route-integrated provider execution in production", () => {
    expect(
      createOwnerPreviewQwenPersonalRuntimeBridgeControl(
        createOwnerPreviewOptions(
          {
            NODE_ENV: "production",
            TIKU_OWNER_PREVIEW_PROVIDER_GATE: "enabled",
            TIKU_OWNER_PREVIEW_PROVIDER_TARGET: "local",
          },
          "synthetic-runtime-key",
        ),
      ),
    ).toBeUndefined();
    expect(
      createOwnerPreviewQwenAdminRuntimeBridgeControl(
        createOwnerPreviewOptions(
          {
            NODE_ENV: "production",
            TIKU_OWNER_PREVIEW_PROVIDER_GATE: "enabled",
            TIKU_OWNER_PREVIEW_PROVIDER_TARGET: "local",
          },
          "synthetic-runtime-key",
        ),
      ),
    ).toBeUndefined();
  });

  it("keeps owner-preview provider disabled by default even when a runtime key exists", () => {
    expect(
      createOwnerPreviewQwenPersonalRuntimeBridgeControl(
        createOwnerPreviewOptions(
          {
            NODE_ENV: "development",
          },
          "synthetic-runtime-key",
        ),
      ),
    ).toBeUndefined();
    expect(
      createOwnerPreviewQwenAdminRuntimeBridgeControl(
        createOwnerPreviewOptions(
          {
            NODE_ENV: "test",
          },
          "synthetic-runtime-key",
        ),
      ),
    ).toBeUndefined();
  });

  it("requires an explicit local owner-preview provider gate", () => {
    expect(
      createOwnerPreviewQwenAdminRuntimeBridgeControl(
        createOwnerPreviewOptions({
          NODE_ENV: "development",
          TIKU_OWNER_PREVIEW_PROVIDER_GATE: "disabled",
          TIKU_OWNER_PREVIEW_PROVIDER_TARGET: "local",
        }),
      ),
    ).toBeUndefined();
    expect(
      createOwnerPreviewQwenPersonalRuntimeBridgeControl(
        createOwnerPreviewOptions({
          NODE_ENV: "development",
          TIKU_OWNER_PREVIEW_PROVIDER_GATE: "enabled",
          TIKU_OWNER_PREVIEW_PROVIDER_TARGET: "preview",
        }),
      ),
    ).toBeUndefined();
  });

  it("reads only the runtime Alibaba key through the injected credential reader", async () => {
    const control = createOwnerPreviewQwenAdminRuntimeBridgeControl(
      createOwnerPreviewOptions(
        explicitLocalOwnerPreviewProviderGate,
        "synthetic-runtime-key",
      ),
    );

    expect(control).toMatchObject({
      bridgeMode: "controlled_runner",
      explicitLocalSwitchPresent: true,
      providerExecution: {
        executionMode: "route_integrated_provider",
        realProviderExecutionApproved: true,
        maxRequests: 1,
        maxRetries: 0,
        maxOutputTokens: 1800,
        timeoutMs: 60000,
      },
    });
    await expect(
      Promise.resolve(control?.providerExecution?.readProviderCredential()),
    ).resolves.toBe("synthetic-runtime-key");
    expect(JSON.stringify(control)).not.toContain("synthetic-runtime-key");
  });

  it("returns null credentials when the runtime key is absent", async () => {
    const control = createOwnerPreviewQwenPersonalRuntimeBridgeControl(
      createOwnerPreviewOptions(explicitLocalOwnerPreviewProviderGate),
    );

    expect(control).not.toBeUndefined();
    await expect(
      Promise.resolve(control?.providerExecution?.readProviderCredential()),
    ).resolves.toBeNull();
  });

  it("reserves the deterministic running log against the exact claimed task scope", async () => {
    const promptTemplate = promptTemplateDefinitions.find(
      (definition) => definition.aiFuncType === "ai_question_generation",
    );
    if (promptTemplate === undefined) {
      throw new Error("missing question generation prompt fixture");
    }
    const reserveAiCallLog = vi.fn(async (input) => ({
      publicId: input.log.publicId,
    }));
    const control = createOwnerPreviewQwenAdminRuntimeBridgeControl({
      ...createOwnerPreviewOptions(
        explicitLocalOwnerPreviewProviderGate,
        "synthetic-runtime-key",
      ),
      lifecycleRepository: { reserveAiCallLog },
    });
    const reserve = control?.providerExecution?.reserveAiCallLog;
    expect(reserve).toBeDefined();
    if (reserve === undefined) {
      throw new Error("missing owner preview log reservation control");
    }

    const attempt = {
      taskPublicId: "admin-ai-task-public-001",
      retryCount: 1,
      startedAt: new Date("2026-07-22T12:00:00.123Z"),
    };
    const result = await reserve({
      requestContext: {
        actorPublicId: "admin-public-001",
        taskPublicId: attempt.taskPublicId,
        resultPublicId: "admin-ai-result-public-001",
        requestPublicId: "admin-ai-request-public-001",
        routeWorkflow: "content_ai_question_generation",
        taskType: "ai_question_generation",
        workspace: "content",
        generationKind: "question",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
        generationParameters: null,
      },
      governanceContext: {
        modelConfigSnapshot: createModelConfigSnapshot({
          providerPublicId: "model-provider-public-001",
          providerKey: "alibaba_qwen",
          providerDisplayName: "Alibaba Qwen",
          modelConfigPublicId: "model-config-public-001",
          aiFuncType: "ai_question_generation",
          modelName: "qwen3.7-max",
          displayName: "Qwen Question Generation",
          configVersion: 1,
          pricingVersion: null,
          inputTokenPriceCnyPerMillion: null,
          outputTokenPriceCnyPerMillion: null,
          timeoutSecond: 60,
          maxRetryCount: 0,
          fallbackModelConfigPublicId: null,
          promptTemplateKey: promptTemplate.promptTemplateKey,
          promptTemplateVersion: promptTemplate.version,
        }),
        promptTemplate: {
          ...promptTemplate,
          aiFuncType: "ai_question_generation",
        },
      },
      groundingSummary: { evidenceStatus: "sufficient", citationCount: 2 },
      attempt,
      startedAt: new Date("2026-07-22T12:00:01.000Z"),
    });

    expect(result.publicId).toMatch(/^ai-call-log-generation-[a-f0-9]{64}$/u);
    expect(reserveAiCallLog).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: {
          taskPublicId: attempt.taskPublicId,
          ownerType: "platform",
          ownerPublicId: "platform_content_review_pool",
          organizationPublicId: null,
          taskTypes: ["ai_question_generation"],
        },
        attempt,
        log: expect.objectContaining({
          publicId: result.publicId,
          callStatus: "running",
          completedAt: null,
        }),
      }),
    );
  });

  it.each([
    {
      taskType: "ai_question_generation" as const,
      expectedTaskToken: "AI 出题",
    },
    {
      taskType: "ai_paper_generation" as const,
      expectedTaskToken: "AI 组卷",
    },
  ])(
    "uses runtime resource compatible grounding tokens for $taskType",
    async ({ taskType, expectedTaskToken }) => {
      const { buildRagRetrievalContextFromChunks } =
        await import("./rag-retrieval-service");
      resourceRetrievalMock.mockImplementationOnce(async (input) =>
        buildRagRetrievalContextFromChunks({
          query: input.query,
          profession: input.profession,
          level: input.level,
          authorizedResourcePublicIds: [
            "synthetic_resource_marketing_level_3_a",
            "synthetic_resource_marketing_level_3_b",
          ],
          chunks: [
            {
              chunkPublicId: "synthetic_chunk_marketing_level_3_a",
              resourcePublicId: "synthetic_resource_marketing_level_3_a",
              resourceTitle: "synthetic marketing level 3 resource",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              headingPath: ["AI generation runtime fixture"],
              chunkIndex: 0,
              text: `${expectedTaskToken} marketing level 3 theory knowledge_node synthetic coverage alpha`,
              textHash: "synthetic_hash_alpha",
            },
            {
              chunkPublicId: "synthetic_chunk_marketing_level_3_b",
              resourcePublicId: "synthetic_resource_marketing_level_3_b",
              resourceTitle: "synthetic marketing level 3 resource",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              headingPath: ["AI generation runtime fixture"],
              chunkIndex: 1,
              text: `${expectedTaskToken} marketing level 3 theory knowledge_node synthetic coverage beta`,
              textHash: "synthetic_hash_beta",
            },
          ],
        }),
      );
      const control = createOwnerPreviewQwenAdminRuntimeBridgeControl(
        createOwnerPreviewOptions(
          explicitLocalOwnerPreviewProviderGate,
          "synthetic-runtime-key",
        ),
      );
      const resolveGroundingContext =
        control?.providerExecution?.resolveGroundingContext;
      const generationKind =
        taskType === "ai_question_generation" ? "question" : "paper";
      const requestContext = {
        actorPublicId: "admin-public-grounding-test",
        taskPublicId: `synthetic_task_${generationKind}`,
        resultPublicId: `synthetic_result_${generationKind}`,
        requestPublicId: `synthetic_request_${generationKind}`,
        routeWorkflow:
          taskType === "ai_question_generation"
            ? "content_ai_question_generation"
            : "content_ai_paper_generation",
        taskType,
        workspace: "content",
        generationKind,
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: "synthetic knowledge scope",
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: ["knowledge_node_public_runtime_scope"],
          includeDescendants: true,
          knowledgeNodeSupplement: "synthetic knowledge scope",
          sourcePreference: null,
          questionType:
            taskType === "ai_question_generation" ? "single_choice" : null,
          questionCount: taskType === "ai_question_generation" ? 10 : 50,
          difficulty: "medium",
          learningObjective: "弱项巩固",
        },
      } satisfies AdminAiGenerationRouteIntegratedProviderRequestContext;

      expect(resolveGroundingContext).toBeDefined();
      if (resolveGroundingContext === undefined) {
        throw new Error("Expected owner-preview grounding resolver.");
      }

      const groundingContext = await resolveGroundingContext({
        requestContext,
      });

      expect(groundingContext).toMatchObject({
        evidenceStatus: "sufficient",
        citationCount: 2,
      });
      const retrievalInput = resourceRetrievalMock.mock.calls[0]?.[0];
      expect(retrievalInput.query).toContain(expectedTaskToken);
      expect(retrievalInput.query).toContain("marketing");
      expect(retrievalInput.query).toContain("level 3");
      expect(retrievalInput.query).toContain("theory");
      expect(retrievalInput.query).not.toContain("AI出题");
      expect(retrievalInput.query).not.toContain("AI组卷");
      expect(retrievalInput.query).not.toContain("3级");
      expect(retrievalInput.query).not.toContain("single_choice");
      expect(retrievalInput.query).not.toContain("medium");
      expect(retrievalInput.subject).toBe("theory");
      expect(retrievalInput.includeDescendants).toBe(true);
      expect(retrievalInput.knowledgeNodePublicIds).toEqual([
        "knowledge_node_public_runtime_scope",
      ]);
    },
  );
});
