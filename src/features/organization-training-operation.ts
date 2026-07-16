export type PendingOrganizationTrainingOperation = {
  operationId: string;
  signature: string;
};

export function resolvePendingOrganizationTrainingOperationId(
  operations: Map<string, PendingOrganizationTrainingOperation>,
  key: string,
  signature: string,
): string {
  const existing = operations.get(key);

  if (existing?.signature === signature) {
    return existing.operationId;
  }

  const operationId = globalThis.crypto.randomUUID();
  operations.set(key, { operationId, signature });
  return operationId;
}
