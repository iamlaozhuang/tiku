import {
  createRagRetrievalResult,
  summarizeRagRetrievalForEvidence,
} from "@/rag/retrieval";
import type {
  RagKnowledgeApiResponse,
  RagKnowledgeExecutionHandoff,
  RagKnowledgeRetrievalResultDto,
} from "@/server/contracts/rag-knowledge/retrieval-governance-contract";
import {
  mapRagKnowledgeCitationToSourceDto,
  mapRagKnowledgeEvidenceSummaryToDto,
} from "@/server/mappers/rag-knowledge/retrieval-governance-mapper";
import type { RagKnowledgeRepository } from "@/server/repositories/rag-knowledge/rag-knowledge-repository";
import { parseRagKnowledgeRetrievalRequest } from "@/server/validators/rag-knowledge/retrieval-governance";

export type RagKnowledgeRetrievalHandler = {
  retrieve(
    request: unknown,
  ): Promise<RagKnowledgeApiResponse<RagKnowledgeRetrievalResultDto>>;
};

export type RagKnowledgeRetrievalHandlerInput = {
  repository: RagKnowledgeRepository;
};

export function createRagKnowledgeRetrievalHandler(
  input: RagKnowledgeRetrievalHandlerInput,
): RagKnowledgeRetrievalHandler {
  return {
    async retrieve(request: unknown) {
      const parsedRequest = parseRagKnowledgeRetrievalRequest(request);

      if (!parsedRequest.success) {
        return {
          code: "BAD_REQUEST",
          data: {
            errorCode: parsedRequest.errorCode,
          },
          message: parsedRequest.message,
        };
      }

      const candidates = await input.repository.listRetrievalCandidates(
        parsedRequest.data,
      );
      const retrievalResult = createRagRetrievalResult({
        ...parsedRequest.data,
        candidates,
        maxCitationCount: 3,
      });
      const evidenceSummary = summarizeRagRetrievalForEvidence(
        retrievalResult,
        parsedRequest.data.query,
      );

      return {
        code: "OK",
        data: {
          aiFuncType: parsedRequest.data.aiFuncType,
          citations: retrievalResult.citations.map(
            mapRagKnowledgeCitationToSourceDto,
          ),
          evidenceStatus: retrievalResult.evidenceStatus,
          evidenceSummary: mapRagKnowledgeEvidenceSummaryToDto(evidenceSummary),
          executionHandoff: createBlockedRagKnowledgeExecutionHandoff(),
        },
        message: "success",
      };
    },
  };
}

export function createBlockedRagKnowledgeExecutionHandoff(): RagKnowledgeExecutionHandoff {
  return {
    blockedCapabilities: [
      "vector_provider",
      "storage_file_access",
      "provider_model_request",
      "schema_migration",
      "quota_use",
    ],
    gate: "provider_vector_storage_execution",
    reason: "fresh_approval_required",
    status: "blocked",
  };
}
