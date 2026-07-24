import {
  AI_CALL_LOG_RETENTION_DAY,
  type AiCallLogDailySummaryDto,
  type AiCallLogDto,
  type AiCallLogRecord,
  type AiCallLogRetentionDto,
} from "@/server/contracts/ai-call-log/log-governance-contract";
import { normalizeAiCallObservation } from "@/server/services/ai-call-observation";

type AiCallLogSummaryAccumulator = AiCallLogDailySummaryDto & {
  providerReportedCostMicros: string;
  providerReportedCostUnavailable: boolean;
  providerReportedObservationCount: number;
  estimatedCostMicros: string;
  estimatedCostUnavailable: boolean;
  estimatedObservationCount: number;
};

export function mapAiCallLogRecordToDto(
  aiCallLog: AiCallLogRecord,
): AiCallLogDto {
  const observation = readAiCallLogRecordObservation(aiCallLog);
  return {
    aiFuncType: aiCallLog.aiFuncType,
    callStatus: aiCallLog.callStatus,
    completedAt: aiCallLog.completedAt,
    completionTokenCount: observation.completionTokenCount,
    estimatedCostCny: aiCallLog.estimatedCostCny,
    evidenceStatus: aiCallLog.evidenceStatus,
    latencyMs: observation.latencyMs,
    observationSchemaVersion: observation.observationSchemaVersion,
    tokenCountSource: observation.tokenCountSource,
    tokenEstimationMethod: observation.tokenEstimationMethod,
    latencySource: observation.latencySource,
    level: aiCallLog.level,
    modelAlias: aiCallLog.modelAlias,
    organizationPublicId: aiCallLog.organizationPublicId,
    outputSummary: aiCallLog.outputSummary,
    profession: aiCallLog.profession,
    promptSummary: aiCallLog.promptSummary,
    promptTokenCount: observation.promptTokenCount,
    providerDisplayName: aiCallLog.providerDisplayName,
    publicId: aiCallLog.publicId,
    redactionStatus: "redacted",
    retention: createAiCallLogRetentionDto(),
    startedAt: aiCallLog.startedAt,
    totalTokenCount: observation.totalTokenCount,
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
  const summaryByKey = new Map<string, AiCallLogSummaryAccumulator>();

  for (const aiCallLog of aiCallLogs) {
    const observation = readAiCallLogRecordObservation(aiCallLog);
    const bucket = aiCallLog.startedAt.slice(0, 10);
    const summaryKey = [
      bucket,
      aiCallLog.aiFuncType,
      aiCallLog.providerDisplayName,
      aiCallLog.modelAlias,
    ].join("|");
    const existingSummary = summaryByKey.get(summaryKey) ?? {
      aiFuncType: aiCallLog.aiFuncType,
      bucket,
      bucketType: "day" as const,
      callCount: 0,
      providerReportedTokenDerivedCostCny: null,
      estimatedTokenDerivedCostCny: null,
      evidenceStatusCounts: {
        none: 0,
        sufficient: 0,
        weak: 0,
      },
      failedCount: 0,
      modelAlias: aiCallLog.modelAlias,
      providerDisplayName: aiCallLog.providerDisplayName,
      successCount: 0,
      providerReportedTokenCount: 0,
      estimatedTokenCount: 0,
      unavailableObservationCount: 0,
      legacyObservationCount: 0,
      providerReportedCostMicros: "0",
      providerReportedCostUnavailable: false,
      providerReportedObservationCount: 0,
      estimatedCostMicros: "0",
      estimatedCostUnavailable: false,
      estimatedObservationCount: 0,
    };
    const tokenCountSource = observation.tokenCountSource;
    const isProviderReported = tokenCountSource === "provider_reported";
    const isEstimated = tokenCountSource === "estimated";

    existingSummary.callCount += 1;
    existingSummary.evidenceStatusCounts[aiCallLog.evidenceStatus] += 1;
    existingSummary.failedCount += aiCallLog.callStatus === "failed" ? 1 : 0;
    existingSummary.successCount += aiCallLog.callStatus === "success" ? 1 : 0;
    existingSummary.unavailableObservationCount +=
      tokenCountSource === "unavailable" ? 1 : 0;
    existingSummary.legacyObservationCount +=
      tokenCountSource === "legacy" ? 1 : 0;

    if (isProviderReported) {
      existingSummary.providerReportedObservationCount += 1;
      existingSummary.providerReportedTokenCount = addSafeTokenCounts(
        existingSummary.providerReportedTokenCount,
        requireMeasuredTotalTokenCount(observation),
      );
      const costMicros = parseOptionalCostMicros(aiCallLog.estimatedCostCny);
      existingSummary.providerReportedCostUnavailable ||= costMicros === null;
      existingSummary.providerReportedCostMicros = addDecimalDigitStrings(
        existingSummary.providerReportedCostMicros,
        costMicros ?? "0",
      );
    }
    if (isEstimated) {
      existingSummary.estimatedObservationCount += 1;
      existingSummary.estimatedTokenCount = addSafeTokenCounts(
        existingSummary.estimatedTokenCount,
        requireMeasuredTotalTokenCount(observation),
      );
      const costMicros = parseOptionalCostMicros(aiCallLog.estimatedCostCny);
      existingSummary.estimatedCostUnavailable ||= costMicros === null;
      existingSummary.estimatedCostMicros = addDecimalDigitStrings(
        existingSummary.estimatedCostMicros,
        costMicros ?? "0",
      );
    }
    if (
      tokenCountSource === "unavailable" &&
      aiCallLog.estimatedCostCny !== null
    ) {
      throw new Error("Unavailable AI call observation cannot carry cost.");
    }

    summaryByKey.set(summaryKey, existingSummary);
  }

  return Array.from(summaryByKey.values(), (summary) => ({
    aiFuncType: summary.aiFuncType,
    bucket: summary.bucket,
    bucketType: summary.bucketType,
    callCount: summary.callCount,
    providerReportedTokenDerivedCostCny:
      summary.providerReportedCostUnavailable ||
      summary.providerReportedObservationCount === 0
        ? null
        : formatCostMicros(summary.providerReportedCostMicros),
    estimatedTokenDerivedCostCny:
      summary.estimatedCostUnavailable ||
      summary.estimatedObservationCount === 0
        ? null
        : formatCostMicros(summary.estimatedCostMicros),
    evidenceStatusCounts: summary.evidenceStatusCounts,
    failedCount: summary.failedCount,
    modelAlias: summary.modelAlias,
    providerDisplayName: summary.providerDisplayName,
    successCount: summary.successCount,
    providerReportedTokenCount: summary.providerReportedTokenCount,
    estimatedTokenCount: summary.estimatedTokenCount,
    unavailableObservationCount: summary.unavailableObservationCount,
    legacyObservationCount: summary.legacyObservationCount,
  }));
}

function readAiCallLogRecordObservation(aiCallLog: AiCallLogRecord): {
  observationSchemaVersion: 1 | null;
  tokenCountSource: NonNullable<AiCallLogRecord["tokenCountSource"]>;
  tokenEstimationMethod: "canonical_json_unicode_code_point_ceiling_v1" | null;
  latencySource: NonNullable<AiCallLogRecord["latencySource"]>;
  promptTokenCount: number | null;
  completionTokenCount: number | null;
  totalTokenCount: number | null;
  latencyMs: number | null;
} {
  const observationSchemaVersion = aiCallLog.observationSchemaVersion ?? null;
  const tokenCountSource = aiCallLog.tokenCountSource ?? "legacy";
  const tokenEstimationMethod = aiCallLog.tokenEstimationMethod ?? null;
  const latencySource = aiCallLog.latencySource ?? "legacy";
  if (
    observationSchemaVersion === null &&
    tokenCountSource === "legacy" &&
    tokenEstimationMethod === null &&
    latencySource === "legacy"
  ) {
    return {
      observationSchemaVersion,
      tokenCountSource,
      tokenEstimationMethod,
      latencySource,
      promptTokenCount: aiCallLog.promptTokenCount,
      completionTokenCount: aiCallLog.completionTokenCount,
      totalTokenCount: aiCallLog.totalTokenCount,
      latencyMs: aiCallLog.latencyMs,
    };
  }

  const observation = normalizeAiCallObservation({
    schemaVersion: observationSchemaVersion,
    tokenSource: tokenCountSource,
    tokenEstimationMethod,
    promptTokenCount: aiCallLog.promptTokenCount,
    completionTokenCount: aiCallLog.completionTokenCount,
    totalTokenCount: aiCallLog.totalTokenCount,
    latencySource,
    latencyMs: aiCallLog.latencyMs,
  });
  if (
    observation.tokenSource === "unavailable" &&
    aiCallLog.estimatedCostCny !== null
  ) {
    throw new Error("Unavailable AI call observation cannot carry cost.");
  }
  if (aiCallLog.estimatedCostCny !== null) {
    parseOptionalCostMicros(aiCallLog.estimatedCostCny);
  }
  return {
    observationSchemaVersion: observation.schemaVersion,
    tokenCountSource: observation.tokenSource,
    tokenEstimationMethod: observation.tokenEstimationMethod,
    latencySource: observation.latencySource,
    promptTokenCount: observation.promptTokenCount,
    completionTokenCount: observation.completionTokenCount,
    totalTokenCount: observation.totalTokenCount,
    latencyMs: observation.latencyMs,
  };
}

function requireMeasuredTotalTokenCount(observation: {
  totalTokenCount: number | null;
}): number {
  if (observation.totalTokenCount === null) {
    throw new Error("Measured AI call observation is missing token usage.");
  }
  return observation.totalTokenCount;
}

function addSafeTokenCounts(left: number, right: number): number {
  const total = left + right;
  if (!Number.isSafeInteger(total)) {
    throw new Error("AI call token aggregate exceeds the safe integer range.");
  }
  return total;
}

function parseOptionalCostMicros(costCny: string | null): string | null {
  if (costCny === null) return null;
  const match = /^(0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/u.exec(costCny);
  if (match === null) {
    throw new Error("AI call token-derived cost is invalid.");
  }
  const integerPart = match[1];
  const fractionPart = (match[2] ?? "").padEnd(6, "0");
  return `${integerPart}${fractionPart}`.replace(/^0+(?=\d)/u, "");
}

function addDecimalDigitStrings(left: string, right: string): string {
  const width = Math.max(left.length, right.length);
  const paddedLeft = left.padStart(width, "0");
  const paddedRight = right.padStart(width, "0");
  let carry = 0;
  let result = "";
  for (let index = width - 1; index >= 0; index -= 1) {
    const sum = Number(paddedLeft[index]) + Number(paddedRight[index]) + carry;
    result = String(sum % 10) + result;
    carry = Math.floor(sum / 10);
  }
  return `${carry === 0 ? "" : String(carry)}${result}`.replace(
    /^0+(?=\d)/u,
    "",
  );
}

function formatCostMicros(costMicros: string): string {
  const paddedCost = costMicros.padStart(7, "0");
  const integerPart = paddedCost.slice(0, -6);
  const fractionPart = paddedCost.slice(-6);
  return `${integerPart}.${fractionPart}`;
}
