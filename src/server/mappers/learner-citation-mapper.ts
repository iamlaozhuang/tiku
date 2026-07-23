import type { LearnerCitationDto } from "../contracts/ai-rag-contract";

export const LEARNER_CITATION_MAX_COUNT = 3;
export const LEARNER_CITATION_TITLE_MAX_CHARACTER_COUNT = 200;
export const LEARNER_CITATION_HEADING_MAX_SEGMENT_COUNT = 12;
export const LEARNER_CITATION_HEADING_SEGMENT_MAX_CHARACTER_COUNT = 200;

const unsafeDisplayCharacterPattern =
  /[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060\u2066-\u2069\ufeff]/u;

function hasInvalidUnicodeScalar(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);

    return (
      codePoint === undefined ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
      (codePoint >= 0xfdd0 && codePoint <= 0xfdef) ||
      (codePoint & 0xffff) === 0xfffe ||
      (codePoint & 0xffff) === 0xffff
    );
  });
}

export class LearnerCitationProjectionError extends Error {
  constructor() {
    super("Learner citation projection is unavailable.");
    this.name = "LearnerCitationProjectionError";
  }
}

function failProjection(): never {
  throw new LearnerCitationProjectionError();
}

function readOwnDataProperty(
  value: object,
  key: string,
): { exists: boolean; value: unknown } {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);

  if (descriptor === undefined) {
    return { exists: false, value: undefined };
  }

  if (!("value" in descriptor)) {
    return failProjection();
  }

  return { exists: true, value: descriptor.value };
}

function normalizeDisplayText(value: unknown, maximumCharacterCount: number) {
  if (typeof value !== "string") {
    return failProjection();
  }

  const normalized = value.normalize("NFC").trim();

  if (
    normalized.length === 0 ||
    Array.from(normalized).length > maximumCharacterCount ||
    unsafeDisplayCharacterPattern.test(normalized) ||
    hasInvalidUnicodeScalar(normalized)
  ) {
    return failProjection();
  }

  return normalized;
}

function normalizeHeadingPath(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > LEARNER_CITATION_HEADING_MAX_SEGMENT_COUNT
  ) {
    return failProjection();
  }

  const headingPath: string[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const segmentProperty = readOwnDataProperty(value, String(index));

    if (!segmentProperty.exists) {
      return failProjection();
    }

    headingPath.push(
      normalizeDisplayText(
        segmentProperty.value,
        LEARNER_CITATION_HEADING_SEGMENT_MAX_CHARACTER_COUNT,
      ),
    );
  }

  return headingPath;
}

function normalizeCitation(value: unknown): LearnerCitationDto {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failProjection();
  }

  const titleProperty = readOwnDataProperty(value, "resourceTitle");
  const headingProperty = readOwnDataProperty(value, "headingPath");
  const staleProperty = readOwnDataProperty(value, "isStale");

  if (!titleProperty.exists || !headingProperty.exists) {
    return failProjection();
  }

  const isStale = staleProperty.exists ? staleProperty.value : null;

  if (isStale !== null && typeof isStale !== "boolean") {
    return failProjection();
  }

  return {
    resourceTitle: normalizeDisplayText(
      titleProperty.value,
      LEARNER_CITATION_TITLE_MAX_CHARACTER_COUNT,
    ),
    headingPath: normalizeHeadingPath(headingProperty.value),
    isStale,
  };
}

function createPublicIdentity(citation: LearnerCitationDto): string {
  return JSON.stringify([citation.resourceTitle, citation.headingPath]);
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function mapLearnerCitations(input: {
  evidenceStatus: unknown;
  citations: unknown;
}): LearnerCitationDto[] {
  if (
    input.evidenceStatus !== null &&
    input.evidenceStatus !== "sufficient" &&
    input.evidenceStatus !== "weak" &&
    input.evidenceStatus !== "none"
  ) {
    return failProjection();
  }

  if (
    !Array.isArray(input.citations) ||
    input.citations.length > LEARNER_CITATION_MAX_COUNT
  ) {
    return failProjection();
  }

  if (input.evidenceStatus === "sufficient") {
    if (input.citations.length === 0) {
      return failProjection();
    }
  } else if (input.citations.length !== 0) {
    return failProjection();
  }

  const uniqueCitations = new Map<string, LearnerCitationDto>();

  for (let index = 0; index < input.citations.length; index += 1) {
    const citationProperty = readOwnDataProperty(
      input.citations,
      String(index),
    );

    if (!citationProperty.exists) {
      return failProjection();
    }

    const citation = normalizeCitation(citationProperty.value);
    const identity = createPublicIdentity(citation);
    const existing = uniqueCitations.get(identity);

    if (existing !== undefined && existing.isStale !== citation.isStale) {
      return failProjection();
    }

    if (existing === undefined) {
      uniqueCitations.set(identity, citation);
    }
  }

  return [...uniqueCitations.entries()]
    .sort(([left], [right]) => compareOrdinal(left, right))
    .map(([, citation]) => ({
      resourceTitle: citation.resourceTitle,
      headingPath: [...citation.headingPath],
      isStale: citation.isStale,
    }));
}
