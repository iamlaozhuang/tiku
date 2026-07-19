import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type { Profession } from "../models/auth";
import type { EffectiveAuthorizationRepository } from "../repositories/effective-authorization-repository";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";

export type PersonalAiGenerationAuthorizationUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  organizationPublicId: string | null;
};

export type OwnedPersonalAiGenerationAuthorizationContext = {
  authorizationSource: "personal_auth" | "org_auth";
  authorizationPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: "personal" | "organization";
  quotaOwnerPublicId: string;
};

export type PersonalAiGenerationAuthorizationOwnershipRepository = Pick<
  EffectiveAuthorizationRepository,
  "listPersonalAuthsByUserPublicId" | "listOrgAuthsByUserPublicId"
>;

export async function resolveOwnedPersonalAiGenerationAuthorizationContext(input: {
  authorizationPublicId: string;
  userContext: PersonalAiGenerationAuthorizationUserContext;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
}): Promise<OwnedPersonalAiGenerationAuthorizationContext | null> {
  if (input.authorizationPublicId.trim().length === 0) {
    return null;
  }

  const [personalAuths, orgAuths] = await Promise.all([
    input.authorizationRepository.listPersonalAuthsByUserPublicId(
      input.userContext.userPublicId,
    ),
    input.authorizationRepository.listOrgAuthsByUserPublicId(
      input.userContext.userPublicId,
    ),
  ]);
  const exactPersonalAuths = personalAuths.filter(
    (personalAuth) => personalAuth.public_id === input.authorizationPublicId,
  );
  const exactOrgAuths = orgAuths.filter(
    (orgAuth) => orgAuth.public_id === input.authorizationPublicId,
  );

  if (exactPersonalAuths.length + exactOrgAuths.length !== 1) {
    return null;
  }

  const personalAuth = exactPersonalAuths[0];

  if (personalAuth !== undefined) {
    return {
      authorizationSource: "personal_auth",
      authorizationPublicId: personalAuth.public_id,
      ownerType: "personal",
      ownerPublicId: input.userContext.userPublicId,
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: input.userContext.userPublicId,
    };
  }

  const orgAuth = exactOrgAuths[0];
  const organizationPublicId = input.userContext.organizationPublicId;

  if (
    orgAuth === undefined ||
    input.userContext.userType !== "employee" ||
    organizationPublicId === null ||
    orgAuth.organization_public_id !== organizationPublicId
  ) {
    return null;
  }

  return {
    authorizationSource: "org_auth",
    authorizationPublicId: orgAuth.public_id,
    ownerType: "organization",
    ownerPublicId: organizationPublicId,
    organizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: organizationPublicId,
  };
}

function matchesOwnedAuthorizationContext(
  authorizationContext: EffectiveAuthorizationContextDto,
  ownedContext: OwnedPersonalAiGenerationAuthorizationContext,
): boolean {
  return (
    authorizationContext.authorizationSource ===
      ownedContext.authorizationSource &&
    authorizationContext.authorizationPublicId ===
      ownedContext.authorizationPublicId &&
    authorizationContext.ownerType === ownedContext.ownerType &&
    authorizationContext.ownerPublicId === ownedContext.ownerPublicId &&
    authorizationContext.organizationPublicId ===
      ownedContext.organizationPublicId &&
    authorizationContext.quotaOwnerType === ownedContext.quotaOwnerType &&
    authorizationContext.quotaOwnerPublicId === ownedContext.quotaOwnerPublicId
  );
}

function hasRequestedGenerationCapability(
  authorizationContext: EffectiveAuthorizationContextDto,
  taskType: "ai_question_generation" | "ai_paper_generation",
): boolean {
  return taskType === "ai_question_generation"
    ? authorizationContext.capabilities.canGenerateAiQuestion
    : authorizationContext.capabilities.canGenerateAiPaper;
}

export async function resolveEffectivePersonalAiGenerationAuthorizationContext(input: {
  authorizationPublicId: string;
  requestedScope: { profession: Profession; level: number } | null;
  taskType: "ai_question_generation" | "ai_paper_generation";
  userContext: PersonalAiGenerationAuthorizationUserContext;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
  effectiveAuthorizationService: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
}): Promise<EffectiveAuthorizationContextDto | null> {
  const ownedContext =
    await resolveOwnedPersonalAiGenerationAuthorizationContext({
      authorizationPublicId: input.authorizationPublicId,
      userContext: input.userContext,
      authorizationRepository: input.authorizationRepository,
    });

  if (ownedContext === null) {
    return null;
  }

  const authorizationResponse =
    await input.effectiveAuthorizationService.listEffectiveAuthorizations({
      userPublicId: input.userContext.userPublicId,
    });
  const authorizationContexts =
    authorizationResponse.code === 0 && authorizationResponse.data !== null
      ? authorizationResponse.data.authorizationContexts
      : undefined;

  if (authorizationContexts === undefined) {
    return null;
  }

  const exactOwnedContexts = authorizationContexts.filter(
    (authorizationContext) =>
      matchesOwnedAuthorizationContext(authorizationContext, ownedContext),
  );

  if (exactOwnedContexts.length !== 1) {
    return null;
  }

  const authorizationContext = exactOwnedContexts[0];
  const isRequestedScopeAllowed =
    input.requestedScope === null ||
    (authorizationContext.profession === input.requestedScope.profession &&
      authorizationContext.level === input.requestedScope.level);
  const isBlockedReasonAllowed =
    authorizationContext.blockedReason === null ||
    authorizationContext.blockedReason === "production_enablement_blocked";

  if (
    authorizationContext.effectiveEdition !== "advanced" ||
    !isRequestedScopeAllowed ||
    !hasRequestedGenerationCapability(authorizationContext, input.taskType) ||
    !isBlockedReasonAllowed
  ) {
    return null;
  }

  return authorizationContext;
}
