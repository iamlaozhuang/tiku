import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationRequestRepository } from "@/server/repositories/personal-ai-generation-request-repository";
import {
  createPersonalAiGenerationRequestRouteHandlers,
  createPersonalAiGenerationRequestUserResolver,
} from "@/server/services/personal-ai-generation-request-route";

const personalAiGenerationRequestRouteHandlers =
  createPersonalAiGenerationRequestRouteHandlers(
    createPersonalAiGenerationRequestUserResolver(createLocalSessionRuntime()),
    {
      requestRepository: createPostgresPersonalAiGenerationRequestRepository(),
    },
  );

export const POST = personalAiGenerationRequestRouteHandlers.collection.POST;
export const GET = personalAiGenerationRequestRouteHandlers.collection.GET;
