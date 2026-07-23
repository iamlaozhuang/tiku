import { createHash } from "node:crypto";

import type {
  AdminAiGenerationFormalAdoptionAuditActionType,
  AdminAiGenerationFormalAdoptionDto,
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionResult,
  AdminAiGenerationFormalAdoptionReviewTraceabilityDto,
  AdminAiGenerationFormalAdoptionRow,
  AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  AdminAiGenerationKnowledgeNodeCandidateSnapshot,
  AdminAiGenerationKnowledgeNodeResolutionSnapshot,
  CreateAdminAiGenerationFormalAdoptionInput,
  FindAdminAiGenerationFormalAdoptionQuery,
  FindTrustedAdminAiGenerationFormalDraftInput,
  InsertAdminAiGenerationFormalAdoptionInput,
  MarkAdminAiGenerationFormalDraftCreatedInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type {
  AdminAiGenerationFormalQuestionDraftPayload,
  AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource,
} from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import {
  canAdoptAdminAiGenerationPlatformFormalContent,
  resolveAdminAiGenerationTaskTypeForFormalTarget,
  type AdminAiGenerationFormalAdoptionReviewDecision,
  type AdminAiGenerationFormalAdoptionReviewStatus,
  type AdminAiGenerationFormalAdoptionSourceResult,
} from "../models/admin-ai-generation-formal-adoption";

const platformFormalContentTargetDomain = "platform_formal_content";
const formalTargetWriteStatus = "blocked_without_follow_up_task";
const formalAdoptionApproveAuditActionType =
  "admin_ai_generation_result.formal_adoption.approve";
const formalAdoptionRejectAuditActionType =
  "admin_ai_generation_result.formal_adoption.reject";

type ParsedGeneratedKnowledgeCandidate = {
  candidateSnapshot: AdminAiGenerationKnowledgeNodeCandidateSnapshot;
  candidateDigest: string;
  questionDraft: AdminAiGenerationFormalQuestionDraftPayload;
};

type KnowledgeNodeResolutionBinding = ParsedGeneratedKnowledgeCandidate & {
  resolutionSnapshot: AdminAiGenerationKnowledgeNodeResolutionSnapshot;
  resolutionDigest: string;
};

export function createAdminAiGenerationFormalAdoptionRepository(
  gateway: AdminAiGenerationFormalAdoptionGateway,
): AdminAiGenerationFormalAdoptionRepository {
  return {
    async createOrReuseFormalAdoption(input) {
      assertConfirmedAdoptionInput(input);

      const sourceResult = await gateway.findSourceResultForAdoption(
        input.resultPublicId,
      );

      if (sourceResult === null) {
        throw new Error("admin AI generation result was not found");
      }

      assertSourceResultEligibleForPlatformFormalAdoption(sourceResult, input);
      assertExpectedContentDigest(sourceResult, input.expectedContentDigest);
      assertExpectedReviewDraft(sourceResult, input);

      const knowledgeNodeBinding = await createKnowledgeNodeResolutionBinding(
        gateway,
        sourceResult,
        input,
      );

      const query = createAdoptionLookupQuery(input);
      const existingRow = await gateway.findAdoptionBySourceResult(query);

      if (existingRow !== null) {
        assertExistingAdoptionMatchesCommand(
          existingRow,
          sourceResult,
          input,
          knowledgeNodeBinding,
        );
        return createFormalAdoptionResponse("reused", existingRow);
      }

      const insertedRow = await gateway.insertAdoptionRecord(
        createInsertAdoptionRecordInput(
          input,
          sourceResult,
          knowledgeNodeBinding,
        ),
      );
      const resolvedRow =
        insertedRow ?? (await gateway.findAdoptionBySourceResult(query));

      if (resolvedRow === null) {
        throw new Error(
          "admin AI generation formal adoption persistence failed",
        );
      }

      assertExistingAdoptionMatchesCommand(
        resolvedRow,
        sourceResult,
        input,
        knowledgeNodeBinding,
      );

      return createFormalAdoptionResponse(
        insertedRow === null ? "reused" : "created",
        resolvedRow,
      );
    },
    async findTrustedReviewedDraftForAdoption(input) {
      const sourceResult = await gateway.findSourceResultForAdoption(
        input.resultPublicId,
      );

      if (sourceResult === null) {
        throw new Error("admin AI generation result was not found");
      }

      assertTrustedReviewedDraftSource(sourceResult, input);
      const adoptionRow = await gateway.findAdoptionBySourceResult({
        sourceResultPublicId: input.resultPublicId,
        targetType: input.targetType,
        targetDomain: platformFormalContentTargetDomain,
      });

      if (adoptionRow === null) {
        throw new Error("admin AI generation formal adoption was not found");
      }

      return resolveTrustedReviewedDraft(sourceResult, adoptionRow);
    },
    async markFormalDraftCreated(input) {
      assertFormalDraftCreatedInput(input);

      const updatedRow = await gateway.updateFormalDraftMetadata(input);

      if (updatedRow === null) {
        throw new Error(
          "admin AI generation formal adoption draft metadata update failed",
        );
      }

      return createFormalAdoptionResponse("reused", updatedRow);
    },
  };
}

function assertExpectedContentDigest(
  sourceResult: Pick<
    AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
    "contentDigest"
  >,
  expectedContentDigest: string,
): void {
  if (sourceResult.contentDigest !== expectedContentDigest) {
    throw new Error(
      "admin AI generation formal adoption content digest conflict",
    );
  }
}

function assertExpectedReviewDraft(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  input: Pick<
    CreateAdminAiGenerationFormalAdoptionInput,
    "expectedReviewDraftRevision" | "expectedReviewDraftDigest"
  >,
): void {
  if (
    sourceResult.currentReviewDraftPublicId === null ||
    sourceResult.currentReviewDraftRevision !==
      input.expectedReviewDraftRevision ||
    sourceResult.currentReviewDraftDigest !== input.expectedReviewDraftDigest
  ) {
    throw new Error(
      "admin AI generation formal adoption review draft conflict",
    );
  }
}

function assertExistingAdoptionMatchesCommand(
  existingRow: AdminAiGenerationFormalAdoptionRow,
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  input: CreateAdminAiGenerationFormalAdoptionInput,
  knowledgeNodeBinding: KnowledgeNodeResolutionBinding | null,
): void {
  if (
    existingRow.content_digest !== sourceResult.contentDigest ||
    existingRow.content_digest !== input.expectedContentDigest
  ) {
    throw new Error(
      "admin AI generation formal adoption content digest conflict",
    );
  }

  if (
    existingRow.review_draft_public_id !==
      sourceResult.currentReviewDraftPublicId ||
    existingRow.review_draft_revision !== input.expectedReviewDraftRevision ||
    existingRow.review_draft_digest !== input.expectedReviewDraftDigest
  ) {
    throw new Error(
      "admin AI generation formal adoption review draft conflict",
    );
  }

  if (
    createFormalAdoptionReviewDecision(existingRow) !== input.reviewDecision
  ) {
    throw new Error(
      "admin AI generation formal adoption review decision conflict",
    );
  }

  assertKnowledgeNodeBindingMatchesRow(existingRow, knowledgeNodeBinding);
}

function assertTrustedReviewedDraftSource(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  input: FindTrustedAdminAiGenerationFormalDraftInput,
): void {
  assertExpectedContentDigest(sourceResult, input.expectedContentDigest);
  assertExpectedReviewDraft(sourceResult, input);

  if (
    sourceResult.workspace !== "content" ||
    sourceResult.ownerType !== "platform" ||
    sourceResult.organizationPublicId !== null ||
    sourceResult.resultStatus !== "draft" ||
    sourceResult.isFormalAdoptionBlocked !== true ||
    sourceResult.generationKind !== input.targetType ||
    sourceResult.taskType !==
      resolveAdminAiGenerationTaskTypeForFormalTarget(input.targetType) ||
    sourceResult.reviewedDraft === null ||
    sourceResult.reviewedDraft === undefined
  ) {
    throw new Error(
      "admin AI generation result is not eligible for formal adoption",
    );
  }
}

function assertConfirmedAdoptionInput(
  input: CreateAdminAiGenerationFormalAdoptionInput,
): void {
  if (input.reviewerConfirmed !== true) {
    throw new Error("explicit formal adoption review confirmation is required");
  }

  if (
    input.reviewDecision !== "approved" &&
    input.reviewDecision !== "rejected"
  ) {
    throw new Error(
      "admin AI generation formal adoption review decision is unsupported",
    );
  }
}

function assertSourceResultEligibleForPlatformFormalAdoption(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  input: CreateAdminAiGenerationFormalAdoptionInput,
): void {
  if (sourceResult.workspace === "organization") {
    throw new Error(
      "organization AI generation formal adoption requires a separate organization-scoped task",
    );
  }

  if (
    sourceResult.workspace !== "content" ||
    sourceResult.ownerType !== "platform" ||
    sourceResult.organizationPublicId !== null
  ) {
    throw new Error("unsafe admin AI generation formal adoption source scope");
  }

  if (!canAdoptAdminAiGenerationPlatformFormalContent(input.actor)) {
    throw new Error("admin AI generation formal adoption reviewer denied");
  }

  if (
    sourceResult.resultStatus !== "draft" ||
    !sourceResult.isFormalAdoptionBlocked
  ) {
    throw new Error("admin AI generation result is not eligible for adoption");
  }

  if (
    sourceResult.generationKind !== input.targetType ||
    sourceResult.taskType !==
      resolveAdminAiGenerationTaskTypeForFormalTarget(input.targetType)
  ) {
    throw new Error("admin AI generation result target type mismatch");
  }

  assertSourceResultEvidenceAllowsAdoption(sourceResult, input);
}

function assertSourceResultEvidenceAllowsAdoption(
  sourceResult: Pick<
    AdminAiGenerationFormalAdoptionSourceResult,
    "evidenceStatus"
  >,
  input: Pick<
    CreateAdminAiGenerationFormalAdoptionInput,
    "reviewDecision" | "weakEvidenceConfirmed"
  >,
): void {
  if (input.reviewDecision !== "approved") {
    return;
  }

  if (sourceResult.evidenceStatus === "none") {
    throw new Error("evidence status none blocks formal adoption");
  }

  if (
    sourceResult.evidenceStatus === "weak" &&
    input.weakEvidenceConfirmed !== true
  ) {
    throw new Error("weak evidence confirmation is required");
  }
}

async function createKnowledgeNodeResolutionBinding(
  gateway: AdminAiGenerationFormalAdoptionGateway,
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  input: CreateAdminAiGenerationFormalAdoptionInput,
): Promise<KnowledgeNodeResolutionBinding | null> {
  const candidate = parseGeneratedKnowledgeCandidate(sourceResult);

  if (candidate === null) {
    if (input.knowledgeNodeResolutions !== undefined) {
      throw new Error("admin AI generation knowledge node resolution conflict");
    }

    return null;
  }

  const mappings = input.knowledgeNodeResolutions ?? [];

  if (input.reviewDecision === "approved") {
    assertExactKnowledgeNodeResolution(
      candidate.candidateSnapshot.generatedLabels,
      mappings,
    );
    const knowledgeNodes = await gateway.findKnowledgeNodesForResolution({
      knowledgeNodePublicIds: mappings.map(
        (mapping) => mapping.knowledgeNodePublicId,
      ),
    });
    assertKnowledgeNodesEligible(
      candidate.candidateSnapshot,
      mappings,
      knowledgeNodes,
    );
  } else if (mappings.length !== 0) {
    throw new Error("admin AI generation knowledge node resolution conflict");
  }

  const resolutionSnapshot: AdminAiGenerationKnowledgeNodeResolutionSnapshot = {
    schemaVersion: 1,
    decision: input.reviewDecision,
    sourceContentDigest: candidate.candidateSnapshot.sourceContentDigest,
    generatedLabels: [...candidate.candidateSnapshot.generatedLabels],
    mappings: mappings.map((mapping) => ({ ...mapping })),
  };

  return {
    ...candidate,
    resolutionSnapshot,
    resolutionDigest: createResolutionDigest(resolutionSnapshot),
  };
}

function parseGeneratedKnowledgeCandidate(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
): ParsedGeneratedKnowledgeCandidate | null {
  if (!isRecord(sourceResult.reviewedDraft)) {
    return null;
  }

  const confirmation = sourceResult.reviewedDraft.knowledgeNodeConfirmation;

  if (confirmation === undefined) {
    return null;
  }

  if (
    !isRecord(confirmation) ||
    confirmation.schemaVersion !== 1 ||
    confirmation.status !== "unresolved" ||
    (confirmation.generationMode !== "balanced" &&
      confirmation.generationMode !== "comprehensive") ||
    confirmation.resultPublicId !== sourceResult.resultPublicId ||
    confirmation.taskPublicId !== sourceResult.taskPublicId ||
    confirmation.requestPublicId !== sourceResult.requestPublicId ||
    typeof confirmation.sourceContentDigest !== "string" ||
    !/^sha256:[0-9a-f]{64}$/u.test(confirmation.sourceContentDigest) ||
    !Array.isArray(confirmation.generatedLabels) ||
    confirmation.generatedLabels.length === 0 ||
    confirmation.generatedLabels.some((label) => typeof label !== "string") ||
    !Array.isArray(sourceResult.reviewedDraft.knowledgeNodePublicIds) ||
    sourceResult.reviewedDraft.knowledgeNodePublicIds.length !== 0 ||
    !isProfession(sourceResult.reviewedDraft.profession) ||
    !Number.isSafeInteger(sourceResult.reviewedDraft.level)
  ) {
    throw new Error("admin AI generation knowledge node candidate is invalid");
  }

  const generatedLabels = normalizeCandidateLabels(
    confirmation.generatedLabels as string[],
  );

  if (generatedLabels === null) {
    throw new Error("admin AI generation knowledge node candidate is invalid");
  }

  const questionDraft = createCanonicalQuestionDraft(
    sourceResult.reviewedDraft,
  );
  const candidateSource: AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource =
    {
      schemaVersion: 1,
      generationMode: confirmation.generationMode,
      requestPublicId: sourceResult.requestPublicId,
      resultPublicId: sourceResult.resultPublicId,
      taskPublicId: sourceResult.taskPublicId,
      generatedLabels,
      questionDraft,
    };

  if (createDigest(candidateSource) !== confirmation.sourceContentDigest) {
    throw new Error(
      "admin AI generation knowledge node candidate digest conflict",
    );
  }

  const candidateSnapshot: AdminAiGenerationKnowledgeNodeCandidateSnapshot = {
    schemaVersion: 1,
    generationMode: confirmation.generationMode,
    resultPublicId: sourceResult.resultPublicId,
    taskPublicId: sourceResult.taskPublicId,
    requestPublicId: sourceResult.requestPublicId,
    sourceContentDigest: confirmation.sourceContentDigest,
    profession: sourceResult.reviewedDraft.profession,
    level: sourceResult.reviewedDraft.level as number,
    generatedLabels,
  };

  return {
    candidateSnapshot,
    candidateDigest: createCandidateDigest(candidateSnapshot),
    questionDraft,
  };
}

function createCanonicalQuestionDraft(
  value: Record<string, unknown>,
): AdminAiGenerationFormalQuestionDraftPayload {
  return {
    questionType:
      value.questionType as AdminAiGenerationFormalQuestionDraftPayload["questionType"],
    profession:
      value.profession as AdminAiGenerationFormalQuestionDraftPayload["profession"],
    level: value.level as number,
    subject:
      value.subject as AdminAiGenerationFormalQuestionDraftPayload["subject"],
    difficulty:
      value.difficulty as AdminAiGenerationFormalQuestionDraftPayload["difficulty"],
    stemRichText: value.stemRichText as string,
    analysisRichText: value.analysisRichText as string,
    standardAnswerRichText: value.standardAnswerRichText as string,
    multiChoiceRule:
      value.multiChoiceRule as AdminAiGenerationFormalQuestionDraftPayload["multiChoiceRule"],
    scoringMethod:
      value.scoringMethod as AdminAiGenerationFormalQuestionDraftPayload["scoringMethod"],
    materialPublicId: value.materialPublicId as string | null,
    questionOptions:
      value.questionOptions as AdminAiGenerationFormalQuestionDraftPayload["questionOptions"],
    scoringPoints:
      value.scoringPoints as AdminAiGenerationFormalQuestionDraftPayload["scoringPoints"],
    fillBlankAnswers:
      value.fillBlankAnswers as AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"],
    knowledgeNodePublicIds: [],
    tagPublicIds: value.tagPublicIds as string[],
  };
}

function normalizeCandidateLabels(values: string[]): string[] | null {
  const exactLabels = new Set<string>();
  const collisionKeys = new Set<string>();
  const labels: string[] = [];

  for (const value of values) {
    const label = value.trim().normalize("NFC");
    const collisionKey = label.normalize("NFKC").toLocaleLowerCase("und");

    if (
      label !== value ||
      label.length === 0 ||
      label.length > 128 ||
      /[\u0000-\u001f\u007f-\u009f]/u.test(label) ||
      exactLabels.has(label) ||
      collisionKeys.has(collisionKey)
    ) {
      return null;
    }

    exactLabels.add(label);
    collisionKeys.add(collisionKey);
    labels.push(label);
  }

  return labels.length > 50 ? null : labels;
}

function assertExactKnowledgeNodeResolution(
  generatedLabels: string[],
  mappings: NonNullable<
    CreateAdminAiGenerationFormalAdoptionInput["knowledgeNodeResolutions"]
  >,
): void {
  if (
    mappings.length !== generatedLabels.length ||
    mappings.some(
      (mapping, index) => mapping.label !== generatedLabels[index],
    ) ||
    new Set(mappings.map((mapping) => mapping.knowledgeNodePublicId)).size !==
      mappings.length
  ) {
    throw new Error("admin AI generation knowledge node resolution conflict");
  }
}

function assertKnowledgeNodesEligible(
  candidate: AdminAiGenerationKnowledgeNodeCandidateSnapshot,
  mappings: NonNullable<
    CreateAdminAiGenerationFormalAdoptionInput["knowledgeNodeResolutions"]
  >,
  knowledgeNodes: Awaited<
    ReturnType<
      AdminAiGenerationFormalAdoptionGateway["findKnowledgeNodesForResolution"]
    >
  >,
): void {
  const knowledgeNodeByPublicId = new Map(
    knowledgeNodes.map((knowledgeNode) => [
      knowledgeNode.publicId,
      knowledgeNode,
    ]),
  );
  const knowledgeBasePublicIds = new Set<string>();

  for (const mapping of mappings) {
    const knowledgeNode = knowledgeNodeByPublicId.get(
      mapping.knowledgeNodePublicId,
    );

    if (
      knowledgeNode === undefined ||
      knowledgeNode.profession !== candidate.profession ||
      (knowledgeNode.levelList.length > 0 &&
        !knowledgeNode.levelList.includes(candidate.level)) ||
      !knowledgeNode.isActive ||
      !knowledgeNode.isRecommendable
    ) {
      throw new Error(
        "admin AI generation knowledge node resolution is not eligible",
      );
    }

    knowledgeBasePublicIds.add(knowledgeNode.knowledgeBasePublicId);
  }

  if (
    knowledgeNodeByPublicId.size !== mappings.length ||
    knowledgeBasePublicIds.size !== 1
  ) {
    throw new Error(
      "admin AI generation knowledge node resolution is not eligible",
    );
  }
}

function assertKnowledgeNodeBindingMatchesRow(
  row: AdminAiGenerationFormalAdoptionRow,
  binding: KnowledgeNodeResolutionBinding | null,
): void {
  if (binding === null) {
    if (
      row.knowledge_node_candidate_snapshot !== null ||
      row.knowledge_node_candidate_digest !== null ||
      row.knowledge_node_resolution_snapshot !== null ||
      row.knowledge_node_resolution_digest !== null
    ) {
      throw new Error("admin AI generation knowledge node resolution conflict");
    }

    return;
  }

  if (
    row.knowledge_node_candidate_snapshot === null ||
    row.knowledge_node_resolution_snapshot === null ||
    row.knowledge_node_candidate_digest !== binding.candidateDigest ||
    row.knowledge_node_resolution_digest !== binding.resolutionDigest ||
    createCandidateDigest(row.knowledge_node_candidate_snapshot) !==
      binding.candidateDigest ||
    createResolutionDigest(row.knowledge_node_resolution_snapshot) !==
      binding.resolutionDigest
  ) {
    throw new Error("admin AI generation knowledge node resolution conflict");
  }
}

function resolveTrustedReviewedDraft(
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  adoptionRow: AdminAiGenerationFormalAdoptionRow,
): unknown {
  if (
    adoptionRow.review_draft_public_id !==
      sourceResult.currentReviewDraftPublicId ||
    adoptionRow.review_draft_revision !==
      sourceResult.currentReviewDraftRevision ||
    adoptionRow.review_draft_digest !== sourceResult.currentReviewDraftDigest
  ) {
    throw new Error(
      "admin AI generation formal adoption review draft conflict",
    );
  }

  const candidate = parseGeneratedKnowledgeCandidate(sourceResult);

  if (candidate === null) {
    assertKnowledgeNodeBindingMatchesRow(adoptionRow, null);
    return sourceResult.reviewedDraft;
  }

  const resolutionSnapshot = adoptionRow.knowledge_node_resolution_snapshot;

  if (
    adoptionRow.review_status !== "approved_for_formal_adoption" ||
    resolutionSnapshot === null ||
    resolutionSnapshot.decision !== "approved"
  ) {
    throw new Error(
      "admin AI generation knowledge node resolution is not eligible",
    );
  }

  const binding: KnowledgeNodeResolutionBinding = {
    ...candidate,
    resolutionSnapshot,
    resolutionDigest: createResolutionDigest(resolutionSnapshot),
  };
  assertKnowledgeNodeBindingMatchesRow(adoptionRow, binding);
  assertExactKnowledgeNodeResolution(
    candidate.candidateSnapshot.generatedLabels,
    resolutionSnapshot.mappings,
  );

  return {
    ...candidate.questionDraft,
    knowledgeNodePublicIds: resolutionSnapshot.mappings.map(
      (mapping) => mapping.knowledgeNodePublicId,
    ),
  };
}

function createCandidateDigest(
  snapshot: AdminAiGenerationKnowledgeNodeCandidateSnapshot,
): string {
  return createDigest({
    schemaVersion: 1,
    generationMode: snapshot.generationMode,
    resultPublicId: snapshot.resultPublicId,
    taskPublicId: snapshot.taskPublicId,
    requestPublicId: snapshot.requestPublicId,
    sourceContentDigest: snapshot.sourceContentDigest,
    profession: snapshot.profession,
    level: snapshot.level,
    generatedLabels: snapshot.generatedLabels,
  });
}

function createResolutionDigest(
  snapshot: AdminAiGenerationKnowledgeNodeResolutionSnapshot,
): string {
  return createDigest({
    schemaVersion: 1,
    decision: snapshot.decision,
    sourceContentDigest: snapshot.sourceContentDigest,
    generatedLabels: snapshot.generatedLabels,
    mappings: snapshot.mappings,
  });
}

function createDigest(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProfession(
  value: unknown,
): value is "monopoly" | "marketing" | "logistics" {
  return value === "monopoly" || value === "marketing" || value === "logistics";
}

function createAdoptionLookupQuery(
  input: Pick<
    CreateAdminAiGenerationFormalAdoptionInput,
    "resultPublicId" | "targetType"
  >,
): FindAdminAiGenerationFormalAdoptionQuery {
  return {
    sourceResultPublicId: input.resultPublicId,
    targetType: input.targetType,
    targetDomain: platformFormalContentTargetDomain,
  };
}

function createInsertAdoptionRecordInput(
  input: CreateAdminAiGenerationFormalAdoptionInput,
  sourceResult: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
  knowledgeNodeBinding: KnowledgeNodeResolutionBinding | null,
): InsertAdminAiGenerationFormalAdoptionInput {
  const reviewDraftPublicId = sourceResult.currentReviewDraftPublicId;
  const reviewDraftRevision = sourceResult.currentReviewDraftRevision;
  const reviewDraftDigest = sourceResult.currentReviewDraftDigest;
  if (
    reviewDraftPublicId === null ||
    reviewDraftRevision === null ||
    reviewDraftDigest === null
  ) {
    throw new Error(
      "admin AI generation formal adoption review draft conflict",
    );
  }

  return {
    adoptionPublicId: input.adoptionPublicId,
    sourceResultPublicId: sourceResult.resultPublicId,
    sourceTaskPublicId: sourceResult.taskPublicId,
    sourceRequestPublicId: sourceResult.requestPublicId,
    workspace: sourceResult.workspace,
    generationKind: sourceResult.generationKind,
    ownerType: sourceResult.ownerType,
    ownerPublicId: sourceResult.ownerPublicId,
    organizationPublicId: sourceResult.organizationPublicId,
    targetType: input.targetType,
    targetDomain: platformFormalContentTargetDomain,
    reviewStatus: createFormalAdoptionReviewStatus(input.reviewDecision),
    formalTargetWriteStatus,
    formalQuestionPublicId: null,
    formalPaperPublicId: null,
    reviewerPublicId: input.actor.publicId,
    reviewerRole: input.actor.roles.includes("super_admin")
      ? "super_admin"
      : "content_admin",
    reviewedAt: input.reviewedAt,
    contentDigest: sourceResult.contentDigest,
    contentPreviewMasked: sourceResult.contentPreviewMasked,
    evidenceStatus: sourceResult.evidenceStatus,
    citationCount: sourceResult.citationCount,
    aiCallLogPublicId: sourceResult.aiCallLogPublicId,
    knowledgeNodeCandidateSnapshot:
      knowledgeNodeBinding?.candidateSnapshot ?? null,
    knowledgeNodeCandidateDigest: knowledgeNodeBinding?.candidateDigest ?? null,
    knowledgeNodeResolutionSnapshot:
      knowledgeNodeBinding?.resolutionSnapshot ?? null,
    knowledgeNodeResolutionDigest:
      knowledgeNodeBinding?.resolutionDigest ?? null,
    reviewDraftPublicId,
    reviewDraftRevision,
    reviewDraftDigest,
    createdAt: input.reviewedAt,
  };
}

function createFormalAdoptionReviewStatus(
  reviewDecision: AdminAiGenerationFormalAdoptionReviewDecision,
): AdminAiGenerationFormalAdoptionReviewStatus {
  return reviewDecision === "approved"
    ? "approved_for_formal_adoption"
    : "rejected";
}

function assertFormalDraftCreatedInput(
  input: MarkAdminAiGenerationFormalDraftCreatedInput,
): void {
  if (
    input.targetType === "question" &&
    (input.formalQuestionPublicId === null ||
      input.formalPaperPublicId !== null)
  ) {
    throw new Error("admin AI generation formal question draft id required");
  }

  if (
    input.targetType === "paper" &&
    (input.formalPaperPublicId === null ||
      input.formalQuestionPublicId !== null)
  ) {
    throw new Error("admin AI generation formal paper draft id required");
  }
}

function createFormalAdoptionResponse(
  persistenceStatus: AdminAiGenerationFormalAdoptionResult["persistenceStatus"],
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionResult {
  return {
    persistenceStatus,
    adoption: mapAdminAiGenerationFormalAdoptionRowToDto(row),
  };
}

function mapAdminAiGenerationFormalAdoptionRowToDto(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionDto {
  assertFormalTargetWriteSafe(row);

  return {
    adoptionPublicId: row.adoption_public_id,
    sourceReference: {
      resultPublicId: row.source_result_public_id,
      taskPublicId: row.source_task_public_id,
      requestPublicId: row.source_request_public_id,
      workspace: row.workspace,
      generationKind: row.generation_kind,
      ownerType: row.owner_type,
      ownerPublicId: row.owner_public_id,
      organizationPublicId: row.organization_public_id,
    },
    targetReference: {
      targetType: row.target_type,
      targetDomain: row.target_domain,
      formalTargetWriteStatus: row.formal_target_write_status,
      formalQuestionPublicId: row.formal_question_public_id,
      formalPaperPublicId: row.formal_paper_public_id,
    },
    review: {
      reviewStatus: row.review_status,
      reviewDecision: createFormalAdoptionReviewDecision(row),
      reviewerPublicId: row.reviewer_public_id,
      reviewedAt: row.reviewed_at.toISOString(),
    },
    sourceSummary: {
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      redactionStatus: "redacted",
    },
    audit: createFormalAdoptionAuditSummary(row),
    reviewTraceability: createFormalAdoptionReviewTraceability(row),
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionReviewTraceability(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionReviewTraceabilityDto {
  const reviewedAt = row.reviewed_at.toISOString();
  const reviewDecision = createFormalAdoptionReviewDecision(row);

  return {
    traceabilityStatus: "single_result_traceable",
    sourceGeneratedResultPublicId: row.source_result_public_id,
    validationStatus: "validated_for_formal_adoption",
    reviewStatus: row.review_status,
    reviewDecision,
    reviewerPublicId: row.reviewer_public_id,
    reviewedAt,
    adoptAction:
      reviewDecision === "approved"
        ? {
            actionStatus: "executed",
            actionType: formalAdoptionApproveAuditActionType,
            actorPublicId: row.reviewer_public_id,
            actionAt: reviewedAt,
            formalTargetWriteStatus: row.formal_target_write_status,
            formalQuestionPublicId: row.formal_question_public_id,
            formalPaperPublicId: row.formal_paper_public_id,
          }
        : {
            actionStatus: "not_executed",
            actionType: null,
            actorPublicId: null,
            actionAt: null,
            formalTargetWriteStatus,
            formalQuestionPublicId: null,
            formalPaperPublicId: null,
          },
    rejectAction:
      reviewDecision === "rejected"
        ? {
            actionStatus: "executed",
            actionType: formalAdoptionRejectAuditActionType,
            actorPublicId: row.reviewer_public_id,
            actionAt: reviewedAt,
          }
        : {
            actionStatus: "not_executed",
            actorPublicId: null,
            actionAt: null,
          },
    directPublishStatus: "blocked_requires_fresh_publish_task",
    auditSummary: createFormalAdoptionAuditSummary(row),
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionAuditSummary(
  row: AdminAiGenerationFormalAdoptionRow,
): AdminAiGenerationFormalAdoptionDto["audit"] {
  return {
    actionType: createFormalAdoptionAuditActionType(row),
    targetResourceType: "admin_ai_generation_result",
    targetPublicId: row.source_result_public_id,
    redactionStatus: "redacted",
  };
}

function createFormalAdoptionReviewDecision(
  row: Pick<AdminAiGenerationFormalAdoptionRow, "review_status">,
): AdminAiGenerationFormalAdoptionReviewDecision {
  return row.review_status === "rejected" ? "rejected" : "approved";
}

function createFormalAdoptionAuditActionType(
  row: Pick<AdminAiGenerationFormalAdoptionRow, "review_status">,
): AdminAiGenerationFormalAdoptionAuditActionType {
  return createFormalAdoptionReviewDecision(row) === "approved"
    ? formalAdoptionApproveAuditActionType
    : formalAdoptionRejectAuditActionType;
}

function assertFormalTargetWriteSafe(
  row: AdminAiGenerationFormalAdoptionRow,
): void {
  if (
    row.review_status === "rejected" &&
    row.formal_target_write_status === formalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (row.review_status === "rejected") {
    throw new Error("admin AI generation formal rejection cannot write draft");
  }

  if (
    row.formal_target_write_status === formalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === "draft_created" &&
    row.target_type === "question" &&
    row.formal_question_public_id !== null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === "draft_created" &&
    row.target_type === "paper" &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id !== null
  ) {
    return;
  }

  throw new Error("admin AI generation formal target write is not approved");
}
