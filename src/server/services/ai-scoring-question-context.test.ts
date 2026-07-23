import { describe, expect, it } from "vitest";

import { MAX_MATERIAL_RICH_TEXT_LENGTH } from "../../lib/content-integrity";
import { PAPER_QUESTION_COUNT_LIMIT } from "../validators/paper-draft";
import {
  AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION,
  buildAiScoringQuestionContext,
  normalizeAiScoringQuestionContext,
} from "./ai-scoring-question-context";

function createQuestion(index: number) {
  return {
    paperQuestionPublicId: `paper_question_public_${index}`,
    questionPublicId: `question_public_${index}`,
    questionType: "case_analysis",
    scoringMethod: "ai_scoring",
    score: "5.0",
  };
}

function createVersionedSnapshot(groupQuestionCount = 2) {
  return {
    snapshotVersion: 2,
    paperSections: [
      {
        publicId: "paper_section_public_1",
        title: "案例分析",
        sortOrder: 1,
        paperQuestions: [createQuestion(1_000)],
        questionGroups: [
          {
            publicId: "question_group_public_1",
            title: "客户异议处理材料",
            sortOrder: 2,
            totalScore: `${groupQuestionCount * 5}.0`,
            materialSnapshot: {
              materialPublicId: "material_public_1",
              title: "客户异议处理案例",
              contentRichText: "<p>客户对处理方案提出异议。</p>",
              profession: "marketing",
              level: 3,
              subject: "skill",
            },
            paperQuestions: Array.from(
              { length: groupQuestionCount },
              (_value, index) => createQuestion(index + 1),
            ),
          },
        ],
      },
    ],
  };
}

const scope = {
  profession: "marketing" as const,
  level: 3,
  subject: "skill" as const,
};

describe("AI scoring question context", () => {
  it("builds detached standalone and grouped contexts from a valid versioned snapshot", () => {
    const snapshot = createVersionedSnapshot();
    const standalone = buildAiScoringQuestionContext({
      paperSnapshot: snapshot,
      paperQuestionPublicId: "paper_question_public_1000",
      ...scope,
    });
    const firstGrouped = buildAiScoringQuestionContext({
      paperSnapshot: snapshot,
      paperQuestionPublicId: "paper_question_public_1",
      ...scope,
    });
    const secondGrouped = buildAiScoringQuestionContext({
      paperSnapshot: snapshot,
      paperQuestionPublicId: "paper_question_public_2",
      ...scope,
    });

    expect(standalone).toEqual({
      schemaVersion: AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION,
      paperQuestionPublicId: "paper_question_public_1000",
      questionPublicId: "question_public_1000",
      paperSection: {
        publicId: "paper_section_public_1",
        title: "案例分析",
        sortOrder: 1,
      },
      questionGroup: null,
    });
    expect(firstGrouped).toEqual({
      schemaVersion: 1,
      paperQuestionPublicId: "paper_question_public_1",
      questionPublicId: "question_public_1",
      paperSection: {
        publicId: "paper_section_public_1",
        title: "案例分析",
        sortOrder: 1,
      },
      questionGroup: {
        publicId: "question_group_public_1",
        title: "客户异议处理材料",
        sortOrder: 2,
        paperQuestionPublicIds: [
          "paper_question_public_1",
          "paper_question_public_2",
        ],
        material: {
          materialPublicId: "material_public_1",
          title: "客户异议处理案例",
          contentRichText: "<p>客户对处理方案提出异议。</p>",
          profession: "marketing",
          level: 3,
          subject: "skill",
        },
      },
    });
    expect(secondGrouped?.questionGroup).toEqual(firstGrouped?.questionGroup);
    expect(secondGrouped?.questionGroup).not.toBe(firstGrouped?.questionGroup);

    snapshot.paperSections[0]!.title = "mutated";
    snapshot.paperSections[0]!.questionGroups[0]!.materialSnapshot.title =
      "mutated";
    expect(firstGrouped?.paperSection.title).toBe("案例分析");
    expect(firstGrouped?.questionGroup?.material.title).toBe(
      "客户异议处理案例",
    );
  });

  it("accepts every frozen boundary exactly", () => {
    const snapshot = createVersionedSnapshot(PAPER_QUESTION_COUNT_LIMIT);
    snapshot.paperSections[0]!.publicId = "p".repeat(200);
    snapshot.paperSections[0]!.title = "节".repeat(2_000);
    const group = snapshot.paperSections[0]!.questionGroups[0]!;
    group.publicId = "g".repeat(200);
    group.title = "组".repeat(2_000);
    group.materialSnapshot.materialPublicId = "m".repeat(200);
    group.materialSnapshot.title = "材".repeat(2_000);
    group.materialSnapshot.contentRichText = "文".repeat(
      MAX_MATERIAL_RICH_TEXT_LENGTH,
    );

    expect(
      buildAiScoringQuestionContext({
        paperSnapshot: snapshot,
        paperQuestionPublicId: "paper_question_public_1",
        ...scope,
      }),
    ).not.toBeNull();
  });

  it.each([
    [
      "legacy hierarchy",
      (snapshot: Record<string, unknown>) => delete snapshot.snapshotVersion,
    ],
    [
      "missing material field",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        delete (
          snapshot.paperSections[0]!.questionGroups[0]!
            .materialSnapshot as Partial<
            (typeof snapshot.paperSections)[0]["questionGroups"][0]["materialSnapshot"]
          >
        ).contentRichText,
    ],
    [
      "cross profession",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.materialSnapshot.profession =
          "logistics"),
    ],
    [
      "case-conflicting member",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.paperQuestions[1]!.paperQuestionPublicId =
          "PAPER_QUESTION_PUBLIC_1"),
    ],
    [
      "invalid sort order",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.sortOrder = 0),
    ],
    [
      "overlong material",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.materialSnapshot.contentRichText =
          "文".repeat(MAX_MATERIAL_RICH_TEXT_LENGTH + 1)),
    ],
    [
      "overlong public id",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.publicId = "g".repeat(
          201,
        )),
    ],
    [
      "overlong title",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.title = "组".repeat(
          2_001,
        )),
    ],
    [
      "too many group members",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) => {
        const group = snapshot.paperSections[0]!.questionGroups[0]!;
        group.paperQuestions.push(createQuestion(101));
        group.totalScore = "505.0";
      },
    ],
    [
      "control character title",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.title =
          "bad\u0000title"),
    ],
    [
      "unpaired surrogate",
      (snapshot: ReturnType<typeof createVersionedSnapshot>) =>
        (snapshot.paperSections[0]!.questionGroups[0]!.title = "bad\ud800"),
    ],
  ])("fails closed for %s", (_caseName, mutate) => {
    const snapshot = createVersionedSnapshot();
    mutate(snapshot);

    expect(
      buildAiScoringQuestionContext({
        paperSnapshot: snapshot,
        paperQuestionPublicId: "paper_question_public_1",
        ...scope,
      }),
    ).toBeNull();
  });

  it("strictly validates unknown fields, sparse members, identity and scope", () => {
    const context = buildAiScoringQuestionContext({
      paperSnapshot: createVersionedSnapshot(),
      paperQuestionPublicId: "paper_question_public_1",
      ...scope,
    })!;
    const expectations = {
      paperQuestionPublicId: "paper_question_public_1",
      questionPublicId: "question_public_1",
      ...scope,
    };

    expect(normalizeAiScoringQuestionContext(context, expectations)).toEqual(
      context,
    );
    expect(
      normalizeAiScoringQuestionContext(
        { ...context, unexpected: true },
        expectations,
      ),
    ).toBeNull();
    expect(
      normalizeAiScoringQuestionContext(
        {
          ...context,
          questionGroup: {
            ...context.questionGroup!,
            material: {
              ...context.questionGroup!.material,
              internalPath: "must-not-pass",
            },
          },
        },
        expectations,
      ),
    ).toBeNull();
    expect(
      normalizeAiScoringQuestionContext(context, {
        ...expectations,
        questionPublicId: "question_public_other",
      }),
    ).toBeNull();

    const sparse = structuredClone(context);
    delete sparse.questionGroup!.paperQuestionPublicIds[0];
    expect(normalizeAiScoringQuestionContext(sparse, expectations)).toBeNull();

    const duplicated = structuredClone(context);
    duplicated.questionGroup!.paperQuestionPublicIds[1] =
      duplicated.questionGroup!.paperQuestionPublicIds[0]!;
    expect(
      normalizeAiScoringQuestionContext(duplicated, expectations),
    ).toBeNull();
  });

  it("returns a deep detached canonical object", () => {
    const source = buildAiScoringQuestionContext({
      paperSnapshot: createVersionedSnapshot(),
      paperQuestionPublicId: "paper_question_public_1",
      ...scope,
    })!;
    const canonical = normalizeAiScoringQuestionContext(source, {
      paperQuestionPublicId: source.paperQuestionPublicId,
      questionPublicId: source.questionPublicId,
      ...scope,
    })!;

    canonical.paperSection.title = "changed output";
    canonical.questionGroup!.paperQuestionPublicIds[0] = "changed output";
    expect(source.paperSection.title).toBe("案例分析");
    expect(source.questionGroup!.paperQuestionPublicIds[0]).toBe(
      "paper_question_public_1",
    );
  });
});
