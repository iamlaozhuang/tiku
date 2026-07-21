import { describe, expect, it } from "vitest";

import { getTableConfig } from "drizzle-orm/pg-core";

import { paper } from "@/db/schema/paper";
import { createAdminContentKnowledgeListQuery } from "@/server/contracts/admin-content-knowledge-ops-contract";
import { mapPaperDraftToApi } from "@/server/mappers/paper-draft-mapper";
import { paperGenerationMethodValues } from "@/server/models/paper";
import { createPostgresAdminFlowRuntimeRepositories } from "@/server/repositories/admin-flow-runtime-repository";
import type { PaperDraftAccessRow } from "@/server/repositories/paper-draft-repository";
import {
  normalizeCreatePaperInput,
  normalizeUpdatePaperInput,
} from "@/server/validators/paper-draft";

function createAwaitableSelectBuilder(rows: unknown[]) {
  const builder = {
    from() {
      return builder;
    },
    groupBy() {
      return builder;
    },
    innerJoin() {
      return builder;
    },
    leftJoin() {
      return builder;
    },
    limit() {
      return builder;
    },
    offset() {
      return builder;
    },
    orderBy() {
      return builder;
    },
    then<TResult1 = unknown[], TResult2 = never>(
      onFulfilled?:
        | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
        | null,
      onRejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(rows).then(onFulfilled, onRejected);
    },
    where() {
      return builder;
    },
  };

  return builder;
}

function createPaperRow(
  overrides: Partial<PaperDraftAccessRow> = {},
): PaperDraftAccessRow {
  return {
    id: 95,
    public_id: "paper-public-metadata-95",
    name: "2026 年 6 月区域营销真题",
    profession: "marketing",
    level: 3,
    subject: "theory",
    paper_status: "draft",
    paper_type: "past_paper",
    year: 2026,
    month: 6,
    source: "命题单位公开资料",
    source_region: "华东",
    source_organization: "区域技能鉴定中心",
    question_basis: "2026 营销职业标准",
    generation_method: "manual",
    duration_minute: 120,
    total_score: "100.0",
    revision: 4,
    published_at: null,
    archived_at: null,
    paper_sections: [],
    question_groups: [],
    created_at: new Date("2026-07-21T08:00:00.000Z"),
    updated_at: new Date("2026-07-21T09:00:00.000Z"),
    ...overrides,
  };
}

describe("F-0095 paper metadata truth", () => {
  it("persists the complete optional metadata and generation enum", () => {
    const columns = getTableConfig(paper).columns.map((column) => column.name);

    expect(columns).toEqual(
      expect.arrayContaining([
        "month",
        "source_region",
        "source_organization",
        "question_basis",
        "generation_method",
      ]),
    );
    expect(paperGenerationMethodValues).toEqual(["manual", "ai", "mixed"]);
  });

  it("normalizes complete nullable metadata and rejects invalid months", () => {
    const validInput = {
      commandPublicId: "paper-command-metadata-95",
      name: "  区域营销真题  ",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      year: 2026,
      month: 6,
      sourceDescription: "  公开资料整理  ",
      sourceRegion: "  华东  ",
      sourceOrganization: "  区域技能鉴定中心  ",
      questionBasis: "  2026 营销职业标准  ",
      generationMethod: "manual",
      durationMinute: 120,
      totalScore: "100.0",
    };

    expect(normalizeCreatePaperInput(validInput)).toEqual({
      success: true,
      value: {
        ...validInput,
        name: "区域营销真题",
        sourceDescription: "公开资料整理",
        sourceRegion: "华东",
        sourceOrganization: "区域技能鉴定中心",
        questionBasis: "2026 营销职业标准",
      },
    });
    expect(
      normalizeUpdatePaperInput({
        ...validInput,
        commandPublicId: undefined,
        expectedRevision: 4,
        month: 13,
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
  });

  it("accepts the legacy source input only as an unambiguous sourceDescription alias", () => {
    const baseInput = {
      commandPublicId: "paper-command-legacy-source-95",
      name: "Legacy source paper",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      year: 2026,
      month: null,
      sourceRegion: null,
      sourceOrganization: null,
      questionBasis: null,
      generationMethod: "manual",
      durationMinute: 120,
      totalScore: "100.0",
    };

    expect(
      normalizeCreatePaperInput({
        ...baseInput,
        source: "  兼容来源说明  ",
      }),
    ).toMatchObject({
      success: true,
      value: { sourceDescription: "兼容来源说明" },
    });
    expect(
      normalizeCreatePaperInput({
        ...baseInput,
        source: "旧来源",
        sourceDescription: "新来源",
      }),
    ).toEqual({ success: false, message: "Invalid paper input." });
  });

  it("maps every metadata value and explicit null through the draft API", () => {
    expect(mapPaperDraftToApi(createPaperRow())).toMatchObject({
      month: 6,
      sourceDescription: "命题单位公开资料",
      sourceRegion: "华东",
      sourceOrganization: "区域技能鉴定中心",
      questionBasis: "2026 营销职业标准",
      generationMethod: "manual",
    });
    expect(
      mapPaperDraftToApi(
        createPaperRow({
          month: null,
          source: null,
          source_region: null,
          source_organization: null,
          question_basis: null,
          generation_method: null,
        }),
      ),
    ).toMatchObject({
      month: null,
      sourceDescription: null,
      sourceRegion: null,
      sourceOrganization: null,
      questionBasis: null,
      generationMethod: null,
    });
  });

  it("projects a source file only from paper_asset and never fabricates validation facts", async () => {
    const selectRows = [
      [
        {
          id: 95,
          public_id: "paper-public-metadata-95",
          name: "Paper metadata truth",
          profession: "marketing",
          level: 3,
          subject: "theory",
          paper_status: "published",
          paper_type: "past_paper",
          year: 2026,
          total_score: "100.0",
          revision: 4,
          source: "来源说明，不是文件名.pdf",
          updated_at: new Date("2026-07-21T09:00:00.000Z"),
        },
      ],
      [{ value: 1 }],
      [],
      [],
      [],
      [{ paper_id: 95, file_name: "真实原始试卷.pdf" }],
    ];
    let selectIndex = 0;
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () =>
        ({
          select() {
            const rows = selectRows[selectIndex++];
            if (rows === undefined) throw new Error("Unexpected select");
            return createAwaitableSelectBuilder(rows);
          },
        }) as never,
    });

    const result = await repositories.contentKnowledgeRepository.listPapers(
      createAdminContentKnowledgeListQuery(),
    );

    expect(result.papers[0]).toMatchObject({
      sourceFileName: "真实原始试卷.pdf",
      publishValidationSummary: null,
    });
    expect(result.papers[0]?.sourceFileName).not.toBe(
      "来源说明，不是文件名.pdf",
    );
    expect(selectIndex).toBe(6);
  });
});
