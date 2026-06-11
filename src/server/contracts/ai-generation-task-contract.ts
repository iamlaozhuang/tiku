import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";

export type AiGenerationTaskAuthorizationSource = "personal_auth" | "org_auth";

export type AiGenerationTaskOwnerType =
  | "personal"
  | "organization"
  | "platform";

export type AiGenerationTaskDto = {
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  status: AiGenerationTaskStatus;
  actorType:
    | "student"
    | "admin"
    | "employee"
    | "organization_admin"
    | "platform_admin";
  actorPublicId: string;
  authorizationSource: AiGenerationTaskAuthorizationSource;
  authorizationPublicId: string;
  ownerType: AiGenerationTaskOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskOwnerType;
  quotaOwnerPublicId: string;
  effectiveEdition: "advanced";
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  subject: "theory" | "skill" | null;
  modelConfigSnapshot: {
    modelProvider: string;
    modelConfigPublicId: string;
  };
  promptTemplateSnapshot: {
    promptTemplateKey: string;
    promptTemplateVersion: string;
    promptTemplateDigest: string;
  };
  retryCount: number;
  maxRetryCountSource: string;
  failureCategory: AiGenerationTaskFailureCategory | null;
  failureSummaryRedacted: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};
