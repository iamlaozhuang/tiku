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
