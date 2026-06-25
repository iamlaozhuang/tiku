import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationListDto,
} from "../contracts/effective-authorization-contract";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type {
  OrganizationTrainingCopyToNewDraftInput,
  OrganizationTrainingPublishInput,
  OrganizationTrainingQuestionTypeSummary,
  OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "../repositories/student-authorization-redeem-runtime-repository";
import {
  invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
  invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
  invalidOrganizationTrainingCopyToNewDraftInputMessage,
  invalidOrganizationTrainingManualDraftInputMessage,
  invalidOrganizationTrainingPublishInputMessage,
  invalidOrganizationTrainingSourceContextInputMessage,
  invalidOrganizationTrainingTakedownInputMessage,
  normalizeOrganizationTrainingCopyToNewDraftRouteInput,
  normalizeOrganizationTrainingEmployeeAnswerDraftInput,
  normalizeOrganizationTrainingEmployeeAnswerSubmitInput,
  normalizeOrganizationTrainingManualDraftInput,
  normalizeOrganizationTrainingPublishInput,
  normalizeOrganizationTrainingSourceContextInput,
  normalizeOrganizationTrainingTakedownInput,
  type OrganizationTrainingCopyToNewDraftRouteInput,
  type OrganizationTrainingManualDraftRouteInput,
  type OrganizationTrainingSourceContextRouteInput,
} from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  organizationTrainingEmployeeAnswerBlockedMessage,
  organizationTrainingCopyToNewDraftBlockedMessage,
  organizationTrainingManualDraftCreationBlockedMessage,
  organizationTrainingPublishBlockedMessage,
  organizationTrainingSourceContextBlockedMessage,
  organizationTrainingTakedownBlockedMessage,
  type OrganizationTrainingAdminContext,
  type OrganizationTrainingEmployeeContext,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingService,
  type OrganizationTrainingStore,
} from "./organization-training-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  createEffectiveAuthorizationService,
  type EffectiveAuthorizationService,
} from "./effective-authorization-service";
import type { SessionService } from "./session-service";

export type OrganizationTrainingPublishRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type OrganizationTrainingPersistenceLineageResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingPersistenceLineageResolver = (
  input: OrganizationTrainingPersistenceLineageResolverInput,
) => Promise<OrganizationTrainingPersistenceLineage | null>;

export type OrganizationTrainingTrustedPersistenceLineageLookupInput = {
  adminContext: OrganizationTrainingAdminContext;
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingTrustedPersistenceLineageLookup = (
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
) => Promise<OrganizationTrainingPersistenceLineage | null>;

export type OrganizationTrainingAdminContextResolverInput = {
  request: Request;
  pathPublicId: string;
  manualDraftInput?: OrganizationTrainingManualDraftRouteInput;
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
  copyToNewDraftInput?: OrganizationTrainingCopyToNewDraftRouteInput;
  sourceContextInput?: OrganizationTrainingSourceContextRouteInput;
};

export type OrganizationTrainingAdminContextResolver = (
  input: OrganizationTrainingAdminContextResolverInput,
) => Promise<OrganizationTrainingAdminContext | null>;

export type OrganizationTrainingVisibleOrganizationScopeResolverInput = {
  request: Request;
  pathPublicId: string;
  manualDraftInput?: OrganizationTrainingManualDraftRouteInput;
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
  copyToNewDraftInput?: OrganizationTrainingCopyToNewDraftRouteInput;
  sourceContextInput?: OrganizationTrainingSourceContextRouteInput;
  adminPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeResolver = (
  input: OrganizationTrainingVisibleOrganizationScopeResolverInput,
) => Promise<readonly string[] | null>;

export type OrganizationTrainingRouteOptions = {
  listEmployeeVisibleVersions?: OrganizationTrainingEmployeeVisibleVersionsReader;
  lookupTrustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineageLookup;
  resolveEmployeeAnswer?: OrganizationTrainingEmployeeAnswerResolver;
  resolveEmployeeContext?: OrganizationTrainingEmployeeContextResolver;
  resolveOrganizationAdminContext?: OrganizationTrainingAdminContextResolver;
  resolvePersistenceLineage?: OrganizationTrainingPersistenceLineageResolver;
  resolvePublishedVersion?: OrganizationTrainingPublishedVersionResolver;
  resolveSourceVersion?: OrganizationTrainingSourceVersionResolver;
  resolveVersionOrganizationPublicId?: OrganizationTrainingVersionOrganizationPublicIdResolver;
  resolveVersionQuestionTypeSummary?: OrganizationTrainingVersionQuestionTypeSummaryResolver;
};

export type OrganizationTrainingVersionOrganizationPublicIdResolverInput = {
  request: Request;
  pathPublicId: string;
  takedownInput: OrganizationTrainingTakedownInput;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingVersionOrganizationPublicIdResolver = (
  input: OrganizationTrainingVersionOrganizationPublicIdResolverInput,
) => Promise<string | null>;

export type OrganizationTrainingRuntimeRouteOptions = Pick<
  OrganizationTrainingRouteOptions,
  | "listEmployeeVisibleVersions"
  | "resolveEmployeeAnswer"
  | "resolveEmployeeContext"
  | "resolveOrganizationAdminContext"
  | "resolvePublishedVersion"
  | "resolveSourceVersion"
  | "resolveVersionOrganizationPublicId"
  | "resolveVersionQuestionTypeSummary"
> & {
  effectiveAuthorizationService?: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
  resolveVisibleOrganizationScope?: OrganizationTrainingVisibleOrganizationScopeResolver;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

export type OrganizationTrainingEmployeeContextResolverInput = {
  request: Request;
  pathPublicId: string | null;
};

export type OrganizationTrainingEmployeeContextResolver = (
  input: OrganizationTrainingEmployeeContextResolverInput,
) => Promise<OrganizationTrainingEmployeeContext | null>;

export type OrganizationTrainingEmployeeVisibleVersionsReaderInput = {
  request: Request;
  employeeContext: OrganizationTrainingEmployeeContext;
};

export type OrganizationTrainingEmployeeVisibleVersionsReader = (
  input: OrganizationTrainingEmployeeVisibleVersionsReaderInput,
) => Promise<OrganizationTrainingPublishedVersionDto[]>;

export type OrganizationTrainingPublishedVersionResolverInput = {
  request: Request;
  trainingVersionPublicId: string;
  employeeContext: OrganizationTrainingEmployeeContext;
};

export type OrganizationTrainingPublishedVersionResolver = (
  input: OrganizationTrainingPublishedVersionResolverInput,
) => Promise<OrganizationTrainingPublishedVersionDto | null>;

export type OrganizationTrainingSourceVersionResolverInput = {
  request: Request;
  sourceVersionPublicId: string;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingSourceVersionResolver = (
  input: OrganizationTrainingSourceVersionResolverInput,
) => Promise<OrganizationTrainingPublishedVersionDto | null>;

export type OrganizationTrainingVersionQuestionTypeSummaryResolverInput = {
  request: Request;
  sourceVersionPublicId: string;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingVersionQuestionTypeSummaryResolver = (
  input: OrganizationTrainingVersionQuestionTypeSummaryResolverInput,
) => Promise<OrganizationTrainingQuestionTypeSummary | null>;

export type OrganizationTrainingEmployeeAnswerResolverInput = {
  request: Request;
  trainingVersionPublicId: string;
  employeeContext: OrganizationTrainingEmployeeContext;
};

export type OrganizationTrainingEmployeeAnswerResolver = (
  input: OrganizationTrainingEmployeeAnswerResolverInput,
) => Promise<EmployeeOrganizationTrainingAnswerDto | null>;

type OrganizationTrainingRuntimeAdminRole =
  | "super_admin"
  | "org_advanced_admin";

type OrganizationTrainingRouteService = Pick<
  OrganizationTrainingService,
  "publishVersion" | "takeDownVersion"
> &
  Partial<
    Pick<
      OrganizationTrainingService,
      | "createManualDraft"
      | "copyVersionToNewDraft"
      | "attachSourceContext"
      | "listEmployeeVisibleVersions"
      | "saveEmployeeAnswerDraft"
      | "submitEmployeeAnswer"
      | "getEmployeeAnswerReadonlySummary"
    >
  >;

const invalidPublishInputCode = 400061;
const draftPublicIdMismatchCode = 400062;
const publishAdminContextUnavailableCode = 403063;
const publishLineageUnavailableCode = 403064;
const publishBlockedCode = 409065;
const invalidTakedownInputCode = 400066;
const versionPublicIdMismatchCode = 400067;
const takedownAdminContextUnavailableCode = 403068;
const takedownVersionOrganizationUnavailableCode = 403069;
const takedownBlockedCode = 409070;
const invalidEmployeeAnswerDraftInputCode = 400071;
const invalidEmployeeAnswerSubmitInputCode = 400072;
const employeeAnswerVersionPublicIdMismatchCode = 400073;
const employeeAnswerContextUnavailableCode = 403074;
const employeeAnswerVersionUnavailableCode = 404075;
const employeeAnswerBlockedCode = 409076;
const invalidManualDraftInputCode = 400077;
const manualDraftAdminContextUnavailableCode = 403078;
const manualDraftLineageUnavailableCode = 403079;
const manualDraftBlockedCode = 409080;
const invalidCopyToNewDraftInputCode = 400081;
const copySourceVersionPublicIdMismatchCode = 400082;
const copyAdminContextUnavailableCode = 403083;
const copySourceVersionUnavailableCode = 404084;
const copyQuestionTypeSummaryUnavailableCode = 404085;
const copyLineageUnavailableCode = 403086;
const copyBlockedCode = 409086;
const invalidSourceContextInputCode = 400087;
const sourceContextDraftPublicIdMismatchCode = 400088;
const sourceContextAdminContextUnavailableCode = 403089;
const sourceContextLineageUnavailableCode = 403090;
const sourceContextBlockedCode = 409091;

const draftPublicIdMismatchMessage =
  "Organization training publish path public id must match request body.";

const publishAdminContextUnavailableMessage =
  "Organization training publish organization-admin actor context is unavailable.";

const publishLineageUnavailableMessage =
  "Organization training publish lineage is unavailable.";

const versionPublicIdMismatchMessage =
  "Organization training takedown path public id must match request body.";

const takedownAdminContextUnavailableMessage =
  "Organization training takedown organization-admin actor context is unavailable.";

const takedownVersionOrganizationUnavailableMessage =
  "Organization training takedown version organization is unavailable.";

const employeeAnswerVersionPublicIdMismatchMessage =
  "Organization training employee answer path public id must match request body.";

const copySourceVersionPublicIdMismatchMessage =
  "Organization training copy path public id must match request body.";

const sourceContextDraftPublicIdMismatchMessage =
  "Organization training source context path public id must match request body.";

const employeeAnswerContextUnavailableMessage =
  "Organization training employee context is unavailable.";

const employeeAnswerVersionUnavailableMessage =
  "Organization training employee training version is unavailable.";

const manualDraftAdminContextUnavailableMessage =
  "Organization training manual draft organization-admin actor context is unavailable.";

const manualDraftLineageUnavailableMessage =
  "Organization training manual draft lineage is unavailable.";

const copyAdminContextUnavailableMessage =
  "Organization training copy-to-new-draft organization-admin actor context is unavailable.";

const copySourceVersionUnavailableMessage =
  "Organization training copy-to-new-draft source version is unavailable.";

const copyQuestionTypeSummaryUnavailableMessage =
  "Organization training copy-to-new-draft source question type summary is unavailable.";

const copyLineageUnavailableMessage =
  "Organization training copy-to-new-draft lineage is unavailable.";

const sourceContextAdminContextUnavailableMessage =
  "Organization training source context organization-admin actor context is unavailable.";

const sourceContextLineageUnavailableMessage =
  "Organization training source context lineage is unavailable.";

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function normalizeRequiredText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

async function resolvePathPublicId(
  context: OrganizationTrainingPublishRouteContext,
): Promise<string> {
  const { publicId } = await context.params;

  return publicId;
}

async function defaultResolvePersistenceLineage(): Promise<null> {
  return null;
}

async function defaultResolveOrganizationAdminContext(): Promise<null> {
  return null;
}

async function defaultResolveVersionOrganizationPublicId(): Promise<null> {
  return null;
}

async function defaultResolveEmployeeContext(): Promise<null> {
  return null;
}

async function defaultListEmployeeVisibleVersions(): Promise<
  OrganizationTrainingPublishedVersionDto[]
> {
  return [];
}

async function defaultResolvePublishedVersion(): Promise<null> {
  return null;
}

async function defaultResolveSourceVersion(): Promise<null> {
  return null;
}

async function defaultResolveVersionQuestionTypeSummary(): Promise<null> {
  return null;
}

async function defaultResolveEmployeeAnswer(): Promise<null> {
  return null;
}

async function defaultManualDraftServiceResult() {
  return {
    success: false as const,
    reason: "invalid_manual_draft_input" as const,
    message: organizationTrainingManualDraftCreationBlockedMessage,
  };
}

async function defaultCopyToNewDraftServiceResult() {
  return {
    success: false as const,
    reason: "invalid_copy_to_new_draft_input" as const,
    message: organizationTrainingCopyToNewDraftBlockedMessage,
  };
}

async function defaultSourceContextServiceResult() {
  return {
    success: false as const,
    reason: "invalid_source_context_input" as const,
    message: organizationTrainingSourceContextBlockedMessage,
  };
}

async function defaultEmployeeVisibleVersionsServiceResult() {
  return {
    success: false as const,
    reason: "invalid_employee_context" as const,
    message: organizationTrainingEmployeeAnswerBlockedMessage,
  };
}

async function defaultEmployeeAnswerServiceResult() {
  return {
    success: false as const,
    reason: "invalid_employee_context" as const,
    message: organizationTrainingEmployeeAnswerBlockedMessage,
  };
}

function isOrganizationTrainingRuntimeAdminRole(
  role: string,
): role is OrganizationTrainingRuntimeAdminRole {
  return role === "super_admin" || role === "org_advanced_admin";
}

function normalizeVisibleOrganizationPublicIds(
  visibleOrganizationPublicIds: readonly string[] | null,
): string[] {
  if (visibleOrganizationPublicIds === null) {
    return [];
  }

  return visibleOrganizationPublicIds
    .map((visibleOrganizationPublicId) =>
      normalizeRequiredText(visibleOrganizationPublicId),
    )
    .filter(
      (visibleOrganizationPublicId): visibleOrganizationPublicId is string =>
        visibleOrganizationPublicId !== null,
    );
}

function createSessionBackedOrganizationAdminContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
  resolveVisibleOrganizationScope: OrganizationTrainingVisibleOrganizationScopeResolver,
): OrganizationTrainingAdminContextResolver {
  return async ({
    request,
    pathPublicId,
    manualDraftInput,
    publishInput,
    takedownInput,
    copyToNewDraftInput,
    sourceContextInput,
  }) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (sessionResponse.code !== 0 || sessionResponse.data === null) {
      return null;
    }

    const rawAdminPublicId = sessionResponse.data.user.adminPublicId;
    const adminPublicId =
      typeof rawAdminPublicId === "string"
        ? normalizeRequiredText(rawAdminPublicId)
        : null;
    const hasAdminRole = (sessionResponse.data.user.adminRoles ?? []).some(
      (adminRole) => isOrganizationTrainingRuntimeAdminRole(adminRole),
    );

    if (adminPublicId === null || !hasAdminRole) {
      return null;
    }

    const visibleOrganizationPublicIds = normalizeVisibleOrganizationPublicIds(
      await resolveVisibleOrganizationScope({
        request,
        pathPublicId,
        manualDraftInput,
        publishInput,
        takedownInput,
        copyToNewDraftInput,
        sourceContextInput,
        adminPublicId,
      }),
    );

    return {
      adminPublicId,
      visibleOrganizationPublicIds,
    };
  };
}

function createOrganizationTrainingAdminAuthorizationContext(input: {
  organizationPublicId: string;
  authorizationPublicId: string;
  profession: EffectiveAuthorizationContextDto["profession"];
  level: number;
  capabilityContext: {
    effectiveEdition: "advanced";
    authorizationSource: "org_auth";
    canCreateOrganizationTraining: true;
  };
}): EffectiveAuthorizationContextDto {
  return {
    profession: input.profession,
    level: input.level,
    contextDisplayStatus: "display_only",
    effectiveEdition: input.capabilityContext.effectiveEdition,
    authorizationSource: input.capabilityContext.authorizationSource,
    authorizationPublicId: input.authorizationPublicId,
    ownerType: "organization",
    ownerPublicId: input.organizationPublicId,
    organizationPublicId: input.organizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: input.organizationPublicId,
    capabilities: {
      canGenerateAiQuestion: false,
      canGenerateAiPaper: false,
      canCreateOrganizationTraining:
        input.capabilityContext.canCreateOrganizationTraining,
      canAnswerOrganizationTraining: false,
      canViewOrganizationTrainingSummary: true,
      canManageAuthorizationQuota: false,
    },
    blockedReason: null,
  };
}

function isOrganizationEmployeeAuthContext(
  authorizationContext: EffectiveAuthorizationContextDto,
  organizationPublicId: string,
): boolean {
  return (
    authorizationContext.authorizationSource === "org_auth" &&
    authorizationContext.ownerType === "organization" &&
    authorizationContext.quotaOwnerType === "organization" &&
    authorizationContext.organizationPublicId === organizationPublicId
  );
}

function isAdvancedOrganizationTrainingAnswerContext(
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.effectiveEdition === "advanced" &&
    authorizationContext.capabilities.canAnswerOrganizationTraining === true
  );
}

function canUseEmployeeOrganizationTrainingAnswerContext(
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    isAdvancedOrganizationTrainingAnswerContext(authorizationContext) &&
    authorizationContext.authorizationSource === "org_auth" &&
    authorizationContext.ownerType === "organization" &&
    authorizationContext.organizationPublicId !== null &&
    authorizationContext.quotaOwnerType === "organization"
  );
}

function selectEmployeeOrganizationTrainingAuthorizationContext(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  organizationPublicId: string,
): EffectiveAuthorizationContextDto | null {
  const organizationAuthContexts = authorizationContexts.filter(
    (authorizationContext) =>
      isOrganizationEmployeeAuthContext(
        authorizationContext,
        organizationPublicId,
      ),
  );

  return (
    organizationAuthContexts.find(
      isAdvancedOrganizationTrainingAnswerContext,
    ) ??
    organizationAuthContexts[0] ??
    null
  );
}

function readAuthorizationContexts(
  payload: EffectiveAuthorizationListDto | null,
): EffectiveAuthorizationContextDto[] {
  return payload?.authorizationContexts ?? [];
}

function createSessionBackedOrganizationTrainingEmployeeContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
  effectiveAuthorizationService: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >,
): OrganizationTrainingEmployeeContextResolver {
  return async ({ request }) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (sessionResponse.code !== 0 || sessionResponse.data === null) {
      return null;
    }

    if (sessionResponse.data.user.userType !== "employee") {
      return null;
    }

    const rawEmployeePublicId = sessionResponse.data.user.employeePublicId;
    const rawOrganizationPublicId =
      sessionResponse.data.user.organizationPublicId;
    const employeePublicId =
      typeof rawEmployeePublicId === "string"
        ? normalizeRequiredText(rawEmployeePublicId)
        : null;
    const organizationPublicId =
      typeof rawOrganizationPublicId === "string"
        ? normalizeRequiredText(rawOrganizationPublicId)
        : null;

    if (employeePublicId === null || organizationPublicId === null) {
      return null;
    }

    const authorizationResponse =
      await effectiveAuthorizationService.listEffectiveAuthorizations({
        userPublicId: sessionResponse.data.user.publicId,
      });

    if (authorizationResponse.code !== 0) {
      return null;
    }

    const authorizationContext =
      selectEmployeeOrganizationTrainingAuthorizationContext(
        readAuthorizationContexts(authorizationResponse.data),
        organizationPublicId,
      );

    if (authorizationContext === null) {
      return null;
    }

    return {
      employeePublicId,
      currentOrganizationPublicId: organizationPublicId,
      visibleOrganizationPublicIds: [organizationPublicId],
      authorizationContext,
    };
  };
}

function createDefaultPersistenceLineageResolver(
  lookupTrustedPersistenceLineage:
    | OrganizationTrainingTrustedPersistenceLineageLookup
    | undefined,
): OrganizationTrainingPersistenceLineageResolver {
  if (lookupTrustedPersistenceLineage === undefined) {
    return defaultResolvePersistenceLineage;
  }

  return createOrganizationTrainingPersistenceLineageResolver(
    lookupTrustedPersistenceLineage,
  );
}

function createRuntimeOrganizationTrainingStore(
  repository: Pick<
    OrganizationTrainingStore,
    | "createManualDraft"
    | "publishVersion"
    | "takeDownVersion"
    | "copyVersionToNewDraft"
    | "attachSourceContext"
    | "saveEmployeeAnswerDraft"
    | "submitEmployeeAnswer"
  >,
): OrganizationTrainingStore {
  return {
    createManualDraft: repository.createManualDraft,
    publishVersion: repository.publishVersion,
    takeDownVersion: repository.takeDownVersion,
    copyVersionToNewDraft: repository.copyVersionToNewDraft,
    attachSourceContext: repository.attachSourceContext,
    async saveEmployeeAnswerDraft(answerDraftWrite) {
      return repository.saveEmployeeAnswerDraft(answerDraftWrite);
    },
    async submitEmployeeAnswer(answerSubmissionWrite) {
      return repository.submitEmployeeAnswer(answerSubmissionWrite);
    },
  };
}

function createRepositoryBackedVisibleOrganizationScopeResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "lookupVisibleOrganizationScope"
  >,
): OrganizationTrainingVisibleOrganizationScopeResolver {
  return async ({ adminPublicId }) =>
    repository.lookupVisibleOrganizationScope({ adminPublicId });
}

function createRepositoryBackedVersionOrganizationPublicIdResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "lookupVersionOrganizationPublicId"
  >,
): OrganizationTrainingVersionOrganizationPublicIdResolver {
  return async ({ takedownInput }) =>
    repository.lookupVersionOrganizationPublicId({
      versionPublicId: takedownInput.versionPublicId,
    });
}

function createRepositoryBackedEmployeeVisibleVersionsReader(
  repository: Pick<
    OrganizationTrainingRepository,
    "listEmployeeVisibleVersions"
  >,
): OrganizationTrainingEmployeeVisibleVersionsReader {
  return async ({ employeeContext }) =>
    repository.listEmployeeVisibleVersions({
      employeePublicId: employeeContext.employeePublicId,
      organizationPublicId: employeeContext.currentOrganizationPublicId,
    });
}

function createRepositoryBackedPublishedVersionResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findPublishedVersionByPublicId"
  >,
): OrganizationTrainingPublishedVersionResolver {
  return async ({ trainingVersionPublicId }) =>
    repository.findPublishedVersionByPublicId({
      trainingVersionPublicId,
    });
}

function createRepositoryBackedSourceVersionResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findPublishedVersionByPublicId"
  >,
): OrganizationTrainingSourceVersionResolver {
  return async ({ sourceVersionPublicId }) =>
    repository.findPublishedVersionByPublicId({
      trainingVersionPublicId: sourceVersionPublicId,
    });
}

function createRepositoryBackedVersionQuestionTypeSummaryResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "lookupVersionQuestionTypeSummary"
  >,
): OrganizationTrainingVersionQuestionTypeSummaryResolver {
  return async ({ sourceVersionPublicId }) =>
    repository.lookupVersionQuestionTypeSummary({
      trainingVersionPublicId: sourceVersionPublicId,
    });
}

function createRepositoryBackedEmployeeAnswerResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findEmployeeAnswerByVersion"
  >,
): OrganizationTrainingEmployeeAnswerResolver {
  return async ({ trainingVersionPublicId, employeeContext }) =>
    repository.findEmployeeAnswerByVersion({
      trainingVersionPublicId,
      employeePublicId: employeeContext.employeePublicId,
    });
}

function createInvalidPublishInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidPublishInputCode,
    invalidOrganizationTrainingPublishInputMessage,
  );
}

function createInvalidManualDraftInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidManualDraftInputCode,
    invalidOrganizationTrainingManualDraftInputMessage,
  );
}

function createInvalidTakedownInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidTakedownInputCode,
    invalidOrganizationTrainingTakedownInputMessage,
  );
}

function createInvalidEmployeeAnswerDraftInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidEmployeeAnswerDraftInputCode,
    invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
  );
}

function createInvalidEmployeeAnswerSubmitInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidEmployeeAnswerSubmitInputCode,
    invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
  );
}

function createInvalidCopyToNewDraftInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidCopyToNewDraftInputCode,
    invalidOrganizationTrainingCopyToNewDraftInputMessage,
  );
}

function createInvalidSourceContextInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidSourceContextInputCode,
    invalidOrganizationTrainingSourceContextInputMessage,
  );
}

function createDraftPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftPublicIdMismatchCode,
    draftPublicIdMismatchMessage,
  );
}

function createVersionPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    versionPublicIdMismatchCode,
    versionPublicIdMismatchMessage,
  );
}

function createEmployeeAnswerVersionPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    employeeAnswerVersionPublicIdMismatchCode,
    employeeAnswerVersionPublicIdMismatchMessage,
  );
}

function createCopySourceVersionPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    copySourceVersionPublicIdMismatchCode,
    copySourceVersionPublicIdMismatchMessage,
  );
}

function createSourceContextDraftPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    sourceContextDraftPublicIdMismatchCode,
    sourceContextDraftPublicIdMismatchMessage,
  );
}

function createPublishLineageUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishLineageUnavailableCode,
    publishLineageUnavailableMessage,
  );
}

function createPublishAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishAdminContextUnavailableCode,
    publishAdminContextUnavailableMessage,
  );
}

function createManualDraftAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    manualDraftAdminContextUnavailableCode,
    manualDraftAdminContextUnavailableMessage,
  );
}

function createManualDraftLineageUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    manualDraftLineageUnavailableCode,
    manualDraftLineageUnavailableMessage,
  );
}

function createTakedownAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownAdminContextUnavailableCode,
    takedownAdminContextUnavailableMessage,
  );
}

function createTakedownVersionOrganizationUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownVersionOrganizationUnavailableCode,
    takedownVersionOrganizationUnavailableMessage,
  );
}

function createEmployeeAnswerContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    employeeAnswerContextUnavailableCode,
    employeeAnswerContextUnavailableMessage,
  );
}

function createEmployeeAnswerVersionUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    employeeAnswerVersionUnavailableCode,
    employeeAnswerVersionUnavailableMessage,
  );
}

function createCopyAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    copyAdminContextUnavailableCode,
    copyAdminContextUnavailableMessage,
  );
}

function createCopySourceVersionUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    copySourceVersionUnavailableCode,
    copySourceVersionUnavailableMessage,
  );
}

function createCopyQuestionTypeSummaryUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    copyQuestionTypeSummaryUnavailableCode,
    copyQuestionTypeSummaryUnavailableMessage,
  );
}

function createCopyLineageUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    copyLineageUnavailableCode,
    copyLineageUnavailableMessage,
  );
}

function createSourceContextAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    sourceContextAdminContextUnavailableCode,
    sourceContextAdminContextUnavailableMessage,
  );
}

function createSourceContextLineageUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    sourceContextLineageUnavailableCode,
    sourceContextLineageUnavailableMessage,
  );
}

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
  );
}

function createManualDraftBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    manualDraftBlockedCode,
    organizationTrainingManualDraftCreationBlockedMessage,
  );
}

function createCopyBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    copyBlockedCode,
    organizationTrainingCopyToNewDraftBlockedMessage,
  );
}

function createSourceContextBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    sourceContextBlockedCode,
    organizationTrainingSourceContextBlockedMessage,
  );
}

function createEmployeeAnswerBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    employeeAnswerBlockedCode,
    organizationTrainingEmployeeAnswerBlockedMessage,
  );
}

function createTakedownBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownBlockedCode,
    organizationTrainingTakedownBlockedMessage,
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

function normalizePersistenceLineage(
  persistenceLineage: OrganizationTrainingPersistenceLineage,
): OrganizationTrainingPersistenceLineage | null {
  if (
    !Number.isInteger(persistenceLineage.organizationId) ||
    persistenceLineage.organizationId < 1 ||
    !Number.isInteger(persistenceLineage.orgAuthId) ||
    persistenceLineage.orgAuthId < 1
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

export function createOrganizationTrainingPersistenceLineageResolver(
  lookupTrustedPersistenceLineage: OrganizationTrainingTrustedPersistenceLineageLookup,
): OrganizationTrainingPersistenceLineageResolver {
  return async ({ adminContext, publishInput }) => {
    const organizationPublicId = normalizeRequiredText(
      publishInput.organizationPublicId,
    );
    const authorizationPublicId = normalizeRequiredText(
      publishInput.authorizationPublicId,
    );

    if (organizationPublicId === null || authorizationPublicId === null) {
      return null;
    }

    if (!isOrganizationVisibleToAdmin(organizationPublicId, adminContext)) {
      return null;
    }

    const persistenceLineage = await lookupTrustedPersistenceLineage({
      adminContext,
      organizationPublicId,
      authorizationPublicId,
    });

    return persistenceLineage === null
      ? null
      : normalizePersistenceLineage(persistenceLineage);
  };
}

export function createOrganizationTrainingRouteHandlers(
  organizationTrainingService: OrganizationTrainingRouteService,
  options: OrganizationTrainingRouteOptions = {},
) {
  const createManualDraftService =
    organizationTrainingService.createManualDraft ??
    defaultManualDraftServiceResult;
  const copyVersionToNewDraftService =
    organizationTrainingService.copyVersionToNewDraft ??
    defaultCopyToNewDraftServiceResult;
  const attachSourceContextService =
    organizationTrainingService.attachSourceContext ??
    defaultSourceContextServiceResult;
  const listEmployeeVisibleVersionsService =
    organizationTrainingService.listEmployeeVisibleVersions ??
    defaultEmployeeVisibleVersionsServiceResult;
  const saveEmployeeAnswerDraftService =
    organizationTrainingService.saveEmployeeAnswerDraft ??
    defaultEmployeeAnswerServiceResult;
  const submitEmployeeAnswerService =
    organizationTrainingService.submitEmployeeAnswer ??
    defaultEmployeeAnswerServiceResult;
  const getEmployeeAnswerReadonlySummaryService =
    organizationTrainingService.getEmployeeAnswerReadonlySummary ??
    defaultEmployeeAnswerServiceResult;
  const listEmployeeVisibleVersions =
    options.listEmployeeVisibleVersions ?? defaultListEmployeeVisibleVersions;
  const resolveEmployeeAnswer =
    options.resolveEmployeeAnswer ?? defaultResolveEmployeeAnswer;
  const resolveEmployeeContext =
    options.resolveEmployeeContext ?? defaultResolveEmployeeContext;
  const resolveOrganizationAdminContext =
    options.resolveOrganizationAdminContext ??
    defaultResolveOrganizationAdminContext;
  const lookupTrustedPersistenceLineage =
    options.lookupTrustedPersistenceLineage;
  const resolvePersistenceLineage =
    options.resolvePersistenceLineage ??
    createDefaultPersistenceLineageResolver(
      options.lookupTrustedPersistenceLineage,
    );
  const resolveVersionOrganizationPublicId =
    options.resolveVersionOrganizationPublicId ??
    defaultResolveVersionOrganizationPublicId;
  const resolvePublishedVersion =
    options.resolvePublishedVersion ?? defaultResolvePublishedVersion;
  const resolveSourceVersion =
    options.resolveSourceVersion ?? defaultResolveSourceVersion;
  const resolveVersionQuestionTypeSummary =
    options.resolveVersionQuestionTypeSummary ??
    defaultResolveVersionQuestionTypeSummary;

  return createRouteHandlersWithErrorEnvelope({
    manualDraft: {
      async POST(request: Request): Promise<Response> {
        const input = normalizeOrganizationTrainingManualDraftInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidManualDraftInputResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId: input.value.organizationPublicId,
          manualDraftInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createManualDraftAdminContextUnavailableResponse(),
          );
        }

        const lineage =
          lookupTrustedPersistenceLineage === undefined
            ? null
            : await lookupTrustedPersistenceLineage({
                adminContext,
                organizationPublicId: input.value.organizationPublicId,
                authorizationPublicId: input.value.authorizationPublicId,
              });

        if (lineage === null) {
          return createJsonResponse(
            createManualDraftLineageUnavailableResponse(),
          );
        }

        const result = await createManualDraftService({
          adminContext,
          authorizationContext:
            createOrganizationTrainingAdminAuthorizationContext(input.value),
          draftInput: {
            organizationPublicId: input.value.organizationPublicId,
            profession: input.value.profession,
            level: input.value.level,
            subject: input.value.subject,
            title: input.value.title,
            description: input.value.description,
          },
        });

        if (!result.success) {
          return createJsonResponse(createManualDraftBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            draft: result.draft,
          }),
        );
      },
    },
    employeeVisibleList: {
      async GET(request: Request): Promise<Response> {
        const employeeContext = await resolveEmployeeContext({
          request,
          pathPublicId: null,
        });

        if (employeeContext === null) {
          return createJsonResponse(
            createEmployeeAnswerContextUnavailableResponse(),
          );
        }

        if (
          !canUseEmployeeOrganizationTrainingAnswerContext(
            employeeContext.authorizationContext,
          )
        ) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        const result = await listEmployeeVisibleVersionsService({
          employeeContext,
          sourceVersions: await listEmployeeVisibleVersions({
            request,
            employeeContext,
          }),
        });

        if (!result.success) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            versions: result.versions,
          }),
        );
      },
    },
    publish: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingPublishInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidPublishInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.draftPublicId !== pathPublicId) {
          return createJsonResponse(createDraftPublicIdMismatchResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          publishInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createPublishAdminContextUnavailableResponse(),
          );
        }

        const persistenceLineage = await resolvePersistenceLineage({
          request,
          pathPublicId,
          publishInput: input.value,
          adminContext,
        });

        if (persistenceLineage === null) {
          return createJsonResponse(createPublishLineageUnavailableResponse());
        }

        const result = await organizationTrainingService.publishVersion({
          publishInput: input.value,
          persistenceLineage,
        });

        if (!result.success) {
          return createJsonResponse(createPublishBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            version: result.version,
          }),
        );
      },
    },
    takeDown: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingTakedownInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidTakedownInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.versionPublicId !== pathPublicId) {
          return createJsonResponse(createVersionPublicIdMismatchResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          takedownInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createTakedownAdminContextUnavailableResponse(),
          );
        }

        const versionOrganizationPublicId = normalizeRequiredText(
          await resolveVersionOrganizationPublicId({
            request,
            pathPublicId,
            takedownInput: input.value,
            adminContext,
          }),
        );

        if (versionOrganizationPublicId === null) {
          return createJsonResponse(
            createTakedownVersionOrganizationUnavailableResponse(),
          );
        }

        const result = await organizationTrainingService.takeDownVersion({
          adminContext,
          versionOrganizationPublicId,
          takedownInput: input.value,
        });

        if (!result.success) {
          return createJsonResponse(createTakedownBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            version: result.version,
          }),
        );
      },
    },
    copyToNewDraft: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingCopyToNewDraftRouteInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidCopyToNewDraftInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.sourceVersionPublicId !== pathPublicId) {
          return createJsonResponse(
            createCopySourceVersionPublicIdMismatchResponse(),
          );
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          copyToNewDraftInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createCopyAdminContextUnavailableResponse(),
          );
        }

        const sourceVersion = await resolveSourceVersion({
          request,
          sourceVersionPublicId: input.value.sourceVersionPublicId,
          adminContext,
        });

        if (sourceVersion === null) {
          return createJsonResponse(
            createCopySourceVersionUnavailableResponse(),
          );
        }

        const sourceQuestionTypeSummary =
          await resolveVersionQuestionTypeSummary({
            request,
            sourceVersionPublicId: input.value.sourceVersionPublicId,
            adminContext,
          });

        if (sourceQuestionTypeSummary === null) {
          return createJsonResponse(
            createCopyQuestionTypeSummaryUnavailableResponse(),
          );
        }

        const lineage =
          lookupTrustedPersistenceLineage === undefined
            ? null
            : await lookupTrustedPersistenceLineage({
                adminContext,
                organizationPublicId: sourceVersion.organizationPublicId,
                authorizationPublicId: input.value.authorizationPublicId,
              });

        if (lineage === null) {
          return createJsonResponse(createCopyLineageUnavailableResponse());
        }

        const copyInput: OrganizationTrainingCopyToNewDraftInput = {
          sourceVersionPublicId: input.value.sourceVersionPublicId,
          newDraftTitle: input.value.newDraftTitle,
        };
        const result = await copyVersionToNewDraftService({
          adminContext,
          authorizationPublicId: input.value.authorizationPublicId,
          copyInput,
          sourceVersion,
          sourceQuestionTypeSummary,
        });

        if (!result.success) {
          return createJsonResponse(createCopyBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            draft: result.draft,
          }),
        );
      },
    },
    sourceContextAttach: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingSourceContextInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidSourceContextInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.draftPublicId !== pathPublicId) {
          return createJsonResponse(
            createSourceContextDraftPublicIdMismatchResponse(),
          );
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          sourceContextInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createSourceContextAdminContextUnavailableResponse(),
          );
        }

        const lineage =
          lookupTrustedPersistenceLineage === undefined
            ? null
            : await lookupTrustedPersistenceLineage({
                adminContext,
                organizationPublicId: input.value.organizationPublicId,
                authorizationPublicId: input.value.authorizationPublicId,
              });

        if (lineage === null) {
          return createJsonResponse(
            createSourceContextLineageUnavailableResponse(),
          );
        }

        const result = await attachSourceContextService({
          adminContext,
          authorizationContext:
            createOrganizationTrainingAdminAuthorizationContext(input.value),
          draftPublicId: input.value.draftPublicId,
          organizationPublicId: input.value.organizationPublicId,
          sourceContexts: input.value.sourceContexts,
        });

        if (!result.success) {
          return createJsonResponse(createSourceContextBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            context: result.context,
          }),
        );
      },
    },
    employeeAnswerDraftSave: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingEmployeeAnswerDraftInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(
            createInvalidEmployeeAnswerDraftInputResponse(),
          );
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.trainingVersionPublicId !== pathPublicId) {
          return createJsonResponse(
            createEmployeeAnswerVersionPublicIdMismatchResponse(),
          );
        }

        const employeeContext = await resolveEmployeeContext({
          request,
          pathPublicId,
        });

        if (employeeContext === null) {
          return createJsonResponse(
            createEmployeeAnswerContextUnavailableResponse(),
          );
        }

        if (
          !canUseEmployeeOrganizationTrainingAnswerContext(
            employeeContext.authorizationContext,
          )
        ) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        const version = await resolvePublishedVersion({
          request,
          trainingVersionPublicId: input.value.trainingVersionPublicId,
          employeeContext,
        });

        if (version === null) {
          return createJsonResponse(
            createEmployeeAnswerVersionUnavailableResponse(),
          );
        }

        const result = await saveEmployeeAnswerDraftService({
          employeeContext,
          version,
          answerInput: input.value,
          existingAnswer: await resolveEmployeeAnswer({
            request,
            trainingVersionPublicId: input.value.trainingVersionPublicId,
            employeeContext,
          }),
        });

        if (!result.success) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            answer: result.answer,
          }),
        );
      },
    },
    employeeAnswerSubmit: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingEmployeeAnswerSubmitInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(
            createInvalidEmployeeAnswerSubmitInputResponse(),
          );
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.trainingVersionPublicId !== pathPublicId) {
          return createJsonResponse(
            createEmployeeAnswerVersionPublicIdMismatchResponse(),
          );
        }

        const employeeContext = await resolveEmployeeContext({
          request,
          pathPublicId,
        });

        if (employeeContext === null) {
          return createJsonResponse(
            createEmployeeAnswerContextUnavailableResponse(),
          );
        }

        if (
          !canUseEmployeeOrganizationTrainingAnswerContext(
            employeeContext.authorizationContext,
          )
        ) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        const version = await resolvePublishedVersion({
          request,
          trainingVersionPublicId: input.value.trainingVersionPublicId,
          employeeContext,
        });

        if (version === null) {
          return createJsonResponse(
            createEmployeeAnswerVersionUnavailableResponse(),
          );
        }

        const result = await submitEmployeeAnswerService({
          employeeContext,
          version,
          answerInput: input.value,
          existingAnswer: await resolveEmployeeAnswer({
            request,
            trainingVersionPublicId: input.value.trainingVersionPublicId,
            employeeContext,
          }),
        });

        if (!result.success) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            answer: result.answer,
          }),
        );
      },
    },
    employeeAnswerReadonlySummary: {
      async GET(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const pathPublicId = await resolvePathPublicId(context);
        const employeeContext = await resolveEmployeeContext({
          request,
          pathPublicId,
        });

        if (employeeContext === null) {
          return createJsonResponse(
            createEmployeeAnswerContextUnavailableResponse(),
          );
        }

        if (
          !canUseEmployeeOrganizationTrainingAnswerContext(
            employeeContext.authorizationContext,
          )
        ) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        const version = await resolvePublishedVersion({
          request,
          trainingVersionPublicId: pathPublicId,
          employeeContext,
        });

        if (version === null) {
          return createJsonResponse(
            createEmployeeAnswerVersionUnavailableResponse(),
          );
        }

        const result = await getEmployeeAnswerReadonlySummaryService({
          employeeContext,
          version,
          existingAnswer: await resolveEmployeeAnswer({
            request,
            trainingVersionPublicId: pathPublicId,
            employeeContext,
          }),
        });

        if (!result.success) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            answer: result.answer,
          }),
        );
      },
    },
  });
}

export function createOrganizationTrainingRuntimeRouteHandlers(
  options: OrganizationTrainingRuntimeRouteOptions = {},
) {
  const repository = createPostgresOrganizationTrainingRepository();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const effectiveAuthorizationService =
    options.effectiveAuthorizationService ??
    createEffectiveAuthorizationService(
      createPostgresStudentAuthorizationRedeemRuntimeRepositories()
        .effectiveAuthorizationRepository,
    );
  const resolveVisibleOrganizationScope =
    options.resolveVisibleOrganizationScope ??
    createRepositoryBackedVisibleOrganizationScopeResolver(repository);
  const resolveOrganizationAdminContext =
    options.resolveOrganizationAdminContext ??
    createSessionBackedOrganizationAdminContextResolver(
      sessionService,
      resolveVisibleOrganizationScope,
    );
  const resolveVersionOrganizationPublicId =
    options.resolveVersionOrganizationPublicId ??
    createRepositoryBackedVersionOrganizationPublicIdResolver(repository);
  const resolveEmployeeContext =
    options.resolveEmployeeContext ??
    createSessionBackedOrganizationTrainingEmployeeContextResolver(
      sessionService,
      effectiveAuthorizationService,
    );
  const listEmployeeVisibleVersions =
    options.listEmployeeVisibleVersions ??
    createRepositoryBackedEmployeeVisibleVersionsReader(repository);
  const resolvePublishedVersion =
    options.resolvePublishedVersion ??
    createRepositoryBackedPublishedVersionResolver(repository);
  const resolveSourceVersion =
    options.resolveSourceVersion ??
    createRepositoryBackedSourceVersionResolver(repository);
  const resolveVersionQuestionTypeSummary =
    options.resolveVersionQuestionTypeSummary ??
    createRepositoryBackedVersionQuestionTypeSummaryResolver(repository);
  const resolveEmployeeAnswer =
    options.resolveEmployeeAnswer ??
    createRepositoryBackedEmployeeAnswerResolver(repository);

  return createOrganizationTrainingRouteHandlers(
    createOrganizationTrainingService(
      createRuntimeOrganizationTrainingStore(repository),
    ),
    {
      resolveOrganizationAdminContext,
      resolveVersionOrganizationPublicId,
      resolveEmployeeContext,
      listEmployeeVisibleVersions,
      resolvePublishedVersion,
      resolveSourceVersion,
      resolveVersionQuestionTypeSummary,
      resolveEmployeeAnswer,
      lookupTrustedPersistenceLineage:
        repository.lookupTrustedPersistenceLineage,
    },
  );
}
