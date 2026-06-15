import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationResultRepository } from "@/server/repositories/personal-ai-generation-result-repository";
import {
  createPersonalAiGenerationResultRouteHandlers,
  createPersonalAiGenerationResultUserResolver,
} from "@/server/services/personal-ai-generation-result-route";

const personalAiGenerationResultRouteHandlers =
  createPersonalAiGenerationResultRouteHandlers(
    createPersonalAiGenerationResultUserResolver(createLocalSessionRuntime()),
    {
      resultRepository: createPostgresPersonalAiGenerationResultRepository(),
    },
  );

export const GET = personalAiGenerationResultRouteHandlers.detail.GET;
