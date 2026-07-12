import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { createAiGenerationAvailabilityRouteHandlers } from "@/server/services/ai-generation-availability-route";
import { createOwnerPreviewQwenAdminRuntimeBridgeControl } from "@/server/services/owner-preview-qwen-visible-ai-runtime-control";

const aiGenerationAvailabilityRouteHandlers =
  createAiGenerationAvailabilityRouteHandlers({
    runtimeBridgeControl: createOwnerPreviewQwenAdminRuntimeBridgeControl(),
    sessionService: createLocalSessionRuntime(),
  });

export const GET = aiGenerationAvailabilityRouteHandlers.collection.GET;
