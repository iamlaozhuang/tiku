import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type {
  OrganizationTrainingPublishInput,
  OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import {
  invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
  invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
  invalidOrganizationTrainingPublishInputMessage,
  invalidOrganizationTrainingTakedownInputMessage,
  normalizeOrganizationTrainingEmployeeAnswerDraftInput,
  normalizeOrganizationTrainingEmployeeAnswerSubmitInput,
  normalizeOrganizationTrainingPublishInput,
  normalizeOrganizationTrainingTakedownInput,
} from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  organizationTrainingEmployeeAnswerBlockedMessage,
  organizationTrainingPublishBlockedMessage,
  organizationTrainingTakedownBlockedMessage,
  type OrganizationTrainingAdminContext,
  type OrganizationTrainingEmployeeContext,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingService,
  type OrganizationTrainingStore,
} from "./organization-training-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
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
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
};

export type OrganizationTrainingAdminContextResolver = (
  input: OrganizationTrainingAdminContextResolverInput,
) => Promise<OrganizationTrainingAdminContext | null>;

export type OrganizationTrainingVisibleOrganizationScopeResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
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
  resolveVersionOrganizationPublicId?: OrganizationTrainingVersionOrganizationPublicIdResolver;
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
  | "resolveVersionOrganizationPublicId"
> & {
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
  | "ops_admin"
  | "content_admin";

type OrganizationTrainingRouteService = Pick<
  OrganizationTrainingService,
  "publishVersion" | "takeDownVersion"
> &
  Partial<
    Pick<
      OrganizationTrainingService,
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

const employeeAnswerContextUnavailableMessage =
  "Organization training employee context is unavailable.";

const employeeAnswerVersionUnavailableMessage =
  "Organization training employee training version is unavailable.";

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

async function defaultResolveEmployeeAnswer(): Promise<null> {
  return null;
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
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
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
  return async ({ request, pathPublicId, publishInput, takedownInput }) => {
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
        publishInput,
        takedownInput,
        adminPublicId,
      }),
    );

    return {
      adminPublicId,
      visibleOrganizationPublicIds,
    };
  };
}

function createEmployeeAnswerAuthorizationContext(
  organizationPublicId: string,
): EffectiveAuthorizationContextDto {
  return {
    profession: "logistics",
    level: 4,
    contextDisplayStatus: "display_only",
    effectiveEdition: "advanced",
    authorizationSource: "org_auth",
    authorizationPublicId: "organization_training_employee_answer_runtime",
    ownerType: "organization",
    ownerPublicId: organizationPublicId,
    organizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: organizationPublicId,
    capabilities: {
      canGenerateAiQuestion: false,
      canGenerateAiPaper: false,
      canCreateOrganizationTraining: false,
      canAnswerOrganizationTraining: true,
      canViewOrganizationTrainingSummary: false,
      canManageAuthorizationQuota: false,
    },
    blockedReason: null,
  };
}

function createSessionBackedOrganizationTrainingEmployeeContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
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

    return {
      employeePublicId,
      currentOrganizationPublicId: organizationPublicId,
      visibleOrganizationPublicIds: [organizationPublicId],
      authorizationContext:
        createEmployeeAnswerAuthorizationContext(organizationPublicId),
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
    | "publishVersion"
    | "takeDownVersion"
    | "saveEmployeeAnswerDraft"
    | "submitEmployeeAnswer"
  >,
): OrganizationTrainingStore {
  return {
    async createManualDraft() {
      throw new Error("Organization training draft route is not configured.");
    },
    publishVersion: repository.publishVersion,
    takeDownVersion: repository.takeDownVersion,
    async copyVersionToNewDraft() {
      throw new Error("Organization training copy route is not configured.");
    },
    async attachSourceContext() {
      throw new Error(
        "Organization training source context route is not configured.",
      );
    },
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

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
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

  return createRouteHandlersWithErrorEnvelope({
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
    );
  const listEmployeeVisibleVersions =
    options.listEmployeeVisibleVersions ??
    createRepositoryBackedEmployeeVisibleVersionsReader(repository);
  const resolvePublishedVersion =
    options.resolvePublishedVersion ??
    createRepositoryBackedPublishedVersionResolver(repository);
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
      resolveEmployeeAnswer,
      lookupTrustedPersistenceLineage:
        repository.lookupTrustedPersistenceLineage,
    },
  );
}
