import type { ApiResponse } from "./api-response";
import type { AdminAiGenerationFormalAdoptionDto } from "./admin-ai-generation-formal-adoption-contract";
import type {
  PaperDraftResultDto,
  PaperQuestionResultDto,
} from "./paper-draft-contract";
import type { QuestionResultDto } from "./question-contract";
import type {
  MultiChoiceRule,
  PaperType,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "../models/paper";
import type {
  FillBlankAnswerDto,
  QuestionOptionDto,
  ScoringPointDto,
} from "./question-contract";

export const ADMIN_AI_GENERATION_FORMAL_DRAFT_ADAPTER_ERROR_CODES = {
  invalidInput: 400016,
  notEligible: 409016,
  writerFailed: 502016,
} as const;

export type AdminAiGenerationFormalQuestionDraftPayload = {
  questionType: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  multiChoiceRule: MultiChoiceRule;
  scoringMethod: ScoringMethod;
  materialPublicId: string | null;
  questionOptions: QuestionOptionDto[];
  scoringPoints: ScoringPointDto[];
  fillBlankAnswers: FillBlankAnswerDto[];
  knowledgeNodePublicIds: string[];
  tagPublicIds: string[];
};

export type AdminAiGenerationFormalPaperDraftPayload = {
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType | null;
  year: number | null;
  source: string | null;
  durationMinute: number | null;
  totalScore: string | null;
  paperSections?: AdminAiGenerationFormalPaperSectionDraftPayload[];
};

export type AdminAiGenerationFormalReviewedDraftPayload =
  | AdminAiGenerationFormalQuestionDraftPayload
  | AdminAiGenerationFormalPaperDraftPayload;

export type AdminAiGenerationFormalPaperSectionDraftPayload = {
  title: string;
  description: string | null;
  sortOrder: number;
  paperQuestions: AdminAiGenerationFormalPaperQuestionDraftPayload[];
};

export type AdminAiGenerationFormalQuestionGroupDraftPayload = {
  title: string;
  materialPublicId: string;
  sortOrder: number;
};

export type AdminAiGenerationFormalPaperQuestionDraftPayload = {
  questionPublicId: string | null;
  companionQuestionDraft: AdminAiGenerationFormalQuestionDraftPayload | null;
  score: string;
  sortOrder: number;
  questionGroup: AdminAiGenerationFormalQuestionGroupDraftPayload | null;
};

export type AdminAiGenerationFormalDraftAdapterInput = {
  adoption: AdminAiGenerationFormalAdoptionDto;
  targetType: "question" | "paper";
  reviewedDraft: unknown;
  writerContext?: AdminAiGenerationFormalDraftWriterContext;
};

export type AdminAiGenerationFormalDraftAdapterResultDto = {
  adoptionPublicId: string;
  sourceResultPublicId: string;
  targetType: "question" | "paper";
  formalTargetWriteStatus: "draft_created";
  formalQuestionPublicId: string | null;
  formalPaperPublicId: string | null;
  paperCompositionStatus?: "metadata_only" | "composed";
  paperSectionCount?: number;
  paperQuestionCount?: number;
  companionQuestionDraftCount?: number;
  redactionStatus: "redacted";
};

export type AdminAiGenerationFormalDraftWriterContext = {
  actorPublicId: string;
};

export type AdminAiGenerationFormalDraftQuestionCreationOptions = {
  initialStatus?: QuestionStatus;
};

export type AdminAiGenerationFormalDraftQuestionWriter = {
  createQuestion(
    input: AdminAiGenerationFormalQuestionDraftPayload,
    context: AdminAiGenerationFormalDraftWriterContext,
    options?: AdminAiGenerationFormalDraftQuestionCreationOptions,
  ): Promise<ApiResponse<QuestionResultDto | null>>;
};

export type AdminAiGenerationFormalDraftPaperWriter = {
  createPaper(
    input: AdminAiGenerationFormalPaperDraftPayload,
    context: AdminAiGenerationFormalDraftWriterContext,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  addQuestionToDraftPaper?(
    paperPublicId: string,
    input: {
      questionPublicId: string;
      score: string;
      sortOrder: number;
      paperSection: {
        title: string;
        description: string | null;
        sortOrder: number;
      };
      questionGroup: AdminAiGenerationFormalQuestionGroupDraftPayload | null;
    },
  ): Promise<ApiResponse<PaperQuestionResultDto | null>>;
};
