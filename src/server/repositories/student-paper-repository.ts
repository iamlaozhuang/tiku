import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { PaperType, Profession, Subject } from "../models/paper";
import type { NormalizedStudentPaperListInput } from "../validators/student-paper";

export type StudentPaperAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type StudentPublishedPaperRow = {
  public_id: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paper_type: PaperType | null;
  duration_minute: number | null;
  total_score: string | null;
  published_at: Date | null;
  question_count: number;
  paper_snapshot: Record<string, unknown>;
};

export type StudentPublishedPaperListResult = {
  rows: StudentPublishedPaperRow[];
  total: number;
};

export type StudentPaperScopeQuery = {
  userPublicId: string;
};

export type StudentPaperListQuery = NormalizedStudentPaperListInput & {
  userPublicId: string;
  profession: Profession;
  level: number;
};

export type StudentPaperDetailQuery = {
  userPublicId: string;
  publicId: string;
};

export type StudentPaperRepository = {
  listEffectiveAuthorizationScopes(
    query: StudentPaperScopeQuery,
  ): Promise<StudentPaperAuthorizationScopeRow[]>;
  listPublishedPapers(
    query: StudentPaperListQuery,
  ): Promise<StudentPublishedPaperListResult>;
  findPublishedPaperByPublicId(
    query: StudentPaperDetailQuery,
  ): Promise<StudentPublishedPaperRow | null>;
};
