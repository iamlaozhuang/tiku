import type {
  AdminAiGenerationAdoptionHistoryEventDto,
  AdminAiGenerationAdoptionHistoryEventType,
  AdminAiGenerationAdoptionHistoryReadModelDto,
  AdminAiGenerationAdoptionHistoryReadModelSource,
} from "../contracts/admin-ai-generation-formal-adoption-contract";

function sortHistoryEvents(
  events: readonly AdminAiGenerationAdoptionHistoryEventDto[],
): AdminAiGenerationAdoptionHistoryEventDto[] {
  return [...events].sort((left, right) =>
    left.eventAt.localeCompare(right.eventAt),
  );
}

function countEventsByType(
  events: readonly AdminAiGenerationAdoptionHistoryEventDto[],
  eventType: AdminAiGenerationAdoptionHistoryEventType,
): number {
  return events.filter((event) => event.eventType === eventType).length;
}

export function createAdminAiGenerationAdoptionHistoryReadModel(
  source: AdminAiGenerationAdoptionHistoryReadModelSource,
): AdminAiGenerationAdoptionHistoryReadModelDto {
  const events = sortHistoryEvents(
    source.events.map((event) => ({
      eventPublicId: event.eventPublicId,
      eventType: event.eventType,
      eventAt: event.eventAt,
      actorPublicId: event.actorPublicId,
      actionType: event.actionType,
      targetResourceType: event.targetResourceType,
      targetPublicId: event.targetPublicId,
      metadataSummaryMasked: event.metadataSummaryMasked,
      contentDigest: event.contentDigest,
      redactionStatus: "redacted",
    })),
  );

  return {
    historyStatus: events.length === 0 ? "empty" : "traceable",
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
    timelineSummary: {
      eventCount: events.length,
      firstEventAt: events[0]?.eventAt ?? null,
      latestEventAt: events.at(-1)?.eventAt ?? null,
      generatedResultEventCount: countEventsByType(
        events,
        "generated_result_created",
      ),
      adoptionApprovalEventCount: countEventsByType(
        events,
        "formal_adoption_approved",
      ),
      formalDraftEventCount: countEventsByType(events, "formal_draft_created"),
    },
    events,
    readBoundary: {
      readOnly: true,
      historyMutationStatus: "not_executed",
      publishStatus: "not_executed",
      rawPromptExposed: false,
      rawGeneratedOutputExposed: false,
      providerPayloadExposed: false,
      redactionStatus: "redacted",
    },
    reviewedBy: {
      reviewerPublicId: source.reviewerPublicId,
      reviewedAt: source.reviewedAt,
    },
    redactionStatus: "redacted",
  };
}
