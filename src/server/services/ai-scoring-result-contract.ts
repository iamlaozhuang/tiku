export type AiScoringExpectedPoint = {
  scoringPointPublicId: string;
  label: string;
  maxScore: number;
};

export type AiScoringCanonicalPointResult = {
  scoringPointPublicId: string;
  isHit: boolean;
  score: number;
  reason: string;
};

export type AiScoringExpectedFacts = {
  scoringPoints: AiScoringExpectedPoint[];
  questionMaxScore: number;
};

export type AiScoringCanonicalResult = {
  scoringPoints: AiScoringCanonicalPointResult[];
  totalScore: number;
};

export class AiScoringResultContractError extends Error {
  readonly code = "invalid_scoring_result";

  constructor() {
    super("AI scoring result does not match the authoritative scoring facts.");
    this.name = "AiScoringResultContractError";
  }
}

const publicIdMaxLength = 200;
const labelMaxLength = 1_000;
const reasonMaxLength = 2_000;
const controlCharacterPattern = /[\u0000-\u001f\u007f-\u009f]/u;

function fail(): never {
  throw new AiScoringResultContractError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDenseArray(value: unknown): value is unknown[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) {
      return false;
    }
  }

  return true;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every((key) => Object.hasOwn(value, key))
  );
}

function readBoundedText(value: unknown, maximumLength: number): string {
  if (
    typeof value !== "string" ||
    value.length < 1 ||
    value.length > maximumLength ||
    value !== value.trim() ||
    controlCharacterPattern.test(value)
  ) {
    return fail();
  }

  return value;
}

function readFiniteNonNegativeNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fail();
  }

  return value;
}

function readQuestionMaxScore(value: unknown): number {
  if (typeof value === "number") {
    return readFiniteNonNegativeNumber(value);
  }

  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(value)) {
    return fail();
  }

  return readFiniteNonNegativeNumber(Number(value));
}

function readExpectedPoint(value: unknown): AiScoringExpectedPoint {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["scoringPointPublicId", "label", "maxScore"])
  ) {
    return fail();
  }

  return {
    scoringPointPublicId: readBoundedText(
      value.scoringPointPublicId,
      publicIdMaxLength,
    ),
    label: readBoundedText(value.label, labelMaxLength),
    maxScore: readFiniteNonNegativeNumber(value.maxScore),
  };
}

function readActualPoint(value: unknown): AiScoringCanonicalPointResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "scoringPointPublicId",
      "isHit",
      "score",
      "reason",
    ]) ||
    typeof value.isHit !== "boolean"
  ) {
    return fail();
  }

  return {
    scoringPointPublicId: readBoundedText(
      value.scoringPointPublicId,
      publicIdMaxLength,
    ),
    isHit: value.isHit,
    score: readFiniteNonNegativeNumber(value.score),
    reason: readBoundedText(value.reason, reasonMaxLength),
  };
}

function createUniqueMap<T extends { scoringPointPublicId: string }>(
  values: T[],
): Map<string, T> {
  const valuesByPublicId = new Map<string, T>();

  for (const value of values) {
    if (valuesByPublicId.has(value.scoringPointPublicId)) {
      return fail();
    }
    valuesByPublicId.set(value.scoringPointPublicId, value);
  }

  return valuesByPublicId;
}

function roundToHalfPoint(score: number): number {
  return Math.round(score * 2) / 2;
}

function clampScore(score: number, maxScore: number): number {
  return Math.min(score, maxScore);
}

export function validateAiScoringExpectedFacts(input: {
  expectedScoringPoints: unknown;
  questionMaxScore: unknown;
}): AiScoringExpectedFacts {
  if (!isDenseArray(input.expectedScoringPoints)) {
    return fail();
  }

  const questionMaxScore = readQuestionMaxScore(input.questionMaxScore);
  const scoringPoints = input.expectedScoringPoints.map(readExpectedPoint);
  createUniqueMap(scoringPoints);

  if (scoringPoints.length === 0 && questionMaxScore !== 0) {
    return fail();
  }

  return {
    scoringPoints: scoringPoints.map((scoringPoint) => ({ ...scoringPoint })),
    questionMaxScore,
  };
}

export function normalizeAiScoringPointResults(input: {
  expectedScoringPoints: unknown;
  actualScoringPoints: unknown;
  questionMaxScore: unknown;
}): AiScoringCanonicalResult {
  const expectedFacts = validateAiScoringExpectedFacts(input);

  if (!isDenseArray(input.actualScoringPoints)) {
    return fail();
  }

  const actualScoringPoints = input.actualScoringPoints.map(readActualPoint);
  const actualByPublicId = createUniqueMap(actualScoringPoints);

  if (actualScoringPoints.length !== expectedFacts.scoringPoints.length) {
    return fail();
  }

  const scoringPoints = expectedFacts.scoringPoints.map((expectedPoint) => {
    const actualPoint = actualByPublicId.get(
      expectedPoint.scoringPointPublicId,
    );

    if (actualPoint === undefined) {
      return fail();
    }

    return {
      scoringPointPublicId: expectedPoint.scoringPointPublicId,
      isHit: actualPoint.isHit,
      score: clampScore(
        roundToHalfPoint(actualPoint.score),
        expectedPoint.maxScore,
      ),
      reason: actualPoint.reason,
    };
  });
  const pointTotalScore = scoringPoints.reduce(
    (totalScore, scoringPoint) => totalScore + scoringPoint.score,
    0,
  );

  return {
    scoringPoints,
    totalScore: Math.min(pointTotalScore, expectedFacts.questionMaxScore),
  };
}
