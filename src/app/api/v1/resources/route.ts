import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const ragResourceKnowledgeRuntimeRouteHandlers =
  createRagResourceKnowledgeRuntimeRouteHandlers();

export const GET =
  ragResourceKnowledgeRuntimeRouteHandlers.resources.collection.GET;
