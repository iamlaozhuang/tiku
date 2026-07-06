import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresPersonalAiGenerationLearningSessionRepository } from "@/server/repositories/personal-ai-generation-learning-session-repository";
import { createPersonalAiGenerationResultUserResolver } from "@/server/services/personal-ai-generation-result-route";
import { createPersonalAiGenerationLearningSessionRouteHandlers } from "@/server/services/personal-ai-generation-learning-session-route";

const personalAiGenerationLearningSessionRouteHandlers =
  createPersonalAiGenerationLearningSessionRouteHandlers(
    createPersonalAiGenerationResultUserResolver(createLocalSessionRuntime()),
    {
      repository: createPostgresPersonalAiGenerationLearningSessionRepository(),
    },
  );

export const GET =
  personalAiGenerationLearningSessionRouteHandlers.progress.GET;
