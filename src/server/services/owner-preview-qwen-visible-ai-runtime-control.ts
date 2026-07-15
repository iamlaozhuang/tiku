import type { AdminAiGenerationRuntimeBridgeControl } from "./admin-ai-generation-local-contract-route";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import { qwenRouteIntegratedProviderLimits } from "./route-integrated-provider-execution-service";
import { buildResourceRagRetrievalResult } from "./rag-resource-knowledge-runtime";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
import { createDefaultAiGenerationRouteIntegratedKnowledgeScope } from "../contracts/route-integrated-provider-execution-contract";

type RuntimeEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    | "NODE_ENV"
    | "TIKU_OWNER_PREVIEW_PROVIDER_GATE"
    | "TIKU_OWNER_PREVIEW_PROVIDER_TARGET"
  >
>;

type OwnerPreviewQwenRuntimeControlOptions = {
  runtimeGate: RuntimeEnv;
  readProviderCredential: () => Promise<string | null> | string | null;
};

const ownerPreviewProviderGate = {
  enabled: "enabled",
  target: "local",
} as const;

type GroundableRouteIntegratedRequestContext = {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  taskType?: "ai_question_generation" | "ai_paper_generation";
  generationKind?: "question" | "paper";
};

function isOwnerPreviewQwenRuntimeEnabled(env: RuntimeEnv): boolean {
  return (
    env.NODE_ENV !== "production" &&
    env.TIKU_OWNER_PREVIEW_PROVIDER_GATE === ownerPreviewProviderGate.enabled &&
    env.TIKU_OWNER_PREVIEW_PROVIDER_TARGET === ownerPreviewProviderGate.target
  );
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
  const retrievalResult = await buildResourceRagRetrievalResult({
    query: createGroundingRetrievalQuery({
      generationParameters,
      taskType,
    }),
    profession: generationParameters.profession,
    level: generationParameters.level,
    subject: generationParameters.subject,
    knowledgeNodePublicIds: [...generationParameters.knowledgeNodePublicIds],
    includeDescendants: generationParameters.includeDescendants,
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
  options?: OwnerPreviewQwenRuntimeControlOptions,
): PersonalAiGenerationRuntimeBridgeControl | undefined {
  if (
    options === undefined ||
    !isOwnerPreviewQwenRuntimeEnabled(options.runtimeGate)
  ) {
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
      readProviderCredential: options.readProviderCredential,
    },
  };
}

export function createOwnerPreviewQwenAdminRuntimeBridgeControl(
  options?: OwnerPreviewQwenRuntimeControlOptions,
): AdminAiGenerationRuntimeBridgeControl | undefined {
  if (
    options === undefined ||
    !isOwnerPreviewQwenRuntimeEnabled(options.runtimeGate)
  ) {
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
      readProviderCredential: options.readProviderCredential,
    },
  };
}
