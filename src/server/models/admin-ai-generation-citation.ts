import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import type { RedactedJsonObject } from "./ai-rag";

const citationSnapshotSchemaVersion = 1;
const maxCitationSources = 3;
const maxResourceTitleLength = 200;
const maxHeadingDepth = 12;
const maxHeadingSegmentLength = 200;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/u;

export type AdminAiGenerationCitationSource = {
  resourceTitle: string;
  headingPath: string[];
};

export type AdminAiGenerationCitationProjection =
  | {
      status: "available";
      sources: AdminAiGenerationCitationSource[];
    }
  | {
      status: "legacy_unavailable";
      sources: null;
    };

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function normalizeBoundedText(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 &&
    normalized.length <= maxLength &&
    !controlCharacterPattern.test(normalized)
    ? normalized
    : null;
}

function normalizeCitationSource(
  value: unknown,
): AdminAiGenerationCitationSource | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !hasExactKeys(value as Record<string, unknown>, [
      "resourceTitle",
      "headingPath",
    ])
  ) {
    return null;
  }
  const source = value as Record<string, unknown>;
  const resourceTitle = normalizeBoundedText(
    source.resourceTitle,
    maxResourceTitleLength,
  );
  if (
    resourceTitle === null ||
    !Array.isArray(source.headingPath) ||
    source.headingPath.length === 0 ||
    source.headingPath.length > maxHeadingDepth
  ) {
    return null;
  }
  const headingPath = source.headingPath.map((segment) =>
    normalizeBoundedText(segment, maxHeadingSegmentLength),
  );
  if (headingPath.some((segment) => segment === null)) {
    return null;
  }
  return {
    resourceTitle,
    headingPath: headingPath as string[],
  };
}

function createCitationIdentity(source: AdminAiGenerationCitationSource) {
  return JSON.stringify([source.resourceTitle, source.headingPath]);
}

export function createAdminAiGenerationCitationSnapshot(
  groundingContext: AiGenerationRouteIntegratedGroundingContext,
): RedactedJsonObject {
  if (
    groundingContext.evidenceStatus !== "sufficient" ||
    !Number.isSafeInteger(groundingContext.citationCount) ||
    groundingContext.citationCount < 1 ||
    groundingContext.citationCount > maxCitationSources ||
    groundingContext.citations.length !== groundingContext.citationCount
  ) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }

  const sources = groundingContext.citations.map((citation) =>
    normalizeCitationSource({
      resourceTitle: citation.resourceTitle,
      headingPath: citation.headingPath,
    }),
  );
  if (sources.some((source) => source === null)) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }
  const uniqueSources = Array.from(
    new Map(
      (sources as AdminAiGenerationCitationSource[]).map((source) => [
        createCitationIdentity(source),
        source,
      ]),
    ).values(),
  );
  if (uniqueSources.length === 0 || uniqueSources.length > maxCitationSources) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }

  return {
    schemaVersion: citationSnapshotSchemaVersion,
    sourceCitationCount: groundingContext.citationCount,
    citations: uniqueSources,
  };
}

export function resolveAdminAiGenerationCitationProjection(
  snapshot: unknown,
  citationCount: number,
): AdminAiGenerationCitationProjection {
  if (snapshot === null) {
    return { status: "legacy_unavailable", sources: null };
  }
  if (
    typeof snapshot !== "object" ||
    Array.isArray(snapshot) ||
    !hasExactKeys(snapshot as Record<string, unknown>, [
      "schemaVersion",
      "sourceCitationCount",
      "citations",
    ])
  ) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }
  const record = snapshot as Record<string, unknown>;
  if (
    record.schemaVersion !== citationSnapshotSchemaVersion ||
    record.sourceCitationCount !== citationCount ||
    !Number.isSafeInteger(citationCount) ||
    citationCount < 1 ||
    citationCount > maxCitationSources ||
    !Array.isArray(record.citations) ||
    record.citations.length < 1 ||
    record.citations.length > citationCount ||
    record.citations.length > maxCitationSources
  ) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }
  const sources = record.citations.map(normalizeCitationSource);
  if (sources.some((source) => source === null)) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }
  const normalizedSources = sources as AdminAiGenerationCitationSource[];
  if (
    new Set(normalizedSources.map(createCitationIdentity)).size !==
    normalizedSources.length
  ) {
    throw new Error("admin AI generation citation snapshot is invalid");
  }
  return { status: "available", sources: normalizedSources };
}
