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
import {
  LearningSuggestionInputIntegrityError,
  serializeLearningSuggestionProviderVariables,
  type LearningSuggestionInput,
} from "./learning-suggestion-input";

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
  mockExamPublicId: string | null;
  learningSuggestionInput: LearningSuggestionInput;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiMockProviderPromptTemplateSnapshot;
  startedAt?: Date;
  signal?: AbortSignal;
  hardTimeoutMs: 30_000;
};

export class LearningSuggestionRuntimeTimeoutError extends Error {
  constructor() {
    super("Learning suggestion Provider timed out.");
    this.name = "LearningSuggestionRuntimeTimeoutError";
  }
}

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
      context.signal?.throwIfAborted();
      if (
        context.modelConfigSnapshot.aiFuncType !== "learning_suggestion" ||
        context.promptTemplate.promptTemplateKey !== "learning_suggestion_v1" ||
        context.promptTemplate.version !== 1 ||
        context.promptTemplate.templateHash !==
          "learning_suggestion_v1_baseline"
      ) {
        throw new LearningSuggestionInputIntegrityError();
      }
      const startedAt = context.startedAt ?? now();
      const providerVariables = serializeLearningSuggestionProviderVariables(
        context.learningSuggestionInput,
      );
      const providerAbortController = new AbortController();
      const abortFromCaller = () => providerAbortController.abort();
      context.signal?.addEventListener("abort", abortFromCaller, {
        once: true,
      });
      if (context.signal?.aborted) {
        providerAbortController.abort();
      }
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new LearningSuggestionRuntimeTimeoutError());
          providerAbortController.abort();
        }, context.hardTimeoutMs);
        providerAbortController.signal.addEventListener(
          "abort",
          () => {
            if (context.signal?.aborted) {
              reject(
                context.signal.reason ??
                  new Error("Learning suggestion Provider was aborted."),
              );
            }
          },
          { once: true },
        );
      });
      let providerResult: Awaited<
        ReturnType<MockAiProvider["generateLearningSuggestion"]>
      >;
      try {
        providerResult = await Promise.race([
          options.provider.generateLearningSuggestion({
            rawPrompt: providerVariables,
            rawAnswer: "",
            modelConfigSnapshot: context.modelConfigSnapshot,
            promptTemplate: context.promptTemplate,
            signal: providerAbortController.signal,
          }),
          timeoutPromise,
        ]);
      } finally {
        if (timeoutHandle !== undefined) {
          clearTimeout(timeoutHandle);
        }
        context.signal?.removeEventListener("abort", abortFromCaller);
      }
      context.signal?.throwIfAborted();
      const completedAt = now();
      const redactedSnapshots = createAiCallLogRedactedSnapshots({
        prompt: {
          promptTemplateKey: context.promptTemplate.promptTemplateKey,
          promptTemplateVersion: context.promptTemplate.version,
          templateHash: context.promptTemplate.templateHash,
          questionPublicId: null,
          answerRecordPublicId: null,
        },
        userAnswer: "",
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
        answerRecordPublicId: null,
        mockExamPublicId: context.mockExamPublicId,
        questionPublicId: null,
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
        observation: providerResult.observation,
        startedAt,
        completedAt,
      } satisfies AppendAiCallLogInput;
      context.signal?.throwIfAborted();
      const aiCallLog =
        await options.aiCallLogRepository.appendAiCallLog(aiCallLogInput);

      context.signal?.throwIfAborted();

      return {
        learningSuggestion: providerResult.learningSuggestion,
        aiCallLog,
      };
    },
  };
}
