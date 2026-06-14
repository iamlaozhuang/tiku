import { createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers } from "@/server/services/personal-ai-generation-formal-adoption-runtime";

const personalAiGenerationFormalAdoptionRuntimeRouteHandlers =
  createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers();

export const POST =
  personalAiGenerationFormalAdoptionRuntimeRouteHandlers.formalAdoptionReviews
    .POST;
