import type {
  PaperGenerationMethod,
  FillBlankAnswer,
  MultiChoiceRule,
  PaperStatus,
  PaperType,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";

export type MaterialSnapshotDto = {
  materialPublicId: string;
  title: string;
  contentRichText: string;
  profession: Profession;
  level: number;
  subject: Subject;
};

export type QuestionSnapshotDto = {
  questionPublicId: string;
  questionStatus: QuestionStatus;
  questionType: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  stemRichText: string;
  questionOptions: {
    label: string;
    contentRichText: string;
    isCorrect: boolean;
    sortOrder: number;
  }[];
  standardAnswerRichText: string;
  analysisRichText: string;
  multiChoiceRule: MultiChoiceRule;
  scoringMethod: ScoringMethod;
  fillBlankAnswers?: FillBlankAnswer[];
};

export type PaperScoringPointDto = {
  publicId: string;
  description: string;
  score: string;
  sortOrder: number;
};

export type PaperQuestionDto = {
  publicId: string;
  sourceQuestionPublicId: string;
  paperSectionSortOrder: number;
  questionGroupSortOrder: number | null;
  questionGroupPublicId: string | null;
  score: string | null;
  sortOrder: number;
  questionSnapshot: QuestionSnapshotDto;
  materialSnapshot: MaterialSnapshotDto | null;
  scoringPoints: PaperScoringPointDto[];
  createdAt: string;
  updatedAt: string;
};

export type PaperSectionDto = {
  title: string;
  description: string | null;
  sortOrder: number;
  totalScore: string;
  paperQuestions: PaperQuestionDto[];
};

export type QuestionGroupDto = {
  publicId: string;
  title: string;
  materialPublicId: string;
  materialSnapshot: MaterialSnapshotDto;
  sortOrder: number;
};

export type PaperDraftDto = {
  publicId: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperStatus: PaperStatus;
  paperType: PaperType | null;
  year: number | null;
  month: number | null;
  sourceDescription: string | null;
  sourceRegion: string | null;
  sourceOrganization: string | null;
  questionBasis: string | null;
  generationMethod: PaperGenerationMethod | null;
  durationMinute: number | null;
  totalScore: string | null;
  revision: number;
  publishedAt: string | null;
  archivedAt: string | null;
  questionCount: number;
  paperSections: PaperSectionDto[];
  questionGroups: QuestionGroupDto[];
  createdAt: string;
  updatedAt: string;
};

export type PaperDraftResultDto = {
  paper: PaperDraftDto;
};

export type PaperQuestionResultDto = {
  paperQuestion: PaperQuestionDto;
};

export type PaperPublishValidationIssueDto = {
  code:
    | "paper_question_score_missing"
    | "paper_total_score_missing"
    | "paper_total_score_mismatch"
    | "paper_question_count_invalid"
    | "paper_has_no_counting_question"
    | "empty_paper_section"
    | "scoring_point_total_mismatch"
    | "fill_blank_score_total_mismatch"
    | "source_reference_unresolved"
    | "question_scoring_contract_mismatch"
    | "question_group_inconsistent";
  message: string;
};

export type PaperPublishResultDto = {
  paper: PaperDraftDto;
  lockedQuestionPublicIds: string[];
  lockedMaterialPublicIds: string[];
};

export type PaperDeleteResultDto = {
  deletedPaperPublicId: string;
};

export type PaperCopyResultDto = {
  copiedFromPaperPublicId: string;
  paper: PaperDraftDto;
};
