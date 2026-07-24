import type {
  AiCallLogDto,
  KnowledgeBaseDto,
  KnowledgeNodeDto,
  ResourceDto,
} from "../contracts/ai-rag-contract";
import type {
  AiCallLogRow,
  KnowledgeBaseRow,
  KnowledgeNodeRow,
  ResourceRow,
} from "../models/ai-rag";
import { normalizeAiCallObservation } from "../services/ai-call-observation";

export function mapAiCallLogToApi(aiCallLog: AiCallLogRow): AiCallLogDto {
  const observation = mapAiCallLogObservation(aiCallLog);
  return {
    publicId: aiCallLog.public_id,
    userPublicId: aiCallLog.user_public_id,
    answerRecordPublicId: aiCallLog.answer_record_public_id,
    mockExamPublicId: aiCallLog.mock_exam_public_id,
    questionPublicId: aiCallLog.question_public_id,
    aiFuncType: aiCallLog.ai_func_type,
    callStatus: aiCallLog.call_status,
    modelConfigSnapshot: aiCallLog.model_config_snapshot,
    promptTemplateKey: aiCallLog.prompt_template_key,
    promptTemplateVersion: aiCallLog.prompt_template_version,
    requestRedactedSnapshot: aiCallLog.request_redacted_snapshot,
    responseRedactedSnapshot: aiCallLog.response_redacted_snapshot,
    errorRedactedSnapshot: aiCallLog.error_redacted_snapshot,
    citationRedactedSnapshot: aiCallLog.citation_redacted_snapshot,
    observationSchemaVersion: observation.observationSchemaVersion,
    tokenCountSource: observation.tokenCountSource,
    tokenEstimationMethod: observation.tokenEstimationMethod,
    latencySource: observation.latencySource,
    promptTokenCount: aiCallLog.prompt_token_count,
    completionTokenCount: aiCallLog.completion_token_count,
    totalTokenCount: aiCallLog.total_token_count,
    latencyMs: aiCallLog.latency_ms,
    startedAt: aiCallLog.started_at.toISOString(),
    completedAt: aiCallLog.completed_at?.toISOString() ?? null,
    createdAt: aiCallLog.created_at.toISOString(),
  };
}

function mapAiCallLogObservation(
  aiCallLog: AiCallLogRow,
): Pick<
  AiCallLogDto,
  | "observationSchemaVersion"
  | "tokenCountSource"
  | "tokenEstimationMethod"
  | "latencySource"
> {
  const markerValues = [
    aiCallLog.observation_schema_version,
    aiCallLog.token_count_source,
    aiCallLog.token_estimation_method,
    aiCallLog.latency_source,
  ];
  if (markerValues.every((value) => value === null)) {
    return {
      observationSchemaVersion: null,
      tokenCountSource: "legacy",
      tokenEstimationMethod: null,
      latencySource: "legacy",
    };
  }

  const observation = normalizeAiCallObservation({
    schemaVersion: aiCallLog.observation_schema_version,
    tokenSource: aiCallLog.token_count_source,
    tokenEstimationMethod: aiCallLog.token_estimation_method,
    promptTokenCount: aiCallLog.prompt_token_count,
    completionTokenCount: aiCallLog.completion_token_count,
    totalTokenCount: aiCallLog.total_token_count,
    latencySource: aiCallLog.latency_source,
    latencyMs: aiCallLog.latency_ms,
  });
  return {
    observationSchemaVersion: observation.schemaVersion,
    tokenCountSource: observation.tokenSource,
    tokenEstimationMethod: observation.tokenEstimationMethod,
    latencySource: observation.latencySource,
  };
}

export function mapKnowledgeBaseToApi(
  knowledgeBase: KnowledgeBaseRow,
): KnowledgeBaseDto {
  return {
    publicId: knowledgeBase.public_id,
    profession: knowledgeBase.profession,
    displayName: knowledgeBase.display_name,
    description: knowledgeBase.description,
    isEnabled: knowledgeBase.is_enabled,
    createdAt: knowledgeBase.created_at.toISOString(),
    updatedAt: knowledgeBase.updated_at.toISOString(),
  };
}

export function mapResourceToApi(
  resource: ResourceRow,
  relations: { knowledgeBasePublicId: string },
): ResourceDto {
  return {
    publicId: resource.public_id,
    knowledgeBasePublicId: relations.knowledgeBasePublicId,
    resourceType: resource.resource_type,
    resourceStatus: resource.resource_status,
    title: resource.title,
    originalFileName: resource.original_file_name,
    objectStoragePath: resource.object_storage_path,
    contentHash: resource.content_hash,
    fileSizeByte: resource.file_size_byte,
    profession: resource.profession,
    level: resource.level,
    levelList: resource.level_list === null ? null : [...resource.level_list],
    markdownContentHash: resource.markdown_content_hash,
    conversionErrorMessage: resource.conversion_error_message,
    indexingErrorMessage: resource.indexing_error_message,
    isVectorStale: resource.is_vector_stale,
    publishedAt: resource.published_at?.toISOString() ?? null,
    disabledAt: resource.disabled_at?.toISOString() ?? null,
    createdAt: resource.created_at.toISOString(),
    updatedAt: resource.updated_at.toISOString(),
  };
}

export function mapKnowledgeNodeToApi(
  knowledgeNode: KnowledgeNodeRow,
  relations: {
    knowledgeBasePublicId: string;
    parentKnowledgeNodePublicId: string | null;
  },
): KnowledgeNodeDto {
  return {
    publicId: knowledgeNode.public_id,
    knowledgeBasePublicId: relations.knowledgeBasePublicId,
    parentKnowledgeNodePublicId: relations.parentKnowledgeNodePublicId,
    profession: knowledgeNode.profession,
    levelList: knowledgeNode.level_list,
    name: knowledgeNode.name,
    pathName: knowledgeNode.path_name,
    depth: knowledgeNode.depth,
    sortOrder: knowledgeNode.sort_order,
    knStatus: knowledgeNode.kn_status,
    isRecommendable: knowledgeNode.is_recommendable,
    createdAt: knowledgeNode.created_at.toISOString(),
    updatedAt: knowledgeNode.updated_at.toISOString(),
    disabledAt: knowledgeNode.disabled_at?.toISOString() ?? null,
  };
}
