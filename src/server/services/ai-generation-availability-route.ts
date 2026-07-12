import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../contracts/api-response";
import type {
  AiGenerationAvailability,
  AiGenerationAvailabilityDto,
} from "../contracts/ai-generation-availability-contract";
import type { SessionService } from "./session-service";

type AiGenerationAvailabilityRuntimeBridgeControl = {
  bridgeMode?: "controlled_runner";
  explicitLocalSwitchPresent?: true;
};

type AiGenerationAvailabilityRouteOptions = {
  runtimeBridgeControl?: AiGenerationAvailabilityRuntimeBridgeControl;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

const aiGenerationAvailabilitySessionRequiredResponse = createErrorResponse(
  401001,
  "Session is required.",
);

function resolveGenerationAvailability(
  runtimeBridgeControl:
    | AiGenerationAvailabilityRuntimeBridgeControl
    | undefined,
): AiGenerationAvailability {
  return runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    runtimeBridgeControl.explicitLocalSwitchPresent === true
    ? "available"
    : "closed";
}

export function createAiGenerationAvailabilityRouteHandlers(
  options: AiGenerationAvailabilityRouteOptions = {},
) {
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const generationAvailability = resolveGenerationAvailability(
    options.runtimeBridgeControl,
  );

  return {
    collection: {
      async GET(request: Request): Promise<Response> {
        const sessionResponse = await sessionService.getCurrentSession({
          authorization: getRequestAuthorization(request),
        });

        if (sessionResponse.code !== 0 || sessionResponse.data === null) {
          return Response.json(aiGenerationAvailabilitySessionRequiredResponse);
        }

        return Response.json(
          createSuccessResponse<AiGenerationAvailabilityDto>({
            generationAvailability,
          }),
        );
      },
    },
  };
}
