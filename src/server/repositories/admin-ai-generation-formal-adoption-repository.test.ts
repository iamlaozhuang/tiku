import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import type {
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRow,
  AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import { createAdminAiGenerationFormalAdoptionRepository } from "./admin-ai-generation-formal-adoption-repository";

function createSourceResult(
  overrides: Partial<AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft> = {},
): AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft {
  return {
    resultPublicId: "admin_ai_generation_result_public_177",
    taskPublicId: "admin_ai_generation_task_public_177",
    requestPublicId: "admin_ai_generation_request_public_177",
    workspace: "content",
    generationKind: "question",
    ownerType: "platform",
    ownerPublicId: "platform_content_review_pool",
    organizationPublicId: null,
    taskType: "ai_question_generation",
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
    reviewedDraft: {
      questionType: "short_answer",
      stemRichText: "trusted server-owned draft",
    },
    contentDigest: "sha256:admin_ai_generation_result_177",
    contentPreviewMasked: "masked admin AI result preview",
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: null,
    currentReviewDraftPublicId: "admin_ai_review_draft_public_177",
    currentReviewDraftRevision: 0,
    currentReviewDraftDigest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ...overrides,
  };
}

function createGeneratedKnowledgeCandidate() {
  const questionDraft = {
    questionType: "short_answer",
    profession: "marketing",
    level: 3,
    subject: "theory",
    difficulty: "medium",
    stemRichText: "trusted server-owned draft",
    analysisRichText: "trusted server-owned analysis",
    standardAnswerRichText: "trusted server-owned answer",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "ai_scoring",
    materialPublicId: null,
    questionOptions: [],
    scoringPoints: [],
    fillBlankAnswers: [],
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
  } as const;
  const candidateSource = {
    schemaVersion: 1,
    generationMode: "balanced",
    requestPublicId: "admin_ai_generation_request_public_177",
    resultPublicId: "admin_ai_generation_result_public_177",
    taskPublicId: "admin_ai_generation_task_public_177",
    generatedLabels: ["营销基础", "客户需求"],
    questionDraft,
  } as const;
  const sourceContentDigest = `sha256:${createHash("sha256")
    .update(JSON.stringify(candidateSource))
    .digest("hex")}`;

  return {
    ...questionDraft,
    knowledgeNodeConfirmation: {
      schemaVersion: 1,
      status: "unresolved",
      generationMode: "balanced",
      resultPublicId: "admin_ai_generation_result_public_177",
      taskPublicId: "admin_ai_generation_task_public_177",
      requestPublicId: "admin_ai_generation_request_public_177",
      sourceContentDigest,
      generatedLabels: ["营销基础", "客户需求"],
    },
  } as const;
}

function createAdoptionRow(
  overrides: Partial<AdminAiGenerationFormalAdoptionRow> = {},
): AdminAiGenerationFormalAdoptionRow {
  return {
    adoption_public_id: "admin_ai_formal_adoption_public_177",
    source_result_public_id: "admin_ai_generation_result_public_177",
    source_task_public_id: "admin_ai_generation_task_public_177",
    source_request_public_id: "admin_ai_generation_request_public_177",
    workspace: "content",
    generation_kind: "question",
    owner_type: "platform",
    owner_public_id: "platform_content_review_pool",
    organization_public_id: null,
    target_type: "question",
    target_domain: "platform_formal_content",
    review_status: "approved_for_formal_adoption",
    formal_target_write_status: "blocked_without_follow_up_task",
    formal_question_public_id: null,
    formal_paper_public_id: null,
    reviewer_public_id: "admin_content_public_177",
    reviewed_at: new Date("2026-06-26T23:40:00.000Z"),
    content_digest: "sha256:admin_ai_generation_result_177",
    content_preview_masked: "masked admin AI result preview",
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    knowledge_node_candidate_snapshot: null,
    knowledge_node_candidate_digest: null,
    knowledge_node_resolution_snapshot: null,
    knowledge_node_resolution_digest: null,
    review_draft_public_id: "admin_ai_review_draft_public_177",
    review_draft_revision: 0,
    review_draft_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    created_at: new Date("2026-06-26T23:40:00.000Z"),
    ...overrides,
  };
}

function createGateway(options: {
  sourceResult?: AdminAiGenerationFormalAdoptionSourceResultWithReviewDraft | null;
  existingRow?: AdminAiGenerationFormalAdoptionRow | null;
  insertedRow?: AdminAiGenerationFormalAdoptionRow | null;
  updatedRow?: AdminAiGenerationFormalAdoptionRow | null;
  knowledgeNodes?: Array<{
    publicId: string;
    knowledgeBasePublicId: string;
    profession: "marketing";
    levelList: number[];
    isActive: boolean;
    isRecommendable: boolean;
  }>;
}) {
  const findAdoptionBySourceResult = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findSourceResultForAdoption = vi.fn(
    async () => options.sourceResult ?? createSourceResult(),
  );
  const insertAdoptionRecord = vi.fn(async (input) =>
    Object.hasOwn(options, "insertedRow")
      ? (options.insertedRow ?? null)
      : createAdoptionRow({
          review_status: input.reviewStatus,
          knowledge_node_candidate_snapshot:
            input.knowledgeNodeCandidateSnapshot,
          knowledge_node_candidate_digest: input.knowledgeNodeCandidateDigest,
          knowledge_node_resolution_snapshot:
            input.knowledgeNodeResolutionSnapshot,
          knowledge_node_resolution_digest: input.knowledgeNodeResolutionDigest,
        }),
  );
  const updateFormalDraftMetadata = vi.fn(
    async () =>
      options.updatedRow ??
      createAdoptionRow({
        formal_question_public_id: "question_formal_draft_177",
        formal_target_write_status: "draft_created",
      }),
  );
  const findKnowledgeNodesForResolution = vi.fn(async () =>
    options.knowledgeNodes === undefined
      ? [
          {
            publicId: "knowledge_node_public_marketing",
            knowledgeBasePublicId: "knowledge_base_public_marketing",
            profession: "marketing" as const,
            levelList: [3],
            isActive: true,
            isRecommendable: true,
          },
          {
            publicId: "knowledge_node_public_customer",
            knowledgeBasePublicId: "knowledge_base_public_marketing",
            profession: "marketing" as const,
            levelList: [3],
            isActive: true,
            isRecommendable: true,
          },
        ]
      : options.knowledgeNodes,
  );

  const gateway: AdminAiGenerationFormalAdoptionGateway = {
    findAdoptionBySourceResult,
    findSourceResultForAdoption,
    findKnowledgeNodesForResolution,
    insertAdoptionRecord,
    updateFormalDraftMetadata,
  };

  return {
    gateway,
    findAdoptionBySourceResult,
    findSourceResultForAdoption,
    findKnowledgeNodesForResolution,
    insertAdoptionRecord,
    updateFormalDraftMetadata,
  };
}

function createBaseInput() {
  const protectedGeneratedText = [
    "RAW",
    "ADMIN",
    "AI",
    "CONTENT",
    "MUST",
    "NOT",
    "LEAK",
  ].join(" ");
  const protectedProviderArtifact = [
    "RAW",
    "PROVIDER",
    "PAYLOAD",
    "MUST",
    "NOT",
    "LEAK",
  ].join(" ");

  return {
    adoptionPublicId: "admin_ai_formal_adoption_public_177",
    actor: {
      publicId: "admin_content_public_177",
      roles: ["content_admin"] as const,
    },
    resultPublicId: "admin_ai_generation_result_public_177",
    expectedContentDigest: "sha256:admin_ai_generation_result_177",
    expectedReviewDraftRevision: 0,
    expectedReviewDraftDigest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    targetType: "question" as const,
    reviewDecision: "approved" as const,
    reviewerConfirmed: true as const,
    weakEvidenceConfirmed: true,
    reviewedAt: new Date("2026-06-26T23:40:00.000Z"),
    protectedGeneratedText,
    protectedProviderArtifact,
  };
}

describe("admin AI generation formal adoption repository", () => {
  it("rejects a stale browser command before adoption persistence", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        currentReviewDraftPublicId: "admin_ai_review_draft_public_newer",
        currentReviewDraftRevision: 1,
        currentReviewDraftDigest:
          "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("review draft conflict");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("persists an immutable candidate and exact scoped resolution before returning a resolved draft", async () => {
    const candidate = createGeneratedKnowledgeCandidate();
    const sourceResult = createSourceResult({
      reviewedDraft: candidate,
    });
    const { gateway, findKnowledgeNodesForResolution, insertAdoptionRecord } =
      createGateway({ sourceResult });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);
    const input = {
      ...createBaseInput(),
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    };

    await repository.createOrReuseFormalAdoption(input);

    expect(findKnowledgeNodesForResolution).toHaveBeenCalledWith({
      knowledgeNodePublicIds: [
        "knowledge_node_public_marketing",
        "knowledge_node_public_customer",
      ],
    });
    expect(insertAdoptionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        knowledgeNodeCandidateSnapshot: expect.objectContaining({
          schemaVersion: 1,
          sourceContentDigest:
            candidate.knowledgeNodeConfirmation.sourceContentDigest,
          generatedLabels: ["营销基础", "客户需求"],
          profession: "marketing",
          level: 3,
        }),
        knowledgeNodeCandidateDigest: expect.stringMatching(
          /^sha256:[0-9a-f]{64}$/u,
        ),
        knowledgeNodeResolutionSnapshot: {
          schemaVersion: 1,
          decision: "approved",
          sourceContentDigest:
            candidate.knowledgeNodeConfirmation.sourceContentDigest,
          generatedLabels: ["营销基础", "客户需求"],
          mappings: input.knowledgeNodeResolutions,
        },
        knowledgeNodeResolutionDigest: expect.stringMatching(
          /^sha256:[0-9a-f]{64}$/u,
        ),
      }),
    );
  });

  it.each([
    {
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
      ],
    },
    {
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
        {
          label: "额外知识点",
          knowledgeNodePublicId: "knowledge_node_public_extra",
        },
      ],
    },
    {
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求 ",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    },
  ])(
    "rejects non-exact candidate mapping $knowledgeNodeResolutions",
    async ({ knowledgeNodeResolutions }) => {
      const { gateway, findKnowledgeNodesForResolution, insertAdoptionRecord } =
        createGateway({
          sourceResult: createSourceResult({
            reviewedDraft: createGeneratedKnowledgeCandidate(),
          }),
        });
      const repository =
        createAdminAiGenerationFormalAdoptionRepository(gateway);

      await expect(
        repository.createOrReuseFormalAdoption({
          ...createBaseInput(),
          knowledgeNodeResolutions,
        }),
      ).rejects.toThrow("knowledge node resolution conflict");
      expect(findKnowledgeNodesForResolution).not.toHaveBeenCalled();
      expect(insertAdoptionRecord).not.toHaveBeenCalled();
    },
  );

  it("accepts active scoped nodes whose empty level list authorizes every level", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        reviewedDraft: createGeneratedKnowledgeCandidate(),
      }),
      knowledgeNodes: [
        {
          publicId: "knowledge_node_public_marketing",
          knowledgeBasePublicId: "knowledge_base_public_marketing",
          profession: "marketing",
          levelList: [],
          isActive: true,
          isRecommendable: true,
        },
        {
          publicId: "knowledge_node_public_customer",
          knowledgeBasePublicId: "knowledge_base_public_marketing",
          profession: "marketing",
          levelList: [],
          isActive: true,
          isRecommendable: true,
        },
      ],
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await repository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    });

    expect(insertAdoptionRecord).toHaveBeenCalledOnce();
  });

  it("rejects inactive or out-of-level nodes without persisting an adoption", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        reviewedDraft: createGeneratedKnowledgeCandidate(),
      }),
      knowledgeNodes: [
        {
          publicId: "knowledge_node_public_marketing",
          knowledgeBasePublicId: "knowledge_base_public_marketing",
          profession: "marketing",
          levelList: [3],
          isActive: true,
          isRecommendable: true,
        },
        {
          publicId: "knowledge_node_public_customer",
          knowledgeBasePublicId: "knowledge_base_public_marketing",
          profession: "marketing",
          levelList: [4],
          isActive: false,
          isRecommendable: true,
        },
      ],
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        knowledgeNodeResolutions: [
          {
            label: "营销基础",
            knowledgeNodePublicId: "knowledge_node_public_marketing",
          },
          {
            label: "客户需求",
            knowledgeNodePublicId: "knowledge_node_public_customer",
          },
        ],
      }),
    ).rejects.toThrow("knowledge node resolution is not eligible");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects a resolution split across knowledge bases", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        reviewedDraft: createGeneratedKnowledgeCandidate(),
      }),
      knowledgeNodes: [
        {
          publicId: "knowledge_node_public_marketing",
          knowledgeBasePublicId: "knowledge_base_public_marketing_a",
          profession: "marketing",
          levelList: [3],
          isActive: true,
          isRecommendable: true,
        },
        {
          publicId: "knowledge_node_public_customer",
          knowledgeBasePublicId: "knowledge_base_public_marketing_b",
          profession: "marketing",
          levelList: [3],
          isActive: true,
          isRecommendable: true,
        },
      ],
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        knowledgeNodeResolutions: [
          {
            label: "营销基础",
            knowledgeNodePublicId: "knowledge_node_public_marketing",
          },
          {
            label: "客户需求",
            knowledgeNodePublicId: "knowledge_node_public_customer",
          },
        ],
      }),
    ).rejects.toThrow("knowledge node resolution is not eligible");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("reconstructs a server-owned resolved draft from the immutable adoption binding", async () => {
    const sourceResult = createSourceResult({
      reviewedDraft: createGeneratedKnowledgeCandidate(),
    });
    const first = createGateway({ sourceResult });
    const firstRepository = createAdminAiGenerationFormalAdoptionRepository(
      first.gateway,
    );
    await firstRepository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    });
    const insertInput = first.insertAdoptionRecord.mock.calls[0]?.[0];
    const second = createGateway({
      sourceResult,
      existingRow: createAdoptionRow({
        knowledge_node_candidate_snapshot:
          insertInput?.knowledgeNodeCandidateSnapshot ?? null,
        knowledge_node_candidate_digest:
          insertInput?.knowledgeNodeCandidateDigest ?? null,
        knowledge_node_resolution_snapshot:
          insertInput?.knowledgeNodeResolutionSnapshot ?? null,
        knowledge_node_resolution_digest:
          insertInput?.knowledgeNodeResolutionDigest ?? null,
      }),
    });
    const secondRepository = createAdminAiGenerationFormalAdoptionRepository(
      second.gateway,
    );

    const resolvedDraft =
      await secondRepository.findTrustedReviewedDraftForAdoption({
        expectedContentDigest: sourceResult.contentDigest,
        expectedReviewDraftRevision: 0,
        expectedReviewDraftDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        resultPublicId: sourceResult.resultPublicId,
        targetType: "question",
      });

    expect(resolvedDraft).toMatchObject({
      stemRichText: "trusted server-owned draft",
      difficulty: "medium",
      knowledgeNodePublicIds: [
        "knowledge_node_public_marketing",
        "knowledge_node_public_customer",
      ],
    });
    expect(JSON.stringify(resolvedDraft)).not.toContain(
      "knowledgeNodeConfirmation",
    );
  });

  it("persists an immutable rejected candidate without fabricating a mapping", async () => {
    const { gateway, findKnowledgeNodesForResolution, insertAdoptionRecord } =
      createGateway({
        sourceResult: createSourceResult({
          reviewedDraft: createGeneratedKnowledgeCandidate(),
        }),
      });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await repository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      reviewDecision: "rejected",
      knowledgeNodeResolutions: undefined,
    });

    expect(findKnowledgeNodesForResolution).not.toHaveBeenCalled();
    expect(insertAdoptionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        knowledgeNodeCandidateDigest: expect.stringMatching(
          /^sha256:[0-9a-f]{64}$/u,
        ),
        knowledgeNodeResolutionSnapshot: expect.objectContaining({
          decision: "rejected",
          mappings: [],
        }),
        knowledgeNodeResolutionDigest: expect.stringMatching(
          /^sha256:[0-9a-f]{64}$/u,
        ),
      }),
    );
  });

  it("rejects replay with a different immutable candidate resolution", async () => {
    const sourceResult = createSourceResult({
      reviewedDraft: createGeneratedKnowledgeCandidate(),
    });
    const first = createGateway({ sourceResult });
    const firstRepository = createAdminAiGenerationFormalAdoptionRepository(
      first.gateway,
    );
    await firstRepository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    });
    const insertInput = first.insertAdoptionRecord.mock.calls[0]?.[0];
    const second = createGateway({
      sourceResult,
      existingRow: createAdoptionRow({
        knowledge_node_candidate_snapshot:
          insertInput?.knowledgeNodeCandidateSnapshot ?? null,
        knowledge_node_candidate_digest:
          insertInput?.knowledgeNodeCandidateDigest ?? null,
        knowledge_node_resolution_snapshot:
          insertInput?.knowledgeNodeResolutionSnapshot ?? null,
        knowledge_node_resolution_digest:
          insertInput?.knowledgeNodeResolutionDigest ?? null,
      }),
    });
    const secondRepository = createAdminAiGenerationFormalAdoptionRepository(
      second.gateway,
    );

    await expect(
      secondRepository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        knowledgeNodeResolutions: [
          {
            label: "营销基础",
            knowledgeNodePublicId: "knowledge_node_public_customer",
          },
          {
            label: "客户需求",
            knowledgeNodePublicId: "knowledge_node_public_marketing",
          },
        ],
      }),
    ).rejects.toThrow("knowledge node resolution conflict");
    expect(second.insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("blocks platform formal adoption when the content AI result has no evidence", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        evidenceStatus: "none",
        citationCount: 0,
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("evidence status none blocks formal adoption");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("requires explicit weak evidence confirmation before adopting weak content AI results", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        evidenceStatus: "weak",
        citationCount: 1,
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        weakEvidenceConfirmed: undefined,
      }),
    ).rejects.toThrow("weak evidence confirmation is required");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("creates a redacted platform formal adoption plan for a reviewed content generated question result", async () => {
    const { gateway, findSourceResultForAdoption, insertAdoptionRecord } =
      createGateway({
        sourceResult: createSourceResult(),
        insertedRow: createAdoptionRow(),
      });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);
    const input = createBaseInput();

    const result = await repository.createOrReuseFormalAdoption(input);
    const serializedResult = JSON.stringify(result);

    expect(findSourceResultForAdoption).toHaveBeenCalledWith(
      "admin_ai_generation_result_public_177",
    );
    expect(insertAdoptionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        sourceResultPublicId: "admin_ai_generation_result_public_177",
        sourceTaskPublicId: "admin_ai_generation_task_public_177",
        sourceRequestPublicId: "admin_ai_generation_request_public_177",
        workspace: "content",
        targetType: "question",
        targetDomain: "platform_formal_content",
        reviewStatus: "approved_for_formal_adoption",
        formalTargetWriteStatus: "blocked_without_follow_up_task",
        formalQuestionPublicId: null,
        formalPaperPublicId: null,
        reviewerPublicId: "admin_content_public_177",
      }),
    );
    expect(result).toEqual({
      persistenceStatus: "created",
      adoption: {
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        sourceReference: {
          resultPublicId: "admin_ai_generation_result_public_177",
          taskPublicId: "admin_ai_generation_task_public_177",
          requestPublicId: "admin_ai_generation_request_public_177",
          workspace: "content",
          generationKind: "question",
          ownerType: "platform",
          ownerPublicId: "platform_content_review_pool",
          organizationPublicId: null,
        },
        targetReference: {
          targetType: "question",
          targetDomain: "platform_formal_content",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
        },
        review: {
          reviewStatus: "approved_for_formal_adoption",
          reviewDecision: "approved",
          reviewerPublicId: "admin_content_public_177",
          reviewedAt: "2026-06-26T23:40:00.000Z",
        },
        sourceSummary: {
          contentDigest: "sha256:admin_ai_generation_result_177",
          contentPreviewMasked: "masked admin AI result preview",
          evidenceStatus: "weak",
          citationCount: 1,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
        audit: {
          actionType: "admin_ai_generation_result.formal_adoption.approve",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_public_177",
          redactionStatus: "redacted",
        },
        reviewTraceability: {
          traceabilityStatus: "single_result_traceable",
          sourceGeneratedResultPublicId:
            "admin_ai_generation_result_public_177",
          validationStatus: "validated_for_formal_adoption",
          reviewStatus: "approved_for_formal_adoption",
          reviewDecision: "approved",
          reviewerPublicId: "admin_content_public_177",
          reviewedAt: "2026-06-26T23:40:00.000Z",
          adoptAction: {
            actionStatus: "executed",
            actionType: "admin_ai_generation_result.formal_adoption.approve",
            actorPublicId: "admin_content_public_177",
            actionAt: "2026-06-26T23:40:00.000Z",
            formalTargetWriteStatus: "blocked_without_follow_up_task",
            formalQuestionPublicId: null,
            formalPaperPublicId: null,
          },
          rejectAction: {
            actionStatus: "not_executed",
            actorPublicId: null,
            actionAt: null,
          },
          directPublishStatus: "blocked_requires_fresh_publish_task",
          auditSummary: {
            actionType: "admin_ai_generation_result.formal_adoption.approve",
            targetResourceType: "admin_ai_generation_result",
            targetPublicId: "admin_ai_generation_result_public_177",
            redactionStatus: "redacted",
          },
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
    });
    expect(serializedResult).not.toContain(input.protectedGeneratedText);
    expect(serializedResult).not.toContain(input.protectedProviderArtifact);
    expect(serializedResult).not.toMatch(/"id":/u);
  });

  it("records a redacted platform formal rejection without creating formal draft references", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult(),
      insertedRow: createAdoptionRow({
        review_status: "rejected",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);
    const input = {
      ...createBaseInput(),
      reviewDecision: "rejected" as const,
    };

    const result = await repository.createOrReuseFormalAdoption(input);
    const serializedResult = JSON.stringify(result);

    expect(insertAdoptionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        sourceResultPublicId: "admin_ai_generation_result_public_177",
        reviewStatus: "rejected",
        formalTargetWriteStatus: "blocked_without_follow_up_task",
        formalQuestionPublicId: null,
        formalPaperPublicId: null,
        reviewerPublicId: "admin_content_public_177",
      }),
    );
    expect(result).toMatchObject({
      persistenceStatus: "created",
      adoption: {
        targetReference: {
          targetType: "question",
          targetDomain: "platform_formal_content",
          formalTargetWriteStatus: "blocked_without_follow_up_task",
          formalQuestionPublicId: null,
          formalPaperPublicId: null,
        },
        review: {
          reviewStatus: "rejected",
          reviewDecision: "rejected",
          reviewerPublicId: "admin_content_public_177",
          reviewedAt: "2026-06-26T23:40:00.000Z",
        },
        audit: {
          actionType: "admin_ai_generation_result.formal_adoption.reject",
          targetResourceType: "admin_ai_generation_result",
          targetPublicId: "admin_ai_generation_result_public_177",
          redactionStatus: "redacted",
        },
        reviewTraceability: {
          traceabilityStatus: "single_result_traceable",
          reviewStatus: "rejected",
          reviewDecision: "rejected",
          adoptAction: {
            actionStatus: "not_executed",
            actorPublicId: null,
            actionAt: null,
          },
          rejectAction: {
            actionStatus: "executed",
            actionType: "admin_ai_generation_result.formal_adoption.reject",
            actorPublicId: "admin_content_public_177",
            actionAt: "2026-06-26T23:40:00.000Z",
          },
          directPublishStatus: "blocked_requires_fresh_publish_task",
          auditSummary: {
            actionType: "admin_ai_generation_result.formal_adoption.reject",
            redactionStatus: "redacted",
          },
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
    });
    expect(serializedResult).not.toContain(input.protectedGeneratedText);
    expect(serializedResult).not.toContain(input.protectedProviderArtifact);
    expect(serializedResult).not.toMatch(/"id":/u);
  });

  it("reuses an existing adoption plan for the same source result and target type", async () => {
    const existingRow = createAdoptionRow({
      adoption_public_id: "admin_ai_formal_adoption_public_existing",
    });
    const { gateway, insertAdoptionRecord } = createGateway({ existingRow });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    const result = await repository.createOrReuseFormalAdoption({
      ...createBaseInput(),
      adoptionPublicId: "admin_ai_formal_adoption_public_new",
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.adoption.adoptionPublicId).toBe(
      "admin_ai_formal_adoption_public_existing",
    );
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects a stale expected content digest before creating an adoption", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult(),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        expectedContentDigest: "sha256:stale_browser_digest",
      }),
    ).rejects.toThrow("content digest conflict");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects an opposite review decision instead of replaying the first persisted decision", async () => {
    const existingRow = createAdoptionRow({
      review_status: "rejected",
    });
    const { gateway, insertAdoptionRecord, updateFormalDraftMetadata } =
      createGateway({ existingRow });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("review decision conflict");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
    expect(updateFormalDraftMetadata).not.toHaveBeenCalled();
  });

  it("rejects a concurrently inserted opposite decision after the unique-key loser reloads", async () => {
    const { gateway, findAdoptionBySourceResult } = createGateway({
      insertedRow: null,
    });
    findAdoptionBySourceResult
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createAdoptionRow({ review_status: "rejected" }));
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("review decision conflict");
  });

  it("marks a reviewed content question adoption as a formal draft without exposing full content", async () => {
    const { gateway, updateFormalDraftMetadata } = createGateway({});
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    const result = await repository.markFormalDraftCreated({
      adoptionPublicId: "admin_ai_formal_adoption_public_177",
      formalPaperPublicId: null,
      formalQuestionPublicId: "question_formal_draft_177",
      targetType: "question",
    });

    expect(updateFormalDraftMetadata).toHaveBeenCalledWith({
      adoptionPublicId: "admin_ai_formal_adoption_public_177",
      formalPaperPublicId: null,
      formalQuestionPublicId: "question_formal_draft_177",
      targetType: "question",
    });
    expect(result).toMatchObject({
      persistenceStatus: "reused",
      adoption: {
        adoptionPublicId: "admin_ai_formal_adoption_public_177",
        targetReference: {
          targetType: "question",
          formalTargetWriteStatus: "draft_created",
          formalQuestionPublicId: "question_formal_draft_177",
          formalPaperPublicId: null,
        },
        reviewTraceability: {
          traceabilityStatus: "single_result_traceable",
          sourceGeneratedResultPublicId:
            "admin_ai_generation_result_public_177",
          adoptAction: {
            actionStatus: "executed",
            actorPublicId: "admin_content_public_177",
            formalTargetWriteStatus: "draft_created",
            formalQuestionPublicId: "question_formal_draft_177",
            formalPaperPublicId: null,
          },
          rejectAction: {
            actionStatus: "not_executed",
            actorPublicId: null,
            actionAt: null,
          },
          directPublishStatus: "blocked_requires_fresh_publish_task",
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/u);
  });

  it("rejects organization generated results from platform formal adoption", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        workspace: "organization",
        ownerType: "organization",
        ownerPublicId: "organization_public_177",
        organizationPublicId: "organization_public_177",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        actor: {
          publicId: "admin_org_public_177",
          roles: ["org_admin"],
        },
      }),
    ).rejects.toThrow(
      "organization AI generation formal adoption requires a separate organization-scoped task",
    );
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });

  it("rejects unconfirmed or target-mismatched adoption commands before inserting records", async () => {
    const { gateway, insertAdoptionRecord } = createGateway({
      sourceResult: createSourceResult({
        generationKind: "paper",
        taskType: "ai_paper_generation",
      }),
    });
    const repository = createAdminAiGenerationFormalAdoptionRepository(gateway);

    await expect(
      repository.createOrReuseFormalAdoption({
        ...createBaseInput(),
        reviewerConfirmed: false,
      }),
    ).rejects.toThrow(
      "explicit formal adoption review confirmation is required",
    );
    await expect(
      repository.createOrReuseFormalAdoption(createBaseInput()),
    ).rejects.toThrow("admin AI generation result target type mismatch");
    expect(insertAdoptionRecord).not.toHaveBeenCalled();
  });
});
