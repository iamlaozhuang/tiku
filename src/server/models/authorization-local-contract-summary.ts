import type { AuthorizationScopeSummaryInput } from "./authorization-scope-summary";
import type { AuthorizationSourceSummaryInput } from "./authorization-source-summary";

export type AuthorizationLocalContractRuntimeStatus = "local_contract_only";

export type AuthorizationLocalContractReferenceStatus = "redacted_reference";

export type AuthorizationLocalContractSummaryInput = {
  userPublicId: string;
  sourceSummary: AuthorizationSourceSummaryInput;
  scopeSummary: AuthorizationScopeSummaryInput;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
