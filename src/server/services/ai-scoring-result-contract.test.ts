import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AiScoringResultContractError,
  normalizeAiScoringPointResults,
} from "./ai-scoring-result-contract";

const expectedScoringPoints = [
  {
    scoringPointPublicId: "scoring_point_public_1",
    label: "first",
    maxScore: 2,
  },
  {
    scoringPointPublicId: "scoring_point_public_2",
    label: "second",
    maxScore: 3,
  },
];

const actualScoringPoints = [
  {
    scoringPointPublicId: "scoring_point_public_2",
    isHit: true,
    score: 3.4,
    reason: "second",
  },
  {
    scoringPointPublicId: "scoring_point_public_1",
    isHit: true,
    score: 1.74,
    reason: "first",
  },
];

function expectInvalid(input: {
  expectedScoringPoints: unknown;
  actualScoringPoints: unknown;
  questionMaxScore: unknown;
}): void {
  expect(() => normalizeAiScoringPointResults(input)).toThrowError(
    AiScoringResultContractError,
  );
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseYamlStrictly(path: string): Record<string, unknown> {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readText(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS() as Record<string, unknown>;
}

describe("AI scoring-point result contract", () => {
  it("normalizes an exact set in authoritative expected order", () => {
    const localExpectedScoringPoints = expectedScoringPoints.map((item) => ({
      ...item,
    }));
    const localActualScoringPoints = actualScoringPoints.map((item) => ({
      ...item,
    }));
    const result = normalizeAiScoringPointResults({
      expectedScoringPoints: localExpectedScoringPoints,
      actualScoringPoints: localActualScoringPoints,
      questionMaxScore: 4,
    });

    expect(result).toEqual({
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_1",
          isHit: true,
          score: 1.5,
          reason: "first",
        },
        {
          scoringPointPublicId: "scoring_point_public_2",
          isHit: true,
          score: 3,
          reason: "second",
        },
      ],
      totalScore: 4,
    });
    expect(result.scoringPoints[0]).not.toBe(localActualScoringPoints[1]);

    localActualScoringPoints[1]!.reason = "mutated after normalization";
    localExpectedScoringPoints[0]!.label = "mutated expected label";
    expect(result.scoringPoints[0]?.reason).toBe("first");
  });

  it("accepts only exact empty facts with canonical zero", () => {
    expect(
      normalizeAiScoringPointResults({
        expectedScoringPoints: [],
        actualScoringPoints: [],
        questionMaxScore: 0,
      }),
    ).toEqual({ scoringPoints: [], totalScore: 0 });
    expectInvalid({
      expectedScoringPoints: [],
      actualScoringPoints: [],
      questionMaxScore: 1,
    });
  });

  it("accepts the persisted canonical decimal max-score representation", () => {
    expect(
      normalizeAiScoringPointResults({
        expectedScoringPoints,
        actualScoringPoints,
        questionMaxScore: "5.0",
      }).totalScore,
    ).toBe(4.5);
  });

  it("rejects unknown, duplicate, missing and case-variant identities", () => {
    for (const actual of [
      [actualScoringPoints[0]],
      [actualScoringPoints[0], actualScoringPoints[0]],
      [
        actualScoringPoints[0],
        {
          ...actualScoringPoints[1],
          scoringPointPublicId: "scoring_point_public_unknown",
        },
      ],
      [
        actualScoringPoints[0],
        {
          ...actualScoringPoints[1],
          scoringPointPublicId: "SCORING_POINT_PUBLIC_1",
        },
      ],
    ]) {
      expectInvalid({
        expectedScoringPoints,
        actualScoringPoints: actual,
        questionMaxScore: 5,
      });
    }
  });

  it("rejects corrupt expected facts and malformed actual fields", () => {
    const sparseActual = new Array(2);
    sparseActual[0] = actualScoringPoints[0];

    for (const input of [
      {
        expectedScoringPoints: [
          expectedScoringPoints[0],
          expectedScoringPoints[0],
        ],
        actualScoringPoints,
        questionMaxScore: 5,
      },
      {
        expectedScoringPoints,
        actualScoringPoints: "not-an-array",
        questionMaxScore: 5,
      },
      {
        expectedScoringPoints,
        actualScoringPoints: sparseActual,
        questionMaxScore: 5,
      },
      {
        expectedScoringPoints,
        actualScoringPoints: [
          actualScoringPoints[0],
          { ...actualScoringPoints[1], isHit: "yes" },
        ],
        questionMaxScore: 5,
      },
      {
        expectedScoringPoints,
        actualScoringPoints: [
          actualScoringPoints[0],
          { ...actualScoringPoints[1], score: Number.POSITIVE_INFINITY },
        ],
        questionMaxScore: 5,
      },
      {
        expectedScoringPoints,
        actualScoringPoints: [
          actualScoringPoints[0],
          { ...actualScoringPoints[1], reason: null },
        ],
        questionMaxScore: 5,
      },
    ]) {
      expectInvalid(input);
    }
  });

  it("strictly parses the approved F-0173 task and WIP state", () => {
    const taskSafety = JSON.parse(
      readText("docs/04-agent-system/state/task-safety.json"),
    ) as Record<string, unknown>;
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );

    expect(taskSafety).toMatchObject({
      taskId:
        "p1-remediation-rc-08-ai-scoring-point-result-integrity-2026-07-23",
      branch: "fix/ai-scoring-point-result-integrity",
      baseSha: "05d9211927542f39f42526ae3d7b60bcc92507d6",
      conditionalCloseout: true,
      approvalSources: {
        provider: "guardian-f0173-ai-scoring-point-result-integrity-2026-07-23",
      },
    });
    expect(JSON.stringify(projectState)).toContain(
      "p1-remediation-rc-08-ai-scoring-point-result-integrity-2026-07-23",
    );
    expect(JSON.stringify(taskQueue)).toContain(
      "p1-remediation-rc-08-ai-scoring-point-result-integrity-2026-07-23",
    );
  });

  it("routes both production acceptance boundaries through the shared contract", () => {
    const directSource = readText("src/server/services/ai-scoring-service.ts");
    const durableSource = readText(
      "src/server/services/ai-scoring-task-runtime.ts",
    );

    expect(directSource).toContain("normalizeAiScoringPointResults");
    expect(durableSource).toContain("normalizeAiScoringPointResults");
    expect(directSource).not.toContain(
      "runnerResult.scoringPoints.map((scoringPoint)",
    );
    expect(durableSource).not.toContain("...executionResult.resultSnapshot");
  });
});
