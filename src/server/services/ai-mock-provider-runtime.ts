import type { MockAiProvider } from "@/ai/mock-provider";
import {
  createAiCallLogRedactedSnapshots,
  type ModelConfigSnapshot,
} from "../models/ai-rag";
import type {
  AdminAiAuditLogRuntimeRepositories,
  AppendAiCallLogInput,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import { createRedactedModelConfigRuntimeSnapshot } from "./model-config-runtime";

export type AiMockProviderPromptTemplateSnapshot = {
  promptTemplateKey: string;
  version: number;
  templateHash: string;
};

export type LearningSuggestionMockContext = {
  userPublicId: string;
  organizationPublicId?: string | null;
  profession?: AppendAiCallLogInput["profession"];
  level?: number | null;
  answerRecordPublicId: string | null;
  mockExamPublicId: string | null;
  questionPublicId: string | null;
  rawPrompt: string;
  rawAnswer: string;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiMockProviderPromptTemplateSnapshot;
  startedAt?: Date;
};

export type AiMockProviderRuntimeOptions = {
  provider: MockAiProvider;
  aiCallLogRepository: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "appendAiCallLog"
  >;
  now?: () => Date;
};

export function createAiMockProviderRuntime(
  options: AiMockProviderRuntimeOptions,
) {
  const now = options.now ?? (() => new Date());

  return {
    async generateLearningSuggestion(context: LearningSuggestionMockContext) {
      const startedAt = context.startedAt ?? now();
      const providerResult =
        await options.provider.generateLearningSuggestion(context);
      const completedAt = now();
      const redactedSnapshots = createAiCallLogRedactedSnapshots({
        prompt: {
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          templateHash: context.promptTemplate.templateHash,
          questionPublicId: context.questionPublicId,
          answerRecordPublicId: context.answerRecordPublicId,
        },
        userAnswer: context.rawAnswer,
        modelOutput: {
          learningSuggestion: providerResult.learningSuggestion,
        },
        citations: [],
        providerRequestPayload: {
          requestBody: JSON.stringify(providerResult.providerRequestPayload),
        },
        providerResponsePayload: {
          responseBody: JSON.stringify(providerResult.providerResponsePayload),
        },
        providerErrorPayload: null,
      });
      const aiCallLogInput = {
        userPublicId: context.userPublicId,
        organizationPublicId: context.organizationPublicId ?? null,
        profession: context.profession ?? null,
        level: context.level ?? null,
        answerRecordPublicId: context.answerRecordPublicId,
        mockExamPublicId: context.mockExamPublicId,
        questionPublicId: context.questionPublicId,
        aiFuncType: "learning_suggestion",
        callStatus: "success",
        modelConfigSnapshot: context.modelConfigSnapshot,
        promptTemplateKey: context.promptTemplate.promptTemplateKey,
        promptTemplateVersion: context.promptTemplate.version,
        requestRedactedSnapshot: {
          modelConfig: createRedactedModelConfigRuntimeSnapshot(
            context.modelConfigSnapshot,
            "local_fixture",
          ),
          prompt: redactedSnapshots.prompt,
          userAnswer: redactedSnapshots.userAnswer,
          providerRequestPayload: redactedSnapshots.providerRequestPayload,
        },
        responseRedactedSnapshot: {
          modelOutput: redactedSnapshots.modelOutput,
          providerResponsePayload: redactedSnapshots.providerResponsePayload,
        },
        errorRedactedSnapshot: null,
        citationRedactedSnapshot: {
          citations: redactedSnapshots.citations,
        },
        promptTokenCount: providerResult.promptTokenCount,
        completionTokenCount: providerResult.completionTokenCount,
        totalTokenCount: providerResult.totalTokenCount,
        latencyMs: providerResult.latencyMs,
        startedAt,
        completedAt,
      } satisfies AppendAiCallLogInput;
      const aiCallLog =
        await options.aiCallLogRepository.appendAiCallLog(aiCallLogInput);

      return {
        learningSuggestion: providerResult.learningSuggestion,
        aiCallLog,
      };
    },
  };
}
