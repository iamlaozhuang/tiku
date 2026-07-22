import { createAdminAiGenerationTaskCancelRouteHandler } from "@/server/services/admin-ai-generation-local-contract-route";

export const POST =
  createAdminAiGenerationTaskCancelRouteHandler("organization");
