import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import type { Profession } from "../models/auth";
import {
  type OrganizationTrainingCopyToNewDraftInput,
  organizationTrainingQuestionTypeValues,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingQuestionTypeSummary,
  type OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import { subjectValues, type Subject } from "../models/paper";

export const organizationTrainingManualDraftCreationBlockedMessage =
  "Organization training manual draft creation is blocked.";

export const organizationTrainingPublishBlockedMessage =
  "Organization training publish is blocked.";

export const organizationTrainingTakedownBlockedMessage =
  "Organization training takedown is blocked.";

export const organizationTrainingCopyToNewDraftBlockedMessage =
  "Organization training copy-to-new-draft is blocked.";

export type OrganizationTrainingManualDraftCreationBlockedReason =
  | "invalid_manual_draft_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied"
  | "authorization_scope_mismatch";

export type OrganizationTrainingPublishBlockedReason =
  | "invalid_publish_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied";

export type OrganizationTrainingTakedownBlockedReason =
  | "invalid_takedown_input"
  | "organization_scope_denied";

export type OrganizationTrainingCopyToNewDraftBlockedReason =
  | "invalid_copy_to_new_draft_input"
  | "organization_scope_denied";

export type OrganizationTrainingAdminContext = {
  adminPublicId: string;
  visibleOrganizationPublicIds: readonly string[];
};

export type OrganizationTrainingManualDraftInput = {
  organizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
};

export type OrganizationTrainingCreateManualDraftCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationContext: EffectiveAuthorizationContextDto;
  draftInput: OrganizationTrainingManualDraftInput;
};

export type OrganizationTrainingManualDraftWrite = Omit<
  OrganizationTrainingDraftDto,
  "publicId"
> & {
  contentType: "organization_training_draft";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
};

export type OrganizationTrainingDraftStore = {
  createManualDraft(
    draftWrite: OrganizationTrainingManualDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
};

export type OrganizationTrainingPublishedVersionWrite = Omit<
  OrganizationTrainingPublishedVersionDto,
  "publicId" | "versionNumber"
> & {
  contentType: "organization_training_version";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingPersistenceLineage = {
  organizationId: number;
  orgAuthId: number;
};

export type OrganizationTrainingPublishedVersionPersistenceWrite =
  OrganizationTrainingPublishedVersionWrite &
    OrganizationTrainingPersistenceLineage;

export type OrganizationTrainingTakedownAccessPolicy = {
  allowNewAnswers: false;
  allowDraftSaves: false;
  allowQuestionDetailReentry: false;
  employeeHistoryVisibility: "own_summary_only";
  preserveHistory: true;
};

export type OrganizationTrainingVersionTakedownWrite = {
  versionPublicId: string;
  organizationPublicId: string;
  status: "taken_down";
  takenDownAt: string;
  takedownReason: string;
  accessPolicy: OrganizationTrainingTakedownAccessPolicy;
};

export type OrganizationTrainingVersionCopyPolicy = {
  preserveSourceVersion: true;
  preservePublishScopeSnapshot: true;
  createFreshDraftPublicId: true;
};

export type OrganizationTrainingVersionCopyToNewDraftWrite = {
  sourceVersionPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  sourceVersion: OrganizationTrainingPublishedVersionDto;
  sourceQuestionTypeSummary: OrganizationTrainingQuestionTypeSummary;
  newDraftTitle: string;
  contentType: "organization_training_draft";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
  createdAt: string;
  copyPolicy: OrganizationTrainingVersionCopyPolicy;
};

export type OrganizationTrainingVersionStore = {
  publishVersion(
    versionWrite: OrganizationTrainingPublishedVersionPersistenceWrite,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  takeDownVersion(
    takedownWrite: OrganizationTrainingVersionTakedownWrite,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  copyVersionToNewDraft(
    copyWrite: OrganizationTrainingVersionCopyToNewDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
};

export type OrganizationTrainingStore = OrganizationTrainingDraftStore &
  OrganizationTrainingVersionStore;

export type OrganizationTrainingClock = {
  now(): Date;
};

export type OrganizationTrainingCreateManualDraftResult =
  | {
      success: true;
      draft: OrganizationTrainingDraftDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingManualDraftCreationBlockedReason;
      message: typeof organizationTrainingManualDraftCreationBlockedMessage;
    };

export type OrganizationTrainingPublishVersionCommand = {
  publishInput: OrganizationTrainingPublishInput;
  persistenceLineage: OrganizationTrainingPersistenceLineage;
};

export type OrganizationTrainingTakeDownVersionCommand = {
  adminContext: OrganizationTrainingAdminContext;
  versionOrganizationPublicId: string;
  takedownInput: OrganizationTrainingTakedownInput;
};

export type OrganizationTrainingCopyVersionToNewDraftCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationPublicId: string;
  copyInput: OrganizationTrainingCopyToNewDraftInput;
  sourceVersion: OrganizationTrainingPublishedVersionDto;
  sourceQuestionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingPublishVersionResult =
  | {
      success: true;
      version: OrganizationTrainingPublishedVersionDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingPublishBlockedReason;
      message: typeof organizationTrainingPublishBlockedMessage;
    };

export type OrganizationTrainingTakeDownVersionResult =
  | {
      success: true;
      version: OrganizationTrainingPublishedVersionDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingTakedownBlockedReason;
      message: typeof organizationTrainingTakedownBlockedMessage;
    };

export type OrganizationTrainingCopyVersionToNewDraftResult =
  | {
      success: true;
      draft: OrganizationTrainingDraftDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingCopyToNewDraftBlockedReason;
      message: typeof organizationTrainingCopyToNewDraftBlockedMessage;
    };

export type OrganizationTrainingService = {
  createManualDraft(
    command: OrganizationTrainingCreateManualDraftCommand,
  ): Promise<OrganizationTrainingCreateManualDraftResult>;
  publishVersion(
    command: OrganizationTrainingPublishVersionCommand,
  ): Promise<OrganizationTrainingPublishVersionResult>;
  takeDownVersion(
    command: OrganizationTrainingTakeDownVersionCommand,
  ): Promise<OrganizationTrainingTakeDownVersionResult>;
  copyVersionToNewDraft(
    command: OrganizationTrainingCopyVersionToNewDraftCommand,
  ): Promise<OrganizationTrainingCopyVersionToNewDraftResult>;
};

const systemClock: OrganizationTrainingClock = {
  now() {
    return new Date();
  },
};

function createBlockedResult(
  reason: OrganizationTrainingManualDraftCreationBlockedReason,
): OrganizationTrainingCreateManualDraftResult {
  return {
    success: false,
    reason,
    message: organizationTrainingManualDraftCreationBlockedMessage,
  };
}

function createPublishBlockedResult(
  reason: OrganizationTrainingPublishBlockedReason,
): OrganizationTrainingPublishVersionResult {
  return {
    success: false,
    reason,
    message: organizationTrainingPublishBlockedMessage,
  };
}

function createTakedownBlockedResult(
  reason: OrganizationTrainingTakedownBlockedReason,
): OrganizationTrainingTakeDownVersionResult {
  return {
    success: false,
    reason,
    message: organizationTrainingTakedownBlockedMessage,
  };
}

function createCopyToNewDraftBlockedResult(
  reason: OrganizationTrainingCopyToNewDraftBlockedReason,
): OrganizationTrainingCopyVersionToNewDraftResult {
  return {
    success: false,
    reason,
    message: organizationTrainingCopyToNewDraftBlockedMessage,
  };
}

function normalizeRequiredText(value: string): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = normalizeRequiredText(value);
  return trimmedValue;
}

function createEmptyQuestionTypeSummary(): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: 0,
    multiChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
  };
}

function copyQuestionTypeSummary(
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary,
): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: questionTypeSummary.singleChoice,
    multiChoice: questionTypeSummary.multiChoice,
    trueFalse: questionTypeSummary.trueFalse,
    shortAnswer: questionTypeSummary.shortAnswer,
  };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isValidLevel(value: number): boolean {
  return isPositiveInteger(value);
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isSubject(value: unknown): value is Subject {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isOrganizationTrainingQuestionType(value: unknown): boolean {
  return (
    typeof value === "string" &&
    organizationTrainingQuestionTypeValues.includes(
      value as (typeof organizationTrainingQuestionTypeValues)[number],
    )
  );
}

function isAdvancedOrgAuthContext(
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.authorizationSource === "org_auth" &&
    authorizationContext.ownerType === "organization" &&
    authorizationContext.organizationPublicId !== null &&
    authorizationContext.quotaOwnerType === "organization"
  );
}

function getPublishCapabilityBlockedReason(
  capabilityContext: OrganizationTrainingPublishInput["capabilityContext"],
): OrganizationTrainingPublishBlockedReason | null {
  if (capabilityContext.effectiveEdition !== "advanced") {
    return "advanced_edition_required";
  }

  if (capabilityContext.authorizationSource !== "org_auth") {
    return "org_auth_required";
  }

  if (capabilityContext.canCreateOrganizationTraining !== true) {
    return "organization_training_capability_required";
  }

  return null;
}

function isOrganizationVisibleToAdmin(
  organizationPublicId: string,
  adminContext: OrganizationTrainingAdminContext,
): boolean {
  return adminContext.visibleOrganizationPublicIds
    .map((visibleOrganizationPublicId) =>
      normalizeRequiredText(visibleOrganizationPublicId),
    )
    .includes(organizationPublicId);
}

function isOrganizationOwnedByAuthorization(
  organizationPublicId: string,
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.organizationPublicId === organizationPublicId &&
    authorizationContext.ownerPublicId === organizationPublicId &&
    authorizationContext.quotaOwnerPublicId === organizationPublicId
  );
}

function normalizePublicIdList(values: readonly string[]): string[] {
  const normalizedValues = values
    .map((value) => normalizeRequiredText(value))
    .filter((value): value is string => value !== null);

  return Array.from(new Set(normalizedValues));
}

function isPublishQuestionsValid(
  publishInput: OrganizationTrainingPublishInput,
): boolean {
  if (
    !Array.isArray(publishInput.questions) ||
    publishInput.questions.length === 0 ||
    publishInput.questionCount !== publishInput.questions.length
  ) {
    return false;
  }

  const totalScore = publishInput.questions.reduce(
    (scoreTotal, question) => scoreTotal + question.score,
    0,
  );

  if (publishInput.totalScore !== totalScore) {
    return false;
  }

  return publishInput.questions.every(
    (question) =>
      normalizeRequiredText(question.publicId) !== null &&
      isOrganizationTrainingQuestionType(question.questionType) &&
      isPositiveInteger(question.score) &&
      normalizeRequiredText(question.standardAnswer) !== null &&
      normalizeRequiredText(question.analysisSummary) !== null &&
      isNonNegativeInteger(question.citationCount),
  );
}

function isQuestionTypeSummaryValid(
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary,
  questionCount: number,
): boolean {
  const summaryValues = [
    questionTypeSummary.singleChoice,
    questionTypeSummary.multiChoice,
    questionTypeSummary.trueFalse,
    questionTypeSummary.shortAnswer,
  ];

  return (
    summaryValues.every(isNonNegativeInteger) &&
    summaryValues.reduce((summaryTotal, value) => summaryTotal + value, 0) ===
      questionCount
  );
}

type NormalizedPublishMetadata = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  publishScopeOrganizationPublicIds: string[];
};

function normalizePublishMetadata(
  publishInput: OrganizationTrainingPublishInput,
): NormalizedPublishMetadata | null {
  const draftPublicId = normalizeRequiredText(publishInput.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    publishInput.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    publishInput.authorizationPublicId,
  );
  const title = normalizeRequiredText(publishInput.title);
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    publishInput.publishScopeOrganizationPublicIds,
  );

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    title === null ||
    !isValidLevel(publishInput.level) ||
    !isSubject(publishInput.subject) ||
    publishScopeOrganizationPublicIds.length === 0 ||
    !isPublishQuestionsValid(publishInput) ||
    !isQuestionTypeSummaryValid(
      publishInput.questionTypeSummary,
      publishInput.questionCount,
    )
  ) {
    return null;
  }

  return {
    draftPublicId,
    organizationPublicId,
    authorizationPublicId,
    profession: publishInput.profession,
    level: publishInput.level,
    subject: publishInput.subject,
    title,
    description: normalizeOptionalText(publishInput.description),
    publishScopeOrganizationPublicIds,
  };
}

function copyPublishedVersion(
  sourceVersion: OrganizationTrainingPublishedVersionDto,
): OrganizationTrainingPublishedVersionDto {
  return {
    ...sourceVersion,
    publishScopeSnapshot: {
      organizationPublicIds: [
        ...sourceVersion.publishScopeSnapshot.organizationPublicIds,
      ],
      capturedAt: sourceVersion.publishScopeSnapshot.capturedAt,
    },
  };
}

function isCopyableVersionStatus(
  status: OrganizationTrainingPublishedVersionDto["status"],
): boolean {
  return status === "published" || status === "taken_down";
}

type NormalizedTakedownMetadata = {
  versionPublicId: string;
  organizationPublicId: string;
  takedownReason: string;
};

function normalizeTakedownMetadata(
  command: OrganizationTrainingTakeDownVersionCommand,
): NormalizedTakedownMetadata | null {
  const versionPublicId = normalizeRequiredText(
    command.takedownInput.versionPublicId,
  );
  const organizationPublicId = normalizeRequiredText(
    command.versionOrganizationPublicId,
  );
  const takedownReason = normalizeRequiredText(
    command.takedownInput.takedownReason,
  );

  if (
    versionPublicId === null ||
    organizationPublicId === null ||
    takedownReason === null
  ) {
    return null;
  }

  return {
    versionPublicId,
    organizationPublicId,
    takedownReason,
  };
}

type NormalizedCopyToNewDraftMetadata = {
  sourceVersionPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  newDraftTitle: string;
};

function normalizeCopyToNewDraftMetadata(
  command: OrganizationTrainingCopyVersionToNewDraftCommand,
): NormalizedCopyToNewDraftMetadata | null {
  const sourceVersionPublicId = normalizeRequiredText(
    command.copyInput.sourceVersionPublicId,
  );
  const sourceVersionDtoPublicId = normalizeRequiredText(
    command.sourceVersion.publicId,
  );
  const organizationPublicId = normalizeRequiredText(
    command.sourceVersion.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    command.authorizationPublicId,
  );
  const newDraftTitle = normalizeRequiredText(command.copyInput.newDraftTitle);

  if (
    sourceVersionPublicId === null ||
    sourceVersionDtoPublicId === null ||
    sourceVersionPublicId !== sourceVersionDtoPublicId ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    newDraftTitle === null ||
    !isCopyableVersionStatus(command.sourceVersion.status) ||
    !isQuestionTypeSummaryValid(
      command.sourceQuestionTypeSummary,
      command.sourceVersion.questionCount,
    )
  ) {
    return null;
  }

  return {
    sourceVersionPublicId,
    organizationPublicId,
    authorizationPublicId,
    newDraftTitle,
  };
}

function normalizePersistenceLineage(
  persistenceLineage: OrganizationTrainingPersistenceLineage | undefined,
): OrganizationTrainingPersistenceLineage | null {
  if (persistenceLineage === undefined) {
    return null;
  }

  if (
    !isPositiveInteger(persistenceLineage.organizationId) ||
    !isPositiveInteger(persistenceLineage.orgAuthId)
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

function isAuthorizationContentScopeMatched(
  draftInput: OrganizationTrainingManualDraftInput,
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.profession === draftInput.profession &&
    authorizationContext.level === draftInput.level
  );
}

export function createOrganizationTrainingService(
  trainingStore: OrganizationTrainingStore,
  clock: OrganizationTrainingClock = systemClock,
): OrganizationTrainingService {
  return {
    async createManualDraft(command) {
      const organizationPublicId = normalizeRequiredText(
        command.draftInput.organizationPublicId,
      );
      const title = normalizeRequiredText(command.draftInput.title);

      if (
        organizationPublicId === null ||
        title === null ||
        !isValidLevel(command.draftInput.level) ||
        !isSubject(command.draftInput.subject)
      ) {
        return createBlockedResult("invalid_manual_draft_input");
      }

      if (command.authorizationContext.effectiveEdition !== "advanced") {
        return createBlockedResult("advanced_edition_required");
      }

      if (!isAdvancedOrgAuthContext(command.authorizationContext)) {
        return createBlockedResult("org_auth_required");
      }

      if (
        command.authorizationContext.capabilities
          .canCreateOrganizationTraining !== true
      ) {
        return createBlockedResult("organization_training_capability_required");
      }

      if (
        !isOrganizationVisibleToAdmin(
          organizationPublicId,
          command.adminContext,
        ) ||
        !isOrganizationOwnedByAuthorization(
          organizationPublicId,
          command.authorizationContext,
        )
      ) {
        return createBlockedResult("organization_scope_denied");
      }

      if (
        !isAuthorizationContentScopeMatched(
          command.draftInput,
          command.authorizationContext,
        )
      ) {
        return createBlockedResult("authorization_scope_mismatch");
      }

      const createdAt = clock.now().toISOString();
      const draftWrite: OrganizationTrainingManualDraftWrite = {
        contentType: "organization_training_draft",
        ownerType: "organization",
        ownerPublicId: organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: organizationPublicId,
        sourceTaskPublicId: null,
        organizationPublicId,
        authorizationSource: "org_auth",
        authorizationPublicId:
          command.authorizationContext.authorizationPublicId,
        profession: command.draftInput.profession,
        level: command.draftInput.level,
        subject: command.draftInput.subject,
        title,
        description: normalizeOptionalText(command.draftInput.description),
        questionCount: 0,
        totalScore: 0,
        questionTypeSummary: createEmptyQuestionTypeSummary(),
        evidenceStatus: "none",
        validationStatus: "needs_review",
        retentionStatus: "active",
        createdAt,
        expiresAt: null,
      };

      return {
        success: true,
        draft: await trainingStore.createManualDraft(draftWrite),
      };
    },

    async publishVersion(command) {
      const publishInput = command.publishInput;
      const normalizedMetadata = normalizePublishMetadata(publishInput);
      const normalizedPersistenceLineage = normalizePersistenceLineage(
        command.persistenceLineage,
      );

      if (
        normalizedMetadata === null ||
        normalizedPersistenceLineage === null
      ) {
        return createPublishBlockedResult("invalid_publish_input");
      }

      const capabilityBlockedReason = getPublishCapabilityBlockedReason(
        publishInput.capabilityContext,
      );

      if (capabilityBlockedReason !== null) {
        return createPublishBlockedResult(capabilityBlockedReason);
      }

      if (
        !normalizedMetadata.publishScopeOrganizationPublicIds.includes(
          normalizedMetadata.organizationPublicId,
        )
      ) {
        return createPublishBlockedResult("organization_scope_denied");
      }

      const publishedAt = clock.now().toISOString();
      const versionWrite: OrganizationTrainingPublishedVersionPersistenceWrite =
        {
          contentType: "organization_training_version",
          ownerType: "organization",
          ownerPublicId: normalizedMetadata.organizationPublicId,
          quotaOwnerType: "organization",
          quotaOwnerPublicId: normalizedMetadata.organizationPublicId,
          authorizationSource: "org_auth",
          authorizationPublicId: normalizedMetadata.authorizationPublicId,
          draftPublicId: normalizedMetadata.draftPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          publishScopeSnapshot: {
            organizationPublicIds: [
              ...normalizedMetadata.publishScopeOrganizationPublicIds,
            ],
            capturedAt: publishedAt,
          },
          profession: normalizedMetadata.profession,
          level: normalizedMetadata.level,
          subject: normalizedMetadata.subject,
          title: normalizedMetadata.title,
          description: normalizedMetadata.description,
          questionCount: publishInput.questionCount,
          totalScore: publishInput.totalScore,
          questionTypeSummary: copyQuestionTypeSummary(
            publishInput.questionTypeSummary,
          ),
          status: "published",
          publishedAt,
          takenDownAt: null,
          takedownReason: null,
          organizationId: normalizedPersistenceLineage.organizationId,
          orgAuthId: normalizedPersistenceLineage.orgAuthId,
        };

      return {
        success: true,
        version: await trainingStore.publishVersion(versionWrite),
      };
    },

    async takeDownVersion(command) {
      const normalizedMetadata = normalizeTakedownMetadata(command);

      if (normalizedMetadata === null) {
        return createTakedownBlockedResult("invalid_takedown_input");
      }

      if (
        !isOrganizationVisibleToAdmin(
          normalizedMetadata.organizationPublicId,
          command.adminContext,
        )
      ) {
        return createTakedownBlockedResult("organization_scope_denied");
      }

      const takenDownAt = clock.now().toISOString();

      return {
        success: true,
        version: await trainingStore.takeDownVersion({
          versionPublicId: normalizedMetadata.versionPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          status: "taken_down",
          takenDownAt,
          takedownReason: normalizedMetadata.takedownReason,
          accessPolicy: {
            allowNewAnswers: false,
            allowDraftSaves: false,
            allowQuestionDetailReentry: false,
            employeeHistoryVisibility: "own_summary_only",
            preserveHistory: true,
          },
        }),
      };
    },

    async copyVersionToNewDraft(command) {
      const normalizedMetadata = normalizeCopyToNewDraftMetadata(command);

      if (normalizedMetadata === null) {
        return createCopyToNewDraftBlockedResult(
          "invalid_copy_to_new_draft_input",
        );
      }

      if (
        !isOrganizationVisibleToAdmin(
          normalizedMetadata.organizationPublicId,
          command.adminContext,
        )
      ) {
        return createCopyToNewDraftBlockedResult("organization_scope_denied");
      }

      return {
        success: true,
        draft: await trainingStore.copyVersionToNewDraft({
          sourceVersionPublicId: normalizedMetadata.sourceVersionPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          authorizationPublicId: normalizedMetadata.authorizationPublicId,
          sourceVersion: copyPublishedVersion(command.sourceVersion),
          sourceQuestionTypeSummary: copyQuestionTypeSummary(
            command.sourceQuestionTypeSummary,
          ),
          newDraftTitle: normalizedMetadata.newDraftTitle,
          contentType: "organization_training_draft",
          ownerType: "organization",
          ownerPublicId: normalizedMetadata.organizationPublicId,
          quotaOwnerType: "organization",
          quotaOwnerPublicId: normalizedMetadata.organizationPublicId,
          createdAt: clock.now().toISOString(),
          copyPolicy: {
            preserveSourceVersion: true,
            preservePublishScopeSnapshot: true,
            createFreshDraftPublicId: true,
          },
        }),
      };
    },
  };
}
