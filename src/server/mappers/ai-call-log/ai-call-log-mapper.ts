import {
  AI_CALL_LOG_RETENTION_DAY,
  type AiCallLogDailySummaryDto,
  type AiCallLogDto,
  type AiCallLogRecord,
  type AiCallLogRetentionDto,
} from "@/server/contracts/ai-call-log/log-governance-contract";

export function mapAiCallLogRecordToDto(
  aiCallLog: AiCallLogRecord,
): AiCallLogDto {
  return {
    aiFuncType: aiCallLog.aiFuncType,
    callStatus: aiCallLog.callStatus,
    completedAt: aiCallLog.completedAt,
    completionTokenCount: aiCallLog.completionTokenCount,
    estimatedCostCny: aiCallLog.estimatedCostCny,
    evidenceStatus: aiCallLog.evidenceStatus,
    latencyMs: aiCallLog.latencyMs,
    level: aiCallLog.level,
    modelAlias: aiCallLog.modelAlias,
    organizationPublicId: aiCallLog.organizationPublicId,
    outputSummary: aiCallLog.outputSummary,
    profession: aiCallLog.profession,
    promptSummary: aiCallLog.promptSummary,
    promptTokenCount: aiCallLog.promptTokenCount,
    providerDisplayName: aiCallLog.providerDisplayName,
    publicId: aiCallLog.publicId,
    redactionStatus: "redacted",
    retention: createAiCallLogRetentionDto(),
    startedAt: aiCallLog.startedAt,
    totalTokenCount: aiCallLog.totalTokenCount,
    userPublicId: aiCallLog.userPublicId,
    visibility: "summary_only",
  };
}

export function createAiCallLogRetentionDto(): AiCallLogRetentionDto {
  return {
    retentionDay: AI_CALL_LOG_RETENTION_DAY,
    retentionSource: "advanced_ops_config_contract",
  };
}

export function summarizeAiCallLogRecords(
  aiCallLogs: AiCallLogRecord[],
): AiCallLogDailySummaryDto[] {
  const summaryByKey = aiCallLogs.reduce<
    Record<string, AiCallLogDailySummaryDto>
  >((summaries, aiCallLog) => {
    const bucket = aiCallLog.startedAt.slice(0, 10);
    const summaryKey = [
      bucket,
      aiCallLog.aiFuncType,
      aiCallLog.providerDisplayName,
      aiCallLog.modelAlias,
    ].join("|");
    const existingSummary = summaries[summaryKey] ?? {
      aiFuncType: aiCallLog.aiFuncType,
      bucket,
      bucketType: "day" as const,
      callCount: 0,
      estimatedCostCny: "0.00",
      evidenceStatusCounts: {
        none: 0,
        sufficient: 0,
        weak: 0,
      },
      failedCount: 0,
      modelAlias: aiCallLog.modelAlias,
      providerDisplayName: aiCallLog.providerDisplayName,
      successCount: 0,
      totalTokenCount: 0,
    };
    const estimatedCostTotal =
      Number(existingSummary.estimatedCostCny) +
      Number(aiCallLog.estimatedCostCny ?? "0");

    return {
      ...summaries,
      [summaryKey]: {
        ...existingSummary,
        callCount: existingSummary.callCount + 1,
        estimatedCostCny: estimatedCostTotal.toFixed(2),
        evidenceStatusCounts: {
          ...existingSummary.evidenceStatusCounts,
          [aiCallLog.evidenceStatus]:
            existingSummary.evidenceStatusCounts[aiCallLog.evidenceStatus] + 1,
        },
        failedCount:
          existingSummary.failedCount +
          (aiCallLog.callStatus === "failed" ? 1 : 0),
        successCount:
          existingSummary.successCount +
          (aiCallLog.callStatus === "success" ? 1 : 0),
        totalTokenCount:
          existingSummary.totalTokenCount + (aiCallLog.totalTokenCount ?? 0),
      },
    };
  }, {});

  return Object.values(summaryByKey);
}
