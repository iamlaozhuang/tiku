import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationMockExamAccessContextDto,
  AuthorizationPaperAccessContextDto,
  AuthorizationPaperMockExamAccessContextDto,
} from "../contracts/authorization-paper-mock-exam-access-context-contract";
import type {
  AuthorizationMockExamAccessContextInput,
  AuthorizationPaperAccessContextInput,
  AuthorizationPaperMockExamAccessContextInput,
  AuthorizationPaperMockExamContextMatchStatus,
} from "../models/authorization-paper-mock-exam-access-context";
import { normalizeAuthorizationPaperMockExamAccessContextInput } from "../validators/authorization-paper-mock-exam-access-context";

const INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_CODE = 400042;

function resolveContextMatchStatus(
  input: AuthorizationPaperMockExamAccessContextInput,
  context:
    | AuthorizationPaperAccessContextInput
    | AuthorizationMockExamAccessContextInput,
): AuthorizationPaperMockExamContextMatchStatus {
  return context.profession === input.authorizationProfession &&
    context.level === input.authorizationLevel
    ? "matches_authorization"
    : "context_mismatch";
}

function mapPaperContextToDto(
  input: AuthorizationPaperMockExamAccessContextInput,
  context: AuthorizationPaperAccessContextInput | null,
): AuthorizationPaperAccessContextDto | null {
  if (context === null) {
    return null;
  }

  return {
    paperPublicId: context.paperPublicId,
    profession: context.profession,
    level: context.level,
    subject: context.subject,
    paperType: context.paperType,
    contextMatchStatus: resolveContextMatchStatus(input, context),
  };
}

function mapMockExamContextToDto(
  input: AuthorizationPaperMockExamAccessContextInput,
  context: AuthorizationMockExamAccessContextInput | null,
): AuthorizationMockExamAccessContextDto | null {
  if (context === null) {
    return null;
  }

  return {
    mockExamPublicId: context.mockExamPublicId,
    paperPublicId: context.paperPublicId,
    profession: context.profession,
    level: context.level,
    subject: context.subject,
    paperType: context.paperType,
    contextMatchStatus: resolveContextMatchStatus(input, context),
  };
}

function mapAuthorizationPaperMockExamAccessContextToDto(
  input: AuthorizationPaperMockExamAccessContextInput,
): AuthorizationPaperMockExamAccessContextDto {
  return {
    userPublicId: input.userPublicId,
    authorization: {
      authorizationPublicId: input.authorizationPublicId,
      authorizationSource: input.authorizationSource,
      effectiveEdition: input.effectiveEdition,
      profession: input.authorizationProfession,
      level: input.authorizationLevel,
      organizationPublicId: input.organizationPublicId,
    },
    accessContextStatus: "context_summary_only",
    permissionBehaviorStatus: "unchanged",
    paper: mapPaperContextToDto(input, input.paperContext),
    mockExam: mapMockExamContextToDto(input, input.mockExamContext),
  };
}

export function buildAuthorizationPaperMockExamAccessContextReadModel(
  input: unknown,
): ApiResponse<AuthorizationPaperMockExamAccessContextDto | null> {
  const authorizationPaperMockExamAccessContextInput =
    normalizeAuthorizationPaperMockExamAccessContextInput(input);

  if (!authorizationPaperMockExamAccessContextInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_CODE,
      authorizationPaperMockExamAccessContextInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationPaperMockExamAccessContextToDto(
      authorizationPaperMockExamAccessContextInput.value,
    ),
  );
}
