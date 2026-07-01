import { createAdminAiGenerationLocalContractRouteHandlers } from "@/server/services/admin-ai-generation-local-contract-route";
import { createOwnerPreviewQwenAdminRuntimeBridgeControl } from "@/server/services/owner-preview-qwen-visible-ai-runtime-control";

const contentAiGenerationRequestRouteHandlers =
  createAdminAiGenerationLocalContractRouteHandlers("content", {
    runtimeBridgeControl: createOwnerPreviewQwenAdminRuntimeBridgeControl(),
  });

export const GET = contentAiGenerationRequestRouteHandlers.collection.GET;
export const POST = contentAiGenerationRequestRouteHandlers.collection.POST;
