import type {
  AdminAiGenerationReviewBatchSelectionBlockedReason,
  AdminAiGenerationReviewBatchSelectionCandidateDto,
  AdminAiGenerationReviewBatchSelectionPreviewDto,
  AdminAiGenerationReviewBatchSelectionPreviewInput,
  AdminAiGenerationReviewBatchSelectionSource,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import { resolveAdminAiGenerationTaskTypeForFormalTarget } from "../models/admin-ai-generation-formal-adoption";

function resolveBlockedReason(
  candidate: AdminAiGenerationReviewBatchSelectionSource,
  targetType: AdminAiGenerationReviewBatchSelectionPreviewInput["targetType"],
): AdminAiGenerationReviewBatchSelectionBlockedReason | null {
  if (candidate.workspace !== "content") {
    return "blocked_non_content_workspace";
  }

  if (
    candidate.ownerType !== "platform" ||
    candidate.organizationPublicId !== null
  ) {
    return "blocked_unsafe_owner_scope";
  }

  if (candidate.resultStatus !== "draft") {
    return "blocked_result_not_draft";
  }

  if (!candidate.isFormalAdoptionBlocked) {
    return "blocked_formal_adoption_not_blocked";
  }

  if (
    candidate.generationKind !== targetType ||
    candidate.taskType !==
      resolveAdminAiGenerationTaskTypeForFormalTarget(targetType)
  ) {
    return "blocked_target_type_mismatch";
  }

  return null;
}

function mapCandidate(input: {
  candidate: AdminAiGenerationReviewBatchSelectionSource;
  selectedResultPublicIds: ReadonlySet<string>;
  targetType: AdminAiGenerationReviewBatchSelectionPreviewInput["targetType"];
}): AdminAiGenerationReviewBatchSelectionCandidateDto {
  const blockedReason = resolveBlockedReason(input.candidate, input.targetType);
  const validationStatus = blockedReason === null ? "eligible" : "blocked";
  const selectionRequested = input.selectedResultPublicIds.has(
    input.candidate.resultPublicId,
  );
  const selectionState =
    validationStatus === "blocked"
      ? "blocked"
      : selectionRequested
        ? "selected"
        : "available";

  return {
    resultPublicId: input.candidate.resultPublicId,
    taskPublicId: input.candidate.taskPublicId,
    requestPublicId: input.candidate.requestPublicId,
    generationKind: input.candidate.generationKind,
    validationStatus,
    blockedReason,
    selectionState,
    contentPreviewMasked: input.candidate.contentPreviewMasked,
    contentDigest: input.candidate.contentDigest,
    evidenceStatus: input.candidate.evidenceStatus,
    citationCount: input.candidate.citationCount,
    generatedAt: input.candidate.generatedAt,
    formalTargetWriteStatus: "blocked_without_follow_up_task",
    batchAdoptionMutationStatus: "not_executed",
    redactionStatus: "redacted",
  };
}

function isSelectedCandidateInvalid(
  resultPublicId: string,
  candidates: readonly AdminAiGenerationReviewBatchSelectionCandidateDto[],
): boolean {
  return (
    candidates.find((candidate) => candidate.resultPublicId === resultPublicId)
      ?.validationStatus !== "eligible"
  );
}

function resolvePreviewStatus(input: {
  candidateCount: number;
  eligibleCount: number;
  invalidSelectedCount: number;
}): AdminAiGenerationReviewBatchSelectionPreviewDto["previewStatus"] {
  if (input.candidateCount === 0) {
    return "empty";
  }

  if (input.invalidSelectedCount > 0) {
    return "blocked_by_invalid_selection";
  }

  return input.eligibleCount > 0 ? "ready" : "blocked_no_eligible_candidate";
}

export function createAdminAiGenerationReviewBatchSelectionPreview(
  input: AdminAiGenerationReviewBatchSelectionPreviewInput,
): AdminAiGenerationReviewBatchSelectionPreviewDto {
  const selectedResultPublicIds = new Set(input.selectedResultPublicIds);
  const candidates = input.candidates.map((candidate) =>
    mapCandidate({
      candidate,
      selectedResultPublicIds,
      targetType: input.targetType,
    }),
  );
  const eligibleCount = candidates.filter(
    (candidate) => candidate.validationStatus === "eligible",
  ).length;
  const invalidSelectedCount = input.selectedResultPublicIds.filter(
    (resultPublicId) => isSelectedCandidateInvalid(resultPublicId, candidates),
  ).length;

  return {
    previewStatus: resolvePreviewStatus({
      candidateCount: candidates.length,
      eligibleCount,
      invalidSelectedCount,
    }),
    targetType: input.targetType,
    selectionMode: "manual_batch_preview",
    batchAdoptionMutationStatus: "not_executed",
    validationState: {
      candidateCount: candidates.length,
      eligibleCount,
      blockedCount: candidates.length - eligibleCount,
      selectedCount: input.selectedResultPublicIds.length,
      invalidSelectedCount,
      previewOnly: true,
    },
    candidates,
    redactionStatus: "redacted",
  };
}
