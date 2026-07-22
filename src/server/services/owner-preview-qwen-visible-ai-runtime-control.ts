import type { AdminAiGenerationRuntimeBridgeControl } from "./admin-ai-generation-local-contract-route";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import { qwenRouteIntegratedProviderLimits } from "./route-integrated-provider-execution-service";
import { buildResourceRagRetrievalResult } from "./rag-resource-knowledge-runtime";
import type {
  AiGenerationRouteIntegratedGovernanceContext,
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
  AiGenerationRouteIntegratedGroundingSummary,
  AiGenerationRouteIntegratedProviderExecutionSummary,
} from "../contracts/route-integrated-provider-execution-contract";
import { createDefaultAiGenerationRouteIntegratedKnowledgeScope } from "../contracts/route-integrated-provider-execution-contract";
import { createPostgresAdminAiAuditLogRuntimeRepositories } from "../repositories/admin-ai-audit-log-runtime-repository";
import { createPostgresAiGenerationTaskLifecycleRepository } from "../repositories/ai-generation-task-lifecycle-repository";
import type { AiGenerationTaskLifecycleRepository } from "../repositories/ai-generation-task-lifecycle-repository";
import {
  createRouteIntegratedAiCallLogInput,
  createRouteIntegratedAiCallLogReservation,
  resolveRouteIntegratedProviderGovernanceContext,
  type RouteIntegratedProviderLogRequestContext,
} from "./route-integrated-provider-governance-service";
import {
  loadPersistedModelConfigRuntimeCatalog,
  type ModelConfigRuntimeCatalogLoader,
} from "./student-flow-runtime";

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
  modelConfigRuntimeCatalogLoader?: ModelConfigRuntimeCatalogLoader;
  updateRunningAiCallLogObservation?: ReturnType<
    typeof createPostgresAdminAiAuditLogRuntimeRepositories
  >["updateRunningAiCallLogObservation"];
  lifecycleRepository?: Pick<
    AiGenerationTaskLifecycleRepository,
    "reserveAiCallLog"
  >;
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

type GovernedRouteIntegratedRequestContext = Omit<
  GroundableRouteIntegratedRequestContext,
  "taskType"
> &
  RouteIntegratedProviderLogRequestContext;

type AppendRouteIntegratedAiCallLogControlInput = {
  aiCallLogPublicId: string;
  requestContext: GovernedRouteIntegratedRequestContext;
  governanceContext: AiGenerationRouteIntegratedGovernanceContext;
  groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
  attempt: {
    taskPublicId: string;
    retryCount: number;
    startedAt: Date;
  };
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  startedAt: Date;
  completedAt: Date;
};

function createGovernanceControls(
  options: OwnerPreviewQwenRuntimeControlOptions,
) {
  const loadCatalog =
    options.modelConfigRuntimeCatalogLoader ??
    loadPersistedModelConfigRuntimeCatalog;
  const auditLogRepository = createPostgresAdminAiAuditLogRuntimeRepositories();
  const updateRunningAiCallLogObservation =
    options.updateRunningAiCallLogObservation ??
    auditLogRepository.updateRunningAiCallLogObservation;
  const lifecycleRepository =
    options.lifecycleRepository ??
    createPostgresAiGenerationTaskLifecycleRepository();

  return {
    async resolveGovernanceContext(input: {
      requestContext: GovernedRouteIntegratedRequestContext;
    }) {
      const catalog = await loadCatalog();

      return catalog === null
        ? null
        : resolveRouteIntegratedProviderGovernanceContext({
            taskType: input.requestContext.taskType,
            catalog,
          });
    },
    async appendAiCallLog(input: AppendRouteIntegratedAiCallLogControlInput) {
      if (updateRunningAiCallLogObservation === undefined) {
        throw new Error("AI generation log observation is unavailable.");
      }
      const governanceContext = {
        ...input.governanceContext,
        promptTemplate: {
          ...input.governanceContext.promptTemplate,
          requiredVariables: [
            ...input.governanceContext.promptTemplate.requiredVariables,
          ],
        },
      };
      const persisted = await updateRunningAiCallLogObservation({
        publicId: input.aiCallLogPublicId,
        attempt: input.attempt,
        observation: createRouteIntegratedAiCallLogInput({
          ...input,
          governanceContext,
          requestContext: input.requestContext,
        }),
      });

      return { publicId: persisted.publicId };
    },
    async reserveAiCallLog(input: {
      requestContext: GovernedRouteIntegratedRequestContext;
      governanceContext: AiGenerationRouteIntegratedGovernanceContext;
      groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
      attempt: {
        taskPublicId: string;
        retryCount: number;
        startedAt: Date;
      };
      startedAt: Date;
    }) {
      if (lifecycleRepository.reserveAiCallLog === undefined) {
        throw new Error("AI generation log reservation is unavailable.");
      }

      const governanceContext = {
        ...input.governanceContext,
        promptTemplate: {
          ...input.governanceContext.promptTemplate,
          requiredVariables: [
            ...input.governanceContext.promptTemplate.requiredVariables,
          ],
        },
      };
      const reservation = createRouteIntegratedAiCallLogReservation({
        ...input,
        governanceContext,
      });
      return lifecycleRepository.reserveAiCallLog({
        scope: {
          taskPublicId: input.attempt.taskPublicId,
          ownerType: input.requestContext.ownerType,
          ownerPublicId: input.requestContext.ownerPublicId,
          organizationPublicId: input.requestContext.organizationPublicId,
          taskTypes: [input.requestContext.taskType],
        },
        attempt: input.attempt,
        promptTemplateHash: input.governanceContext.promptTemplate.templateHash,
        log: reservation,
      });
    },
  };
}

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

  const governanceControls = createGovernanceControls(options);

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
      ...governanceControls,
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

  const governanceControls = createGovernanceControls(options);

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
      ...governanceControls,
      readProviderCredential: options.readProviderCredential,
    },
  };
}
