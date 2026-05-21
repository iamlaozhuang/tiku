import type { ModelConfigSnapshot } from "@/server/models/ai-rag";

export type MockLearningSuggestionInput = {
  rawPrompt: string;
  rawAnswer: string;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: {
    promptTemplateKey: string;
    version: number;
    templateHash: string;
  };
};

export type MockLearningSuggestionResult = {
  learningSuggestion: string;
  providerRequestPayload: unknown;
  providerResponsePayload: unknown;
  promptTokenCount: number;
  completionTokenCount: number;
  totalTokenCount: number;
  latencyMs: number;
};

export type MockAiProvider = {
  generateLearningSuggestion(
    input: MockLearningSuggestionInput,
  ): Promise<MockLearningSuggestionResult>;
};

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

export function createMockAiProvider(): MockAiProvider {
  return {
    async generateLearningSuggestion(input) {
      const promptTokenCount =
        estimateTokenCount(input.rawPrompt) +
        estimateTokenCount(input.rawAnswer);
      const completionTokenCount = 24;
      const learningSuggestion =
        "本地模拟学习建议：复盘错题对应知识点，先回看标准答案结构，再完成一次同类题训练。";

      return {
        learningSuggestion,
        providerRequestPayload: {
          apiKey: "sk-real-secret",
          model: input.modelConfigSnapshot.modelName,
          prompt: input.rawPrompt,
          answer: input.rawAnswer,
          templateHash: input.promptTemplate.templateHash,
        },
        providerResponsePayload: {
          output: learningSuggestion,
          requestId: "mock-ai-request-dev-001",
        },
        promptTokenCount,
        completionTokenCount,
        totalTokenCount: promptTokenCount + completionTokenCount,
        latencyMs: 1000,
      };
    },
  };
}
