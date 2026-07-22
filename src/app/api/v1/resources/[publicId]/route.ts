import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const ragResourceKnowledgeRuntimeRouteHandlers =
  createRagResourceKnowledgeRuntimeRouteHandlers();

export const GET =
  ragResourceKnowledgeRuntimeRouteHandlers.resources.detail.GET;
export const PATCH =
  ragResourceKnowledgeRuntimeRouteHandlers.resources.detail.PATCH;
export const DELETE =
  ragResourceKnowledgeRuntimeRouteHandlers.resources.detail.DELETE;
