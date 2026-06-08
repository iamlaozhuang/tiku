import type { AuthorizationReasonSelectorSummaryDto } from "./authorization-reason-selector-summary-contract";
import type {
  AuthorizationReasonSelectorApiContractMethod,
  AuthorizationReasonSelectorApiContractStatus,
} from "../models/authorization-reason-selector-api-contract";

export type AuthorizationReasonSelectorApiContractDto = {
  userPublicId: string;
  authorizationPublicId: string;
  apiContractStatus: AuthorizationReasonSelectorApiContractStatus;
  sourceSelectorStatus: AuthorizationReasonSelectorSummaryDto["selectorStatus"];
  contractKey: "authorization.reason.selector.api_contract";
  method: AuthorizationReasonSelectorApiContractMethod;
  apiPathTemplate: string;
  apiPath: string;
  evidenceReferenceStatus: "redacted_reference";
  selectorSummary: AuthorizationReasonSelectorSummaryDto;
};
