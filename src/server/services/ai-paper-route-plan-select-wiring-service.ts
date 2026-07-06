import type {
  AiPaperAssemblyRole,
  AiPaperPlanAndSelectResult,
} from "../contracts/ai-paper-plan-and-select-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type { QuestionRepository } from "../repositories/question-repository";
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
  questionRepository: Pick<QuestionRepository, "listQuestions">;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  >;
  knowledgeNodeParentPublicIdsByPublicId?: Readonly<
    Record<string, string | null>
  >;
  difficultyByQuestionPublicId?: Readonly<Record<string, string | null>>;
  platformPageSize?: number;
};

export type AiPaperRoutePlanSelectWiringResult =
  | {
      status: "assembled" | "insufficient";
      sourceDiagnostics: AiPaperRouteSourceResolutionDiagnostics;
      assembly: AiPaperPlanAndSelectResult;
      rejection: null;
    }
  | {
      status: "rejected";
      sourceDiagnostics: AiPaperRouteSourceResolutionDiagnostics;
      assembly: null;
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
    knowledgeNodeParentPublicIdsByPublicId:
      input.knowledgeNodeParentPublicIdsByPublicId,
    difficultyByQuestionPublicId: input.difficultyByQuestionPublicId,
    platformPageSize: input.platformPageSize,
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

  return {
    status: assemblyResult.status,
    sourceDiagnostics: sourceResolution.diagnostics,
    assembly: assemblyResult.assembly,
    rejection: null,
  };
}
