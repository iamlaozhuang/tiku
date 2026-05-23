import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const ragResourceKnowledgeRuntimeRouteHandlers =
  createRagResourceKnowledgeRuntimeRouteHandlers();

export const PATCH =
  ragResourceKnowledgeRuntimeRouteHandlers.knowledgeNodes.detail.PATCH;
