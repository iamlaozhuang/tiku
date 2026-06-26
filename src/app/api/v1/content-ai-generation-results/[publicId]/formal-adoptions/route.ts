import { createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers } from "@/server/services/admin-ai-generation-formal-adoption-runtime";

const contentAiGenerationFormalAdoptionRouteHandlers =
  createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers();

export const POST =
  contentAiGenerationFormalAdoptionRouteHandlers.formalAdoptions.POST;
