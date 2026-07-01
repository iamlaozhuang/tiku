import { createAdminAiGenerationLocalContractRouteHandlers } from "@/server/services/admin-ai-generation-local-contract-route";
import { createOwnerPreviewQwenAdminRuntimeBridgeControl } from "@/server/services/owner-preview-qwen-visible-ai-runtime-control";

const organizationAiGenerationRequestRouteHandlers =
  createAdminAiGenerationLocalContractRouteHandlers("organization", {
    runtimeBridgeControl: createOwnerPreviewQwenAdminRuntimeBridgeControl(),
  });

export const GET = organizationAiGenerationRequestRouteHandlers.collection.GET;
export const POST =
  organizationAiGenerationRequestRouteHandlers.collection.POST;
