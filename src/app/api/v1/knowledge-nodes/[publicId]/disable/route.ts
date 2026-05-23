import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const ragResourceKnowledgeRuntimeRouteHandlers =
  createRagResourceKnowledgeRuntimeRouteHandlers();

export const POST =
  ragResourceKnowledgeRuntimeRouteHandlers.knowledgeNodes.disable.POST;
