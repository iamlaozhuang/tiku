import type { AuthorizationAudienceSummaryInput } from "./authorization-audience-summary";
import type { AuthorizationEvidenceReferenceSummaryInput } from "./authorization-evidence-reference-summary";
import type { AuthorizationWindowSummaryInput } from "./authorization-window-summary";
import type { Profession } from "./auth";

export type AuthorizationDisplayStatus = "display_only";
export type AuthorizationReadModelStatus = "read_model_only";

export type AuthorizationDisplayContextInput = {
  publicId: string;
  profession: Profession;
  level: number;
};

export type AuthorizationDisplaySummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  windowSummary: AuthorizationWindowSummaryInput;
  audienceSummary: AuthorizationAudienceSummaryInput;
  evidenceReferenceSummary: AuthorizationEvidenceReferenceSummaryInput;
  paperContext: AuthorizationDisplayContextInput | null;
  mockExamContext: AuthorizationDisplayContextInput | null;
};
