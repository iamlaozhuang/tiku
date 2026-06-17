import type { AuthorizationAudienceSummaryCountDto } from "./authorization-audience-summary-contract";
import type { AuthorizationEvidenceReferenceSummaryCountDto } from "./authorization-evidence-reference-summary-contract";
import type {
  AuthorizationDisplayStatus,
  AuthorizationReadModelStatus,
} from "../models/authorization-display-summary";
import type { AuthorizationWindowStatus } from "../models/authorization-window-summary";
import type { Profession } from "../models/auth";

export type AuthorizationDisplayWindowDto = {
  startsAt: string;
  expiresAt: string | null;
  currentAt: string;
  windowStatus: AuthorizationWindowStatus;
};

export type AuthorizationDisplayContextDto = {
  publicId: string;
  profession: Profession;
  level: number;
};

export type AuthorizationDisplayContextSummaryDto = {
  contentAccessStatus: AuthorizationDisplayStatus;
  paper: AuthorizationDisplayContextDto | null;
  mockExam: AuthorizationDisplayContextDto | null;
};

export type AuthorizationDisplaySummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  readModelStatus: AuthorizationReadModelStatus;
  displayStatus: AuthorizationDisplayStatus;
  window: AuthorizationDisplayWindowDto;
  audienceSummary: AuthorizationAudienceSummaryCountDto;
  evidenceSummary: AuthorizationEvidenceReferenceSummaryCountDto;
  context: AuthorizationDisplayContextSummaryDto;
};
