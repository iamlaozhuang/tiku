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
  QuestionDifficulty,
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
  difficulty: QuestionDifficulty;
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

export type AdminAiGenerationFormalQuestionKnowledgeNodeCandidateSource = {
  schemaVersion: 1;
  generationMode: "balanced" | "comprehensive";
  requestPublicId: string;
  resultPublicId: string;
  taskPublicId: string;
  generatedLabels: string[];
  questionDraft: AdminAiGenerationFormalQuestionDraftPayload;
};

export type AdminAiGenerationFormalQuestionReviewCandidatePayload =
  AdminAiGenerationFormalQuestionDraftPayload & {
    knowledgeNodePublicIds: [];
    knowledgeNodeConfirmation: {
      schemaVersion: 1;
      status: "unresolved";
      generationMode: "balanced" | "comprehensive";
      requestPublicId: string;
      resultPublicId: string;
      taskPublicId: string;
      sourceContentDigest: string;
      generatedLabels: string[];
    };
  };

export type AdminAiGenerationFormalPaperDraftPayload = {
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperType: PaperType | null;
  year: number | null;
  month: number | null;
  sourceDescription: string | null;
  sourceRegion: string | null;
  sourceOrganization: string | null;
  questionBasis: string | null;
  generationMethod: "ai";
  durationMinute: number | null;
  totalScore: string | null;
  paperSections?: AdminAiGenerationFormalPaperSectionDraftPayload[];
};

export type AdminAiGenerationFormalReviewedDraftPayload =
  | AdminAiGenerationFormalQuestionDraftPayload
  | AdminAiGenerationFormalQuestionReviewCandidatePayload
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
  questionPublicId: string;
  companionQuestionDraft: null;
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
