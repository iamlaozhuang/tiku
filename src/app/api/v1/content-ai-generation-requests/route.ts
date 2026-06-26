import { createAdminAiGenerationLocalContractRouteHandlers } from "@/server/services/admin-ai-generation-local-contract-route";

const contentAiGenerationRequestRouteHandlers =
  createAdminAiGenerationLocalContractRouteHandlers("content");

export const GET = contentAiGenerationRequestRouteHandlers.collection.GET;
export const POST = contentAiGenerationRequestRouteHandlers.collection.POST;
