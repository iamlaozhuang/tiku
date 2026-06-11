import {
  createPersonalAiGenerationRequestRouteHandlers,
  createUnavailablePersonalAiGenerationRequestUserResolver,
} from "@/server/services/personal-ai-generation-request-route";

const personalAiGenerationRequestRouteHandlers =
  createPersonalAiGenerationRequestRouteHandlers(
    createUnavailablePersonalAiGenerationRequestUserResolver(),
  );

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = personalAiGenerationRequestRouteHandlers.collection.POST;
