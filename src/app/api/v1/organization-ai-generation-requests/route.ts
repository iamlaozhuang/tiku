import { createAdminAiGenerationLocalContractRouteHandlers } from "@/server/services/admin-ai-generation-local-contract-route";

const organizationAiGenerationRequestRouteHandlers =
  createAdminAiGenerationLocalContractRouteHandlers("organization");

export const GET = organizationAiGenerationRequestRouteHandlers.collection.GET;
export const POST =
  organizationAiGenerationRequestRouteHandlers.collection.POST;
