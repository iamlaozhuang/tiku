import type { ModelConfigSnapshot } from "@/server/models/ai-rag";
import {
  createBlockedProviderExecutionGate,
  type AiProviderExecutionGate,
} from "@/server/contracts/ai/provider-redaction-contract";

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

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

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
      input.signal?.throwIfAborted();
      const promptTokenCount =
        estimateTokenCount(input.rawPrompt) +
        estimateTokenCount(input.rawAnswer);
      const completionTokenCount = 24;
      const learningSuggestion =
        "本地模拟学习建议：复盘错题对应知识点，先回看标准答案结构，再完成一次同类题训练。";
      input.signal?.throwIfAborted();

      return {
        learningSuggestion,
        providerExecutionGate: createBlockedProviderExecutionGate(),
        providerRequestPayload: createMockProviderRedactionReference(
          "request_redaction_boundary",
        ),
        providerResponsePayload: createMockProviderRedactionReference(
          "response_redaction_boundary",
        ),
        promptTokenCount,
        completionTokenCount,
        totalTokenCount: promptTokenCount + completionTokenCount,
        latencyMs: 1000,
      };
    },
  };
}
