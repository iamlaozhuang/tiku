import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import {
  createPersonalAiGenerationRequestRouteHandlers,
  createPersonalAiGenerationRequestUserResolver,
} from "@/server/services/personal-ai-generation-request-route";

const personalAiGenerationRequestRouteHandlers =
  createPersonalAiGenerationRequestRouteHandlers(
    createPersonalAiGenerationRequestUserResolver(createLocalSessionRuntime()),
  );

export const POST = personalAiGenerationRequestRouteHandlers.collection.POST;
export const GET = personalAiGenerationRequestRouteHandlers.collection.GET;
