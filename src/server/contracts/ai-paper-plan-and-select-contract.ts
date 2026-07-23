import type { Profession, QuestionType, Subject } from "../models/paper";

export const AI_PAPER_DEFAULT_TARGET_QUESTION_COUNT = 30;
export const AI_PAPER_MAX_TARGET_QUESTION_COUNT = 80;

export type AiPaperAssemblyRole =
  | "personal_advanced_student"
  | "org_advanced_employee"
  | "org_advanced_admin"
  | "content_admin";

export type AiPaperQuestionSourceKind =
  | "platform_formal_question"
  | "enterprise_training_snapshot"
  | "ai_generated_draft";

export type AiPaperSelectableQuestionStatus =
  | "available"
  | "published"
  | "disabled"
  | "draft"
  | "taken_down";

export type AiPaperSourcePreference =
  | "balanced"
  | "prefer_platform"
  | "prefer_enterprise";

export type AiPaperMatchTier =
  | "exact"
  | "descendant"
  | "nearby_knowledge"
  | "same_scope";

export type AiPaperMatchQuality =
  | "fully_matched"
  | "supplemented_from_nearby_knowledge"
  | "supplemented_from_same_scope"
  | "insufficient";

export type AiPaperAssemblyFailureCategory =
  | "target_count_out_of_range"
  | "provider_question_content_forbidden"
  | "invalid_plan_shape"
  | "section_count_mismatch"
  | "insufficient_formal_question_source";

export type AiPaperKnowledgeCoverageDto = {
  targetKnowledgeNodePublicIds: string[];
  targetParentKnowledgeNodePublicIds: string[];
};

export type AiPaperConstraintLineageDto = {
  request: {
    difficulty: string | null;
    knowledgeNodePublicIds: string[];
  };
  plan: {
    difficulty: string | null;
    knowledgeNodePublicIds: string[];
    parentKnowledgeNodePublicIds: string[];
  };
};

export type AiPaperSelectedConstraintMatchBasisDto = {
  difficulty: string | null;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  ancestorKnowledgeNodePublicIds: string[];
  matchTier: AiPaperMatchTier;
};

export type AiPaperAssemblyPlanSectionDto = {
  sectionKey: string;
  title: string;
  questionType: QuestionType;
  targetQuestionCount: number;
  targetScore: number;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  difficulty: string | null;
};

export type AiPaperAssemblyPlanDto = {
  title: string;
  profession: Profession;
  level: number;
  subject: Subject;
  targetQuestionCount: number;
  difficultyGoal: string | null;
  sourcePreference: AiPaperSourcePreference | null;
  sections: AiPaperAssemblyPlanSectionDto[];
  knowledgeCoverage: AiPaperKnowledgeCoverageDto;
  /** Present for newly normalized route plans; omitted only by legacy/direct callers. */
  requestConstraints?: AiPaperConstraintLineageDto["request"];
};

export type AiPaperAssemblyPlanValidationResult =
  | {
      accepted: true;
      failureCategory: null;
    }
  | {
      accepted: false;
      failureCategory: Exclude<
        AiPaperAssemblyFailureCategory,
        "insufficient_formal_question_source"
      >;
    };

export type AiPaperSelectableQuestionDto = {
  publicId: string;
  sourceKind: AiPaperQuestionSourceKind;
  organizationPublicId: string | null;
  status: AiPaperSelectableQuestionStatus;
  profession: Profession;
  level: number;
  subject: Subject;
  questionType: QuestionType;
  difficulty: string | null;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  ancestorKnowledgeNodePublicIds?: string[];
};

export type AiPaperPlanAndSelectInput = {
  role: AiPaperAssemblyRole;
  organizationPublicId: string | null;
  plan: AiPaperAssemblyPlanDto;
  platformQuestions: AiPaperSelectableQuestionDto[];
  enterpriseQuestions: AiPaperSelectableQuestionDto[];
};

export type AiPaperSelectedQuestionDto = {
  questionPublicId: string;
  sourceKind: Exclude<AiPaperQuestionSourceKind, "ai_generated_draft">;
  matchTier: AiPaperMatchTier;
  score: number;
  /** Absent only in legacy persisted snapshots. New assemblies always populate it. */
  constraintMatchBasis?: AiPaperSelectedConstraintMatchBasisDto;
};

export type AiPaperPlanAndSelectSectionDto = {
  sectionKey: string;
  title: string;
  questionType: QuestionType;
  targetQuestionCount: number;
  selectedQuestionCount: number;
  selectedQuestions: AiPaperSelectedQuestionDto[];
  degradationSummary: {
    exactCount: number;
    descendantCount?: number;
    nearbyKnowledgeCount: number;
    sameScopeCount: number;
  };
};

export type AiPaperPlanAndSelectContainerDto = {
  title: string;
  profession: Profession;
  level: number;
  subject: Subject;
  requestedQuestionCount: number;
  selectedQuestionCount: number;
  sourceComposition: {
    platformFormalQuestionCount: number;
    enterpriseTrainingSnapshotCount: number;
  };
  matchQuality: AiPaperMatchQuality;
  /** Absent only in legacy persisted snapshots. New assemblies always populate it. */
  constraintLineage?: AiPaperConstraintLineageDto;
  sections: AiPaperPlanAndSelectSectionDto[];
};

export type AiPaperPlanAndSelectInsufficiencyDto = {
  requestedQuestionCount: number;
  selectedQuestionCount: number;
  missingQuestionCount: number;
  failureCategory: "insufficient_formal_question_source";
};

export type AiPaperPlanAndSelectResult = {
  status: "assembled" | "insufficient";
  container: AiPaperPlanAndSelectContainerDto;
  insufficiency: AiPaperPlanAndSelectInsufficiencyDto | null;
};
