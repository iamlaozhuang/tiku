import type {
  ModelConfigConnectionTestDto,
  ModelConfigSummaryDto,
} from "../contracts/admin-ai-audit-log-ops-contract";

export type ModelConfigConnectionTestExecutorInput = {
  apiKeySecretRef: string;
  modelConfig: {
    publicId: string;
    providerKey: string;
    modelName: string;
    timeoutSecond: number;
  };
  syntheticPayload: {
    kind: "model_config_health_check";
    containsUserData: false;
    containsRawPrompt: false;
  };
};

export type ModelConfigConnectionTestExecutor = {
  execute(input: ModelConfigConnectionTestExecutorInput): Promise<{
    status: "succeeded" | "failed";
    durationMs: number;
  }>;
};

function createResult(
  input: Pick<
    ModelConfigConnectionTestDto,
    "status" | "durationMs" | "failureCategory"
  > & {
    actorPublicId: string;
    modelConfigPublicId: string;
    now: Date;
  },
): ModelConfigConnectionTestDto {
  return {
    modelConfigPublicId: input.modelConfigPublicId,
    status: input.status,
    testedAt: input.now.toISOString(),
    testedByPublicId: input.actorPublicId,
    durationMs: input.durationMs,
    failureCategory: input.failureCategory,
    redactionStatus: "redacted",
    actionType: "model_config_health_check",
    requestBodyStored: false,
    responseBodyStored: false,
    providerPayloadStored: false,
    rawPromptStored: false,
    rawUserDataStored: false,
    modelDisabledByTest: false,
  };
}

export async function runModelConfigConnectionTest(input: {
  actorPublicId: string;
  modelConfig: ModelConfigSummaryDto;
  apiKeySecretRef: string | null;
  executor: ModelConfigConnectionTestExecutor | null;
  now: Date;
}): Promise<ModelConfigConnectionTestDto> {
  if (input.apiKeySecretRef === null) {
    return createResult({
      actorPublicId: input.actorPublicId,
      modelConfigPublicId: input.modelConfig.publicId,
      now: input.now,
      status: "missing_secret",
      durationMs: 0,
      failureCategory: "missing_secret",
    });
  }

  if (!input.modelConfig.isEnabled || input.modelConfig.status !== "enabled") {
    return createResult({
      actorPublicId: input.actorPublicId,
      modelConfigPublicId: input.modelConfig.publicId,
      now: input.now,
      status: "failed",
      durationMs: 0,
      failureCategory: "model_config_incomplete",
    });
  }

  if (input.executor === null) {
    return createResult({
      actorPublicId: input.actorPublicId,
      modelConfigPublicId: input.modelConfig.publicId,
      now: input.now,
      status: "failed",
      durationMs: 0,
      failureCategory: "provider_adapter_unavailable",
    });
  }

  try {
    const result = await input.executor.execute({
      apiKeySecretRef: input.apiKeySecretRef,
      modelConfig: {
        publicId: input.modelConfig.publicId,
        providerKey: input.modelConfig.providerKey,
        modelName: input.modelConfig.modelName,
        timeoutSecond: input.modelConfig.timeoutSecond,
      },
      syntheticPayload: {
        kind: "model_config_health_check",
        containsUserData: false,
        containsRawPrompt: false,
      },
    });
    const succeeded = result.status === "succeeded";

    return createResult({
      actorPublicId: input.actorPublicId,
      modelConfigPublicId: input.modelConfig.publicId,
      now: input.now,
      status: succeeded ? "succeeded" : "failed",
      durationMs:
        Number.isFinite(result.durationMs) && result.durationMs >= 0
          ? result.durationMs
          : 0,
      failureCategory: succeeded ? "none" : "synthetic_health_check_failed",
    });
  } catch {
    return createResult({
      actorPublicId: input.actorPublicId,
      modelConfigPublicId: input.modelConfig.publicId,
      now: input.now,
      status: "failed",
      durationMs: 0,
      failureCategory: "synthetic_health_check_failed",
    });
  }
}
