import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PaperMockExamScopeDto } from "../contracts/paper-mock-exam-scope-contract";
import type { PaperMockExamScopeInput } from "../models/paper-mock-exam-scope";
import { normalizePaperMockExamScopeInput } from "../validators/paper-mock-exam-scope";

const INVALID_PAPER_MOCK_EXAM_SCOPE_INPUT_CODE = 400008;

function mapPaperMockExamScopeToDto(
  input: PaperMockExamScopeInput,
): PaperMockExamScopeDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    paperScope: {
      paperPublicId: input.paperPublicId,
      profession: input.profession,
      level: input.level,
      subject: input.subject,
      paperType: input.paperType,
    },
    mockExamScope: {
      mockExamPublicId: input.mockExamPublicId,
    },
    contentAccessStatus: "scope_only",
  };
}

export function buildPaperMockExamScopeReadModel(
  input: unknown,
): ApiResponse<PaperMockExamScopeDto | null> {
  const paperMockExamScopeInput = normalizePaperMockExamScopeInput(input);

  if (!paperMockExamScopeInput.success) {
    return createErrorResponse(
      INVALID_PAPER_MOCK_EXAM_SCOPE_INPUT_CODE,
      paperMockExamScopeInput.message,
    );
  }

  return createSuccessResponse(
    mapPaperMockExamScopeToDto(paperMockExamScopeInput.value),
  );
}
