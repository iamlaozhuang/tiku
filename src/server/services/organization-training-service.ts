import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type { OrganizationTrainingDraftDto } from "../contracts/organization-training-contract";
import type { Profession } from "../models/auth";
import type { OrganizationTrainingQuestionTypeSummary } from "../models/organization-training";
import type { Subject } from "../models/paper";

export const organizationTrainingManualDraftCreationBlockedMessage =
  "Organization training manual draft creation is blocked.";

export type OrganizationTrainingManualDraftCreationBlockedReason =
  | "invalid_manual_draft_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied"
  | "authorization_scope_mismatch";

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

export type OrganizationTrainingService = {
  createManualDraft(
    command: OrganizationTrainingCreateManualDraftCommand,
  ): Promise<OrganizationTrainingCreateManualDraftResult>;
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

function isValidLevel(value: number): boolean {
  return Number.isInteger(value) && value > 0;
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
  draftStore: OrganizationTrainingDraftStore,
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
        !isValidLevel(command.draftInput.level)
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
        draft: await draftStore.createManualDraft(draftWrite),
      };
    },
  };
}
