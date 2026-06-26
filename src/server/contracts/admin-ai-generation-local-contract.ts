import type { AiGenerationTaskRequestPolicyDto } from "./ai-generation-task-request-contract";
import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import type { AiGenerationTaskResultContentVisibility } from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";

export type AdminAiGenerationWorkspace = "content" | "organization";

export type AdminAiGenerationKind = "question" | "paper";

export type AdminAiGenerationLocalContractRuntimeStatus = "local_contract_only";

export type AdminAiGenerationLocalContractFlowStatus = "accepted";

export type AdminAiGenerationLocalContractResultStateDto = {
  status: AiGenerationTaskStatus;
  taskPublicId: string;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  redactionStatus: "redacted";
};

export type AdminAiGenerationLocalContractRuntimeBridgeDto = {
  bridgeStatus: "provider_call_blocked";
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  costCalibrationExecuted: false;
  redactionStatus: "redacted";
  blockedReasons: string[];
};

export type AdminAiGenerationLocalContractFormalContentBoundaryDto = {
  questionWriteStatus: "blocked_without_follow_up_task";
  paperWriteStatus: "blocked_without_follow_up_task";
};

export type AdminAiGenerationLocalContractDto = {
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  flowStatus: AdminAiGenerationLocalContractFlowStatus;
  redactionStatus: "redacted";
  taskRequest: AiGenerationTaskRequestPolicyDto;
  resultState: AdminAiGenerationLocalContractResultStateDto;
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto;
  formalContentBoundary: AdminAiGenerationLocalContractFormalContentBoundaryDto;
};
