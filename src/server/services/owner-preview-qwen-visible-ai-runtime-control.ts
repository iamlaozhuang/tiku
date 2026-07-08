import type { AdminAiGenerationRuntimeBridgeControl } from "./admin-ai-generation-local-contract-route";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import { qwenRouteIntegratedProviderLimits } from "./route-integrated-provider-execution-service";
import { defaultLocalUploadStorageRoot } from "./local-paper-asset-storage";
import { buildLocalResourceRagRetrievalResult } from "./rag-resource-knowledge-runtime";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
import { createDefaultAiGenerationRouteIntegratedKnowledgeScope } from "../contracts/route-integrated-provider-execution-contract";

type RuntimeEnv = Partial<
  Pick<NodeJS.ProcessEnv, "ALIBABA_API_KEY" | "NODE_ENV">
>;

type GroundableRouteIntegratedRequestContext = {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  taskType?: "ai_question_generation" | "ai_paper_generation";
  generationKind?: "question" | "paper";
};

function isOwnerPreviewQwenRuntimeEnabled(env: RuntimeEnv): boolean {
  return env.NODE_ENV !== "production";
}

function readAlibabaApiKeyFromRuntimeEnv(env: RuntimeEnv): string | null {
  const credential = env.ALIBABA_API_KEY;

  return typeof credential === "string" && credential.trim().length > 0
    ? credential.trim()
    : null;
}

function createFallbackGenerationParameters(): AiGenerationRouteIntegratedGenerationParameters {
  return {
    profession: "marketing",
    level: 3,
    subject: "theory",
    ...createDefaultAiGenerationRouteIntegratedKnowledgeScope(),
    questionType: null,
    questionCount: 10,
    difficulty: "medium",
    learningObjective: null,
  };
}

function createInsufficientGroundingContext(
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null,
): AiGenerationRouteIntegratedGroundingContext {
  return {
    generationParameters:
      generationParameters ?? createFallbackGenerationParameters(),
    evidenceStatus: "none",
    citationCount: 0,
    citations: [],
  };
}

function createGroundingRetrievalQuery(input: {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  taskType: "ai_question_generation" | "ai_paper_generation";
}): string {
  return [
    input.taskType === "ai_question_generation" ? "AI 出题" : "AI 组卷",
    input.generationParameters.profession,
    `level ${input.generationParameters.level}`,
    input.generationParameters.subject,
    "knowledge_node",
  ]
    .filter((segment): segment is string => typeof segment === "string")
    .join(" ");
}

function resolveTaskType(
  requestContext: GroundableRouteIntegratedRequestContext,
): "ai_question_generation" | "ai_paper_generation" {
  if (requestContext.taskType !== undefined) {
    return requestContext.taskType;
  }

  return requestContext.generationKind === "paper"
    ? "ai_paper_generation"
    : "ai_question_generation";
}

async function resolveOwnerPreviewGroundingContext(input: {
  requestContext: GroundableRouteIntegratedRequestContext;
}): Promise<AiGenerationRouteIntegratedGroundingContext> {
  const generationParameters = input.requestContext.generationParameters;

  if (generationParameters === null) {
    return createInsufficientGroundingContext(generationParameters);
  }

  const taskType = resolveTaskType(input.requestContext);
  const retrievalResult = await buildLocalResourceRagRetrievalResult({
    storageRoot: defaultLocalUploadStorageRoot,
    query: createGroundingRetrievalQuery({
      generationParameters,
      taskType,
    }),
    profession: generationParameters.profession,
    level: generationParameters.level,
    knowledgeNodePublicIds:
      taskType === "ai_question_generation"
        ? [...generationParameters.knowledgeNodePublicIds]
        : undefined,
  });

  return {
    generationParameters,
    evidenceStatus: retrievalResult.evidenceStatus,
    citationCount: retrievalResult.citations.length,
    citations: retrievalResult.citations.map((citation) => ({
      resourceTitle: citation.resourceTitle,
      headingPath: citation.headingPath,
      chunkIndex: citation.chunkIndex,
      chunkText: citation.chunkText,
      score: citation.score,
    })),
  };
}

export function createOwnerPreviewQwenPersonalRuntimeBridgeControl(
  env: RuntimeEnv = process.env,
): PersonalAiGenerationRuntimeBridgeControl | undefined {
  if (!isOwnerPreviewQwenRuntimeEnabled(env)) {
    return undefined;
  }

  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: qwenRouteIntegratedProviderLimits.maxRequests,
      maxRetries: qwenRouteIntegratedProviderLimits.maxRetries,
      maxOutputTokens: qwenRouteIntegratedProviderLimits.maxOutputTokens,
      timeoutMs: qwenRouteIntegratedProviderLimits.timeoutMs,
      resolveGroundingContext: resolveOwnerPreviewGroundingContext,
      readProviderCredential: () => readAlibabaApiKeyFromRuntimeEnv(env),
    },
  };
}

export function createOwnerPreviewQwenAdminRuntimeBridgeControl(
  env: RuntimeEnv = process.env,
): AdminAiGenerationRuntimeBridgeControl | undefined {
  if (!isOwnerPreviewQwenRuntimeEnabled(env)) {
    return undefined;
  }

  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: qwenRouteIntegratedProviderLimits.maxRequests,
      maxRetries: qwenRouteIntegratedProviderLimits.maxRetries,
      maxOutputTokens: qwenRouteIntegratedProviderLimits.maxOutputTokens,
      timeoutMs: qwenRouteIntegratedProviderLimits.timeoutMs,
      resolveGroundingContext: resolveOwnerPreviewGroundingContext,
      readProviderCredential: () => readAlibabaApiKeyFromRuntimeEnv(env),
    },
  };
}
