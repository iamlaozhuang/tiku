import type { RagRetrievalMode } from "@/rag/retrieval";
import {
  ragKnowledgeAiFunctionValues,
  type RagKnowledgeAiFunction,
  type RagKnowledgeRetrievalRequest,
} from "@/server/contracts/rag-knowledge/retrieval-governance-contract";
import { professionValues, type Profession } from "@/server/models/auth";

export type RagKnowledgeRetrievalRequestParseResult =
  | {
      success: true;
      data: RagKnowledgeRetrievalRequest;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
    };

const unsupportedAiFunctionMessage =
  "RAG knowledge retrieval is not approved for this AI function";

export function parseRagKnowledgeRetrievalRequest(
  value: unknown,
): RagKnowledgeRetrievalRequestParseResult {
  if (!isRecord(value)) {
    return createInvalidRequestResult();
  }

  const aiFuncType = value.aiFuncType;

  if (typeof aiFuncType === "string" && !isRagKnowledgeAiFunction(aiFuncType)) {
    return {
      errorCode: "UNSUPPORTED_RAG_KNOWLEDGE_AI_FUNCTION",
      message: unsupportedAiFunctionMessage,
      success: false,
    };
  }

  if (
    !isRagKnowledgeAiFunction(aiFuncType) ||
    !isStringArray(value.authorizedResourcePublicIds) ||
    !isLevel(value.level) ||
    !isProfession(value.profession) ||
    typeof value.query !== "string" ||
    value.query.trim().length === 0 ||
    !isOptionalRetrievalMode(value.retrievalMode)
  ) {
    return createInvalidRequestResult();
  }

  return {
    data: {
      aiFuncType,
      authorizedResourcePublicIds: value.authorizedResourcePublicIds,
      level: value.level,
      profession: value.profession,
      query: value.query.trim(),
      retrievalMode: value.retrievalMode,
    },
    success: true,
  };
}

function createInvalidRequestResult(): RagKnowledgeRetrievalRequestParseResult {
  return {
    errorCode: "INVALID_RAG_KNOWLEDGE_RETRIEVAL_REQUEST",
    message: "Invalid RAG knowledge retrieval request",
    success: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRagKnowledgeAiFunction(
  value: unknown,
): value is RagKnowledgeAiFunction {
  return (
    typeof value === "string" &&
    ragKnowledgeAiFunctionValues.includes(value as RagKnowledgeAiFunction)
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0)
  );
}

function isLevel(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && Number(value) > 0);
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function isOptionalRetrievalMode(
  value: unknown,
): value is RagRetrievalMode | undefined {
  return (
    value === undefined || value === "fusion_sort" || value === "hybrid_rerank"
  );
}
