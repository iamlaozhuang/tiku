import type {
  PaperMockExamContentAccessStatus,
  PaperMockExamScopeInput,
} from "../models/paper-mock-exam-scope";

export type PaperMockExamPaperScopeDto = Pick<
  PaperMockExamScopeInput,
  "paperPublicId" | "profession" | "level" | "subject" | "paperType"
>;

export type PaperMockExamScopeDto = {
  userPublicId: string;
  authorizationPublicId: string;
  paperScope: PaperMockExamPaperScopeDto;
  mockExamScope: {
    mockExamPublicId: string | null;
  };
  contentAccessStatus: PaperMockExamContentAccessStatus;
};
