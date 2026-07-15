export type ModelProviderSecretWriteInput = {
  providerKey: string;
  secretValue: string;
};

export type ModelProviderSecretWriteResult = {
  apiKeySecretRef: string;
};

export type ModelProviderSecretStore = {
  write(
    input: ModelProviderSecretWriteInput,
  ): Promise<ModelProviderSecretWriteResult>;
};

export type PreparedModelProviderSecretWrite = {
  apiKeySecretRef: string;
  apiKeyLastFour: string;
  secretStatus: "configured";
  lastRotatedAt: Date;
};

export class ModelProviderSecretStoreUnavailableError extends Error {
  constructor() {
    super("Protected model_provider secret storage is unavailable.");
    this.name = "ModelProviderSecretStoreUnavailableError";
  }
}

function normalizeOpaqueSecretReference(
  value: unknown,
  rawSecret: string,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (
    normalizedValue.length === 0 ||
    normalizedValue === rawSecret ||
    normalizedValue.includes(rawSecret)
  ) {
    return null;
  }

  return normalizedValue;
}

export async function prepareModelProviderSecretWrite(input: {
  providerKey: string;
  secretValue: string;
  secretStore: ModelProviderSecretStore | null;
  now: Date;
}): Promise<PreparedModelProviderSecretWrite> {
  if (input.secretStore === null) {
    throw new ModelProviderSecretStoreUnavailableError();
  }

  const result = await input.secretStore.write({
    providerKey: input.providerKey,
    secretValue: input.secretValue,
  });
  const apiKeySecretRef = normalizeOpaqueSecretReference(
    result.apiKeySecretRef,
    input.secretValue,
  );

  if (apiKeySecretRef === null) {
    throw new ModelProviderSecretStoreUnavailableError();
  }

  return {
    apiKeySecretRef,
    apiKeyLastFour: input.secretValue.slice(-4),
    secretStatus: "configured",
    lastRotatedAt: input.now,
  };
}
