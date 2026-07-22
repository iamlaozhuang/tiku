import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "@/server/repositories/student-authorization-redeem-runtime-repository";
import { createEffectiveAuthorizationService } from "@/server/services/effective-authorization-service";
import {
  createPersonalAiGenerationRequestUserResolver,
  createPersonalAiGenerationTaskCancelRouteHandler,
} from "@/server/services/personal-ai-generation-request-route";

const authorizationRepositories =
  createPostgresStudentAuthorizationRedeemRuntimeRepositories();

export const POST = createPersonalAiGenerationTaskCancelRouteHandler(
  createPersonalAiGenerationRequestUserResolver(createLocalSessionRuntime()),
  {
    authorizationRepository:
      authorizationRepositories.effectiveAuthorizationRepository,
    effectiveAuthorizationService: createEffectiveAuthorizationService(
      authorizationRepositories.effectiveAuthorizationRepository,
    ),
  },
);
