export type AiProviderPayloadKind = "provider_request" | "provider_response";

export type AiProviderPayloadRedactionStatus = "redacted";

export type AiProviderPayloadEnvelope = {
  payloadKind: AiProviderPayloadKind;
  redactionStatus: AiProviderPayloadRedactionStatus;
  summary: string;
};

export type AiProviderExecutionGate = {
  gate: "provider_execution";
  status: "blocked";
  reason: "provider_request_requires_fresh_approval";
};

export function createRedactedProviderPayloadEnvelope(
  payloadKind: AiProviderPayloadKind,
): AiProviderPayloadEnvelope {
  return {
    payloadKind,
    redactionStatus: "redacted",
    summary:
      payloadKind === "provider_request"
        ? "redacted provider request payload"
        : "redacted provider response payload",
  };
}

export function createBlockedProviderExecutionGate(): AiProviderExecutionGate {
  return {
    gate: "provider_execution",
    reason: "provider_request_requires_fresh_approval",
    status: "blocked",
  };
}
