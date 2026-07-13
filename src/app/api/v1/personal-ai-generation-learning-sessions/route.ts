import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createPostgresOrganizationTrainingRepository } from "@/server/repositories/organization-training-repository";
import { createPostgresPersonalAiGenerationLearningSessionRepository } from "@/server/repositories/personal-ai-generation-learning-session-repository";
import { createPostgresPersonalAiGenerationResultRepository } from "@/server/repositories/personal-ai-generation-result-repository";
import { createPostgresQuestionRepository } from "@/server/repositories/question-repository";
import { createPersonalAiGenerationLearningSessionPaperSourceResolver } from "@/server/services/personal-ai-generation-learning-session-paper-source-resolver";
import { createPersonalAiGenerationResultUserResolver } from "@/server/services/personal-ai-generation-result-route";
import { createPersonalAiGenerationLearningSessionRouteHandlers } from "@/server/services/personal-ai-generation-learning-session-route";

const personalAiGenerationLearningSessionRouteHandlers =
  createPersonalAiGenerationLearningSessionRouteHandlers(
    createPersonalAiGenerationResultUserResolver(createLocalSessionRuntime()),
    {
      repository: createPostgresPersonalAiGenerationLearningSessionRepository(),
      resultRepository: createPostgresPersonalAiGenerationResultRepository(),
      paperSourceQuestionResolver:
        createPersonalAiGenerationLearningSessionPaperSourceResolver({
          questionRepository: createPostgresQuestionRepository(),
          organizationTrainingRepository:
            createPostgresOrganizationTrainingRepository(),
        }),
    },
  );

export const POST =
  personalAiGenerationLearningSessionRouteHandlers.collection.POST;
