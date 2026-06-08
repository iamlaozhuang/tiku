import type {
  RedeemCodeReferenceRedactionStatus,
  RedeemCodeReferenceStatus,
} from "../models/redeem-code-reference";

export type RedeemCodeReferenceDto = {
  userPublicId: string;
  authorizationPublicId: string;
  redeemCodeReference: {
    publicId: string;
    redactionStatus: RedeemCodeReferenceRedactionStatus;
  };
  contextScope: {
    paperPublicId: string | null;
    mockExamPublicId: string | null;
  };
  evidenceReferences: {
    auditLogPublicId: string | null;
    aiCallLogPublicId: string | null;
    redactionStatus: RedeemCodeReferenceRedactionStatus;
  };
  referenceStatus: RedeemCodeReferenceStatus;
};
