import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationRequestRepository } from "@/server/repositories/personal-ai-generation-request-repository";
import { createPostgresPersonalAiGenerationResultRepository } from "@/server/repositories/personal-ai-generation-result-repository";
import { createPostgresQuestionRepository } from "@/server/repositories/question-repository";
import { createPostgresOrganizationTrainingRepository } from "@/server/repositories/organization-training-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "@/server/repositories/student-authorization-redeem-runtime-repository";
import { createEffectiveAuthorizationService } from "@/server/services/effective-authorization-service";
import { createOwnerPreviewQwenPersonalRuntimeBridgeControl } from "@/server/services/owner-preview-qwen-visible-ai-runtime-control";
import {
  createPersonalAiGenerationRequestRouteHandlers,
  createPersonalAiGenerationRequestUserResolver,
} from "@/server/services/personal-ai-generation-request-route";

const studentAuthorizationRedeemRuntimeRepositories =
  createPostgresStudentAuthorizationRedeemRuntimeRepositories();

const personalAiGenerationRequestRouteHandlers =
  createPersonalAiGenerationRequestRouteHandlers(
    createPersonalAiGenerationRequestUserResolver(createLocalSessionRuntime()),
    {
      requestRepository: createPostgresPersonalAiGenerationRequestRepository(),
      resultRepository: createPostgresPersonalAiGenerationResultRepository(),
      questionRepository: createPostgresQuestionRepository(),
      organizationTrainingRepository:
        createPostgresOrganizationTrainingRepository(),
      runtimeBridgeControl:
        createOwnerPreviewQwenPersonalRuntimeBridgeControl(),
      effectiveAuthorizationService: createEffectiveAuthorizationService(
        studentAuthorizationRedeemRuntimeRepositories.effectiveAuthorizationRepository,
      ),
    },
  );

export const POST = personalAiGenerationRequestRouteHandlers.collection.POST;
export const GET = personalAiGenerationRequestRouteHandlers.collection.GET;
