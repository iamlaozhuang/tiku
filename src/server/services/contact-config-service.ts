import { randomUUID } from "node:crypto";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import { ADMIN_AUTH_OPERATION_ERROR_CODES } from "../contracts/admin-user-org-auth-ops-contract";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  type ContactConfigChannelDto,
  type ContactConfigQrImageUploadResultDto,
  type PurchaseGuidanceContactConfigResultDto,
  type UpdateContactConfigInputDto,
} from "../contracts/contact-config-contract";
import {
  createPostgresContactConfigRepository,
  type ContactConfigAdminRole,
  type ContactConfigRuntimeRepository,
} from "../repositories/contact-config-repository";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import type { SessionService } from "./session-service";

export type { ContactConfigRuntimeRepository } from "../repositories/contact-config-repository";

export type ContactConfigService = {
  getPurchaseGuidance(): Promise<
    ApiResponse<PurchaseGuidanceContactConfigResultDto>
  >;
};

export type ContactConfigRuntimeRepositories = {
  contactConfigRepository: ContactConfigRuntimeRepository;
};

export type ContactConfigRuntimeOptions = {
  repositories?: ContactConfigRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
  now?: () => Date;
};

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

type NormalizedQrImageUploadResult =
  | {
      success: true;
      value: {
        bytes: Uint8Array;
        contentType: "image/jpeg" | "image/png" | "image/webp";
      };
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
const contactConfigQrImageInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Contact QR image input is invalid.",
);
const contactConfigConflictResponse = createErrorResponse(
  409034,
  "Contact config was changed by another administrator. Reload and retry.",
);

const allowedQrImageContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maxQrImageByteSize = 2 * 1024 * 1024;

export function createContactConfigService(
  repository: ContactConfigRuntimeRepository = createPostgresContactConfigRepository(),
): ContactConfigService {
  return {
    async getPurchaseGuidance() {
      return createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
        contactConfig: await repository.getActiveContactConfig(),
      });
    },
  };
}

function createJsonResponse<TData>(
  response: ApiResponse<TData>,
  status = 200,
): Response {
  return Response.json(response, { status });
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
    authorization: getRequestAuthorization(request),
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

  return normalizedValue.length === 0 || normalizedValue.length > maxLength
    ? null
    : normalizedValue;
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

function normalizeQrImageUrl(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.startsWith("/api/v1/contact-configs/qr-images/")
    ? normalizedValue
    : null;
}

function normalizeChannel(value: unknown): ContactConfigChannelDto | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.channelType !== "phone" && value.channelType !== "wechat_work") {
    return null;
  }

  const label = normalizeText(value.label, 80);
  const channelValue = normalizeText(value.value, 120);
  const serviceHours = normalizeText(value.serviceHours, 80);
  const usage = normalizeText(value.usage, 120);
  const href = normalizeHref(value.href);
  const qrImageUrl = normalizeQrImageUrl(value.qrImageUrl);

  if (
    label === null ||
    channelValue === null ||
    serviceHours === null ||
    usage === null ||
    typeof value.isEnabled !== "boolean" ||
    (value.qrImageUrl !== null &&
      value.qrImageUrl !== undefined &&
      qrImageUrl === null)
  ) {
    return null;
  }

  return {
    channelType: value.channelType,
    href,
    isEnabled: value.isEnabled,
    label,
    qrImageUrl,
    serviceHours,
    usage,
    value: channelValue,
  };
}

function normalizeContactConfigInput(
  input: unknown,
): NormalizedContactConfigInputResult {
  if (!isRecord(input)) {
    return { success: false, response: contactConfigInputInvalidResponse };
  }

  const title = normalizeText(input.title, 80);
  const summary = normalizeText(input.summary, 240);
  const safetyNotice = normalizeText(input.safetyNotice, 240);
  const channels = Array.isArray(input.channels)
    ? input.channels.map(normalizeChannel)
    : [];

  if (
    title === null ||
    summary === null ||
    safetyNotice === null ||
    !Number.isSafeInteger(input.expectedRevision) ||
    Number(input.expectedRevision) < 1 ||
    channels.length === 0 ||
    channels.length > 5 ||
    channels.some((channel) => channel === null)
  ) {
    return { success: false, response: contactConfigInputInvalidResponse };
  }

  return {
    success: true,
    value: {
      channels: channels as ContactConfigChannelDto[],
      expectedRevision: Number(input.expectedRevision),
      safetyNotice,
      summary,
      title,
    },
  };
}

async function normalizeQrImageUpload(
  request: Request,
): Promise<NormalizedQrImageUploadResult> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return { success: false, response: contactConfigQrImageInvalidResponse };
  }

  const file = formData.get("file");

  if (
    file === null ||
    typeof file === "string" ||
    !allowedQrImageContentTypes.has(file.type) ||
    file.size <= 0 ||
    file.size > maxQrImageByteSize
  ) {
    return { success: false, response: contactConfigQrImageInvalidResponse };
  }

  return {
    success: true,
    value: {
      bytes: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
    },
  };
}

function createQrImageUrl(publicId: string): string {
  return `/api/v1/contact-configs/qr-images/${encodeURIComponent(publicId)}`;
}

function getRequestIp(request: Request): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export function createContactConfigRuntimeRouteHandlers(
  options: ContactConfigRuntimeOptions = {},
) {
  const repositories = options.repositories ?? {
    contactConfigRepository: createPostgresContactConfigRepository(),
  };
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const now = options.now ?? (() => new Date());

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

  return createRouteHandlersWithErrorEnvelope({
    purchaseGuidance: {
      async GET(): Promise<Response> {
        return createJsonResponse(
          await createContactConfigService(
            repositories.contactConfigRepository,
          ).getPurchaseGuidance(),
        );
      },
    },
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

        const result =
          await repositories.contactConfigRepository.updateContactConfig({
            actor: {
              publicId: actorOrError.publicId,
              requestIp: getRequestIp(request),
              role: actorOrError.roles[0],
            },
            contactConfig: normalizedInput.value,
            now: now(),
          });

        if (result.status === "conflict") {
          return createJsonResponse(contactConfigConflictResponse, 409);
        }

        return createJsonResponse(
          createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
            contactConfig: result.contactConfig,
          }),
        );
      },
    },
    contactConfigQrImages: {
      async POST(request: Request): Promise<Response> {
        const actorOrError = await requireManager(request);

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const normalizedUpload = await normalizeQrImageUpload(request);

        if (!normalizedUpload.success) {
          return createJsonResponse(normalizedUpload.response);
        }

        const publicId = `contact-config-qr-${randomUUID()}`;
        const record = await repositories.contactConfigRepository.createQrImage(
          {
            actor: {
              publicId: actorOrError.publicId,
              requestIp: getRequestIp(request),
              role: actorOrError.roles[0],
            },
            now: now(),
            publicId,
            ...normalizedUpload.value,
          },
        );

        return createJsonResponse(
          createSuccessResponse<ContactConfigQrImageUploadResultDto>({
            qrImage: {
              byteSize: record.bytes.byteLength,
              contentType: record.contentType,
              publicId: record.publicId,
              qrImageUrl: createQrImageUrl(record.publicId),
            },
          }),
        );
      },
      async GET(
        _request: Request,
        context: { params: Promise<{ publicId: string }> },
      ): Promise<Response> {
        const { publicId } = await context.params;
        const record =
          await repositories.contactConfigRepository.getQrImage(publicId);

        if (record === null) {
          return createJsonResponse(
            createErrorResponse(404001, "Contact QR image not found."),
            404,
          );
        }

        const responseBody = record.bytes.buffer.slice(
          record.bytes.byteOffset,
          record.bytes.byteOffset + record.bytes.byteLength,
        ) as ArrayBuffer;

        return new Response(responseBody, {
          headers: {
            "cache-control": "no-store",
            "content-type": record.contentType,
          },
        });
      },
    },
  });
}
