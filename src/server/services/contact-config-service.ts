import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG,
  type ContactConfigChannelDto,
  type PurchaseGuidanceContactConfigDto,
  type PurchaseGuidanceContactConfigResultDto,
  type UpdateContactConfigInputDto,
} from "../contracts/contact-config-contract";
import { ADMIN_AUTH_OPERATION_ERROR_CODES } from "../contracts/admin-user-org-auth-ops-contract";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import type { SessionService } from "./session-service";

export type ContactConfigService = {
  getPurchaseGuidance(): ApiResponse<PurchaseGuidanceContactConfigResultDto>;
};

export type ContactConfigRuntimeRepository = {
  getActiveContactConfig(): Promise<PurchaseGuidanceContactConfigDto>;
  updateContactConfig(
    input: UpdateContactConfigInputDto,
  ): Promise<PurchaseGuidanceContactConfigDto>;
};

export type ContactConfigAuditLogRepository = {
  appendAuditLog(input: {
    actorPublicId: string;
    actorRole: ContactConfigAdminRole;
    actionType: "contact_config.update";
    targetResourceType: "contact_config";
    targetPublicId: string;
    resultStatus: "success";
    metadataSummary: string;
    requestIp: string | null;
  }): Promise<void>;
};

export type ContactConfigRuntimeRepositories = {
  auditLogRepository?: ContactConfigAuditLogRepository;
  contactConfigRepository: ContactConfigRuntimeRepository;
};

export type ContactConfigRuntimeOptions = {
  repositories?: ContactConfigRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
  now?: () => Date;
};

type ContactConfigAdminRole = "super_admin" | "ops_admin" | "content_admin";

type ContactConfigAdminActor = {
  publicId: string;
  roles: [ContactConfigAdminRole, ...ContactConfigAdminRole[]];
};

type NormalizedContactConfigInputResult =
  | {
      success: true;
      value: UpdateContactConfigInputDto;
    }
  | {
      success: false;
      response: ApiResponse<null>;
    };

const contactConfigSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const contactConfigPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const contactConfigInputInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Contact config input is invalid.",
);

let localContactConfigStore: PurchaseGuidanceContactConfigDto = {
  ...LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG,
  channels: LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG.channels.map((channel) => ({
    ...channel,
  })),
};

export function createContactConfigService(): ContactConfigService {
  return {
    getPurchaseGuidance() {
      return createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
        contactConfig: localContactConfigStore,
      });
    },
  };
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isContactConfigAdminRole(
  role: string,
): role is ContactConfigAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function canManageContactConfig(actor: ContactConfigAdminActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

async function resolveContactConfigAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<ContactConfigAdminActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isContactConfigAdminRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [ContactConfigAdminRole, ...ContactConfigAdminRole[]],
  };
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0 || normalizedValue.length > maxLength) {
    return null;
  }

  return normalizedValue;
}

function normalizeHref(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

function normalizeChannel(value: unknown): ContactConfigChannelDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const channelType = value.channelType;

  if (channelType !== "phone" && channelType !== "wechat_work") {
    return null;
  }

  const label = normalizeText(value.label, 80);
  const channelValue = normalizeText(value.value, 120);
  const serviceHours = normalizeText(value.serviceHours, 80);
  const usage = normalizeText(value.usage, 120);
  const href = normalizeHref(value.href);

  if (
    label === null ||
    channelValue === null ||
    serviceHours === null ||
    usage === null
  ) {
    return null;
  }

  return {
    channelType,
    label,
    value: channelValue,
    serviceHours,
    usage,
    href,
  };
}

function normalizeContactConfigInput(
  input: unknown,
): NormalizedContactConfigInputResult {
  if (!isRecord(input)) {
    return {
      success: false,
      response: contactConfigInputInvalidResponse,
    };
  }

  const title = normalizeText(input.title, 80);
  const summary = normalizeText(input.summary, 240);
  const safetyNotice = normalizeText(input.safetyNotice, 240);
  const channels =
    Array.isArray(input.channels) && input.channels.length >= 1
      ? input.channels.map(normalizeChannel)
      : [];

  if (
    title === null ||
    summary === null ||
    safetyNotice === null ||
    channels.length === 0 ||
    channels.length > 5 ||
    channels.some((channel) => channel === null)
  ) {
    return {
      success: false,
      response: contactConfigInputInvalidResponse,
    };
  }

  return {
    success: true,
    value: {
      channels: channels as ContactConfigChannelDto[],
      safetyNotice,
      summary,
      title,
    },
  };
}

export function createLocalContactConfigRepository(
  options: Pick<ContactConfigRuntimeOptions, "now"> = {},
): ContactConfigRuntimeRepository {
  return {
    async getActiveContactConfig() {
      return localContactConfigStore;
    },
    async updateContactConfig(input) {
      const updatedAt = (options.now ?? (() => new Date()))().toISOString();

      localContactConfigStore = {
        ...localContactConfigStore,
        ...input,
        channels: input.channels.map((channel) => ({ ...channel })),
        updatedAt,
      };

      return localContactConfigStore;
    },
  };
}

export function createContactConfigRuntimeRouteHandlers(
  options: ContactConfigRuntimeOptions = {},
) {
  const repositories = options.repositories ?? {
    contactConfigRepository: createLocalContactConfigRepository(options),
  };
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireManager(
    request: Request,
  ): Promise<ContactConfigAdminActor | ApiResponse<null>> {
    const actor = await resolveContactConfigAdminActor(request, sessionService);

    if (actor === null) {
      return contactConfigSessionRequiredResponse;
    }

    return canManageContactConfig(actor)
      ? actor
      : contactConfigPermissionDeniedResponse;
  }

  return {
    contactConfigs: {
      async GET(request: Request): Promise<Response> {
        const actorOrError = await requireManager(request);

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        return createJsonResponse(
          createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
            contactConfig:
              await repositories.contactConfigRepository.getActiveContactConfig(),
          }),
        );
      },
      async PUT(request: Request): Promise<Response> {
        const actorOrError = await requireManager(request);

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const normalizedInput = normalizeContactConfigInput(
          await readRequestJson(request),
        );

        if (!normalizedInput.success) {
          return createJsonResponse(normalizedInput.response);
        }

        const contactConfig =
          await repositories.contactConfigRepository.updateContactConfig(
            normalizedInput.value,
          );

        await repositories.auditLogRepository?.appendAuditLog({
          actorPublicId: actorOrError.publicId,
          actorRole: actorOrError.roles[0],
          actionType: "contact_config.update",
          targetResourceType: "contact_config",
          targetPublicId: contactConfig.publicId,
          resultStatus: "success",
          metadataSummary: `redacted contact_config update metadata; channelCount=${contactConfig.channels.length}`,
          requestIp: null,
        });

        return createJsonResponse(
          createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
            contactConfig,
          }),
        );
      },
    },
  };
}
