import { describe, expect, it } from "vitest";

import { aiGenerationSharedTaskSpecs } from "../contracts/ai-generation-task-spec-contract";
import {
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedStructuredPreviewOptionsForTask,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  isRouteIntegratedVisibleGeneratedContentAcceptableForDraft,
  qwenRouteIntegratedProviderLimits,
  qwenRouteIntegratedProviderMetadata,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";

function createStrictQuestionSetContent(
  questionCount: number,
  overrides: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    schemaVersion: "question_draft_v1",
    kind: "question_set",
    questions: Array.from({ length: questionCount }, (_, index) => ({
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["redacted_knowledge_node"],
      questionStem: `synthetic question stem ${index + 1}`,
      questionOptions: [
        { optionLabel: "A", optionText: "synthetic option A" },
        { optionLabel: "B", optionText: "synthetic option B" },
      ],
      standardAnswer: "A",
      analysis: "synthetic analysis",
      scoringPoints: [],
      fillBlankAnswers: [],
      ...overrides,
    })),
  });
}

describe("shared route-integrated Provider execution primitives", () => {
  it("normalizes the Qwen usage alias only at the Provider edge", () => {
    expect(
      summarizeRouteIntegratedProviderUsage({
        inputTokens: 10,
        outputTokens: 5,
        totalTokens: 15,
      }),
    ).toEqual({
      inputTokenCount: 10,
      outputTokenCount: 5,
      totalTokenCount: 15,
    });
    expect(
      summarizeRouteIntegratedProviderUsage({ inputTokens: 10 }),
    ).toBeNull();
    expect(() =>
      summarizeRouteIntegratedProviderUsage({
        inputTokens: 10,
        outputTokens: 5,
        totalTokens: 15,
        total_tokens: 15,
      }),
    ).toThrow();
  });

  it("rejects legacy questions-only and plaintext question drafts", () => {
    const legacyJson = createRouteIntegratedVisibleGeneratedContent(
      JSON.stringify({
        questions: [{ questionType: "single_choice" }],
      }),
      {
        structuredPreview: { kind: "question_set", requestedQuestionCount: 1 },
      },
    );
    const plainText = createRouteIntegratedVisibleGeneratedContent(
      "1. synthetic plaintext draft",
      {
        structuredPreview: { kind: "question_set", requestedQuestionCount: 1 },
      },
    );

    expect(legacyJson?.structuredPreview).toMatchObject({
      parseStatus: "failed",
    });
    expect(plainText?.structuredPreview).toMatchObject({
      parseStatus: "failed",
    });
  });

  it("accepts only the explicit strict question_draft_v1 envelope", () => {
    const visible = createRouteIntegratedVisibleGeneratedContent(
      JSON.stringify({
        schemaVersion: "question_draft_v1",
        kind: "question_set",
        questions: [
          {
            questionType: "single_choice",
            difficulty: "medium",
            knowledgeNodeLabels: ["synthetic"],
            questionStem: "synthetic stem",
            questionOptions: [
              { optionLabel: "A", optionText: "a" },
              { optionLabel: "B", optionText: "b" },
            ],
            standardAnswer: "A",
            analysis: "synthetic analysis",
            scoringPoints: [],
            fillBlankAnswers: [],
          },
        ],
      }),
      {
        structuredPreview: { kind: "question_set", requestedQuestionCount: 1 },
      },
    );

    expect(visible?.structuredPreview).toMatchObject({
      parseStatus: "parsed",
      requestedQuestionCount: 1,
      actualQuestionCount: 1,
      draftCount: 1,
    });
  });

  it.each([
    [
      "unknown option field",
      { optionLabel: "A", optionText: "a", isCorrect: true },
    ],
    ["legacy option aliases", { label: "A", text: "a" }],
  ])("rejects %s instead of normalizing it", (_label, firstOption) => {
    const visible = createRouteIntegratedVisibleGeneratedContent(
      createStrictQuestionSetContent(1, {
        questionOptions: [firstOption, { optionLabel: "B", optionText: "b" }],
      }),
      {
        structuredPreview: { kind: "question_set", requestedQuestionCount: 1 },
      },
    );

    expect(visible?.structuredPreview).toMatchObject({
      parseStatus: "failed",
      failureCategory: "question_contract_invalid",
    });
  });

  it.each([
    {
      questionType: "single_choice",
      fields: {
        questionOptions: [
          { optionLabel: "A", optionText: "a" },
          { optionLabel: "B", optionText: "b" },
        ],
        standardAnswer: "A",
        scoringPoints: [],
        fillBlankAnswers: [],
      },
    },
    {
      questionType: "multi_choice",
      fields: {
        questionOptions: [
          { optionLabel: "A", optionText: "a" },
          { optionLabel: "B", optionText: "b" },
          { optionLabel: "C", optionText: "c" },
        ],
        standardAnswer: "B, A",
        scoringPoints: [],
        fillBlankAnswers: [],
      },
    },
    {
      questionType: "true_false",
      fields: {
        questionOptions: [],
        standardAnswer: "false",
        scoringPoints: [],
        fillBlankAnswers: [],
      },
    },
    {
      questionType: "fill_blank",
      fields: {
        questionOptions: [],
        standardAnswer: "synthetic fill answer",
        scoringPoints: [],
        fillBlankAnswers: [
          {
            blankKey: "blank_1",
            standardAnswers: ["synthetic fill answer"],
            score: "1.0",
            sortOrder: 1,
          },
        ],
      },
    },
    ...["short_answer", "case_analysis", "calculation"].map((questionType) => ({
      questionType,
      fields: {
        questionOptions: [],
        standardAnswer: `synthetic ${questionType} answer`,
        scoringPoints: [
          { description: "synthetic point", score: "1.0", sortOrder: 1 },
        ],
        fillBlankAnswers: [],
      },
    })),
  ])(
    "accepts the exact $questionType question contract",
    ({ questionType, fields }) => {
      const visible = createRouteIntegratedVisibleGeneratedContent(
        createStrictQuestionSetContent(1, { questionType, ...fields }),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 1,
          },
        },
      );

      expect(visible?.structuredPreview).toMatchObject({
        parseStatus: "parsed",
        actualQuestionCount: 1,
        draftSummaries: [
          expect.objectContaining({ questionType, draftNumber: 1 }),
        ],
      });
    },
  );

  it("rejects duplicate JSON keys and Markdown-fenced question drafts", () => {
    const strictContent = createStrictQuestionSetContent(1);
    const duplicateKeyContent = strictContent.replace(
      '"schemaVersion":"question_draft_v1"',
      '"schemaVersion":"question_draft_v1","schemaVersion":"question_draft_v1"',
    );

    for (const content of [
      duplicateKeyContent,
      `\`\`\`json\n${strictContent}\n\`\`\``,
    ]) {
      expect(
        createRouteIntegratedVisibleGeneratedContent(content, {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 1,
          },
        })?.structuredPreview,
      ).toMatchObject({ parseStatus: "failed" });
    }
  });
  it("creates a provider-disabled outcome without Provider, env, or configuration access", () => {
    expect(
      createDefaultBlockedRouteIntegratedProviderExecutionOutcome(),
    ).toEqual({
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      aiCallLogPublicId: null,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "provider_call_blocked",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      visibleGeneratedContent: null,
    });
  });

  it("shares the existing Qwen metadata and local call limits without reading credentials", () => {
    expect(qwenRouteIntegratedProviderMetadata).toEqual({
      modelProvider: "openai_compatible",
      providerName: "alibaba-qwen",
      modelName: "qwen3.7-max",
      baseUrlHost: "dashscope.aliyuncs.com",
      envKeyAlias: "ALIBABA_API_KEY",
    });
    expect(qwenRouteIntegratedProviderLimits).toEqual({
      maxRequests: 1,
      maxRetries: 0,
      maxOutputTokens: 1800,
      timeoutMs: 60000,
    });
  });

  it("defines AI question and paper generation task specs in one shared contract", () => {
    expect(aiGenerationSharedTaskSpecs.ai_question_generation).toMatchObject({
      taskType: "ai_question_generation",
      label: "AI出题",
      structuredPreviewKind: "question_set",
      countSemantic: "exact_requested_question_count",
      defaultQuestionCount: 3,
      maxQuestionCount: 10,
      redactionCategory: "question_draft_summary_only",
    });
    expect(
      aiGenerationSharedTaskSpecs.ai_question_generation.allowedOutputFields,
    ).toEqual(["questions", "questionDrafts", "question_drafts"]);

    expect(aiGenerationSharedTaskSpecs.ai_paper_generation).toMatchObject({
      taskType: "ai_paper_generation",
      label: "AI组卷",
      structuredPreviewKind: "paper_draft",
      countSemantic: "requested_total_question_count",
      defaultQuestionCount: 30,
      maxQuestionCount: 80,
      redactionCategory: "paper_plan_summary_only",
    });
    expect(
      aiGenerationSharedTaskSpecs.ai_paper_generation.allowedOutputFields,
    ).toEqual([
      "title",
      "targetQuestionCount",
      "difficultyGoal",
      "sourcePreference",
      "questionTypeDistribution",
      "paperStructure",
      "sections",
      "knowledgeCoverage",
    ]);
  });

  it("normalizes transient visible generated content outside execution evidence", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent("  可见预览内容  "),
    ).toEqual({
      content: "可见预览内容",
      contentVisibility: "transient_response_only",
      persistenceStatus: "not_persisted",
      safetyStatus: "checked",
    });
    expect(createRouteIntegratedVisibleGeneratedContent("   ")).toBeNull();
    expect(createRouteIntegratedVisibleGeneratedContent(null)).toBeNull();
  });

  it("builds a parsed question-set structured preview with product-visible draft fields", () => {
    const content = createStrictQuestionSetContent(10);

    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      });

    expect(visibleGeneratedContent).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "parsed",
        requestedQuestionCount: 10,
        actualQuestionCount: 10,
        draftCount: 10,
      },
    });
    expect(
      visibleGeneratedContent?.structuredPreview?.kind === "question_set" &&
        visibleGeneratedContent.structuredPreview.parseStatus === "parsed"
        ? visibleGeneratedContent.structuredPreview.draftSummaries[0]
        : null,
    ).toMatchObject({
      draftNumber: 1,
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeCount: 1,
      knowledgeNodeLabels: ["redacted_knowledge_node"],
      questionStem: "synthetic question stem 1",
      questionOptions: [
        { optionLabel: "A", optionText: "synthetic option A" },
        { optionLabel: "B", optionText: "synthetic option B" },
      ],
      standardAnswer: "A",
      analysis: "synthetic analysis",
      scoringPoints: [],
      fillBlankAnswers: [],
      reviewStatus: "draft_review_required",
    });
  });

  it("parses structured preview from the full provider text before truncating visible content", () => {
    const content = createStrictQuestionSetContent(10, {
      analysis: "redacted draft summary ".repeat(30),
    });

    expect(content.length).toBeGreaterThan(2000);

    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      });

    expect(visibleGeneratedContent?.content.length).toBeLessThanOrEqual(2000);
    expect(visibleGeneratedContent?.structuredPreview).toMatchObject({
      kind: "question_set",
      parseStatus: "parsed",
      requestedQuestionCount: 10,
      actualQuestionCount: 10,
      draftCount: 10,
    });
  });

  it("reports a structured parse failure when question count mismatches the requested quantity", () => {
    const content = createStrictQuestionSetContent(2);

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 10,
        actualQuestionCount: 2,
        failureCategory: "question_count_mismatch",
        draftCount: 0,
        draftSummaries: [],
      },
    });
  });

  it.each([
    ["questionDrafts", "questionDrafts"],
    ["question_drafts", "question_drafts"],
  ] as const)(
    "rejects legacy question-set root %s",
    (_label, questionArrayKey) => {
      const content = JSON.stringify({
        [questionArrayKey]: [],
      });

      expect(
        createRouteIntegratedVisibleGeneratedContent(content, {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        }),
      ).toMatchObject({
        structuredPreview: {
          kind: "question_set",
          parseStatus: "failed",
          requestedQuestionCount: 3,
          actualQuestionCount: null,
          draftCount: 0,
        },
      });
    },
  );

  it.each([
    [
      "root array",
      Array.from({ length: 3 }, () => ({
        questionType: "single_choice",
      })),
    ],
    [
      "items array",
      {
        items: Array.from({ length: 3 }, () => ({
          questionType: "single_choice",
        })),
      },
    ],
    [
      "nested data questionList",
      {
        data: {
          questionList: Array.from({ length: 3 }, () => ({
            questionType: "single_choice",
          })),
        },
      },
    ],
    [
      "question_set question_items",
      {
        question_set: {
          question_items: Array.from({ length: 3 }, () => ({
            questionType: "single_choice",
          })),
        },
      },
    ],
  ] as const)(
    "rejects compatible legacy question root %s",
    (_label, contentObject) => {
      expect(
        createRouteIntegratedVisibleGeneratedContent(
          JSON.stringify(contentObject),
          {
            structuredPreview: {
              kind: "question_set",
              requestedQuestionCount: 3,
            },
          },
        ),
      ).toMatchObject({
        structuredPreview: {
          kind: "question_set",
          parseStatus: "failed",
          requestedQuestionCount: 3,
          actualQuestionCount: null,
          draftCount: 0,
        },
      });
    },
  );

  it("keeps exact-count enforcement for compatible question roots", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createStrictQuestionSetContent(2),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 3,
        actualQuestionCount: 2,
        failureCategory: "question_count_mismatch",
      },
    });
  });

  it("rejects question-set previews when generated question parameters mismatch the request", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createStrictQuestionSetContent(1, {
          questionType: "multi_choice",
          standardAnswer: "A B",
        }),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 1,
            generationParameters: {
              questionType: "single_choice",
              difficulty: "medium",
            },
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        failureCategory: "question_type_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createStrictQuestionSetContent(1, {
          difficulty: "easy",
        }),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 1,
            generationParameters: {
              questionType: "single_choice",
              difficulty: "medium",
            },
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        failureCategory: "difficulty_mismatch",
      },
    });
  });

  it("rejects exact numbered plaintext drafts", () => {
    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(
        [
          "1. redacted draft marker",
          "2. redacted draft marker",
          "3. redacted draft marker",
        ].join("\n"),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        },
      );

    expect(visibleGeneratedContent?.structuredPreview).toMatchObject({
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: 3,
      actualQuestionCount: null,
      failureCategory: "invalid_json",
      draftCount: 0,
    });

    expect(visibleGeneratedContent?.structuredPreview).toMatchObject({
      draftSummaries: [],
    });
  });

  it("rejects common Chinese numbered draft markers", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent(
        ["第1题：redacted", "题目2：redacted", "3、redacted"].join("\n"),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 3,
        actualQuestionCount: null,
        failureCategory: "invalid_json",
        draftCount: 0,
      },
    });
  });

  it("reports a structured parse failure when numbered plaintext count mismatches the requested quantity", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent(
        ["1. redacted", "2. redacted"].join("\n"),
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 3,
        actualQuestionCount: null,
        failureCategory: "invalid_json",
        draftCount: 0,
        draftSummaries: [],
      },
    });
  });

  it("does not accept arbitrary non-JSON prose as a question-set structured preview", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent(
        "本次生成内容包含多个草稿，但没有稳定编号标记。",
        {
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 3,
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 3,
        actualQuestionCount: null,
        failureCategory: "invalid_json",
        draftCount: 0,
        draftSummaries: [],
      },
    });
  });

  it("reports a safe missing-questions failure for unsupported question roots", () => {
    const content = JSON.stringify({
      choices: Array.from({ length: 3 }, () => ({
        questionType: "single_choice",
      })),
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 3,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 3,
        actualQuestionCount: null,
        failureCategory: "schema_mismatch",
        draftCount: 0,
        draftSummaries: [],
      },
    });
  });

  it("derives bounded question-set preview counts from task generation parameters", () => {
    expect(
      createRouteIntegratedStructuredPreviewOptionsForTask(
        "ai_question_generation",
        {
          generationParameters: {
            questionCount: 5,
          },
        },
      ),
    ).toEqual({
      kind: "question_set",
      requestedQuestionCount: 5,
      generationParameters: {
        questionCount: 5,
      },
    });

    expect(
      createRouteIntegratedStructuredPreviewOptionsForTask(
        "ai_question_generation",
        {
          generationParameters: {
            questionCount: 20,
          },
        },
      ),
    ).toEqual({
      kind: "question_set",
      requestedQuestionCount: 10,
      generationParameters: {
        questionCount: 20,
      },
    });
  });

  it("carries bounded paper requested question counts from task generation parameters", () => {
    expect(
      createRouteIntegratedStructuredPreviewOptionsForTask(
        "ai_paper_generation",
        {
          generationParameters: {
            questionCount: 20,
          },
        },
      ),
    ).toEqual({
      kind: "paper_draft",
      requestedQuestionCount: 20,
      generationParameters: {
        questionCount: 20,
      },
    });

    expect(
      createRouteIntegratedStructuredPreviewOptionsForTask(
        "ai_paper_generation",
        {
          generationParameters: {
            questionCount: 99,
          },
        },
      ),
    ).toEqual({
      kind: "paper_draft",
      requestedQuestionCount: 80,
      generationParameters: {
        questionCount: 99,
      },
    });
  });

  it("builds a parsed paper structured preview from section and coverage counts", () => {
    const content = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 50,
      sections: [
        {
          paperSectionType: "single_choice",
          title: "synthetic paper section title",
          questionCount: 20,
        },
        { paperSectionType: "judge", questionCount: 30 },
      ],
      questionTypeDistribution: {
        single_choice: 20,
        judge: 30,
      },
      knowledgeCoverage: [
        "redacted_knowledge_node_a",
        "redacted_knowledge_node_b",
      ],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "parsed",
        paperSectionCount: 2,
        questionCount: 50,
        questionTypeDistributionCount: 2,
        knowledgeCoverageCount: 2,
        reviewStatus: "draft_review_required",
      },
    });
    const structuredPreview = createRouteIntegratedVisibleGeneratedContent(
      content,
      {
        structuredPreview: {
          kind: "paper_draft",
        },
      },
    )?.structuredPreview;

    expect(
      structuredPreview?.kind === "paper_draft" &&
        structuredPreview.parseStatus === "parsed"
        ? structuredPreview.paperSectionSummaries[0]
        : null,
    ).toMatchObject({
      sectionNumber: 1,
      paperSectionType: "single_choice",
      title: "synthetic paper section title",
      questionCount: 20,
      questionDrafts: [],
    });
  });

  it("rejects paper structured previews that include Provider-generated nested question content", () => {
    const content = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 1,
      sections: [
        {
          paperSectionType: "single_choice",
          questionCount: 1,
          questions: [
            {
              questionStem: "synthetic forbidden stem",
              standardAnswer: "synthetic forbidden answer",
            },
          ],
        },
      ],
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 1,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "provider_question_content_forbidden",
        requestedQuestionCount: 1,
        paperSectionCount: 1,
        questionCount: 1,
        reviewStatus: "structured_parse_failed",
      },
    });
  });

  it("rejects paper structured previews when plan parameters mismatch the request", () => {
    const content = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 30,
      sourcePreference: "prefer_platform",
      questionTypeDistribution: "balanced_40_30_30",
      paperStructure: "by_question_type",
      sections: [
        {
          paperSectionType: "single_choice",
          questionCount: 30,
        },
      ],
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
          generationParameters: {
            sourcePreference: "prefer_enterprise",
            questionTypeDistribution: "balanced_40_30_30",
            paperStructure: "by_question_type",
          },
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "source_preference_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
          generationParameters: {
            sourcePreference: "prefer_platform",
            questionTypeDistribution: "weak_point_priority",
            paperStructure: "by_question_type",
          },
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "question_type_distribution_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
          generationParameters: {
            sourcePreference: "prefer_platform",
            questionTypeDistribution: "balanced_40_30_30",
            paperStructure: "by_knowledge_node",
          },
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "paper_structure_mismatch",
      },
    });
  });

  it("rejects paper structured previews when Provider difficulty or knowledge scope drifts from the server request", () => {
    const createPlan = (override: Record<string, unknown>) =>
      JSON.stringify({
        title: "synthetic constrained paper plan",
        targetQuestionCount: 1,
        difficultyGoal: "medium",
        sections: [
          {
            paperSectionType: "single_choice",
            questionCount: 1,
            difficulty: "medium",
            knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
          },
        ],
        knowledgeCoverage: {
          targetKnowledgeNodePublicIds: ["knowledge_node_public_allowed"],
          targetParentKnowledgeNodePublicIds: [],
        },
        ...override,
      });
    const options = {
      structuredPreview: {
        kind: "paper_draft" as const,
        requestedQuestionCount: 1,
        generationParameters: {
          difficulty: "medium",
          knowledgeNodePublicIds: [
            "knowledge_node_public_allowed",
            "knowledge_node_public_second",
          ],
        },
      },
    };

    expect(
      createRouteIntegratedVisibleGeneratedContent(createPlan({}), options),
    ).toMatchObject({
      structuredPreview: {
        parseStatus: "parsed",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createPlan({ difficultyGoal: "hard" }),
        options,
      ),
    ).toMatchObject({
      structuredPreview: {
        parseStatus: "failed",
        failureCategory: "difficulty_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createPlan({
          knowledgeCoverage: {
            targetKnowledgeNodePublicIds: ["knowledge_node_public_other"],
          },
        }),
        options,
      ),
    ).toMatchObject({
      structuredPreview: {
        parseStatus: "failed",
        failureCategory: "knowledge_scope_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createPlan({
          sections: [
            {
              paperSectionType: "single_choice",
              questionCount: 1,
              difficulty: "medium",
              knowledgeNodePublicIds: ["knowledge_node_public_other"],
            },
          ],
        }),
        options,
      ),
    ).toMatchObject({
      structuredPreview: {
        parseStatus: "failed",
        failureCategory: "knowledge_scope_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        createPlan({
          sections: [
            {
              paperSectionType: "single_choice",
              questionCount: 1,
              difficulty: "medium",
              knowledgeNodePublicIds: ["knowledge_node_public_second"],
            },
          ],
        }),
        options,
      ),
    ).toMatchObject({
      structuredPreview: {
        parseStatus: "failed",
        failureCategory: "knowledge_scope_mismatch",
      },
    });

    for (const knowledgeCoverage of [
      {
        targetKnowledgeNodePublicIds: [
          "knowledge_node_public_allowed",
          "knowledge_node_public_allowed",
        ],
      },
      {
        targetKnowledgeNodePublicIds: ["knowledge_node_public_allowed"],
        targetParentKnowledgeNodePublicIds: [
          "knowledge_node_parent_public_injected",
        ],
      },
    ]) {
      expect(
        createRouteIntegratedVisibleGeneratedContent(
          createPlan({ knowledgeCoverage }),
          options,
        ),
      ).toMatchObject({
        structuredPreview: {
          parseStatus: "failed",
          failureCategory: "knowledge_scope_mismatch",
        },
      });
    }
  });

  it("rejects paper structured previews when section counts do not match the requested question type distribution", () => {
    const content = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 30,
      sourcePreference: "prefer_platform",
      questionTypeDistribution: "balanced_40_30_30",
      paperStructure: "by_question_type",
      sections: [
        {
          paperSectionType: "single_choice",
          questionCount: 30,
        },
      ],
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
          generationParameters: {
            sourcePreference: "prefer_platform",
            questionTypeDistribution: "balanced_40_30_30",
            paperStructure: "by_question_type",
          },
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "question_type_distribution_mismatch",
      },
    });
  });

  it("rejects paper structured previews when sections do not match the requested paper structure", () => {
    const mixedQuestionTypeSection = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 30,
      sourcePreference: "prefer_platform",
      questionTypeDistribution: "weak_point_priority",
      paperStructure: "by_question_type",
      sections: [
        {
          paperSectionType: "综合题",
          questionTypes: ["single_choice", "multi_choice"],
          questionCount: 30,
        },
      ],
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });
    const missingKnowledgeNodeSection = JSON.stringify({
      title: "synthetic paper plan title",
      targetQuestionCount: 30,
      sourcePreference: "prefer_platform",
      questionTypeDistribution: "weak_point_priority",
      paperStructure: "by_knowledge_node",
      sections: [
        {
          paperSectionType: "single_choice",
          questionCount: 30,
        },
      ],
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(mixedQuestionTypeSection, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
          generationParameters: {
            sourcePreference: "prefer_platform",
            questionTypeDistribution: "weak_point_priority",
            paperStructure: "by_question_type",
          },
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "paper_structure_mismatch",
      },
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(
        missingKnowledgeNodeSection,
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 30,
            generationParameters: {
              sourcePreference: "prefer_platform",
              questionTypeDistribution: "weak_point_priority",
              paperStructure: "by_knowledge_node",
            },
          },
        },
      ),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "paper_structure_mismatch",
      },
    });
  });

  it.each([
    [
      "top-level questionCount",
      {
        paperSections: [{ paperSectionType: "single_choice" }],
        questionCount: 50,
      },
      50,
    ],
    [
      "top-level totalQuestionCount",
      {
        paperSections: [{ paperSectionType: "single_choice" }],
        totalQuestionCount: 50,
      },
      50,
    ],
    [
      "top-level targetQuestionCount",
      {
        sections: [{ paperSectionType: "single_choice" }],
        targetQuestionCount: 50,
      },
      50,
    ],
    [
      "section questionCount",
      {
        sections: [
          { paperSectionType: "single_choice", questionCount: 20 },
          { paperSectionType: "judge", questionCount: 30 },
        ],
      },
      50,
    ],
    [
      "question type distribution totals",
      {
        paperSections: [{ paperSectionType: "single_choice" }],
        questionTypeDistribution: {
          single_choice: 20,
          judge: 30,
        },
      },
      50,
    ],
  ] as const)(
    "recognizes paper question count from %s",
    (_label, contentObject, expectedQuestionCount) => {
      expect(
        createRouteIntegratedVisibleGeneratedContent(
          JSON.stringify(contentObject),
          {
            structuredPreview: {
              kind: "paper_draft",
              requestedQuestionCount: expectedQuestionCount,
            },
          },
        ),
      ).toMatchObject({
        structuredPreview: {
          kind: "paper_draft",
          parseStatus: "parsed",
          paperSectionCount: expect.any(Number) as number,
          questionCount: expectedQuestionCount,
          reviewStatus: "draft_review_required",
        },
      });
    },
  );

  it("reports a safe paper count mismatch failure when requested count differs", () => {
    const content = JSON.stringify({
      paperSections: [
        { paperSectionType: "single_choice", questionCount: 20 },
        { paperSectionType: "judge", questionCount: 29 },
      ],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 50,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "question_count_mismatch",
        requestedQuestionCount: 50,
        questionCount: 49,
        paperSectionCount: 2,
        reviewStatus: "structured_parse_failed",
      },
    });
  });

  it("reports a safe missing-count failure when paper count cannot be derived", () => {
    const content = JSON.stringify({
      paperSections: [{ paperSectionType: "single_choice" }],
      knowledgeCoverage: ["redacted_knowledge_node"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 50,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "missing_question_count",
        requestedQuestionCount: 50,
        questionCount: null,
        paperSectionCount: 1,
        reviewStatus: "structured_parse_failed",
      },
    });
  });

  it("accepts persisted drafts only when grounding and structured preview both pass", () => {
    const groundedQuestionSet = createRouteIntegratedVisibleGeneratedContent(
      createStrictQuestionSetContent(10),
      {
        groundingSummary: {
          evidenceStatus: "sufficient",
          citationCount: 1,
        },
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      },
    );
    const weakQuestionSet = createRouteIntegratedVisibleGeneratedContent(
      createStrictQuestionSetContent(10),
      {
        groundingSummary: {
          evidenceStatus: "weak",
          citationCount: 1,
        },
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      },
    );
    const failedStructuredPreview =
      createRouteIntegratedVisibleGeneratedContent(
        createStrictQuestionSetContent(1),
        {
          groundingSummary: {
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
          structuredPreview: {
            kind: "question_set",
            requestedQuestionCount: 10,
          },
        },
      );

    expect(
      isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
        groundedQuestionSet,
        "question_set",
      ),
    ).toBe(true);
    expect(
      isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
        groundedQuestionSet,
        "paper_draft",
      ),
    ).toBe(false);
    expect(
      isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
        weakQuestionSet,
        "question_set",
      ),
    ).toBe(false);
    expect(
      isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
        failedStructuredPreview,
        "question_set",
      ),
    ).toBe(false);
    expect(
      isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
        null,
        "question_set",
      ),
    ).toBe(false);
  });

  it("does not derive AI paper plan counts from nested generated question arrays", () => {
    const content = JSON.stringify({
      paperSections: [
        {
          paperSectionType: "single_choice",
          questions: [
            { redactedDraftSummary: "synthetic question summary a" },
            { redactedDraftSummary: "synthetic question summary b" },
          ],
        },
        {
          paperSectionType: "judge",
          questionDrafts: [
            { redactedDraftSummary: "synthetic question summary c" },
          ],
        },
      ],
      questionTypeDistribution: {
        single_choice: 2,
        judge: 1,
      },
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "failed",
        failureCategory: "provider_question_content_forbidden",
        paperSectionCount: 2,
        questionCount: 3,
        questionTypeDistributionCount: 2,
        knowledgeCoverageCount: 1,
        reviewStatus: "structured_parse_failed",
      },
    });
  });

  it("converts forbidden evidence values into a redaction violation summary", () => {
    const summary = ensureRouteIntegratedProviderExecutionSummaryRedacted(
      {
        requestCount: 1,
        resultStatus: "fail",
        failureCategory: "provider_error",
        durationMs: 15,
        usageSummary: null,
        providerErrorSummary: {
          httpStatus: 403,
          providerErrorCode: "synthetic-secret-value",
        },
        redactionStatus: "redacted",
      },
      ["synthetic-secret-value"],
    );

    expect(summary).toEqual(
      createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      ),
    );
  });
});
