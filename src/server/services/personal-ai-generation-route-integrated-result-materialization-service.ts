import type { ApiResponse } from "../contracts/api-response";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import type {
  PersonalAiGenerationResultPaperAssemblySnapshotDto,
  PersonalAiGenerationResultPersistenceDto,
} from "../contracts/personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto } from "../contracts/personal-ai-generation-runtime-bridge-contract";
import type { EvidenceStatus, RedactedJsonObject } from "../models/ai-rag";
import {
  isPersonalAiGenerationResultTaskType,
  type PersonalAiGenerationResultPersistenceInput,
  type PersonalAiGenerationResultOwnerType,
} from "../models/personal-ai-generation-result";

export type PersonalAiGenerationRouteIntegratedResultMaterializationControl = {
  materializationMode: "fake_sanitized_in_memory_output";
  resultPublicId: string;
  contentDigest: string;
  contentPreviewMasked: string;
  paperAssemblyRedactedSnapshot?: PersonalAiGenerationResultPaperAssemblySnapshotDto | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  citationRedactedSnapshot?: RedactedJsonObject | null;
  aiCallLogPublicId?: string;
  now?: () => Date;
  persistDraftResult: (
    input: PersonalAiGenerationResultPersistenceInput,
  ) => Promise<ApiResponse<PersonalAiGenerationResultPersistenceDto | null>>;
};

const forbiddenMaterializationEvidenceTokens = [
  "apiKey",
  "authorizationHeader",
  "secret",
  "token",
  "databaseUrl",
  "rawPrompt",
  "rawResponse",
  "providerPayload",
  "providerResponse",
  "providerError",
  "modelOutputPayload",
] as const;

export function createDefaultBlockedRouteIntegratedResultMaterializationSummary(
  failureCategory: Exclude<
    PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto["failureCategory"],
    null
  > = "not_requested",
): PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto {
  return {
    materializationStatus: "not_requested",
    failureCategory,
    resultPublicId: null,
    contentDigest: null,
    contentPreviewMasked: null,
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    evidenceStatus: "none",
    citationCount: 0,
    formalAdoptionStatus: "blocked",
  };
}

export async function materializeRouteIntegratedRedactedResult(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  control: PersonalAiGenerationRouteIntegratedResultMaterializationControl,
): Promise<PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto> {
  if (
    !isPersonalAiGenerationResultTaskType(requestFlow.resultReference.taskType)
  ) {
    return createBlockedMaterializationSummary("unsupported_task_type");
  }

  const ownerType = resolvePersonalAiGenerationResultOwnerType(
    requestFlow.taskRequest.ownerType,
  );

  if (ownerType === null) {
    return createBlockedMaterializationSummary("unsupported_task_type");
  }

  if (control.aiCallLogPublicId === undefined) {
    return createBlockedMaterializationSummary("persistence_unavailable");
  }

  const persistenceInput: PersonalAiGenerationResultPersistenceInput = {
    resultPublicId: control.resultPublicId,
    taskPublicId: requestFlow.resultReference.taskPublicId,
    ownerType,
    ownerPublicId: requestFlow.taskRequest.ownerPublicId,
    actorPublicId: requestFlow.taskRequest.actorPublicId,
    taskType: requestFlow.resultReference.taskType,
    contentRedactedSnapshot: createContentRedactedSnapshot(
      requestFlow,
      control,
    ),
    contentDigest: control.contentDigest,
    contentPreviewMasked: control.contentPreviewMasked,
    paperAssemblyRedactedSnapshot:
      control.paperAssemblyRedactedSnapshot ?? null,
    citationRedactedSnapshot:
      control.citationRedactedSnapshot ??
      createEmptyCitationRedactedSnapshot(control),
    evidenceStatus: control.evidenceStatus,
    citationCount: control.citationCount,
    aiCallLogPublicId: control.aiCallLogPublicId,
    createdAt: control.now?.() ?? new Date(),
  };
  const optimisticSummary = createMaterializedSummary({
    materializationStatus: "created",
    resultPublicId: control.resultPublicId,
    contentDigest: control.contentDigest,
    contentPreviewMasked: control.contentPreviewMasked,
    evidenceStatus: control.evidenceStatus,
    citationCount: control.citationCount,
  });

  if (!isMaterializationEvidenceRedacted(persistenceInput, optimisticSummary)) {
    return createBlockedMaterializationSummary("redaction_violation");
  }

  const persistenceResponse =
    await control.persistDraftResult(persistenceInput);

  if (persistenceResponse.code !== 0 || persistenceResponse.data === null) {
    return createBlockedMaterializationSummary("persistence_unavailable");
  }

  return createMaterializedSummary({
    materializationStatus: persistenceResponse.data.persistenceStatus,
    resultPublicId: persistenceResponse.data.result.resultPublicId,
    contentDigest:
      persistenceResponse.data.result.contentReference.contentDigest,
    contentPreviewMasked:
      persistenceResponse.data.result.contentReference.contentPreviewMasked,
    evidenceStatus:
      persistenceResponse.data.result.evidenceReference.evidenceStatus,
    citationCount:
      persistenceResponse.data.result.evidenceReference.citationCount,
  });
}

function createMaterializedSummary(input: {
  materializationStatus: "created" | "reused";
  resultPublicId: string;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
}): PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto {
  return {
    materializationStatus: input.materializationStatus,
    failureCategory: null,
    resultPublicId: input.resultPublicId,
    contentDigest: input.contentDigest,
    contentPreviewMasked: input.contentPreviewMasked,
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    formalAdoptionStatus: "blocked",
  };
}

function createBlockedMaterializationSummary(
  failureCategory: Exclude<
    PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto["failureCategory"],
    null | "not_requested"
  >,
): PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto {
  return {
    ...createDefaultBlockedRouteIntegratedResultMaterializationSummary(
      failureCategory,
    ),
    materializationStatus: "blocked",
  };
}

function resolvePersonalAiGenerationResultOwnerType(
  ownerType: string,
): PersonalAiGenerationResultOwnerType | null {
  return ownerType === "personal" || ownerType === "organization"
    ? ownerType
    : null;
}

function createContentRedactedSnapshot(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  control: PersonalAiGenerationRouteIntegratedResultMaterializationControl,
): RedactedJsonObject {
  return {
    redactionStatus: "redacted",
    contentVisibility: "redacted_snapshot",
    sourceMode: control.materializationMode,
    taskType: requestFlow.resultReference.taskType,
    aiFuncType: requestFlow.request.aiFuncType,
    contentPreviewMasked: control.contentPreviewMasked,
    evidenceStatus: control.evidenceStatus,
    citationCount: control.citationCount,
    providerOutputIncluded: false,
    paperAssembly: control.paperAssemblyRedactedSnapshot ?? null,
  };
}

function createEmptyCitationRedactedSnapshot(
  control: PersonalAiGenerationRouteIntegratedResultMaterializationControl,
): RedactedJsonObject {
  return {
    redactionStatus: "redacted",
    citationCount: control.citationCount,
    citations: [],
  };
}

function isMaterializationEvidenceRedacted(
  persistenceInput: PersonalAiGenerationResultPersistenceInput,
  summary: PersonalAiGenerationRuntimeBridgeResultMaterializationSummaryDto,
): boolean {
  const serializedEvidence = JSON.stringify([persistenceInput, summary]);

  return forbiddenMaterializationEvidenceTokens.every(
    (forbiddenToken) => !serializedEvidence.includes(forbiddenToken),
  );
}
