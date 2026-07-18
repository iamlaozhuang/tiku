import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EmployeeImportCommandActor,
  EmployeeImportCommandServiceResult,
} from "../contracts/employee-import-command-contract";
import {
  createPostgresEmployeeImportCommandRepository,
  type PostgresEmployeeImportCommandRepositoryOptions,
} from "../repositories/postgres-employee-import-command-repository";
import {
  createEmployeeImportCommandService,
  type EmployeeImportCommandServiceWithPreview,
} from "./employee-import-command-service";
import type { SessionService } from "./session-service";

export type EmployeeImportCommandRouteOptions =
  PostgresEmployeeImportCommandRepositoryOptions & {
    commandService?: EmployeeImportCommandServiceWithPreview;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

type RouteResult<TData> = {
  httpStatus: number;
  response: ApiResponse<TData | null>;
};

const ADMIN_SESSION_REQUIRED_RESULT: RouteResult<null> = {
  httpStatus: 401,
  response: createErrorResponse(401001, "Admin session is required."),
};
const ADMIN_PERMISSION_DENIED_RESULT: RouteResult<null> = {
  httpStatus: 403,
  response: createErrorResponse(403001, "Admin permission denied."),
};
const ROUTE_UNAVAILABLE_RESULT: RouteResult<null> = {
  httpStatus: 503,
  response: createErrorResponse(
    503601,
    "Employee import command is temporarily unavailable.",
  ),
};

export function createNoStoreJsonResponse<TData>(
  result: EmployeeImportCommandServiceResult<TData> | RouteResult<TData>,
): Response {
  return Response.json(result.response, {
    status: result.httpStatus,
    headers: { "Cache-Control": "no-store" },
  });
}

export function createEmployeeImportCommandRouteHandlers(
  options: EmployeeImportCommandRouteOptions = {},
) {
  const commandService =
    options.commandService ??
    createEmployeeImportCommandService(
      createPostgresEmployeeImportCommandRepository(options),
    );
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function execute<TData>(
    request: Request,
    operation: (
      actor: EmployeeImportCommandActor,
    ) => Promise<EmployeeImportCommandServiceResult<TData>>,
  ): Promise<Response> {
    try {
      const actorResult = await resolveEmployeeImportCommandActor(
        request,
        sessionService,
      );
      if ("httpStatus" in actorResult) {
        return createNoStoreJsonResponse(actorResult);
      }

      return createNoStoreJsonResponse(await operation(actorResult));
    } catch {
      return createNoStoreJsonResponse(ROUTE_UNAVAILABLE_RESULT);
    }
  }

  return {
    preview: {
      async POST(request: Request): Promise<Response> {
        return execute(request, async (actor) =>
          commandService.preview({
            actor,
            body: await readRequestJson(request),
          }),
        );
      },
    },
    collection: {
      async POST(request: Request): Promise<Response> {
        return execute(request, async (actor) =>
          commandService.submit({
            actor,
            body: await readRequestJson(request),
            idempotencyKey: request.headers.get("idempotency-key"),
          }),
        );
      },
    },
    item: {
      async GET(request: Request, context: RouteContext): Promise<Response> {
        return execute(request, async (actor) => {
          const { publicId } = await context.params;
          return commandService.get({
            actor,
            commandPublicId: publicId,
          });
        });
      },
    },
    issueCredentials: {
      async POST(request: Request, context: RouteContext): Promise<Response> {
        return execute(request, async (actor) => {
          const { publicId } = await context.params;
          return commandService.issueCredentials({
            actor,
            body: await readRequestJson(request),
            commandPublicId: publicId,
          });
        });
      },
    },
    confirmDistribution: {
      async POST(request: Request, context: RouteContext): Promise<Response> {
        return execute(request, async (actor) => {
          const { publicId } = await context.params;
          return commandService.confirmDistribution({
            actor,
            body: await readRequestJson(request),
            commandPublicId: publicId,
          });
        });
      },
    },
  };
}

async function resolveEmployeeImportCommandActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<EmployeeImportCommandActor | RouteResult<null>> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });
  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return ADMIN_SESSION_REQUIRED_RESULT;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const role = (sessionResponse.data.user.adminRoles ?? []).find(
    (adminRole): adminRole is EmployeeImportCommandActor["role"] =>
      adminRole === "ops_admin" || adminRole === "super_admin",
  );
  if (adminPublicId === null) {
    return ADMIN_SESSION_REQUIRED_RESULT;
  }
  if (role === undefined) {
    return ADMIN_PERMISSION_DENIED_RESULT;
  }

  return {
    publicId: adminPublicId,
    requestIp: readRequestIp(request),
    role,
  };
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }
  return request.headers.get("x-real-ip");
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
