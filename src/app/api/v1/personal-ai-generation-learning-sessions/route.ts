import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationLearningSessionRepository } from "@/server/repositories/personal-ai-generation-learning-session-repository";
import { createPostgresPersonalAiGenerationResultRepository } from "@/server/repositories/personal-ai-generation-result-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "@/server/repositories/student-authorization-redeem-runtime-repository";
import { createEffectiveAuthorizationService } from "@/server/services/effective-authorization-service";
import { createPersonalAiGenerationResultUserResolver } from "@/server/services/personal-ai-generation-result-route";
import { createPersonalAiGenerationLearningSessionRouteHandlers } from "@/server/services/personal-ai-generation-learning-session-route";

const studentAuthorizationRedeemRuntimeRepositories =
  createPostgresStudentAuthorizationRedeemRuntimeRepositories();

const personalAiGenerationLearningSessionRouteHandlers =
  createPersonalAiGenerationLearningSessionRouteHandlers(
    createPersonalAiGenerationResultUserResolver(createLocalSessionRuntime()),
    {
      repository: createPostgresPersonalAiGenerationLearningSessionRepository(),
      resultRepository: createPostgresPersonalAiGenerationResultRepository(),
      authorizationRepository:
        studentAuthorizationRedeemRuntimeRepositories.effectiveAuthorizationRepository,
      effectiveAuthorizationService: createEffectiveAuthorizationService(
        studentAuthorizationRedeemRuntimeRepositories.effectiveAuthorizationRepository,
      ),
    },
  );

export const POST =
  personalAiGenerationLearningSessionRouteHandlers.collection.POST;
