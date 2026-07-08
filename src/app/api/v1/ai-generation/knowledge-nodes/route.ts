import { createPostgresContentKnowledgeNodeRuntimeRepository } from "@/server/repositories/content-knowledge-node-runtime-repository";
import { createAiGenerationKnowledgeNodeOptionsRouteHandlers } from "@/server/services/ai-generation-knowledge-node-options-route";
import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";

const aiGenerationKnowledgeNodeOptionsRouteHandlers =
  createAiGenerationKnowledgeNodeOptionsRouteHandlers({
    knowledgeNodeRepository:
      createPostgresContentKnowledgeNodeRuntimeRepository(),
    sessionService: createLocalSessionRuntime(),
  });

export const GET = aiGenerationKnowledgeNodeOptionsRouteHandlers.collection.GET;
