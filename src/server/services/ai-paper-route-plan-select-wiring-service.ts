import type {
  AiPaperAssemblyRole,
  AiPaperPlanAndSelectResult,
} from "../contracts/ai-paper-plan-and-select-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import type { PersonalAiGenerationPaperQuestionSourceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type { AiPaperQuestionSourceRepository } from "../repositories/question-repository";
import {
  assembleAiPaperFromRouteVisiblePlan,
  type AiPaperRouteAssemblyFailureCategory,
} from "./ai-paper-route-assembly-service";
import {
  resolveAiPaperRouteQuestionSources,
  type AiPaperRouteSourceResolutionDiagnostics,
  type AiPaperRouteSourceResolutionFailureCategory,
} from "./ai-paper-route-source-resolution-service";

export type AiPaperRoutePlanSelectWiringFailureCategory =
  | AiPaperRouteSourceResolutionFailureCategory
  | AiPaperRouteAssemblyFailureCategory;

export type AiPaperRoutePlanSelectWiringInput = {
  role: AiPaperAssemblyRole;
  organizationPublicId: string | null;
  employeePublicId?: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
  questionRepository: AiPaperQuestionSourceRepository;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  > &
    Partial<
      Pick<OrganizationTrainingRepository, "findCanonicalQuestionsByVersion">
    >;
};

export type AiPaperRoutePlanSelectWiringResult =
  | {
      status: "assembled" | "insufficient";
      sourceDiagnostics: AiPaperRouteSourceResolutionDiagnostics;
      assembly: AiPaperPlanAndSelectResult;
      privateSourceQuestions?:
        | PersonalAiGenerationPaperQuestionSourceDto[]
        | null;
      rejection: null;
    }
  | {
      status: "rejected";
      sourceDiagnostics: AiPaperRouteSourceResolutionDiagnostics;
      assembly: null;
      privateSourceQuestions?: [];
      rejection: {
        failureCategory: AiPaperRoutePlanSelectWiringFailureCategory;
      };
    };

export async function resolveAndAssembleAiPaperFromRoute(
  input: AiPaperRoutePlanSelectWiringInput,
): Promise<AiPaperRoutePlanSelectWiringResult> {
  const sourceResolution = await resolveAiPaperRouteQuestionSources({
    role: input.role,
    organizationPublicId: input.organizationPublicId,
    employeePublicId: input.employeePublicId,
    generationParameters: input.generationParameters,
    questionRepository: input.questionRepository,
    organizationTrainingRepository: input.organizationTrainingRepository,
  });

  if (sourceResolution.status === "rejected") {
    return {
      status: "rejected",
      sourceDiagnostics: sourceResolution.diagnostics,
      assembly: null,
      rejection: sourceResolution.rejection,
    };
  }

  const assemblyResult = assembleAiPaperFromRouteVisiblePlan({
    role: input.role,
    organizationPublicId: input.organizationPublicId,
    generationParameters: input.generationParameters,
    visibleGeneratedContent: input.visibleGeneratedContent,
    platformQuestions: sourceResolution.platformQuestions,
    enterpriseQuestions: sourceResolution.enterpriseQuestions,
  });

  if (assemblyResult.status === "rejected") {
    return {
      status: "rejected",
      sourceDiagnostics: sourceResolution.diagnostics,
      assembly: null,
      rejection: assemblyResult.rejection,
    };
  }

  const result: AiPaperRoutePlanSelectWiringResult = {
    status: assemblyResult.status,
    sourceDiagnostics: sourceResolution.diagnostics,
    assembly: assemblyResult.assembly,
    rejection: null,
  };

  Object.defineProperty(result, "privateSourceQuestions", {
    value: sourceResolution.privateSourceQuestions ?? null,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return result;
}
