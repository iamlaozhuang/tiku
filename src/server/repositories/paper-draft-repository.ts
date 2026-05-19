import type {
  MaterialSnapshotDto,
  QuestionSnapshotDto,
} from "../contracts/paper-draft-contract";
import type {
  PaperStatus,
  PaperType,
  Profession,
  Subject,
} from "../models/paper";
import type {
  NormalizedAddPaperQuestionInput,
  NormalizedCreatePaperInput,
  NormalizedPaperListInput,
  NormalizedUpdatePaperInput,
  NormalizedUpdatePaperQuestionInput,
} from "../validators/paper-draft";

export type PaperScoringPointAccessRow = {
  source_scoring_point_id: number | null;
  description: string;
  score: string;
  sort_order: number;
};

export type PaperQuestionAccessRow = {
  id: number;
  public_id: string;
  source_question_public_id: string;
  paper_section_id: number;
  paper_section_sort_order?: number;
  question_group_id: number | null;
  question_group_sort_order?: number | null;
  question_snapshot: QuestionSnapshotDto;
  material_snapshot: MaterialSnapshotDto | null;
  score: string | null;
  sort_order: number;
  scoring_points: PaperScoringPointAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type PaperSectionAccessRow = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  total_score: string;
  paper_questions: PaperQuestionAccessRow[];
};

export type QuestionGroupAccessRow = {
  id: number;
  paper_section_id: number;
  material_public_id: string;
  material_snapshot: MaterialSnapshotDto;
  title: string;
  sort_order: number;
};

export type PaperDraftAccessRow = {
  id: number;
  public_id: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paper_status: PaperStatus;
  paper_type: PaperType | null;
  year: number | null;
  source: string | null;
  duration_minute: number | null;
  total_score: string | null;
  published_at: Date | null;
  archived_at: Date | null;
  paper_sections: PaperSectionAccessRow[];
  question_groups: QuestionGroupAccessRow[];
  created_at: Date;
  updated_at: Date;
};

export type PaperDraftListResult = {
  rows: PaperDraftAccessRow[];
  total: number;
};

export type UpdatePaperInput = NormalizedUpdatePaperInput & {
  publicId: string;
};

export type AddPaperQuestionInput = NormalizedAddPaperQuestionInput & {
  paperPublicId: string;
};

export type UpdatePaperQuestionInput = NormalizedUpdatePaperQuestionInput & {
  paperPublicId: string;
  paperQuestionPublicId: string;
};

export type RemovePaperQuestionInput = {
  paperPublicId: string;
  paperQuestionPublicId: string;
};

export type PublishPaperInput = {
  paperPublicId: string;
  sourceQuestionPublicIds: string[];
  materialPublicIds: string[];
};

export type ArchivePaperInput = {
  paperPublicId: string;
};

export type DeletePaperInput = {
  paperPublicId: string;
};

export type CopyPaperInput = {
  sourcePaper: PaperDraftAccessRow;
};

export type PaperDraftRepository = {
  listPapers(query: NormalizedPaperListInput): Promise<PaperDraftListResult>;
  createPaper(input: NormalizedCreatePaperInput): Promise<PaperDraftAccessRow>;
  findPaperByPublicId(publicId: string): Promise<PaperDraftAccessRow | null>;
  updatePaper(input: UpdatePaperInput): Promise<PaperDraftAccessRow>;
  addQuestionToDraftPaper(
    input: AddPaperQuestionInput,
  ): Promise<PaperQuestionAccessRow | null>;
  updatePaperQuestion(
    input: UpdatePaperQuestionInput,
  ): Promise<PaperQuestionAccessRow | null>;
  removePaperQuestion(
    input: RemovePaperQuestionInput,
  ): Promise<PaperDraftAccessRow | null>;
  publishPaper(input: PublishPaperInput): Promise<PaperDraftAccessRow | null>;
  archivePaper(input: ArchivePaperInput): Promise<PaperDraftAccessRow | null>;
  deletePaper(input: DeletePaperInput): Promise<boolean>;
  copyPaper(input: CopyPaperInput): Promise<PaperDraftAccessRow | null>;
};
