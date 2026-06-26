import { createAdminAiGenerationLocalContractRouteHandlers } from "@/server/services/admin-ai-generation-local-contract-route";

const organizationAiGenerationRequestRouteHandlers =
  createAdminAiGenerationLocalContractRouteHandlers("organization");

export const POST =
  organizationAiGenerationRequestRouteHandlers.collection.POST;
