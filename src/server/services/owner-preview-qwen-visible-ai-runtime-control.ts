import type { AdminAiGenerationRuntimeBridgeControl } from "./admin-ai-generation-local-contract-route";
import type { PersonalAiGenerationRuntimeBridgeControl } from "./personal-ai-generation-runtime-bridge-service";
import { qwenRouteIntegratedProviderLimits } from "./route-integrated-provider-execution-service";

type RuntimeEnv = Partial<
  Pick<NodeJS.ProcessEnv, "ALIBABA_API_KEY" | "NODE_ENV">
>;

function isOwnerPreviewQwenRuntimeEnabled(env: RuntimeEnv): boolean {
  return env.NODE_ENV !== "production";
}

function readAlibabaApiKeyFromRuntimeEnv(env: RuntimeEnv): string | null {
  const credential = env.ALIBABA_API_KEY;

  return typeof credential === "string" && credential.trim().length > 0
    ? credential.trim()
    : null;
}

export function createOwnerPreviewQwenPersonalRuntimeBridgeControl(
  env: RuntimeEnv = process.env,
): PersonalAiGenerationRuntimeBridgeControl | undefined {
  if (!isOwnerPreviewQwenRuntimeEnabled(env)) {
    return undefined;
  }

  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: qwenRouteIntegratedProviderLimits.maxRequests,
      maxRetries: qwenRouteIntegratedProviderLimits.maxRetries,
      maxOutputTokens: qwenRouteIntegratedProviderLimits.maxOutputTokens,
      timeoutMs: qwenRouteIntegratedProviderLimits.timeoutMs,
      readProviderCredential: () => readAlibabaApiKeyFromRuntimeEnv(env),
    },
  };
}

export function createOwnerPreviewQwenAdminRuntimeBridgeControl(
  env: RuntimeEnv = process.env,
): AdminAiGenerationRuntimeBridgeControl | undefined {
  if (!isOwnerPreviewQwenRuntimeEnabled(env)) {
    return undefined;
  }

  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: qwenRouteIntegratedProviderLimits.maxRequests,
      maxRetries: qwenRouteIntegratedProviderLimits.maxRetries,
      maxOutputTokens: qwenRouteIntegratedProviderLimits.maxOutputTokens,
      timeoutMs: qwenRouteIntegratedProviderLimits.timeoutMs,
      readProviderCredential: () => readAlibabaApiKeyFromRuntimeEnv(env),
    },
  };
}
