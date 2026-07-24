import { describe, expect, it } from "vitest";

import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";

import {
  createAdminAiGenerationCitationSnapshot,
  resolveAdminAiGenerationCitationProjection,
} from "./admin-ai-generation-citation";

const groundingContext = {
  evidenceStatus: "sufficient" as const,
  citationCount: 3,
  generationParameters: {
    profession: "marketing" as const,
    level: 3 as const,
    subject: "theory" as const,
    questionType: "single_choice",
    questionCount: 1,
    difficulty: "medium",
    learningObjective: null,
    knowledgeNode: null,
    knowledgeNodeMode: "balanced" as const,
    knowledgeNodePublicIds: [],
    includeDescendants: false,
    knowledgeNodeSupplement: null,
    sourcePreference: null,
  },
  citations: [
    {
      resourceTitle: "营销教材",
      headingPath: ["第三章", "客户分析"],
      chunkIndex: 7,
      chunkText: "PRIVATE_CHUNK_TEXT",
      score: 0.98,
    },
    {
      resourceTitle: "营销教材",
      headingPath: ["第三章", "客户分析"],
      chunkIndex: 8,
      chunkText: "ANOTHER_PRIVATE_CHUNK",
      score: 0.92,
    },
    {
      resourceTitle: "服务规范",
      headingPath: ["第一节"],
      chunkIndex: 1,
      chunkText: "PRIVATE_SERVICE_TEXT",
      score: 0.9,
    },
  ],
} satisfies AiGenerationRouteIntegratedGroundingContext;

describe("admin AI generation citation projection", () => {
  it("creates a bounded deduplicated snapshot containing only source titles and heading paths", () => {
    const snapshot = createAdminAiGenerationCitationSnapshot(groundingContext);

    expect(snapshot).toEqual({
      schemaVersion: 1,
      sourceCitationCount: 3,
      citations: [
        {
          resourceTitle: "营销教材",
          headingPath: ["第三章", "客户分析"],
        },
        { resourceTitle: "服务规范", headingPath: ["第一节"] },
      ],
    });
    expect(JSON.stringify(snapshot)).not.toMatch(
      /PRIVATE|chunkIndex|chunkText|score|publicId/u,
    );
    expect(resolveAdminAiGenerationCitationProjection(snapshot, 3)).toEqual({
      status: "available",
      sources: [
        {
          resourceTitle: "营销教材",
          headingPath: ["第三章", "客户分析"],
        },
        { resourceTitle: "服务规范", headingPath: ["第一节"] },
      ],
    });
  });

  it("marks a legacy null snapshot unavailable without inventing sources", () => {
    expect(resolveAdminAiGenerationCitationProjection(null, 3)).toEqual({
      status: "legacy_unavailable",
      sources: null,
    });
  });

  it.each([
    {
      name: "citation count drift",
      snapshot: {
        schemaVersion: 1,
        sourceCitationCount: 2,
        citations: [{ resourceTitle: "教材", headingPath: ["章节"] }],
      },
      citationCount: 3,
    },
    {
      name: "unknown snapshot field",
      snapshot: {
        schemaVersion: 1,
        sourceCitationCount: 1,
        citations: [
          {
            resourceTitle: "教材",
            headingPath: ["章节"],
            chunkText: "private",
          },
        ],
      },
      citationCount: 1,
    },
    {
      name: "control character",
      snapshot: {
        schemaVersion: 1,
        sourceCitationCount: 1,
        citations: [{ resourceTitle: "教材\n注入", headingPath: ["章节"] }],
      },
      citationCount: 1,
    },
    {
      name: "more than three projected sources",
      snapshot: {
        schemaVersion: 1,
        sourceCitationCount: 4,
        citations: [
          { resourceTitle: "A", headingPath: ["A"] },
          { resourceTitle: "B", headingPath: ["B"] },
          { resourceTitle: "C", headingPath: ["C"] },
          { resourceTitle: "D", headingPath: ["D"] },
        ],
      },
      citationCount: 4,
    },
  ])("fails closed for $name", ({ snapshot, citationCount }) => {
    expect(() =>
      resolveAdminAiGenerationCitationProjection(snapshot, citationCount),
    ).toThrow("citation snapshot");
  });

  it("rejects unsafe grounding metadata before persistence", () => {
    expect(() =>
      createAdminAiGenerationCitationSnapshot({
        ...groundingContext,
        citationCount: 1,
        citations: [
          {
            ...groundingContext.citations[0],
            resourceTitle: "教材\u0000路径",
          },
        ],
      }),
    ).toThrow("citation snapshot");
  });
});
