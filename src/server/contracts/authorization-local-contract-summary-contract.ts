import type {
  AuthorizationScopeAuthorizationDto,
  AuthorizationScopeSummaryContextDto,
} from "./authorization-scope-summary-contract";
import type {
  AuthorizationSourceSummaryCountDto,
  AuthorizationSourceSummarySourceDto,
} from "./authorization-source-summary-contract";
import type {
  AuthorizationLocalContractReferenceStatus,
  AuthorizationLocalContractRuntimeStatus,
} from "../models/authorization-local-contract-summary";

export type AuthorizationLocalContractRedactionStatus = "redacted";

export type AuthorizationLocalContractRedactedReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationLocalContractRedactionStatus;
  referenceStatus: AuthorizationLocalContractReferenceStatus;
};

export type AuthorizationLocalContractEvidenceReferencesDto = {
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: AuthorizationLocalContractRedactionStatus;
  referenceStatus: AuthorizationLocalContractReferenceStatus;
};

export type AuthorizationLocalContractSummaryDto = {
  userPublicId: string;
  runtimeStatus: AuthorizationLocalContractRuntimeStatus;
  sourceSummary: AuthorizationSourceSummaryCountDto;
  authorizationSources: AuthorizationSourceSummarySourceDto[];
  selectedAuthorization: AuthorizationScopeAuthorizationDto;
  contextScope: AuthorizationScopeSummaryContextDto;
  redeemCodeReference: AuthorizationLocalContractRedactedReferenceDto;
  evidenceReferences: AuthorizationLocalContractEvidenceReferencesDto;
};
