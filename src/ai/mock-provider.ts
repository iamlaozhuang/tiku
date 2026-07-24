import type { ModelConfigSnapshot } from "@/server/models/ai-rag";
import {
  createBlockedProviderExecutionGate,
  type AiProviderExecutionGate,
} from "@/server/contracts/ai/provider-redaction-contract";
import {
  createEstimatedAiCallObservation,
  measureClientObservedLatency,
  type AiCallObservation,
} from "@/server/services/ai-call-observation";

export type MockLearningSuggestionInput = {
  rawPrompt: string;
  rawAnswer: string;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: {
    promptTemplateKey: string;
    version: number;
    templateHash: string;
  };
  signal?: AbortSignal;
  monotonicNow?: () => number;
};

export type MockLearningSuggestionResult = {
  learningSuggestion: string;
  providerExecutionGate?: AiProviderExecutionGate;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  promptTokenCount: number;
  completionTokenCount: number;
  totalTokenCount: number;
  latencyMs: number;
  observation: AiCallObservation;
};

type MockProviderRedactionReference = {
  referenceKind: "request_redaction_boundary" | "response_redaction_boundary";
  redactionStatus: "redacted";
  summary: string;
};

export type MockAiProvider = {
  generateLearningSuggestion(
    input: MockLearningSuggestionInput,
  ): Promise<MockLearningSuggestionResult>;
};

function createMockProviderRedactionReference(
  referenceKind: MockProviderRedactionReference["referenceKind"],
): MockProviderRedactionReference {
  return {
    referenceKind,
    redactionStatus: "redacted",
    summary:
      referenceKind === "request_redaction_boundary"
        ? "redacted provider request"
        : "redacted provider response",
  };
}

export function createMockAiProvider(): MockAiProvider {
  return {
    async generateLearningSuggestion(input) {
      const monotonicNow = input.monotonicNow ?? (() => performance.now());
      const startedMonotonicMs = monotonicNow();
      input.signal?.throwIfAborted();
      const learningSuggestion =
        "本地模拟学习建议：复盘错题对应知识点，先回看标准答案结构，再完成一次同类题训练。";
      input.signal?.throwIfAborted();
      const observation = createEstimatedAiCallObservation({
        request: {
          rawPrompt: input.rawPrompt,
          rawAnswer: input.rawAnswer,
          modelConfigSnapshot: input.modelConfigSnapshot,
          promptTemplate: input.promptTemplate,
        },
        response: { learningSuggestion },
        latency: {
          source: "client_observed",
          latencyMs: measureClientObservedLatency(
            startedMonotonicMs,
            monotonicNow(),
          ),
        },
      });

      return {
        learningSuggestion,
        providerExecutionGate: createBlockedProviderExecutionGate(),
        providerRequestPayload: createMockProviderRedactionReference(
          "request_redaction_boundary",
        ),
        providerResponsePayload: createMockProviderRedactionReference(
          "response_redaction_boundary",
        ),
        promptTokenCount: observation.promptTokenCount,
        completionTokenCount: observation.completionTokenCount,
        totalTokenCount: observation.totalTokenCount,
        latencyMs: observation.latencyMs,
        observation,
      };
    },
  };
}
