import {
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { SessionLogoutRepository } from "../repositories/session-logout-repository";
import { normalizeBearerToken } from "../validators/auth-session";
import type { AuthRequestInput } from "./auth-service";

export type SessionLogoutService = {
  logout(input: AuthRequestInput): Promise<ApiResponse<null>>;
};

export function createSessionLogoutService(
  sessionLogoutRepository: SessionLogoutRepository,
): SessionLogoutService {
  return {
    async logout(input) {
      const sessionCredential = normalizeBearerToken(input.authorization);

      if (sessionCredential !== null) {
        await sessionLogoutRepository.deleteSessionByCredential(
          sessionCredential,
        );
      }

      return createSuccessResponse(null);
    },
  };
}
