import type {
  EffectiveAuthorizationBlockedReason,
  EffectiveAuthorizationCapabilitiesDto,
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationOwnerType,
  AuthorizationType,
} from "../contracts/effective-authorization-contract";
import type { Profession } from "../models/auth";

export type AuthorizationObjectScopeInput = {
  authorizationPublicId: string;
  authorizationSource: AuthorizationType;
  ownerType: EffectiveAuthorizationOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  profession: Profession;
  level: number;
  requiredCapability: keyof EffectiveAuthorizationCapabilitiesDto;
  allowedBlockedReasons: readonly EffectiveAuthorizationBlockedReason[];
};

function matchesAuthorizationObjectScope(
  context: EffectiveAuthorizationContextDto,
  input: AuthorizationObjectScopeInput,
): boolean {
  return (
    context.authorizationPublicId === input.authorizationPublicId &&
    context.authorizationSource === input.authorizationSource &&
    context.ownerType === input.ownerType &&
    context.ownerPublicId === input.ownerPublicId &&
    context.organizationPublicId === input.organizationPublicId &&
    context.quotaOwnerType === input.ownerType &&
    context.quotaOwnerPublicId === input.ownerPublicId &&
    context.profession === input.profession &&
    context.level === input.level &&
    context.effectiveEdition === "advanced" &&
    context.capabilities[input.requiredCapability] === true &&
    (context.blockedReason === null ||
      input.allowedBlockedReasons.includes(context.blockedReason))
  );
}

export function selectAuthorizationObjectScope(
  contexts: readonly EffectiveAuthorizationContextDto[],
  input: AuthorizationObjectScopeInput,
): EffectiveAuthorizationContextDto | null {
  const selectedContexts = contexts.filter(
    (context) => context.authorizationPublicId === input.authorizationPublicId,
  );

  if (selectedContexts.length !== 1) {
    return null;
  }

  const [selectedContext] = selectedContexts;

  return selectedContext !== undefined &&
    matchesAuthorizationObjectScope(selectedContext, input)
    ? selectedContext
    : null;
}
