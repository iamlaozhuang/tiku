import type {
  AuthorizationEvidenceReferenceDisplayStatus,
  AuthorizationEvidenceReferenceRedactionStatus,
  AuthorizationEvidenceReferenceStatus,
} from "../models/authorization-evidence-reference-summary";

export type AuthorizationEvidenceReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationEvidenceReferenceRedactionStatus;
  referenceStatus: AuthorizationEvidenceReferenceStatus;
};

export type AuthorizationEvidenceReferenceSummaryCountDto = {
  totalReferenceCount: number;
  missingReferenceCount: number;
};

export type AuthorizationEvidenceReferenceSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  displayStatus: AuthorizationEvidenceReferenceDisplayStatus;
  referenceSummary: AuthorizationEvidenceReferenceSummaryCountDto;
  references: {
    redeemCode: AuthorizationEvidenceReferenceDto;
    auditLog: AuthorizationEvidenceReferenceDto;
    aiCallLog: AuthorizationEvidenceReferenceDto;
  };
};
