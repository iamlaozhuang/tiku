import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperPlanAndSelectInsufficiencyDto,
  AiPaperQuestionGroupSnapshotDto,
} from "./ai-paper-plan-and-select-contract";
import type { Profession, QuestionType, Subject } from "../models/paper";
import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultFormalAdoptionStatus,
  PersonalAiGenerationResultRedactionStatus,
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";
import type { EvidenceStatus } from "../models/ai-rag";
import type { AiGenerationRouteIntegratedQuestionDraftSummary } from "./route-integrated-provider-execution-contract";

export type PersonalAiGenerationQuestionDraftSnapshotDto = {
  schemaVersion: "question_draft_v1";
  kind: "question_set";
  taskPublicId: string;
  ownerPublicId: string;
  taskType: "ai_question_generation";
  requestedQuestionCount: number;
  questions: AiGenerationRouteIntegratedQuestionDraftSummary[];
};

export type PersonalAiGenerationPrivateQuestionDraftSnapshotDto = {
  schemaVersion: "question_draft_v1";
  snapshot: PersonalAiGenerationQuestionDraftSnapshotDto;
  digest: string;
};

export type PersonalAiGenerationPaperQuestionSourceVersionDto =
  | {
      kind: "platform_question_updated_at";
      updatedAt: string;
    }
  | {
      kind: "organization_training_version";
      trainingVersionPublicId: string;
      trainingVersionNumber: number;
      publishedAt: string;
    };

export type PersonalAiGenerationPaperQuestionSnapshotOptionDto = {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
};

export type PersonalAiGenerationPaperQuestionSnapshotScoringPointDto = {
  description: string;
  score: string;
  sortOrder: number;
};

export type PersonalAiGenerationPaperQuestionSnapshotFillBlankAnswerDto = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

export type PersonalAiGenerationPaperQuestionSourceDto = {
  questionPublicId: string;
  sourceKind: "platform_formal_question" | "enterprise_training_snapshot";
  sourceVersion: PersonalAiGenerationPaperQuestionSourceVersionDto;
  profession: Profession;
  level: number;
  subject: Subject;
  questionType: QuestionType;
  difficulty: string | null;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  ancestorKnowledgeNodePublicIds: string[];
  questionStem: string;
  questionOptions: PersonalAiGenerationPaperQuestionSnapshotOptionDto[];
  standardAnswerLabels: string[];
  standardAnswerText: string | null;
  analysis: string | null;
  scoringPoints: PersonalAiGenerationPaperQuestionSnapshotScoringPointDto[];
  fillBlankAnswers: PersonalAiGenerationPaperQuestionSnapshotFillBlankAnswerDto[];
  questionGroup: AiPaperQuestionGroupSnapshotDto | null;
};

export type PersonalAiGenerationPaperQuestionSnapshotDto = {
  schemaVersion: "paper_question_snapshot_v1";
  kind: "paper_question_set";
  resultPublicId: string;
  taskPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  taskType: "ai_paper_generation";
  paperAssemblyDigest: string;
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto;
  questions: PersonalAiGenerationPaperQuestionSourceDto[];
};

export type PersonalAiGenerationPrivatePaperQuestionSnapshotDto = {
  schemaVersion: "paper_question_snapshot_v1";
  snapshot: PersonalAiGenerationPaperQuestionSnapshotDto;
  digest: string;
};

export type PersonalAiGenerationResultPaperAssemblySnapshotDto = {
  status: "assembled" | "insufficient";
  sourceDiagnostics: {
    role: "personal_advanced_student" | "org_advanced_employee";
    platformQuestionCount: number;
    enterpriseQuestionCount: number;
    enterpriseSourceStatus: "not_applicable" | "resolved" | "not_resolved";
  };
  container: AiPaperPlanAndSelectContainerDto;
  insufficiency: AiPaperPlanAndSelectInsufficiencyDto | null;
  redactionStatus: "redacted";
};

export type PersonalAiGenerationResultDto = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  taskType: PersonalAiGenerationResultTaskType;
  status: PersonalAiGenerationResultStatus;
  persistedAt: string;
  contentReference: {
    contentDigest: string;
    contentPreviewMasked: string;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    redactionStatus: PersonalAiGenerationResultRedactionStatus;
  };
  evidenceReference: {
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
    redactionStatus: PersonalAiGenerationResultRedactionStatus;
  };
  formalAdoption: {
    isBlocked: true;
    status: PersonalAiGenerationResultFormalAdoptionStatus;
  };
  paperAssembly: PersonalAiGenerationResultPaperAssemblySnapshotDto | null;
};

export type PersonalAiGenerationResultPersistenceDto = {
  persistenceStatus: "created" | "reused";
  result: PersonalAiGenerationResultDto;
};
