import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationResultRepository } from "@/server/repositories/personal-ai-generation-result-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "@/server/repositories/student-authorization-redeem-runtime-repository";
import {
  createPersonalAiGenerationResultRouteHandlers,
  createPersonalAiGenerationResultUserResolver,
} from "@/server/services/personal-ai-generation-result-route";

const studentAuthorizationRedeemRuntimeRepositories =
  createPostgresStudentAuthorizationRedeemRuntimeRepositories();

const personalAiGenerationResultRouteHandlers =
  createPersonalAiGenerationResultRouteHandlers(
    createPersonalAiGenerationResultUserResolver(createLocalSessionRuntime()),
    {
      resultRepository: createPostgresPersonalAiGenerationResultRepository(),
      authorizationRepository:
        studentAuthorizationRedeemRuntimeRepositories.effectiveAuthorizationRepository,
    },
  );

export const GET = personalAiGenerationResultRouteHandlers.collection.GET;
