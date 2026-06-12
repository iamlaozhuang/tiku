import { createErrorResponse } from "../contracts/api-response";

export const UNEXPECTED_RUNTIME_ERROR_CODE = 500001;
export const UNEXPECTED_RUNTIME_ERROR_MESSAGE = "Unexpected runtime error.";

export function createRouteHandlerWithErrorEnvelope<
  TArgs extends unknown[],
  TResponse extends Response,
>(
  handler: (...args: TArgs) => Promise<TResponse> | TResponse,
): (...args: TArgs) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch {
      return new Response(
        JSON.stringify(
          createErrorResponse(
            UNEXPECTED_RUNTIME_ERROR_CODE,
            UNEXPECTED_RUNTIME_ERROR_MESSAGE,
          ),
        ),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 500,
        },
      );
    }
  };
}

type UnknownRouteHandler = (...args: unknown[]) => unknown;
type RouteHandlerTreeWithErrorEnvelope<TValue> = TValue extends (
  ...args: infer TArgs
) => unknown
  ? (...args: TArgs) => Promise<Response>
  : TValue extends Record<string, unknown>
    ? {
        [TKey in keyof TValue]: RouteHandlerTreeWithErrorEnvelope<TValue[TKey]>;
      }
    : TValue;

function createUnexpectedRuntimeErrorResponse(): Response {
  return new Response(
    JSON.stringify(
      createErrorResponse(
        UNEXPECTED_RUNTIME_ERROR_CODE,
        UNEXPECTED_RUNTIME_ERROR_MESSAGE,
      ),
    ),
    {
      headers: {
        "content-type": "application/json",
      },
      status: 500,
    },
  );
}

function wrapUnknownRouteHandler(
  handler: UnknownRouteHandler,
): UnknownRouteHandler {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch {
      return createUnexpectedRuntimeErrorResponse();
    }
  };
}

function isRouteHandlerGroup(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function wrapRouteHandlerTreeValue(value: unknown): unknown {
  if (typeof value === "function") {
    return wrapUnknownRouteHandler(value as UnknownRouteHandler);
  }

  if (isRouteHandlerGroup(value)) {
    return createRouteHandlersWithErrorEnvelope(value);
  }

  return value;
}

export function createRouteHandlersWithErrorEnvelope<
  THandlers extends Record<string, unknown>,
>(handlers: THandlers): RouteHandlerTreeWithErrorEnvelope<THandlers> {
  return Object.fromEntries(
    Object.entries(handlers).map(([key, value]) => [
      key,
      wrapRouteHandlerTreeValue(value),
    ]),
  ) as RouteHandlerTreeWithErrorEnvelope<THandlers>;
}
