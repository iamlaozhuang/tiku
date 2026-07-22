import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const handlers = createRagResourceKnowledgeRuntimeRouteHandlers();

export const GET = handlers.resources.download.GET;
