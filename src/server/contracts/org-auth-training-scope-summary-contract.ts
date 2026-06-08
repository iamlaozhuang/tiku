import type { AuthScopeType, Profession } from "../models/auth";
import type {
  OrgAuthTrainingContentAccessStatus,
  OrgAuthTrainingScopeRuntimeStatus,
} from "../models/org-auth-training-scope-summary";

export type OrgAuthTrainingScopeQuotaDto = {
  accountQuota: number;
  usedQuota: number;
  availableQuota: number;
};

export type OrgAuthTrainingScopeOrgAuthDto = {
  publicId: string;
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
  purchaserOrganizationPublicId: string;
  coveredOrganizationPublicIds: string[];
  quota: OrgAuthTrainingScopeQuotaDto;
};

export type OrgAuthTrainingScopeContextDto = {
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  contentAccessStatus: OrgAuthTrainingContentAccessStatus;
};

export type OrgAuthTrainingScopeRedactedReferenceDto = {
  publicId: string | null;
  redactionStatus: "redacted";
};

export type OrgAuthTrainingScopeEvidenceReferencesDto = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: "redacted";
};

export type OrgAuthTrainingScopeSummaryDto = {
  userPublicId: string;
  employeePublicId: string | null;
  runtimeStatus: OrgAuthTrainingScopeRuntimeStatus;
  orgAuth: OrgAuthTrainingScopeOrgAuthDto;
  trainingScope: OrgAuthTrainingScopeContextDto;
  redeemCodeReference: OrgAuthTrainingScopeRedactedReferenceDto;
  evidenceReferences: OrgAuthTrainingScopeEvidenceReferencesDto;
};
