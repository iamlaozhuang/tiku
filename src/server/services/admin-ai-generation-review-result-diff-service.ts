import type {
  AdminAiGenerationReviewResultDiffChangeStatus,
  AdminAiGenerationReviewResultDiffDto,
  AdminAiGenerationReviewResultDiffFieldDto,
  AdminAiGenerationReviewResultDiffFieldSource,
  AdminAiGenerationReviewResultDiffSegmentDto,
  AdminAiGenerationReviewResultDiffSource,
} from "../contracts/admin-ai-generation-formal-adoption-contract";

function createDiffSegment(input: {
  contentDigest: string | null;
  contentPreviewMasked: string | null;
}): AdminAiGenerationReviewResultDiffSegmentDto | null {
  if (input.contentDigest === null || input.contentPreviewMasked === null) {
    return null;
  }

  return {
    contentDigest: input.contentDigest,
    contentPreviewMasked: input.contentPreviewMasked,
    redactionStatus: "redacted",
  };
}

function resolveChangeStatus(
  field: AdminAiGenerationReviewResultDiffFieldSource,
): AdminAiGenerationReviewResultDiffChangeStatus {
  if (
    field.generatedResultDigest !== null &&
    field.adoptedDraftDigest === null
  ) {
    return "generated_result_only";
  }

  if (
    field.generatedResultDigest === null &&
    field.adoptedDraftDigest !== null
  ) {
    return "adopted_draft_only";
  }

  return field.generatedResultDigest === field.adoptedDraftDigest
    ? "unchanged"
    : "changed";
}

function mapDiffField(
  field: AdminAiGenerationReviewResultDiffFieldSource,
): AdminAiGenerationReviewResultDiffFieldDto {
  return {
    fieldKey: field.fieldKey,
    changeStatus: resolveChangeStatus(field),
    generatedResult: createDiffSegment({
      contentDigest: field.generatedResultDigest,
      contentPreviewMasked: field.generatedResultPreviewMasked,
    }),
    adoptedDraft: createDiffSegment({
      contentDigest: field.adoptedDraftDigest,
      contentPreviewMasked: field.adoptedDraftPreviewMasked,
    }),
    redactionStatus: "redacted",
  };
}

function countFieldsByStatus(
  fields: readonly AdminAiGenerationReviewResultDiffFieldDto[],
  changeStatus: AdminAiGenerationReviewResultDiffChangeStatus,
): number {
  return fields.filter((field) => field.changeStatus === changeStatus).length;
}

export function createAdminAiGenerationReviewResultDiff(
  source: AdminAiGenerationReviewResultDiffSource,
): AdminAiGenerationReviewResultDiffDto {
  const fields = source.fields.map(mapDiffField);

  return {
    diffStatus:
      source.adoptedDraft === null ? "blocked_missing_adopted_draft" : "ready",
    resultPublicId: source.resultPublicId,
    adoptionPublicId: source.adoptionPublicId,
    taskPublicId: source.taskPublicId,
    requestPublicId: source.requestPublicId,
    target: {
      targetType: source.targetType,
      targetDomain: source.targetDomain,
      formalTargetWriteStatus: source.formalTargetWriteStatus,
      formalQuestionPublicId: source.formalQuestionPublicId,
      formalPaperPublicId: source.formalPaperPublicId,
    },
    sourceSummary: {
      contentDigest: source.generatedResult.contentDigest,
      contentPreviewMasked: source.generatedResult.contentPreviewMasked,
      evidenceStatus: source.generatedResult.evidenceStatus,
      citationCount: source.generatedResult.citationCount,
      aiCallLogPublicId: source.generatedResult.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
    adoptedDraftSummary:
      source.adoptedDraft === null
        ? null
        : {
            draftPublicId: source.adoptedDraft.draftPublicId,
            contentDigest: source.adoptedDraft.contentDigest,
            contentPreviewMasked: source.adoptedDraft.contentPreviewMasked,
            evidenceStatus: source.adoptedDraft.evidenceStatus,
            citationCount: source.adoptedDraft.citationCount,
            redactionStatus: "redacted",
          },
    diffSummary: {
      fieldCount: fields.length,
      changedCount: countFieldsByStatus(fields, "changed"),
      unchangedCount: countFieldsByStatus(fields, "unchanged"),
      generatedResultOnlyCount: countFieldsByStatus(
        fields,
        "generated_result_only",
      ),
      adoptedDraftOnlyCount: countFieldsByStatus(fields, "adopted_draft_only"),
    },
    fields,
    readBoundary: {
      readOnly: true,
      rawPromptExposed: false,
      rawGeneratedOutputExposed: false,
      providerPayloadExposed: false,
      mutationStatus: "not_executed",
      publishStatus: "not_executed",
      redactionStatus: "redacted",
    },
    reviewedBy: {
      reviewerPublicId: source.reviewerPublicId,
      reviewedAt: source.reviewedAt,
    },
    redactionStatus: "redacted",
  };
}
