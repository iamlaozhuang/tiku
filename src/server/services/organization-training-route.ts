import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import { createAdminAiAuditLogListQuery } from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationListDto,
} from "../contracts/effective-authorization-contract";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminPublishedVersionDetailDto,
  OrganizationTrainingAdminLifecycleSourceMetadataDto,
  OrganizationTrainingAdminLifecyclePageResult,
  OrganizationTrainingAdminQuestionDetailDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingVersionListReadResult,
} from "../contracts/organization-training-contract";
import type { AdminAiGenerationResultPersistenceRepository } from "../contracts/admin-ai-generation-result-persistence-contract";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type {
  OrganizationTrainingCopyToNewDraftInput,
  OrganizationTrainingPublishInput,
  OrganizationTrainingPublishQuestionInput,
  OrganizationTrainingQuestionTypeSummary,
  OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import { createPostgresAdminAiGenerationResultPersistenceRepository } from "../repositories/admin-ai-generation-result-persistence-db-adapter";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "../repositories/student-authorization-redeem-runtime-repository";
import {
  invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
  invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
  invalidOrganizationTrainingCopyToNewDraftInputMessage,
  invalidOrganizationTrainingDraftSaveInputMessage,
  invalidOrganizationTrainingManualDraftInputMessage,
  invalidOrganizationTrainingPublishInputMessage,
  invalidOrganizationTrainingSourceContextInputMessage,
  invalidOrganizationTrainingTakedownInputMessage,
  normalizeOrganizationTrainingCopyToNewDraftRouteInput,
  normalizeOrganizationTrainingDraftSaveInput,
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
  buildOrganizationTrainingAdminDetailReadModel,
  buildOrganizationTrainingAdminLifecyclePageReadModel,
  createOrganizationTrainingService,
  organizationTrainingDraftSaveBlockedMessage,
  organizationTrainingEmployeeAnswerBlockedMessage,
  organizationTrainingCopyToNewDraftBlockedMessage,
  organizationTrainingManualDraftCreationBlockedMessage,
  organizationTrainingPublishBlockedMessage,
  organizationTrainingSourceContextBlockedMessage,
  organizationTrainingTakedownBlockedMessage,
  organizationTrainingAdminLifecycleContentKindFilterValues,
  organizationTrainingAdminLifecycleSourceKindFilterValues,
  organizationTrainingAdminLifecycleStatusFilterValues,
  type OrganizationTrainingAdminContext,
  type OrganizationTrainingAdminLifecycleContentKindFilter,
  type OrganizationTrainingAdminLifecycleQuery,
  type OrganizationTrainingAdminLifecycleSourceKindFilter,
  type OrganizationTrainingAdminLifecycleStatusFilter,
  type OrganizationTrainingEmployeeContext,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingScoringProvenance,
  type OrganizationTrainingService,
  type OrganizationTrainingStore,
} from "./organization-training-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  createEffectiveAuthorizationService,
  type EffectiveAuthorizationService,
} from "./effective-authorization-service";
import type { SessionService } from "./session-service";
import { selectAuthorizationObjectScope } from "./authorization-object-scope";

export type OrganizationTrainingPublishRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type OrganizationTrainingPersistenceLineageResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
  draft: OrganizationTrainingDraftDto;
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
  readAdminLifecyclePage?: OrganizationTrainingAdminLifecyclePageReader;
  listAdminLifecycleDrafts?: OrganizationTrainingAdminLifecycleDraftsReader;
  listAdminLifecycleSourceMetadata?: OrganizationTrainingAdminLifecycleSourceMetadataReader;
  listEmployeeVisibleVersions?: OrganizationTrainingEmployeeVisibleVersionsReader;
  lookupTrustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineageLookup;
  resolveEmployeeAnswer?: OrganizationTrainingEmployeeAnswerResolver;
  resolveEmployeeContext?: OrganizationTrainingEmployeeContextResolver;
  resolveOrganizationAdminContext?: OrganizationTrainingAdminContextResolver;
  resolvePersistenceLineage?: OrganizationTrainingPersistenceLineageResolver;
  resolvePublishedVersion?: OrganizationTrainingPublishedVersionResolver;
  resolveCanonicalQuestions?: OrganizationTrainingCanonicalQuestionsResolver;
  resolveScoringProvenance?: OrganizationTrainingScoringProvenanceResolver;
  resolveSourceVersion?: OrganizationTrainingSourceVersionResolver;
  resolveVersionOrganizationPublicId?: OrganizationTrainingVersionOrganizationPublicIdResolver;
  resolveVersionQuestionTypeSummary?: OrganizationTrainingVersionQuestionTypeSummaryResolver;
  resolveAdminDetailVersion?: OrganizationTrainingAdminDetailVersionResolver;
  resolveAdminDraftDetailQuestions?: OrganizationTrainingAdminDraftDetailQuestionsResolver;
  resolveOrganizationAuthorizationContext?: OrganizationTrainingAuthorizationContextResolver;
};

export type OrganizationTrainingAuthorizationContextResolverInput = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationPublicId: string;
  organizationPublicId: string;
  profession: EffectiveAuthorizationContextDto["profession"];
  level: number;
};

export type OrganizationTrainingAuthorizationContextResolver = (
  input: OrganizationTrainingAuthorizationContextResolverInput,
) => Promise<EffectiveAuthorizationContextDto | null>;

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
  | "listAdminLifecycleDrafts"
  | "listAdminLifecycleSourceMetadata"
  | "readAdminLifecyclePage"
  | "resolveAdminDetailVersion"
  | "resolveAdminDraftDetailQuestions"
  | "listEmployeeVisibleVersions"
  | "resolveEmployeeAnswer"
  | "resolveEmployeeContext"
  | "resolveOrganizationAdminContext"
  | "resolvePublishedVersion"
  | "resolveCanonicalQuestions"
  | "resolveScoringProvenance"
  | "resolveSourceVersion"
  | "resolveVersionOrganizationPublicId"
  | "resolveVersionQuestionTypeSummary"
> & {
  adminAiGenerationResultRepository?: Pick<
    AdminAiGenerationResultPersistenceRepository,
    "findDraftResultByTaskPublicId"
  >;
  scoringCatalogRepository?: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "listModelConfigs" | "listPromptTemplates"
  >;
  effectiveAuthorizationService?: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
  resolveVisibleOrganizationScope?: OrganizationTrainingVisibleOrganizationScopeResolver;
  resolveOrganizationAuthorizationContext?: OrganizationTrainingAuthorizationContextResolver;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

export type OrganizationTrainingEmployeeContextResolverInput = {
  request: Request;
  pathPublicId: string | null;
};

export type OrganizationTrainingAdminLifecycleReaderInput = {
  request: Request;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingAdminLifecyclePageReaderInput =
  OrganizationTrainingAdminLifecycleReaderInput & {
    query: OrganizationTrainingAdminLifecycleQuery;
  };

export type OrganizationTrainingAdminLifecyclePageReader = (
  input: OrganizationTrainingAdminLifecyclePageReaderInput,
) => Promise<OrganizationTrainingAdminLifecyclePageResult>;

export type OrganizationTrainingAdminLifecycleSourceMetadataReaderInput = {
  request: Request;
  adminContext: OrganizationTrainingAdminContext;
  draftPublicIds: readonly string[];
};

export type OrganizationTrainingAdminLifecycleDraftsReader = (
  input: OrganizationTrainingAdminLifecycleReaderInput,
) => Promise<OrganizationTrainingDraftDto[]>;

export type OrganizationTrainingAdminLifecycleSourceMetadataReader = (
  input: OrganizationTrainingAdminLifecycleSourceMetadataReaderInput,
) => Promise<OrganizationTrainingAdminLifecycleSourceMetadataDto[]>;

export type OrganizationTrainingEmployeeContextResolver = (
  input: OrganizationTrainingEmployeeContextResolverInput,
) => Promise<OrganizationTrainingEmployeeContext | null>;

export type OrganizationTrainingEmployeeVisibleVersionsReaderInput = {
  request: Request;
  employeeContext: OrganizationTrainingEmployeeContext;
};

export type OrganizationTrainingEmployeeVisibleVersionsReader = (
  input: OrganizationTrainingEmployeeVisibleVersionsReaderInput,
) => Promise<
  | OrganizationTrainingPublishedVersionDto[]
  | OrganizationTrainingVersionListReadResult
>;

export type OrganizationTrainingPublishedVersionResolverInput = {
  request: Request;
  trainingVersionPublicId: string;
  employeeContext: OrganizationTrainingEmployeeContext;
};

export type OrganizationTrainingPublishedVersionResolver = (
  input: OrganizationTrainingPublishedVersionResolverInput,
) => Promise<OrganizationTrainingPublishedVersionDto | null>;

export type OrganizationTrainingCanonicalQuestionsResolver = (input: {
  request: Request;
  trainingVersionPublicId: string;
  employeeContext: OrganizationTrainingEmployeeContext;
}) => Promise<OrganizationTrainingPublishQuestionInput[]>;

export type OrganizationTrainingScoringProvenanceResolver = (input: {
  request: Request;
  trainingVersionPublicId: string;
  employeeContext: OrganizationTrainingEmployeeContext;
}) => Promise<OrganizationTrainingScoringProvenance | null>;

export type OrganizationTrainingAdminDetailVersionResolverInput = {
  request: Request;
  trainingVersionPublicId: string;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingAdminDetailVersionResolver = (
  input: OrganizationTrainingAdminDetailVersionResolverInput,
) => Promise<OrganizationTrainingAdminPublishedVersionDetailDto | null>;

export type OrganizationTrainingAdminDraftDetailQuestionsResolverInput = {
  request: Request;
  draft: OrganizationTrainingDraftDto;
  sourceMetadata: OrganizationTrainingAdminLifecycleSourceMetadataDto | null;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingAdminDraftDetailSnapshotDto = {
  questions: OrganizationTrainingAdminQuestionDetailDto[];
  paperSections?: OrganizationTrainingAdminPaperSectionDetailDto[];
};

export type OrganizationTrainingAdminDraftDetailQuestionsResolver = (
  input: OrganizationTrainingAdminDraftDetailQuestionsResolverInput,
) => Promise<
  | OrganizationTrainingAdminQuestionDetailDto[]
  | OrganizationTrainingAdminDraftDetailSnapshotDto
>;

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
      | "saveDraft"
      | "copyVersionToNewDraft"
      | "attachSourceContext"
      | "listEmployeeVisibleVersions"
      | "saveEmployeeAnswerDraft"
      | "submitEmployeeAnswer"
      | "getEmployeeAnswerDraft"
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
const adminDetailAdminContextUnavailableCode = 403092;
const adminDetailUnavailableCode = 404093;
const invalidDraftSaveInputCode = 400094;
const draftSavePublicIdMismatchCode = 400095;
const draftSaveAdminContextUnavailableCode = 403096;
const draftSaveAuthorizationUnavailableCode = 403097;
const draftSaveBlockedCode = 409098;

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

const adminDetailAdminContextUnavailableMessage =
  "Organization training detail organization-admin actor context is unavailable.";

const adminDetailUnavailableMessage =
  "Organization training detail is unavailable.";

const draftSavePublicIdMismatchMessage =
  "Organization training draft-save path public id must match request body.";

const draftSaveAdminContextUnavailableMessage =
  "Organization training draft-save organization-admin actor context is unavailable.";

const draftSaveAuthorizationUnavailableMessage =
  "Organization training draft-save authorization context is unavailable.";

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

function createNoStoreJsonResponse<TData>(
  response: ApiResponse<TData>,
): Response {
  return Response.json(response, {
    headers: { "cache-control": "no-store" },
  });
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

function normalizeVersionListReadResult(
  value:
    | OrganizationTrainingPublishedVersionDto[]
    | OrganizationTrainingVersionListReadResult,
): OrganizationTrainingVersionListReadResult {
  return Array.isArray(value)
    ? {
        versions: value,
        integrityStatus: "complete",
        warningCode: null,
      }
    : value;
}

async function defaultResolveEmployeeContext(): Promise<null> {
  return null;
}

async function defaultListAdminLifecycleDrafts(): Promise<
  OrganizationTrainingDraftDto[]
> {
  return [];
}

async function defaultListAdminLifecycleSourceMetadata(): Promise<
  OrganizationTrainingAdminLifecycleSourceMetadataDto[]
> {
  return [];
}

async function defaultReadAdminLifecyclePage(): Promise<never> {
  throw new Error(
    "Organization training admin lifecycle page reader is unavailable.",
  );
}

async function defaultListEmployeeVisibleVersions(): Promise<
  OrganizationTrainingPublishedVersionDto[]
> {
  return [];
}

async function defaultResolvePublishedVersion(): Promise<null> {
  return null;
}

async function defaultResolveCanonicalQuestions(): Promise<
  OrganizationTrainingPublishQuestionInput[]
> {
  return [];
}

async function defaultResolveScoringProvenance(): Promise<null> {
  return null;
}

async function defaultResolveAdminDetailVersion(): Promise<null> {
  return null;
}

async function defaultResolveAdminDraftDetailQuestions(): Promise<OrganizationTrainingAdminDraftDetailSnapshotDto> {
  return { questions: [] };
}

async function defaultResolveSourceVersion(): Promise<null> {
  return null;
}

function normalizePositiveIntegerQueryParam(
  value: string | null,
  fallback: number,
): number {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function normalizeAdminLifecycleStatusFilter(
  value: string | null,
): OrganizationTrainingAdminLifecycleStatusFilter {
  return organizationTrainingAdminLifecycleStatusFilterValues.includes(
    value as OrganizationTrainingAdminLifecycleStatusFilter,
  )
    ? (value as OrganizationTrainingAdminLifecycleStatusFilter)
    : "all";
}

function normalizeAdminLifecycleSourceKindFilter(
  value: string | null,
): OrganizationTrainingAdminLifecycleSourceKindFilter {
  return organizationTrainingAdminLifecycleSourceKindFilterValues.includes(
    value as OrganizationTrainingAdminLifecycleSourceKindFilter,
  )
    ? (value as OrganizationTrainingAdminLifecycleSourceKindFilter)
    : "all";
}

function normalizeAdminLifecycleContentKindFilter(
  value: string | null,
): OrganizationTrainingAdminLifecycleContentKindFilter {
  return organizationTrainingAdminLifecycleContentKindFilterValues.includes(
    value as OrganizationTrainingAdminLifecycleContentKindFilter,
  )
    ? (value as OrganizationTrainingAdminLifecycleContentKindFilter)
    : "all";
}

function normalizeAdminLifecycleQuery(
  request: Request,
): OrganizationTrainingAdminLifecycleQuery {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: normalizePositiveIntegerQueryParam(searchParams.get("page"), 1),
    pageSize: (() => {
      const pageSize = normalizePositiveIntegerQueryParam(
        searchParams.get("pageSize"),
        20,
      );

      return pageSize === 50 || pageSize === 100 ? pageSize : 20;
    })(),
    status: normalizeAdminLifecycleStatusFilter(searchParams.get("status")),
    sourceKind: normalizeAdminLifecycleSourceKindFilter(
      searchParams.get("sourceKind"),
    ),
    contentKind: normalizeAdminLifecycleContentKindFilter(
      searchParams.get("contentKind"),
    ),
  };
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

async function defaultDraftSaveServiceResult() {
  return {
    success: false as const,
    reason: "invalid_draft_input" as const,
    message: organizationTrainingDraftSaveBlockedMessage,
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

function canUseServiceComputedOrganizationTrainingCapability(
  capabilitySummary: AdminWorkspaceCapabilitySummary | undefined,
): capabilitySummary is AdminWorkspaceCapabilitySummary & {
  organizationAuthorizationPublicId: string;
  organizationPublicId: string;
  organizationEffectiveEdition: "advanced";
  organizationAuthorizationSource: "org_auth";
  capabilitySource: "service_computed";
  canUseOrganizationAdvancedWorkspace: true;
} {
  return (
    capabilitySummary !== undefined &&
    capabilitySummary.capabilitySource === "service_computed" &&
    capabilitySummary.organizationAuthorizationSource === "org_auth" &&
    typeof capabilitySummary.organizationAuthorizationPublicId === "string" &&
    capabilitySummary.organizationAuthorizationPublicId.trim().length > 0 &&
    capabilitySummary.organizationPublicId !== null &&
    capabilitySummary.organizationEffectiveEdition === "advanced" &&
    capabilitySummary.canUseOrganizationAdvancedWorkspace === true
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
    const adminWorkspaceCapability =
      sessionResponse.data.user.adminWorkspaceCapability;

    if (
      adminPublicId === null ||
      !hasAdminRole ||
      !canUseServiceComputedOrganizationTrainingCapability(
        adminWorkspaceCapability,
      )
    ) {
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
      authorizationPublicId:
        adminWorkspaceCapability.organizationAuthorizationPublicId.trim(),
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

async function resolveOrganizationTrainingAdminAuthorizationContext(input: {
  adminContext: OrganizationTrainingAdminContext;
  authorizationPublicId: string;
  organizationPublicId: string;
  profession: EffectiveAuthorizationContextDto["profession"];
  level: number;
  capabilityContext: {
    effectiveEdition: "advanced";
    authorizationSource: "org_auth";
    canCreateOrganizationTraining: true;
  };
  resolveAuthorizationContext:
    | OrganizationTrainingAuthorizationContextResolver
    | undefined;
}): Promise<EffectiveAuthorizationContextDto | null> {
  if (input.adminContext.authorizationPublicId === undefined) {
    return createOrganizationTrainingAdminAuthorizationContext(input);
  }

  if (
    input.adminContext.authorizationPublicId !== input.authorizationPublicId ||
    input.resolveAuthorizationContext === undefined
  ) {
    return null;
  }

  return input.resolveAuthorizationContext({
    adminContext: input.adminContext,
    authorizationPublicId: input.authorizationPublicId,
    organizationPublicId: input.organizationPublicId,
    profession: input.profession,
    level: input.level,
  });
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

function listEmployeeOrganizationTrainingAuthorizationContexts(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  organizationPublicId: string,
): EffectiveAuthorizationContextDto[] {
  return authorizationContexts.filter((authorizationContext) =>
    isOrganizationEmployeeAuthContext(
      authorizationContext,
      organizationPublicId,
    ),
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

    const authorizationContexts =
      listEmployeeOrganizationTrainingAuthorizationContexts(
        readAuthorizationContexts(authorizationResponse.data),
        organizationPublicId,
      );
    const advancedAuthorizationContexts = authorizationContexts.filter(
      isAdvancedOrganizationTrainingAnswerContext,
    );
    const authorizationContext =
      advancedAuthorizationContexts[0] ?? authorizationContexts[0] ?? null;

    if (authorizationContext === null) {
      return null;
    }

    return {
      employeePublicId,
      currentOrganizationPublicId: organizationPublicId,
      visibleOrganizationPublicIds: [organizationPublicId],
      authorizationContext,
      authorizationContexts: advancedAuthorizationContexts,
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
    | "saveDraft"
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
    saveDraft: repository.saveDraft,
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

function createRepositoryBackedOrganizationAuthorizationContextResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findOrganizationAuthorizationContext"
  >,
): OrganizationTrainingAuthorizationContextResolver {
  return async (input) => {
    const authorizationContext =
      await repository.findOrganizationAuthorizationContext({
        authorizationPublicId: input.authorizationPublicId,
        organizationPublicId: input.organizationPublicId,
        now: new Date(),
      });

    if (authorizationContext === null) {
      return null;
    }

    return selectAuthorizationObjectScope([authorizationContext], {
      authorizationPublicId: input.authorizationPublicId,
      authorizationSource: "org_auth",
      ownerType: "organization",
      ownerPublicId: input.organizationPublicId,
      organizationPublicId: input.organizationPublicId,
      profession: input.profession,
      level: input.level,
      requiredCapability: "canCreateOrganizationTraining",
      allowedBlockedReasons: [],
    });
  };
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
  > &
    Partial<
      Pick<OrganizationTrainingRepository, "readEmployeeVisibleVersions">
    >,
): OrganizationTrainingEmployeeVisibleVersionsReader {
  return async ({ employeeContext }) => {
    const input = {
      employeePublicId: employeeContext.employeePublicId,
      organizationPublicId: employeeContext.currentOrganizationPublicId,
      visibleOrganizationPublicIds:
        employeeContext.visibleOrganizationPublicIds,
    };

    return repository.readEmployeeVisibleVersions === undefined
      ? repository.listEmployeeVisibleVersions(input)
      : repository.readEmployeeVisibleVersions(input);
  };
}

function createRepositoryBackedAdminLifecycleDraftsReader(
  repository: Pick<OrganizationTrainingRepository, "listAdminLifecycleDrafts">,
): OrganizationTrainingAdminLifecycleDraftsReader {
  return async ({ adminContext }) =>
    repository.listAdminLifecycleDrafts({
      visibleOrganizationPublicIds: adminContext.visibleOrganizationPublicIds,
    });
}

function createRepositoryBackedAdminLifecyclePageReader(
  repository: Pick<OrganizationTrainingRepository, "readAdminLifecyclePage">,
): OrganizationTrainingAdminLifecyclePageReader {
  return async ({ adminContext, query }) =>
    repository.readAdminLifecyclePage({
      visibleOrganizationPublicIds: adminContext.visibleOrganizationPublicIds,
      ...query,
    });
}

function createRepositoryBackedAdminLifecycleSourceMetadataReader(
  repository: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleSourceMetadata"
  >,
): OrganizationTrainingAdminLifecycleSourceMetadataReader {
  return async ({ draftPublicIds }) =>
    repository.listAdminLifecycleSourceMetadata({
      draftPublicIds,
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

function createRepositoryBackedAdminDetailVersionResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findAdminPublishedVersionDetailByPublicId"
  >,
): OrganizationTrainingAdminDetailVersionResolver {
  return async ({ trainingVersionPublicId }) =>
    repository.findAdminPublishedVersionDetailByPublicId({
      trainingVersionPublicId,
    });
}

function normalizeAdminDraftDetailSnapshot(
  value:
    | OrganizationTrainingAdminQuestionDetailDto[]
    | OrganizationTrainingAdminDraftDetailSnapshotDto,
): OrganizationTrainingAdminDraftDetailSnapshotDto {
  return Array.isArray(value) ? { questions: value } : value;
}

function createTrustedDraftQuestions(
  snapshot: OrganizationTrainingAdminDraftDetailSnapshotDto,
): OrganizationTrainingPublishQuestionInput[] {
  const createQuestion = (
    question: OrganizationTrainingAdminQuestionDetailDto,
    paperSection:
      | {
          key: string;
          title: string;
          sortOrder: number;
          questionSortOrder: number;
        }
      | undefined,
    sequenceNumber: number,
  ): OrganizationTrainingPublishQuestionInput | null => {
    const standardAnswer = question.answerAndAnalysis.standardAnswer;
    const analysisSummary = question.answerAndAnalysis.analysis;

    if (standardAnswer === null || analysisSummary === null) {
      return null;
    }

    return {
      publicId: question.publicId,
      sequenceNumber,
      questionType: question.questionType,
      ...(paperSection === undefined
        ? {}
        : {
            paperSectionKey: paperSection.key,
            paperSectionTitle: paperSection.title,
            paperSectionSortOrder: paperSection.sortOrder,
            questionSortOrder: paperSection.questionSortOrder,
          }),
      materialTitle: question.materialTitle,
      materialContent: question.materialContent,
      stem: question.stem,
      options: question.options.map((option) => ({ ...option })),
      score: question.score,
      standardAnswer,
      analysisSummary,
      evidenceStatus: question.evidenceSummary.evidenceStatus,
      citationCount: question.evidenceSummary.citationCount,
    };
  };
  const structuredQuestions = snapshot.paperSections?.flatMap(
    (paperSection, paperSectionIndex) =>
      paperSection.questions.map((question, questionIndex) => ({
        question,
        paperSection: {
          key: paperSection.sectionKey,
          title: paperSection.title,
          sortOrder: paperSectionIndex + 1,
          questionSortOrder: questionIndex + 1,
        },
      })),
  );
  const questionSources =
    structuredQuestions !== undefined && structuredQuestions.length > 0
      ? structuredQuestions
      : snapshot.questions.map((question) => ({
          question,
          paperSection: undefined,
        }));

  return questionSources.flatMap((source, index) => {
    const question = createQuestion(
      source.question,
      source.paperSection,
      index + 1,
    );
    return question === null ? [] : [question];
  });
}

function createRepositoryBackedAdminDraftDetailQuestionsResolver(
  repository: Pick<
    AdminAiGenerationResultPersistenceRepository,
    "findDraftResultByTaskPublicId"
  >,
): OrganizationTrainingAdminDraftDetailQuestionsResolver {
  return async ({ draft, sourceMetadata }) => {
    if ((draft.questions ?? []).length > 0) {
      return {
        questions: (draft.questions ?? []).map((question) => ({
          publicId: question.publicId,
          sequenceNumber: question.sequenceNumber,
          questionType: question.questionType,
          materialTitle: question.materialTitle,
          materialContent: question.materialContent,
          stem: question.stem,
          options: question.options.map((option) => ({ ...option })),
          score: question.score,
          evidenceSummary: {
            evidenceStatus: question.evidenceStatus,
            citationCount: question.citationCount,
          },
          answerAndAnalysis: {
            visibility: "collapsed_by_default" as const,
            standardAnswer: question.standardAnswer,
            analysis: question.analysisSummary,
          },
        })),
      };
    }

    if (
      draft.sourceTaskPublicId === null ||
      sourceMetadata?.sourceType !== "organization_ai_result"
    ) {
      return { questions: [] };
    }

    const result = await repository.findDraftResultByTaskPublicId({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: draft.organizationPublicId,
      taskPublicId: draft.sourceTaskPublicId,
    });

    if (sourceMetadata.generationKind === "question") {
      return {
        questions:
          result?.contentReference.organizationTrainingDraft?.questions ?? [],
      };
    }

    if (sourceMetadata.generationKind === "paper") {
      const paperDraft =
        result?.contentReference.organizationTrainingPaperDraft ?? null;

      return {
        questions: paperDraft?.questions ?? [],
        paperSections: paperDraft?.paperSections,
      };
    }

    return { questions: [] };
  };
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

function createRepositoryBackedCanonicalQuestionsResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "findCanonicalQuestionsByVersion"
  >,
): OrganizationTrainingCanonicalQuestionsResolver {
  return async ({ trainingVersionPublicId }) =>
    repository.findCanonicalQuestionsByVersion({
      trainingVersionPublicId,
    });
}

function createCatalogBackedScoringProvenanceResolver(
  repository: Pick<
    AdminAiAuditLogRuntimeRepositories,
    "listModelConfigs" | "listPromptTemplates"
  >,
): OrganizationTrainingScoringProvenanceResolver {
  return async () => {
    if (repository.listPromptTemplates === undefined) {
      return null;
    }

    const query = createAdminAiAuditLogListQuery({
      aiFuncType: "ai_scoring",
      pageSize: 50,
    });
    const [modelConfigPage, promptTemplatePage] = await Promise.all([
      repository.listModelConfigs(query),
      repository.listPromptTemplates(query),
    ]);
    const modelConfig = modelConfigPage.modelConfigs
      .filter(
        (candidate) =>
          candidate.aiFuncType === "ai_scoring" &&
          candidate.isEnabled &&
          candidate.status === "enabled" &&
          candidate.secretStatus === "configured",
      )
      .sort((left, right) => left.fallbackPriority - right.fallbackPriority)[0];
    const promptTemplate = promptTemplatePage.promptTemplates
      .filter(
        (candidate) =>
          candidate.aiFuncType === "ai_scoring" &&
          candidate.isActive &&
          candidate.status === "active",
      )
      .sort((left, right) => right.version - left.version)[0];

    if (modelConfig === undefined || promptTemplate === undefined) {
      return null;
    }

    return {
      modelConfigSnapshot: {
        providerPublicId: modelConfig.providerPublicId,
        providerKey: modelConfig.providerKey,
        providerDisplayName: modelConfig.providerDisplayName,
        modelConfigPublicId: modelConfig.publicId,
        aiFuncType: "scoring",
        modelName: modelConfig.modelName,
        displayName: modelConfig.displayName,
        configVersion: modelConfig.configVersion,
        pricingVersion: modelConfig.pricingVersion,
        inputTokenPriceCnyPerMillion: modelConfig.inputTokenPriceCnyPerMillion,
        outputTokenPriceCnyPerMillion:
          modelConfig.outputTokenPriceCnyPerMillion,
        timeoutSecond: modelConfig.timeoutSecond,
        maxRetryCount: modelConfig.maxRetryCount,
        fallbackModelConfigPublicId: modelConfig.fallbackModelConfigPublicId,
        promptTemplateKey: promptTemplate.promptTemplateKey,
        promptTemplateVersion: promptTemplate.version,
      },
      promptTemplateKey: promptTemplate.promptTemplateKey,
      promptTemplateVersion: promptTemplate.version,
      promptTemplateHash: promptTemplate.bodyDigest,
      ragSnapshot: null,
    };
  };
}

function createInvalidPublishInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidPublishInputCode,
    invalidOrganizationTrainingPublishInputMessage,
  );
}

function createInvalidDraftSaveInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidDraftSaveInputCode,
    invalidOrganizationTrainingDraftSaveInputMessage,
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

function createDraftSavePublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftSavePublicIdMismatchCode,
    draftSavePublicIdMismatchMessage,
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

function createAdminDetailAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    adminDetailAdminContextUnavailableCode,
    adminDetailAdminContextUnavailableMessage,
  );
}

function createAdminDetailUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    adminDetailUnavailableCode,
    adminDetailUnavailableMessage,
  );
}

function createDraftSaveAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftSaveAdminContextUnavailableCode,
    draftSaveAdminContextUnavailableMessage,
  );
}

function createDraftSaveAuthorizationUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftSaveAuthorizationUnavailableCode,
    draftSaveAuthorizationUnavailableMessage,
  );
}

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
  );
}

function createDraftSaveBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftSaveBlockedCode,
    organizationTrainingDraftSaveBlockedMessage,
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
  return async ({ adminContext, draft }) => {
    const organizationPublicId = normalizeRequiredText(
      draft.organizationPublicId,
    );
    const authorizationPublicId = normalizeRequiredText(
      draft.authorizationPublicId,
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
  const saveDraftService =
    organizationTrainingService.saveDraft ?? defaultDraftSaveServiceResult;
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
  const getEmployeeAnswerDraftService =
    organizationTrainingService.getEmployeeAnswerDraft ??
    defaultEmployeeAnswerServiceResult;
  const getEmployeeAnswerReadonlySummaryService =
    organizationTrainingService.getEmployeeAnswerReadonlySummary ??
    defaultEmployeeAnswerServiceResult;
  const listAdminLifecycleDrafts =
    options.listAdminLifecycleDrafts ?? defaultListAdminLifecycleDrafts;
  const readAdminLifecyclePage =
    options.readAdminLifecyclePage ?? defaultReadAdminLifecyclePage;
  const listAdminLifecycleSourceMetadata =
    options.listAdminLifecycleSourceMetadata ??
    defaultListAdminLifecycleSourceMetadata;
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
  const resolveCanonicalQuestions =
    options.resolveCanonicalQuestions ?? defaultResolveCanonicalQuestions;
  const resolveScoringProvenance =
    options.resolveScoringProvenance ?? defaultResolveScoringProvenance;
  const resolveAdminDetailVersion =
    options.resolveAdminDetailVersion ?? defaultResolveAdminDetailVersion;
  const resolveAdminDraftDetailQuestions =
    options.resolveAdminDraftDetailQuestions ??
    defaultResolveAdminDraftDetailQuestions;
  const resolveSourceVersion =
    options.resolveSourceVersion ?? defaultResolveSourceVersion;
  const resolveVersionQuestionTypeSummary =
    options.resolveVersionQuestionTypeSummary ??
    defaultResolveVersionQuestionTypeSummary;
  const resolveOrganizationAuthorizationContext =
    options.resolveOrganizationAuthorizationContext;

  return createRouteHandlersWithErrorEnvelope({
    adminDetail: {
      async GET(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const pathPublicId = await resolvePathPublicId(context);
        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createAdminDetailAdminContextUnavailableResponse(),
          );
        }

        const version = await resolveAdminDetailVersion({
          request,
          trainingVersionPublicId: pathPublicId,
          adminContext,
        });

        if (version !== null) {
          const [sourceMetadata] = await listAdminLifecycleSourceMetadata({
            request,
            adminContext,
            draftPublicIds: [version.draftPublicId],
          });

          return createJsonResponse(
            buildOrganizationTrainingAdminDetailReadModel({
              adminContext,
              version,
              sourceMetadata: sourceMetadata ?? null,
            }),
          );
        }

        const drafts = await listAdminLifecycleDrafts({
          request,
          adminContext,
        });
        const draft =
          drafts.find((candidate) => candidate.publicId === pathPublicId) ??
          null;

        if (draft === null) {
          return createJsonResponse(createAdminDetailUnavailableResponse());
        }

        const [sourceMetadata] = await listAdminLifecycleSourceMetadata({
          request,
          adminContext,
          draftPublicIds: [draft.publicId],
        });
        const draftDetailSnapshot = normalizeAdminDraftDetailSnapshot(
          await resolveAdminDraftDetailQuestions({
            request,
            draft,
            sourceMetadata: sourceMetadata ?? null,
            adminContext,
          }),
        );

        return createJsonResponse(
          buildOrganizationTrainingAdminDetailReadModel({
            adminContext,
            draft,
            draftQuestions: draftDetailSnapshot.questions,
            draftPaperSections: draftDetailSnapshot.paperSections,
            sourceMetadata: sourceMetadata ?? null,
          }),
        );
      },
      async PATCH(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingDraftSaveInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidDraftSaveInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.draftPublicId !== pathPublicId) {
          return createJsonResponse(createDraftSavePublicIdMismatchResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createDraftSaveAdminContextUnavailableResponse(),
          );
        }

        const drafts = await listAdminLifecycleDrafts({
          request,
          adminContext,
        });
        const draft =
          drafts.find((candidate) => candidate.publicId === pathPublicId) ??
          null;

        if (draft === null) {
          return createJsonResponse(createAdminDetailUnavailableResponse());
        }

        const authorizationContext =
          await resolveOrganizationTrainingAdminAuthorizationContext({
            adminContext,
            authorizationPublicId: draft.authorizationPublicId,
            organizationPublicId: draft.organizationPublicId,
            profession: draft.profession,
            level: draft.level,
            capabilityContext: {
              effectiveEdition: "advanced",
              authorizationSource: "org_auth",
              canCreateOrganizationTraining: true,
            },
            resolveAuthorizationContext:
              resolveOrganizationAuthorizationContext,
          });

        if (authorizationContext === null) {
          return createJsonResponse(
            createDraftSaveAuthorizationUnavailableResponse(),
          );
        }

        const [sourceMetadata] = await listAdminLifecycleSourceMetadata({
          request,
          adminContext,
          draftPublicIds: [draft.publicId],
        });
        const trustedDraftSnapshot = normalizeAdminDraftDetailSnapshot(
          await resolveAdminDraftDetailQuestions({
            request,
            draft,
            sourceMetadata: sourceMetadata ?? null,
            adminContext,
          }),
        );

        const result = await saveDraftService({
          adminContext,
          authorizationContext,
          draft,
          draftInput: input.value,
          trustedDraftQuestions:
            createTrustedDraftQuestions(trustedDraftSnapshot),
        });

        if (!result.success) {
          return createJsonResponse(createDraftSaveBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            draft: result.draft,
          }),
        );
      },
    },
    manualDraft: {
      async GET(request: Request): Promise<Response> {
        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId: "organization_training_admin_lifecycle",
        });

        if (adminContext === null) {
          return createJsonResponse(
            createManualDraftAdminContextUnavailableResponse(),
          );
        }

        const query = normalizeAdminLifecycleQuery(request);

        const pageResult = await readAdminLifecyclePage({
          request,
          adminContext,
          query,
        });

        return createJsonResponse(
          buildOrganizationTrainingAdminLifecyclePageReadModel({
            adminContext,
            pageResult,
            query,
          }),
        );
      },
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

        const authorizationContext =
          await resolveOrganizationTrainingAdminAuthorizationContext({
            adminContext,
            authorizationPublicId: input.value.authorizationPublicId,
            organizationPublicId: input.value.organizationPublicId,
            profession: input.value.profession,
            level: input.value.level,
            capabilityContext: input.value.capabilityContext,
            resolveAuthorizationContext:
              resolveOrganizationAuthorizationContext,
          });

        if (authorizationContext === null) {
          return createJsonResponse(
            createManualDraftLineageUnavailableResponse(),
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
          authorizationContext,
          draftInput: {
            organizationPublicId: input.value.organizationPublicId,
            sourceTaskPublicId: input.value.sourceTaskPublicId,
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

        const versionReadResult = normalizeVersionListReadResult(
          await listEmployeeVisibleVersions({
            request,
            employeeContext,
          }),
        );
        const result = await listEmployeeVisibleVersionsService({
          employeeContext,
          sourceVersions: versionReadResult.versions,
        });

        if (!result.success) {
          return createJsonResponse(createEmployeeAnswerBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            versions: result.versions,
            integrityStatus: versionReadResult.integrityStatus,
            warningCode: versionReadResult.warningCode,
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

        const drafts = await listAdminLifecycleDrafts({
          request,
          adminContext,
        });
        const draft =
          drafts.find((candidate) => candidate.publicId === pathPublicId) ??
          null;

        if (draft === null) {
          return createJsonResponse(createAdminDetailUnavailableResponse());
        }

        const authorizationContext =
          await resolveOrganizationTrainingAdminAuthorizationContext({
            adminContext,
            authorizationPublicId: draft.authorizationPublicId,
            organizationPublicId: draft.organizationPublicId,
            profession: draft.profession,
            level: draft.level,
            capabilityContext: {
              effectiveEdition: "advanced",
              authorizationSource: "org_auth",
              canCreateOrganizationTraining: true,
            },
            resolveAuthorizationContext:
              resolveOrganizationAuthorizationContext,
          });

        if (authorizationContext === null) {
          return createJsonResponse(createPublishLineageUnavailableResponse());
        }

        const persistenceLineage = await resolvePersistenceLineage({
          request,
          pathPublicId,
          publishInput: input.value,
          draft,
          adminContext,
        });

        if (persistenceLineage === null) {
          return createJsonResponse(createPublishLineageUnavailableResponse());
        }

        const result = await organizationTrainingService.publishVersion({
          publishInput: input.value,
          draft,
          adminContext,
          authorizationContext,
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

        const authorizationContext =
          await resolveOrganizationTrainingAdminAuthorizationContext({
            adminContext,
            authorizationPublicId: input.value.authorizationPublicId,
            organizationPublicId: sourceVersion.organizationPublicId,
            profession: sourceVersion.profession,
            level: sourceVersion.level,
            capabilityContext: {
              effectiveEdition: "advanced",
              authorizationSource: "org_auth",
              canCreateOrganizationTraining: true,
            },
            resolveAuthorizationContext:
              resolveOrganizationAuthorizationContext,
          });

        if (authorizationContext === null) {
          return createJsonResponse(createCopyLineageUnavailableResponse());
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

        const authorizationContext =
          await resolveOrganizationTrainingAdminAuthorizationContext({
            adminContext,
            authorizationPublicId: input.value.authorizationPublicId,
            organizationPublicId: input.value.organizationPublicId,
            profession: input.value.profession,
            level: input.value.level,
            capabilityContext: input.value.capabilityContext,
            resolveAuthorizationContext:
              resolveOrganizationAuthorizationContext,
          });

        if (authorizationContext === null) {
          return createJsonResponse(
            createSourceContextLineageUnavailableResponse(),
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
          authorizationContext,
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
          canonicalQuestions: await resolveCanonicalQuestions({
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
    employeeAnswerDraft: {
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
          return createNoStoreJsonResponse(
            createEmployeeAnswerContextUnavailableResponse(),
          );
        }

        if (
          !canUseEmployeeOrganizationTrainingAnswerContext(
            employeeContext.authorizationContext,
          )
        ) {
          return createNoStoreJsonResponse(
            createEmployeeAnswerBlockedResponse(),
          );
        }

        const version = await resolvePublishedVersion({
          request,
          trainingVersionPublicId: pathPublicId,
          employeeContext,
        });

        if (version === null) {
          return createNoStoreJsonResponse(
            createEmployeeAnswerVersionUnavailableResponse(),
          );
        }

        const result = await getEmployeeAnswerDraftService({
          employeeContext,
          version,
          existingAnswer: await resolveEmployeeAnswer({
            request,
            trainingVersionPublicId: pathPublicId,
            employeeContext,
          }),
        });

        if (!result.success) {
          return createNoStoreJsonResponse(
            createEmployeeAnswerBlockedResponse(),
          );
        }

        return createNoStoreJsonResponse(
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

        const canonicalQuestions = await resolveCanonicalQuestions({
          request,
          trainingVersionPublicId: input.value.trainingVersionPublicId,
          employeeContext,
        });
        const requiresAiScoring = canonicalQuestions.some(
          (question) => question.questionType === "short_answer",
        );

        const result = await submitEmployeeAnswerService({
          employeeContext,
          version,
          answerInput: input.value,
          existingAnswer: await resolveEmployeeAnswer({
            request,
            trainingVersionPublicId: input.value.trainingVersionPublicId,
            employeeContext,
          }),
          canonicalQuestions,
          scoringProvenance: requiresAiScoring
            ? await resolveScoringProvenance({
                request,
                trainingVersionPublicId: input.value.trainingVersionPublicId,
                employeeContext,
              })
            : null,
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
  const adminAiGenerationResultRepository =
    options.adminAiGenerationResultRepository ??
    createPostgresAdminAiGenerationResultPersistenceRepository();
  const scoringCatalogRepository =
    options.scoringCatalogRepository ??
    createPostgresAdminAiAuditLogRuntimeRepositories();
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
  const resolveOrganizationAuthorizationContext =
    options.resolveOrganizationAuthorizationContext ??
    createRepositoryBackedOrganizationAuthorizationContextResolver(repository);
  const resolveVersionOrganizationPublicId =
    options.resolveVersionOrganizationPublicId ??
    createRepositoryBackedVersionOrganizationPublicIdResolver(repository);
  const resolveEmployeeContext =
    options.resolveEmployeeContext ??
    createSessionBackedOrganizationTrainingEmployeeContextResolver(
      sessionService,
      effectiveAuthorizationService,
    );
  const listAdminLifecycleDrafts =
    options.listAdminLifecycleDrafts ??
    createRepositoryBackedAdminLifecycleDraftsReader(repository);
  const readAdminLifecyclePage =
    options.readAdminLifecyclePage ??
    createRepositoryBackedAdminLifecyclePageReader(repository);
  const listAdminLifecycleSourceMetadata =
    options.listAdminLifecycleSourceMetadata ??
    createRepositoryBackedAdminLifecycleSourceMetadataReader(repository);
  const listEmployeeVisibleVersions =
    options.listEmployeeVisibleVersions ??
    createRepositoryBackedEmployeeVisibleVersionsReader(repository);
  const resolvePublishedVersion =
    options.resolvePublishedVersion ??
    createRepositoryBackedPublishedVersionResolver(repository);
  const resolveAdminDetailVersion =
    options.resolveAdminDetailVersion ??
    createRepositoryBackedAdminDetailVersionResolver(repository);
  const resolveAdminDraftDetailQuestions =
    options.resolveAdminDraftDetailQuestions ??
    createRepositoryBackedAdminDraftDetailQuestionsResolver(
      adminAiGenerationResultRepository,
    );
  const resolveSourceVersion =
    options.resolveSourceVersion ??
    createRepositoryBackedSourceVersionResolver(repository);
  const resolveVersionQuestionTypeSummary =
    options.resolveVersionQuestionTypeSummary ??
    createRepositoryBackedVersionQuestionTypeSummaryResolver(repository);
  const resolveEmployeeAnswer =
    options.resolveEmployeeAnswer ??
    createRepositoryBackedEmployeeAnswerResolver(repository);
  const resolveCanonicalQuestions =
    options.resolveCanonicalQuestions ??
    createRepositoryBackedCanonicalQuestionsResolver(repository);
  const resolveScoringProvenance =
    options.resolveScoringProvenance ??
    createCatalogBackedScoringProvenanceResolver(scoringCatalogRepository);

  return createOrganizationTrainingRouteHandlers(
    createOrganizationTrainingService(
      createRuntimeOrganizationTrainingStore(repository),
    ),
    {
      resolveOrganizationAdminContext,
      resolveOrganizationAuthorizationContext,
      resolveVersionOrganizationPublicId,
      resolveEmployeeContext,
      listAdminLifecycleDrafts,
      readAdminLifecyclePage,
      listAdminLifecycleSourceMetadata,
      listEmployeeVisibleVersions,
      resolveAdminDetailVersion,
      resolveAdminDraftDetailQuestions,
      resolvePublishedVersion,
      resolveSourceVersion,
      resolveVersionQuestionTypeSummary,
      resolveEmployeeAnswer,
      resolveCanonicalQuestions,
      resolveScoringProvenance,
      lookupTrustedPersistenceLineage:
        repository.lookupTrustedPersistenceLineage,
    },
  );
}
