import type { AuthorizationContextReasonCode } from "./authorization-context-reason-summary";
import type { AuthorizationReasonPresentationStatus } from "./authorization-reason-item-presentation";

export type AuthorizationReasonContextType = "paper" | "mock_exam";

export type AuthorizationReasonContextPresentationSeverity =
  | "info"
  | "attention";

export type AuthorizationReasonContextPresentationReference = {
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
};

export type AuthorizationReasonContextPresentationInput = {
  reasonStatus: "reason_summary_only";
  paperContext: AuthorizationReasonContextPresentationReference | null;
  mockExamContext: AuthorizationReasonContextPresentationReference | null;
};

export type AuthorizationReasonContextPresentationStatus =
  AuthorizationReasonPresentationStatus;
